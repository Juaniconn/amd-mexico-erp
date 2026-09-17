'use client';

import { useState } from 'react';

export default function TestPage() {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  async function testFetch() {
    setLoading(true);
    setResult('...');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@amd-mexico.com', password: 'admin123' }),
      });
      const data = await res.json();
      setResult(`STATUS: ${res.status} | TOKEN: ${data.accessToken ? 'OK' : 'NONE'} | EMAIL: ${data.user?.email || 'N/A'}`);
    } catch (err: any) {
      setResult(`ERROR: ${err?.message || err}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 20, fontFamily: 'monospace' }}>
      <h1>API Test</h1>
      <button onClick={testFetch} disabled={loading} style={{ padding: 10, fontSize: 16 }}>
        {loading ? 'Testing...' : 'Test Login API'}
      </button>
      {result && <p style={{ marginTop: 10, wordBreak: 'break-all' }}>{result}</p>}
      <p style={{ marginTop: 20, fontSize: 12 }}>
        URL: {typeof window !== 'undefined' ? window.location.href : '(server)'}
      </p>
    </div>
  );
}
