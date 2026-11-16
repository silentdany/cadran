import type { ReactNode } from "react";
import { LangSwitch, useLocale } from "@/components/cadran/locale";

export function Shell({
  kicker,
  title,
  progress,
  onPause,
  children,
}: {
  kicker: string;
  title: string;
  progress: number;
  onPause?: () => void;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-xl flex-col px-5 pb-10 pt-5">
      <header className="sticky top-0 z-10 -mx-5 bg-paper/95 px-5 pb-3 pt-2 backdrop-blur">
        <div className="mb-2 flex items-center justify-between gap-3">
          <p className="label truncate">{kicker}</p>
          <div className="flex shrink-0 items-center gap-3">
            <LangSwitch />
            {onPause && (
              <button type="button" onClick={onPause} className="text-xs text-muted">
                <PauseLabel />
              </button>
            )}
          </div>
        </div>
        <p className="mb-2 text-xs text-muted">{title}</p>
        <div className="h-1 overflow-hidden rounded-full bg-line">
          <div className="h-full rounded-full bg-needle transition-all" style={{ width: `${progress}%` }} />
        </div>
      </header>
      <div className="flex flex-1 flex-col pt-6">{children}</div>
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
      className="min-h-12 w-full rounded-xl bg-ink px-5 text-base font-medium text-paper transition hover:opacity-90"
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
      className="min-h-12 w-full rounded-xl border border-line bg-sheet px-5 text-base font-medium text-ink"
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
        "flex min-h-14 w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-base transition " +
        (selected ? "border-ink bg-ink text-paper" : "border-line bg-sheet text-ink hover:border-ink")
      }
    >
      <span className={"w-5 shrink-0 text-sm font-medium " + (selected ? "text-paper" : "text-muted")}>
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
            "min-h-12 rounded-xl border text-lg font-medium " +
            (k === "OK" ? "border-ink bg-ink text-paper" : "border-line bg-sheet text-ink") +
            (!withZero && k === "OK" ? " col-span-2" : "")
          }
        >
          {k === "⌫" ? t.clear : k === "OK" ? t.confirm : k}
        </button>
      ))}
    </div>
  );
}
