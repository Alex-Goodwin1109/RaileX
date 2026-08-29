import { Bell, Plus, Save, Trash2, UserRound, X } from "lucide-react";
import { useState } from "react";
import type { Passenger, RailPreferences } from "@/lib/traveller-store";

type Props = {
  dark: boolean;
  passengers: Passenger[];
  preferences: RailPreferences;
  onClose: () => void;
  onThemeChange: (dark: boolean) => void;
  onPassengersChange: (passengers: Passenger[]) => void;
  onPreferencesChange: (preferences: RailPreferences) => void;
};

const emptyPassenger = (): Passenger => ({
  id: crypto.randomUUID(), name: "", age: 18, gender: "Other", berth: "Any", id_type: "Aadhaar",
});

export function AccountPanel({ dark, passengers, preferences, onClose, onThemeChange, onPassengersChange, onPreferencesChange }: Props) {
  const [draftPassengers, setDraftPassengers] = useState(passengers);
  const [draft, setDraft] = useState(preferences);
  const [saved, setSaved] = useState(false);
  const updatePassenger = (id: string, patch: Partial<Passenger>) => setDraftPassengers((list) => list.map((p) => p.id === id ? { ...p, ...patch } : p));
  const save = () => {
    onPassengersChange(draftPassengers.filter((p) => p.name.trim() && p.age > 0));
    onPreferencesChange(draft);
    setSaved(true);
  };

  return (
    <div className="fixed inset-0 z-[80] overflow-y-auto bg-overlay p-3 backdrop-blur-md sm:p-6" role="dialog" aria-modal="true" aria-label="Account and traveller preferences" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <section className="glass mx-auto my-4 w-full max-w-2xl rounded-2xl p-4 shadow-(--shadow-lift) sm:my-8 sm:p-6">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
          <div className="flex min-w-0 items-center gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/15 text-primary"><UserRound className="size-5" /></span><div className="min-w-0"><h2 className="truncate font-semibold text-foreground">Account & travellers</h2><p className="text-xs text-muted-foreground">Saved securely in this browser</p></div></div>
          <button type="button" onClick={onClose} className="grid size-9 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-muted" aria-label="Close account"><X className="size-4" /></button>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <label className="text-xs font-medium text-muted-foreground">Name<input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} className="form-field mt-1.5" /></label>
          <label className="text-xs font-medium text-muted-foreground">Email<input value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} type="email" className="form-field mt-1.5" /></label>
        </div>

        <div className="mt-5 border-t border-border pt-5">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3"><div><h3 className="text-sm font-semibold text-foreground">Saved passengers</h3><p className="text-xs text-muted-foreground">Used to pre-fill every booking</p></div><button type="button" onClick={() => setDraftPassengers((p) => [...p, emptyPassenger()])} className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-border px-3 text-xs font-medium"><Plus className="size-3.5" /> Add</button></div>
          <div className="mt-3 space-y-3">
            {draftPassengers.map((p) => (
              <div key={p.id} className="rounded-xl border border-border bg-background/40 p-3">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2"><input aria-label="Passenger name" placeholder="Full name" value={p.name} onChange={(e) => updatePassenger(p.id, { name: e.target.value })} className="form-field" /><button type="button" onClick={() => setDraftPassengers((list) => list.filter((item) => item.id !== p.id))} className="grid size-10 place-items-center text-muted-foreground hover:text-danger" aria-label={`Remove ${p.name || "passenger"}`}><Trash2 className="size-4" /></button></div>
                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4"><input aria-label="Age" type="number" min="1" max="120" value={p.age} onChange={(e) => updatePassenger(p.id, { age: Number(e.target.value) })} className="form-field" /><select aria-label="Gender" value={p.gender} onChange={(e) => updatePassenger(p.id, { gender: e.target.value as Passenger["gender"] })} className="form-field"><option>F</option><option>M</option><option>Other</option></select><select aria-label="Berth preference" value={p.berth} onChange={(e) => updatePassenger(p.id, { berth: e.target.value })} className="form-field"><option>Any</option><option>Lower berth</option><option>Middle</option><option>Upper</option><option>Side Lower</option><option>Side Upper</option></select><select aria-label="ID type" value={p.id_type} onChange={(e) => updatePassenger(p.id, { id_type: e.target.value })} className="form-field"><option>Aadhaar</option><option>Passport</option><option>Driving licence</option><option>Voter ID</option></select></div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 border-t border-border pt-4">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">Travel preferences</p>
          <div className="mt-2 grid gap-x-6 sm:grid-cols-2">
            <Toggle label="Prefer lower berth" checked={draft.lowerBerth} onChange={(v) => setDraft({ ...draft, lowerBerth: v })} />
            <Toggle label="Tatkal and journey alerts" checked={draft.alerts} onChange={(v) => setDraft({ ...draft, alerts: v })} />
            <Toggle label="Use dark appearance" checked={dark} onChange={onThemeChange} />
            <label className="flex items-center justify-between gap-3 py-2 text-sm">Coach preference<select value={draft.acPreference} onChange={(e) => setDraft({ ...draft, acPreference: e.target.value as RailPreferences["acPreference"] })} className="rounded-lg border border-border bg-background px-2 py-1 text-xs"><option value="any">Any</option><option value="ac">AC only</option><option value="non-ac">Non-AC</option></select></label>
          </div>
        </div>
        <button type="button" onClick={save} className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-primary-foreground"><Save className="size-4" /> {saved ? "Saved in this browser" : "Save travellers & preferences"}</button>
        {saved && <p className="mt-3 flex items-center gap-1.5 text-xs text-success"><Bell className="size-3.5" /> These details will be ready next time you visit.</p>}
      </section>
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return <label className="flex cursor-pointer items-center justify-between gap-4 py-2 text-sm text-foreground">{label}<input className="size-4 accent-[var(--primary)]" type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} /></label>;
}
