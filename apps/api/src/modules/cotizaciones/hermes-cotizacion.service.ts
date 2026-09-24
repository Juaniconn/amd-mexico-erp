import {
  Injectable,
  Logger,
  NotFoundException,
  BadGatewayException,
} from '@nestjs/common';
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
import * as fs from 'fs';
import * as path from 'path';

export type HermesLineQuote = {
  dwg: string;
  precioUnitario: number;
  rationale: string;
};

/**
 * Cascada Nous :free — LongCat primero; si rate-limit / overload, el siguiente.
 * Sobrescribible: HERMES_COTIZACION_MODELS=modelo1,modelo2,...
 */
export const NOUS_FREE_MODEL_CASCADE = [
  'meituan/longcat-2.0:free',
  'stepfun/step-3.7-flash:free',
  'upstage/solar-pro4:free',
  'poolside/laguna-s-2.1:free',
  'poolside/laguna-xs-2.1:free',
  'inclusionai/ling-3.0-flash-fin:free',
  'inclusionai/ling-3.0-flash-sante:free',
];

export function resolveModelCascade(): string[] {
  const fromEnv = process.env.HERMES_COTIZACION_MODELS?.trim();
  if (fromEnv) {
    return fromEnv
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }
  const primary = process.env.HERMES_COTIZACION_MODEL?.trim();
  if (primary && !NOUS_FREE_MODEL_CASCADE.includes(primary)) {
    return [primary, ...NOUS_FREE_MODEL_CASCADE];
  }
  if (primary && primary !== NOUS_FREE_MODEL_CASCADE[0]) {
    return [
      primary,
      ...NOUS_FREE_MODEL_CASCADE.filter((m) => m !== primary),
    ];
  }
  return [...NOUS_FREE_MODEL_CASCADE];
}

const PROXY_URL =
  process.env.HERMES_PROXY_URL || 'http://127.0.0.1:8645/v1/chat/completions';
const USD_TO_MXN = Number(process.env.USD_TO_MXN || 17.5);

/** Detect rate limit / capacity errors from Nous / OpenAI-compatible proxies. */
export function isRateLimitOrCapacityError(
  status: number,
  bodyText: string,
): boolean {
  if (status === 429) return true;
  if (status === 503 || status === 502) {
    const t = (bodyText || '').toLowerCase();
    return (
      t.includes('rate') ||
      t.includes('limit') ||
      t.includes('capacity') ||
      t.includes('overload') ||
      t.includes('quota') ||
      t.includes('too many') ||
      t.includes('unavailable')
    );
  }
  const t = (bodyText || '').toLowerCase();
  return (
    t.includes('rate limit') ||
    t.includes('rate_limit') ||
    t.includes('tokens per') ||
    t.includes('quota exceeded') ||
    t.includes('capacity exceeded') ||
    t.includes('model is overloaded')
  );
}

const SYSTEM_PROMPT = `Eres el cotizador CNC de AMD México (Ciudad Juárez / maquila frontera).
Reglas OBLIGATORIAS:
1) La cantidad pedida (qtyBom) viene SOLO del BOM del cliente. IGNORA cualquier QTY del texto del plano PDF.
2) El extracto del plano sirve para material, dims, complejidad y manufactura de ESA pieza.
3) Cotiza precio UNITARIO en la moneda indicada (USD o MXN). Si moneda=MXN y razonas en USD, convierte ~${USD_TO_MXN} MXN/USD.
4) Anclas taller: ~$${SHOP_RATE_USD_PER_HOUR}/h, setup ~${SETUP_MINUTES} min, margen ~${(MARGIN * 100).toFixed(0)}%. heuristicUsdRef es solo referencia, no lo copies ciegamente.
5) Responde SOLO JSON válido sin markdown:
{"lines":[{"dwg":"...","precioUnitario":number,"rationale":"..."}],"notes":"..."}
Una línea por cada dwg del input. precioUnitario > 0. No inventes dims ausentes.`;

@Injectable()
export class HermesCotizacionService {
  private readonly logger = new Logger(HermesCotizacionService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
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
    model: string;
    tried: string[];
  }> {
    const skill = this.loadSkillExtra();
    const system = skill
      ? `${SYSTEM_PROMPT}\n\n--- Skill amd-cotizacion ---\n${skill}`
      : SYSTEM_PROMPT;
    const cascade = resolveModelCascade();
    const tried: string[] = [];
    let lastErr = '';

    for (const model of cascade) {
      tried.push(model);
      const body = {
        model,
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
        const t = await res.text();
        if (!res.ok) {
          lastErr = `HTTP ${res.status}: ${t.slice(0, 200)}`;
          if (isRateLimitOrCapacityError(res.status, t)) {
            this.logger.warn(
              `Rate/capacity en ${model} → siguiente modelo (${cascade.indexOf(model) + 1}/${cascade.length})`,
            );
            continue;
          }
          this.logger.warn(`Hermes ${model}: ${lastErr}`);
          // otros errores: también probar siguiente :free
          continue;
        }
        let data: any;
        try {
          data = JSON.parse(t);
        } catch {
          lastErr = `JSON inválido del proxy: ${t.slice(0, 120)}`;
          continue;
        }
        const raw = String(data?.choices?.[0]?.message?.content || '').trim();
        if (!raw) {
          lastErr = `${model}: respuesta vacía`;
          continue;
        }
        const parsed = this.extractJson(raw);
        if (!parsed?.lines?.length) {
          lastErr = `${model}: JSON de cotización inválido`;
          this.logger.warn(`${lastErr}: ${raw.slice(0, 300)}`);
          continue;
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
        if (!lines.length) {
          lastErr = `${model}: sin líneas válidas`;
          continue;
        }
        if (tried.length > 1) {
          this.logger.log(`Cotización OK con fallback de modelo: ${model}`);
        }
        return {
          lines,
          notes: String(parsed.notes || ''),
          raw,
          model,
          tried,
        };
      } catch (e: any) {
        lastErr = e?.message || String(e);
        this.logger.warn(`Hermes ${model} fail: ${lastErr}`);
        continue;
      } finally {
        clearTimeout(timer);
      }
    }

    throw new BadGatewayException(
      `Ningún modelo Nous :free respondió. Probados: ${tried.join(', ')}. Último error: ${lastErr}`,
    );
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
   * Cotiza con Hermes/Nous (cascada :free). Sin fallback heurístico.
   * Batches de a 12 líneas para no saturar contexto free.
   */
  async cotizarConHermes(cotizacionId: string) {
    const { cot, lines } = await this.buildLinesPayload(cotizacionId);
    const moneda = (cot.moneda as string) || 'MXN';
    const runAt = new Date().toISOString();

    const batchSize = 12;
    const allQuotes = new Map<string, HermesLineQuote>();
    const hermesNotes: string[] = [];
    const modelsUsed = new Set<string>();
    const allTried = new Set<string>();

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
        lines: batch.map(
          ({ dwg, qtyBom, materialBom, planoExtract, heuristicUsd }) => ({
            dwg,
            qtyBom,
            materialBom,
            planoExtract,
            heuristicUsdRef: heuristicUsd,
          }),
        ),
      };
      const result = await this.callHermesJson(payload);
      modelsUsed.add(result.model);
      result.tried.forEach((m) => allTried.add(m));
      for (const q of result.lines) allQuotes.set(q.dwg, q);
      if (result.notes) hermesNotes.push(result.notes);
    }

    if (allQuotes.size === 0) {
      throw new BadGatewayException(
        'Hermes no devolvió precios. No se aplicó estimación heurística.',
      );
    }

    let updated = 0;
    const sample: string[] = [];
    const missing: string[] = [];

    for (const d of cot.detalles) {
      const dwg = (d.numeroParte || d.piezaNombre || '').toUpperCase();
      const q = allQuotes.get(dwg);
      if (!q) {
        missing.push(dwg);
        continue;
      }

      const precio = Math.round(q.precioUnitario * 100) / 100;
      const aiNote = [
        `Hermes ${runAt.slice(0, 10)}`,
        `modelo=${[...modelsUsed].join('|')}`,
        q.rationale,
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

    if (missing.length) {
      this.logger.warn(
        `Hermes no cotizó ${missing.length} DWG: ${missing.slice(0, 8).join(', ')}`,
      );
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

    const stamp = `\n--- Borrador Hermes ${runAt} ---\nModelos: ${[...modelsUsed].join(', ')}. Probados: ${[...allTried].join(', ')}. Líneas: ${updated}/${cot.detalles.length}${missing.length ? ` (faltan: ${missing.join(', ')})` : ''}. QTY solo BOM. ${hermesNotes.join(' ')}\nSin heurística. Revisar antes de enviar.\n`;

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
        model: [...modelsUsed].join(', '),
        modelsTried: [...allTried],
        lineas: updated,
        missing,
        sample,
        notes: hermesNotes.join(' '),
        disclaimer:
          'Borrador Hermes (Nous :free, cascada). QTY del plano ignorada. Sin heurística. Revisar antes de enviar.',
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

    const cascade = resolveModelCascade();
    let reply = '';
    let usedModel = cascade[0];
    let lastErr = '';

    for (const model of cascade) {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 120_000);
      try {
        const res = await fetch(PROXY_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer hermes-proxy',
          },
          body: JSON.stringify({
            model,
            temperature: 0.3,
            messages,
          }),
          signal: ctrl.signal,
        });
        const t = await res.text();
        if (!res.ok) {
          lastErr = `HTTP ${res.status}: ${t.slice(0, 200)}`;
          if (isRateLimitOrCapacityError(res.status, t)) {
            this.logger.warn(`Chat rate-limit ${model} → siguiente`);
            continue;
          }
          continue;
        }
        let data: any;
        try {
          data = JSON.parse(t);
        } catch {
          lastErr = 'proxy JSON inválido';
          continue;
        }
        reply = String(data?.choices?.[0]?.message?.content || '').trim();
        if (!reply) {
          lastErr = `${model}: vacío`;
          continue;
        }
        usedModel = model;
        break;
      } catch (e: any) {
        lastErr = e?.message || String(e);
        continue;
      } finally {
        clearTimeout(timer);
      }
    }

    if (!reply) {
      throw new BadGatewayException(
        `Chat Hermes falló en todos los modelos :free. ${lastErr}`,
      );
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
      model: usedModel,
      cotizacion,
    };
  }
}
