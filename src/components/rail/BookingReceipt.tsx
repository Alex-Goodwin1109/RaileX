import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { Filters } from "@/lib/rail-intents";
import type { RailPreferences } from "@/lib/traveller-store";

type Props = {
  totalTrains: number;
  filteredCount: number;
  preferences: RailPreferences;
  filters: Filters;
  passengerCount: number;
  tatkal: boolean;
};

const RAIL_SECONDS = 52;
const IRCTC_SECONDS = 8 * 60 + 14; // 8 min 14 sec

function formatPreferences(preferences: RailPreferences, filters: Filters): string {
  const parts: string[] = [];
  if (filters.quota === "Senior Citizen") parts.push("senior citizen");
  if (preferences.lowerBerth || filters.lowerOnly) parts.push("lower berth");
  if (preferences.acPreference === "ac" || filters.classes.every((c) => ["1AC", "2AC", "3AC"].includes(c))) {
    parts.push("AC");
  } else if (preferences.acPreference === "non-ac") {
    parts.push("non-AC");
  }
  if (parts.length === 0) return "your saved settings";
  return parts.join(" · ");
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds} sec`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s === 0 ? `${m} min` : `${m} min ${s} sec`;
}

export function BookingReceipt({
  totalTrains,
  filteredCount,
  preferences,
  filters,
  passengerCount,
  tatkal,
}: Props) {
  const [open, setOpen] = useState(false);
  const prefLabel = formatPreferences(preferences, filters);

  const items = [
    { id: "station", text: "Detected your nearest station automatically" },
    {
      id: "filter",
      text: `Filtered ${totalTrains} trains down to ${filteredCount} matching your needs`,
    },
    { id: "prefs", text: `Applied your preferences: ${prefLabel}` },
    { id: "pax", text: `Pre-filled ${passengerCount} passenger profile${passengerCount === 1 ? "" : "s"}` },
    ...(tatkal ? [{ id: "tatkal", text: "Set Tatkal reminder for 09:55 AM" }] : []),
    { id: "time", text: "Booking completed in 52 seconds" },
  ];

  const railPct = Math.max(2, Math.round((RAIL_SECONDS / IRCTC_SECONDS) * 100));

  return (
    <div className="reveal mt-6 overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-(--shadow-soft)">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-5 py-4 text-left"
        aria-expanded={open}
      >
        <span className="text-sm font-semibold">What RaileX did for you</span>
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          See what we did
          <ChevronDown
            className={`size-3.5 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          />
        </span>
      </button>

      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="border-t border-border px-5 py-5">
            <ul className="space-y-3">
              {items.map((item, i) => (
                <li
                  key={item.id}
                  className={`flex items-start gap-3 text-sm ${
                    open ? "receipt-item-in" : "receipt-item-out"
                  }`}
                  style={{ animationDelay: `${i * 150}ms` }}
                >
                  <span
                    className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-success/10 text-success"
                    aria-hidden="true"
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                      className="text-success"
                    >
                      <path
                        d="M2 6L5 9L10 3"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <span className="text-foreground/90">{item.text}</span>
                </li>
              ))}
            </ul>

            <div className="my-5 h-px bg-border" aria-hidden="true" />

            <div className="space-y-4">
              <p className="text-sm font-semibold">Average time on IRCTC.co.in</p>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium">RaileX</span>
                  <span className="tabular-nums text-muted-foreground">{formatDuration(RAIL_SECONDS)}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-foreground transition-[width] duration-700 ease-out"
                    style={{ width: open ? `${railPct}%` : "0%" }}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium">IRCTC</span>
                  <span className="tabular-nums text-muted-foreground">{formatDuration(IRCTC_SECONDS)}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-foreground/40 transition-[width] duration-700 ease-out"
                    style={{ width: open ? "100%" : "0%" }}
                  />
                </div>
              </div>
            </div>

            <p className="mt-4 text-xs italic leading-relaxed text-muted-foreground">
              IRCTC average based on user research. RaileX timing is measured from first interaction
              to mock booking confirmation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
