export type RawParts = {
  sim: number;
  sens: number;
  mat: number;
  suite: number;
  fwd: number;
  bwd: number;
  calc: number;
  scan: number;
  code: number;
};

export type Profile = {
  langage: number;
  formes: number;
  memoire: number;
  rythme: number;
  global: number;
};

function toIndex(raw: number, mean: number, sd: number): number {
  const z = (raw - mean) / sd;
  return Math.max(55, Math.min(145, Math.round(100 + 15 * z)));
}

export function profileFrom(raw: RawParts): Profile {
  const langage = toIndex(raw.sim + raw.sens, 17, 5.5);
  const formes = toIndex(raw.mat + raw.suite, 13, 4.5);
  const memoire = toIndex(raw.fwd * 2 + raw.bwd * 3 + raw.calc, 34, 8);
  const rythme = toIndex(raw.scan + raw.code, 34, 12);
  const global = Math.round((langage + formes + memoire + rythme) / 4);
  return { langage, formes, memoire, rythme, global };
}

export function bandKey(n: number): "veryHigh" | "high" | "above" | "average" | "below" | "low" {
  if (n >= 130) return "veryHigh";
  if (n >= 120) return "high";
  if (n >= 110) return "above";
  if (n >= 90) return "average";
  if (n >= 80) return "below";
  return "low";
}

export function band(n: number): string {
  const labels = {
    veryHigh: "Très élevé",
    high: "Élevé",
    above: "Au-dessus de la moyenne",
    average: "Dans la moyenne",
    below: "En dessous de la moyenne",
    low: "Bas sur cet outil",
  };
  return labels[bandKey(n)];
}

export function percentile(index: number): number {
  const z = (index - 100) / 15;
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp((-z * z) / 2);
  const p =
    d *
    t *
    (0.3193815 +
      t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  const cdf = z > 0 ? 1 - p : p;
  return Math.round(Math.min(99.9, Math.max(0.1, cdf * 100)) * 10) / 10;
}
