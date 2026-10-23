/**
 * Sun Position Predictor — pure client-side solar geometry, zero API calls.
 *
 * Given a journey date and the compass bearing the train travels along, we work
 * out the sun's azimuth at a few points through the day and compare it with the
 * train bearing to decide which window side catches the sun.
 */

/** Mumbai–Pune corridor constants (mock route data). */
export const ROUTE_LATITUDE = 18.5; // °N
export const MUMBAI_PUNE_BEARING = 100; // ° — east-southeast

export const LEFT_WINDOW_SEATS = [41, 43, 45];
export const RIGHT_WINDOW_SEATS = [42, 44, 46];

const rad = (deg: number) => (deg * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;

export function dayOfYear(date: Date): number {
  const start = Date.UTC(date.getUTCFullYear(), 0, 0);
  const current = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  return Math.round((current - start) / 86_400_000);
}

/** Solar declination for a day of the year, in degrees. */
export function solarDeclination(doy: number): number {
  return 23.45 * Math.sin(rad((360 / 365) * (doy - 81)));
}

/** Hour angle in degrees: 15° per hour away from local solar noon. */
export function hourAngle(localHour: number): number {
  return 15 * (localHour - 12);
}

export type SolarPosition = { altitude: number; azimuth: number };

/**
 * Solar altitude and azimuth in degrees.
 *
 *   altitude = arcsin( sin(lat)·sin(D) + cos(lat)·cos(D)·cos(H) )
 *   azimuth  = arctan( sin(H) / (cos(H)·sin(lat) − tan(D)·cos(lat)) ) + 180
 *
 * The azimuth uses the two-argument form of arctan so the quadrant is resolved
 * correctly; a one-argument arctan collapses morning and afternoon onto the same
 * value and would report the sun in the west before noon.
 */
export function solarPosition(localHour: number, latitude: number, declination: number): SolarPosition {
  const H = rad(hourAngle(localHour));
  const D = rad(declination);
  const lat = rad(latitude);

  const altitude = deg(Math.asin(Math.sin(lat) * Math.sin(D) + Math.cos(lat) * Math.cos(D) * Math.cos(H)));

  const y = Math.sin(H);
  const x = Math.cos(H) * Math.sin(lat) - Math.tan(D) * Math.cos(lat);
  const azimuth = (deg(Math.atan2(y, x)) + 180 + 360) % 360;

  return { altitude, azimuth };
}

/** Signed difference between the sun and the train's heading, in (−180, 180]. */
export function relativeBearing(sunAzimuth: number, trainBearing: number): number {
  let diff = ((sunAzimuth - trainBearing + 540) % 360) - 180;
  if (diff === -180) diff = 180;
  return diff;
}

export type SunSide = "left" | "right";

/**
 * Facing along the direction of travel, a sun that sits clockwise of the
 * heading (positive relative bearing) shines through the right-hand windows.
 */
export function sunSide(sunAzimuth: number, trainBearing: number): SunSide {
  return relativeBearing(sunAzimuth, trainBearing) > 0 ? "right" : "left";
}

export type SunSlot = {
  hour: number;
  label: string;
  emoji: string;
  side: SunSide;
  note: string;
  altitude: number;
  azimuth: number;
};

/** Default sampled points across the daylight portion of the journey. */
const SLOTS: { hour: number; emoji: string; note: string }[] = [
  { hour: 6, emoji: "🌅", note: "soft morning sun" },
  { hour: 9, emoji: "☀️", note: "warming up" },
  { hour: 12, emoji: "☀️", note: "direct afternoon sun" },
  { hour: 15, emoji: "🔆", note: "hottest period" },
  { hour: 18, emoji: "🌇", note: "setting sun, cooler" },
];

/** Emoji + wording for an arbitrary hour, used when sampling a train's own window. */
function describeHour(hour: number, altitude: number): { emoji: string; note: string } {
  if (altitude <= 0) return { emoji: "🌙", note: "after dark, no sun on either side" };
  if (hour < 8) return { emoji: "🌅", note: "soft morning sun" };
  if (hour < 11) return { emoji: "☀️", note: "warming up" };
  if (hour < 14) return { emoji: "☀️", note: "direct afternoon sun" };
  if (hour < 17) return { emoji: "🔆", note: "hottest period" };
  return { emoji: "🌇", note: "setting sun, cooler" };
}

const clockLabel = (hour: number) => {
  const h24 = ((Math.round(hour) % 24) + 24) % 24;
  const suffix = h24 < 12 ? "AM" : "PM";
  const h = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${String(h).padStart(2, "0")}:00 ${suffix}`;
};

/** Parses an ISO `YYYY-MM-DD` journey date, falling back to today. */
export function parseJourneyDate(iso?: string): Date {
  if (iso) {
    const parsed = new Date(`${iso}T00:00:00Z`);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return new Date();
}

/** "06:10" → 6.1666… hours. */
export function parseClock(hhmm?: string): number | null {
  if (!hhmm) return null;
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm.trim());
  if (!m) return null;
  return Number(m[1]) + Number(m[2]) / 60;
}

/** Every 2 hours across the train's own running window (overnight legs wrap past midnight). */
export function journeySampleHours(dep?: string, arr?: string, durationMins?: number): number[] {
  const start = parseClock(dep);
  if (start === null) return SLOTS.map((s) => s.hour);
  const end = parseClock(arr);
  const spanHours =
    durationMins != null
      ? durationMins / 60
      : end !== null
        ? (end - start + 24) % 24 || 24
        : 3;
  const hours: number[] = [];
  for (let t = 0; t <= spanHours + 0.001; t += 2) hours.push((start + t) % 24);
  const last = (start + spanHours) % 24;
  if (hours.length && Math.abs((hours[hours.length - 1] ?? 0) - last) > 0.25) hours.push(last);
  return hours;
}

export type SunForecast = {
  date: Date;
  declination: number;
  bearing: number;
  slots: SunSlot[];
  /** Side that carries the sun from noon onwards. */
  afternoonSide: SunSide;
  /** Side that only ever gets the gentler morning light. */
  morningSide: SunSide;
  /** True when the sampled journey window never sees the sun above the horizon. */
  nightJourney: boolean;
};

export type ForecastOptions = {
  /** Train departure time, `HH:mm`. */
  dep?: string | undefined;
  /** Train arrival time, `HH:mm`. */
  arr?: string | undefined;
  /** Journey duration in minutes, preferred over `arr` when present. */
  durationMins?: number | undefined;
};


export function buildSunForecast(
  journeyDateIso?: string,
  bearing = MUMBAI_PUNE_BEARING,
  options: ForecastOptions = {},
): SunForecast {
  const date = parseJourneyDate(journeyDateIso);
  const declination = solarDeclination(dayOfYear(date));
  const useJourneyWindow = parseClock(options.dep) !== null;
  const hours = useJourneyWindow
    ? journeySampleHours(options.dep, options.arr, options.durationMins)
    : SLOTS.map((s) => s.hour);

  const slots: SunSlot[] = hours.map((hour, i) => {
    const { altitude, azimuth } = solarPosition(hour, ROUTE_LATITUDE, declination);
    const preset = useJourneyWindow ? null : SLOTS[i];
    const described = describeHour(hour, altitude);
    return {
      hour,
      label: clockLabel(hour),
      emoji: preset?.emoji ?? described.emoji,
      side: sunSide(azimuth, bearing),
      note: altitude <= 0 ? described.note : (preset?.note ?? described.note),
      altitude,
      azimuth,
    };
  });

  const daylight = slots.filter((s) => s.altitude > 0);
  const noonSlot =
    daylight.find((s) => s.hour >= 12) ?? daylight[daylight.length - 1] ?? slots[slots.length - 1]!;
  const afternoonSide = noonSlot.side;
  const morningSide: SunSide = afternoonSide === "right" ? "left" : "right";

  return {
    date,
    declination,
    bearing,
    slots,
    afternoonSide,
    morningSide,
    nightJourney: daylight.length === 0,
  };
}

/** Window seat numbers vary by coach layout, so the advice matches the booked class. */
const SEATS_BY_CLASS: Record<string, { left: number[]; right: number[] }> = {
  SL: { left: LEFT_WINDOW_SEATS, right: RIGHT_WINDOW_SEATS },
  "3AC": { left: LEFT_WINDOW_SEATS, right: RIGHT_WINDOW_SEATS },
  "2AC": { left: [9, 11, 13], right: [10, 12, 14] },
  "1AC": { left: [1, 3, 5], right: [2, 4, 6] },
  CC: { left: [1, 4, 7], right: [3, 6, 9] },
  EC: { left: [1, 5, 9], right: [4, 8, 12] },
};

export function seatsForSide(side: SunSide, cls?: string): number[] {
  const set = (cls && SEATS_BY_CLASS[cls]) || SEATS_BY_CLASS["SL"]!;
  return side === "left" ? set.left : set.right;
}

