import { useRef, useState } from "react";
import { Download, FolderOpen, UserPlus } from "lucide-react";
import { parseVcf, SAMPLE_VCF, type VcfContact } from "@/lib/vcf";
import type { Passenger } from "@/lib/traveller-store";
import { CONCESSIONS, suggestConcession } from "@/lib/concessions";
import { haptic } from "@/lib/haptics";

type Props = {
  onAdd: (passenger: Passenger, senior: boolean) => void;
};

export function ContactImport({ onAdd }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [contacts, setContacts] = useState<VcfContact[]>([]);
  const [ages, setAges] = useState<Record<string, number>>({});
  const [added, setAdded] = useState<string[]>([]);
  const [error, setError] = useState("");

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const parsed = parseVcf(String(reader.result ?? ""));
      setContacts(parsed);
      setAdded([]);
      if (parsed.length) haptic.success(); else haptic.error();
      setError(parsed.length ? "" : "No contacts found in that file.");
    };
    reader.onerror = () => { haptic.error(); setError("Could not read that file."); };
    reader.readAsText(file);
  };

  const sampleUrl = () =>
    `data:text/vcard;charset=utf-8,${encodeURIComponent(SAMPLE_VCF)}`;


  const add = (c: VcfContact) => {
    const age = c.age ?? ages[c.key];
    if (!age) {
      haptic.error();
      setError(`Enter an age for ${c.name} first.`);
      return;
    }
    const gender = c.gender ?? "Other";
    const concession = suggestConcession(age, gender, c.note);
    const senior = concession === "senior-male" || concession === "senior-female";
    onAdd(
      {
        id: crypto.randomUUID(),
        name: c.name,
        age,
        gender,
        berth: senior ? "Lower berth" : "Any",
        id_type: "Aadhaar",
        concession,
        concessionAuto: true,
        ...(c.note ? { notes: c.note } : {}),
      },
      senior,
    );
    setAdded((list) => [...list, c.key]);
    setError("");
  };

  return (
    <div className="mb-4 rounded-xl border border-dashed border-border p-4">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="inline-flex h-10 items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 text-sm font-semibold text-primary"
      >
        <FolderOpen className="size-4" /> Import from Contacts file
      </button>
      <input
        ref={inputRef}
        type="file"
        accept=".vcf,text/vcard,text/x-vcard"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
        Send yourself a contact card from WhatsApp or Messages. Download it and import here — no
        typing needed.
      </p>
      <a
        href={sampleUrl()}
        download="rail-sample-contacts.vcf"
        className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-primary underline underline-offset-2"
      >
        <Download className="size-3.5" /> Download sample contact file
      </a>

      {error && <p className="mt-3 text-xs text-danger">{error}</p>}

      {contacts.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
            {contacts.length} contact{contacts.length === 1 ? "" : "s"} found
          </p>
          {contacts.map((c) => {
            const age = c.age ?? ages[c.key];
            const isAdded = added.includes(c.key);
            return (
              <div
                key={c.key}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-lg bg-muted px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {c.name}
                    {c.gender ? ` · ${c.gender}` : ""}
                    {age ? ` · ${age} years` : ""}
                  </p>
                  {c.idNumber && (
                    <p className="truncate text-[11px] text-muted-foreground">ID: {c.idNumber}</p>
                  )}
                  {c.age === undefined && (
                    <input
                      type="number"
                      min="1"
                      max="120"
                      placeholder="Age (no DOB in card)"
                      value={ages[c.key] ?? ""}
                      onChange={(e) => setAges((a) => ({ ...a, [c.key]: Number(e.target.value) }))}
                      className="form-field mt-1.5 max-w-44"
                    />
                  )}
                  {age !== undefined && (() => {
                    const suggested = suggestConcession(age, c.gender ?? "Other", c.note);
                    if (!suggested) return null;
                    const isSenior = suggested.startsWith("senior");
                    return (
                      <p className="mt-1 text-[11px] text-success">
                        {CONCESSIONS[suggested].label} applied automatically
                        {isSenior ? " · lower berth preferred" : ""}
                      </p>
                    );
                  })()}
                </div>
                <button
                  type="button"
                  disabled={isAdded}
                  onClick={() => { haptic.medium(); add(c); }}
                  className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-primary px-3 text-xs font-semibold text-primary-foreground disabled:opacity-40"
                >
                  <UserPlus className="size-3.5" /> {isAdded ? "Added" : "Add as passenger"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
