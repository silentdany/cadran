import { useEffect, useState } from "react";
import { BookOpen, Brain, Gauge, Shapes } from "lucide-react";
import { MATRICES, SENS, SIMILITUDES, SUITES } from "@/lib/battery/marks";
import { SENS_EN, SIMILITUDES_EN } from "@/lib/battery/items-en";
import { bandKey, percentile, profileFrom, type RawParts } from "@/lib/battery/score";
import { clearDraft, loadDraft, loadHistory, saveDraft, saveHistory, type Draft, type SessionResult } from "@/lib/battery/history";
import { ChoiceRun } from "@/components/cadran/choice-run";
import { VisualRun } from "@/components/cadran/visual-run";
import { SpanRun } from "@/components/cadran/span-run";
import { CalcRun } from "@/components/cadran/calc-run";
import { SpeedRun } from "@/components/cadran/speed-run";
import { GhostButton, PrimaryButton } from "@/components/cadran/ui";
import { LangSwitch, useLocale } from "@/components/cadran/locale";
import { BlockExample } from "@/components/cadran/examples";

const AXES = [
  { icon: BookOpen, name: "Langage", text: "Concepts et définitions" },
  { icon: Shapes, name: "Formes", text: "Logique visuelle" },
  { icon: Brain, name: "Mémoire", text: "Retenir et manipuler" },
  { icon: Gauge, name: "Rythme", text: "Vitesse et précision" },
] as const;

const STEPS = [
  { id: "sim", kicker: "Axe 1 · Langage", title: "Similitudes", minutes: 2, body: "Deux mots. Choisis ce qu'ils ont vraiment en commun : l'idée générale, pas un détail." },
  { id: "sens", kicker: "Axe 1 · Langage", title: "Sens des mots", minutes: 2, body: "Choisis la définition la plus juste. Les pièges ressemblent au mot, ils n'en sont pas le sens." },
  { id: "mat", kicker: "Axe 2 · Formes", title: "Matrices", minutes: 4, body: "La case vide suit la même règle que le reste de la grille. Une seule option est juste." },
  { id: "suite", kicker: "Axe 2 · Formes", title: "Suites", minutes: 2, body: "Quatre figures. Laquelle continue la série ?" },
  { id: "span", kicker: "Axe 3 · Mémoire", title: "Empan de chiffres", minutes: 5, body: "Des chiffres défilent. Tu les retapes dans l'ordre, puis à l'envers." },
  { id: "calc", kicker: "Axe 3 · Mémoire", title: "Calcul", minutes: 3, body: "Huit opérations de tête. La justesse compte, la vitesse ajoute un petit bonus." },
  { id: "scan", kicker: "Axe 4 · Rythme", title: "Repérage", minutes: 1, body: "40 secondes. Dis si le symbole isolé est dans le groupe." },
  { id: "code", kicker: "Axe 4 · Rythme", title: "Code", minutes: 1, body: "40 secondes. Chaque symbole a un chiffre. Tape-le." },
] as const;

const TOTAL_MINUTES = STEPS.reduce((sum, step) => sum + step.minutes, 0);

function remainingMinutes(from: number) {
  return STEPS.slice(from).reduce((sum, step) => sum + step.minutes, 0);
}

const emptyRaw = (): RawParts => ({
  sim: 0,
  sens: 0,
  mat: 0,
  suite: 0,
  fwd: 0,
  bwd: 0,
  calc: 0,
  scan: 0,
  code: 0,
});

function formatWhen(iso: string, tag: string) {
  return new Intl.DateTimeFormat(tag, { day: "numeric", month: "short", year: "numeric" }).format(new Date(iso));
}

export function CadranApp() {
  const { t, locale } = useLocale();
  const steps = STEPS.map((item) => ({ ...item, ...t.steps[item.id] }));
  const similitudes = locale === "en" ? SIMILITUDES_EN : SIMILITUDES;
  const sens = locale === "en" ? SENS_EN : SENS;
  const [phase, setPhase] = useState<"home" | "intro" | "run" | "results">("home");
  const [step, setStep] = useState(0);
  const [raw, setRaw] = useState<RawParts>(emptyRaw);
  const [seed, setSeed] = useState(1);
  const [history, setHistory] = useState<SessionResult[]>([]);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [result, setResult] = useState<SessionResult | null>(null);
  const [baseline, setBaseline] = useState<SessionResult | null>(null);

  useEffect(() => {
    setHistory(loadHistory());
    setDraft(loadDraft());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (phase !== "intro" && phase !== "run") return;
    const next: Draft = { step, raw, seed, savedAt: new Date().toISOString() };
    saveDraft(next);
    setDraft(next);
  }, [hydrated, phase, step, raw, seed]);

  function start() {
    clearDraft();
    setDraft(null);
    setRaw(emptyRaw());
    setSeed(Math.floor(Math.random() * 1_000_000_000) + 1);
    setStep(0);
    setResult(null);
    setBaseline(null);
    setPhase("intro");
  }

  function resume() {
    const saved = draft ?? loadDraft();
    if (!saved) return;
    setRaw(saved.raw);
    setSeed(saved.seed);
    setStep(Math.min(saved.step, STEPS.length - 1));
    setResult(null);
    setBaseline(null);
    setPhase("intro");
  }

  function pause() {
    const next: Draft = { step, raw, seed, savedAt: new Date().toISOString() };
    saveDraft(next);
    setDraft(next);
    setPhase("home");
  }

  function abandon() {
    clearDraft();
    setDraft(null);
  }

  function finish(nextRaw: RawParts) {
    const profile = profileFrom(nextRaw);
    const session: SessionResult = {
      ...profile,
      id: `${Date.now()}`,
      at: new Date().toISOString(),
      raw: nextRaw,
    };
    const prev = history[0] ?? null;
    setBaseline(prev);
    setResult(session);
    const stored = [session, ...history].slice(0, 12);
    saveHistory(stored);
    setHistory(stored);
    clearDraft();
    setDraft(null);
    setPhase("results");
  }

  function advance(patch: Partial<RawParts>) {
    const next = { ...raw, ...patch };
    setRaw(next);
    if (step + 1 >= STEPS.length) finish(next);
    else {
      setStep(step + 1);
      setPhase("intro");
    }
  }

  const current = steps[step];
  const progress = Math.round((step / STEPS.length) * 100);

  if (phase === "home") {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col px-5 py-10">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-medium tracking-widest text-copper uppercase">{t.homeKicker}</p>
          <LangSwitch />
        </div>
        <h1 className="mt-2 font-display text-5xl text-ink">Cadran</h1>
        <p className="mt-4 max-w-lg text-lg text-muted">{t.tagline(TOTAL_MINUTES)}</p>
        <p className="mt-3 max-w-lg text-sm text-muted">{t.disclaimer}</p>
        <ul className="mt-8 grid grid-cols-2 gap-3">
          {AXES.map((axe, i) => (
            <li key={axe.name} className="rounded-2xl border border-line bg-sheet p-4">
              <axe.icon className="h-5 w-5 text-copper" aria-hidden="true" />
              <p className="mt-3 font-medium">{t.axes[i]?.name}</p>
              <p className="text-sm text-muted">{t.axes[i]?.text}</p>
            </li>
          ))}
        </ul>
        <ul className="mt-8 divide-y divide-line border-y border-line">
          {steps.map((item) => (
            <li key={item.id} className="flex items-baseline justify-between gap-3 py-2 text-sm">
              <span>{item.title}</span>
              <span className="shrink-0 tabular-nums text-muted">
                {item.minutes} {t.minutes}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-sm text-muted">{t.totalNote(TOTAL_MINUTES)}</p>
        <div className="mt-8 flex flex-col gap-2">
          {draft && (
            <PrimaryButton onClick={resume}>
              {t.resume(steps[draft.step]?.title ?? t.session, remainingMinutes(draft.step))}
            </PrimaryButton>
          )}
          {draft ? (
            <GhostButton onClick={start}>{t.restart}</GhostButton>
          ) : (
            <PrimaryButton onClick={start}>{t.start}</PrimaryButton>
          )}
          {draft && <GhostButton onClick={abandon}>{t.discard}</GhostButton>}
        </div>
        {history.length > 0 && (
          <section className="mt-10">
            <h2 className="font-display text-2xl">{t.past}</h2>
            <ul className="mt-3 divide-y divide-line border-y border-line">
              {history.slice(0, 6).map((s) => (
                <li key={s.id} className="flex items-baseline justify-between py-3">
                  <span className="text-sm text-muted">{formatWhen(s.at, t.localeTag)}</span>
                  <span className="font-medium tabular-nums">
                    {s.global} <span className="text-sm font-normal text-muted">{t.bands[bandKey(s.global)]}</span>
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    );
  }

  if (phase === "intro" && current) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col px-5 py-10">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-medium tracking-widest text-copper uppercase">{current.kicker}</p>
          <LangSwitch />
        </div>
        <p className="mt-6 text-sm text-muted">{t.block(step + 1, steps.length, current.minutes, remainingMinutes(step))}</p>
        <h1 className="mt-2 font-display text-4xl">{current.title}</h1>
        <p className="mt-4 text-lg text-muted">{current.body}</p>
        <BlockExample id={current.id} />
        <p className="mt-4 text-sm text-muted">{t.pauseHint}</p>
        <div className="mt-8 flex flex-col gap-2">
          <PrimaryButton onClick={() => setPhase("run")}>{t.gotIt}</PrimaryButton>
          <GhostButton onClick={pause}>{t.pauseLong}</GhostButton>
        </div>
      </main>
    );
  }

  if (phase === "run" && current) {
    if (current.id === "sim") {
      return (
        <ChoiceRun
          items={similitudes}
          seed={seed}
          kicker={current.kicker}
          title={current.title}
          lead={current.lead ?? ""}
          progress={progress + 4}
          onPause={pause}
          onDone={(sim) => advance({ sim })}
        />
      );
    }
    if (current.id === "sens") {
      return (
        <ChoiceRun
          items={sens}
          seed={seed + 3}
          kicker={current.kicker}
          title={current.title}
          lead={current.lead ?? ""}
          progress={progress + 4}
          onPause={pause}
          onDone={(sens) => advance({ sens })}
        />
      );
    }
    if (current.id === "mat") {
      return (
        <VisualRun
          items={MATRICES}
          seed={seed + 7}
          mode="matrix"
          kicker={current.kicker}
          title={current.title}
          lead={current.lead ?? ""}
          progress={progress + 4}
          onPause={pause}
          onDone={(mat) => advance({ mat })}
        />
      );
    }
    if (current.id === "suite") {
      return (
        <VisualRun
          items={SUITES}
          seed={seed + 11}
          mode="suite"
          kicker={current.kicker}
          title={current.title}
          lead={current.lead ?? ""}
          progress={progress + 4}
          onPause={pause}
          onDone={(suite) => advance({ suite })}
        />
      );
    }
    if (current.id === "span") {
      return <SpanRun kicker={current.kicker} progress={progress + 4} onPause={pause} onDone={(fwd, bwd) => advance({ fwd, bwd })} />;
    }
    if (current.id === "calc") {
      return <CalcRun kicker={current.kicker} progress={progress + 4} onPause={pause} onDone={(calc) => advance({ calc })} />;
    }
    if (current.id === "scan") {
      return <SpeedRun mode="scan" kicker={current.kicker} progress={progress + 4} onPause={pause} onDone={(scan) => advance({ scan })} />;
    }
    return <SpeedRun mode="code" kicker={current.kicker} progress={progress + 4} onPause={pause} onDone={(code) => advance({ code })} />;
  }

  if (phase === "results" && result) {
    const rows = [
      { key: "langage", name: t.axes[0].name, value: result.langage },
      { key: "formes", name: t.axes[1].name, value: result.formes },
      { key: "memoire", name: t.axes[2].name, value: result.memoire },
      { key: "rythme", name: t.axes[3].name, value: result.rythme },
    ] as const;
    const delta = result.global - (baseline?.global ?? result.global);
    const deltaLabel = `${delta > 0 ? "+" : ""}${baseline ? delta : 0}`;
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col px-5 py-10">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-medium tracking-widest text-copper uppercase">{t.profile}</p>
          <LangSwitch />
        </div>
        <h1 className="mt-2 font-display text-5xl tabular-nums">{result.global}</h1>
        <p className="text-lg text-muted">{t.percentile(t.bands[bandKey(result.global)], percentile(result.global))}</p>
        {baseline && (
          <p className="mt-2 text-sm text-muted">{t.compared(formatWhen(baseline.at, t.localeTag), baseline.global, deltaLabel)}</p>
        )}
        <ul className="mt-8 flex flex-col gap-4">
          {rows.map((row) => {
            const prev = baseline
              ? row.key === "langage"
                ? baseline.langage
                : row.key === "formes"
                  ? baseline.formes
                  : row.key === "memoire"
                    ? baseline.memoire
                    : baseline.rythme
              : null;
            return (
              <li key={row.key}>
                <div className="flex items-baseline justify-between">
                  <span className="font-medium">{row.name}</span>
                  <span className="tabular-nums">
                    {row.value}
                    {prev !== null && (
                      <span className="ml-2 text-sm text-muted">
                        {row.value - prev > 0 ? "+" : ""}
                        {row.value - prev}
                      </span>
                    )}
                  </span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-line">
                  <div className="h-full rounded-full bg-copper" style={{ width: `${((row.value - 55) / 90) * 100}%` }} />
                </div>
                <p className="mt-1 text-sm text-muted">{t.bands[bandKey(row.value)]}</p>
              </li>
            );
          })}
        </ul>
        <details className="mt-8 rounded-2xl border border-line bg-sheet p-4">
          <summary className="cursor-pointer font-medium">{t.details}</summary>
          <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <dt className="text-muted">{t.steps.sim.title}</dt>
            <dd className="text-right tabular-nums">
              {result.raw.sim} {t.points}
            </dd>
            <dt className="text-muted">{t.steps.sens.title}</dt>
            <dd className="text-right tabular-nums">
              {result.raw.sens} {t.points}
            </dd>
            <dt className="text-muted">{t.steps.mat.title}</dt>
            <dd className="text-right tabular-nums">
              {result.raw.mat} {t.points}
            </dd>
            <dt className="text-muted">{t.steps.suite.title}</dt>
            <dd className="text-right tabular-nums">
              {result.raw.suite} {t.points}
            </dd>
            <dt className="text-muted">{t.spanDetail}</dt>
            <dd className="text-right tabular-nums">
              {result.raw.fwd} / {result.raw.bwd}
            </dd>
            <dt className="text-muted">{t.steps.calc.title}</dt>
            <dd className="text-right tabular-nums">
              {result.raw.calc} {t.points}
            </dd>
            <dt className="text-muted">{t.scanDetail}</dt>
            <dd className="text-right tabular-nums">{result.raw.scan}</dd>
            <dt className="text-muted">{t.codeDetail}</dt>
            <dd className="text-right tabular-nums">{result.raw.code}</dd>
          </dl>
        </details>
        <p className="mt-6 text-sm text-muted">{t.footnote}</p>
        <div className="mt-6 flex flex-col gap-2">
          <PrimaryButton onClick={start}>{t.again}</PrimaryButton>
          <GhostButton onClick={() => setPhase("home")}>{t.back}</GhostButton>
        </div>
      </main>
    );
  }

  return null;
}
