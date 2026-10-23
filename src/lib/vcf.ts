/** Vanilla vCard (.vcf) parsing — plain text + regex, no library, no server. */

export type VcfContact = {
  key: string;
  name: string;
  gender?: "F" | "M" | "Other";
  age?: number;
  idNumber?: string;
  /** Raw NOTE / title text from the card — used to auto-detect concessions. */
  note?: string;
};

function ageFromBday(raw: string): number | undefined {
  const digits = raw.replace(/[^\d]/g, "");
  if (digits.length < 8) return undefined;
  const year = Number(digits.slice(0, 4));
  const month = Number(digits.slice(4, 6));
  const day = Number(digits.slice(6, 8));
  if (!year || !month || !day) return undefined;
  const now = new Date();
  let age = now.getFullYear() - year;
  const beforeBirthday =
    now.getMonth() + 1 < month || (now.getMonth() + 1 === month && now.getDate() < day);
  if (beforeBirthday) age -= 1;
  return age >= 0 && age < 130 ? age : undefined;
}

function normaliseGender(raw?: string): VcfContact["gender"] {
  if (!raw) return undefined;
  const g = raw.trim().charAt(0).toUpperCase();
  if (g === "F") return "F";
  if (g === "M") return "M";
  return "Other";
}

export function parseVcf(text: string): VcfContact[] {
  // Unfold folded lines (RFC 6350: continuation lines start with space/tab).
  const unfolded = text.replace(/\r\n/g, "\n").replace(/\n[ \t]/g, "");
  const cards = unfolded.split(/BEGIN:VCARD/i).slice(1);

  return cards
    .map((card, index) => {
      const field = (name: string) =>
        card.match(new RegExp(`^${name}(?:;[^:\\n]*)?:(.*)$`, "im"))?.[1]?.trim();

      const name = field("FN") || field("N")?.split(";").filter(Boolean).reverse().join(" ") || "";
      if (!name) return null;

      const bday = field("BDAY");
      const note = field("NOTE") ?? "";
      const idNumber =
        note.match(/(?:aadhaar|aadhar|passport|id)\s*[:#-]?\s*([A-Z0-9][A-Z0-9\s-]{5,})/i)?.[1]?.trim() ??
        note.match(/\b([A-Z0-9]{8,16})\b/)?.[1];

      const gender = normaliseGender(field("GENDER"));
      const age = bday ? ageFromBday(bday) : undefined;
      const title = field("TITLE") ?? "";
      const org = field("ORG") ?? "";
      const noteText = [note, title, org].filter(Boolean).join(" ").trim();
      const contact: VcfContact = { key: `${index}-${name}`, name };
      if (noteText) contact.note = noteText;
      if (gender) contact.gender = gender;
      if (age !== undefined) contact.age = age;
      if (idNumber) contact.idNumber = idNumber;
      return contact;
    })
    .filter((c): c is VcfContact => c !== null);
}

export const SAMPLE_VCF = `BEGIN:VCARD
VERSION:3.0
FN:Priya Sharma
N:Sharma;Priya;;;
GENDER:F
BDAY:1959-04-12
NOTE:Aadhaar: 4821 7734 9012
END:VCARD
BEGIN:VCARD
VERSION:3.0
FN:Rahul Sharma
N:Sharma;Rahul;;;
GENDER:M
BDAY:1991-09-03
NOTE:Aadhaar: 7712 4590 3388
END:VCARD
`;
