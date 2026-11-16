import type { ReactNode } from "react";
import { LangSwitch, useLocale } from "@/components/cadran/locale";

/** Number of blocks in a session: one tick per block on the progress line. */
const BLOCKS = 8;

/**
 * Frame for every in-session screen: a 2 px progress line with one tick per
 * block, a mono counter on the right, then the step label, Pause and title.
 *
 * The needle colour may appear once per screen. It goes to the progress line
 * by default; screens that show a PrimaryButton pass `needle="action"` so the
 * line turns ink and the button keeps the needle.
 */
export function Shell({
  kicker,
  title,
  counter,
  progress,
  onPause,
  needle = "progress",
  children,
}: {
  kicker: string;
  title: string;
  counter?: string;
  progress: number;
  onPause?: () => void;
  needle?: "progress" | "action";
  children: ReactNode;
}) {
  const done = Math.max(0, Math.min(100, progress));
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 bg-paper px-5 pt-4 sm:px-8 sm:pt-5">
        <div className="flex items-center gap-4">
          <div
            className="relative h-3 flex-1"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(done)}
          >
            <div className="absolute inset-x-0 top-[5px] h-0.5 bg-line" />
            <div
              className={
                "absolute left-0 top-[5px] h-0.5 transition-[width] duration-150 " +
                (needle === "progress" ? "bg-needle" : "bg-ink")
              }
              style={{ width: `${done}%` }}
            />
            <div className="pointer-events-none absolute inset-0 flex items-center justify-between" aria-hidden="true">
              {Array.from({ length: BLOCKS + 1 }, (_, i) => (
                <span key={i} className="block h-2 w-px bg-line" />
              ))}
            </div>
          </div>
          {counter && <p className="numeric shrink-0 text-base leading-none text-ink">{counter}</p>}
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-[560px] flex-1 flex-col px-5 pb-10 sm:px-0">
        <div className="mt-5 flex items-center justify-between gap-3">
          <p className="label truncate">{kicker}</p>
          {onPause && (
            <button type="button" onClick={onPause} className="shrink-0 text-sm text-muted hover:text-ink">
              <PauseLabel />
            </button>
          )}
        </div>
        <h1 className="mt-3 font-display text-[40px] leading-none tracking-[-0.01em] text-ink">{title}</h1>
        <div className="flex flex-1 flex-col pt-4">{children}</div>
      </main>
    </div>
  );
}

export function PrimaryButton({
  children,
  onClick,
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className="h-[52px] w-full rounded-[26px] bg-needle px-5 text-base font-semibold text-white transition-colors duration-150 hover:bg-needle-press active:bg-needle-press"
    >
      {children}
    </button>
  );
}

export function GhostButton({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-[52px] w-full rounded-[26px] border border-ink/20 bg-sheet px-5 text-base font-medium text-ink transition-colors duration-150 hover:border-ink/40"
    >
      {children}
    </button>
  );
}

export function PauseLabel() {
  const { t } = useLocale();
  return <>{t.pause}</>;
}

const LETTERS = ["A", "B", "C", "D", "E", "F"];

export function ChoiceButton({
  index,
  selected,
  onPick,
  children,
}: {
  index: number;
  selected?: boolean;
  onPick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onPick}
      className={
        "flex min-h-14 w-full items-center gap-3 rounded-[10px] border px-4 py-3 text-left text-base transition-colors duration-150 " +
        (selected ? "border-ink bg-needle-soft text-ink ring-1 ring-ink" : "border-line bg-sheet text-ink hover:border-ink/40")
      }
    >
      <span className="numeric w-5 shrink-0 text-xs text-muted">
        {LETTERS[index] ?? index + 1}
      </span>
      <span className="flex-1">{children}</span>
    </button>
  );
}

export function Keypad({
  onDigit,
  onBack,
  onOk,
  withZero = true,
}: {
  onDigit: (d: string) => void;
  onBack: () => void;
  onOk: () => void;
  withZero?: boolean;
}) {
  const { t } = useLocale();
  const keys = withZero ? ["1", "2", "3", "4", "5", "6", "7", "8", "9", "⌫", "0", "OK"] : ["1", "2", "3", "4", "5", "6", "7", "8", "9", "⌫", "OK"];
  return (
    <div className="grid grid-cols-3 gap-2">
      {keys.map((k) => (
        <button
          key={k}
          type="button"
          onClick={() => {
            if (k === "⌫") onBack();
            else if (k === "OK") onOk();
            else onDigit(k);
          }}
          className={
            "min-h-12 rounded-[10px] border text-lg " +
            (k === "OK" ? "border-ink bg-ink font-semibold text-white" : "numeric border-line bg-sheet text-ink hover:border-ink/40") +
            (!withZero && k === "OK" ? " col-span-2" : "")
          }
        >
          {k === "⌫" ? t.clear : k === "OK" ? t.confirm : k}
        </button>
      ))}
    </div>
  );
}
