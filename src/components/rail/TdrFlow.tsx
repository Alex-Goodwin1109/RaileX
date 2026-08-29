import { useState } from "react";
import { ChevronDown, LifeBuoy, X } from "lucide-react";
import { haptic } from "@/lib/haptics";
import {
  TDR_DISCLAIMER,
  TDR_REASONS,
  estimateRefund,
  makeTdrReference,
  type TdrReason,
} from "@/lib/tdr";

type Props = {
  ticketValue?: number;
  refundTo?: string;
  onClose: () => void;
};

/** Three-step guided TDR simulation; each step reveals the next on the same panel. */
export function TdrFlow({ ticketValue = 940, refundTo = "UPI (rahul@okaxis)", onClose }: Props) {
  const [reason, setReason] = useState<TdrReason | null>(null);
  const [docsOpen, setDocsOpen] = useState(false);
  const [reference, setReference] = useState<string | null>(null);

  const refund = reason ? estimateRefund(reason, ticketValue) : 0;

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center">
      <div className="liquid-panel reveal max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-2xl p-5 sm:rounded-2xl">
        <div className="flex items-start justify-between gap-3">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-warning">
            <LifeBuoy className="size-4" /> TDR help
          </p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close TDR help"
            className="grid size-8 place-items-center rounded-full text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        {!reference && (
          <>
            <h2 className="mt-2 text-xl font-semibold">Let&apos;s get your refund started</h2>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              TDR (Ticket Deposit Refund) lets you claim a refund if you couldn&apos;t travel.
              We&apos;ll guide you through it.
            </p>

            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Step 1 — What happened?
            </p>
            <div className="mt-3 space-y-2">
              {TDR_REASONS.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => {
                    setReason(r);
                    setDocsOpen(false);
                  }}
                  aria-pressed={reason?.id === r.id}
                  className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left text-sm font-medium transition-colors ${
                    reason?.id === r.id
                      ? "border-warning bg-warning/10"
                      : "border-border hover:border-warning/40"
                  }`}
                >
                  <span className="text-lg">{r.emoji}</span>
                  {r.label}
                </button>
              ))}
            </div>
          </>
        )}

        {reason && !reference && (
          <div className="reveal mt-6 border-t border-border pt-5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Step 2 — Refund preview
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Based on your reason and ticket value (₹{ticketValue}):
            </p>
            <dl className="mt-3 space-y-2 rounded-xl bg-muted/60 p-4 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Estimated refund</dt>
                <dd className="font-semibold text-success">
                  ₹{refund} ({reason.rateLabel})
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Processing time</dt>
                <dd className="font-medium">{reason.processing}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Refund to</dt>
                <dd className="font-medium">{refundTo}</dd>
              </div>
            </dl>
            <p className="mt-2 text-xs text-muted-foreground">{reason.note}</p>

            <button
              type="button"
              onClick={() => { haptic.light(); setDocsOpen((v) => !v); }}
              aria-expanded={docsOpen}
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary"
            >
              What documents do I need?
              <ChevronDown className={`size-4 transition-transform ${docsOpen ? "rotate-180" : ""}`} />
            </button>
            {docsOpen && (
              <ul className="reveal mt-2 list-disc space-y-1 pl-5 text-xs leading-relaxed text-muted-foreground">
                {reason.documents.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
            )}

            <div className="mt-6 border-t border-border pt-5">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Step 3 — Submit
              </p>
              <button
                type="button"
                onClick={() => { haptic.success(); setReference(makeTdrReference()); }}
                className="mt-3 h-11 w-full rounded-full bg-warning text-sm font-semibold text-background"
              >
                Submit TDR Request
              </button>
            </div>
          </div>
        )}

        {reference && (
          <div className="reveal mt-4 rounded-xl border border-success/40 bg-success/10 p-5 text-sm">
            <p className="font-semibold text-success">✓ TDR submitted · Reference: {reference}</p>
            <p className="mt-2 leading-relaxed text-muted-foreground">
              You&apos;ll receive an SMS confirmation. Refund typically processes in 7 working days.
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Reason: {reason?.label} · Estimated refund ₹{refund}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-4 h-10 w-full rounded-full border border-border text-sm font-semibold"
            >
              Done
            </button>
          </div>
        )}

        <p className="mt-5 rounded-lg bg-muted/60 px-3 py-2 text-[11px] leading-relaxed text-muted-foreground">
          {TDR_DISCLAIMER}
        </p>
      </div>
    </div>
  );
}
