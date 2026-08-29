/**
 * Historical punctuality mock data. Hardcoded on purpose — no live API.
 */
export const mockDelayData: Record<string, { avgDelayMin: number; onTimePercent: number }> = {
  "12222": { avgDelayMin: 12, onTimePercent: 78 },
  "12101": { avgDelayMin: 47, onTimePercent: 41 },
  "12025": { avgDelayMin: 8, onTimePercent: 85 },
  "11028": { avgDelayMin: 31, onTimePercent: 55 },
  "12289": { avgDelayMin: 62, onTimePercent: 33 },
  "12263": { avgDelayMin: 19, onTimePercent: 71 },
  "12123": { avgDelayMin: 5, onTimePercent: 91 },
  "11301": { avgDelayMin: 88, onTimePercent: 22 },
};

const KEYS = Object.keys(mockDelayData);

/** Trains not present in the mock set map deterministically onto an entry. */
export function getDelayInfo(trainNumber: string) {
  const direct = mockDelayData[trainNumber];
  if (direct) return direct;
  const sum = [...trainNumber].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return mockDelayData[KEYS[sum % KEYS.length]!]!;
}

export type DelayTone = "good" | "warn" | "bad";

export function delayTone(avgDelayMin: number): DelayTone {
  if (avgDelayMin < 15) return "good";
  if (avgDelayMin <= 45) return "warn";
  return "bad";
}

export function delayLabel(avgDelayMin: number): string {
  const tone = delayTone(avgDelayMin);
  if (tone === "good") return "Usually on time";
  if (tone === "warn") return `Avg delay: ${avgDelayMin} min`;
  return `Avg delay: ${avgDelayMin} min ⚠`;
}

/**
 * Mock itinerary: onward connections a traveller has on this trip. A tight
 * buffer plus a large average delay triggers the connection warning.
 */
export const mockItinerary: Record<string, { connectingTrain: string; bufferMin: number }> = {
  t3: { connectingTrain: "12123 Deccan Queen", bufferMin: 35 },
  t5: { connectingTrain: "11007 Deccan Express", bufferMin: 25 },
  t7: { connectingTrain: "12025 Shatabdi", bufferMin: 40 },
};

export function connectionRisk(trainId: string, avgDelayMin: number) {
  const leg = mockItinerary[trainId];
  if (!leg) return null;
  return avgDelayMin > leg.bufferMin ? leg : null;
}

export const DELAY_DISCLAIMER =
  "Delay data shown is historical and may not reflect current conditions. Always arrive at the station before scheduled departure.";
