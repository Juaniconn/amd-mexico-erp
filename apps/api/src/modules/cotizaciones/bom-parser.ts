export type BomRow = {
  item: number;
  dwg: string;
  material: string;
  qty: number;
};

/**
 * Parse BOM as CSV/TSV with headers Item, DWG, Material, QTY (case-insensitive).
 * Also accepts headerless rows: item,dwg,material,qty
 */
export function parseBomCsv(text: string): BomRow[] {
  const raw = String(text || '')
    .replace(/^\uFEFF/, '')
    .trim();
  if (!raw) {
    throw new Error('BOM vacío');
  }

  const lines = raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) {
    throw new Error('BOM vacío');
  }

  const delim = lines[0].includes('\t')
    ? '\t'
    : lines[0].includes(';')
      ? ';'
      : ',';

  const split = (line: string) =>
    line.split(delim).map((c) => c.trim().replace(/^["']|["']$/g, ''));

  let start = 0;
  const headerCells = split(lines[0]).map((c) => c.toLowerCase());
  const hasHeader =
    headerCells.includes('dwg') ||
    headerCells.includes('item') ||
    headerCells.includes('qty') ||
    headerCells.includes('material');

  let idxItem = 0;
  let idxDwg = 1;
  let idxMaterial = 2;
  let idxQty = 3;

  if (hasHeader) {
    start = 1;
    const find = (...names: string[]) =>
      headerCells.findIndex((h) => names.includes(h));
    idxItem = find('item', 'no', '#', 'linea', 'línea');
    idxDwg = find('dwg', 'drawing', 'parte', 'numero_parte', 'número_parte');
    idxMaterial = find('material', 'mat');
    idxQty = find('qty', 'cantidad', 'cant', 'quantity');
    if (idxDwg < 0 || idxQty < 0) {
      throw new Error(
        'BOM: faltan columnas DWG y/o QTY (encabezados: Item,DWG,Material,QTY)',
      );
    }
    if (idxItem < 0) idxItem = 0;
    if (idxMaterial < 0) idxMaterial = -1;
  }

  const rows: BomRow[] = [];
  for (let i = start; i < lines.length; i++) {
    const cells = split(lines[i]);
    if (cells.every((c) => !c)) continue;

    const dwg = (cells[idxDwg] || '').toUpperCase().trim();
    const qtyRaw = cells[idxQty] || '';
    const qty = parseInt(qtyRaw.replace(/[^\d-]/g, ''), 10);
    const itemRaw = idxItem >= 0 ? cells[idxItem] : String(i - start + 1);
    const item = parseInt(String(itemRaw).replace(/[^\d-]/g, ''), 10);
    const material =
      idxMaterial >= 0 ? (cells[idxMaterial] || '').trim() : '';

    if (!dwg) {
      throw new Error(`BOM fila ${i + 1}: DWG vacío`);
    }
    if (!Number.isFinite(qty) || qty < 1) {
      throw new Error(`BOM fila ${i + 1}: QTY inválida ("${qtyRaw}")`);
    }

    rows.push({
      item: Number.isFinite(item) ? item : i - start + 1,
      dwg,
      material,
      qty,
    });
  }

  if (rows.length === 0) {
    throw new Error('BOM sin filas de datos');
  }

  return rows;
}

/** Normalize filename stem for matching: 260262-002.pdf → 260262-002 */
export function pdfStem(filename: string): string {
  const base = filename.split(/[/\\]/).pop() || filename;
  return base.replace(/\.pdf$/i, '').trim().toUpperCase();
}
