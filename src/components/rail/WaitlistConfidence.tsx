import { CONFIDENCE_TOOLTIP, type WaitlistConfidence } from "@/lib/waitlist-confidence";

const badgeTone: Record<WaitlistConfidence["tone"], string> = {
  green: "border-success/40 bg-success/10 text-success",
  amber: "border-warning/40 bg-warning/10 text-warning",
  red: "border-danger/40 bg-danger/10 text-danger",
};

const barTone: Record<WaitlistConfidence["tone"], string> = {
  green: "bg-success",
  amber: "bg-warning",
  red: "bg-danger",
};

/** Compact badge shown next to an availability chip on the results list. */
export function ConfidenceBadge({ confidence }: { confidence: WaitlistConfidence }) {
  return (
    <span
      tabIndex={0}
      title={CONFIDENCE_TOOLTIP}
      aria-label={`${confidence.code}, ${confidence.score}% likely to confirm. ${CONFIDENCE_TOOLTIP}`}
      className={`group relative cursor-help rounded-lg border px-2.5 py-1 text-xs font-medium outline-none ${badgeTone[confidence.tone]}`}
    >
      {confidence.code} · {confidence.score}% likely to confirm {confidence.trend}
      <span className="pointer-events-none absolute bottom-full left-0 z-20 mb-2 hidden w-56 rounded-lg bg-popover p-2 text-[11px] font-normal leading-snug text-popover-foreground shadow-(--shadow-lift) group-hover:block group-focus-visible:block max-sm:hidden">
        {CONFIDENCE_TOOLTIP}
      </span>
    </span>
  );
}

/** Progress-bar visualisation used on the expanded train detail view. */
export function ConfidenceBar({ confidence }: { confidence: WaitlistConfidence }) {
  return (
    <div className="mt-2">
      <div className="flex items-center justify-between text-[11px] font-medium">
        <span className="text-muted-foreground">{confidence.code} · confirmation chance</span>
        <span className="tabular-nums text-foreground">
          {confidence.score}% {confidence.trend}
        </span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={confidence.score}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${confidence.code} confirmation confidence`}
        className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted"
      >
        <div
          className={`h-full rounded-full transition-[width] duration-500 ${barTone[confidence.tone]}`}
          style={{ width: `${confidence.score}%` }}
        />
      </div>
      <p className="mt-1.5 text-[10px] leading-snug text-muted-foreground">{CONFIDENCE_TOOLTIP}</p>
    </div>
  );
}
