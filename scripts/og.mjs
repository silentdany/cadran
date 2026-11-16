#!/usr/bin/env node
/**
 * Renders the share image public/og.png (1200x630).
 *
 * Language-neutral layout from the art direction: paper background, a large
 * flat dial (sheet face, 60 ticks, four longer marks on the axes, one needle)
 * on the left, the "Cadran" wordmark and the domain as a quiet caption on the
 * right. No slogan, no area names, no score, no gradient.
 *
 * Satori lays the page out as SVG, resvg turns it into PNG. Both are dev
 * dependencies, so run `npm run og` and commit the PNG when the layout changes.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const C = {
  paper: "#F4F2EC",
  sheet: "#FFFFFF",
  ink: "#16181D",
  muted: "#5D626C",
  line: "#DCD8CF",
  needle: "#D2451E",
};

function font(pkg, file) {
  return readFileSync(join(root, "node_modules/@fontsource", pkg, "files", file));
}

const fonts = [
  {
    name: "Instrument Serif",
    weight: 400,
    style: "normal",
    data: font("instrument-serif", "instrument-serif-latin-400-normal.woff"),
  },
  {
    name: "Geist Mono",
    weight: 500,
    style: "normal",
    data: font("geist-mono", "geist-mono-latin-500-normal.woff"),
  },
];

// Tiny hyperscript helper so the layout reads like JSX without a build step.
const h = (type, style, children) => ({ type, props: { style, children } });

function polar(c, r, deg) {
  const a = (deg * Math.PI) / 180;
  return [c + r * Math.sin(a), c - r * Math.cos(a)];
}

/** The dial (no text): 510 px, sheet face, 60 ticks, needle at 72°, centre cap. */
function dialSvg() {
  const size = 510;
  const c = size / 2;
  const r = size / 2 - 8;
  const ticks = [];
  for (let i = 0; i < 60; i++) {
    const cardinal = i % 15 === 0;
    const hour = i % 5 === 0;
    const inner = cardinal ? r - 36 : hour ? r - 24 : r - 14;
    const outer = r - 6;
    const width = cardinal ? 3.2 : hour ? 2.2 : 1.5;
    const color = hour ? C.ink : C.line;
    const [x1, y1] = polar(c, inner, i * 6);
    const [x2, y2] = polar(c, outer, i * 6);
    ticks.push(
      `<line x1="${x1.toFixed(2)}" y1="${y1.toFixed(2)}" x2="${x2.toFixed(2)}" y2="${y2.toFixed(2)}" stroke="${color}" stroke-width="${width}" stroke-linecap="square"/>`,
    );
  }
  const tip = r - 42;
  const tail = 34;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  <circle cx="${c}" cy="${c}" r="${r}" fill="${C.sheet}" stroke="${C.ink}" stroke-width="3"/>
  ${ticks.join("")}
  <g transform="rotate(72 ${c} ${c})">
    <polygon points="${c},${c - tip} ${c + 5.4},${c + 10} ${c + 3},${c + tail - 6} ${c},${c + tail} ${c - 3},${c + tail - 6} ${c - 5.4},${c + 10}" fill="${C.needle}"/>
  </g>
  <circle cx="${c}" cy="${c}" r="11" fill="${C.ink}"/>
</svg>`;
}

function card() {
  const size = 510;
  const dial = "data:image/svg+xml;base64," + Buffer.from(dialSvg()).toString("base64");

  return h(
    "div",
    { width: 1200, height: 630, display: "flex", position: "relative", backgroundColor: C.paper },
    [
      h(
        "div",
        {
          position: "absolute",
          left: 70,
          top: 60,
          width: size,
          height: size,
          display: "flex",
        },
        [{ type: "img", props: { src: dial, width: size, height: size } }],
      ),
      h(
        "div",
        {
          position: "absolute",
          left: 640,
          top: 248,
          display: "flex",
          flexDirection: "column",
        },
        [
          h(
            "div",
            {
              fontFamily: "Instrument Serif",
              fontSize: 92,
              lineHeight: 0.9,
              letterSpacing: -0.92,
              color: C.ink,
            },
            "Cadran",
          ),
          h(
            "div",
            {
              marginTop: 20,
              fontFamily: "Geist Mono",
              fontWeight: 500,
              fontSize: 18,
              color: C.muted,
            },
            "cadran.accura.dev",
          ),
        ],
      ),
    ],
  );
}

const svg = await satori(card(), { width: 1200, height: 630, fonts });
const png = new Resvg(svg, { fitTo: { mode: "width", value: 1200 } }).render().asPng();
const out = join(root, "public", "og.png");
writeFileSync(out, png);
console.log(`${out} ${(png.length / 1024).toFixed(1)} KB`);
