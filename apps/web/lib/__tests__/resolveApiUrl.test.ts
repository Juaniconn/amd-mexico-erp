import { resolveApiUrl } from '../api';

describe('resolveApiUrl', () => {
  it('same-origin: empty base keeps /api path once', () => {
    expect(resolveApiUrl('/api/agentes-cursor?page=1', '')).toBe(
      '/api/agentes-cursor?page=1',
    );
  });

  it('never doubles /api when base is mistakenly /api', () => {
    expect(resolveApiUrl('/api/agentes-cursor?page=1', '/api')).toBe(
      '/api/agentes-cursor?page=1',
    );
    expect(resolveApiUrl('/api/agentes-cursor/cloud/repos', '/api/')).toBe(
      '/api/agentes-cursor/cloud/repos',
    );
  });

  it('origin base without /api joins cleanly', () => {
    expect(
      resolveApiUrl('/api/clientes', 'https://example.trycloudflare.com'),
    ).toBe('https://example.trycloudflare.com/api/clientes');
    expect(resolveApiUrl('/api/clientes', 'http://localhost:3001')).toBe(
      'http://localhost:3001/api/clientes',
    );
  });

  it('strips duplicate when origin ends with /api', () => {
    expect(
      resolveApiUrl('/api/clientes', 'https://example.trycloudflare.com/api'),
    ).toBe('https://example.trycloudflare.com/api/clientes');
  });

  it('legacy path without /api still works with base=/api', () => {
    expect(resolveApiUrl('/ingenieria/stats', '/api')).toBe(
      '/api/ingenieria/stats',
    );
  });

  it('passes through absolute URLs', () => {
    expect(resolveApiUrl('https://other.test/api/x', '/api')).toBe(
      'https://other.test/api/x',
    );
  });
});
