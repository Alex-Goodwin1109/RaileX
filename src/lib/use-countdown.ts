import { useEffect, useState } from "react";

/** Mock live countdown, starting from a fixed offset in seconds. */
export function useCountdown(startSeconds: number, running = true) {
  const [left, setLeft] = useState(startSeconds);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [running]);

  useEffect(() => setLeft(startSeconds), [startSeconds]);

  const h = Math.floor(left / 3600);
  const m = Math.floor((left % 3600) / 60);
  const s = left % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return { left, text: `${pad(h)}:${pad(m)}:${pad(s)}` };
}
