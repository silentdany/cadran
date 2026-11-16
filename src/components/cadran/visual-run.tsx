import { useEffect, useMemo, useState } from "react";
import type { Mark } from "@/lib/battery/marks";
import { shuffleOptions } from "@/lib/battery/marks";
import { FigureTile, TILE_SIZE_CLASS } from "@/components/cadran/glyphs";
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
  const [picked, setPicked] = useState<number | null>(null);
  const item = deck[index];

  // Drop the highlight and keyboard lock when the item changes, so a
  // chosen tile does not keep its frame on the next question.
  useEffect(() => {
    setPicked(null);
    setLocked(false);
  }, [index]);

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
    setPicked(option);
    const nextPoints = points + (option === item.answer ? item.points : 0);
    window.setTimeout(() => {
      if (index + 1 >= deck.length) onDone(nextPoints);
      else {
        setPoints(nextPoints);
        setIndex(index + 1);
        setPicked(null);
        setLocked(false);
      }
    }, 160);
  }

  if (!item) return null;

  return (
    <Shell
      kicker={kicker}
      title={title}
      counter={`${index + 1} / ${deck.length}`}
      progress={progress}
      onPause={onPause}
    >
      <p className="text-muted">{lead}</p>
      {/* Series, matrix cells and options share FigureTile, so they always render at the same px size. */}
      {mode === "matrix" && item.cells && (
        <div className="mt-6 grid w-fit grid-cols-3 gap-3">
          {item.cells.map((cell, i) => (
            <FigureTile key={i} marks={cell} />
          ))}
        </div>
      )}
      {mode === "suite" && item.frames && (
        <div className="mt-6 flex flex-wrap gap-3">
          {item.frames.map((frame, i) => (
            <FigureTile key={i} marks={frame} />
          ))}
          <FigureTile marks={null} />
        </div>
      )}
      <p className="mt-7 font-medium text-ink">{t.whichFigure}</p>
      <p className="mt-1 text-sm text-muted">{t.keyPick}</p>
      <div key={item.id} className="mt-4 grid w-fit grid-cols-2 gap-3">
        {item.options.map((option, i) => {
          const letter = String.fromCharCode(65 + i);
          const selected = picked === i;
          return (
            <button
              key={i}
              type="button"
              onClick={() => pick(i)}
              aria-label={letter}
              aria-pressed={selected}
              className="group flex flex-col items-center gap-2 rounded-[10px]"
            >
              <span
                className={
                  `${TILE_SIZE_CLASS} block rounded-[10px] ` +
                  (selected
                    ? "bg-needle-soft ring-2 ring-ink [&>div]:border-transparent [&>div]:bg-transparent"
                    : "group-hover:[&>div]:border-ink/40")
                }
              >
                <FigureTile marks={option} />
              </span>
              <span className="font-mono text-xs text-muted">{letter}</span>
            </button>
          );
        })}
      </div>
    </Shell>
  );
}
