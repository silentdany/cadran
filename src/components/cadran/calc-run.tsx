import { useEffect, useState } from "react";
import { CALCULS } from "@/lib/battery/marks";
import { Keypad, Shell } from "@/components/cadran/ui";
import { useLocale } from "@/components/cadran/locale";

export function CalcRun({
  kicker,
  progress,
  onPause,
  onDone,
}: {
  kicker: string;
  progress: number;
  onPause?: () => void;
  onDone: (points: number) => void;
}) {
  const { t } = useLocale();
  const [index, setIndex] = useState(0);
  const [typed, setTyped] = useState("");
  const [points, setPoints] = useState(0);
  const [startedAt, setStartedAt] = useState(() => Date.now());
  const item = CALCULS[index];

  useEffect(() => {
    setStartedAt(Date.now());
    setTyped("");
  }, [index]);

  function submit(value: string) {
    if (!item || value.trim() === "") return;
    const ok = Number(value) === item.answer;
    const fast = Date.now() - startedAt < 10000;
    const gained = ok ? 2 + (fast ? 1 : 0) : 0;
    const next = points + gained;
    if (index + 1 >= CALCULS.length) onDone(next);
    else {
      setPoints(next);
      setIndex(index + 1);
    }
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.repeat && e.key !== "Backspace") return;
      if (/^\d$/.test(e.key)) {
        e.preventDefault();
        setTyped((v) => (v + e.key).slice(0, 6));
      } else if (e.key === "Backspace") {
        e.preventDefault();
        setTyped((v) => v.slice(0, -1));
      } else if (e.key === "Enter") {
        e.preventDefault();
        submit(typed);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (!item) return null;

  return (
    <Shell kicker={kicker} title={t.calcTitle(index + 1, CALCULS.length)} progress={progress} onPause={onPause}>
      <p className="text-sm text-muted">{t.calcLead}</p>
      <h2 className="mt-6 font-display text-5xl tabular-nums">{item.text}</h2>
      <p className="mt-4 min-h-10 font-display text-3xl tabular-nums">{typed || "—"}</p>
      <p className="mt-2 text-xs text-muted">{t.keyDigits}</p>
      <div className="mt-auto pt-6">
        <Keypad
          onDigit={(d) => setTyped((v) => (v + d).slice(0, 6))}
          onBack={() => setTyped((v) => v.slice(0, -1))}
          onOk={() => submit(typed)}
        />
      </div>
    </Shell>
  );
}
