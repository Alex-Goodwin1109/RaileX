import { useEffect, useRef, useState } from "react";
import { Check, Copy, ShieldCheck, X } from "lucide-react";
import { haptic } from "@/lib/haptics";

type Props = {
  message: string;
};

/**
 * Uses the OS share sheet when available (mobile: WhatsApp, Messages, Gmail…).
 * Desktop falls back to a modal with the text pre-selected plus copy-to-clipboard.
 */
export function ShareJourney({ message }: Props) {
  const [fallbackOpen, setFallbackOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const textarea = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (!fallbackOpen) return;
    textarea.current?.focus();
    textarea.current?.select();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setFallbackOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [fallbackOpen]);

  const share = async () => {
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({ title: "My journey details", text: message });
        return;
      } catch {
        /* cancelled or unavailable — fall through to the modal */
      }
    }
    setFallbackOpen(true);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message);
    } catch {
      textarea.current?.select();
      document.execCommand?.("copy");
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => { haptic.medium(); void share(); }}
        className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border border-success/40 bg-success/15 text-sm font-semibold text-success"
      >
        <ShieldCheck className="size-4" /> 🔒 Share my journey for safety
      </button>
      <p className="mt-2 text-center text-[11px] leading-relaxed text-muted-foreground">
        Share your journey details with a trusted contact via WhatsApp, Messages, or any app.
      </p>

      {fallbackOpen && (
        <div
          className="fixed inset-0 z-[80] flex items-end justify-center overflow-hidden bg-overlay/80 p-3 backdrop-blur-xl sm:items-center sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label="Share journey details"
          onMouseDown={(e) => e.target === e.currentTarget && setFallbackOpen(false)}
        >
          <section className="liquid-panel reveal max-h-[88dvh] w-full max-w-lg overflow-y-auto rounded-2xl p-4 shadow-(--shadow-lift) sm:p-5">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
              <div>
                <h2 className="font-semibold">Share your journey</h2>
                <p className="text-xs text-muted-foreground">
                  Copy this and send it to a trusted contact.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setFallbackOpen(false)}
                aria-label="Close share dialog"
                className="grid size-11 place-items-center rounded-full hover:bg-muted"
              >
                <X className="size-4" />
              </button>
            </div>
            <textarea
              ref={textarea}
              readOnly
              value={message}
              rows={10}
              className="form-field mt-4 w-full resize-none font-mono text-xs leading-relaxed"
            />
            <button
              type="button"
              onClick={() => { haptic.success(); void copy(); }}
              className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-success/40 bg-success/15 text-sm font-semibold text-success"
            >
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              {copied ? "Copied to clipboard" : "Copy to clipboard"}
            </button>
          </section>
        </div>
      )}
    </>
  );
}
