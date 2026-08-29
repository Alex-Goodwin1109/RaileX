import { useEffect, useRef } from "react";
import { ArrowLeft, User } from "lucide-react";

export type CoachKind = "engine" | "general" | "sleeper" | "ac" | "pantry";

/** Authentic Indian Railways rake order: engine → GEN → SL → 3AC → 2AC → Pantry → 1AC. */
export const RAKE: { label: string; kind: CoachKind }[] = [
  { label: "🚂", kind: "engine" },
  { label: "GEN", kind: "general" },
  { label: "GEN", kind: "general" },
  ...Array.from({ length: 11 }, (_, i) => ({ label: `S${i + 1}`, kind: "sleeper" as CoachKind })),
  ...Array.from({ length: 8 }, (_, i) => ({ label: `B${i + 1}`, kind: "ac" as CoachKind })),
  ...Array.from({ length: 5 }, (_, i) => ({ label: `A${i + 1}`, kind: "ac" as CoachKind })),
  { label: "Pantry", kind: "pantry" },
  { label: "H1", kind: "ac" },
];

/** Mock logic: coaches sit 24 m apart, entrances open near the middle of the platform. */
export const COACH_SPACING_M = 24;

const tint: Record<CoachKind, string> = {
  engine: "border-border bg-muted text-foreground",
  general: "border-border bg-muted/70 text-muted-foreground",
  sleeper: "border-success/50 bg-success/15 text-success",
  ac: "border-primary/50 bg-primary/15 text-primary",
  pantry: "border-warning/50 bg-warning/15 text-warning",
};

type Props = {
  /** e.g. "B4" */
  coach: string;
  platform?: string | undefined;
  /** Station name at the engine end of the platform for this route direction. */
  engineEnd?: string | undefined;
  farEnd?: string | undefined;
  /** Rendered inside an existing panel (no outer glass card, no duplicate heading). */
  embedded?: boolean;
};

export function CoachDiagram({
  coach,
  platform = "3",
  engineEnd = "Pune end",
  farEnd = "Mumbai end",
  embedded = false,
}: Props) {

  const scroller = useRef<HTMLDivElement | null>(null);
  const mine = useRef<HTMLDivElement | null>(null);

  const index = Math.max(
    1,
    RAKE.findIndex((c) => c.label.toLowerCase() === coach.toLowerCase()),
  );
  const myCoach = RAKE[index] ?? RAKE[1]!;
  const entryIndex = Math.round(RAKE.length / 2);
  const distanceFromEntrance = Math.abs(entryIndex - index) * COACH_SPACING_M;
  const towardEngine = index < entryIndex;

  useEffect(() => {
    const box = scroller.current;
    const el = mine.current;
    if (!box || !el) return;
    box.scrollTo({ left: el.offsetLeft - box.clientWidth / 2 + el.clientWidth / 2, behavior: "auto" });
  }, [coach]);

  const Wrapper = embedded ? "div" : "section";

  return (
    <Wrapper className={embedded ? "" : "glass mt-5 rounded-xl p-5"}>
      {!embedded && <h2 className="text-sm font-semibold">🚉 Your coach on the platform</h2>}
      <p className={`text-xs text-muted-foreground ${embedded ? "" : "mt-1"}`}>
        Platform {platform} · ← {engineEnd} ━━━━━━━ {farEnd} →
      </p>

      <div
        ref={scroller}
        className={`-mx-5 mt-4 overflow-x-auto px-5 pb-2 ${embedded ? "flex h-[190px] items-center sm:h-[250px]" : ""}`}
        role="img"
        aria-label={`Rake layout for platform ${platform}; your coach is ${myCoach.label}`}
      >
        <div className="flex min-w-max items-end gap-1.5 pt-6">

          {RAKE.map((c, i) => {
            const isMine = i === index;
            return (
              <div key={`${c.label}-${i}`} ref={isMine ? mine : undefined} className="relative">
                {isMine && (
                  <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-primary">
                    <User className="size-4" />
                  </span>
                )}
                <div
                  className={`grid h-11 min-w-14 place-items-center rounded-md border px-2 text-[11px] font-semibold ${tint[c.kind]} ${
                    isMine ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""
                  }`}
                >
                  {c.kind === "pantry" ? "🍽" : c.label}
                  {isMine && <span aria-hidden> ★</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <p className="mt-2 text-sm font-semibold">
        Coach {myCoach.label} · ~{distanceFromEntrance}m from main entrance
      </p>
      <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-primary">
        <ArrowLeft className="size-3.5" /> Walk toward {towardEngine ? engineEnd : farEnd}
      </p>

      <p className="mt-3 rounded-lg border border-border bg-muted/50 px-3 py-2.5 text-xs leading-relaxed">
        💡 Most station entrances open near the middle of the platform. Coach {myCoach.label} is
        toward the {towardEngine ? "engine" : "rear"} end — head {towardEngine ? "left" : "right"} as
        you enter Platform {platform}.
      </p>

      <p className="mt-3 flex flex-wrap gap-3 text-[11px] text-muted-foreground">
        <span>🔵 AC</span>
        <span>🟢 Sleeper</span>
        <span>⬜ General</span>
        <span>🍽 Pantry</span>
      </p>
    </Wrapper>
  );
}
