import { useEffect, useState } from "react";
import { Send, MessageSquare } from "lucide-react";
import { haptic } from "@/lib/haptics";
import { Orb, type OrbState } from "@/components/Orb";
import { ORB_COPY, type Lang } from "@/lib/rail-lang";

export const ORB_SIZE: Record<OrbState, number> = {
  hero: 120,
  idle: 60,
  listening: 80,
  processing: 76,
  replying: 76,
  support: 76,
  urgent: 90,
};

const RING: Partial<Record<OrbState, string>> = {
  listening: "oklch(0.74 0.15 300)",
  processing: "oklch(0.72 0.14 260)",
  replying: "oklch(0.76 0.14 165)",
  urgent: "oklch(0.75 0.16 55)",
};

type Props = {
  state: OrbState;
  bubble: string | null;
  micActive: boolean;
  amber?: boolean;
  gray?: boolean;
  lang: Lang;
  onLangChange: (lang: Lang) => void;
  onToggleMic: () => void;
  onSend: (text: string) => void;
};

export function Assistant({ state, bubble, micActive, amber, gray, lang, onLangChange, onToggleMic, onSend }: Props) {
  const [typing, setTyping] = useState(false);
  const [text, setText] = useState("");
  const hero = state === "hero";

  // Orb reply / urgent state changes get a matching haptic tick.
  useEffect(() => {
    if (bubble) haptic.notify();
  }, [bubble]);
  useEffect(() => {
    if (state === "urgent") haptic.urgent();
  }, [state]);
  const size = ORB_SIZE[state];
  const ring = gray ? undefined : RING[state];

  const submit = () => {
    const v = text.trim();
    if (!v) return;
    setText("");
    setTyping(false);
    haptic("medium");
    onSend(v);
  };

  return (
    <div
      className={hero
        ? "pointer-events-none absolute left-1/2 top-[clamp(5rem,15vh,9rem)] z-30 flex -translate-x-1/2 flex-col items-start gap-3"
        : "pointer-events-none fixed bottom-5 left-4 z-50 flex flex-col items-start gap-3 sm:bottom-6 sm:left-6"}
    >
      {bubble && !hero && (
        <div className="reveal glass pointer-events-auto max-w-[78vw] rounded-xl px-4 py-3 text-sm leading-snug text-foreground sm:max-w-xs">
          {bubble}
        </div>
      )}

      {typing && !hero && (
        <div className="glass pointer-events-auto flex items-center gap-2 rounded-full px-3 py-2">
          <input
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder={ORB_COPY[lang].placeholder}
            className="w-[52vw] max-w-[240px] bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <button
            type="button"
            onClick={submit}
            aria-label="Send message"
            className="grid size-7 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground"
          >
            <Send className="size-3.5" />
          </button>
        </div>
      )}

      {!hero && (
        <div className="glass pointer-events-auto flex items-center gap-0.5 rounded-full p-0.5 text-[11px] font-semibold">
          {(["en", "hi"] as Lang[]).map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => { haptic("selection"); onLangChange(code); }}
              aria-pressed={lang === code}
              aria-label={code === "en" ? "English" : "Hindi"}
              className={`rounded-full px-2.5 py-1 transition-colors ${
                lang === code ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {code === "en" ? "EN" : "हि"}
            </button>
          ))}
        </div>
      )}

      <div className={`${hero ? "pointer-events-none" : "pointer-events-auto"} flex items-end gap-2`}>
        <button
          type="button"
          onClick={() => { haptic("light"); onToggleMic(); }}
          aria-label={micActive ? "Stop listening" : "Talk to RaileX assistant"}
          className="relative grid place-items-center rounded-full transition-transform duration-300 hover:scale-105"
          style={{ width: size, height: size }}
        >
          {ring && (
            <>
              <span
                className="pointer-events-none absolute inset-0 rounded-full"
                style={{
                  border: `1.5px solid ${ring}`,
                  animation: `rail-ring ${state === "urgent" ? "0.9s" : state === "processing" ? "1.2s" : "1.8s"} ease-out infinite`,
                }}
              />
              {state === "urgent" && (
                <span
                  className="pointer-events-none absolute inset-0 rounded-full"
                  style={{
                    border: `1.5px solid ${ring}`,
                    animation: "rail-ring 0.9s ease-out 0.45s infinite",
                  }}
                />
              )}
            </>
          )}
          <span
            className="pointer-events-none absolute inset-[-30%] rounded-full"
            style={{
              background: gray
                ? "radial-gradient(circle, oklch(0.6 0 0 / 0.25) 0%, transparent 68%)"
                : ring
                ? `radial-gradient(circle, color-mix(in oklab, ${ring} 40%, transparent) 0%, transparent 68%)`
                : amber
                  ? "radial-gradient(circle, oklch(0.78 0.15 62 / 0.35) 0%, transparent 68%)"
                  : "none",
              transition: "background 400ms ease-out",
            }}
          />
          <span
            style={{
              animation: state === "idle" ? "rail-breathe 4s ease-in-out infinite" : undefined,
            }}
          >
            <span className={gray ? "block opacity-70 grayscale" : "block"}>
              <Orb state={state} size={size} micActive={micActive} />
            </span>
          </span>
        </button>

        {!hero && (
          <div className="mb-1 flex flex-col gap-1">
            <button
              type="button"
              onClick={() => { haptic("selection"); setTyping((v) => !v); }}
              aria-label="Type to assistant"
              className="glass grid size-8 place-items-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
            >
              <MessageSquare className="size-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
