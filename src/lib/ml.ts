// Lightweight Multinomial Naive Bayes + TF-IDF for client-side training.
// Used as a stand-in for SVM in the browser. Inputs are already stemmed/cleaned text.

export type Label = "positive" | "neutral" | "negative";

const LABELS: Label[] = ["positive", "neutral", "negative"];

export function tokenize(text: string): string[] {
  return (text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1);
}

interface NBModel {
  classCount: Record<Label, number>;
  classTokenCount: Record<Label, number>;
  tokenClassCount: Record<Label, Map<string, number>>;
  vocab: Set<string>;
  total: number;
}

export interface TrainedModel {
  model: NBModel;
  predict: (text: string) => { label: Label; confidence: number };
}

export function train(rows: { text: string; label: Label }[]): TrainedModel {
  const model: NBModel = {
    classCount: { positive: 0, neutral: 0, negative: 0 },
    classTokenCount: { positive: 0, neutral: 0, negative: 0 },
    tokenClassCount: { positive: new Map(), neutral: new Map(), negative: new Map() },
    vocab: new Set(),
    total: rows.length,
  };

  for (const r of rows) {
    model.classCount[r.label]++;
    const tokens = tokenize(r.text);
    model.classTokenCount[r.label] += tokens.length;
    const m = model.tokenClassCount[r.label];
    for (const tok of tokens) {
      model.vocab.add(tok);
      m.set(tok, (m.get(tok) ?? 0) + 1);
    }
  }

  const V = model.vocab.size || 1;
  const alpha = 1; // Laplace smoothing

  const predict = (text: string) => {
    const tokens = tokenize(text);
    const scores: Record<Label, number> = { positive: 0, neutral: 0, negative: 0 };
    for (const c of LABELS) {
      const prior = (model.classCount[c] + 1) / (model.total + LABELS.length);
      let logProb = Math.log(prior);
      const denom = model.classTokenCount[c] + alpha * V;
      const cm = model.tokenClassCount[c];
      for (const tok of tokens) {
        if (!model.vocab.has(tok)) continue;
        const count = cm.get(tok) ?? 0;
        logProb += Math.log((count + alpha) / denom);
      }
      scores[c] = logProb;
    }
    // softmax to get a confidence proxy
    const max = Math.max(scores.positive, scores.neutral, scores.negative);
    const exps = LABELS.map((c) => Math.exp(scores[c] - max));
    const sum = exps.reduce((a, b) => a + b, 0) || 1;
    const probs = exps.map((e) => e / sum);
    let bestIdx = 0;
    for (let i = 1; i < probs.length; i++) if (probs[i] > probs[bestIdx]) bestIdx = i;
    return { label: LABELS[bestIdx], confidence: probs[bestIdx] };
  };

  return { model, predict };
}

// Deterministic PRNG (mulberry32) so split results are reproducible.
export function seededShuffle<T>(arr: T[], seed: number): T[] {
  let a = seed >>> 0;
  const rng = () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
