/**
 * Mock intermediate stops per train. Hardcoded on purpose — no live API.
 */
export type Stop = {
  name: string;
  code: string;
  arr: string | null;
  dep: string | null;
  platform: number;
  halt: number | null;
  type: "origin" | "stop" | "destination";
  hasMeal?: boolean;
};

export const MOCK_STOPS: Record<string, Stop[]> = {
  "12222": [
    { name: "Pune Jn", code: "PUNE", arr: null, dep: "06:15", platform: 1, halt: null, type: "origin" },
    { name: "Shivajinagar", code: "SVJR", arr: "06:28", dep: "06:30", platform: 2, halt: 2, type: "stop" },
    { name: "Khadki", code: "KK", arr: "06:38", dep: "06:40", platform: 1, halt: 2, type: "stop" },
    { name: "Dadar", code: "DDR", arr: "08:42", dep: "08:50", platform: 5, halt: 8, type: "stop", hasMeal: true },
    { name: "Kurla", code: "KYN", arr: "09:05", dep: "09:07", platform: 3, halt: 2, type: "stop" },
    { name: "Thane", code: "TNA", arr: "09:18", dep: "09:20", platform: 4, halt: 2, type: "stop" },
    { name: "Mumbai CSMT", code: "CSTM", arr: "09:50", dep: null, platform: 18, halt: null, type: "destination" },
  ],
};

const FALLBACK_TEMPLATE: Stop[] = MOCK_STOPS["12222"]!;

function codeFor(name: string): string {
  return name
    .replace(/[^A-Za-z ]/g, "")
    .split(/\s+/)
    .map((w) => w[0] ?? "")
    .join("")
    .toUpperCase()
    .slice(0, 5);
}

/**
 * Trains outside the mock set reuse the template route. When the traveller's
 * chosen origin / destination are known, the first and last stop are renamed
 * so the timeline always matches the booked journey.
 */
export function stopsFor(trainNumber: string, from?: string, to?: string): Stop[] {
  const base = MOCK_STOPS[trainNumber] ?? FALLBACK_TEMPLATE;
  if (!from && !to) return base;
  return base.map((s, i) => {
    if (i === 0 && from && from !== s.name) return { ...s, name: from, code: codeFor(from) };
    if (i === base.length - 1 && to && to !== s.name) return { ...s, name: to, code: codeFor(to) };
    return s;
  });
}

function toMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

export function totalDuration(stops: Stop[]): string {
  const start = stops[0]?.dep;
  const end = stops[stops.length - 1]?.arr;
  if (!start || !end) return "";
  let mins = toMinutes(end) - toMinutes(start);
  if (mins < 0) mins += 24 * 60;
  return `${Math.floor(mins / 60)}h ${mins % 60}min`;
}

/**
 * Mock live progress: index of the last passed stop based on the current
 * wall-clock time. Returns -1 when the journey has not started.
 */
export function progressIndex(stops: Stop[], now = new Date()): number {
  const nowMin = now.getHours() * 60 + now.getMinutes();
  let last = -1;
  stops.forEach((s, i) => {
    const t = s.dep ?? s.arr;
    if (t && toMinutes(t) <= nowMin) last = i;
  });
  if (last === stops.length - 1) return -1; // journey finished — show static route
  return last;
}
