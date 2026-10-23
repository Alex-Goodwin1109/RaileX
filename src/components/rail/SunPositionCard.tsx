import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  buildSunForecast,
  MUMBAI_PUNE_BEARING,
  ROUTE_LATITUDE,
  seatsForSide,
} from "@/lib/sun-position";

type Props = {
  /** ISO `YYYY-MM-DD` journey date from booking state. */
  journeyDate?: string;
  /** Departure time (HH:mm) of this specific train. */
  departure?: string;
  /** Arrival time (HH:mm) of this specific train. */
  arrival?: string;
  /** Journey duration in minutes for this specific train. */
  durationMins?: number;
  /** Route bearing in degrees for this specific train. */
  bearing?: number;
  /** Selected booking class — window seat numbers differ by coach layout. */
  cls?: string;
  /** Train label, so the prediction is clearly tied to one service. */
  trainLabel?: string;
};

/**
 * Collapsed by default. Everything is derived locally from the solar geometry
 * helpers in `@/lib/sun-position` — no network request is made. The samples span
 * this train's own running window, not a generic 06:00–18:00 day.
 */
export function SunPositionCard({
  journeyDate,
  departure,
  arrival,
  durationMins,
  bearing = MUMBAI_PUNE_BEARING,
  cls,
  trainLabel,
}: Props) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  const forecast = buildSunForecast(journeyDate, bearing, { dep: departure, arr: arrival, durationMins });
  const morningSeats = seatsForSide(forecast.morningSide, cls);
  const afternoonSeats = seatsForSide(forecast.afternoonSide, cls);

  return (
    <section className="bg-sun-card overflow-hidden rounded-xl border border-warning/30">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex w-full items-center gap-3 px-5 py-4 text-left"
      >
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold text-foreground">☀️ Sun Position Predictor</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Which side of the train gets afternoon sun?
          </p>
        </div>
        <ChevronDown
          className={`size-4 shrink-0 text-warning transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div id={panelId} className="reveal border-t border-warning/25 px-5 pb-5 pt-4">
          <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
            {trainLabel ? `${trainLabel} · ` : ""}heading {Math.round(forecast.bearing)}° ·{" "}
            {ROUTE_LATITUDE}°N
            {departure ? ` · ${departure}${arrival ? `–${arrival}` : ""}` : ""}
          </p>

          <ol className="mt-3 space-y-1.5">
            {forecast.slots.map((slot, i) => (
              <li
                key={`${slot.hour}-${i}`}
                className="grid grid-cols-[4.75rem_1.5rem_minmax(0,1fr)] items-baseline gap-2 text-sm"
              >
                <span className="font-mono text-xs tabular-nums text-muted-foreground">
                  {slot.label}
                </span>
                <span aria-hidden>{slot.emoji}</span>
                <span className="text-foreground">
                  {slot.altitude <= 0 ? (
                    <span className="text-muted-foreground">Sun below horizon ({slot.note})</span>
                  ) : (
                    <>
                      <span className="font-semibold capitalize">{slot.side} side</span>
                      <span className="text-muted-foreground"> ({slot.note})</span>
                    </>
                  )}
                </span>
              </li>
            ))}
          </ol>

          <p className="mt-4 rounded-lg border border-warning/25 bg-warning/10 px-3 py-2.5 text-xs leading-relaxed text-foreground">
            {forecast.nightJourney ? (
              <>
                💡 This service runs entirely after dark, so neither side gets sun. Pick a window
                seat purely for the breeze — {morningSeats.join(", ")} on the {forecast.morningSide}{" "}
                or {afternoonSeats.join(", ")} on the {forecast.afternoonSide}.
              </>
            ) : (
              <>
                💡 For this journey, {forecast.morningSide}-side window seats (
                {morningSeats.join(", ")}) get morning light only.{" "}
                {forecast.afternoonSide === "right" ? "Right" : "Left"}-side seats (
                {afternoonSeats.join(", ")}) will be in direct sun from noon onwards.
              </>
            )}
          </p>

          <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
            ⚠️ Estimate based on route direction and date. Cloud cover, tunnel sections, and platform
            orientation may vary.
          </p>
        </div>
      )}
    </section>
  );
}
