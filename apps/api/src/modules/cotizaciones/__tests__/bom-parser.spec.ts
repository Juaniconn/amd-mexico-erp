import {
  parseBomCsv,
  parseBomAuto,
  parseBomUnstructured,
  pdfStem,
  looksLikeDwg,
} from '../bom-parser';

describe('bom-parser', () => {
  const sample = `Item,DWG,Material,QTY
1,260262-002,BLACK DELRIN,16
2,260262-003,BLACK DELRIN,4`;

  it('parses CSV with headers', () => {
    const rows = parseBomCsv(sample);
    expect(rows).toHaveLength(2);
    expect(rows[0]).toEqual({
      item: 1,
      dwg: '260262-002',
      material: 'BLACK DELRIN',
      qty: 16,
    });
  });

  it('parses TSV', () => {
    const tsv = 'Item\tDWG\tMaterial\tQTY\n1\t260262-152\tALUMINUM 6061\t64';
    const rows = parseBomCsv(tsv);
    expect(rows[0].dwg).toBe('260262-152');
    expect(rows[0].qty).toBe(64);
  });

  it('pdfStem normalizes path', () => {
    expect(pdfStem('260262AD/260262-002.pdf')).toBe('260262-002');
  });

  it('parses Outlook vertical paste (one cell per line)', () => {
    const outlook = `Item
DWG
Material
QTY
1
260272-001
BLACK DELRIN
16
2
260272-002
ALUMINUM 6061
2
3
260272-003
SS 304
8`;
    const rows = parseBomAuto(outlook);
    expect(rows).toHaveLength(3);
    expect(rows[0]).toEqual({
      item: 1,
      dwg: '260272-001',
      material: 'BLACK DELRIN',
      qty: 16,
    });
    expect(rows[1].dwg).toBe('260272-002');
    expect(rows[2].material).toBe('SS 304');
  });

  it('parses vertical paste without material', () => {
    const text = `1
260262-002
16
2
260262-003
4`;
    const rows = parseBomAuto(text);
    expect(rows).toHaveLength(2);
    expect(rows[0]).toEqual({
      item: 1,
      dwg: '260262-002',
      material: '',
      qty: 16,
    });
  });

  it('accepts numeric DWG (≥5 digits) and item 0', () => {
    const text = `0
100200
STEEL
3`;
    const rows = parseBomAuto(text);
    expect(rows[0].item).toBe(0);
    expect(rows[0].dwg).toBe('100200');
  });

  it('looksLikeDwg', () => {
    expect(looksLikeDwg('260272-001')).toBe(true);
    expect(looksLikeDwg('BLACK DELRIN')).toBe(false);
    expect(looksLikeDwg('16')).toBe(false);
  });

  it('parseBomUnstructured returns null on garbage', () => {
    expect(parseBomUnstructured('hola\nmundo')).toBeNull();
  });

  it('does not mis-parse space-delimited multi-word materials as columns', () => {
    // Without tabs/commas, prefer unstructured over single-space split
    const text = `Item DWG Material QTY
1 260262-002 BLACK DELRIN 16`;
    // This is ambiguous — either fails cleanly or unstructured fails
    expect(() => parseBomAuto(text)).toThrow();
  });
});
