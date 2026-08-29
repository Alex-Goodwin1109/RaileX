import { useState } from "react";
import { MapPin, X } from "lucide-react";
import { GEO_PROMPT_KEY, requestNearestStation } from "@/lib/geo-locate";
import { haptic } from "@/lib/haptics";

type Props = {
  onResolved: (station: string, city: string) => void;
  onDismiss: () => void;
};

/** First-open prompt: ask permission, then set the departure station from the nearest city. */
export function LocationPrompt({ onResolved, onDismiss }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remember = (value: string) => {
    try {
      window.localStorage.setItem(GEO_PROMPT_KEY, value);
    } catch {
      /* storage unavailable */
    }
  };

  const allow = async () => {
    setBusy(true);
    setError(null);
    try {
      const match = await requestNearestStation();
      remember("granted");
      haptic("success");
      onResolved(match.station, match.city);
    } catch (e) {
      haptic("error");
      setError(e instanceof Error ? e.message : "Could not detect your location.");
      setBusy(false);
    }
  };

  const dismiss = () => {
    remember("dismissed");
    onDismiss();
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-overlay/70 p-3 backdrop-blur-xl sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label="Use your location"
      onMouseDown={(e) => e.target === e.currentTarget && dismiss()}
    >
      <section className="liquid-panel reveal w-full max-w-sm rounded-2xl p-5 shadow-(--shadow-lift)">
        <div className="flex items-start justify-between gap-3">
          <span className="grid size-10 place-items-center rounded-full bg-primary/15 text-primary">
            <MapPin className="size-5" />
          </span>
          <button
            type="button"
            onClick={dismiss}
            aria-label="Close location prompt"
            className="grid size-9 place-items-center rounded-full hover:bg-muted"
          >
            <X className="size-4" />
          </button>
        </div>
        <h2 className="mt-3 text-base font-semibold">Use your current location?</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          RaileX will find the nearest railway station and set it as your departure point. You can
          change it any time.
        </p>
        {error && <p className="mt-3 text-xs text-danger">{error}</p>}
        <div className="mt-5 grid gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => { haptic("medium"); void allow(); }}
            className="h-11 rounded-full bg-primary text-sm font-semibold text-primary-foreground disabled:opacity-60"
          >
            {busy ? "Finding nearest station…" : "Allow location"}
          </button>
          <button
            type="button"
            onClick={dismiss}
            className="h-11 rounded-full border border-border text-sm font-medium"
          >
            Not now
          </button>
        </div>
      </section>
    </div>
  );
}
