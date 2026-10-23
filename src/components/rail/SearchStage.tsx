import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Bus, MapPin, Plane, TrainFront, X, Zap } from "lucide-react";
import { haptic } from "@/lib/haptics";
import { TrainButton } from "./TrainButton";
import { DialAutocomplete, type DialItem } from "./DialAutocomplete";
import { FARE_WEEK, TRANSPORT } from "@/lib/rail-data";

type Station = Extract<DialItem, { kind: "item" }>;
const toneClass = { ok: "border-success/40 bg-success/10 text-success", warn: "border-warning/40 bg-warning/10 text-warning", bad: "border-danger/40 bg-danger/10 text-danger" };
type Tone = keyof typeof toneClass;

const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/** Deterministic mock availability tone: weekends and festival-ish dates run tighter. */
function toneFor(offset: number, weekday: number): Tone {
  if (offset <= 1) return "bad";
  if (weekday === 0 || weekday === 5 || weekday === 6) return offset <= 10 ? "bad" : "warn";
  if (offset <= 3) return "warn";
  return offset % 11 === 0 ? "warn" : "ok";
}

type CalendarDay = { iso: string; day: number; offset: number; tone: Tone } | null;

/** Two full months of selectable dates, rendered as month grids. */
function useCalendar() {
  return useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const last = new Date(today);
    last.setDate(last.getDate() + 60);
    const months: { label: string; days: CalendarDay[] }[] = [];
    const cursor = new Date(today.getFullYear(), today.getMonth(), 1);
    while (cursor <= last) {
      const year = cursor.getFullYear();
      const month = cursor.getMonth();
      const total = new Date(year, month + 1, 0).getDate();
      const days: CalendarDay[] = Array.from({ length: new Date(year, month, 1).getDay() }, () => null);
      for (let d = 1; d <= total; d += 1) {
        const date = new Date(year, month, d);
        const offset = Math.round((date.getTime() - today.getTime()) / 86_400_000);
        days.push(offset < 0 || date > last ? null : { iso: iso(date), day: d, offset, tone: toneFor(offset, date.getDay()) });
      }
      // Drop leading all-empty weeks so the first month starts at the current week.
      while (days.length > 7 && days.slice(0, 7).every((d) => d === null)) days.splice(0, 7);
      if (days.some((d) => d !== null)) months.push({ label: cursor.toLocaleDateString("en-IN", { month: "long", year: "numeric" }), days });
      cursor.setMonth(cursor.getMonth() + 1);
    }
    return { months, tomorrowIso: iso(new Date(today.getTime() + 86_400_000)) };
  }, []);
}

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

const MODE_ICON = { train: TrainFront, flight: Plane, bus: Bus } as const;

type Props = { origin: string; onOriginChange: (origin: string) => void; onDestinationChosen: () => void; onComplete: (info: { destination: string; mode: string; date: string }) => void };

export function SearchStage({ origin, onOriginChange, onDestinationChosen, onComplete }: Props) {
  const [query, setQuery] = useState(""); const [destination, setDestination] = useState<Station | null>(null); const [editingOrigin, setEditingOrigin] = useState(false); const [originQuery, setOriginQuery] = useState(""); const [mode, setMode] = useState<string | null>(null); const [date, setDate] = useState<string | null>(null); const [showWeek, setShowWeek] = useState(false);
  const { months, tomorrowIso } = useCalendar();
  useEffect(() => { if (!editingOrigin) return; const close = (e: KeyboardEvent) => e.key === "Escape" && setEditingOrigin(false); window.addEventListener("keydown", close); return () => window.removeEventListener("keydown", close); }, [editingOrigin]);
  return <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center px-4 pb-40 pt-[clamp(14rem,40vh,25rem)] sm:px-5">
    <div className="w-full text-center"><div className="reveal mb-5 flex justify-center"><span className="glass inline-flex max-w-full items-center gap-2 rounded-full px-3 py-1.5 text-xs text-muted-foreground"><MapPin className="size-3.5 shrink-0 text-primary" /><span className="truncate">From: <span className="font-medium text-foreground">{origin}</span></span><button type="button" onClick={() => { setOriginQuery(origin); setEditingOrigin(true); }} className="shrink-0 font-medium text-primary hover:underline">Change</button></span></div>
      <h1 className="reveal text-[26px] font-semibold text-foreground sm:text-3xl">Where would you like to go?</h1>
      <div className="reveal mt-6"><input value={destination ? `${destination.name} (${destination.code})` : query} onChange={(e) => { setDestination(null); setQuery(e.target.value); }} placeholder="City, station, or train number" aria-label="Destination" className="glass h-14 w-full rounded-full px-5 text-center text-base outline-none" /></div>
      {!destination && <div className="mt-4"><DialAutocomplete query={query} onSelect={(item) => { haptic.medium(); setDestination(item); setQuery(item.name); onDestinationChosen(); }} /></div>}
    </div>
    {destination && <div className="reveal mt-8 grid w-full grid-cols-1 gap-3 min-[420px]:grid-cols-3">{TRANSPORT.map((t) => { const soon = t.id !== "train";
      const Icon = MODE_ICON[t.id as keyof typeof MODE_ICON] ?? TrainFront; return <button key={t.id} type="button" disabled={soon} aria-disabled={soon} onClick={() => { if (soon) return; haptic.medium(); setMode(t.id); }} className={`glass rounded-xl p-4 text-left transition-all ${soon ? "cursor-not-allowed opacity-40 grayscale" : mode === t.id ? "ring-1 ring-primary" : "hover:-translate-y-0.5"}`}><Icon aria-hidden className="size-6 text-primary" strokeWidth={1.6} /><div className="mt-2 text-sm font-semibold">{t.label}</div><div className="text-xs text-muted-foreground">{soon ? "Coming soon" : `${t.time} · ${t.price}`}</div></button>; })}</div>}
    {mode && mode !== "bus" && <div className="reveal mt-8 w-full"><p className="mb-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">Pick a travel date · next 2 months</p>
      <div className="glass max-h-[26rem] overflow-y-auto overscroll-contain rounded-2xl p-4">
        <div className="mb-3 grid grid-cols-7 gap-1 text-center text-[10px] uppercase tracking-wider text-muted-foreground">{WEEKDAYS.map((w, i) => <span key={`${w}-${i}`}>{w}</span>)}</div>
        {months.map((m) => <div key={m.label} className="mb-4 last:mb-0">
          <p className="mb-2 text-sm font-semibold">{m.label}</p>
          <div className="grid grid-cols-7 gap-1">{m.days.map((d, i) => d === null
            ? <span key={`empty-${i}`} className="h-10" />
            : <button key={d.iso} type="button" onClick={() => { haptic.medium(); setDate(d.iso); }} aria-pressed={date === d.iso} className={`h-10 rounded-lg border text-sm font-medium transition-colors ${toneClass[d.tone]} ${date === d.iso ? "ring-2 ring-foreground/40" : ""}`}>{d.day}</button>)}</div>
        </div>)}
        <p className="mt-1 flex flex-wrap gap-3 text-[11px] text-muted-foreground"><span className="text-success">● good availability</span><span className="text-warning">● filling fast</span><span className="text-danger">● tight / waitlist</span></p>
      </div>
      {mode === "train" && <button type="button" onClick={() => setShowWeek((v) => !v)} className="mt-3 text-sm text-primary hover:underline">Show cheapest week →</button>}
      {mode === "train" && showWeek && <div className="reveal mt-3 grid grid-cols-4 gap-2 sm:grid-cols-7">{FARE_WEEK.map((f) => <div key={f.day} className="glass rounded-xl p-3 text-center"><div className="text-[11px] text-muted-foreground">{f.day}</div><div className="text-sm font-semibold">₹{f.fare}</div><div className="text-[10px] text-muted-foreground">SL</div></div>)}</div>}
      {mode === "train" && date === tomorrowIso && <p className="mt-3 flex items-center gap-1.5 text-sm text-warning"><Zap className="size-3.5" /> Tatkal opens at 10:00 AM tomorrow</p>}
      {date && <TrainButton type="button" feedback="medium" onClick={() => destination && mode && onComplete({ destination: destination.name, mode, date })} className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-primary-foreground"><span className="inline-flex items-center gap-2">Find {mode === "flight" ? "flights" : "trains"}<ArrowRight className="size-4" /></span></TrainButton>}
    </div>}
    {editingOrigin && <div className="fixed inset-0 z-[75] flex items-end justify-center overflow-hidden bg-overlay/80 p-3 backdrop-blur-xl sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-label="Change departure location" onMouseDown={(e) => e.target === e.currentTarget && setEditingOrigin(false)}><section className="liquid-panel reveal max-h-[88dvh] w-full max-w-lg overflow-y-auto overscroll-contain rounded-2xl p-4 shadow-(--shadow-lift) sm:p-5"><div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3"><div><h2 className="font-semibold">Change departure</h2><p className="text-xs text-muted-foreground">Search by city, station or code</p></div><button type="button" onClick={() => setEditingOrigin(false)} className="grid size-11 place-items-center rounded-full hover:bg-muted" aria-label="Close location search"><X className="size-4" /></button></div><input autoFocus value={originQuery} onChange={(e) => setOriginQuery(e.target.value)} placeholder="City, station, or airport" className="form-field mt-4" /><div className="max-h-[50dvh] overflow-hidden"><DialAutocomplete query={originQuery} onSelect={(station) => { onOriginChange(`${station.name} (${station.code})`); setEditingOrigin(false); }} /></div><button type="button" disabled={!originQuery.trim()} onClick={() => { onOriginChange(originQuery.trim()); setEditingOrigin(false); }} className="mt-2 min-h-11 w-full rounded-full border border-border text-sm font-medium text-primary disabled:opacity-40">Use “{originQuery.trim() || "this location"}”</button></section></div>}
  </div>;
}
