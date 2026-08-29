import { useEffect, useMemo, useRef, useState } from "react";
import { haptic } from "@/lib/haptics";
import { fireBookingConfetti } from "@/lib/confetti";
import { ensureNotificationPermission, showBrowserNotification, type NotifyResult } from "@/lib/notify";
import {
  ArrowLeft,
  BellRing,
  CheckCircle2,
  Loader2,
  MapPin,
  Pencil,
  ShieldCheck,
  TicketCheck,
  TrainFront,
  Zap,
} from "lucide-react";
import { trainBearing, TRAINS, type Availability, type Train } from "@/lib/rail-data";
import { DEFAULT_FILTERS, type Filters } from "@/lib/rail-intents";
import { DEFAULT_PREFERENCES, type Passenger, type RailPreferences } from "@/lib/traveller-store";
import { useCountdown } from "@/lib/use-countdown";
import { PAYMENT_METHODS } from "@/components/rail/PaymentLogos";
import { ContactImport } from "@/components/rail/ContactImport";
import { MealOrder } from "@/components/rail/MealOrder";
import { SunPositionCard } from "@/components/rail/SunPositionCard";
import { CoachSection } from "@/components/rail/CoachSection";
import { BerthMapSheet } from "@/components/rail/BerthMapSheet";
import { JourneyStops } from "@/components/rail/JourneyStops";
import { ShareJourney } from "@/components/rail/ShareJourney";
import { TripCard } from "@/components/rail/TripCard";
import { ConfidenceBar } from "@/components/rail/WaitlistConfidence";
import { getWaitlistConfidence } from "@/lib/waitlist-confidence";
import { BookingReceipt } from "@/components/rail/BookingReceipt";
import { JourneyCountdown } from "@/components/rail/JourneyCountdown";
import { TdrFlow } from "@/components/rail/TdrFlow";
import { loadMuted, playDepartureAmbience } from "@/lib/booking-sound";
import { TrainButton } from "@/components/rail/TrainButton";
import {
  CONCESSIONS,
  CONCESSION_DISCLAIMER,
  CONCESSION_OPTIONS,
  fareFor,
  type ConcessionId,
  autoConcessionFor,
} from "@/lib/concessions";


type Props = {
  train: Train;
  route: { from: string; to: string; date: string };
  passengers: Passenger[];
  onBack: () => void;
  onPassengersChange: (p: Passenger[]) => void;
  /** Tatkal preparation flow requested from results. Nothing starts automatically. */
  initialTatkal?: boolean;
  /** Fired only when the user explicitly starts the 5-minute reminder. */
  onStartAlert?: () => void;
  onStopAlert?: () => void;
  totalTrains?: number;
  filteredCount?: number;
  filters?: Filters;
  preferences?: RailPreferences;
  /** Fired once the confirmation (PNR) screen appears. */
  onConfirmed?: (() => void) | undefined;
  /** Opens the guided TDR support flow from the PNR card link. */
  onTdrOpen?: (() => void) | undefined;
};

/**
 * Booking is a strictly sequential simulation:
 * details → (tatkal only) reminder → review → payment → ticket.
 * No sound, timer or notification fires until the user starts the reminder.
 */
type Step = "details" | "reminder" | "review" | "payment" | "ticket";

export function Booking({
  train,
  route,
  passengers,
  onBack,
  onPassengersChange,
  initialTatkal = false,
  onStartAlert,
  onStopAlert,
  totalTrains,
  filteredCount,
  filters,
  preferences,
  onConfirmed,
  onTdrOpen,
}: Props) {
  const [step, setStep] = useState<Step>("details");
  const [selectedClass, setSelectedClass] = useState<Availability>(
    () =>
      train.avail[0] ?? {
        cls: "SL",
        status: "Unavailable",
        tone: "bad",
        fare: 0,
        tooltip: "No booking classes are currently available.",
      },
  );
  const [quota, setQuota] = useState(initialTatkal ? "Tatkal" : "General");
  const [tatkal, setTatkal] = useState(initialTatkal);
  // Concessions are derived from the passenger's own details unless manually overridden.
  const [pax, setPax] = useState(() => passengers.map(withAutoConcession));
  const [selectedIds, setSelectedIds] = useState(passengers.map((p) => p.id));
  const [method, setMethod] = useState(PAYMENT_METHODS[4]!.id);
  const [reminderConfirmed, setReminderConfirmed] = useState(false);
  const [notifyState, setNotifyState] = useState<NotifyResult | null>(null);
  const [timerRunning, setTimerRunning] = useState(false);
  const [paying, setPaying] = useState(false);
  const [formError, setFormError] = useState("");

  const { text: prepTime, left } = useCountdown(5 * 60, timerRunning && step !== "ticket");
  const selectedPassengers = pax.filter((p) => selectedIds.includes(p.id));
  const serviceFee = 24;
  const tatkalFee = tatkal ? 360 : 0;
  // Concessions apply to the base fare only — never to the Tatkal surcharge (IR rule).
  const fareLines = selectedPassengers.map((p) => ({
    passenger: p,
    line: fareFor(selectedClass.fare, p.concession, selectedClass.cls),
  }));
  const baseTotal = fareLines.length
    ? fareLines.reduce((sum, f) => sum + f.line.payable, 0)
    : selectedClass.fare;
  const fullTotal = fareLines.length
    ? fareLines.reduce((sum, f) => sum + f.line.base, 0)
    : selectedClass.fare;
  const concessionSaving = fullTotal - baseTotal;
  const total = baseTotal + tatkalFee + serviceFee;
  const pnr = useMemo(() => String(4500000000 + Math.floor(Math.random() * 499999999)), []);
  const chosenMethod = PAYMENT_METHODS.find((m) => m.id === method) ?? PAYMENT_METHODS[0]!;

  const update = (id: string, patch: Partial<Passenger>) =>
    setPax((list) =>
      list.map((p) => {
        if (p.id !== id) return p;
        // An explicit pick from the dropdown stops auto-detection for this passenger.
        if ("concession" in patch) return { ...p, ...patch, concessionAuto: false };
        const next = { ...p, ...patch };
        return next.concessionAuto === false ? next : withAutoConcession(next);
      }),
    );

  const handleImport = (p: Passenger, senior: boolean) => {
    setPax((list) => [...list, p]);
    setSelectedIds((ids) => [...ids, p.id]);
    if (senior) setQuota("Senior Citizen");
  };


  const toTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
  const go = (next: Step) => {
    setStep(next);
    toTop();
  };

  const confirmBooking = () => {
    if (selectedPassengers.some((p) => !p.name.trim() || !p.age)) {
      haptic.error();
      setFormError("Every selected passenger needs a name and an age.");
      return;
    }
    setFormError("");
    onPassengersChange(pax);
    go(tatkal ? "reminder" : "review");
  };

  const startReminder = () => {
    setTimerRunning(true);
    haptic.urgent();
    onStartAlert?.();
    void showBrowserNotification("RaileX · Tatkal reminder (simulation)", {
      body: `${train.number} ${train.name} — Tatkal booking opens in 5 minutes. Everything is pre-filled.`,
      tag: "railex-tatkal",
      requireInteraction: true,
    }).then((result) => setNotifyState(result));
  };

  const pay = () => {
    setPaying(true);
    onStopAlert?.();
    window.setTimeout(() => {
      setPaying(false);
      setTimerRunning(false);
      haptic.success();
      go("ticket");
    }, 1800);
  };

  const backStep = () => {
    if (step === "details") return onBack();
    if (step === "reminder") return go("details");
    if (step === "review") return go(tatkal ? "reminder" : "details");
    if (step === "payment") return go("review");
    return onBack();
  };

  if (step === "ticket")
    return (
      <Ticket
        train={train}
        route={route}
        selectedClass={selectedClass}
        passengers={selectedPassengers}
        total={total}
        pnr={pnr}
        quota={quota}
        methodLabel={`${chosenMethod.label} · ${chosenMethod.detail}`}
        onBack={onBack}
        totalTrains={totalTrains ?? TRAINS.length}
        filteredCount={filteredCount ?? 1}
        filters={filters ?? DEFAULT_FILTERS}
        preferences={preferences ?? DEFAULT_PREFERENCES}
        tatkal={tatkal}
        onConfirmed={onConfirmed}
        onTdrOpen={onTdrOpen}
      />
    );

  const stepIndex = (["details", "reminder", "review", "payment"] as Step[]).indexOf(step);
  const flow = tatkal
    ? ["Details", "Reminder", "Confirm", "Pay"]
    : ["Details", "Confirm", "Pay"];
  const flowIndex = tatkal ? stepIndex : Math.max(0, stepIndex - 1);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 pb-44 pt-24 sm:px-5">
      <button
        type="button"
        onClick={backStep}
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back
      </button>

      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
          {step === "details"
            ? tatkal
              ? "Tatkal booking details"
              : "Train details"
            : step === "reminder"
              ? "Tatkal reminder"
              : step === "review"
                ? "Final confirmation"
                : "Simulated payment"}
        </p>
        <h1 className="mt-1 text-xl font-semibold sm:text-2xl">
          {train.number} · {train.name}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {route.from} → {route.to} · {route.date}
        </p>

        <ol className="mt-4 flex flex-wrap gap-2 text-[11px] font-medium">
          {flow.map((label, i) => (
            <li
              key={label}
              className={`rounded-full px-3 py-1 ${
                i === flowIndex
                  ? "bg-primary text-primary-foreground"
                  : i < flowIndex
                    ? "bg-success/15 text-success"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {i + 1}. {label}
            </li>
          ))}
        </ol>

        {timerRunning && (
          <div className="liquid-panel mt-4 grid gap-3 rounded-xl px-4 py-4 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center">
            <span className="relative flex size-3">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-warning opacity-60" />
              <span className="relative inline-flex size-3 rounded-full bg-warning" />
            </span>
            <div>
              <p className="flex items-center gap-2 text-sm font-semibold text-warning">
                <BellRing className="size-4" /> Tatkal opens in
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {left === 0
                  ? "Window open — complete the payment simulation now."
                  : "Alert sound loops for up to 2 minutes and mutes on your next interaction."}
              </p>
            </div>
            <div className="font-mono text-lg font-semibold tabular-nums text-warning">{prepTime}</div>
          </div>
        )}
      </header>

      <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        <main className="space-y-4">
          <section className="glass rounded-xl p-5">
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
              <div>
                <p className="text-2xl font-semibold">{train.dep}</p>
                <p className="truncate text-xs text-muted-foreground">{route.from}</p>
              </div>
              <div className="text-center">
                <TrainFront className="mx-auto size-5 text-primary" />
                <p className="mt-1 text-[11px] text-muted-foreground">{train.duration}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-semibold">{train.arr}</p>
                <p className="truncate text-xs text-muted-foreground">{route.to}</p>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-2 text-center text-xs">
              <Info label="Runs" value="Daily" />
              <Info label="Distance" value="187 km" />
              <Info label="Platform" value="3 est." />
            </div>
            <div className="mt-5 border-t border-border pt-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Route &amp; facilities
              </p>
              <p className="mt-2 text-sm">
                {route.from} · Daund Jn · Kurduvadi · {route.to}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                Pantry available · Charging points · Linen in AC classes · Live running status
              </p>
            </div>
          </section>

          {step === "details" && (
            <>
              {tatkal && (
                <section className="glass rounded-xl p-5">
                  <div className="flex items-start gap-3">
                    <Zap className="mt-0.5 size-5 shrink-0 text-warning" />
                    <div>
                      <h2 className="text-sm font-semibold">Tatkal preparation checklist</h2>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                        Nothing is scheduled yet. Choose the class, passengers, berth preferences and
                        a payment method — you will set the reminder on the next step.
                      </p>
                    </div>
                  </div>
                </section>
              )}

              <SunPositionCard
                journeyDate={route.date}
                departure={train.dep}
                arrival={train.arr}
                durationMins={train.durationMins}
                bearing={trainBearing(train.id)}
                cls={selectedClass.cls}
                trainLabel={`${train.number} ${train.name}`}
              />


              <section className="glass rounded-xl p-5">
                <h2 className="text-sm font-semibold">Choose class</h2>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {train.avail.map((a) => {
                    const confidence = getWaitlistConfidence(a.status, a.tooltip, route.date);
                    return (
                      <button
                        key={a.cls}
                        type="button"
                        onClick={() => setSelectedClass(a)}
                        className={`rounded-xl border p-3 text-left ${
                          selectedClass.cls === a.cls ? "border-primary bg-primary/10" : "border-border"
                        }`}
                      >
                        <div className="flex justify-between gap-3">
                          <span className="font-semibold">{a.cls}</span>
                          <span className="font-semibold">₹{a.fare}</span>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">{a.status}</p>
                        <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">{a.tooltip}</p>
                        {confidence && <ConfidenceBar confidence={confidence} />}
                      </button>
                    );
                  })}
                </div>
              </section>


              <ContactImport onAdd={handleImport} />

              <PassengerEditor
                cls={selectedClass.cls}
                classFare={selectedClass.fare}
                pax={pax}
                selectedIds={selectedIds}
                onToggle={(id) =>
                  setSelectedIds((ids) =>
                    ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id],
                  )
                }
                onUpdate={update}
                onAdd={() => {
                  const p: Passenger = {
                    id: crypto.randomUUID(),
                    name: "New passenger",
                    age: 18,
                    gender: "Other",
                    berth: "Any",
                    id_type: "Aadhaar",
                    concession: "",
                    concessionAuto: true,
                  };
                  setPax([...pax, p]);
                  setSelectedIds([...selectedIds, p.id]);
                }}
              />

              <section className="glass rounded-xl p-5">
                <h2 className="text-sm font-semibold">Preferred payment mode</h2>
                <p className="text-xs text-muted-foreground">
                  Pre-selected now so checkout is a single tap later. Simulated — no money moves.
                </p>
                <MethodGrid method={method} setMethod={setMethod} compact />
              </section>

              <section className="glass rounded-xl p-5">
                <label className="flex items-center justify-between gap-4 text-sm">
                  Booking quota
                  <select
                    value={quota}
                    onChange={(e) => {
                      setQuota(e.target.value);
                      setTatkal(e.target.value === "Tatkal");
                    }}
                    className="form-field max-w-40"
                  >
                    <option>General</option>
                    <option>Ladies</option>
                    <option>Senior Citizen</option>
                    <option>Tatkal</option>
                  </select>
                </label>
              </section>
            </>
          )}

          {step === "reminder" && (
            <section className="glass rounded-xl p-5">
              <div className="flex items-center gap-2">
                <BellRing className="size-5 text-warning" />
                <h2 className="font-semibold">Tatkal reminder</h2>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Your booking for {train.number} · {train.name} in {selectedClass.cls} is saved for{" "}
                {selectedPassengers.length} passenger{selectedPassengers.length === 1 ? "" : "s"}.
              </p>

              {!reminderConfirmed ? (
                <TrainButton
                  type="button"
                  feedback="success"
                  onClick={() => {
                    setReminderConfirmed(true);
                    void ensureNotificationPermission();
                    if (!loadMuted()) playDepartureAmbience();
                  }}
                  className="mt-5 h-11 w-full rounded-full bg-primary text-sm font-semibold text-primary-foreground"
                >
                  Confirm reminder
                </TrainButton>
              ) : (
                <div className="mt-5 space-y-3">
                  <p className="flex items-center gap-2 rounded-lg bg-success/10 px-3 py-2 text-sm text-success">
                    <CheckCircle2 className="size-4" /> Reminder confirmed for this booking.
                  </p>
                  {!timerRunning ? (
                    <button
                      type="button"
                      onClick={startReminder}
                      className="h-11 w-full rounded-full border border-warning/50 bg-warning/10 text-sm font-semibold text-warning"
                    >
                      Start 5-minute reminder simulation
                    </button>
                  ) : (
                    <p className="rounded-lg bg-warning/10 px-3 py-2 text-xs leading-relaxed text-warning">
                      Countdown running. When you are ready, continue to the final confirmation.
                    </p>
                  )}
                  {notifyState && notifyState !== "shown" && (
                    <p className="rounded-lg bg-muted px-3 py-2 text-xs leading-relaxed text-muted-foreground">
                      {notifyState === "denied"
                        ? "Browser notifications are blocked for this site — enable them in your browser settings to see the reminder outside the app."
                        : "This browser cannot show system notifications, so the reminder stays inside the app."}
                    </p>
                  )}
                  <button
                    type="button"
                    disabled={!timerRunning}
                    onClick={() => go("review")}
                    className="h-11 w-full rounded-full bg-primary text-sm font-semibold text-primary-foreground disabled:opacity-40"
                  >
                    Continue to final confirmation
                  </button>
                </div>
              )}
            </section>
          )}

          {step === "review" && (
            <section className="glass rounded-xl p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="size-5 text-success" />
                  <h2 className="font-semibold">Confirm your details</h2>
                </div>
                <button
                  type="button"
                  onClick={() => go("details")}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium"
                >
                  <Pencil className="size-3" /> Edit
                </button>
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
                <Info label="Class" value={selectedClass.cls} />
                <Info label="Quota" value={quota} />
                <Info label="Journey" value={route.date || "Today"} />
                <Info label="Departure" value={train.dep} />
                <Info label="Arrival" value={train.arr} />
                <Info label="Payment" value={chosenMethod.label} />
              </dl>

              <div className="mt-5 space-y-2">
                {fareLines.map(({ passenger: p, line }, i) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between gap-3 rounded-lg bg-muted px-3 py-2 text-sm"
                  >
                    <span>
                      Passenger {i + 1}: {p.name}
                      <small className="block text-muted-foreground">
                        {selectedClass.cls} ·{" "}
                        {p.concession
                          ? `${CONCESSIONS[p.concession as ConcessionId].short} · ${line.percent}% off`
                          : "No concession"}
                      </small>
                    </span>
                    <span className="shrink-0 font-medium">
                      {line.discount > 0 ? (
                        <>
                          <span className="text-muted-foreground line-through">₹{line.base}</span> → ₹
                          {line.payable}
                        </>
                      ) : (
                        <>₹{line.payable}</>
                      )}
                    </span>
                  </div>
                ))}
                {tatkal && (
                  <div className="flex items-center justify-between gap-3 rounded-lg bg-muted px-3 py-2 text-sm">
                    <span>
                      Tatkal charge
                      <small className="block text-muted-foreground">
                        No concession applies on the Tatkal surcharge
                      </small>
                    </span>
                    <span className="font-medium">₹{tatkalFee}</span>
                  </div>
                )}
                <div className="flex items-center justify-between gap-3 border-t border-border px-3 pt-3 text-sm font-semibold">
                  <span>Total</span>
                  <span>
                    ₹{total}
                    {concessionSaving > 0 && (
                      <span className="ml-2 text-xs font-medium text-success">
                        (saved ₹{concessionSaving})
                      </span>
                    )}
                  </span>
                </div>
                {concessionSaving > 0 && (
                  <p className="px-3 text-[10px] text-muted-foreground">{CONCESSION_DISCLAIMER}</p>
                )}
              </div>

              <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                Everything above is pre-filled from your saved travellers. Use Edit to change any
                detail before paying.
              </p>
            </section>
          )}

          {step === "payment" && (
            <section className="glass rounded-xl p-5">
              <h2 className="text-sm font-semibold">Choose payment method</h2>
              <p className="text-xs text-muted-foreground">
                Simulated checkout — no card is charged and no reservation is made.
              </p>
              <MethodGrid method={method} setMethod={setMethod} />
              <div className="mt-4 rounded-xl border border-border p-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Paying with</span>
                  <span className="font-medium">
                    {chosenMethod.label} · {chosenMethod.detail}
                  </span>
                </div>
              </div>
            </section>
          )}
        </main>

        <aside className="glass h-fit rounded-xl p-5 lg:sticky lg:top-24">
          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Fare summary</p>
          <Row
            k={`${selectedClass.cls} × ${Math.max(1, selectedPassengers.length)}`}
            v={`₹${fullTotal}`}
          />
          {concessionSaving > 0 && (
            <Row k="Concession discount" v={`−₹${concessionSaving}`} />
          )}
          {tatkal && <Row k="Tatkal charge" v={`₹${tatkalFee}`} />}
          <Row k="Service fee" v={`₹${serviceFee}`} />
          <div className="mt-2 border-t border-border pt-2">
            <Row k="Total" v={`₹${total}`} bold />
          </div>

          {step === "details" && (
            <TrainButton
              type="button"
              feedback="medium"
              disabled={!selectedPassengers.length}
              onClick={confirmBooking}
              className="mt-5 h-11 w-full rounded-full bg-primary text-sm font-semibold text-primary-foreground disabled:opacity-40"
            >
              {tatkal ? "Confirm booking & set reminder" : "Confirm booking"}
            </TrainButton>
          )}
          {step === "reminder" && (
            <p className="mt-5 text-xs leading-relaxed text-muted-foreground">
              Confirm the reminder to unlock the 5-minute countdown, then continue to final
              confirmation.
            </p>
          )}
          {step === "review" && (
            <TrainButton
              type="button"
              feedback="medium"
              onClick={() => go("payment")}
              className="mt-5 h-11 w-full rounded-full bg-primary text-sm font-semibold text-primary-foreground"
            >
              Proceed to payment
            </TrainButton>
          )}
          {step === "payment" && (
            <TrainButton
              type="button"
              feedback="medium"
              disabled={paying}
              onClick={pay}
              className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-primary-foreground disabled:opacity-70"
            >
              <span className="inline-flex items-center gap-2">
                {paying && <Loader2 className="size-4 animate-spin" />}
                {paying ? "Processing payment…" : `Pay ₹${total} (simulated)`}
              </span>
            </TrainButton>
          )}
          {formError && (
            <p className="mt-3 rounded-lg bg-danger/10 px-3 py-2 text-center text-[11px] font-medium text-danger">
              {formError}
            </p>
          )}
          <p className="mt-3 text-center text-[11px] text-muted-foreground">
            No real payment is collected.
          </p>
        </aside>
      </div>
    </div>
  );
}

function MethodGrid({
  method,
  setMethod,
  compact = false,
}: {
  method: string;
  setMethod: (id: string) => void;
  compact?: boolean;
}) {
  return (
    <div className={`mt-3 grid gap-2 ${compact ? "sm:grid-cols-2" : "sm:grid-cols-2"}`}>
      {PAYMENT_METHODS.map(({ id, label, detail, Logo }) => (
        <button
          key={id}
          type="button"
          onClick={() => setMethod(id)}
          aria-pressed={method === id}
          className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-colors ${
            method === id ? "border-primary bg-primary/10" : "border-border hover:border-primary/40"
          }`}
        >
          <span className="grid h-9 w-14 shrink-0 place-items-center rounded-md bg-white p-1.5 ring-1 ring-black/5">
            <Logo className="h-full w-full object-contain" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium">{label}</span>
            <span className="block truncate text-xs text-muted-foreground">{detail}</span>
          </span>
          {method === id && <CheckCircle2 className="ml-auto size-4 shrink-0 text-primary" />}
        </button>
      ))}
    </div>
  );
}

/** Applies the concession implied by a passenger's age, gender and notes. */
function withAutoConcession(p: Passenger): Passenger {
  if (p.concessionAuto === false) return p;
  return { ...p, concession: autoConcessionFor(p), concessionAuto: true };
}

function PassengerEditor({
  cls,
  classFare,
  pax,
  selectedIds,
  onToggle,
  onUpdate,
  onAdd,
}: {
  cls: string;
  classFare: number;
  pax: Passenger[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  onUpdate: (id: string, patch: Partial<Passenger>) => void;
  onAdd: () => void;
}) {
  return (
    <section className="glass rounded-xl p-5">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <div>
          <h2 className="text-sm font-semibold">Passengers &amp; seat preferences</h2>
          <p className="text-xs text-muted-foreground">Select and adjust saved travellers</p>
        </div>
        <button type="button" onClick={onAdd} className="text-xs font-medium text-primary">
          + Add
        </button>
      </div>
      <div className="mt-3 space-y-3">
        {pax.map((p) => (
          <div key={p.id} className="rounded-xl border border-border p-3">
            <label className="flex items-center gap-3 text-sm font-medium">
              <input
                type="checkbox"
                checked={selectedIds.includes(p.id)}
                onChange={() => onToggle(p.id)}
              />
              <input
                value={p.name}
                onChange={(e) => onUpdate(p.id, { name: e.target.value })}
                className="min-w-0 flex-1 bg-transparent outline-none"
              />
            </label>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
              <input
                aria-label="Age"
                type="number"
                value={p.age}
                onChange={(e) => onUpdate(p.id, { age: Number(e.target.value) })}
                className="form-field"
              />
              <select
                aria-label="Gender"
                value={p.gender}
                onChange={(e) => onUpdate(p.id, { gender: e.target.value as Passenger["gender"] })}
                className="form-field"
              >
                <option>F</option>
                <option>M</option>
                <option>Other</option>
              </select>
              <select
                aria-label="Seat or berth preference"
                value={p.berth}
                onChange={(e) => onUpdate(p.id, { berth: e.target.value })}
                className="form-field col-span-2 sm:col-span-1"
              >
                <option>Any</option>
                <option>Lower berth</option>
                <option>Middle</option>
                <option>Upper</option>
                <option>Side Lower</option>
                <option>Side Upper</option>
                <option>Window seat</option>
                <option>Aisle seat</option>
              </select>
              <label className="col-span-2 text-[11px] text-muted-foreground sm:col-span-3">
                Concession
                <select
                  aria-label="Concession category"
                  value={p.concession ?? ""}
                  onChange={(e) => onUpdate(p.id, { concession: e.target.value as ConcessionId | "" })}
                  className="form-field mt-1 w-full"
                >
                  {CONCESSION_OPTIONS.map((o) => (
                    <option key={o.value || "none"} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            {p.concession && (
              <p className="mt-2 text-[11px] font-medium text-success">
                {p.concessionAuto !== false ? "Auto-applied: " : ""}
                {CONCESSIONS[p.concession as ConcessionId].short} ·{" "}
                {fareFor(classFare, p.concession, cls).percent}% off in {cls} = ₹
                {fareFor(classFare, p.concession, cls).payable}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function Ticket({
  train,
  route,
  selectedClass,
  passengers,
  total,
  pnr,
  quota,
  methodLabel,
  onBack,
  totalTrains,
  filteredCount,
  filters,
  preferences,
  tatkal,
  onConfirmed,
  onTdrOpen,
}: {
  train: Train;
  route: { from: string; to: string; date: string };
  selectedClass: Availability;
  passengers: Passenger[];
  total: number;
  pnr: string;
  quota: string;
  methodLabel: string;
  onBack: () => void;
  totalTrains: number;
  filteredCount: number;
  filters: Filters;
  preferences: RailPreferences;
  tatkal: boolean;
  onConfirmed?: (() => void) | undefined;
  onTdrOpen?: (() => void) | undefined;
}) {
  const coachByClass: Record<string, string> = {
    SL: "S4",
    "3AC": "B4",
    "2AC": "A2",
    "1AC": "H1",
    CC: "S1",
    EC: "A1",
  };
  const coach = coachByClass[selectedClass.cls] ?? "B4";
  const berth = 23;
  const shareMessage = [
    `I'm travelling on ${train.name} (${train.number})`,
    `From: ${route.from} at ${train.dep}`,
    `To: ${route.to} at ${train.arr}`,
    `Date: ${route.date || "Today"}`,
    `Coach: ${coach} · Berth: ${berth}`,
    `PNR: ${pnr}`,
    "",
    "Shared via RaileX for safety.",
  ].join("\n");

  const [tdrOpen, setTdrOpen] = useState(false);
  const [mealStop, setMealStop] = useState<string | undefined>(undefined);

  // Ambient departure sound, haptic and confetti — only on the confirmation event.
  const confettiFiredRef = useRef(false);
  useEffect(() => {
    onConfirmed?.();
    haptic.success();
    if (loadMuted()) return;
    let stop: (() => void) | null = null;
    const t1 = window.setTimeout(() => { stop = playDepartureAmbience(); }, 300);
    const t2 = window.setTimeout(() => {
      haptic.success();
      if (confettiFiredRef.current) return;
      confettiFiredRef.current = true;
      fireBookingConfetti();
    }, 500);
    return () => { window.clearTimeout(t1); window.clearTimeout(t2); stop?.(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pb-40 pt-24 sm:px-5">
      <div className="reveal glass rounded-xl p-5 text-center">
        <CheckCircle2 className="mx-auto size-9 text-success" />
        <h1 className="mt-2 text-xl font-semibold">Booking completed</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Simulated payment of ₹{total} succeeded via {methodLabel}. Your e-ticket is below.
        </p>
      </div>

      <div className="ticket-pop mt-5 overflow-hidden rounded-xl border border-border bg-card shadow-(--shadow-lift)">
        <div className="ticket-header p-5 text-primary-foreground">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] opacity-80">
                Electronic reservation slip
              </p>
              <h2 className="mt-1 text-xl font-semibold">Journey confirmed</h2>
            </div>
            <TicketCheck className="size-9" />
          </div>
        </div>
        <div className="p-5 sm:p-7">
          <div className="flex items-center gap-2 text-success">
            <CheckCircle2 className="size-5" />
            <span className="font-semibold">CONFIRMED</span>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
            <Info label="PNR" value={pnr} />
            <Info label="Train" value={`${train.number} ${train.name}`} />
            <Info label="Class" value={selectedClass.cls} />
            <Info label="Quota" value={quota} />
            <Info label="Journey date" value={route.date || "Today"} />
            <Info label="Coach" value={coach} />
          </div>
          <div className="my-6 border-t border-dashed border-border" />
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
            <div>
              <p className="text-xl font-semibold">{route.from}</p>
              <p className="text-sm text-muted-foreground">{train.dep}</p>
            </div>
            <MapPin className="size-5 text-primary" />
            <div className="text-right">
              <p className="text-xl font-semibold">{route.to}</p>
              <p className="text-sm text-muted-foreground">{train.arr}</p>
            </div>
          </div>
          <div className="mt-6 space-y-2">
            {passengers.map((p, i) => (
              <div
                key={p.id}
                className="flex items-center justify-between gap-3 rounded-lg bg-muted px-3 py-2 text-sm"
              >
                <span>{p.name}</span>
                <span className="font-medium">
                  Coach {coach} · {23 + i * 2} {p.berth !== "Any" ? `· ${p.berth}` : ""}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-5 flex justify-between border-t border-border pt-4">
            <span className="text-muted-foreground">Amount paid</span>
            <span className="font-semibold">₹{total}</span>
          </div>
          <div className="mt-1 flex justify-between text-sm">
            <span className="text-muted-foreground">Payment mode</span>
            <span className="font-medium">{methodLabel}</span>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
            Simulation only. Carry an original photo ID for real journeys. Platform is estimated and
            may change; check station displays before departure.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => (onTdrOpen ? onTdrOpen() : setTdrOpen(true))}
        className="mt-3 inline-flex w-full items-center justify-center gap-1.5 text-xs font-medium text-warning underline underline-offset-4"
      >
        Missed train? Get TDR help
      </button>

      <ShareJourney message={shareMessage} />

      <TripCard
        origin={route.from}
        destination={route.to}
        date={route.date || "Today"}
        departure={train.dep}
        trainName={train.name}
        trainNumber={train.number}
        coach={coach}
        berthType={passengers[0]?.berth && passengers[0].berth !== "Any" ? passengers[0].berth.replace(/ berth$/i, "") : "Lower"}
        berthNumber={berth}
        pnr={pnr}
        daysAway={daysUntil(route.date)}
      />

      <CoachSection
        coach={coach}
        berth={berth}
        trainNumber={train.number}
        platform="3"
        engineEnd={trainBearing(train.id) > 180 ? "Mumbai end" : "Pune end"}
        farEnd={trainBearing(train.id) > 180 ? "Pune end" : "Mumbai end"}
      />

      <div className="mt-3 flex flex-col items-start">
        <BerthMapSheet coach={coach} berth={berth} cls={selectedClass.cls} />
        <div className="w-full">
          <JourneyStops trainNumber={train.number} compact mealStop={mealStop} from={route.from} to={route.to} />
        </div>
      </div>

      <JourneyCountdown
        destination={route.to}
        date={route.date}
        departure={train.dep}
        trainNumber={train.number}
        trainName={train.name}
        coach={coach}
        platform="3"
        onDeparted={onConfirmed}
      />

      <MealOrder coach={coach} berth={berth} onOrderPlaced={setMealStop} />

      <button
        type="button"
        onClick={onBack}
        className="mt-5 h-11 w-full rounded-full border border-border text-sm font-semibold"
      >
        Back to results
      </button>

      {tdrOpen && (
        <TdrFlow ticketValue={total} onClose={() => setTdrOpen(false)} />
      )}

      <BookingReceipt
        totalTrains={totalTrains}
        filteredCount={filteredCount}
        filters={filters}
        preferences={preferences}
        passengerCount={passengers.length}
        tatkal={tatkal}
      />
    </div>
  );
}

/** Days between today and the journey date, floored at 0. */
function daysUntil(date: string): number {
  const parsed = date ? Date.parse(date) : NaN;
  if (Number.isNaN(parsed)) return 0;
  const diff = Math.ceil((parsed - Date.now()) / 86400000);
  return Math.max(0, diff);
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
      <p className="mt-1 truncate text-sm font-semibold">{value}</p>
    </div>
  );
}

function Row({ k, v, bold }: { k: string; v: string; bold?: boolean }) {
  return (
    <div className="flex justify-between py-1.5 text-sm">
      <span className="text-muted-foreground">{k}</span>
      <span className={bold ? "font-semibold" : ""}>{v}</span>
    </div>
  );
}
