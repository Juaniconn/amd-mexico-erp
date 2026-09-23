import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { StorageService } from '../../common/storage.service';
import {
  classifyMaterial,
  estimateUnitPriceUsd,
  MaterialBaseline,
} from './material-price-book';
import {
  researchMaterialPrices,
  marketFactorFromHits,
} from './market-research';
import {
  extractPdfText,
  featuresFromText,
  applyPlanoToEstimate,
  PlanoFeatures,
} from './plano-pdf';
import { refinePricesWithLlm } from './llm-pricing';

@Injectable()
export class CotizacionEstimacionService {
  private readonly logger = new Logger(CotizacionEstimacionService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  async estimarPrecios(cotizacionId: string) {
    const cot = await this.prisma.cotizacion.findUnique({
      where: { id: cotizacionId },
      include: { detalles: true, cliente: true },
    });
    if (!cot) {
      throw new NotFoundException('Cotización no encontrada');
    }
    if (!cot.detalles.length) {
      throw new NotFoundException('Cotización sin líneas');
    }

    const moneda = (cot.moneda as string) || 'USD';
    const usdToMxn = 17.5;

    const byClass = new Map<
      string,
      { baseline: MaterialBaseline; sampleRaw: string }
    >();
    for (const d of cot.detalles) {
      const raw = d.piezaDescripcion || d.notas || '';
      const baseline = classifyMaterial(raw);
      if (!byClass.has(baseline.class)) {
        byClass.set(baseline.class, { baseline, sampleRaw: raw });
      }
    }

    const classFactors = new Map<
      string,
      { factor: number; note: string; hits: number }
    >();
    for (const [cls, { baseline }] of byClass) {
      this.logger.log(`Market research: ${cls}`);
      const hits = await researchMaterialPrices(baseline.searchQueries);
      const { factor, note } = marketFactorFromHits(
        hits,
        baseline.materialPerPartUsd,
      );
      classFactors.set(cls, { factor, note, hits: hits.length });
    }

    // PDF features per line (download from MinIO when available)
    const pdfByLine = new Map<string, PlanoFeatures | null>();
    let pdfOk = 0;
    for (const d of cot.detalles) {
      const url = d.archivoPlanoId;
      if (!url) {
        pdfByLine.set(d.id, null);
        continue;
      }
      try {
        const buf = await this.storage.download(url);
        if (!buf?.length) {
          pdfByLine.set(d.id, null);
          continue;
        }
        const text = await extractPdfText(buf);
        const feat = featuresFromText(text);
        pdfByLine.set(d.id, feat);
        if (feat.volumeIn3) pdfOk++;
      } catch (e: any) {
        this.logger.warn(`PDF ${d.numeroParte}: ${e?.message || e}`);
        pdfByLine.set(d.id, null);
      }
    }

    const runAt = new Date().toISOString();
    const heuristicRows: Array<{
      id: string;
      numeroParte: string;
      material: string;
      qty: number;
      heuristicUsd: number;
      pdfNote: string;
      breakdown: string;
    }> = [];

    for (const d of cot.detalles) {
      const raw = d.piezaDescripcion || d.notas || '';
      const baseline = classifyMaterial(raw);
      const mf = classFactors.get(baseline.class) || {
        factor: 1,
        note: 'baseline',
        hits: 0,
      };
      const feat = pdfByLine.get(d.id) || null;
      const scaled = applyPlanoToEstimate({
        materialPerPartUsd: baseline.materialPerPartUsd,
        cycleMin: baseline.cycleMin,
        features: feat,
      });
      const materialScaled: MaterialBaseline = {
        ...baseline,
        materialPerPartUsd: scaled.materialPerPartUsd,
        cycleMin: scaled.cycleMin,
      };
      const { unitPrice, breakdown } = estimateUnitPriceUsd({
        material: materialScaled,
        qty: d.cantidad,
        marketFactor: mf.factor,
      });
      heuristicRows.push({
        id: d.id,
        numeroParte: d.numeroParte || d.piezaNombre,
        material: raw,
        qty: d.cantidad,
        heuristicUsd: unitPrice,
        pdfNote: scaled.note,
        breakdown: `${breakdown} | ${scaled.note} | ${mf.note}`,
      });
    }

    const marketNotes = [...classFactors.entries()]
      .map(([k, v]) => `${k}: ${v.note}`)
      .join('\n');

    const llmHints = await refinePricesWithLlm({
      moneda,
      marketNotes,
      lines: heuristicRows.map((r) => ({
        numeroParte: r.numeroParte,
        material: r.material,
        qty: r.qty,
        heuristicUsd: r.heuristicUsd,
        pdfNote: r.pdfNote,
      })),
    });
    const llmByParte = new Map(
      (llmHints || []).map((h) => [h.numeroParte.toUpperCase(), h]),
    );
    const usedLlm = llmByParte.size > 0;

    let updated = 0;
    const lineSummaries: string[] = [];

    for (const row of heuristicRows) {
      const llm = llmByParte.get(row.numeroParte.toUpperCase());
      let unitUsd = llm?.precioUnitarioUsd ?? row.heuristicUsd;
      // safety: don't drift >2.5x from heuristic
      if (llm) {
        const lo = row.heuristicUsd * 0.4;
        const hi = row.heuristicUsd * 2.5;
        unitUsd = Math.min(hi, Math.max(lo, unitUsd));
      }

      let precio = unitUsd;
      if (moneda === 'MXN') {
        precio = Math.round(unitUsd * usdToMxn * 100) / 100;
      } else {
        precio = Math.round(unitUsd * 100) / 100;
      }

      const aiNote = [
        `Estimado IA ${runAt.slice(0, 10)}`,
        row.breakdown,
        llm ? `LLM: ${llm.rationale}` : 'heurística+PDF+mercado',
        'REQUIERE REVISIÓN HUMANA',
      ].join(' | ');

      const d = cot.detalles.find((x) => x.id === row.id)!;
      const prevNotas = (d.notas || '')
        .replace(/\s*\|?\s*Estimado IA[\s\S]*$/i, '')
        .trim();
      const notas = prevNotas ? `${prevNotas} | ${aiNote}` : aiNote;

      await this.prisma.detalleCotizacion.update({
        where: { id: row.id },
        data: {
          precioUnitario: new Prisma.Decimal(precio),
          subtotal: new Prisma.Decimal(precio * row.qty),
          notas,
        },
      });
      updated++;
      lineSummaries.push(`${row.numeroParte}: $${precio} ${moneda}`);
    }

    const fresh = await this.prisma.detalleCotizacion.findMany({
      where: { cotizacionId },
    });
    const subtotal = fresh.reduce(
      (s, d) => s + Number(d.precioUnitario) * d.cantidad,
      0,
    );
    const iva = subtotal * 0.16;
    const total = subtotal + iva;

    const researchLog = [...classFactors.entries()]
      .map(([k, v]) => `${k}:×${v.factor.toFixed(2)} (${v.hits} fuentes)`)
      .join('; ');

    const stamp = `\n--- Agente cotización ${runAt} ---\nLíneas: ${updated}. PDFs con dims: ${pdfOk}/${cot.detalles.length}. LLM: ${usedLlm ? 'sí' : 'no (OPENAI_API_KEY opcional)'}. Mercado: ${researchLog}\nPrecios estimados — revisar antes de enviar.\n`;

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
      estimacion: {
        at: runAt,
        lineas: updated,
        moneda,
        pdfConDims: pdfOk,
        llm: usedLlm,
        research: Object.fromEntries(classFactors),
        sample: lineSummaries.slice(0, 8),
        disclaimer:
          'Precios estimados (PDF + mercado CJ + opcional LLM). No enviar sin revisión humana.',
      },
    };
  }
}
