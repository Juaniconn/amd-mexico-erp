import { Logger } from '@nestjs/common';

const log = new Logger('LlmPricing');

export type LlmLineHint = {
  numeroParte: string;
  precioUnitarioUsd: number;
  rationale: string;
};

/**
 * Optional OpenAI refinement. Requires OPENAI_API_KEY in env.
 * Returns null if unset or call fails (caller keeps heuristic prices).
 */
export async function refinePricesWithLlm(opts: {
  moneda: string;
  lines: Array<{
    numeroParte: string;
    material: string;
    qty: number;
    heuristicUsd: number;
    pdfNote?: string;
  }>;
  marketNotes: string;
}): Promise<LlmLineHint[] | null> {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) return null;

  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  const prompt = {
    role: 'system',
    content:
      'Eres un cotizador de manufactura CNC en Ciudad Juárez, México. ' +
      'Devuelve SOLO JSON válido: {"lines":[{"numeroParte":"...","precioUnitarioUsd":number,"rationale":"..."}]}. ' +
      'Precios en USD por pieza, realistas para taller maquila CJ. No inventes dims ausentes.',
  };
  const user = {
    role: 'user',
    content: JSON.stringify(
      {
        task: 'Ajusta precios unitarios heurísticos con contexto de mercado CJ y notas de plano',
        marketNotes: opts.marketNotes,
        lines: opts.lines,
      },
      null,
      2,
    ),
  };

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        response_format: { type: 'json_object' },
        messages: [prompt, user],
      }),
    });
    if (!res.ok) {
      const t = await res.text();
      log.warn(`OpenAI HTTP ${res.status}: ${t.slice(0, 200)}`);
      return null;
    }
    const data = (await res.json()) as any;
    const content = data?.choices?.[0]?.message?.content;
    if (!content) return null;
    const parsed = JSON.parse(content);
    const lines = Array.isArray(parsed?.lines) ? parsed.lines : [];
    return lines
      .filter(
        (l: any) =>
          l?.numeroParte &&
          Number.isFinite(Number(l.precioUnitarioUsd)) &&
          Number(l.precioUnitarioUsd) > 0,
      )
      .map((l: any) => ({
        numeroParte: String(l.numeroParte),
        precioUnitarioUsd: Number(l.precioUnitarioUsd),
        rationale: String(l.rationale || 'llm'),
      }));
  } catch (e: any) {
    log.warn(`OpenAI fail: ${e?.message || e}`);
    return null;
  }
}
