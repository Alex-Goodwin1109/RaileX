export type TdrReasonId = "medical" | "late-arrival" | "cancelled" | "delayed" | "other";

export type TdrReason = {
  id: TdrReasonId;
  emoji: string;
  label: string;
  /** Fraction of the ticket value refunded, 0–1. */
  rate: number;
  rateLabel: string;
  processing: string;
  note: string;
  documents: string[];
};

export const TDR_DISCLAIMER =
  "ℹ️ This is a guided simulation. For actual TDR filing, visit irctc.co.in or the IRCTC Rail Connect app. Rules subject to IRCTC terms.";

export const TDR_REASONS: TdrReason[] = [
  {
    id: "cancelled",
    emoji: "❌",
    label: "Train was cancelled",
    rate: 1,
    rateLabel: "100%",
    processing: "3 working days",
    note: "Full refund, no cancellation charge.",
    documents: ["No documents needed — cancellation is auto-verified against the train chart."],
  },
  {
    id: "delayed",
    emoji: "⚡",
    label: "Train running very late",
    rate: 1,
    rateLabel: "100%",
    processing: "5 working days",
    note: "Full refund available when the train is more than 4 hours late and you did not travel.",
    documents: [
      "Certificate of late running from the station master (or the running-status screenshot)",
      "Unused e-ticket details",
    ],
  },
  {
    id: "medical",
    emoji: "🏥",
    label: "Medical emergency",
    rate: 0.75,
    rateLabel: "75%",
    processing: "7 working days",
    note: "Partial refund, subject to supporting documents.",
    documents: [
      "Medical certificate from a registered practitioner",
      "Hospital admission or discharge slip, if applicable",
      "Photo ID of the passenger named on the ticket",
    ],
  },
  {
    id: "late-arrival",
    emoji: "🚗",
    label: "Late arrival at station",
    rate: 0.5,
    rateLabel: "50%",
    processing: "7 working days",
    note: "Partial refund if filed within 3 hours of the scheduled departure.",
    documents: [
      "Station master's stamp or remark on the unused ticket",
      "TDR filed within 3 hours of the scheduled departure",
    ],
  },
  {
    id: "other",
    emoji: "📋",
    label: "Other reason",
    rate: 0.5,
    rateLabel: "case by case",
    processing: "7–10 working days",
    note: "Reviewed case by case by the railway refund office.",
    documents: [
      "A short written explanation of what happened",
      "Any supporting proof you have (station remark, correspondence)",
    ],
  },
];

export function estimateRefund(reason: TdrReason, ticketValue: number): number {
  return Math.round(ticketValue * reason.rate);
}

/** Mock reference in the IRCTC-like format TDR<MMYY><6 digits>. */
export function makeTdrReference(): string {
  const now = new Date();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const yy = String(now.getFullYear()).slice(-2);
  const serial = String(Math.floor(Math.random() * 1000000)).padStart(6, "0");
  return `TDR${mm}${yy}${serial}`;
}

export function isTdrIntent(text: string): boolean {
  return /missed\s*(the\s*)?train|missed my train|\btdr\b|टीडीआर|refund|रिफंड|रद्द/i.test(text);
}
