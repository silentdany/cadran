import type { ReactNode } from "react";
import { FigureTile, SymbolMark } from "@/components/cadran/glyphs";
import { useLocale } from "@/components/cadran/locale";
import type { StepId } from "@/lib/battery/copy";
import { center, dots } from "@/lib/battery/marks";

function Card({ kicker, children, why }: { kicker: string; children: ReactNode; why: string }) {
  return (
    <section className="mt-6 rounded-2xl border border-line bg-sheet p-4">
      <p className="text-xs font-medium tracking-widest text-copper uppercase">{kicker}</p>
      <div className="mt-3">{children}</div>
      <p className="mt-3 text-sm text-muted">{why}</p>
    </section>
  );
}

function Line({ letter, text, right }: { letter: string; text: string; right?: boolean }) {
  return (
    <div
      className={
        "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm " +
        (right ? "border-ink bg-ink text-paper" : "border-line bg-paper")
      }
    >
      <span className={"w-4 shrink-0 text-xs " + (right ? "text-paper" : "text-muted")}>{letter}</span>
      <span>{text}</span>
    </div>
  );
}

export function BlockExample({ id }: { id: StepId }) {
  const { locale } = useLocale();
  const en = locale === "en";
  const kicker = en ? "Example · not scored" : "Exemple · ça ne compte pas";

  if (id === "sim") {
    return (
      <Card
        kicker={kicker}
        why={
          en
            ? "The general idea (fruit) counts. A detail (seeds, peeling) does not."
            : "L'idée générale (des fruits) compte. Un détail (des pépins, les éplucher) non."
        }
      >
        <p className="font-display text-2xl">{en ? "Apple and orange" : "Pomme et orange"}</p>
        <div className="mt-3 flex flex-col gap-2">
          <Line letter="A" text={en ? "They are often in a bowl" : "Elles sont souvent dans un saladier"} />
          <Line letter="B" text={en ? "They are fruit" : "Ce sont des fruits"} right />
          <Line letter="C" text={en ? "You peel them" : "On les épluche"} />
        </div>
      </Card>
    );
  }

  if (id === "sens") {
    return (
      <Card
        kicker={kicker}
        why={
          en
            ? "“A desert” is an example of the word, not its meaning."
            : "« Un désert » est un exemple du mot, pas son sens."
        }
      >
        <p className="font-display text-2xl">{en ? "Arid" : "Aride"}</p>
        <div className="mt-3 flex flex-col gap-2">
          <Line letter="A" text={en ? "Very old" : "Très ancien"} />
          <Line letter="B" text={en ? "A desert" : "Un désert"} />
          <Line letter="C" text={en ? "Lacking water" : "Qui manque d'eau"} right />
        </div>
      </Card>
    );
  }

  if (id === "mat") {
    const row = [dots(1), dots(2), null];
    return (
      <Card
        kicker={kicker}
        why={
          en
            ? "Each row adds one dot. The empty cell is three dots."
            : "Chaque ligne ajoute un point. La case vide, c'est trois points."
        }
      >
        <div className="grid w-fit grid-cols-3 gap-2">
          {row.map((cell, i) => (
            <FigureTile key={i} marks={cell} />
          ))}
        </div>
        <div className="mt-3 flex items-center gap-3">
          <FigureTile marks={dots(3)} />
          <p className="text-sm font-medium">{en ? "This one." : "Celle-ci."}</p>
        </div>
      </Card>
    );
  }

  if (id === "suite") {
    const frames = [
      [center("triangle", "ink", 34, 0)],
      [center("triangle", "ink", 34, 90)],
      [center("triangle", "ink", 34, 180)],
    ];
    return (
      <Card
        kicker={kicker}
        why={
          en
            ? "It turns a quarter turn: tip up, right, down, then left."
            : "Il tourne d'un quart de tour : pointe en haut, à droite, en bas, puis à gauche."
        }
      >
        <div className="flex flex-wrap gap-2">
          {frames.map((frame, i) => (
            <FigureTile key={i} marks={frame} />
          ))}
          <FigureTile marks={[center("triangle", "ink", 34, 270)]} />
        </div>
        <p className="mt-2 text-xs text-muted">{en ? "The last cell is the answer." : "La dernière case est la réponse."}</p>
      </Card>
    );
  }

  if (id === "span") {
    return (
      <Card
        kicker={kicker}
        why={
          en
            ? "You see 4, then 7. Forward: 4 7. Backward: 7 4."
            : "Tu vois 4, puis 7. À l'endroit : 4 7. À l'envers : 7 4."
        }
      >
        <div className="flex items-center gap-3">
          <span className="grid h-16 w-16 place-items-center rounded-xl border border-line bg-paper font-display text-3xl">4</span>
          <span className="text-muted">→</span>
          <span className="grid h-16 w-16 place-items-center rounded-xl border border-line bg-paper font-display text-3xl">7</span>
        </div>
        <p className="mt-3 text-sm">
          {en ? "Forward" : "Endroit"} <span className="font-medium tabular-nums">4 7</span>
          <span className="mx-2 text-muted">·</span>
          {en ? "Backward" : "Envers"} <span className="font-medium tabular-nums">7 4</span>
        </p>
      </Card>
    );
  }

  if (id === "calc") {
    return (
      <Card
        kicker={kicker}
        why={
          en
            ? "Type 19, then OK. Under 10 seconds adds one extra point."
            : "Tu tapes 19, puis Valider. En moins de 10 secondes, un point de plus."
        }
      >
        <p className="font-display text-4xl tabular-nums">12 + 7</p>
        <p className="mt-2 text-sm">
          {en ? "Answer" : "Réponse"} <span className="font-medium tabular-nums">19</span>
        </p>
      </Card>
    );
  }

  if (id === "scan") {
    return (
      <Card
        kicker={kicker}
        why={
          en
            ? "Look only at the lone symbol. If it appears once in the group, it is present."
            : "Regarde seulement le symbole isolé. S'il apparaît une fois dans le groupe, il est présent."
        }
      >
        <ScanRow ids={[0, 1, 4, 2, 5]} target={1} label={en ? "Present" : "Présent"} />
        <div className="mt-3">
          <ScanRow ids={[0, 1, 4, 2, 5]} target={3} label={en ? "Absent" : "Absent"} />
        </div>
      </Card>
    );
  }

  return (
    <Card
      kicker={kicker}
      why={
        en
          ? "The legend stays on screen. You see the middle symbol, you type 2."
          : "La légende reste affichée. Tu vois le symbole du milieu, tu tapes 2."
      }
    >
      <div className="grid grid-cols-3 gap-2">
        {[0, 1, 2].map((id, n) => (
          <div key={id} className="grid place-items-center rounded-xl border border-line bg-paper py-2">
            <SymbolMark id={id} className="h-8 w-8" />
            <span className="mt-1 text-sm font-medium">{n + 1}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-3">
        <div className="grid h-16 w-16 place-items-center rounded-xl border border-copper bg-paper">
          <SymbolMark id={1} />
        </div>
        <p className="text-sm font-medium">{en ? "Type 2" : "Tape 2"}</p>
      </div>
    </Card>
  );
}

function ScanRow({ ids, target, label }: { ids: number[]; target: number; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg border border-copper bg-paper">
        <SymbolMark id={target} className="h-7 w-7" />
      </div>
      <div className="grid flex-1 grid-cols-5 gap-1 rounded-lg border border-line bg-paper p-1">
        {ids.map((id, i) => (
          <SymbolMark key={i} id={id} className="h-6 w-6" />
        ))}
      </div>
      <span className="w-16 shrink-0 text-right text-sm font-medium">{label}</span>
    </div>
  );
}
