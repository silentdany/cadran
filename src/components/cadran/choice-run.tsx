import { useEffect, useMemo, useState } from "react";
import type { Choice } from "@/lib/battery/marks";
import { shuffleOptions } from "@/lib/battery/marks";
import { ChoiceButton, Shell } from "@/components/cadran/ui";
import { useLocale } from "@/components/cadran/locale";

export function ChoiceRun({
  items,
  seed,
  kicker,
  title,
  lead,
  progress,
  onPause,
  onDone,
}: {
  items: Choice[];
  seed: number;
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
    const gained = option === item.answer ? item.points : 0;
    const nextPoints = points + gained;
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
    <Shell kicker={kicker} title={title}
      counter={`${index + 1} / ${deck.length}`} progress={progress} onPause={onPause}>
      <p className="text-muted">{lead}</p>
      <h2 className="mt-5 font-display text-[32px] leading-tight text-ink">{item.prompt}</h2>
      <p className="mt-2 text-sm text-muted">{t.keyPick}</p>
      <div className="mt-6 flex flex-col gap-2">
        {item.options.map((option, i) => (
          <ChoiceButton key={option} index={i} onPick={() => pick(i)}>
            {option}
          </ChoiceButton>
        ))}
      </div>
    </Shell>
  );
}
