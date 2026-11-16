import type { Mark } from "@/lib/battery/marks";

const FILL: Record<Mark["tone"], string> = {
  ink: "var(--color-ink)",
  copper: "var(--color-copper)",
  moss: "var(--color-moss)",
};

export function CellSvg({ marks, className = "" }: { marks: Mark[]; className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      {marks.map((m, i) => (
        <Shape key={i} m={m} />
      ))}
    </svg>
  );
}

function Shape({ m }: { m: Mark }) {
  const fill = FILL[m.tone];
  const rot = `rotate(${m.rot ?? 0} ${m.cx} ${m.cy})`;
  switch (m.kind) {
    case "circle":
      return <circle cx={m.cx} cy={m.cy} r={m.s / 2} fill={fill} transform={rot} />;
    case "ring":
      return (
        <circle
          cx={m.cx}
          cy={m.cy}
          r={m.s / 2}
          fill="none"
          stroke={fill}
          strokeWidth={4}
          transform={rot}
        />
      );
    case "square":
      return (
        <rect
          x={m.cx - m.s / 2}
          y={m.cy - m.s / 2}
          width={m.s}
          height={m.s}
          rx={2}
          fill={fill}
          transform={rot}
        />
      );
    case "diamond": {
      const p = `${m.cx},${m.cy - m.s / 2} ${m.cx + m.s / 2},${m.cy} ${m.cx},${m.cy + m.s / 2} ${m.cx - m.s / 2},${m.cy}`;
      return <polygon points={p} fill={fill} transform={rot} />;
    }
    case "triangle": {
      const p = `${m.cx},${m.cy - m.s / 2} ${m.cx - m.s / 2},${m.cy + m.s / 2} ${m.cx + m.s / 2},${m.cy + m.s / 2}`;
      return <polygon points={p} fill={fill} transform={rot} />;
    }
    case "plus":
      return (
        <g transform={rot} fill={fill}>
          <rect x={m.cx - m.s / 2} y={m.cy - m.s / 8} width={m.s} height={m.s / 4} rx={1} />
          <rect x={m.cx - m.s / 8} y={m.cy - m.s / 2} width={m.s / 4} height={m.s} rx={1} />
        </g>
      );
    case "bar":
      return (
        <rect
          x={m.cx - m.s / 2}
          y={m.cy - 5}
          width={m.s}
          height={10}
          rx={3}
          fill={fill}
          transform={rot}
        />
      );
    case "dot":
      return <circle cx={m.cx} cy={m.cy} r={m.s / 2} fill={fill} />;
    default:
      return null;
  }
}

export function FigureTile({
  marks,
  missing = false,
  label,
}: {
  marks: Mark[] | null;
  missing?: boolean;
  label?: string;
}) {
  return (
    <div
      className={
        "grid aspect-square place-items-center rounded-xl border bg-sheet " +
        (missing ? "border-dashed border-copper" : "border-line")
      }
    >
      {marks ? (
        <CellSvg marks={marks} className="h-[78%] w-[78%]" />
      ) : (
        <span className="font-display text-2xl text-copper">{label ?? "?"}</span>
      )}
    </div>
  );
}

const SYMBOLS = [
  "M8 20c6-10 18-10 24 0",
  "M10 30 L20 10 L30 30 Z",
  "M12 12 h16 v16 h-16 Z M20 12 v16",
  "M10 20 h20 M20 10 v20",
  "M20 8 L32 20 L20 32 L8 20 Z",
  "M10 14 h20 M12 20 h16 M14 26 h12",
];

export function SymbolMark({ id, className = "h-10 w-10" }: { id: number; className?: string }) {
  const d = SYMBOLS[id % SYMBOLS.length] ?? SYMBOLS[0];
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      {id % 6 === 0 && (
        <>
          <circle cx="16" cy="20" r="7" fill="none" stroke="var(--color-ink)" strokeWidth="2.4" />
          <circle cx="24" cy="20" r="7" fill="none" stroke="var(--color-copper)" strokeWidth="2.4" />
        </>
      )}
      {id % 6 === 1 && <polygon points="12,30 20,8 28,30" fill="var(--color-ink)" />}
      {id % 6 === 2 && (
        <>
          <rect x="10" y="10" width="20" height="20" rx="3" fill="none" stroke="var(--color-ink)" strokeWidth="2.4" />
          <rect x="17" y="17" width="6" height="6" fill="var(--color-copper)" />
        </>
      )}
      {id % 6 === 3 && (
        <>
          <rect x="8" y="17" width="24" height="6" rx="2" fill="var(--color-ink)" />
          <rect x="17" y="8" width="6" height="24" rx="2" fill="var(--color-copper)" />
        </>
      )}
      {id % 6 === 4 && <polygon points="20,7 33,20 20,33 7,20" fill="none" stroke="var(--color-ink)" strokeWidth="2.4" />}
      {id % 6 === 5 && (
        <>
          <rect x="8" y="11" width="24" height="4" rx="1" fill="var(--color-ink)" />
          <rect x="12" y="18" width="16" height="4" rx="1" fill="var(--color-copper)" />
          <rect x="16" y="25" width="8" height="4" rx="1" fill="var(--color-moss)" />
        </>
      )}
      <title>{d}</title>
    </svg>
  );
}
