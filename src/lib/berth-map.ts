/**
 * Compartment berth-map helpers. Pure mock data derived from standard Indian
 * Railways sleeper/AC numbering: 8 berths per compartment.
 */
export type BerthSlot =
  | "lower-left"
  | "middle-left"
  | "upper-left"
  | "lower-right"
  | "middle-right"
  | "upper-right"
  | "side-lower"
  | "side-upper";

export const SLOT_ORDER: BerthSlot[] = [
  "lower-left",
  "middle-left",
  "upper-left",
  "lower-right",
  "middle-right",
  "upper-right",
  "side-lower",
  "side-upper",
];

export const SLOT_LABEL: Record<BerthSlot, string> = {
  "lower-left": "Lower",
  "middle-left": "Middle",
  "upper-left": "Upper",
  "lower-right": "Lower",
  "middle-right": "Middle",
  "upper-right": "Upper",
  "side-lower": "Side Lower",
  "side-upper": "Side Upper",
};

export const SLOT_FILL: Record<BerthSlot, string> = {
  "lower-left": "#e8f5e9",
  "middle-left": "#e3f2fd",
  "upper-left": "#fce4ec",
  "lower-right": "#e8f5e9",
  "middle-right": "#e3f2fd",
  "upper-right": "#fce4ec",
  "side-lower": "#fff8e1",
  "side-upper": "#f3e5f5",
};

export const SLOT_DESCRIPTION: Record<BerthSlot, string[]> = {
  "lower-left": ["Easiest access", "No climbing needed", "Shared as seat during day"],
  "lower-right": ["Easiest access", "No climbing needed", "Shared as seat during day"],
  "middle-left": ["Moderate access", "Folds up during day"],
  "middle-right": ["Moderate access", "Folds up during day"],
  "upper-left": ["Requires climbing", "Most privacy", "Good for overnight"],
  "upper-right": ["Requires climbing", "Most privacy", "Good for overnight"],
  "side-lower": ["Faces aisle", "Good for short journeys"],
  "side-upper": ["Most compact", "Best for solo travellers"],
};

export function compartmentOf(berth: number): number {
  return Math.max(1, Math.ceil(berth / 8));
}

/** Berth numbers for a compartment, in SLOT_ORDER order. */
export function compartmentBerths(compartment: number): { slot: BerthSlot; number: number }[] {
  const base = (compartment - 1) * 8;
  return SLOT_ORDER.map((slot, i) => ({ slot, number: base + i + 1 }));
}

export function slotOf(berth: number): BerthSlot {
  const idx = (berth - 1) % 8;
  return SLOT_ORDER[idx]!;
}

export function berthSideLabel(slot: BerthSlot): string {
  if (slot.endsWith("-left")) return "Left side · Window seat";
  if (slot.endsWith("-right")) return "Right side · Aisle";
  return "Side bay · Along the corridor wall";
}

export const CHAIR_COLUMNS = ["A", "B", "C", "D"] as const;

/** Seat rows shown around the traveller's seat in a chair car. */
export function chairRows(seat: number): { rows: number[]; row: number; col: string } {
  const idx = Math.max(0, seat - 1);
  const row = Math.floor(idx / 4) + 1;
  const col = CHAIR_COLUMNS[idx % 4]!;
  const start = Math.max(1, row - 2);
  return { rows: [start, start + 1, start + 2, start + 3, start + 4], row, col };
}
