import { useState } from "react";
import { CheckCircle2, Info, UtensilsCrossed } from "lucide-react";

type Stop = { name: string; role: string; minutes: number };

const STOPS: Stop[] = [
  { name: "Pune Jn", role: "Origin", minutes: 0 },
  { name: "Daund Jn", role: "Halt", minutes: 12 },
  { name: "Dadar", role: "Halt", minutes: 18 },
  { name: "Mumbai CSMT", role: "Destination", minutes: 0 },
];

const MEALS = [
  { id: "veg", label: "Veg Thali", price: 110 },
  { id: "nonveg", label: "Non-Veg Thali", price: 130 },
  { id: "puri", label: "Puri Bhaji", price: 70 },
  { id: "tea", label: "Tea + Biscuits", price: 30 },
];

type OrderLine = { key: string; stop: string; meal: string; price: number; qty: number };

export function MealOrder({ coach, berth, onOrderPlaced }: { coach: string; berth: number; onOrderPlaced?: ((stop: string) => void) | undefined }) {
  const [lines, setLines] = useState<OrderLine[]>([]);
  const [placed, setPlaced] = useState(false);
  const [confirming, setConfirming] = useState(false);


  const addMeal = (stop: string, meal: (typeof MEALS)[number]) => {
    setPlaced(false);
    const key = `${stop}-${meal.id}`;
    setLines((list) =>
      list.some((l) => l.key === key)
        ? list.map((l) => (l.key === key ? { ...l, qty: l.qty + 1 } : l))
        : [...list, { key, stop, meal: meal.label, price: meal.price, qty: 1 }],
    );
  };

  const total = lines.reduce((sum, l) => sum + l.price * l.qty, 0);
  const firstStop = lines[0]?.stop ?? "Dadar";

  return (
    <section className="glass mt-5 rounded-xl p-5">
      <div className="flex items-start gap-3">
        <UtensilsCrossed className="mt-0.5 size-5 shrink-0 text-primary" />
        <div>
          <h2 className="font-semibold">🍱 Order meals for your journey</h2>
          <p className="text-xs text-muted-foreground">
            Powered by IRCTC eCatering — official service only
          </p>
        </div>
      </div>

      <ol className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        {STOPS.map((s, i) => (
          <li key={s.name} className="flex items-center gap-2">
            <span className="rounded-full bg-muted px-2.5 py-1 font-medium text-foreground">
              {s.name}
              <span className="ml-1 text-muted-foreground">
                ({s.minutes ? `${s.minutes} min` : s.role})
              </span>
            </span>
            {i < STOPS.length - 1 && <span>→</span>}
          </li>
        ))}
      </ol>

      <div className="mt-4 space-y-3">
        {STOPS.filter((s) => s.minutes > 10).map((s) => (
          <div key={s.name} className="rounded-xl border border-border p-4">
            <p className="text-sm font-semibold">
              📍 {s.name} · Stop: {s.minutes} minutes
            </p>
            <p className="mt-1 text-xs text-muted-foreground">IRCTC Pantry Meals available:</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {MEALS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => addMeal(s.name, m)}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2 text-sm hover:border-primary/50"
                >
                  <span>{m.label}</span>
                  <span className="flex items-center gap-2">
                    <span className="font-medium">₹{m.price}</span>
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                      + Add
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <p className="mt-3 flex gap-2 text-xs leading-relaxed text-muted-foreground">
        <Info className="mt-0.5 size-3.5 shrink-0" />
        Meals are prepared and delivered by IRCTC&apos;s licensed pantry car service. Delivery to
        your seat at the scheduled stop. All meals are from the IRCTC official pantry car only — no
        third-party restaurants.
      </p>

      {lines.length > 0 && (
        <div className="mt-4 rounded-xl bg-muted p-4">
          <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
            Order summary
          </p>
          <ul className="mt-2 space-y-1 text-sm">
            {lines.map((l) => (
              <li key={l.key}>
                {l.meal} × {l.qty} · {l.stop} stop · ₹{l.price * l.qty} · Coach {coach}
              </li>
            ))}
          </ul>
          <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-sm font-semibold">
            <span>Total</span>
            <span>₹{total}</span>
          </div>
          {!placed ? (
            <button
              type="button"
              onClick={() => setConfirming(true)}
              className="mt-3 h-11 w-full rounded-full bg-primary text-sm font-semibold text-primary-foreground"
            >
              Confirm meal order (simulated)
            </button>
          ) : (
            <p className="mt-3 flex items-start gap-2 rounded-lg bg-success/10 px-3 py-2 text-sm text-success">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0" /> Meal order placed · Pantry car will
              deliver to Coach {coach}, Berth {berth} at {firstStop}
            </p>
          )}
        </div>
      )}

      {confirming && (
        <div
          className="fixed inset-0 z-[75] flex items-end justify-center overflow-hidden bg-overlay/80 p-3 backdrop-blur-xl sm:items-center sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label="Confirm meal order"
          onMouseDown={(e) => e.target === e.currentTarget && setConfirming(false)}
        >
          <section className="liquid-panel reveal max-h-[88dvh] w-full max-w-md overflow-y-auto overscroll-contain rounded-2xl p-5 shadow-(--shadow-lift)">
            <h3 className="text-base font-semibold">Confirm this meal order?</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Do you want to confirm this meal order? You&apos;ll have to pay in the train — nothing
              is charged now.
            </p>

            <ul className="mt-4 space-y-1 rounded-lg bg-muted px-3 py-2.5 text-sm">
              {lines.map((l) => (
                <li key={l.key} className="flex justify-between gap-3">
                  <span>
                    {l.meal} × {l.qty}
                    <small className="block text-muted-foreground">{l.stop} stop</small>
                  </span>
                  <span className="font-medium">₹{l.price * l.qty}</span>
                </li>
              ))}
              <li className="mt-2 flex justify-between gap-3 border-t border-border pt-2 font-semibold">
                <span>Pay on board</span>
                <span>₹{total}</span>
              </li>
            </ul>

            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              Delivery to Coach {coach}, Berth {berth} at {firstStop}. Simulated IRCTC eCatering
              order — no real booking or payment is made.
            </p>

            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setConfirming(false)}
                className="h-11 w-full rounded-full border border-border text-sm font-semibold"
              >
                Go back
              </button>
              <button
                type="button"
                onClick={() => {
                  setPlaced(true);
                  setConfirming(false);
                  onOrderPlaced?.(firstStop);
                }}
                className="h-11 w-full rounded-full bg-primary text-sm font-semibold text-primary-foreground"
              >
                Yes, confirm order
              </button>
            </div>
          </section>
        </div>
      )}

    </section>
  );
}
