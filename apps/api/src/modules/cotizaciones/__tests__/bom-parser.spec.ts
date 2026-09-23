import { parseBomCsv, pdfStem } from '../bom-parser';

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
});
