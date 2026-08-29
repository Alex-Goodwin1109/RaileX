/**
 * Waitlist confirmation confidence — pure arithmetic on the mock availability
 * data. No AI, no API, no historical dataset: it is a transparent heuristic and
 * every surface that shows it also shows the "estimate only" disclaimer.
 */

export const WAITLIST_QUOTAS = ["GNWL", "CKWL", "PQWL", "RSWL", "TQWL"] as const;
export type WaitlistQuota = (typeof WAITLIST_QUOTAS)[number];

export type WaitlistInfo = { quota: WaitlistQuota; position: number };

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

/**
 * Reads a waitlist quota + position out of an availability status string such as
 * "GNWL 43" or "WL 3". A bare "WL" carries no quota, so the tooltip text (which
 * spells the quota out) is used as a secondary source before defaulting to GNWL.
 */
export function parseWaitlist(status: string, tooltip = ""): WaitlistInfo | null {
  const haystack = `${status} ${tooltip}`.toUpperCase();

  const explicit = haystack.match(/(GNWL|CKWL|PQWL|RSWL|TQWL)\s*\/?\s*(\d+)/);
  if (explicit) {
    return { quota: explicit[1] as WaitlistQuota, position: Number(explicit[2]) };
  }

  const bare = status.toUpperCase().match(/\bWL\s*\/?\s*(\d+)/);
  if (!bare) return null;

  const quotaOnly = haystack.match(/\b(GNWL|CKWL|PQWL|RSWL|TQWL)\b/);
  return { quota: (quotaOnly?.[1] as WaitlistQuota) ?? "GNWL", position: Number(bare[1]) };
}

/** Whole days between today and the journey date; 0 when the date is unknown. */
export function daysToTravel(journeyDateIso?: string): number {
  if (!journeyDateIso) return 0;
  const target = new Date(`${journeyDateIso}T00:00:00Z`);
  if (Number.isNaN(target.getTime())) return 0;
  const now = new Date();
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return Math.max(0, Math.round((target.getTime() - today) / 86_400_000));
}

/**
 * base = 100 − (waitlistNumber × 1.8), then day-window and quota adjustments,
 * clamped to 5–92.
 */
export function confidenceScore(info: WaitlistInfo, days: number): number {
  let base = 100 - info.position * 1.8;

  if (days <= 1) base -= 25;
  if (days <= 3) base -= 10;
  if (days >= 7) base += 15;

  if (info.quota === "GNWL") base += 5;
  if (info.quota === "CKWL") base -= 20;
  if (info.quota === "PQWL") base -= 30;

  return Math.round(clamp(base, 5, 92));
}

export type ConfidenceTone = "green" | "amber" | "red";

export function confidenceTone(score: number): ConfidenceTone {
  if (score > 70) return "green";
  if (score >= 40) return "amber";
  return "red";
}

/** Direction of travel of the waitlist itself, based on remaining clearing time. */
export function confidenceTrend(days: number): "↑" | "→" | "↓" {
  if (days <= 1) return "↓";
  if (days >= 3) return "↑";
  return "→";
}

export const CONFIDENCE_TOOLTIP =
  "Based on waitlist position, days to travel, and quota type. GNWL clears most reliably on busy routes.";

export const WAITLIST_DISCLAIMER =
  "⚠️ Waitlist predictions are estimates based on historical patterns and are not guaranteed. Always verify on official IRCTC before travel.";

export type WaitlistConfidence = WaitlistInfo & {
  score: number;
  tone: ConfidenceTone;
  trend: "↑" | "→" | "↓";
  /** e.g. "GNWL/43" */
  code: string;
};

/** Returns null when the status is not a waitlist at all. */
export function getWaitlistConfidence(
  status: string,
  tooltip: string,
  journeyDateIso?: string,
): WaitlistConfidence | null {
  const info = parseWaitlist(status, tooltip);
  if (!info) return null;

  const days = daysToTravel(journeyDateIso);
  const score = confidenceScore(info, days);

  return {
    ...info,
    score,
    tone: confidenceTone(score),
    trend: confidenceTrend(days),
    code: `${info.quota}/${info.position}`,
  };
}
