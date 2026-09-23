import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import {
  classifyMaterial,
  estimateUnitPriceUsd,
} from './material-price-book';
import {
  researchMaterialPrices,
  marketFactorFromHits,
} from './market-research';

@Injectable()
export class CotizacionEstimacionService {
  private readonly logger = new Logger(CotizacionEstimacionService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * AI/heuristic pricing agent: market research per unique material (CJ/MX focus)
   * then updates each line's unit price. Always leaves human review required.
   */
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
    // Rough FX if MXN (can refine later)
    const usdToMxn = 17.5;

    // Unique materials from descripción/notas
    const materialKey = (d: (typeof cot.detalles)[0]) => {
      const raw =
        d.piezaDescripcion ||
        d.notas ||
        d.piezaNombre ||
        'OTHER';
      const m = classifyMaterial(raw);
      return m.class;
    };

    const byClass = new Map<
      string,
      { baseline: ReturnType<typeof classifyMaterial>; sampleRaw: string }
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

    const runAt = new Date().toISOString();
    let updated = 0;
    const lineSummaries: string[] = [];

    for (const d of cot.detalles) {
      const raw = d.piezaDescripcion || d.notas || '';
      const baseline = classifyMaterial(raw);
      const mf = classFactors.get(baseline.class) || {
        factor: 1,
        note: 'baseline',
        hits: 0,
      };
      const { unitPrice, breakdown } = estimateUnitPriceUsd({
        material: baseline,
        qty: d.cantidad,
        marketFactor: mf.factor,
      });

      let precio = unitPrice;
      if (moneda === 'MXN') {
        precio = Math.round(unitPrice * usdToMxn * 100) / 100;
      }

      const aiNote = [
        `Estimado IA ${runAt.slice(0, 10)}`,
        `clase=${baseline.class}`,
        breakdown,
        mf.note,
        'REQUIERE REVISIÓN HUMANA',
      ].join(' | ');

      const prevNotas = (d.notas || '').replace(/\s*\|?\s*Estimado IA[\s\S]*$/i, '').trim();
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
      lineSummaries.push(
        `${d.numeroParte || d.piezaNombre}: $${precio} ${moneda}`,
      );
    }

    // Recalc header totals
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

    const stamp = `\n--- Agente cotización ${runAt} ---\nLíneas: ${updated}. Mercado CJ/MX: ${researchLog}\nPrecios estimados (no compromiso). Revisar antes de enviar.\n`;

    const cotizacion = await this.prisma.cotizacion.update({
      where: { id: cotizacionId },
      data: {
        subtotal: new Prisma.Decimal(subtotal),
        iva: new Prisma.Decimal(iva),
        total: new Prisma.Decimal(total),
        notas: `${cot.notas || ''}${stamp}`.trim(),
      },
      include: {
        cliente: true,
        detalles: true,
      },
    });

    return {
      ...cotizacion,
      estimacion: {
        at: runAt,
        lineas: updated,
        moneda,
        research: Object.fromEntries(classFactors),
        sample: lineSummaries.slice(0, 8),
        disclaimer:
          'Precios estimados por agente (baseline CJ + research web). No enviar al cliente sin revisión humana.',
      },
    };
  }
}
