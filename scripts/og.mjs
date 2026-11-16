import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(join(root, "package.json"));
const satori = (await import(join(root, "node_modules/satori/dist/index.js"))).default;
const { Resvg } = require("@resvg/resvg-js");
const NM = join(root, "node_modules/@fontsource") + "/";
const C = {
  paper: "#F4F2EC",
  sheet: "#FFFFFF",
  ink: "#16181D",
  muted: "#5D626C",
  line: "#DCD8CF",
  needle: "#D2451E",
  blue: "#2C5DA8",
};
const fonts = [
  {
    name: "Instrument Serif",
    weight: 400,
    style: "normal",
    data: readFileSync(NM + "instrument-serif/files/instrument-serif-latin-400-normal.woff"),
  },
  {
    name: "Geist Mono",
    weight: 500,
    style: "normal",
    data: readFileSync(NM + "geist-mono/files/geist-mono-latin-500-normal.woff"),
  },
];
// shapes, same geometry as glyphs.tsx
function shape(m) {
  const f = C[m.tone],
    r = `rotate(${m.rot ?? 0} ${m.cx} ${m.cy})`,
    s = m.s;
  switch (m.kind) {
    case "circle":
      return `<circle cx="${m.cx}" cy="${m.cy}" r="${s / 2}" fill="${f}"/>`;
    case "ring":
      return `<circle cx="${m.cx}" cy="${m.cy}" r="${s / 2}" fill="none" stroke="${f}" stroke-width="5"/>`;
    case "square":
      return `<rect x="${m.cx - s / 2}" y="${m.cy - s / 2}" width="${s}" height="${s}" fill="${f}" transform="${r}"/>`;
    case "diamond":
      return `<polygon points="${m.cx},${m.cy - s / 2} ${m.cx + s / 2},${m.cy} ${m.cx},${m.cy + s / 2} ${m.cx - s / 2},${m.cy}" fill="${f}" transform="${r}"/>`;
    case "triangle":
      return `<polygon points="${m.cx},${m.cy - s / 2} ${m.cx - s / 2},${m.cy + s / 2} ${m.cx + s / 2},${m.cy + s / 2}" fill="${f}" transform="${r}"/>`;
    case "plus":
      return `<g transform="${r}" fill="${f}"><rect x="${m.cx - s / 2}" y="${m.cy - s / 8}" width="${s}" height="${s / 4}" rx="1"/><rect x="${m.cx - s / 8}" y="${m.cy - s / 2}" width="${s / 4}" height="${s}" rx="1"/></g>`;
    case "bar":
      return `<rect x="${m.cx - s / 2}" y="${m.cy - 5}" width="${s}" height="10" rx="3" fill="${f}" transform="${r}"/>`;
    case "dot":
      return `<circle cx="${m.cx}" cy="${m.cy}" r="${s / 2}" fill="${f}"/>`;
  }
}
const dotsMap = {
  1: [[50, 50]],
  2: [
    [36, 50],
    [64, 50],
  ],
  3: [
    [50, 32],
    [34, 64],
    [66, 64],
  ],
  4: [
    [34, 34],
    [66, 34],
    [34, 66],
    [66, 66],
  ],
};
const dots = (n, tone = "ink") =>
  dotsMap[n].map(([cx, cy]) => ({ kind: "dot", tone, cx, cy, s: 14 }));
const c = (kind, tone, s = 36, rot = 0) => [{ kind, tone, cx: 50, cy: 50, s, rot }];
const T = 132,
  G = 16;
// 3 rows x 4 cols: each row a series; last tile of row 2 is the answer (needle)
const rows = [
  [
    c("bar", "ink", 46, 0),
    c("bar", "ink", 46, 30),
    c("bar", "ink", 46, 60),
    c("bar", "ink", 46, 90),
  ],
  [dots(1, "blue"), dots(2, "blue"), dots(3, "blue"), dots(4, "needle")],
  [c("ring", "ink", 22), c("ring", "ink", 34), c("ring", "ink", 46), c("ring", "ink", 58)],
];
const ANS = [1, 3];
const tiles = rows
  .flatMap((row, ri) =>
    row.map((m, ci) => {
      const isAns = ri === ANS[0] && ci === ANS[1];
      const x = ci * (T + G),
        y = ri * (T + G),
        k = T / 100;
      const grads = `<g stroke="${C.line}" stroke-width="2" fill="none"><path d="M50 0v6"/><path d="M50 94v6"/><path d="M0 50h6"/><path d="M94 50h6"/></g>`;
      const bw = isAns ? 2.5 : 1.5,
        bc = isAns ? C.ink : C.line;
      return `<g transform="translate(${x} ${y})"><rect x="${bw / 2}" y="${bw / 2}" width="${T - bw}" height="${T - bw}" rx="14" fill="${C.sheet}" stroke="${bc}" stroke-width="${bw}"/><g transform="scale(${k})">${grads}${m.map(shape).join("")}</g></g>`;
    }),
  )
  .join("");
const GW = 4 * T + 3 * G,
  GH = 3 * T + 2 * G;
const card = {
  type: "div",
  props: {
    style: {
      width: 1200,
      height: 630,
      display: "flex",
      position: "relative",
      backgroundColor: C.paper,
    },
    children: [
      {
        type: "div",
        props: {
          style: {
            position: "absolute",
            left: 84,
            top: 236,
            display: "flex",
            flexDirection: "column",
          },
          children: [
            {
              type: "div",
              props: {
                style: {
                  fontFamily: "Instrument Serif",
                  fontSize: 132,
                  lineHeight: 0.9,
                  letterSpacing: -1.5,
                  color: C.ink,
                },
                children: "Cadran",
              },
            },
            {
              type: "div",
              props: {
                style: {
                  marginTop: 26,
                  fontFamily: "Geist Mono",
                  fontWeight: 500,
                  fontSize: 20,
                  color: C.muted,
                },
                children: "cadran.accura.dev",
              },
            },
          ],
        },
      },
    ],
  },
};
let svg = await satori(card, { width: 1200, height: 630, fonts });
svg = svg.replace(
  /<\/svg>$/,
  `<g transform="translate(${1200 - 84 - GW} ${(630 - GH) / 2})">${tiles}</g></svg>`,
);
const png = new Resvg(svg, { fitTo: { mode: "width", value: 1200 } }).render().asPng();
const out = join(root, "public/og.png");
writeFileSync(out, png);
console.log(`public/og.png ${(png.length / 1024).toFixed(1)} KB`);
