import {
  classifyMaterial,
  estimateUnitPriceUsd,
} from '../material-price-book';
import { extractPrices, marketFactorFromHits } from '../market-research';

describe('material-price-book', () => {
  it('classifies Delrin and 304 SS', () => {
    expect(classifyMaterial('Material: BLACK DELRIN').class).toBe('DELRIN');
    expect(classifyMaterial('Material: 304 SS').class).toBe('SS_304');
  });

  it('estimates lower unit price at higher qty (setup amortizado)', () => {
    const m = classifyMaterial('ALUMINUM 6061');
    const low = estimateUnitPriceUsd({ material: m, qty: 4 });
    const high = estimateUnitPriceUsd({ material: m, qty: 64 });
    expect(high.unitPrice).toBeLessThan(low.unitPrice);
  });
});

describe('market-research helpers', () => {
  it('extractPrices finds dollar amounts', () => {
    const prices = extractPrices('Delrin costs $8.50 /lb and also USD 12 for stock');
    expect(prices.length).toBeGreaterThan(0);
  });

  it('marketFactor clamps', () => {
    const { factor } = marketFactorFromHits(
      [{ query: 'q', snippet: '', pricesFound: [20, 22] }],
      8,
    );
    expect(factor).toBeLessThanOrEqual(1.4);
    expect(factor).toBeGreaterThanOrEqual(0.75);
  });
});
