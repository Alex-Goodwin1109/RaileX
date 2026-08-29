import { useEffect, useState } from "react";
import { X } from "lucide-react";
import logo from "@/assets/railex-logo.png.asset.json";
import { haptic } from "@/lib/haptics";

const YELLOW = "#FFD700";

const FEATURES = [
  "Conversational orb — book in plain Hindi or English, no forms, no jargon",
  "Tatkal preparation — pre-fills everything before the window opens, pings you at the right moment",
  "Waitlist intelligence — estimates your confirmation probability before you book",
  "Sun-side predictor — tells you which window seat avoids afternoon heat, calculated with solar math",
  "3D train viewer — find your exact coach in a scrollable model of the full train",
  "Journey safety broadcast — share your PNR and coach with a trusted contact in one tap",
  "Works offline — your journey details are available even without signal",
  "Zero government server costs — every intelligent feature runs in your browser",
];

const DISCLAIMERS = [
  "RaileX is not a real booking platform. All train availability, fares, PNR numbers, and booking confirmations are simulated with mock data. No real tickets are issued.",
  "This is a student project built for the “Build What Moves India” hackathon. It is not a production system and is not intended for actual travel planning.",
  "RaileX is not affiliated with, endorsed by, or connected to IRCTC, Indian Railways, the Ministry of Railways, or any Government of India agency in any capacity.",
  "Waitlist predictions and delay data are estimates based on mock historical patterns. They are not accurate and should never be used for real travel decisions.",
  "The sun-side prediction is based on approximate solar calculations and route bearing. Actual sun exposure may vary.",
];

const STACK = ["React", "Three.js", "Tailwind CSS", "Web Audio API", "Open-Meteo API", "Web Share API", "Service Worker"];

function Heading({ children, accent = YELLOW }: { children: React.ReactNode; accent?: string }) {
  return (
    <h3 className="mb-2 border-l-[3px] pl-3 text-sm font-semibold text-foreground" style={{ borderColor: accent }}>
      {children}
    </h3>
  );
}

export function InfoModal({ onClose }: { onClose: () => void }) {
  const [closing, setClosing] = useState(false);
  const dismiss = () => setClosing(true);

  useEffect(() => {
    if (!closing) return;
    const t = setTimeout(onClose, 200);
    return () => clearTimeout(t);
  }, [closing, onClose]);

  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setClosing(true);
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, []);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="About RaileX"
      onMouseDown={(e) => e.target === e.currentTarget && dismiss()}
      className="fixed inset-0 z-[90] flex items-center justify-center p-4 backdrop-blur-[4px] transition-opacity duration-200"
      style={{ background: "rgba(0,0,0,0.6)", opacity: closing ? 0 : 1 }}
    >
      <section
        className="relative max-h-[85vh] w-[90vw] max-w-[560px] overflow-y-auto overscroll-contain rounded-2xl border border-border bg-card p-8 text-card-foreground shadow-2xl transition-all duration-[250ms] ease-out"
        style={{ opacity: closing ? 0 : 1, transform: closing ? "scale(0.94)" : "scale(1)" }}
      >
        <button
          type="button"
          onClick={() => { haptic.light(); dismiss(); }}
          aria-label="Close"
          className="absolute right-4 top-4 grid size-8 place-items-center rounded-full text-muted-foreground hover:bg-muted"
        >
          <X className="size-4" />
        </button>

        {/* Header */}
        <div className="text-center">
          <img src={logo.url} alt="RaileX" className="mx-auto h-9 w-auto dark:brightness-0 dark:invert" />
          <p className="mt-2 text-xs text-muted-foreground">A reimagining of train booking in India</p>
        </div>

        <hr className="my-6 border-border" />

        <Heading>Why I built this</Heading>
        <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
          <p>Every day, over 1.4 million Indians book train tickets on IRCTC. I've watched family members spend 20 minutes on a form, lose a Tatkal slot at the payment page, and stare at “GNWL/43” not knowing if their ticket will ever confirm.</p>
          <p>The problem isn't the railway system. India's railways are extraordinary. The problem is the interface between a citizen and their journey.</p>
          <p>I believe that interface can feel effortless, intelligent, and even beautiful, without costing the government a single rupee in new infrastructure for AI model server costs.</p>
        </div>

        <hr className="my-6 border-border" />

        <Heading>What RaileX does</Heading>
        <ul className="space-y-2 text-sm leading-relaxed text-muted-foreground">
          {FEATURES.map((f) => (
            <li key={f} className="flex gap-2">
              <span style={{ color: YELLOW }}>✦</span>
              <span>{f}</span>
            </li>
          ))}
        </ul>

        <hr className="my-6 border-border" />

        <Heading>A personal note</Heading>
        <div className="space-y-3 text-[15px] italic leading-[1.8] text-muted-foreground">
          <p>“I put a lot of time and genuine effort into RaileX. Every feature exists because I asked: what does a real person actually need at this exact moment in their journey?</p>
          <p>I really do wish to see this problem solved — millions of people deserve a booking experience that respects their time, speaks their language, and works even when the signal doesn't.</p>
          <p>If RaileX can show that this is possible, that's enough.”</p>
        </div>
        <p className="mt-3 text-right text-xs text-muted-foreground">— Built for Build What Moves India 2026</p>

        <hr className="my-6 border-border" />

        <Heading accent="#ef4444">Important disclaimers</Heading>
        <div className="space-y-3 text-xs leading-relaxed text-muted-foreground">
          {DISCLAIMERS.map((d) => (
            <p key={d}>⚠ {d}</p>
          ))}
        </div>

        <hr className="my-6 border-border" />

        <h3 className="mb-2 text-sm font-semibold text-foreground">Built with</h3>
        <div className="flex flex-wrap gap-2">
          {STACK.map((s) => (
            <span key={s} className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">{s}</span>
          ))}
        </div>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          AI assistance and orb intelligence powered by OpenAI Codex — used for building the app and training the conversational orb's responses.
        </p>
        <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground/80">
          Destination photos from Unsplash. Train photos from Wikimedia Commons. All used under their respective free-use licenses.
        </p>

        <hr className="my-6 border-border" />

        <p className="text-center text-xs leading-relaxed text-muted-foreground">
          ◉ RaileX · Build What Moves India 2026
          <br />
          Made with care in India 🇮🇳
        </p>
      </section>
    </div>
  );
}
