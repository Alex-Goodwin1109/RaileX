/** Persisted app-level settings shared by the nav menu. */
export const THEME_KEY = "rail_theme";
export const SOUND_KEY = "rail_sound";
export const A11Y_KEY = "rail_a11y";

export function loadSound(): boolean {
  if (typeof window === "undefined") return true;
  return window.localStorage.getItem(SOUND_KEY) !== "false";
}

export function saveSound(on: boolean) {
  if (typeof window !== "undefined") window.localStorage.setItem(SOUND_KEY, on ? "true" : "false");
}

export function loadA11y(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(A11Y_KEY) === "true";
}

export function saveA11y(on: boolean) {
  if (typeof window !== "undefined") window.localStorage.setItem(A11Y_KEY, on ? "true" : "false");
}

export function applyA11y(on: boolean) {
  if (typeof document !== "undefined") document.body.classList.toggle("a11y", on);
}
