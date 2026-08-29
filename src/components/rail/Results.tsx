import { useMemo, useState } from "react";
import { haptic } from "@/lib/haptics";
import { ChevronDown, Clock, Filter, Sparkles, Tag } from "lucide-react";
import { TRAINS, type ClassCode, type Train } from "@/lib/rail-data";
import type { Passenger } from "@/lib/traveller-store";
import { DEFAULT_FILTERS, type Filters } from "@/lib/rail-intents";
import { useCountdown } from "@/lib/use-countdown";
import { getWaitlistConfidence, WAITLIST_DISCLAIMER } from "@/lib/waitlist-confidence";
import { ConfidenceBadge } from "@/components/rail/WaitlistConfidence";
import { DelayInsight } from "@/components/rail/DelayInsight";
import { JourneyStops } from "@/components/rail/JourneyStops";
import { DELAY_DISCLAIMER } from "@/lib/delay-data";
import { TrainButton } from "@/components/rail/TrainButton";
import {
  CONCESSIONS,
  CONCESSION_DISCLAIMER,
  concessionForQuota,
  fareFor,
  suggestConcession,
  autoConcessionFor,
  type ConcessionId,
} from "@/lib/concessions";


const QUOTAS = ["General", "Tatkal", "Ladies", "Senior Citizen", "Armed Forces", "Student", "Divyaang"];
const BUCKETS = ["morning", "afternoon", "evening", "night"] as const;
const CLASSES: ClassCode[] = ["SL", "3AC", "2AC", "1AC", "CC", "EC"];

const toneChip: Record<"ok" | "warn" | "bad", string> = {
  ok: "border-success/40 bg-success/10 text-success",
  warn: "border-warning/40 bg-warning/10 text-warning",
  bad: "border-danger/40 bg-danger/10 text-danger",
};

export function applyFilters(f: Filters): Train[] {
  let list = TRAINS.filter((t) => {
    if (f.tatkalOnly && !t.tatkal) return false;
    if (f.buckets.length && !f.buckets.includes(t.depBucket)) return false;
    if (f.quota === "Senior Citizen" && !t.seniorQuota) return false;
    const avail = t.avail.filter((a) => !f.classes.length || f.classes.includes(a.cls));
    return avail.length > 0;
  });
  if (f.shortest) list = [...list].sort((a, b) => a.durationMins - b.durationMins);
  if (f.cheapest) list = [...list].sort((a, b) => Math.min(...a.avail.map((x) => x.fare)) - Math.min(...b.avail.map((x) => x.fare)));
  return list;
}

type Props = {
  filters: Filters;
  setFilters: (f: Filters) => void;
  route: { from: string; to: string; date: string };
  passengers: Passenger[];
  selectedTrainId?: string;
  tatkalPrep?: boolean;
  onSelectTrain: (train: Train) => void;
  onPrepareTatkal: () => void;
};

export function Results({ filters, setFilters, route, passengers, selectedTrainId, tatkalPrep = false, onSelectTrain, onPrepareTatkal }: Props) {
  const [openFilters, setOpenFilters] = useState(false);
  const trains = useMemo(() => applyFilters(filters), [filters]);
  const { text } = useCountdown(9 * 3600 + 42 * 60 + 17);

  const toggleClass = (c: ClassCode) =>
    setFilters({
      ...filters,
      classes: filters.classes.includes(c)
        ? filters.classes.filter((x) => x !== c)
        : [...filters.classes, c],
    });

  const toggleBucket = (b: string) =>
    setFilters({
      ...filters,
      buckets: filters.buckets.includes(b)
        ? filters.buckets.filter((x) => x !== b)
        : [...filters.buckets, b],
    });

  const best = trains[0];

  return (
    <div className="mx-auto w-full max-w-6xl px-5 pb-44 pt-24">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:justify-between">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            {route.from} → {route.to}
          </h1>
          <p className="text-sm text-muted-foreground">
            {route.date} · {trains.length} trains · {filters.quota} quota
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpenFilters((v) => !v)}
          className="glass inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm lg:hidden"
        >
          <Filter className="size-3.5" /> Filters
        </button>
      </header>

      {tatkalPrep && (
        <div className="liquid-panel reveal mt-5 flex flex-col gap-3 rounded-xl px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-warning">Choose a Tatkal train</p>
            <p className="mt-1 text-xs text-muted-foreground">Only eligible services are shown. Selecting one opens passenger, class and berth confirmation.</p>
          </div>
          <span className="shrink-0 rounded-lg bg-warning/15 px-3 py-1.5 text-xs font-semibold text-warning">PREPARATION MODE</span>
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)_280px]">
        {/* Filters */}
        <aside className={`${openFilters ? "block" : "hidden"} lg:block`}>
          <div className="glass space-y-5 rounded-xl p-4">
            <FilterBlock title="Quota">
              <div className="flex flex-wrap gap-1.5">
                {QUOTAS.map((q) => (
                  <Chip key={q} active={filters.quota === q} onClick={() => setFilters({ ...filters, quota: q })}>
                    {q}
                  </Chip>
                ))}
              </div>
            </FilterBlock>
            <FilterBlock title="Departure">
              <div className="flex flex-wrap gap-1.5">
                {BUCKETS.map((b) => (
                  <Chip key={b} active={filters.buckets.includes(b)} onClick={() => toggleBucket(b)}>
                    <span className="capitalize">{b}</span>
                  </Chip>
                ))}
              </div>
            </FilterBlock>
            <FilterBlock title="Class">
              <div className="flex flex-wrap gap-1.5">
                {CLASSES.map((c) => (
                  <Chip key={c} active={filters.classes.includes(c)} onClick={() => toggleClass(c)}>
                    {c}
                  </Chip>
                ))}
              </div>
            </FilterBlock>
            <FilterBlock title="Preferences">
              <Toggle
                label="Shortest first"
                on={filters.shortest}
                onClick={() => setFilters({ ...filters, shortest: !filters.shortest })}
              />
              <Toggle
                label="Lower berth only"
                on={filters.lowerOnly}
                onClick={() => setFilters({ ...filters, lowerOnly: !filters.lowerOnly })}
              />
              <Toggle
                label="Tatkal eligible"
                on={filters.tatkalOnly}
                onClick={() => setFilters({ ...filters, tatkalOnly: !filters.tatkalOnly })}
              />
              <Toggle
                label="Cheapest first"
                on={filters.cheapest}
                onClick={() => setFilters({ ...filters, cheapest: !filters.cheapest })}
              />
            </FilterBlock>
            <button
              type="button"
              onClick={() => setFilters(DEFAULT_FILTERS)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Reset all
            </button>
          </div>
        </aside>

        {/* Train list */}
        <main className="space-y-3">
          {best && (
            <article className={`reveal glass rounded-xl p-5 ring-1 ${selectedTrainId === best.id ? "ring-primary" : "ring-primary/40"}`}>
              <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                <Sparkles className="size-3.5" /> Best match
              </div>
              <TrainBody train={best} filters={filters} passengers={passengers} tatkalPrep={tatkalPrep} route={route} journeyDate={route.date} onSelect={() => onSelectTrain(best)} />
              <p className="mt-3 rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
                Fastest train · 3AC lower berth available · Arrives before noon
              </p>
            </article>
          )}

          {trains.slice(1).map((t) => (
            <article key={t.id} className="glass rounded-xl p-5 transition-transform hover:-translate-y-0.5">
              <TrainBody train={t} filters={filters} passengers={passengers} tatkalPrep={tatkalPrep} route={route} journeyDate={route.date} onSelect={() => onSelectTrain(t)} />
            </article>
          ))}

          {!trains.length && (
            <div className="glass rounded-xl p-8 text-center text-sm text-muted-foreground">
              No trains match these filters. Try resetting, or ask the assistant.
            </div>
          )}

          <p className="px-1 text-[11px] leading-relaxed text-muted-foreground">
            {WAITLIST_DISCLAIMER} {DELAY_DISCLAIMER}
          </p>
        </main>


        {/* Sidebar */}
        <aside className="space-y-3">
          <div className="glass rounded-xl p-5">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-muted-foreground">
              <Clock className="size-3.5" /> Tatkal opens in
            </div>
            <div className="mt-2 font-mono text-2xl font-semibold tabular-nums text-foreground">{text}</div>
            <p className="mt-2 text-xs text-muted-foreground">
              Passengers pre-filled · Payment saved · Ready to book
            </p>
            <TrainButton
              type="button"
              onClick={onPrepareTatkal}
              feedback="medium"
              className="mt-4 h-11 w-full rounded-full bg-primary text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.01]"
            >
              Choose a Tatkal train
            </TrainButton>
          </div>

          <div className="glass rounded-xl p-5">
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Saved passengers</p>
            <ul className="mt-3 space-y-3">
              {passengers.map((p) => (
                <li key={p.id} className="text-sm">
                  <div className="font-medium text-foreground">{p.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {p.gender} · {p.age} · {p.berth} · {p.id_type}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

function TrainBody({ train, filters, passengers, tatkalPrep, route, journeyDate, onSelect }: { train: Train; filters: Filters; passengers: Passenger[]; tatkalPrep: boolean; route?: { from: string; to: string }; journeyDate?: string; onSelect: () => void }) {
  // Class filters hide chips; the lower-berth preference only re-orders them, so
  // waitlist / RAC options (which never carry a confirmed lower berth) stay visible.
  const avail = train.avail
    .filter((a) => !filters.classes.length || filters.classes.includes(a.cls))
    .slice()
    .sort((a, b) => (filters.lowerOnly ? Number(Boolean(b.lower)) - Number(Boolean(a.lower)) : 0));
  return (
    <>
      <div className="mt-1 flex flex-col gap-2 sm:grid sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start sm:gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-foreground">
            {train.number} · {train.name}
          </h3>
          <p className="whitespace-nowrap text-sm text-muted-foreground">
            {train.dep} → {train.arr} · {train.duration}
          </p>
          <DelayInsight trainId={train.id} trainNumber={train.number} />
        </div>
        <div className="flex shrink-0 flex-wrap gap-1.5 sm:justify-end">
          {train.tatkal && <Badge tone="warn">Tatkal Open</Badge>}
          {train.emergencyQuota && <Badge tone="bad">Emergency Quota</Badge>}
          {train.seniorQuota && <Badge tone="info">Senior Citizen Quota</Badge>}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {avail.map((a) => {
          const confidence = getWaitlistConfidence(a.status, a.tooltip, journeyDate);
          return (
            <span key={a.cls} className="flex flex-wrap items-center gap-1.5">
              <span
                title={a.tooltip}
                className={`group relative hidden-tooltip cursor-help rounded-lg border px-2.5 py-1 text-xs font-medium ${toneChip[a.tone]}`}
              >
                {a.cls} {a.status} · ₹{a.fare}
                <span className="pointer-events-none absolute bottom-full left-0 z-20 mb-2 hidden w-56 rounded-lg bg-popover p-2 text-[11px] font-normal leading-snug text-popover-foreground shadow-(--shadow-lift) group-hover:block max-sm:hidden">
                  {a.tooltip}
                </span>
              </span>
              {confidence && <ConfidenceBadge confidence={confidence} />}
            </span>
          );
        })}
      </div>

      <JourneyStops trainNumber={train.number} from={route?.from} to={route?.to} />

      <ConcessionCard quota={filters.quota} avail={avail} passengers={passengers} />

      <TrainButton type="button" onClick={onSelect} feedback="medium" className="mt-4 h-10 w-full rounded-full border border-primary/40 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground">{tatkalPrep ? "Prepare this Tatkal booking" : "View details & book"}</TrainButton>
    </>
  );
}

const CLASS_NAMES: Record<string, string> = {
  SL: "Sleeper class",
  "3AC": "AC 3 Tier",
  "2AC": "AC 2 Tier",
  "1AC": "AC First Class",
  CC: "Chair Car",
  EC: "Executive Chair Car",
};

/** Breakdown of the active concession quota against this train's cheapest class. */
function ConcessionCard({
  quota,
  avail,
  passengers,
}: {
  quota: string;
  avail: Train["avail"];
  passengers: Passenger[];
}) {
  const base = concessionForQuota(quota);
  if (!avail.length) return null;
  const cheapest = avail.reduce((a, b) => (b.fare < a.fare ? b : a));

  // Per-passenger eligibility: the saved passenger details (age, gender, notes)
  // decide the category, and the quota filter only widens it.
  const roster = passengers.length
    ? passengers
    : [{ id: "self", name: "Passenger", age: 30, gender: "Other" } as Passenger];
  const people = roster
    .map((p) => {
      const auto = p.concession ?? autoConcessionFor(p);
      const id = (base === "senior-male"
        ? suggestConcession(p.age, p.gender) || auto || "senior-male"
        : base || auto) as ConcessionId | "";
      if (!id) return null;
      return { p, id, fare: fareFor(cheapest.fare, id, cheapest.cls) };
    })
    .filter((x): x is { p: Passenger; id: ConcessionId; fare: ReturnType<typeof fareFor> } => x !== null);

  if (!people.length) return null;
  const headline = people[0]!;
  const totals = people.reduce(
    (acc, x) => ({ base: acc.base + x.fare.base, pay: acc.pay + x.fare.payable, save: acc.save + x.fare.discount }),
    { base: 0, pay: 0, save: 0 },
  );

  return <ConcessionSummary headline={headline} people={people} totals={totals} cls={cheapest.cls} />;
}

/** Collapsed: only the applied quota. Expanded: the full fare breakdown. */
function ConcessionSummary({
  headline,
  people,
  totals,
  cls,
}: {
  headline: { id: ConcessionId; fare: ReturnType<typeof fareFor> };
  people: unknown[];
  totals: { base: number; pay: number; save: number };
  cls: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-3 overflow-hidden rounded-xl border border-success/40 bg-success/10 text-xs">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          haptic.light();
          setOpen((v) => !v);
        }}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left"
      >
        <span className="flex min-w-0 items-center gap-1.5 font-semibold text-success">
          <Tag className="size-3.5 shrink-0" />
          <span className="truncate">{CONCESSIONS[headline.id].label} quota applied</span>
        </span>
        <ChevronDown
          className={`size-4 shrink-0 text-success transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div className="reveal border-t border-success/30 px-3 pb-3 pt-2">
          <p className="text-foreground">{CLASS_NAMES[cls] ?? cls}</p>
          <div className="mt-1 space-y-0.5 text-muted-foreground">
            <p>Base fare: ₹{headline.fare.base}</p>
            <p>
              Your {headline.fare.percent}% discount: −₹{headline.fare.discount}
            </p>
          </div>
          <div className="my-2 h-px bg-success/30" />
          <p className="font-semibold text-foreground">
            You pay: ₹{headline.fare.payable}{" "}
            <span className="font-normal text-muted-foreground">(saving ₹{headline.fare.discount})</span>
          </p>
          {people.length > 1 && (
            <p className="mt-1.5 text-[11px] font-medium text-success">
              {people.length} passengers · ₹{totals.pay} total (saving ₹{totals.save} vs full fare ₹{totals.base})
            </p>
          )}
          <p className="mt-2 text-[10px] leading-snug text-muted-foreground">{CONCESSION_DISCLAIMER}</p>
        </div>
      )}
    </div>
  );
}



function Badge({ tone, children }: { tone: "warn" | "bad" | "info"; children: React.ReactNode }) {
  const cls =
    tone === "warn"
      ? "bg-warning/15 text-warning"
      : tone === "bad"
        ? "bg-danger/15 text-danger"
        : "bg-info/15 text-info";
  return <span className={`rounded-lg px-2 py-1 text-[10px] font-semibold ${cls}`}>{children}</span>;
}

function FilterBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{title}</p>
      {children}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={() => { haptic.light(); onClick(); }}
      className={`rounded-lg border px-2.5 py-1 text-xs transition-colors ${
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function Toggle({ label, on, onClick }: { label: string; on: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={() => { haptic.light(); onClick(); }}
      className="flex w-full items-center justify-between py-1 text-xs text-foreground"
    >
      {label}
      <span
        className={`relative h-5 w-9 rounded-full transition-colors ${on ? "bg-primary" : "bg-muted"}`}
      >
        <span
          className={`absolute top-0.5 size-4 rounded-full bg-card shadow transition-all ${on ? "left-4.5" : "left-0.5"}`}
        />
      </span>
    </button>
  );
}
