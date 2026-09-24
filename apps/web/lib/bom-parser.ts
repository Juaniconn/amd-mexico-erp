/** Keep in sync with apps/api/src/modules/cotizaciones/bom-parser.ts */
export type BomRow = {
  item: number;
  dwg: string;
  material: string;
  qty: number;
};

const HEADER_ALIASES: Record<string, 'item' | 'dwg' | 'material' | 'qty'> = {
  item: 'item',
  no: 'item',
  '#': 'item',
  linea: 'item',
  línea: 'item',
  dwg: 'dwg',
  drawing: 'dwg',
  parte: 'dwg',
  numero_parte: 'dwg',
  número_parte: 'dwg',
  material: 'material',
  mat: 'material',
  qty: 'qty',
  cantidad: 'qty',
  cant: 'qty',
  quantity: 'qty',
};

function normalizeLines(text: string): string[] {
  return String(text || '')
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
}

function stripQuotes(c: string): string {
  return c.trim().replace(/^["']|["']$/g, '');
}

function isPureInt(s: string): boolean {
  return /^\d+$/.test(s.trim());
}

function parsePositiveInt(s: string): number | null {
  const n = parseInt(String(s).replace(/[^\d-]/g, ''), 10);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

/** Drawing / part number: hyphen codes, alphanumerics; pure digits only if ≥5 chars. */
export function looksLikeDwg(s: string): boolean {
  const t = s.trim();
  if (!t || t.length < 2) return false;
  if (HEADER_ALIASES[t.toLowerCase()]) return false;
  if (/^[A-Za-z0-9][A-Za-z0-9._/-]*-\d+$/.test(t)) return true;
  if (/^\d{5,}-\d{1,}$/.test(t)) return true;
  if (/^[A-Za-z][A-Za-z0-9._-]{2,}$/.test(t)) return true;
  if (/^\d{5,}$/.test(t)) return true;
  if (/^[A-Za-z0-9][A-Za-z0-9._-]{3,}$/.test(t) && /[A-Za-z]/.test(t))
    return true;
  return false;
}

function isHeaderCell(s: string): boolean {
  return HEADER_ALIASES[s.trim().toLowerCase()] != null;
}

function detectDelim(lines: string[]): string | null {
  const sample = lines.slice(0, Math.min(8, lines.length));
  for (const d of ['\t', ';', ',']) {
    const hits = sample.filter((l) => l.includes(d) && l.split(d).length >= 3);
    if (hits.length >= 1) return d;
  }
  const multi = sample.filter(
    (l) => /\s{2,}/.test(l) && l.split(/\s{2,}/).length >= 3,
  );
  if (multi.length >= 1) return '  ';

  // Single-space only when every non-header-ish line splits to exactly 4 tokens
  const dataish = lines.filter((l) => !isHeaderCell(l.split(/\s+/)[0] || ''));
  if (
    dataish.length >= 1 &&
    dataish.every((l) => l.split(/\s+/).filter(Boolean).length === 4)
  ) {
    return ' ';
  }
  return null;
}

function splitLine(line: string, delim: string): string[] {
  if (delim === '  ') return line.split(/\s{2,}/).map(stripQuotes);
  if (delim === ' ') return line.split(/\s+/).map(stripQuotes);
  return line.split(delim).map(stripQuotes);
}

function parseStructured(lines: string[], delim: string): BomRow[] {
  const headerCells = splitLine(lines[0], delim).map((c) => c.toLowerCase());
  const hasHeader = headerCells.some((h) => HEADER_ALIASES[h] != null);

  let idxItem = 0;
  let idxDwg = 1;
  let idxMaterial = 2;
  let idxQty = 3;
  let start = 0;

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
    const cells = splitLine(lines[i], delim);
    if (cells.every((c) => !c)) continue;

    const dwg = (cells[idxDwg] || '').toUpperCase().trim();
    const qtyRaw = cells[idxQty] || '';
    const qty = parsePositiveInt(qtyRaw);
    const itemRaw = idxItem >= 0 ? cells[idxItem] : String(i - start + 1);
    const item = parsePositiveInt(String(itemRaw));
    const material =
      idxMaterial >= 0 ? (cells[idxMaterial] || '').trim() : '';

    if (!dwg) {
      throw new Error(`BOM fila ${i + 1}: DWG vacío`);
    }
    if (qty == null || qty < 1) {
      throw new Error(`BOM fila ${i + 1}: QTY inválida ("${qtyRaw}")`);
    }

    rows.push({
      item: item != null ? item : i - start + 1,
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

/**
 * Outlook / vertical paste: one cell per line.
 * Pattern: Item, DWG, Material?, QTY (material optional).
 */
export function parseBomUnstructured(text: string): BomRow[] | null {
  const lines = normalizeLines(text);
  if (lines.length < 3) return null;

  let i = 0;
  // Skip a header block if present (Item / DWG / Material / QTY each on its line)
  if (
    lines.length >= 4 &&
    isHeaderCell(lines[0]) &&
    isHeaderCell(lines[1]) &&
    isHeaderCell(lines[2]) &&
    isHeaderCell(lines[3])
  ) {
    i = 4;
  } else {
    while (i < lines.length && isHeaderCell(lines[i])) i++;
  }

  const rows: BomRow[] = [];
  while (i < lines.length) {
    const itemRaw = lines[i];
    if (!isPureInt(itemRaw)) {
      // stray noise — skip one line
      i++;
      continue;
    }
    const item = parsePositiveInt(itemRaw);
    if (item == null) {
      i++;
      continue;
    }

    const dwgRaw = lines[i + 1];
    if (!dwgRaw || !looksLikeDwg(dwgRaw)) {
      return null; // ambiguous stream
    }
    const dwg = dwgRaw.toUpperCase().trim();

    const a = lines[i + 2];
    const b = lines[i + 3];
    if (a == null) return null;

    let material = '';
    let qty: number | null = null;
    let consumed = 0;

    // Prefer 4-cell row when `a` is material text and `b` is qty
    if (!isPureInt(a) && b != null && isPureInt(b)) {
      material = a.trim();
      qty = parsePositiveInt(b);
      consumed = 4;
    } else if (isPureInt(a) && (b == null || isPureInt(b))) {
      // Item + DWG + QTY (material omitted); next line starts next item or EOF
      qty = parsePositiveInt(a);
      consumed = 3;
    } else {
      return null;
    }

    if (qty == null || qty < 1) return null;

    rows.push({ item, dwg, material, qty });
    i += consumed;
  }

  return rows.length > 0 ? rows : null;
}

/**
 * Auto-detect CSV/TSV/semicolon/multi-space, else Outlook vertical cells.
 */
export function parseBomAuto(text: string): BomRow[] {
  const raw = String(text || '').replace(/^\uFEFF/, '').trim();
  if (!raw) {
    throw new Error('BOM vacío');
  }
  const lines = normalizeLines(raw);
  if (lines.length === 0) {
    throw new Error('BOM vacío');
  }

  const delim = detectDelim(lines);
  if (delim) {
    try {
      return parseStructured(lines, delim);
    } catch (e) {
      const unstructured = parseBomUnstructured(raw);
      if (unstructured?.length) return unstructured;
      throw e;
    }
  }

  const unstructured = parseBomUnstructured(raw);
  if (unstructured?.length) return unstructured;

  throw new Error(
    'BOM no reconocido. Pega tabla CSV/TSV o celdas de Outlook (Item, DWG, Material, QTY).',
  );
}

/** @deprecated use parseBomAuto — kept for callers/tests */
export function parseBomCsv(text: string): BomRow[] {
  return parseBomAuto(text);
}

/** Normalize filename stem for matching: 260262-002.pdf → 260262-002 */
export function pdfStem(filename: string): string {
  const base = filename.split(/[/\\]/).pop() || filename;
  return base.replace(/\.pdf$/i, '').trim().toUpperCase();
}
