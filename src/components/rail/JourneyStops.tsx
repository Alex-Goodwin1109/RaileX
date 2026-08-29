import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { haptic } from "@/lib/haptics";
import { getDelayInfo, delayTone } from "@/lib/delay-data";
import { progressIndex, stopsFor, totalDuration, type Stop } from "@/lib/journey-stops";

type Props = {
  trainNumber: string;
  /** Compact spacing for the PNR confirmation screen. */
  compact?: boolean;
  /** Station name where the traveller ordered a meal, if any. */
  mealStop?: string | undefined;
  /** Chosen boarding station — keeps the timeline start accurate. */
  from?: string | undefined;
  /** Chosen destination station — keeps the timeline end accurate. */
  to?: string | undefined;
};

/** Collapsible vertical timeline of the mock route for a train. */
export function JourneyStops({ trainNumber, compact = false, mealStop, from, to }: Props) {
  const [open, setOpen] = useState(false);
  const stops = useMemo(() => stopsFor(trainNumber, from, to), [trainNumber, from, to]);
  const current = useMemo(() => progressIndex(stops), [stops]);
  const info = getDelayInfo(trainNumber);
  const statusLabel = delayTone(info.avgDelayMin) === "good" ? "On time" : `Running ~${info.avgDelayMin} min late`;

  return (
    <div className={compact ? "mt-4" : "mt-3"}>
      <div className="overflow-hidden rounded-xl border border-border bg-muted/40">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            haptic.light();
            setOpen((v) => !v);
          }}
          aria-expanded={open}
          className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left transition-colors hover:bg-muted/70"
        >
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold text-foreground">
              🛤 Route · {stops.length} stops
            </span>
            <span className="block truncate text-[11px] text-muted-foreground">
              {stops[0]?.name} → {stops[stops.length - 1]?.name} · {totalDuration(stops)}
            </span>
          </span>
          <ChevronDown
            className={`size-4 shrink-0 text-primary transition-transform ${open ? "rotate-180" : ""}`}
            aria-hidden="true"
          />
        </button>

        {open && (
          <div className="reveal border-t border-border p-3">
            {current >= 0 && current < stops.length - 1 && (
              <p className="mb-3 rounded-lg bg-success/10 px-3 py-2 text-[11px] font-medium leading-relaxed text-success">
                🚂 Train is currently between {stops[current]!.name} and {stops[current + 1]!.name} ·{" "}
                {statusLabel}
              </p>
            )}

            <ol className="space-y-0">
              {stops.map((s, i) => (
                <StopRow
                  key={s.code}
                  stop={s}
                  isLast={i === stops.length - 1}
                  passed={current >= 0 && i <= current}
                  isCurrentSegment={current === i}
                  mealMatch={Boolean(mealStop && mealStop === s.name)}
                  compact={compact}
                />
              ))}
            </ol>

            <p className="mt-3 border-t border-border pt-2 text-[11px] font-medium text-muted-foreground">
              Total journey: {totalDuration(stops)} · {stops.length} stops
            </p>
          </div>
        )}
      </div>
    </div>
  );
}


function StopRow({
  stop,
  isLast,
  passed,
  isCurrentSegment,
  mealMatch,
  compact,
}: {
  stop: Stop;
  isLast: boolean;
  passed: boolean;
  isCurrentSegment: boolean;
  mealMatch: boolean;
  compact: boolean;
}) {
  const origin = stop.type === "origin";
  const destination = stop.type === "destination";
  const longStop = (stop.halt ?? 0) >= 5;

  const dotColor = passed
    ? "bg-success"
    : origin
      ? "bg-success"
      : destination
        ? "bg-danger"
        : longStop
          ? "bg-warning"
          : "bg-muted-foreground/50";

  const big = origin || destination;
  const lineColor = passed ? "bg-success" : "bg-border";

  return (
    <li className={`grid grid-cols-[24px_minmax(0,1fr)] gap-2 ${compact ? "pb-3" : "pb-4"} last:pb-0`}>
      <div className="flex flex-col items-center">
        <span
          className={`${big ? "size-4" : "size-2.5"} rounded-full ${dotColor}`}
          aria-hidden="true"
        />
        {!isLast && (
          <span
            className={`w-0.5 flex-1 ${lineColor} ${isCurrentSegment ? "animate-pulse" : ""} ${
              stop.halt === null && !origin ? "opacity-60" : ""
            }`}
            aria-hidden="true"
          />
        )}
      </div>

      <div
        className={`-mt-0.5 rounded-lg px-2 py-1 ${
          mealMatch ? "border border-[#b8860b]/50 bg-[#FFD700]/15" : ""
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <p className={`${big ? "text-sm font-semibold" : "text-sm"} text-foreground`}>{stop.name}</p>
          <p className="shrink-0 text-[11px] tabular-nums text-muted-foreground">
            {stop.arr && `ARR ${stop.arr}`}
            {stop.arr && stop.dep && " · "}
            {stop.dep && `DEP ${stop.dep}`}
          </p>
        </div>
        <p className="text-[11px] text-muted-foreground">
          Platform {stop.platform}
          {stop.halt ? ` · ${stop.halt} min halt` : ""}
        </p>
        <div className="mt-1 flex flex-wrap gap-1.5">
          {origin && (
            <span className="rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-semibold text-success">
              YOUR BOARDING
            </span>
          )}
          {destination && (
            <span className="rounded-full bg-danger/15 px-2 py-0.5 text-[10px] font-semibold text-danger">
              YOUR DESTINATION
            </span>
          )}
          {longStop && (
            <span className="rounded-full bg-warning/15 px-2 py-0.5 text-[10px] font-semibold text-warning">
              Long stop
            </span>
          )}
          {stop.hasMeal && !mealMatch && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-foreground">
              🍱 Pantry
            </span>
          )}
          {mealMatch && (
            <span className="rounded-full bg-[#FFD700]/30 px-2 py-0.5 text-[10px] font-semibold text-foreground">
              🍱 Your meal · {stop.name} · {stop.arr ?? stop.dep}
            </span>
          )}
        </div>
      </div>
    </li>
  );
}
