import { useEffect, useMemo, useRef, useState } from "react";
import { SymbolMark } from "@/components/cadran/glyphs";
import { PrimaryButton, Shell } from "@/components/cadran/ui";
import { useLocale } from "@/components/cadran/locale";

const SECONDS = 40;

function rollScan(n: number) {
  return Array.from({ length: n }, () => {
    const target = Math.floor(Math.random() * 6);
    const present = Math.random() < 0.5;
    const row = Array.from({ length: 5 }, () => Math.floor(Math.random() * 6));
    if (present) row[Math.floor(Math.random() * row.length)] = target;
    else {
      for (let i = 0; i < row.length; i++) if (row[i] === target) row[i] = (target + 1 + (i % 5)) % 6;
    }
    return { target, row, present: row.includes(target) };
  });
}

export function SpeedRun({
  mode,
  kicker,
  progress,
  onPause,
  onDone,
}: {
  mode: "scan" | "code";
  kicker: string;
  progress: number;
  onPause?: () => void;
  onDone: (net: number) => void;
}) {
  const { t } = useLocale();
  const [armed, setArmed] = useState(false);
  const [left, setLeft] = useState(SECONDS);
  const [cursor, setCursor] = useState(0);
  const hits = useRef(0);
  const misses = useRef(0);
  const finished = useRef(false);
  const scan = useMemo(() => rollScan(80), []);
  const codeKey = useMemo(() => [0, 1, 2, 3, 4, 5], []);
  const stimuli = useMemo(() => Array.from({ length: 80 }, () => Math.floor(Math.random() * 6)), []);

  useEffect(() => {
    if (!armed || left <= 0) return;
    const id = window.setTimeout(() => setLeft((n) => n - 1), 1000);
    return () => window.clearTimeout(id);
  }, [armed, left]);

  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    if (!armed || left > 0 || finished.current) return;
    finished.current = true;
    doneRef.current(hits.current - misses.current);
  }, [armed, left]);

  function answer(ok: boolean) {
    if (!armed || left <= 0) return;
    if (ok) hits.current += 1;
    else misses.current += 1;
    setCursor((c) => c + 1);
  }

  const title = mode === "scan" ? t.steps.scan.title : t.steps.code.title;
  const item = scan[cursor % scan.length];
  const symbol = stimuli[cursor % stimuli.length] ?? 0;

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.repeat) return;
      if (!armed) {
        if (e.key === "Enter") {
          e.preventDefault();
          setArmed(true);
        }
        return;
      }
      if (left <= 0) return;
      if (e.key === " ") e.preventDefault();
      if (mode === "scan" && item) {
        if (e.key === "ArrowLeft" || e.key === "1") {
          e.preventDefault();
          answer(item.present);
        } else if (e.key === "ArrowRight" || e.key === "2") {
          e.preventDefault();
          answer(!item.present);
        }
      } else if (mode === "code") {
        const n = Number(e.key);
        if (n >= 1 && n <= 6) {
          e.preventDefault();
          answer(n - 1 === symbol);
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (!armed) {
    return (
      <Shell kicker={kicker} title={title} progress={progress} onPause={onPause}>
        <h2 className="font-display text-3xl leading-tight">{mode === "scan" ? t.scanTitle : t.codeTitle}</h2>
        <p className="mt-3 text-muted">{mode === "scan" ? t.scanLead : t.codeLead}</p>
        {mode === "code" && (
          <div className="mt-6 grid grid-cols-6 gap-2">
            {codeKey.map((id, n) => (
              <div key={id} className="grid place-items-center rounded-xl border border-line bg-sheet py-2">
                <SymbolMark id={id} className="h-8 w-8" />
                <span className="mt-1 text-sm font-medium">{n + 1}</span>
              </div>
            ))}
          </div>
        )}
        <div className="mt-8">
          <PrimaryButton onClick={() => setArmed(true)}>{t.startClock(SECONDS)}</PrimaryButton>
          <p className="mt-3 text-center text-xs text-muted">{mode === "scan" ? t.keyScan : t.keyCode}</p>
        </div>
      </Shell>
    );
  }

  const live = scan[cursor % scan.length];

  return (
    <Shell kicker={kicker} title={`${title} · ${left}s`} progress={progress} onPause={onPause}>
      <p className="text-sm text-muted">{t.tally(hits.current, misses.current)}</p>
      {mode === "scan" && live && (
        <>
          <div className="mt-4 flex items-center gap-3">
            <div className="grid h-16 w-16 place-items-center rounded-xl border border-copper bg-copper-soft">
              <SymbolMark id={live.target} />
            </div>
            <div className="grid flex-1 grid-cols-5 gap-1 rounded-xl border border-line bg-sheet p-2">
              {live.row.map((id, i) => (
                <div key={i} className="grid place-items-center">
                  <SymbolMark id={id} className="h-8 w-8" />
                </div>
              ))}
            </div>
          </div>
          <p className="mt-4 text-xs text-muted">{t.keyScan}</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button type="button" className="min-h-14 rounded-xl bg-ink text-paper" onClick={() => answer(live.present)}>
              {t.present}
              <span className="ml-2 text-xs opacity-70">←</span>
            </button>
            <button
              type="button"
              className="min-h-14 rounded-xl border border-line bg-sheet"
              onClick={() => answer(!live.present)}
            >
              {t.absent}
              <span className="ml-2 text-xs text-muted">→</span>
            </button>
          </div>
        </>
      )}
      {mode === "code" && (
        <>
          <div className="mt-2 grid grid-cols-6 gap-1">
            {codeKey.map((id, n) => (
              <div key={id} className="grid place-items-center">
                <SymbolMark id={id} className="h-6 w-6" />
                <span className="text-xs text-muted">{n + 1}</span>
              </div>
            ))}
          </div>
          <div className="mt-8 grid place-items-center">
            <SymbolMark id={symbol} className="h-24 w-24" />
          </div>
          <p className="mt-3 text-center text-xs text-muted">{t.keyCode}</p>
          <div className="mt-6 grid grid-cols-3 gap-2">
            {codeKey.map((_, n) => (
              <button
                key={n}
                type="button"
                className="min-h-12 rounded-xl border border-line bg-sheet text-lg font-medium"
                onClick={() => answer(n === symbol)}
              >
                {n + 1}
              </button>
            ))}
          </div>
        </>
      )}
    </Shell>
  );
}
