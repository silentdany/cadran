import { useEffect, useMemo, useState } from "react";
import type { Mark } from "@/lib/battery/marks";
import { shuffleOptions } from "@/lib/battery/marks";
import { FigureTile } from "@/components/cadran/glyphs";
import { Shell } from "@/components/cadran/ui";
import { useLocale } from "@/components/cadran/locale";

type VisualItem = {
  id: string;
  points: number;
  options: Mark[][];
  answer: number;
  frames?: Mark[][];
  cells?: (Mark[] | null)[];
};

export function VisualRun({
  items,
  seed,
  mode,
  kicker,
  title,
  lead,
  progress,
  onPause,
  onDone,
}: {
  items: VisualItem[];
  seed: number;
  mode: "matrix" | "suite";
  kicker: string;
  title: string;
  lead: string;
  progress: number;
  onPause?: () => void;
  onDone: (points: number) => void;
}) {
  const { t } = useLocale();
  const deck = useMemo(() => {
    let state = seed;
    const rng = () => {
      state = (state * 1664525 + 1013904223) >>> 0;
      return state / 4294967296;
    };
    return items.map((item) => {
      const shuffled = shuffleOptions(item.options, item.answer, rng);
      return { ...item, options: shuffled.options, answer: shuffled.answer };
    });
  }, [items, seed]);

  const [index, setIndex] = useState(0);
  const [points, setPoints] = useState(0);
  const [locked, setLocked] = useState(false);
  const item = deck[index];

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!item || locked || e.repeat) return;
      const digit = Number(e.key);
      const letter = "abcdef".indexOf(e.key.toLowerCase());
      const pickIndex = digit >= 1 && digit <= item.options.length ? digit - 1 : letter;
      if (pickIndex >= 0 && pickIndex < item.options.length) {
        e.preventDefault();
        pick(pickIndex);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  function pick(option: number) {
    if (!item || locked) return;
    setLocked(true);
    const nextPoints = points + (option === item.answer ? item.points : 0);
    window.setTimeout(() => {
      if (index + 1 >= deck.length) onDone(nextPoints);
      else {
        setPoints(nextPoints);
        setIndex(index + 1);
        setLocked(false);
      }
    }, 160);
  }

  if (!item) return null;

  return (
    <Shell kicker={kicker} title={`${title} · ${index + 1}/${deck.length}`} progress={progress} onPause={onPause}>
      <p className="text-sm text-muted">{lead}</p>
      {mode === "matrix" && item.cells && (
        <div className="mx-auto mt-5 grid w-full max-w-xs grid-cols-3 gap-2">
          {item.cells.map((cell, i) => (
            <FigureTile key={i} marks={cell} missing={cell === null} />
          ))}
        </div>
      )}
      {mode === "suite" && item.frames && (
        <div className="mt-5 grid grid-cols-4 gap-2">
          {item.frames.map((frame, i) => (
            <FigureTile key={i} marks={frame} />
          ))}
        </div>
      )}
      <p className="mt-6 text-sm font-medium text-ink">{t.whichFigure}</p>
      <p className="mt-1 text-xs text-muted">{t.keyPick}</p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {item.options.map((option, i) => (
          <button
            key={i}
            type="button"
            onClick={() => pick(i)}
            className="rounded-xl border border-line bg-sheet p-2 text-left hover:border-ink"
          >
            <FigureTile marks={option} label={String.fromCharCode(65 + i)} />
          </button>
        ))}
      </div>
    </Shell>
  );
}
