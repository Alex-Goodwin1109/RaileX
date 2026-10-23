import { useState } from "react";
import { connectionRisk, delayLabel, delayTone, getDelayInfo } from "@/lib/delay-data";

const toneClass = {
  good: "text-success",
  warn: "text-warning",
  bad: "text-danger",
} as const;

/**
 * One subtle punctuality line under the timing row, expandable on hover/tap.
 */
export function DelayInsight({ trainId, trainNumber }: { trainId: string; trainNumber: string }) {
  const [open, setOpen] = useState(false);
  const info = getDelayInfo(trainNumber);
  const tone = delayTone(info.avgDelayMin);
  const risk = connectionRisk(trainId, info.avgDelayMin);

  return (
    <div className="mt-1">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        aria-expanded={open}
        className={`text-left text-xs font-medium ${toneClass[tone]}`}
      >
        {tone === "good" ? "" : "⚠ "}
        {delayLabel(info.avgDelayMin)}
      </button>

      {open && (
        <p className="reveal mt-1 max-w-sm rounded-lg bg-muted px-3 py-2 text-[11px] leading-relaxed text-muted-foreground">
          On time in {info.onTimePercent}% of journeys this year. Commonly delayed due to freight
          priority on this corridor.
        </p>
      )}

      {risk && (
        <p className="mt-2 rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-[11px] leading-relaxed text-warning">
          ⚠ This train's average delay may affect your connection to {risk.connectingTrain}
          {" "}({risk.bufferMin} min buffer). Consider an earlier train.
        </p>
      )}
    </div>
  );
}
