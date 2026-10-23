type ConfettiFn = (opts: Record<string, unknown>) => void;

function getConfetti(): ConfettiFn | null {
  const fn = (window as unknown as { confetti?: ConfettiFn }).confetti;
  return typeof fn === "function" ? fn : null;
}

/** Keeps the library's canvas above app content but below the orb. */
function liftCanvas() {
  document.querySelectorAll("canvas").forEach((c) => {
    if (getComputedStyle(c).position === "fixed" && c.style.pointerEvents === "none") {
      c.style.zIndex = "9999";
    }
  });
}

function scale(count: number) {
  const cores = typeof navigator !== "undefined" ? navigator.hardwareConcurrency : undefined;
  return cores && cores <= 2 ? Math.round(count / 2) : count;
}

/** Booking-confirmation celebration: main burst then a softer follow-up. */
export function fireBookingConfetti() {
  const confetti = getConfetti();
  if (!confetti) return;
  confetti({
    particleCount: scale(90),
    spread: 70,
    origin: { x: 0.5, y: 0.55 },
    colors: ["#6d1a1a", "#1565c0", "#FFD700", "#ffffff", "#ff4b1f", "#00c6ff"],
    ticks: 200,
    gravity: 1.1,
    scalar: 0.9,
  });
  liftCanvas();
  window.setTimeout(() => {
    confetti({
      particleCount: scale(35),
      spread: 50,
      origin: { x: 0.5, y: 0.5 },
      colors: ["#FFD700", "#ffffff", "#1565c0"],
      ticks: 150,
      gravity: 0.9,
      scalar: 0.7,
      drift: 0.5,
    });
    liftCanvas();
  }, 300);
}
