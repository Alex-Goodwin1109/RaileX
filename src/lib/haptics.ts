/**
 * Tiered haptics engine.
 *
 * Premium haptics (Android Chrome / any browser exposing the Vibration API with
 * multi-step pattern support) get expressive patterns; devices that only accept a
 * single duration fall back to a basic buzz. Everything else (iOS Safari, desktop)
 * silently no-ops — never throws, never logs.
 *
 * Respects the "Sound & haptics" switch in the top-right menu: if the user muted
 * sound, all haptics are suppressed too.
 */

export type HapticPattern =
  | "selection"
  | "light"
  | "notify"
  | "medium"
  | "heavy"
  | "success"
  | "warning"
  | "urgent"
  | "error"
  | "alarm";

const hasVibration = typeof navigator !== "undefined" && "vibrate" in navigator;

/** Premium (patterned) definitions. */
const PATTERNS: Record<HapticPattern, number | number[]> = {
  selection: 8,
  light: 10,
  notify: 15,
  medium: 25,
  heavy: 40,
  success: [40, 30, 40, 30, 120],
  warning: [28, 70, 28],
  urgent: [80, 50, 80, 50, 200],
  error: [100, 30, 100],
  alarm: [90, 120, 90, 120, 160],
};

/** Basic fallback: a single buzz roughly matching the pattern's energy. */
const BASIC: Record<HapticPattern, number> = {
  selection: 10,
  light: 10,
  notify: 15,
  medium: 25,
  heavy: 40,
  success: 60,
  warning: 50,
  urgent: 90,
  error: 70,
  alarm: 120,
};

/** Multi-step patterns are considered supported when the API accepts arrays. */
const premium = (() => {
  if (!hasVibration) return false;
  try {
    return Array.isArray([]) && typeof navigator.vibrate === "function";
  } catch {
    return false;
  }
})();

function muted(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return window.localStorage.getItem("rail_sound") === "false";
  } catch {
    return false;
  }
}

function fire(pattern: HapticPattern) {
  if (!hasVibration || muted()) return;
  try {
    navigator.vibrate?.(premium ? PATTERNS[pattern] : BASIC[pattern]);
  } catch {
    /* vibration blocked or unsupported */
  }
}

type HapticApi = ((pattern?: HapticPattern) => void) & {
  [K in HapticPattern]: () => void;
} & { throttledSelection: () => void };

const call = ((pattern: HapticPattern = "light") => fire(pattern)) as HapticApi;

(Object.keys(PATTERNS) as HapticPattern[]).forEach((key) => {
  call[key] = () => fire(key);
});

let lastSelection = 0;
/** Dial autocomplete: max one selection tick per 50ms so fast scroll doesn't buzz. */
call.throttledSelection = () => {
  const now = Date.now();
  if (now - lastSelection > 50) {
    fire("selection");
    lastSelection = now;
  }
};

export const haptic = call;
export default call;

export function stopHaptics() {
  if (!hasVibration) return;
  try {
    navigator.vibrate?.(0);
  } catch {
    /* ignore */
  }
}
