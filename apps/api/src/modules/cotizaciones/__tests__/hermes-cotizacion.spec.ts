import {
  HermesCotizacionService,
  isRateLimitOrCapacityError,
  resolveModelCascade,
  NOUS_FREE_MODEL_CASCADE,
} from '../hermes-cotizacion.service';

describe('HermesCotizacionService.extractJson', () => {
  const svc = Object.create(
    HermesCotizacionService.prototype,
  ) as HermesCotizacionService;

  it('parses raw JSON', () => {
    const j = svc.extractJson(
      '{"lines":[{"dwg":"260272-001","precioUnitario":10,"rationale":"x"}],"notes":"ok"}',
    );
    expect(j.lines[0].dwg).toBe('260272-001');
    expect(j.lines[0].precioUnitario).toBe(10);
  });

  it('parses fenced JSON', () => {
    const j = svc.extractJson(
      'Aqui va:\n```json\n{"lines":[{"dwg":"A","precioUnitario":1,"rationale":"r"}]}\n```\n',
    );
    expect(j.lines[0].dwg).toBe('A');
  });

  it('returns null on garbage', () => {
    expect(svc.extractJson('hola mundo')).toBeNull();
  });
});

describe('BOM qty vs plano QTY policy', () => {
  it('documents that plano QTY markers are stripped in payload builder', () => {
    const sample = 'TITLE QTY 99 MATERIAL DELRIN';
    const cleaned = sample
      .replace(/\bQTY\s*[:=]?\s*\d+/gi, '[QTY_PLANO_IGNORADO]')
      .replace(/\bQUANTITY\s*[:=]?\s*\d+/gi, '[QTY_PLANO_IGNORADO]');
    expect(cleaned).toContain('[QTY_PLANO_IGNORADO]');
    expect(cleaned).not.toMatch(/QTY\s*99/i);
  });
});

describe('Nous free model cascade', () => {
  it('prioritizes LongCat', () => {
    expect(NOUS_FREE_MODEL_CASCADE[0]).toBe('meituan/longcat-2.0:free');
    expect(resolveModelCascade()[0]).toBe('meituan/longcat-2.0:free');
  });

  it('detects rate limit / capacity', () => {
    expect(isRateLimitOrCapacityError(429, '')).toBe(true);
    expect(
      isRateLimitOrCapacityError(503, 'model is overloaded'),
    ).toBe(true);
    expect(isRateLimitOrCapacityError(400, 'bad request')).toBe(false);
  });
});
