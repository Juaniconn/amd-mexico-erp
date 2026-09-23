import { Logger } from '@nestjs/common';

export type MarketHit = {
  query: string;
  snippet: string;
  pricesFound: number[];
};

const log = new Logger('MarketResearch');

/**
 * Lightweight market research via DuckDuckGo HTML (no API key).
 * Best-effort — failures fall back to price book silently.
 */
export async function researchMaterialPrices(
  queries: string[],
  timeoutMs = 8000,
): Promise<MarketHit[]> {
  const hits: MarketHit[] = [];
  for (const query of queries.slice(0, 2)) {
    try {
      const url =
        'https://html.duckduckgo.com/html/?q=' + encodeURIComponent(query);
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), timeoutMs);
      const res = await fetch(url, {
        signal: ctrl.signal,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (compatible; AMD-ERP-CotizacionBot/1.0; +https://amd-mexico.com)',
          Accept: 'text/html',
        },
      });
      clearTimeout(t);
      if (!res.ok) {
        log.warn(`DDG ${res.status} for ${query}`);
        continue;
      }
      const html = await res.text();
      const snippet = stripHtml(html).slice(0, 600);
      const pricesFound = extractPrices(snippet);
      hits.push({ query, snippet: snippet.slice(0, 240), pricesFound });
    } catch (e: any) {
      log.warn(`research fail (${query}): ${e?.message || e}`);
    }
  }
  return hits;
}

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Pull plausible USD/$/lb style numbers from text */
export function extractPrices(text: string): number[] {
  const out: number[] = [];
  const re =
    /(?:USD|US\$|\$)\s*([0-9]{1,4}(?:\.[0-9]{1,2})?)|(?:([0-9]{1,4}(?:\.[0-9]{1,2})?)\s*(?:USD|\/lb|\/kg))/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    const n = parseFloat(m[1] || m[2]);
    if (Number.isFinite(n) && n >= 0.5 && n <= 500) out.push(n);
  }
  return [...new Set(out)].slice(0, 8);
}

/**
 * Map scraped $/lb-ish numbers into a factor vs baseline material cost.
 * Conservative: clamp 0.75–1.4
 */
export function marketFactorFromHits(
  hits: MarketHit[],
  baselineMaterialUsd: number,
): { factor: number; note: string } {
  const all = hits.flatMap((h) => h.pricesFound);
  if (all.length === 0) {
    return { factor: 1, note: 'sin precio web; baseline CJ' };
  }
  const avg = all.reduce((a, b) => a + b, 0) / all.length;
  // Treat scraped number as relative signal vs ~$5/lb mid market
  const mid = 5;
  let factor = avg / mid;
  factor = Math.min(1.4, Math.max(0.75, factor));
  // Also nudge if far from baseline part material
  void baselineMaterialUsd;
  const sources = hits.map((h) => h.query).join('; ');
  return {
    factor,
    note: `web≈$${avg.toFixed(2)} avg (${all.length} hits) factor×${factor.toFixed(2)} [${sources}]`,
  };
}
