import { useEffect, useRef, useState } from "react";
import { TrainFront } from "lucide-react";
import { haptic } from "@/lib/haptics";
import { CoachDiagram } from "@/components/rail/CoachDiagram";
import { TrainPhotoHeader } from "@/components/rail/TrainPhotoHeader";
import { Train3DViewer } from "@/components/rail/Train3DViewer";
import {
  COACH_COLORS,
  FULL_TRAIN_COMPOSITION,
  LIVERIES,
  coachIndexFor,
  hexCss,
  trainTypeFor,
} from "@/lib/train-model";

type Props = {
  coach: string;
  berth?: string | number | undefined;
  trainNumber: string;
  platform?: string;
  engineEnd?: string | undefined;
  farEnd?: string | undefined;
};

const VISIBLE_SPAN = 5;

/** Coach position panel: 2D diagram by default, optional Three.js train viewer. */
export function CoachSection({ coach, berth, trainNumber, platform = "3", engineEnd, farEnd }: Props) {
  const [mode, setMode] = useState<"2d" | "3d">("2d");
  const [fade, setFade] = useState(true);
  const [hint, setHint] = useState(false);
  const [focus, setFocus] = useState<number | null>(null);
  const [centre, setCentre] = useState(coachIndexFor(coach));
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const type = trainTypeFor(trainNumber);
  const livery = LIVERIES[type];
  const myIndex = coachIndexFor(coach);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const switchTo = (next: "2d" | "3d") => {
    if (next === mode) return;
    setFade(false);
    timers.current.push(
      setTimeout(() => {
        setMode(next);
        setFade(true);
        if (next === "3d") {
          setHint(true);
          timers.current.push(setTimeout(() => setHint(false), 3000));
        }
      }, 200),
    );
  };

  const colorFor = (specType: string) =>
    specType === "loco"
      ? hexCss(COACH_COLORS["loco"]!)
      : hexCss(livery?.body ?? COACH_COLORS[specType] ?? 0x555555);

  return (
    <section className="glass mt-5 rounded-xl p-5">
      <div className="flex items-start justify-between gap-3">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold"><TrainFront aria-hidden className="size-4 text-primary" /> Your coach on the platform</h2>
        <div className="flex h-8 shrink-0 overflow-hidden rounded-full border border-border text-[12px]">
          {(["2d", "3d"] as const).map((m) => (
            <button
              key={m}
              type="button"
              aria-pressed={mode === m}
              onClick={() => { haptic.light(); switchTo(m); }}
              className={`px-3 font-medium transition-colors ${mode === m ? "bg-primary text-primary-foreground" : "bg-transparent text-muted-foreground"}`}
            >
              {m === "2d" ? "2D" : "3D"}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3">
        <TrainPhotoHeader type={type} />
      </div>

      <div
        className="mt-4 transition-opacity duration-300"
        style={{ opacity: fade ? 1 : 0 }}
      >
        {mode === "2d" ? (
          <CoachDiagram coach={coach} platform={platform} engineEnd={engineEnd} farEnd={farEnd} embedded />
        ) : (
          <div>
            <Train3DViewer
              coach={coach}
              berth={berth}
              trainType={type}
              focusIndex={focus}
              onCoachFocus={(i) => setFocus(null) ?? setCentre(i)}
              onCameraMove={setCentre}
            />
            <p
              className="mt-1 text-center text-[11px] text-muted-foreground transition-opacity duration-500"
              style={{ opacity: hint ? 1 : 0 }}
            >
              ← Drag to explore the full train →
            </p>

            <div className="relative mt-3 flex items-end gap-1 overflow-hidden rounded-lg border border-border bg-muted/40 p-2">
              {FULL_TRAIN_COMPOSITION.map((spec, i) => {
                const isMine = i === myIndex;
                const inView = Math.abs(i - centre) <= VISIBLE_SPAN;
                return (
                  <button
                    key={spec.id}
                    type="button"
                    aria-label={`Show ${spec.label} in 3D`}
                    onClick={() => setFocus(i)}
                    style={{ background: colorFor(spec.type) }}
                    className={`h-4 flex-1 rounded-[2px] transition-all ${isMine ? "h-6 outline outline-2 outline-[#ffd700]" : ""} ${inView ? "opacity-100" : "opacity-45"}`}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>

      {mode === "3d" && (
        <>
          <p className="mt-3 rounded-lg border border-border bg-muted/50 px-3 py-2.5 text-xs leading-relaxed">
            💡 Walk toward ← engine end · Coach {coach} is ~
            {Math.abs(Math.round(FULL_TRAIN_COMPOSITION.length / 2) - myIndex) * 24}m from the main
            entrance on Platform {platform}.
          </p>
          <p className="mt-3 flex flex-wrap gap-3 text-[11px] text-muted-foreground">
            <span>⬛ GEN</span>
            <span>🟥 SL</span>
            <span>🟦 3AC</span>
            <span>🔵 2AC</span>
            <span>🟣 1AC</span>
            <span>🟩 Pantry</span>
          </p>
        </>
      )}
    </section>
  );
}
