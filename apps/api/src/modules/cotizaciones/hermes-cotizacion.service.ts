import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { StorageService } from '../../common/storage.service';
import {
  extractPdfText,
  featuresFromText,
} from './plano-pdf';
import {
  classifyMaterial,
  estimateUnitPriceUsd,
  SHOP_RATE_USD_PER_HOUR,
  SETUP_MINUTES,
  MARGIN,
} from './material-price-book';
import { CotizacionEstimacionService } from './cotizacion-estimacion.service';
import * as fs from 'fs';
import * as path from 'path';

export type HermesLineQuote = {
  dwg: string;
  precioUnitario: number;
  rationale: string;
};

const DEFAULT_MODEL = process.env.HERMES_COTIZACION_MODEL || 'meituan/longcat-2.0:free';
const PROXY_URL =
  process.env.HERMES_PROXY_URL || 'http://127.0.0.1:8645/v1/chat/completions';
const USD_TO_MXN = Number(process.env.USD_TO_MXN || 17.5);

const SYSTEM_PROMPT = `Eres el cotizador CNC de AMD México (Ciudad Juárez / maquila frontera).
Reglas OBLIGATORIAS:
1) La cantidad pedida (qtyBom) viene SOLO del BOM del cliente. IGNORA cualquier QTY del texto del plano PDF.
2) El extracto del plano sirve para material, dims, complejidad y manufactura de ESA pieza.
3) Cotiza precio UNITARIO en la moneda indicada (USD o MXN). Si moneda=MXN y razonas en USD, convierte ~${USD_TO_MXN} MXN/USD.
4) Anclas taller: ~$${SHOP_RATE_USD_PER_HOUR}/h, setup ~${SETUP_MINUTES} min, margen ~${(MARGIN * 100).toFixed(0)}%.
5) Responde SOLO JSON válido sin markdown:
{"lines":[{"dwg":"...","precioUnitario":number,"rationale":"..."}],"notes":"..."}
Una línea por cada dwg del input. precioUnitario > 0. No inventes dims ausentes.`;

@Injectable()
export class HermesCotizacionService {
  private readonly logger = new Logger(HermesCotizacionService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly fallbackEstimacion: CotizacionEstimacionService,
  ) {}

  /** Load skill text if present (for richer system prompt). */
  private loadSkillExtra(): string {
    const candidates = [
      path.join(
        process.env.HERMES_HOME || '/home/ubuntu/.hermes',
        'skills/amd-web-app/amd-cotizacion/SKILL.md',
      ),
      '/home/ubuntu/.hermes/skills/amd-web-app/amd-cotizacion/SKILL.md',
    ];
    for (const p of candidates) {
      try {
        if (fs.existsSync(p)) {
          return fs.readFileSync(p, 'utf8').slice(0, 6000);
        }
      } catch {
        /* ignore */
      }
    }
    return '';
  }

  private async buildLinesPayload(cotizacionId: string) {
    const cot = await this.prisma.cotizacion.findUnique({
      where: { id: cotizacionId },
      include: { detalles: true },
    });
    if (!cot) throw new NotFoundException('Cotización no encontrada');
    if (!cot.detalles.length) {
      throw new NotFoundException('Cotización sin líneas');
    }

    const lines: Array<{
      dwg: string;
      qtyBom: number;
      materialBom: string;
      planoExtract: string;
      heuristicUsd: number;
    }> = [];

    for (const d of cot.detalles) {
      const dwg = (d.numeroParte || d.piezaNombre || '').toUpperCase();
      const materialBom = (d.piezaDescripcion || d.notas || '').replace(
        /^Material:\s*/i,
        '',
      );
      let planoExtract = '';
      if (d.archivoPlanoId) {
        try {
          const buf = await this.storage.download(d.archivoPlanoId);
          if (buf?.length) {
            const text = await extractPdfText(buf);
            const feat = featuresFromText(text);
            // Explicitly strip common QTY title-block noise for the model
            const cleaned = text
              .replace(/\bQTY\s*[:=]?\s*\d+/gi, '[QTY_PLANO_IGNORADO]')
              .replace(/\bQUANTITY\s*[:=]?\s*\d+/gi, '[QTY_PLANO_IGNORADO]');
            planoExtract = [
              feat.volumeIn3
                ? `dims≈[${feat.dimsIn.slice(0, 4).join(',')}] vol≈${feat.volumeIn3.toFixed(2)}in³ complexity=${feat.complexity}`
                : 'dims: no detectadas',
              cleaned.slice(0, 1800),
            ].join('\n');
          }
        } catch (e: any) {
          this.logger.warn(`PDF ${dwg}: ${e?.message || e}`);
          planoExtract = '(no se pudo leer PDF)';
        }
      }
      const baseline = classifyMaterial(materialBom || planoExtract);
      const { unitPrice } = estimateUnitPriceUsd({
        material: baseline,
        qty: d.cantidad,
      });
      lines.push({
        dwg,
        qtyBom: d.cantidad,
        materialBom,
        planoExtract,
        heuristicUsd: unitPrice,
      });
    }

    return { cot, lines };
  }

  private async callHermesJson(userPayload: unknown): Promise<{
    lines: HermesLineQuote[];
    notes: string;
    raw: string;
  } | null> {
    const skill = this.loadSkillExtra();
    const system = skill
      ? `${SYSTEM_PROMPT}\n\n--- Skill amd-cotizacion ---\n${skill}`
      : SYSTEM_PROMPT;

    const body = {
      model: DEFAULT_MODEL,
      temperature: 0.2,
      messages: [
        { role: 'system', content: system },
        {
          role: 'user',
          content:
            'Cotiza estas líneas. qtyBom es la única cantidad válida. Ignora QTY del plano.\n' +
            JSON.stringify(userPayload, null, 2),
        },
      ],
    };

    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 180_000);
    try {
      const res = await fetch(PROXY_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer hermes-proxy',
        },
        body: JSON.stringify(body),
        signal: ctrl.signal,
      });
      if (!res.ok) {
        const t = await res.text();
        this.logger.warn(`Hermes proxy HTTP ${res.status}: ${t.slice(0, 300)}`);
        return null;
      }
      const data = (await res.json()) as any;
      const raw = String(data?.choices?.[0]?.message?.content || '').trim();
      if (!raw) return null;
      const parsed = this.extractJson(raw);
      if (!parsed?.lines?.length) {
        this.logger.warn(`Hermes JSON inválido: ${raw.slice(0, 400)}`);
        return null;
      }
      const lines: HermesLineQuote[] = parsed.lines
        .filter(
          (l: any) =>
            l?.dwg &&
            Number.isFinite(Number(l.precioUnitario)) &&
            Number(l.precioUnitario) > 0,
        )
        .map((l: any) => ({
          dwg: String(l.dwg).toUpperCase(),
          precioUnitario: Number(l.precioUnitario),
          rationale: String(l.rationale || 'hermes'),
        }));
      return {
        lines,
        notes: String(parsed.notes || ''),
        raw,
      };
    } catch (e: any) {
      this.logger.warn(`Hermes call fail: ${e?.message || e}`);
      return null;
    } finally {
      clearTimeout(timer);
    }
  }

  /** Pull JSON object from model output (tolerates ``` fences). */
  extractJson(raw: string): any | null {
    let s = raw.trim();
    const fence = s.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fence) s = fence[1].trim();
    const start = s.indexOf('{');
    const end = s.lastIndexOf('}');
    if (start < 0 || end <= start) return null;
    try {
      return JSON.parse(s.slice(start, end + 1));
    } catch {
      return null;
    }
  }

  /**
   * Cotiza con Hermes (LongCat via proxy). Fallback heurístico si falla.
   * Batches de a 12 líneas para no saturar contexto free.
   */
  async cotizarConHermes(cotizacionId: string, opts?: { forceFallback?: boolean }) {
    const { cot, lines } = await this.buildLinesPayload(cotizacionId);
    const moneda = (cot.moneda as string) || 'MXN';
    const runAt = new Date().toISOString();

    if (opts?.forceFallback) {
      return this.fallbackEstimacion.estimarPrecios(cotizacionId);
    }

    const batchSize = 12;
    const allQuotes = new Map<string, HermesLineQuote>();
    let hermesNotes: string[] = [];
    let usedHermes = false;

    for (let i = 0; i < lines.length; i += batchSize) {
      const batch = lines.slice(i, i + batchSize);
      const payload = {
        moneda,
        shopHints: {
          rateUsdPerHour: SHOP_RATE_USD_PER_HOUR,
          setupMin: SETUP_MINUTES,
          margin: MARGIN,
          usdToMxn: USD_TO_MXN,
        },
        lines: batch.map(({ dwg, qtyBom, materialBom, planoExtract, heuristicUsd }) => ({
          dwg,
          qtyBom,
          materialBom,
          planoExtract,
          heuristicUsdRef: heuristicUsd,
        })),
      };
      const result = await this.callHermesJson(payload);
      if (result?.lines?.length) {
        usedHermes = true;
        for (const q of result.lines) allQuotes.set(q.dwg, q);
        if (result.notes) hermesNotes.push(result.notes);
      }
    }

    if (!usedHermes || allQuotes.size === 0) {
      this.logger.warn('Hermes vacío → fallback heurístico');
      const fb = await this.fallbackEstimacion.estimarPrecios(cotizacionId);
      return {
        ...fb,
        hermes: { used: false, fallback: true, model: DEFAULT_MODEL },
      };
    }

    let updated = 0;
    const sample: string[] = [];

    for (const d of cot.detalles) {
      const dwg = (d.numeroParte || d.piezaNombre || '').toUpperCase();
      const q = allQuotes.get(dwg);
      const lineMeta = lines.find((l) => l.dwg === dwg);
      let precio: number;
      let rationale: string;

      if (q) {
        precio = q.precioUnitario;
        // Safety vs heuristic (USD space)
        if (lineMeta && moneda === 'USD') {
          const lo = lineMeta.heuristicUsd * 0.35;
          const hi = lineMeta.heuristicUsd * 3;
          precio = Math.min(hi, Math.max(lo, precio));
        } else if (lineMeta && moneda === 'MXN') {
          const href = lineMeta.heuristicUsd * USD_TO_MXN;
          const lo = href * 0.35;
          const hi = href * 3;
          precio = Math.min(hi, Math.max(lo, precio));
        }
        rationale = q.rationale;
      } else if (lineMeta) {
        precio =
          moneda === 'MXN'
            ? Math.round(lineMeta.heuristicUsd * USD_TO_MXN * 100) / 100
            : lineMeta.heuristicUsd;
        rationale = 'fallback heurístico (Hermes no devolvió esta línea)';
      } else {
        continue;
      }

      precio = Math.round(precio * 100) / 100;
      const aiNote = [
        `Hermes ${runAt.slice(0, 10)}`,
        rationale,
        'QTY=BOM (no plano)',
        'REQUIERE REVISIÓN HUMANA',
      ].join(' | ');
      const prevNotas = (d.notas || '')
        .replace(/\s*\|?\s*(Hermes|Estimado IA)[\s\S]*$/i, '')
        .trim();
      const notas = prevNotas ? `${prevNotas} | ${aiNote}` : aiNote;

      await this.prisma.detalleCotizacion.update({
        where: { id: d.id },
        data: {
          precioUnitario: new Prisma.Decimal(precio),
          subtotal: new Prisma.Decimal(precio * d.cantidad),
          notas,
        },
      });
      updated++;
      if (sample.length < 8) sample.push(`${dwg}: $${precio} ${moneda}`);
    }

    const fresh = await this.prisma.detalleCotizacion.findMany({
      where: { cotizacionId },
    });
    const subtotal = fresh.reduce(
      (s: number, d: { precioUnitario: unknown; cantidad: number }) =>
        s + Number(d.precioUnitario) * d.cantidad,
      0,
    );
    const iva = subtotal * 0.16;
    const total = subtotal + iva;

    const stamp = `\n--- Borrador Hermes ${runAt} ---\nModelo: ${DEFAULT_MODEL}. Líneas: ${updated}/${cot.detalles.length}. QTY solo BOM. ${hermesNotes.join(' ')}\nPrecios estimados — revisar antes de enviar.\n`;

    const cotizacion = await this.prisma.cotizacion.update({
      where: { id: cotizacionId },
      data: {
        subtotal: new Prisma.Decimal(subtotal),
        iva: new Prisma.Decimal(iva),
        total: new Prisma.Decimal(total),
        notas: `${cot.notas || ''}${stamp}`.trim(),
      },
      include: { cliente: true, detalles: true },
    });

    return {
      ...cotizacion,
      hermes: {
        used: true,
        fallback: false,
        model: DEFAULT_MODEL,
        lineas: updated,
        sample,
        notes: hermesNotes.join(' '),
        disclaimer:
          'Borrador Hermes (LongCat). QTY del plano ignorada. Revisar antes de enviar.',
      },
    };
  }

  /**
   * Chat turn: user message + optional apply JSON prices from Hermes reply.
   */
  async chat(
    cotizacionId: string,
    message: string,
    history: Array<{ role: 'user' | 'assistant'; content: string }> = [],
  ) {
    const { cot, lines } = await this.buildLinesPayload(cotizacionId);
    const moneda = (cot.moneda as string) || 'MXN';
    const ctx = {
      cotizacionId,
      folio: cot.folio,
      moneda,
      lines: lines.map((l) => ({
        dwg: l.dwg,
        qtyBom: l.qtyBom,
        materialBom: l.materialBom,
        heuristicUsd: l.heuristicUsd,
        planoExtract: l.planoExtract.slice(0, 600),
      })),
    };

    const skill = this.loadSkillExtra();
    const system = `${SYSTEM_PROMPT}\n\nContexto cotización:\n${JSON.stringify(ctx).slice(0, 12000)}\n\nSi el usuario pide aplicar/ajustar precios, incluye JSON {"lines":[...]} en la respuesta. ${skill.slice(0, 2000)}`;

    const messages = [
      { role: 'system', content: system },
      ...history.slice(-8),
      { role: 'user', content: message },
    ];

    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 120_000);
    let reply = '';
    try {
      const res = await fetch(PROXY_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer hermes-proxy',
        },
        body: JSON.stringify({
          model: DEFAULT_MODEL,
          temperature: 0.3,
          messages,
        }),
        signal: ctrl.signal,
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(`Hermes HTTP ${res.status}: ${t.slice(0, 200)}`);
      }
      const data = (await res.json()) as any;
      reply = String(data?.choices?.[0]?.message?.content || '').trim();
    } finally {
      clearTimeout(timer);
    }

    let applied = 0;
    const parsed = this.extractJson(reply);
    if (parsed?.lines?.length) {
      for (const l of parsed.lines) {
        const dwg = String(l.dwg || '').toUpperCase();
        const precio = Number(l.precioUnitario);
        if (!dwg || !(precio > 0)) continue;
        const d = cot.detalles.find(
          (x: { numeroParte?: string | null; piezaNombre?: string }) =>
            (x.numeroParte || x.piezaNombre || '').toUpperCase() === dwg,
        );
        if (!d) continue;
        const rationale = String(l.rationale || 'chat hermes');
        await this.prisma.detalleCotizacion.update({
          where: { id: d.id },
          data: {
            precioUnitario: new Prisma.Decimal(precio),
            subtotal: new Prisma.Decimal(precio * d.cantidad),
            notas: `${(d.notas || '').split('| Hermes')[0].trim()} | Hermes chat: ${rationale}`.trim(),
          },
        });
        applied++;
      }
      if (applied) {
        const fresh = await this.prisma.detalleCotizacion.findMany({
          where: { cotizacionId },
        });
        const subtotal = fresh.reduce(
          (s: number, d: { precioUnitario: unknown; cantidad: number }) =>
            s + Number(d.precioUnitario) * d.cantidad,
          0,
        );
        await this.prisma.cotizacion.update({
          where: { id: cotizacionId },
          data: {
            subtotal: new Prisma.Decimal(subtotal),
            iva: new Prisma.Decimal(subtotal * 0.16),
            total: new Prisma.Decimal(subtotal * 1.16),
          },
        });
      }
    }

    const cotizacion = await this.prisma.cotizacion.findUnique({
      where: { id: cotizacionId },
      include: { cliente: true, detalles: true },
    });

    return {
      reply,
      applied,
      model: DEFAULT_MODEL,
      cotizacion,
    };
  }
}
