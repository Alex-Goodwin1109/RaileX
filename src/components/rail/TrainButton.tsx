import { forwardRef, useCallback, useRef, useState, type ButtonHTMLAttributes, type ReactNode } from "react";
import { haptic } from "@/lib/haptics";

/**
 * Artistic side-profile train silhouette: streamlined loco + two coaches,
 * drawn as a single filled path family so it reads cleanly at 14–18px.
 */
export function TrainSilhouette({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 20" aria-hidden className={className} fill="none">
      {/* motion trails */}
      <g opacity="0.55">
        <rect x="0" y="5" width="9" height="1.1" rx="0.55" fill="currentColor" opacity="0.45" />
        <rect x="2" y="9" width="6" height="1.1" rx="0.55" fill="currentColor" opacity="0.3" />
      </g>
      {/* rear coach */}
      <path
        d="M12 6.4c0-1 .8-1.8 1.8-1.8h9.4c1 0 1.8.8 1.8 1.8v7.2c0 1-.8 1.8-1.8 1.8h-9.4c-1 0-1.8-.8-1.8-1.8V6.4Z"
        fill="currentColor"
        opacity="0.82"
      />
      {/* middle coach */}
      <path
        d="M27 6.4c0-1 .8-1.8 1.8-1.8h9.4c1 0 1.8.8 1.8 1.8v7.2c0 1-.8 1.8-1.8 1.8h-9.4c-1 0-1.8-.8-1.8-1.8V6.4Z"
        fill="currentColor"
        opacity="0.9"
      />
      {/* streamlined locomotive */}
      <path
        d="M42 6.2c0-.9.7-1.6 1.6-1.6h6.2c3.9 0 7.4 2.3 9.4 5.1.5.7.5 1.6 0 2.3-.6.9-1.6 1.4-2.7 1.4H43.6c-.9 0-1.6-.7-1.6-1.6V6.2Z"
        fill="currentColor"
      />
      {/* windows cut out of the loco nose */}
      <path d="M50.4 7.1h3.2c1.3.5 2.4 1.3 3.3 2.4h-6.5V7.1Z" fill="var(--train-window, rgba(255,255,255,0.85))" opacity="0.9" />
      {/* bogies */}
      <g fill="currentColor">
        <circle cx="15.6" cy="16.6" r="1.5" />
        <circle cx="21.4" cy="16.6" r="1.5" />
        <circle cx="30.6" cy="16.6" r="1.5" />
        <circle cx="36.4" cy="16.6" r="1.5" />
        <circle cx="46" cy="16.6" r="1.6" />
        <circle cx="53" cy="16.6" r="1.6" />
      </g>
    </svg>
  );
}

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  /** Haptic tier fired on press. */
  feedback?: "light" | "medium" | "success";
};

/**
 * Primary action button: on press a train silhouette glides forward through
 * the button while a soft light sweep follows the track behind it.
 */
export const TrainButton = forwardRef<HTMLButtonElement, Props>(function TrainButton(
  { children, className = "", onClick, feedback = "medium", ...rest },
  ref,
) {
  const [run, setRun] = useState(0);
  const timer = useRef<number | null>(null);

  const handle = useCallback<NonNullable<Props["onClick"]>>(
    (event) => {
      haptic(feedback);
      setRun((n) => n + 1);
      if (timer.current) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setRun(0), 950);
      onClick?.(event);
    },
    [feedback, onClick],
  );

  return (
    <button
      ref={ref}
      {...rest}
      onClick={handle}
      className={`relative isolate overflow-hidden ${run ? "train-press" : ""} ${className}`}
    >
      <span className="relative z-10">{children}</span>
      {run > 0 && (
        <span key={run} aria-hidden className="pointer-events-none absolute inset-0 z-0">
          <span
            className="train-sweep absolute inset-y-0 left-0 w-1/2"
            style={{
              background:
                "linear-gradient(90deg, transparent, color-mix(in oklab, currentColor 22%, transparent), transparent)",
            }}
          />
          <span className="absolute inset-0 flex items-center">
            <span className="train-run inline-flex opacity-90">
              <TrainSilhouette className="h-5 w-16 text-current" />
            </span>
          </span>
        </span>
      )}
    </button>
  );
});
