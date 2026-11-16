#!/usr/bin/env node
/**
 * Renders the share images public/og-fr.png and public/og-en.png (1200x630).
 *
 * Layout from the art direction: paper background, "Cadran" in Instrument
 * Serif 128 and a Geist 34 tagline on the left, a flat dial with 60 ticks,
 * the four area labels and one needle on the right, the domain in Geist
 * Mono at the bottom left. No score, no number, no gradient.
 *
 * Satori lays the page out as SVG, resvg turns it into PNG. Both are dev
 * dependencies, so run `npm run og` and commit the PNGs when copy changes.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const seo = JSON.parse(readFileSync(join(root, "src/lib/seo.json"), "utf8"));

const C = {
  paper: "#F4F2EC",
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
    name: "Geist",
    weight: 400,
    style: "normal",
    data: font("geist-sans", "geist-sans-latin-400-normal.woff"),
  },
  {
    name: "Geist",
    weight: 600,
    style: "normal",
    data: font("geist-sans", "geist-sans-latin-600-normal.woff"),
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

/** The dial itself (no text): 380 px circle, 60 ticks, needle, centre dot. */
function dialSvg() {
  const size = 500;
  const c = size / 2;
  const r = 190;
  const ticks = Array.from({ length: 60 }, (_, i) => {
    const a = (i * 6 * Math.PI) / 180;
    const major = i % 5 === 0;
    const r1 = r - (major ? 30 : 20);
    const r2 = r - 10;
    const p = (rr) => [c + rr * Math.sin(a), c - rr * Math.cos(a)].map((n) => n.toFixed(2));
    const [x1, y1] = p(r1);
    const [x2, y2] = p(r2);
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;
  }).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  <circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke="${C.ink}" stroke-width="3"/>
  <g stroke="${C.line}" stroke-width="2">${ticks}</g>
  <g transform="rotate(60 ${c} ${c})"><polygon points="${c},95 ${c + 3.8},${c} ${c},${c + 22} ${c - 3.8},${c}" fill="${C.needle}"/></g>
  <circle cx="${c}" cy="${c}" r="7" fill="${C.ink}"/>
</svg>`;
}

function card(page) {
  const label = (text, style) =>
    h(
      "div",
      {
        position: "absolute",
        display: "flex",
        justifyContent: "center",
        width: 160,
        fontFamily: "Geist",
        fontWeight: 600,
        fontSize: 18,
        letterSpacing: 1.08,
        color: C.muted,
        ...style,
      },
      text,
    );
  const [top, right, bottom, left] = page.ogAxes;
  const dial = "data:image/svg+xml;base64," + Buffer.from(dialSvg()).toString("base64");

  return h(
    "div",
    { width: 1200, height: 630, display: "flex", position: "relative", backgroundColor: C.paper },
    [
      // Safe area: 1080x510 centred.
      h(
        "div",
        { position: "absolute", left: 60, top: 60, width: 1080, height: 510, display: "flex" },
        [
          h(
            "div",
            {
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: 520,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            },
            [
              h(
                "div",
                {
                  fontFamily: "Instrument Serif",
                  fontSize: 128,
                  lineHeight: 0.9,
                  letterSpacing: -1.28,
                  color: C.ink,
                },
                "Cadran",
              ),
              h(
                "div",
                {
                  marginTop: 24,
                  fontFamily: "Geist",
                  fontSize: 34,
                  lineHeight: 1.25,
                  color: C.muted,
                },
                page.ogTagline,
              ),
            ],
          ),
          h(
            "div",
            {
              position: "absolute",
              left: 0,
              bottom: 0,
              fontFamily: "Geist Mono",
              fontWeight: 500,
              fontSize: 22,
              color: C.muted,
            },
            "cadran.accura.dev",
          ),
          h(
            "div",
            { position: "absolute", right: 20, top: 5, width: 500, height: 500, display: "flex" },
            [
              { type: "img", props: { src: dial, width: 500, height: 500 } },
              label(top, { left: 170, top: 100 }),
              label(right, { left: 290, top: 239 }),
              label(bottom, { left: 170, top: 378 }),
              label(left, { left: 50, top: 239 }),
            ],
          ),
        ],
      ),
    ],
  );
}

for (const locale of ["fr", "en"]) {
  const page = seo[locale];
  const svg = await satori(card(page), { width: 1200, height: 630, fonts });
  const png = new Resvg(svg, { fitTo: { mode: "width", value: 1200 } }).render().asPng();
  const out = join(root, "public", `og-${locale}.png`);
  writeFileSync(out, png);
  console.log(`${out} ${(png.length / 1024).toFixed(1)} KB`);
}
