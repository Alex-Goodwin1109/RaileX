import { useState } from "react";
import { Sparkles } from "lucide-react";
import { renderTripCard, type TripCardData } from "@/lib/trip-card";

export function TripCard(props: TripCardData) {
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const generate = async () => {
    setBusy(true);
    setStatus(null);
    try {
      const blob = await renderTripCard(props);
      const url = URL.createObjectURL(blob);
      setPreview((old) => {
        if (old) URL.revokeObjectURL(old);
        return url;
      });

      const filename = `rail-trip-${props.pnr}.png`;
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setStatus("Card saved to your downloads.");

      const file = new File([blob], filename, { type: "image/png" });
      const nav = navigator as Navigator & { canShare?: (data: ShareData) => boolean };
      if (nav.share && nav.canShare?.({ files: [file] })) {
        try {
          await nav.share({ files: [file], text: "My upcoming journey via RaileX" });
        } catch {
          /* user cancelled the share sheet */
        }
      }
    } catch {
      setStatus("Could not create the card on this device. Try again or take a screenshot.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => void generate()}
        disabled={busy}
        className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border border-primary/40 bg-primary/10 text-sm font-semibold text-primary disabled:opacity-60"
      >
        <Sparkles className="size-4" /> {busy ? "Creating your card…" : "✦ Share your trip card"}
      </button>
      <p className="mt-2 text-center text-[11px] leading-relaxed text-muted-foreground">
        {status ?? "Save this card or share it on WhatsApp, Instagram Stories, or anywhere."}
      </p>
      {preview && (
        <img
          src={preview}
          alt={`Trip card for ${props.origin} to ${props.destination}`}
          width={400}
          height={220}
          className="reveal mx-auto mt-3 w-full max-w-[400px] rounded-xl border border-border"
        />
      )}
    </>
  );
}
