import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import AdmZip from 'adm-zip';
import { PrismaService } from '../../database/prisma.service';
import { StorageService } from '../../common/storage.service';
import { CreateCotizacionDto } from './dto/create-cotizacion.dto';
import { CotizacionesService } from './cotizaciones.service';
import { parseBomAuto, pdfStem, BomRow } from './bom-parser';

export type DesdePaqueteInput = {
  zipBuffer: Buffer;
  zipName: string;
  bomText: string;
  clienteId: string;
  sucursalId?: string;
  moneda?: string;
  notas?: string;
};

@Injectable()
export class CotizacionPaqueteService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly cotizaciones: CotizacionesService,
  ) {}

  async createFromPaquete(input: DesdePaqueteInput) {
    let bom: BomRow[];
    try {
      bom = parseBomAuto(input.bomText);
    } catch (e: any) {
      throw new BadRequestException(e?.message || 'BOM inválido');
    }

    const cliente = await this.prisma.cliente.findUnique({
      where: { id: input.clienteId },
    });
    if (!cliente) {
      throw new NotFoundException('Cliente no encontrado');
    }

    let zip: AdmZip;
    try {
      zip = new AdmZip(input.zipBuffer);
    } catch {
      throw new BadRequestException('ZIP inválido o corrupto');
    }

    const pdfEntries = zip
      .getEntries()
      .filter(
        (e) =>
          !e.isDirectory &&
          e.entryName.toLowerCase().endsWith('.pdf') &&
          !e.entryName.split('/').pop()?.startsWith('.'),
      );

    if (pdfEntries.length === 0) {
      throw new BadRequestException('El ZIP no contiene PDFs');
    }

    const pdfByDwg = new Map<string, { entryName: string; buffer: Buffer }>();
    for (const entry of pdfEntries) {
      const stem = pdfStem(entry.entryName);
      if (!stem) continue;
      // last wins if duplicates
      pdfByDwg.set(stem, {
        entryName: entry.entryName,
        buffer: entry.getData(),
      });
    }

    const missingPdf: string[] = [];
    for (const row of bom) {
      if (!pdfByDwg.has(row.dwg.toUpperCase())) {
        missingPdf.push(row.dwg);
      }
    }
    if (missingPdf.length > 0) {
      throw new BadRequestException({
        message: `Faltan PDFs para ${missingPdf.length} DWG del BOM`,
        missingPdf,
      });
    }

    const bomDwgs = new Set(bom.map((r) => r.dwg.toUpperCase()));
    const extraPdf = [...pdfByDwg.keys()].filter((d) => !bomDwgs.has(d));

    const folder = `cotizaciones/paquete-${Date.now()}`;
    const zipUrl = await this.storage.upload(
      folder,
      input.zipName || 'paquete.zip',
      input.zipBuffer,
      'application/zip',
    );

    const detalles: CreateCotizacionDto['detalles'] = [];
    for (const row of bom) {
      const pdf = pdfByDwg.get(row.dwg.toUpperCase())!;
      const safeName = `${row.dwg}.pdf`;
      const planoUrl = await this.storage.upload(
        folder,
        safeName,
        pdf.buffer,
        'application/pdf',
      );

      const materialNote = row.material
        ? `Material: ${row.material}`
        : undefined;

      detalles.push({
        numeroParte: row.dwg,
        piezaNombre: row.dwg,
        piezaDescripcion: materialNote,
        cantidad: row.qty,
        unidad: 'PZ',
        precioUnitario: 0,
        notas: materialNote
          ? `Item ${row.item} | ${materialNote}`
          : `Item ${row.item}`,
        archivoPlanoId: planoUrl,
      } as any);
    }

    const notasParts = [
      input.notas?.trim(),
      `Paquete ZIP: ${input.zipName || 'paquete.zip'} (${bom.length} ítems)`,
      extraPdf.length
        ? `PDFs sin línea BOM (omitidos): ${extraPdf.join(', ')}`
        : null,
      `ZIP storage: ${zipUrl}`,
    ].filter(Boolean);

    const cotizacion = await this.cotizaciones.create({
      clienteId: input.clienteId,
      sucursalId: input.sucursalId,
      moneda: input.moneda || 'MXN',
      notas: notasParts.join('\n'),
      detalles,
      archivoPlanoId: zipUrl,
    } as any);

    return {
      ...cotizacion,
      match: {
        bomLines: bom.length,
        pdfsInZip: pdfEntries.length,
        matched: bom.length,
        missingPdf: [],
        extraPdf,
      },
    };
  }
}
