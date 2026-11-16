import { useEffect, useState } from "react";
import { Keypad, PrimaryButton, Shell } from "@/components/cadran/ui";
import { useLocale } from "@/components/cadran/locale";

type Dir = "fwd" | "bwd";

type Phase =
  | { t: "brief"; dir: Dir; practice: boolean }
  | { t: "show"; dir: Dir; practice: boolean; seq: number[]; i: number; on: boolean; length: number; trial: number; fails: number; maxFwd: number; maxBwd: number }
  | { t: "input"; dir: Dir; practice: boolean; seq: number[]; typed: string; length: number; trial: number; fails: number; maxFwd: number; maxBwd: number }
  | { t: "note"; text: string; next: "live-fwd" | "bwd-brief" | "done"; maxFwd: number; maxBwd: number };

function makeSeq(len: number) {
  const seq: number[] = [];
  while (seq.length < len) {
    const d = 1 + Math.floor(Math.random() * 9);
    if (seq[seq.length - 1] !== d) seq.push(d);
  }
  return seq;
}

const FWD_MAX = 8;
const BWD_MAX = 7;

export function SpanRun({
  kicker,
  progress,
  onPause,
  onDone,
}: {
  kicker: string;
  progress: number;
  onPause?: () => void;
  onDone: (fwd: number, bwd: number) => void;
}) {
  const { t } = useLocale();
  const [phase, setPhase] = useState<Phase>({ t: "brief", dir: "fwd", practice: true });

  useEffect(() => {
    if (phase.t !== "show") return;
    const wait = phase.on ? 680 : 220;
    const id = window.setTimeout(() => {
      if (phase.on) {
        if (phase.i >= phase.seq.length - 1) {
          setPhase({
            t: "input",
            dir: phase.dir,
            practice: phase.practice,
            seq: phase.seq,
            typed: "",
            length: phase.length,
            trial: phase.trial,
            fails: phase.fails,
            maxFwd: phase.maxFwd,
            maxBwd: phase.maxBwd,
          });
        } else {
          setPhase({ ...phase, on: false });
        }
      } else {
        setPhase({ ...phase, on: true, i: phase.i + 1 });
      }
    }, wait);
    return () => window.clearTimeout(id);
  }, [phase]);

  useEffect(() => {
    if (phase.t !== "input") return;
    function onKey(e: KeyboardEvent) {
      if (phase.t !== "input") return;
      if (e.repeat && e.key !== "Backspace") return;
      if (/^[1-9]$/.test(e.key)) {
        e.preventDefault();
        setPhase({ ...phase, typed: (phase.typed + e.key).slice(0, 12) });
      } else if (e.key === "Backspace") {
        e.preventDefault();
        setPhase({ ...phase, typed: phase.typed.slice(0, -1) });
      } else if (e.key === "Enter") {
        e.preventDefault();
        submit(phase.typed, phase);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  function begin(dir: Dir, practice: boolean, length: number, trial: number, fails: number, maxFwd: number, maxBwd: number) {
    setPhase({
      t: "show",
      dir,
      practice,
      seq: makeSeq(practice ? 2 : length),
      i: 0,
      on: true,
      length: practice ? 2 : length,
      trial,
      fails,
      maxFwd,
      maxBwd,
    });
  }

  function submit(typed: string, current: Extract<Phase, { t: "input" }>) {
    const expected = (current.dir === "fwd" ? current.seq : [...current.seq].reverse()).join("");
    const ok = typed === expected;
    if (current.practice) {
      setPhase({
        t: "note",
        text: ok ? t.trialOk : t.trialMiss(expected),
        next: "live-fwd",
        maxFwd: 0,
        maxBwd: 0,
      });
      return;
    }
    const maxFwd = current.dir === "fwd" && ok ? Math.max(current.maxFwd, current.length) : current.maxFwd;
    const maxBwd = current.dir === "bwd" && ok ? Math.max(current.maxBwd, current.length) : current.maxBwd;
    const fails = ok ? current.fails : current.fails + 1;
    const cap = current.dir === "fwd" ? FWD_MAX : BWD_MAX;

    if (current.trial === 0) {
      begin(current.dir, false, current.length, 1, fails, maxFwd, maxBwd);
      return;
    }
    if (fails >= 2 || current.length >= cap) {
      if (current.dir === "fwd") {
        setPhase({
          t: "note",
          text: t.nowReverse,
          next: "bwd-brief",
          maxFwd,
          maxBwd,
        });
      } else {
        onDone(maxFwd, maxBwd);
      }
      return;
    }
    begin(current.dir, false, current.length + 1, 0, 0, maxFwd, maxBwd);
  }

  if (phase.t === "brief") {
    return (
      <Shell kicker={kicker} title={t.spanTitle} progress={progress} onPause={onPause}>
        <h2 className="font-display text-3xl leading-tight">{t.spanHold}</h2>
        <p className="mt-3 text-muted">{t.spanHoldLead}</p>
        <div className="mt-8">
          <PrimaryButton onClick={() => begin("fwd", true, 3, 0, 0, 0, 0)}>{t.seeTrial}</PrimaryButton>
        </div>
      </Shell>
    );
  }

  if (phase.t === "note") {
    return (
      <Shell kicker={kicker} title={t.spanTitle} progress={progress} onPause={onPause}>
        <h2 className="font-display text-3xl leading-tight">{phase.next === "bwd-brief" ? t.reverse : t.going}</h2>
        <p className="mt-3 text-muted">{phase.text}</p>
        <div className="mt-8">
          <PrimaryButton
            onClick={() => {
              if (phase.next === "done") onDone(phase.maxFwd, phase.maxBwd);
              else if (phase.next === "bwd-brief") begin("bwd", false, 2, 0, 0, phase.maxFwd, phase.maxBwd);
              else begin("fwd", false, 3, 0, 0, 0, 0);
            }}
          >
            {t.continue}
          </PrimaryButton>
        </div>
      </Shell>
    );
  }

  if (phase.t === "show") {
    return (
      <Shell kicker={kicker} title={phase.dir === "fwd" ? t.forward : t.reverse} progress={progress} onPause={onPause}>
        <p className="text-sm text-muted">{phase.practice ? t.trial : t.lengthTrial(phase.length, phase.trial + 1)}</p>
        <div className="grid flex-1 place-items-center">
          <p className="font-display text-7xl tabular-nums">{phase.on ? phase.seq[phase.i] : ""}</p>
        </div>
      </Shell>
    );
  }

  const shown = phase.typed.split("").join(" ");
  return (
    <Shell kicker={kicker} title={phase.dir === "fwd" ? t.forward : t.reverse} progress={progress} onPause={onPause}>
      <p className="text-sm text-muted">{phase.dir === "fwd" ? t.typeForward : t.typeBack}</p>
      <p className="mt-6 min-h-14 font-display text-4xl tracking-widest tabular-nums">{shown || "—"}</p>
      <p className="mt-2 text-xs text-muted">{t.keyDigits}</p>
      <div className="mt-auto pt-6">
        <Keypad
          withZero={false}
          onDigit={(d) => setPhase({ ...phase, typed: (phase.typed + d).slice(0, 12) })}
          onBack={() => setPhase({ ...phase, typed: phase.typed.slice(0, -1) })}
          onOk={() => submit(phase.typed, phase)}
        />
      </div>
    </Shell>
  );
}
