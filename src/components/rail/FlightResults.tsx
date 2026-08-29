import { Check, Plane, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { FLIGHTS } from "@/lib/rail-data";

type Props = {
  route: { from: string; to: string; date: string };
};

export function FlightResults({ route }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [held, setHeld] = useState(false);
  const flight = FLIGHTS.find((item) => item.id === selected);

  return (
    <div className="mx-auto w-full max-w-4xl px-5 pb-44 pt-24">
      <header>
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-primary">Flight options</p>
        <h1 className="mt-1 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          {route.from} → {route.to}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{route.date} · 4 non-stop options · prices are mock data</p>
      </header>

      <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
        <main className="space-y-3">
          {FLIGHTS.map((item, index) => {
            const active = selected === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setSelected(item.id);
                  setHeld(false);
                }}
                className={`glass w-full rounded-xl p-5 text-left transition-all hover:-translate-y-0.5 ${active ? "ring-1 ring-primary" : ""}`}
              >
                {index === 0 && <p className="mb-3 text-xs font-semibold text-primary">✦ Best value</p>}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-foreground">{item.airline} <span className="text-sm font-normal text-muted-foreground">{item.number}</span></p>
                    <p className="mt-2 text-lg font-semibold text-foreground">{item.dep} <span className="px-1 text-muted-foreground">→</span> {item.arr}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{item.duration} · {item.stops} · {item.cabin}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-semibold text-foreground">₹{item.fare.toLocaleString("en-IN")}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{item.baggage} included</p>
                  </div>
                </div>
              </button>
            );
          })}
        </main>
        <aside className="glass h-fit rounded-xl p-5 lg:sticky lg:top-24">
          <Plane className="size-5 text-primary" />
          <h2 className="mt-3 font-semibold text-foreground">{flight ? `${flight.airline} ${flight.number}` : "Choose a flight"}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {flight ? `${flight.dep} → ${flight.arr} · ${flight.cabin}` : "Select an option to see its booking summary."}
          </p>
          {flight && (
            <>
              <div className="mt-4 rounded-lg bg-muted p-3 text-sm text-foreground">
                ₹{flight.fare.toLocaleString("en-IN")} <span className="text-muted-foreground">per traveller</span>
              </div>
              <button
                type="button"
                onClick={() => setHeld(true)}
                className="mt-4 h-11 w-full rounded-full bg-primary text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.01]"
              >
                {held ? "Flight held" : "Hold this flight"}
              </button>
            </>
          )}
          {held && <p className="mt-3 flex gap-2 text-xs leading-relaxed text-success"><Check className="size-4 shrink-0" /> Flight held for 15 minutes. Continue to payment in a production integration.</p>}
          <p className="mt-5 flex gap-2 text-xs leading-relaxed text-muted-foreground"><ShieldCheck className="size-4 shrink-0" /> A mock option for this concept—no payment is collected.</p>
        </aside>
      </div>
    </div>
  );
}
