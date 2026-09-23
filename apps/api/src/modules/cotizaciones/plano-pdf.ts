import { Logger } from '@nestjs/common';
import { execFile } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { randomUUID } from 'crypto';

const execFileAsync = promisify(execFile);
const log = new Logger('PlanoPdf');

export type PlanoFeatures = {
  text: string;
  dimsIn: number[];
  /** Approximate envelope volume in³ from top 3 dims (or 2×thickness heuristic) */
  volumeIn3: number | null;
  complexity: 'LOW' | 'MED' | 'HIGH';
};

/** Extract text via pdftotext (poppler) with pdf-parse fallback. */
export async function extractPdfText(buffer: Buffer): Promise<string> {
  const tmp = path.join(os.tmpdir(), `amd-plano-${randomUUID()}.pdf`);
  try {
    fs.writeFileSync(tmp, buffer);
    try {
      const { stdout } = await execFileAsync(
        'pdftotext',
        ['-layout', '-enc', 'UTF-8', tmp, '-'],
        { maxBuffer: 5 * 1024 * 1024 },
      );
      if (stdout?.trim()) return stdout;
    } catch (e: any) {
      log.warn(`pdftotext: ${e?.message || e}`);
    }
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const pdfParse = require('pdf-parse');
      const parsed = await pdfParse(buffer);
      return String(parsed?.text || '');
    } catch (e: any) {
      log.warn(`pdf-parse: ${e?.message || e}`);
      return '';
    }
  } finally {
    try {
      fs.unlinkSync(tmp);
    } catch {
      /* ignore */
    }
  }
}

/**
 * Pull plausible linear dimensions (inches) from drawing text.
 * Filters out zeros and absurd values.
 */
export function parseDimsInches(text: string): number[] {
  const dims: number[] = [];
  const re = /(?<![A-Za-z0-9.])(\d{1,2}\.\d{2,4}|\d\.\d{1,3})(?![A-Za-z0-9.%])/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    const n = parseFloat(m[1]);
    if (n >= 0.05 && n <= 48) dims.push(n);
  }
  // unique sorted desc
  return [...new Set(dims.map((d) => Math.round(d * 1000) / 1000))].sort(
    (a, b) => b - a,
  );
}

export function featuresFromText(text: string): PlanoFeatures {
  const dimsIn = parseDimsInches(text);
  let volumeIn3: number | null = null;
  if (dimsIn.length >= 3) {
    volumeIn3 = dimsIn[0] * dimsIn[1] * dimsIn[2];
  } else if (dimsIn.length === 2) {
    // assume plate thickness ~0.25 if missing
    volumeIn3 = dimsIn[0] * dimsIn[1] * 0.25;
  }
  const holeHints = (text.match(/\b(Ø|DIA|HOLE|THRU|TAP)\b/gi) || []).length;
  const complexity: PlanoFeatures['complexity'] =
    holeHints > 8 || dimsIn.length > 12
      ? 'HIGH'
      : holeHints > 3 || dimsIn.length > 6
        ? 'MED'
        : 'LOW';
  return {
    text: text.slice(0, 4000),
    dimsIn: dimsIn.slice(0, 12),
    volumeIn3,
    complexity,
  };
}

/** Scale material $ and cycle minutes from envelope volume + complexity */
export function applyPlanoToEstimate(opts: {
  materialPerPartUsd: number;
  cycleMin: number;
  features: PlanoFeatures | null;
}): { materialPerPartUsd: number; cycleMin: number; note: string } {
  if (!opts.features || !opts.features.volumeIn3) {
    return {
      materialPerPartUsd: opts.materialPerPartUsd,
      cycleMin: opts.cycleMin,
      note: 'sin dims PDF',
    };
  }
  const v = opts.features.volumeIn3;
  // Reference "typical" small part ~2 in³
  const volFactor = Math.min(4, Math.max(0.5, v / 2));
  const cx =
    opts.features.complexity === 'HIGH'
      ? 1.35
      : opts.features.complexity === 'MED'
        ? 1.15
        : 1;
  const materialPerPartUsd =
    Math.round(opts.materialPerPartUsd * volFactor * 100) / 100;
  const cycleMin = Math.round(opts.cycleMin * volFactor * cx);
  return {
    materialPerPartUsd,
    cycleMin,
    note: `PDF vol≈${v.toFixed(2)}in³ dims=[${opts.features.dimsIn.slice(0, 4).join(',')}] ${opts.features.complexity}`,
  };
}
