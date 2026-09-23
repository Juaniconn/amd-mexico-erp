import {
  parseDimsInches,
  featuresFromText,
  applyPlanoToEstimate,
} from '../plano-pdf';

describe('plano-pdf', () => {
  it('parses inch dims from drawing text', () => {
    const text = 'P/N 260262-002  1.323  2.750  .398  .188';
    const dims = parseDimsInches(text);
    expect(dims).toContain(2.75);
    expect(dims).toContain(1.323);
  });

  it('computes volume and scales estimate', () => {
    const feat = featuresFromText('1.000 2.000 0.500 HOLE THRU TAP');
    expect(feat.volumeIn3).toBeCloseTo(1.0, 5);
    const scaled = applyPlanoToEstimate({
      materialPerPartUsd: 8,
      cycleMin: 30,
      features: feat,
    });
    expect(scaled.materialPerPartUsd).toBeGreaterThan(0);
    expect(scaled.note).toMatch(/PDF vol/);
  });
});
