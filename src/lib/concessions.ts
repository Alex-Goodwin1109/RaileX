/** Indian Railways concession lookup (percentage off the base fare, per class). */
export type ConcessionId =
  | "senior-male"
  | "senior-female"
  | "student"
  | "divyaang"
  | "armed-forces"
  | "cancer"
  | "journalist";

export type ConcessionEntry = {
  label: string;
  short: string;
  discounts: Record<string, number>;
};

export const CONCESSIONS: Record<ConcessionId, ConcessionEntry> = {
  "senior-male": {
    label: "Senior Citizen (Male, 60+)",
    short: "Senior Male",
    discounts: { SL: 40, "3AC": 40, "2AC": 40, "1AC": 40, CC: 40, EC: 40 },
  },
  "senior-female": {
    label: "Senior Citizen (Female, 58+)",
    short: "Senior Female",
    discounts: { SL: 50, "3AC": 50, "2AC": 50, "1AC": 50, CC: 50, EC: 50 },
  },
  student: {
    label: "Student (with ID)",
    short: "Student",
    discounts: { SL: 50, "3AC": 25, "2AC": 25, "1AC": 25, CC: 25, EC: 25 },
  },
  divyaang: {
    label: "Divyaang (PwD)",
    short: "Divyaang",
    discounts: { SL: 75, "3AC": 75, "2AC": 75, "1AC": 75, CC: 75, EC: 75 },
  },
  "armed-forces": {
    label: "Armed Forces (serving)",
    short: "Armed Forces",
    discounts: { SL: 50, "3AC": 50, "2AC": 50, "1AC": 50, CC: 50, EC: 50 },
  },
  cancer: {
    label: "Cancer patient",
    short: "Cancer patient",
    discounts: { SL: 75, "3AC": 75, "2AC": 75, "1AC": 75, CC: 75, EC: 75 },
  },
  journalist: {
    label: "Journalist (accredited)",
    short: "Journalist",
    discounts: { SL: 50, "3AC": 50, "2AC": 25, "1AC": 25, CC: 50, EC: 25 },
  },
};

export const CONCESSION_OPTIONS: { value: "" | ConcessionId; label: string }[] = [
  { value: "", label: "None (full fare)" },
  { value: "senior-male", label: "Senior Citizen Male (60+)" },
  { value: "senior-female", label: "Senior Citizen Female (58+)" },
  { value: "student", label: "Student" },
  { value: "divyaang", label: "Divyaang (PwD)" },
  { value: "armed-forces", label: "Armed Forces" },
  { value: "cancer", label: "Cancer Patient" },
  { value: "journalist", label: "Journalist" },
];

export const CONCESSION_DISCLAIMER =
  "Concession subject to valid ID proof at the time of travel.";

/** Maps the results-page quota filter onto a concession id, when one applies. */
export function concessionForQuota(quota: string): ConcessionId | null {
  switch (quota) {
    case "Senior Citizen":
      return "senior-male";
    case "Student":
      return "student";
    case "Divyaang":
      return "divyaang";
    case "Armed Forces":
      return "armed-forces";
    default:
      return null;
  }
}

/** Scans free text (contact-card notes, ID type) for an explicit concession category. */
export function detectConcessionFromText(text?: string): ConcessionId | "" {
  if (!text) return "";
  const t = text.toLowerCase();
  if (/\b(divyaang|divyang|pwd|handicap|disabilit|wheelchair|blind)\b/.test(t)) return "divyaang";
  if (/\b(cancer|oncolog|chemo)\b/.test(t)) return "cancer";
  if (/\b(armed forces|army|navy|air force|jawan|defence|defense|military)\b/.test(t))
    return "armed-forces";
  if (/\b(journalist|press accredit|accredited press)\b/.test(t)) return "journalist";
  if (/\b(student|college|university|school id)\b/.test(t)) return "student";
  if (/\bsenior\b/.test(t)) return "senior-male";
  return "";
}

/**
 * Best-guess concession from the details we already hold for a passenger:
 * explicit hints in a contact card / ID field first, then IR age + gender thresholds.
 */
export function suggestConcession(age: number, gender: string, hints?: string): ConcessionId | "" {
  const fromText = detectConcessionFromText(hints);
  if (fromText === "senior-male") {
    return gender === "F" ? "senior-female" : "senior-male";
  }
  if (fromText) return fromText;
  if (gender === "F" && age >= 58) return "senior-female";
  if (gender === "M" && age >= 60) return "senior-male";
  if (gender === "Other" && age >= 60) return "senior-male";
  return "";
}

/** Concession auto-derived from a passenger record (age, gender, notes, ID type). */
export function autoConcessionFor(p: {
  age: number;
  gender: string;
  notes?: string;
  id_type?: string;
}): ConcessionId | "" {
  return suggestConcession(p.age, p.gender, [p.notes, p.id_type].filter(Boolean).join(" "));
}

export function discountPercent(id: ConcessionId | "" | undefined, cls: string): number {
  if (!id) return 0;
  return CONCESSIONS[id]?.discounts[cls] ?? 0;
}

export type FareLine = { base: number; discount: number; payable: number; percent: number };

export function fareFor(base: number, id: ConcessionId | "" | undefined, cls: string): FareLine {
  const percent = discountPercent(id, cls);
  const discount = Math.round((base * percent) / 100);
  return { base, discount, payable: base - discount, percent };
}
