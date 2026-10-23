import { useEffect, useMemo, useState } from "react";
import { destinationCity } from "@/lib/destination-photos";
import { DestinationPhoto } from "@/components/rail/DestinationPhoto";

type Props = {
  destination: string;
  /** Journey date as entered in search; empty means today. */
  date: string;
  /** Scheduled departure, "HH:MM". */
  departure: string;
  trainNumber: string;
  trainName: string;
  coach: string;
  platform: string;
  onDeparted?: (() => void) | undefined;
};

function departureAt(date: string, departure: string): number {
  const [h = 0, m = 0] = departure.split(":").map(Number);
  const base = date ? new Date(date) : new Date();
  if (Number.isNaN(base.getTime())) base.setTime(Date.now());
  base.setHours(h, m, 0, 0);
  // Without an explicit journey date, a departure already past means tomorrow.
  if (!date && base.getTime() <= Date.now()) base.setDate(base.getDate() + 1);
  return base.getTime();
}

export function JourneyCountdown({
  destination,
  date,
  departure,
  trainNumber,
  trainName,
  coach,
  platform,
  onDeparted,
}: Props) {
  const target = useMemo(() => departureAt(date, departure), [date, departure]);
  const [left, setLeft] = useState(() => Math.max(0, target - Date.now()));

  useEffect(() => {
    setLeft(Math.max(0, target - Date.now()));
    const id = setInterval(() => setLeft(Math.max(0, target - Date.now())), 1000);
    return () => clearInterval(id);
  }, [target]);

  const departed = left <= 0;
  useEffect(() => {
    if (departed) onDeparted?.();
  }, [departed, onDeparted]);

  const days = Math.floor(left / 86400000);
  const hours = Math.floor((left % 86400000) / 3600000);
  const minutes = Math.floor((left % 3600000) / 60000);
  const seconds = Math.floor((left % 60000) / 1000);
  const city = destinationCity(destination);

  return (
    <section className="reveal relative mt-5 overflow-hidden rounded-xl border border-border">
      <DestinationPhoto
        city={city}
        className="absolute inset-0 size-full object-cover"
      />
      {/* Dark gradient overlay — always on top of the photo or gradient fallback */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/10" />
      <div className="relative px-5 pb-6 pt-24 sm:px-7">
        <h2 className="text-3xl font-light tracking-tight text-white sm:text-4xl">{city}</h2>

        {departed ? (
          <p className="mt-4 text-sm font-medium text-white/90">
            Your train departs now · Safe travels 🚂
          </p>
        ) : (
          <>
            <p className="mt-4 text-xs uppercase tracking-[0.18em] text-white/70">
              Your journey begins in
            </p>
            <div className="mt-3 grid max-w-sm grid-cols-4 gap-2">
              {[
                [days, "days"],
                [hours, "hours"],
                [minutes, "minutes"],
                [seconds, "seconds"],
              ].map(([value, label]) => (
                <div
                  key={label as string}
                  className="rounded-lg border border-white/15 bg-white/10 py-2 text-center backdrop-blur-sm"
                >
                  <p className="font-mono text-xl font-semibold tabular-nums text-white">
                    {String(value).padStart(2, "0")}
                  </p>
                  <p className="text-[10px] uppercase tracking-wide text-white/70">{label}</p>
                </div>
              ))}
            </div>
          </>
        )}

        <p className="mt-4 text-[11px] text-white/60">
          {trainNumber} {trainName} · Coach {coach} · Platform {platform}
        </p>
      </div>
    </section>
  );
}
