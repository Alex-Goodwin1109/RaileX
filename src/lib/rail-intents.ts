import type { ClassCode } from "./rail-data";

export type Filters = {
  quota: string;
  buckets: string[];
  classes: ClassCode[];
  shortest: boolean;
  lowerOnly: boolean;
  tatkalOnly: boolean;
  cheapest: boolean;
};

export const DEFAULT_FILTERS: Filters = {
  quota: "General",
  buckets: [],
  classes: [],
  shortest: false,
  lowerOnly: false,
  tatkalOnly: false,
  cheapest: false,
};

export type IntentResult = {
  reply: string;
  patch?: Partial<Filters>;
  offerPrep?: boolean;
};

export function resolveIntent(raw: string): IntentResult {
  const t = raw.toLowerCase();

  const patch: Partial<Filters> = {};
  const replies: string[] = [];
  let offerPrep = false;

  if (/\b(3\s*ac|3ac|three[ -]?tier(?:\s+ac)?)\b/.test(t) && !/(what|mean|explain|code)/.test(t)) {
    patch.classes = ["3AC"];
    replies.push("3-tier AC only");
  } else if (/\b(sleeper(?:\s+coach|\s+class)?|sl only)\b/.test(t)) {
    patch.classes = ["SL"];
    replies.push("Sleeper class only");
  } else if (/(ac train|ac only|only ac|air ?condition)/.test(t) && !/non[- ]?ac|without ac/.test(t)) {
    patch.classes = ["1AC", "2AC", "3AC"];
    replies.push("air-conditioned classes");
  } else if (/(non[- ]?ac|without ac)/.test(t)) {
    patch.classes = ["SL"];
    replies.push("non-AC Sleeper");
  }
  if (/\b(cheapest|lowest fare|least expensive|budget)\b/.test(t)) {
    patch.cheapest = true;
    replies.push("lowest fares first");
  }
  if (/senior(?: citizen)?(?: quota)?|elderly quota/.test(t)) {
    patch.quota = "Senior Citizen";
    replies.push("Senior Citizen quota");
  }
  if (/ladies quota/.test(t)) {
    patch.quota = "Ladies";
    replies.push("Ladies quota");
  }
  const buckets: string[] = [];
  if (/morning/.test(t)) buckets.push("morning");
  if (/afternoon/.test(t)) buckets.push("afternoon");
  if (/evening/.test(t)) buckets.push("evening");
  if (/late night|overnight|night train/.test(t)) buckets.push("night");
  if (buckets.length) {
    patch.buckets = buckets;
    replies.push(`${buckets.join(" and ")} departures`);
  }
  if (/lower berth/.test(t)) {
    patch.lowerOnly = true;
    replies.push("confirmed lower berths");
  }
  if (/fastest|shortest|quickest/.test(t)) {
    patch.shortest = true;
    replies.push("shortest journeys first");
  }
  if (/tatkal/.test(t)) {
    patch.tatkalOnly = true;
    patch.quota = "Tatkal";
    replies.push("Tatkal-eligible trains");
    offerPrep = /prepare|book|ready|prefill|pre-fill/.test(t);
  }

  if (replies.length) {
    return {
      reply: offerPrep
        ? `Ready. I’ve applied ${replies.join(", ")}. Choose a train to open Tatkal confirmation and simulation.`
        : `Applied: ${replies.join(", ")}.`,
      patch,
      offerPrep,
    };
  }

  if (/(\bavl\b|\bsl\b|\b3ac\b|\bwl\b|\b8ad\b|\bship\b|what does\s+3\b|\bcode\b|availability|class mean)/.test(t)) {
    const definitions: [RegExp, string][] = [
      [/\bavl\b/, "AVL means Available: that many seats or berths can be booked right now."],
      [/\bsl\b|sleeper/, "SL means Sleeper class, the non-AC overnight berth class."],
      [/\b3ac\b|three.?ac/, "3AC is air-conditioned three-tier sleeper class."],
      [/\bwl\b|waitlist/, "WL means Waitlist. The number beside it is your place in the queue; a lower number has a better chance of clearing."],
      [/\b8ad\b/, "8AD is not a standard Indian Railways class or availability code. It may be a third-party label, so verify it in the operator’s fare details."],
      [/\bship\b/, "SHIP is a sea-transport label, not a railway coach class. Rail classes are codes such as SL, 3AC and 2AC."],
      [/\b3\b/, "A standalone 3 usually needs its label: AVL 3 means three berths are free; WL 3 means third on the waitlist."],
    ];
    const answers = definitions.filter(([pattern]) => pattern.test(t)).map(([, answer]) => answer);
    return { reply: answers.join(" ") || "Tell me the full code you see and I’ll explain it in plain English." };
  }

  if (/(lower berth|elderly|mother|father|senior)/.test(t)) {
    return {
      reply: "Found 4 trains with lower berth confirmed in 3AC.",
      patch: { lowerOnly: true, classes: ["SL", "3AC"] },
    };
  }
  if (/gnwl|waitlist|what is wl/.test(t)) {
    return {
      reply:
        "General Waitlist — you're 43rd in line. It usually clears for popular routes 2–3 days before travel.",
    };
  }
  if (/chair car|\bcc\b/.test(t)) {
    return { reply: "Showing Chair Car (CC) seats only.", patch: { classes: ["CC"] } };
  }
  if (/executive|\bec\b/.test(t)) {
    return { reply: "Showing Executive Chair Car (EC) only.", patch: { classes: ["EC"] } };
  }
  if (/first ac|\b1ac\b/.test(t)) {
    return { reply: "Showing First AC (1AC) compartments only.", patch: { classes: ["1AC"] } };
  }
  if (/second ac|\b2ac\b/.test(t)) {
    return { reply: "Showing 2-tier AC (2AC) berths only.", patch: { classes: ["2AC"] } };
  }
  if (/(alone|solo).*(night)|night.*(alone|solo)|travelling alone|traveling alone/.test(t)) {
    return {
      reply:
        "Travelling solo overnight? Side Upper or Upper berth is safest. Showing evening and night departures.",
      patch: { buckets: ["evening", "night"], lowerOnly: false },
    };
  }
  if (/reset|clear|show all/.test(t)) {
    return { reply: "Cleared all filters — showing every train on this route.", patch: DEFAULT_FILTERS };
  }
  return {
    reply:
      "I can help with berth type, quota, Tatkal timing or class. Try: “I need lower berth for my elderly mother”.",
  };
}
