export type Tone = "ink" | "copper" | "moss";
export type Kind =
  | "circle"
  | "square"
  | "triangle"
  | "diamond"
  | "plus"
  | "ring"
  | "bar"
  | "dot";

export type Mark = {
  kind: Kind;
  tone: Tone;
  cx: number;
  cy: number;
  s: number;
  rot?: number;
};

export function center(kind: Kind, tone: Tone, s = 36, rot = 0): Mark {
  return { kind, tone, cx: 50, cy: 50, s, rot };
}

export function dots(n: number, tone: Tone = "ink", s = 14): Mark[] {
  const maps: Record<number, [number, number][]> = {
    1: [[50, 50]],
    2: [[36, 50], [64, 50]],
    3: [[50, 32], [34, 64], [66, 64]],
    4: [
      [34, 34],
      [66, 34],
      [34, 66],
      [66, 66],
    ],
    5: [
      [50, 26],
      [30, 46],
      [70, 46],
      [38, 72],
      [62, 72],
    ],
    6: [
      [34, 30],
      [66, 30],
      [34, 52],
      [66, 52],
      [34, 74],
      [66, 74],
    ],
  };
  return (maps[n] ?? maps[1]).map(([cx, cy]) => ({ kind: "dot", tone, cx, cy, s }));
}

export function sideBySide(a: Mark, b: Mark): Mark[] {
  return [
    { ...a, cx: 34, cy: 50, s: Math.round(a.s * 0.72) },
    { ...b, cx: 68, cy: 50, s: Math.round(b.s * 0.72) },
  ];
}

export function barWithDots(rot: number, n: number): Mark[] {
  const xs = n === 1 ? [50] : n === 2 ? [38, 62] : [26, 50, 74];
  return [
    { kind: "bar", tone: "ink", cx: 50, cy: 40, s: 46, rot },
    ...xs.map((cx) => ({ kind: "dot" as const, tone: "copper" as const, cx, cy: 76, s: 12 })),
  ];
}

export type Choice = {
  id: string;
  prompt: string;
  options: string[];
  answer: number;
  points: number;
};

export const SIMILITUDES: Choice[] = [
  {
    id: "s1",
    prompt: "Cuillère et fourchette",
    options: [
      "On les range dans un tiroir",
      "Elles servent à manger",
      "Elles sont souvent en métal",
      "On les lave après le repas",
    ],
    answer: 1,
    points: 1,
  },
  {
    id: "s2",
    prompt: "Poumon et branchie",
    options: [
      "Ils sont dans le ventre",
      "Ce sont des muscles",
      "Ils servent à respirer",
      "Ils filtrent le sang",
    ],
    answer: 2,
    points: 1,
  },
  {
    id: "s3",
    prompt: "Carte et maquette",
    options: [
      "Elles tiennent dans la main",
      "Ce sont des représentations d'un lieu",
      "Elles sont en papier",
      "Elles servent à voyager",
    ],
    answer: 1,
    points: 1,
  },
  {
    id: "s4",
    prompt: "Thermomètre et balance",
    options: [
      "On les trouve dans une cuisine",
      "Ils donnent un chiffre",
      "Ce sont des instruments de mesure",
      "Ils sont en verre",
    ],
    answer: 2,
    points: 2,
  },
  {
    id: "s5",
    prompt: "Dette et serment",
    options: [
      "Ce sont des engagements",
      "Ce sont des sommes d'argent",
      "Ce sont des émotions",
      "Ce sont des documents officiels",
    ],
    answer: 0,
    points: 2,
  },
  {
    id: "s6",
    prompt: "Vaccin et rempart",
    options: [
      "Ils concernent la médecine",
      "Ils sont temporaires",
      "Ils sont solides",
      "Ils protègent",
    ],
    answer: 3,
    points: 2,
  },
  {
    id: "s7",
    prompt: "Index et sommaire",
    options: [
      "Ils sont en fin d'ouvrage",
      "Ils listent uniquement des noms",
      "Ils aident à retrouver une information",
      "Ce sont des pages de garde",
    ],
    answer: 2,
    points: 2,
  },
  {
    id: "s8",
    prompt: "Écho et reflet",
    options: [
      "Un phénomène seulement sonore",
      "Le retour de quelque chose qui a été émis",
      "Une illusion",
      "Quelque chose de faible",
    ],
    answer: 1,
    points: 3,
  },
  {
    id: "s9",
    prompt: "Verdict et diagnostic",
    options: [
      "Une punition",
      "Une décision de justice",
      "Un avis seulement médical",
      "Une conclusion après examen",
    ],
    answer: 3,
    points: 3,
  },
  {
    id: "s10",
    prompt: "Graine et hypothèse",
    options: [
      "Un point de départ qui peut se développer",
      "Quelque chose de petit",
      "Une idée déjà scientifique",
      "Un élément naturel",
    ],
    answer: 0,
    points: 3,
  },
];

export const SENS: Choice[] = [
  {
    id: "v1",
    prompt: "Lacune",
    options: ["Un liquide", "Un manque", "Une fête", "Un outil"],
    answer: 1,
    points: 1,
  },
  {
    id: "v2",
    prompt: "Équivoque",
    options: [
      "Très clair",
      "Qui peut s'entendre de deux façons",
      "Qui a été prouvé",
      "Qui concerne les chevaux",
    ],
    answer: 1,
    points: 1,
  },
  {
    id: "v3",
    prompt: "Taciturne",
    options: ["Qui parle très peu", "Qui tourne en rond", "Qui est en retard", "Qui évite les foules"],
    answer: 0,
    points: 1,
  },
  {
    id: "v4",
    prompt: "Abroger",
    options: [
      "Répéter une loi",
      "Signer un accord",
      "Annuler officiellement une règle",
      "Rendre plus sévère",
    ],
    answer: 2,
    points: 2,
  },
  {
    id: "v5",
    prompt: "Prémisse",
    options: [
      "La conclusion d'un raisonnement",
      "Une promesse",
      "Une proposition dont on part",
      "Une erreur de logique",
    ],
    answer: 2,
    points: 2,
  },
  {
    id: "v6",
    prompt: "Allégeance",
    options: ["Une alliance militaire", "Un allègement de peine", "Une fidélité due", "Une allée d'arbres"],
    answer: 2,
    points: 2,
  },
  {
    id: "v7",
    prompt: "Contingent",
    options: [
      "Obligatoire dans tous les cas",
      "Très nombreux",
      "Venu d'un autre pays",
      "Qui dépend des circonstances",
    ],
    answer: 3,
    points: 2,
  },
  {
    id: "v8",
    prompt: "Dilatoire",
    options: ["Qui dilue un liquide", "Qui vise à gagner du temps", "Qui arrive trop tard", "Qui est généreux"],
    answer: 1,
    points: 3,
  },
];

export type CalcItem = {
  id: string;
  text: string;
  answer: number;
};

export const CALCULS: CalcItem[] = [
  { id: "c1", text: "17 + 28", answer: 45 },
  { id: "c2", text: "64 − 19", answer: 45 },
  { id: "c3", text: "8 × 7", answer: 56 },
  { id: "c4", text: "96 ÷ 4", answer: 24 },
  { id: "c5", text: "15 × 3 + 8", answer: 53 },
  { id: "c6", text: "120 − 46 + 9", answer: 83 },
  { id: "c7", text: "14 × 6 − 18", answer: 66 },
  { id: "c8", text: "(45 + 15) ÷ 4", answer: 15 },
];

export type MatrixItem = {
  id: string;
  points: number;
  cells: (Mark[] | null)[];
  options: Mark[][];
  answer: number;
};

const circle = center("circle", "ink", 34);
const square = center("square", "copper", 32);
const triangle = center("triangle", "ink", 36);
const diamond = center("diamond", "copper", 34);
const ring = center("ring", "ink", 34);
const plus = center("plus", "copper", 32);

function shaped(kind: Kind, tone: Tone): Mark[] {
  return [center(kind, tone, 34)];
}

export const MATRICES: MatrixItem[] = [
  {
    id: "m1",
    points: 1,
    cells: [
      [center("circle", "ink", 32)],
      [center("square", "ink", 30)],
      [center("triangle", "ink", 34)],
      [center("circle", "ink", 32)],
      [center("square", "ink", 30)],
      [center("triangle", "ink", 34)],
      [center("circle", "ink", 32)],
      [center("square", "ink", 30)],
      null,
    ],
    options: [
      [center("circle", "ink", 32)],
      [center("square", "ink", 30)],
      [center("diamond", "ink", 32)],
      [center("triangle", "ink", 34)],
    ],
    answer: 3,
  },
  {
    id: "m2",
    points: 1,
    cells: [dots(1), dots(2), dots(3), dots(1), dots(2), dots(3), dots(1), dots(2), null],
    options: [dots(2), dots(4), dots(3), dots(1)],
    answer: 2,
  },
  {
    id: "m3",
    points: 2,
    cells: [
      shaped("circle", "ink"),
      shaped("circle", "copper"),
      shaped("circle", "moss"),
      shaped("square", "ink"),
      shaped("square", "copper"),
      shaped("square", "moss"),
      shaped("triangle", "ink"),
      shaped("triangle", "copper"),
      null,
    ],
    options: [
      shaped("triangle", "ink"),
      shaped("square", "moss"),
      shaped("triangle", "moss"),
      shaped("circle", "moss"),
    ],
    answer: 2,
  },
  {
    id: "m4",
    points: 2,
    cells: [
      [center("bar", "ink", 48, 0)],
      [center("bar", "ink", 48, 45)],
      [center("bar", "ink", 48, 90)],
      [center("bar", "ink", 48, 0)],
      [center("bar", "ink", 48, 45)],
      [center("bar", "ink", 48, 90)],
      [center("bar", "ink", 48, 0)],
      [center("bar", "ink", 48, 45)],
      null,
    ],
    options: [
      [center("bar", "ink", 48, 0)],
      [center("bar", "ink", 48, 90)],
      [center("bar", "ink", 48, 45)],
      [center("bar", "ink", 48, 135)],
    ],
    answer: 1,
  },
  {
    id: "m5",
    points: 2,
    cells: [
      [circle],
      [square],
      sideBySide(circle, square),
      [triangle],
      [diamond],
      sideBySide(triangle, diamond),
      [ring],
      [plus],
      null,
    ],
    options: [[ring], [plus], sideBySide(triangle, plus), sideBySide(ring, plus)],
    answer: 3,
  },
  {
    id: "m6",
    points: 2,
    cells: [
      shaped("circle", "ink"),
      shaped("square", "ink"),
      shaped("triangle", "ink"),
      shaped("square", "copper"),
      shaped("triangle", "copper"),
      shaped("circle", "copper"),
      shaped("triangle", "moss"),
      shaped("circle", "moss"),
      null,
    ],
    options: [
      shaped("square", "ink"),
      shaped("circle", "moss"),
      shaped("triangle", "moss"),
      shaped("square", "moss"),
    ],
    answer: 3,
  },
  {
    id: "m7",
    points: 3,
    cells: [
      barWithDots(0, 1),
      barWithDots(0, 2),
      barWithDots(0, 3),
      barWithDots(45, 1),
      barWithDots(45, 2),
      barWithDots(45, 3),
      barWithDots(90, 1),
      barWithDots(90, 2),
      null,
    ],
    options: [barWithDots(90, 2), barWithDots(45, 3), barWithDots(90, 3), barWithDots(135, 3)],
    answer: 2,
  },
  {
    id: "m8",
    points: 3,
    cells: [dots(1), dots(2), dots(3), dots(2), dots(3), dots(4), dots(3), dots(4), null],
    options: [dots(4), dots(6), dots(3), dots(5)],
    answer: 3,
  },
];

export type SuiteItem = {
  id: string;
  points: number;
  frames: Mark[][];
  options: Mark[][];
  answer: number;
};

export const SUITES: SuiteItem[] = [
  {
    id: "q1",
    points: 1,
    frames: [dots(1), dots(2), dots(3), dots(4)],
    options: [dots(3), dots(6), dots(5), dots(4)],
    answer: 2,
  },
  {
    id: "q2",
    points: 1,
    frames: [
      [center("bar", "ink", 46, 0)],
      [center("bar", "ink", 46, 45)],
      [center("bar", "ink", 46, 90)],
      [center("bar", "ink", 46, 135)],
    ],
    options: [
      [center("bar", "ink", 46, 90)],
      [center("bar", "ink", 46, 180)],
      [center("bar", "ink", 46, 135)],
      [center("bar", "ink", 46, 0)],
    ],
    answer: 1,
  },
  {
    id: "q3",
    points: 1,
    frames: [
      [center("circle", "ink", 32)],
      [center("square", "ink", 30)],
      [center("triangle", "ink", 34)],
      [center("circle", "ink", 32)],
    ],
    options: [
      [center("triangle", "ink", 34)],
      [center("diamond", "ink", 32)],
      [center("square", "ink", 30)],
      [center("circle", "ink", 32)],
    ],
    answer: 2,
  },
  {
    id: "q4",
    points: 2,
    // Steps of 10 units: smaller steps cannot be told apart at 72 px.
    frames: [
      [center("square", "ink", 14)],
      [center("square", "ink", 24)],
      [center("square", "ink", 34)],
      [center("square", "ink", 44)],
    ],
    options: [
      [center("square", "ink", 44)],
      [center("square", "ink", 34)],
      [center("circle", "ink", 54)],
      [center("square", "ink", 54)],
    ],
    answer: 3,
  },
  {
    id: "q5",
    points: 2,
    frames: [
      [center("circle", "ink", 32)],
      [center("circle", "copper", 32)],
      [center("circle", "moss", 32)],
      [center("circle", "ink", 32)],
    ],
    options: [
      [center("circle", "moss", 32)],
      [center("square", "copper", 30)],
      [center("circle", "copper", 32)],
      [center("circle", "ink", 32)],
    ],
    answer: 2,
  },
  {
    id: "q6",
    points: 3,
    frames: [
      [
        { kind: "triangle", tone: "ink", cx: 40, cy: 46, s: 32, rot: 0 },
        { kind: "dot", tone: "copper", cx: 22, cy: 78, s: 12 },
      ],
      [
        { kind: "triangle", tone: "ink", cx: 40, cy: 46, s: 32, rot: 90 },
        { kind: "dot", tone: "copper", cx: 38, cy: 78, s: 12 },
      ],
      [
        { kind: "triangle", tone: "ink", cx: 40, cy: 46, s: 32, rot: 180 },
        { kind: "dot", tone: "copper", cx: 54, cy: 78, s: 12 },
      ],
      [
        { kind: "triangle", tone: "ink", cx: 40, cy: 46, s: 32, rot: 270 },
        { kind: "dot", tone: "copper", cx: 70, cy: 78, s: 12 },
      ],
    ],
    options: [
      [
        { kind: "triangle", tone: "ink", cx: 40, cy: 46, s: 32, rot: 270 },
        { kind: "dot", tone: "copper", cx: 86, cy: 78, s: 12 },
      ],
      [
        { kind: "triangle", tone: "ink", cx: 40, cy: 46, s: 32, rot: 0 },
        { kind: "dot", tone: "copper", cx: 70, cy: 78, s: 12 },
      ],
      [
        { kind: "triangle", tone: "ink", cx: 40, cy: 46, s: 32, rot: 0 },
        { kind: "dot", tone: "copper", cx: 86, cy: 78, s: 12 },
      ],
      [
        { kind: "triangle", tone: "ink", cx: 40, cy: 46, s: 32, rot: 90 },
        { kind: "dot", tone: "copper", cx: 86, cy: 78, s: 12 },
      ],
    ],
    answer: 2,
  },
];

export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function rand() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffleOptions<T>(options: T[], answer: number, rng: () => number) {
  const order = options.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = order[i];
    order[i] = order[j] ?? i;
    order[j] = tmp ?? j;
  }
  return {
    options: order.map((i) => options[i] as T),
    answer: order.indexOf(answer),
  };
}
