import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { fallback, zodValidator } from "@tanstack/zod-adapter";
import { useCallback, useEffect, useRef, useState } from "react";

import { z } from "zod";
import type { OrbState } from "@/components/Orb";
import { Assistant } from "@/components/rail/Assistant";
import { SearchStage } from "@/components/rail/SearchStage";
import { Results, applyFilters } from "@/components/rail/Results";
import { Booking } from "@/components/rail/Booking";
import { FlightResults } from "@/components/rail/FlightResults";
import { AccountPanel } from "@/components/rail/AccountPanel";
import { DEFAULT_FILTERS, resolveIntent, type Filters } from "@/lib/rail-intents";
import { ORB_COPY, loadLang, resolveHindiIntent, saveLang, type Lang } from "@/lib/rail-lang";
import { TRAINS, type Train } from "@/lib/rail-data";
import { useTravellerStore } from "@/lib/traveller-store";
import logo from "@/assets/railex-logo.png.asset.json";
import { LocationPrompt } from "@/components/rail/LocationPrompt";
import { GEO_PROMPT_KEY } from "@/lib/geo-locate";
import notificationSound from "@/assets/cyberpunk_ringtone.mp3.asset.json";
import { TdrFlow } from "@/components/rail/TdrFlow";
import { isTdrIntent } from "@/lib/tdr";
import { loadSound, saveSound, loadA11y, saveA11y, applyA11y, THEME_KEY } from "@/lib/settings";
import { NavMenu } from "@/components/rail/NavMenu";
import { LoginGate, LOGIN_KEY } from "@/components/rail/LoginGate";
import { InfoModal } from "@/components/rail/InfoModal";
import { haptic, stopHaptics } from "@/lib/haptics";
import { useOnline } from "@/lib/use-online";
import { OfflineBanner } from "@/components/rail/OfflineBanner";



const searchSchema = z.object({
  view: fallback(z.string(), "search").default("search"),
  from: fallback(z.string(), "Solapur Jn").default("Solapur Jn"),
  to: fallback(z.string(), "Pune Junction").default("Pune Junction"),
  date: fallback(z.string(), "").default(""),
  mode: fallback(z.string(), "train").default("train"),
  train: fallback(z.string(), "").default(""),
  tatkal: fallback(z.string(), "").default(""),
});

export const Route = createFileRoute("/")({
  validateSearch: zodValidator(searchSchema),
  head: () => ({ meta: [
    { title: "RaileX — Smart Train Booking" },
    { name: "description", content: "Search trains, understand availability, manage travellers and simulate a complete railway booking." },
    { property: "og:title", content: "RaileX — Smart Train Booking" },
    { property: "og:description", content: "A mobile-first railway booking experience with plain-English availability and persistent travellers." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ]}),
  component: RailApp,
});

export function RailApp() {
  const search = Route.useSearch(); const navigate = useNavigate({ from: "/" });
  const [authed, setAuthed] = useState<boolean | null>(null); const [infoOpen, setInfoOpen] = useState(false);
  const [dark, setDarkState] = useState(true); const [themeReady, setThemeReady] = useState(false); const [orb, setOrb] = useState<OrbState>(search.view === "search" ? "hero" : "idle"); const [bubble, setBubble] = useState<string | null>(null); const [mic, setMic] = useState(false); const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS); const [accountOpen, setAccountOpen] = useState(false); const [tatkalAlert, setTatkalAlert] = useState(false); const [lang, setLangState] = useState<Lang>("en"); const [tdrOpen, setTdrOpen] = useState(false); const [muted, setMutedState] = useState(false); const [askLocation, setAskLocation] = useState(false); const [a11y, setA11yState] = useState(false);
  const online = useOnline();
  const { passengers, setPassengers, preferences, setPreferences } = useTravellerStore();
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const audio = useRef<HTMLAudioElement | null>(null);
  const stage = ["results", "booking"].includes(search.view) ? search.view : "search";
  const selectedTrain = TRAINS.find((t) => t.id === search.train);
  useEffect(() => {
    const saved = window.localStorage.getItem(THEME_KEY);
    if (saved === "light") setDarkState(false);
    if (saved === "dark") setDarkState(true);
    setAuthed(window.localStorage.getItem(LOGIN_KEY) === "1");
    setThemeReady(true);
    setLangState(loadLang());
    setMutedState(!loadSound());
    const savedA11y = loadA11y();
    setA11yState(savedA11y);
    applyA11y(savedA11y);
    if (savedA11y) setFilters((f) => ({ ...f, lowerOnly: true }));
    if (!window.localStorage.getItem(GEO_PROMPT_KEY)) setAskLocation(true);
  }, []);
  useEffect(() => { if (!themeReady) return; document.documentElement.classList.toggle("dark", dark); window.localStorage.setItem(THEME_KEY, dark ? "dark" : "light"); }, [dark, themeReady]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  useEffect(() => {
    if (stage !== "search") setOrb("idle");
  }, [stage]);
  const wasOnline = useRef(true);
  useEffect(() => {
    if (!online) {
      wasOnline.current = false;
      setOrb("idle");
      setBubble("Offline mode. Your journey details are saved.");
      return;
    }
    if (wasOnline.current) return;
    wasOnline.current = true;
    setOrb("replying");
    setBubble("You're back online.");
    const id = window.setTimeout(() => { setOrb("idle"); setBubble(null); }, 3000);
    return () => window.clearTimeout(id);
  }, [online]);

  useEffect(() => { setFilters((f) => ({ ...f, lowerOnly: preferences.lowerBerth, classes: preferences.acPreference === "ac" ? ["1AC", "2AC", "3AC"] : preferences.acPreference === "non-ac" ? ["SL"] : f.classes })); }, [preferences.acPreference, preferences.lowerBerth]);
  const langRef = useRef<Lang>("en");
  langRef.current = lang;
  const viewRef = useRef(search.view);
  viewRef.current = search.view;
  const setLang = useCallback((next: Lang) => { setLangState(next); saveLang(next); }, []);
  const clearTimers = () => { timers.current.forEach(clearTimeout); timers.current = []; };
  const later = (fn: () => void, ms: number) => timers.current.push(setTimeout(fn, ms));
  const beeper = useRef<{ ctx: AudioContext; stop: () => void } | null>(null);
  const alarmHaptics = useRef<number | null>(null);
  const stopAlert = useCallback(() => {
    stopHaptics();
    if (alarmHaptics.current) { window.clearInterval(alarmHaptics.current); alarmHaptics.current = null; }
    if (audio.current) { audio.current.pause(); audio.current.currentTime = 0; }
    beeper.current?.stop();
    beeper.current = null;
    setTatkalAlert(false);
  }, []);
  /** Web Audio fallback so the alert is always audible, even if the file fails to load. */
  const startFallbackBeep = useCallback(() => {
    if (beeper.current) return;
    try {
      const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new Ctor();
      const gain = ctx.createGain();
      gain.gain.value = 0;
      gain.connect(ctx.destination);
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = 880;
      osc.connect(gain);
      osc.start();
      const id = window.setInterval(() => {
        const t = ctx.currentTime;
        osc.frequency.setValueAtTime(osc.frequency.value === 880 ? 1320 : 880, t);
        gain.gain.cancelScheduledValues(t);
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.exponentialRampToValueAtTime(0.25, t + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
      }, 700);
      beeper.current = { ctx, stop: () => { window.clearInterval(id); osc.stop(); void ctx.close(); } };
    } catch { /* audio unavailable */ }
  }, []);
  const startTatkalPrep = useCallback(() => {
    setFilters((f) => ({ ...f, quota: "Tatkal", tatkalOnly: true }));
    setOrb("replying");
    setBubble(ORB_COPY[langRef.current].tatkalPrep);
    void navigate({ search: (prev) => ({ ...prev, view: "results", train: "", mode: "train", tatkal: "prep" }) });
  }, [navigate]);
  const startAlert = useCallback(() => {
    setTatkalAlert(true);
    haptic.urgent();
    if (alarmHaptics.current) window.clearInterval(alarmHaptics.current);
    alarmHaptics.current = window.setInterval(() => haptic.urgent(), 2000);
    const sound = new Audio(notificationSound.url);
    sound.loop = true;
    sound.preload = "auto";
    sound.volume = 0.8;
    sound.addEventListener("error", startFallbackBeep);
    audio.current = sound;
    void sound.play().catch(startFallbackBeep);
    // Intentionally no auto-stop: the ringtone keeps looping until the user taps
    // anywhere on screen or the alert notification itself.
    setOrb("urgent");
    setBubble(ORB_COPY[langRef.current].tatkalAlert);
  }, [startFallbackBeep]);
  const beginTatkalSimulation = useCallback((train: Train) => {
    setOrb("idle");
    setBubble(null);
    void navigate({ search: (prev) => ({ ...prev, view: "booking", train: train.id, mode: "train", tatkal: "active" }) });
  }, [navigate]);

  const openTdr = useCallback(() => { setTdrOpen(true); setOrb("support"); setBubble(langRef.current === "hi" ? "TDR रिफंड में मदद कर रहा हूं — कारण चुनें।" : "Opening TDR help — pick what happened and I'll estimate your refund."); }, []);
  const send = useCallback((text: string) => { clearTimers(); setMic(false); if (isTdrIntent(text)) { openTdr(); return; } setOrb("processing"); setBubble(null); later(() => { const res = langRef.current === "hi" ? resolveHindiIntent(text, (patch) => applyFilters({ ...DEFAULT_FILTERS, ...patch }).length) : resolveIntent(text); if (res.patch) setFilters((f) => ({ ...f, ...res.patch })); setOrb("replying"); if (res.offerPrep) startTatkalPrep(); setBubble(res.reply); later(() => { setOrb("idle"); setBubble(null); }, 8000); }, 600); }, [startTatkalPrep, openTdr]);
  const setSoundOn = useCallback((on: boolean) => { saveSound(on); setMutedState(!on); }, []);
  const a11yAnnounced = useRef(false);
  const setA11y = useCallback((on: boolean) => {
    setA11yState(on); saveA11y(on); applyA11y(on);
    if (on) {
      setFilters((f) => ({ ...f, lowerOnly: true }));
      if (!a11yAnnounced.current) {
        a11yAnnounced.current = true;
        setOrb("replying");
        setBubble("Accessible mode on — lower berths and larger text enabled.");
        later(() => { setOrb(viewRef.current === "search" ? "hero" : "idle"); setBubble(null); }, 6000);
      }
    }
  }, []);
  const onConfirmed = useCallback(() => { setOrb("replying"); later(() => setOrb("idle"), 2200); }, []);
  const setDark = useCallback((value: boolean | ((current: boolean) => boolean)) => setDarkState(value), []);
  const goHome = () => { clearTimers(); stopAlert(); setFilters(DEFAULT_FILTERS); setBubble(null); setOrb("hero"); void navigate({ search: { view: "search", from: search.from, to: "Pune Junction", date: "", mode: "train", train: "", tatkal: "" } }); };
  if (authed === null) return null;
  if (!authed) return <LoginGate onSuccess={() => setAuthed(true)} />;
  return <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground" onPointerDown={() => { if (tatkalAlert) { haptic.light(); stopAlert(); } }}>
    <OfflineBanner online={online} />
    <div aria-hidden className="pointer-events-none fixed inset-0 bg-atmosphere" />
    <header className="fixed inset-x-0 top-0 z-40 border-b border-transparent bg-background/60 backdrop-blur-md"><div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-5"><button type="button" onClick={goHome} className="flex items-center gap-2 text-sm font-semibold"><img src={logo.url} alt="RaileX" className="h-6 w-auto dark:brightness-0 dark:invert" /></button><div className="flex items-center gap-2"><button type="button" onClick={() => { haptic.light(); setInfoOpen(true); }} aria-label="About RaileX" className="grid size-[34px] shrink-0 place-items-center rounded-full text-[16px] font-bold text-black transition-all duration-150 hover:scale-[1.08] active:scale-95" style={{ background: "#FFD700", boxShadow: "0 2px 8px rgba(255,215,0,0.5)" }}>&#8505;</button><NavMenu dark={dark} onDarkChange={setDark} soundOn={!muted} onSoundChange={setSoundOn} a11y={a11y} onA11yChange={setA11y} onProfile={() => setAccountOpen(true)} /></div></div></header>
    <main className="relative">
       {stage === "search" && !online && <div className="mx-auto max-w-md px-5 pt-40 text-center"><p className="text-sm font-medium text-foreground">Search requires connection</p><p className="mt-1 text-sm text-muted-foreground">Your saved journeys are available below</p></div>}
       {stage === "search" && online && <SearchStage origin={search.from} onOriginChange={(from) => void navigate({ search: (prev) => ({ ...prev, from }), replace: true })} onDestinationChosen={() => setBubble(null)} onComplete={({ destination, date, mode }) => { void navigate({ search: { view: "results", from: search.from, to: destination, date, mode, train: "", tatkal: "" } }); }} />}
       {stage === "results" && (search.mode === "flight" ? <FlightResults route={search} /> : <Results filters={filters} setFilters={setFilters} route={search} passengers={passengers} selectedTrainId={search.train} tatkalPrep={search.tatkal === "prep"} onPrepareTatkal={startTatkalPrep} onSelectTrain={(train: Train) => search.tatkal === "prep" ? beginTatkalSimulation(train) : void navigate({ search: (prev) => ({ ...prev, view: "booking", train: train.id, tatkal: "" }) })} />)}
       {stage === "booking" && selectedTrain && <Booking train={selectedTrain} route={search} passengers={passengers} onPassengersChange={setPassengers} initialTatkal={search.tatkal === "active"} onStartAlert={startAlert} onStopAlert={stopAlert} onBack={() => window.history.back()} onConfirmed={onConfirmed} onTdrOpen={openTdr} totalTrains={TRAINS.length} filteredCount={applyFilters(filters).length} filters={filters} preferences={preferences} />}
      {stage === "booking" && !selectedTrain && <div className="mx-auto max-w-md px-5 pt-32 text-center"><p className="text-muted-foreground">That train is no longer available.</p><button type="button" onClick={() => void navigate({ search: (prev) => ({ ...prev, view: "results", train: "" }), replace: true })} className="mt-4 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground">Back to results</button></div>}
    </main>
     {tatkalAlert && <button type="button" onClick={stopAlert} className="liquid-panel reveal fixed right-4 top-20 z-[65] max-w-[calc(100vw-2rem)] rounded-xl px-4 py-3 text-left text-sm shadow-(--shadow-lift) sm:right-6"><span className="block font-semibold text-warning">Tatkal preparation alert</span><span className="text-xs text-muted-foreground">Tatkal window active · tap anywhere to silence</span></button>}
    <Assistant gray={!online} state={orb} lang={lang} onLangChange={setLang} bubble={bubble} micActive={mic} onToggleMic={() => { if (orb === "hero") return; setMic((v) => !v); setOrb(mic ? "idle" : "listening"); setBubble(mic ? null : ORB_COPY[lang].listening); }} onSend={send} />
    {askLocation && <LocationPrompt onResolved={(station) => { setAskLocation(false); void navigate({ search: (prev) => ({ ...prev, from: station }), replace: true }); }} onDismiss={() => setAskLocation(false)} />}
    {tdrOpen && <TdrFlow onClose={() => { setTdrOpen(false); setOrb("idle"); setBubble(null); }} />}
    {infoOpen && <InfoModal onClose={() => setInfoOpen(false)} />}
    {accountOpen && <AccountPanel dark={dark} passengers={passengers} preferences={preferences} onClose={() => setAccountOpen(false)} onThemeChange={setDark} onPassengersChange={setPassengers} onPreferencesChange={setPreferences} />}
    <p className="pointer-events-none fixed bottom-2 right-3 z-30 text-right text-[9px] text-muted-foreground">Booking simulation · not affiliated with a rail operator<br />◉ RaileX works offline · Journey details saved to your device</p>
  </div>;
}
