import { DEFAULT_FILTERS, type Filters, type IntentResult } from "./rail-intents";

export type Lang = "en" | "hi";
export const LANG_KEY = "rail.lang.v1";

export function loadLang(): Lang {
  if (typeof window === "undefined") return "en";
  return window.localStorage.getItem(LANG_KEY) === "hi" ? "hi" : "en";
}

export function saveLang(lang: Lang) {
  if (typeof window !== "undefined") window.localStorage.setItem(LANG_KEY, lang);
}

/** Static UI copy for orb bubbles, so the session stays in one language. */
type OrbCopy = { listening: string; tatkalPrep: string; tatkalAlert: string; placeholder: string };

export const ORB_COPY: Record<Lang, OrbCopy> = {
  en: {
    listening: "Listening… ask about AVL, WL, coach classes, AC or non-AC trains.",
    tatkalPrep:
      "Tatkal trains are ready. Choose one to open confirmation, edit passengers and select berth preferences.",
    tatkalAlert:
      "Tatkal alert: your five-minute preparation window is active. Check every detail before starting the booking simulation.",
    placeholder: "Ask about berths, quota, Tatkal…",
  },
  hi: {
    listening: "सुन रहा हूं… बर्थ, कोटा, तत्काल या AC के बारे में पूछें।",
    tatkalPrep: "तत्काल ट्रेनें तैयार हैं। किसी एक को चुनें और बुकिंग की पुष्टि करें।",
    tatkalAlert: "तत्काल अलर्ट: आपकी पांच मिनट की तैयारी विंडो चालू है। हर जानकारी जांच लें।",
    placeholder: "बर्थ, कोटा, तत्काल के बारे में पूछें…",
  },
};

/**
 * Rule-based Hindi (and Hinglish) keyword matching — no translation API.
 * Returns the same shape as the English intent resolver.
 */
export function resolveHindiIntent(raw: string, countLowerBerth: (patch: Partial<Filters>) => number): IntentResult {
  const t = raw.toLowerCase().trim();

  if (/बुजुर्ग|बड़े|बुज़ुर्ग|elderly|senior/.test(t)) {
    return {
      reply: "वरिष्ठ नागरिक कोटा और नीचे की बर्थ लगा दी है।",
      patch: { quota: "Senior Citizen", lowerOnly: true },
    };
  }

  if (/तत्काल|tatkal|urgent|जल्दी/.test(t)) {
    return {
      reply: "तत्काल कल सुबह 10 बजे खुलेगा। क्या मैं अभी बुकिंग तैयार करूं?",
      patch: { tatkalOnly: true, quota: "Tatkal" },
      offerPrep: true,
    };
  }

  if (/नीचे की बर्थ|lower berth|नीचे/.test(t)) {
    const patch: Partial<Filters> = { lowerOnly: true };
    return { reply: `नीचे की बर्थ वाली ${countLowerBerth(patch)} ट्रेनें मिली हैं।`, patch };
  }

  if (/एसी|वातानुकूलित|\bac\b/.test(t)) {
    return { reply: "केवल AC ट्रेनें दिखा रहा हूं।", patch: { classes: ["1AC", "2AC", "3AC"] } };
  }

  if (/सस्ता|सस्ती|cheap|budget/.test(t)) {
    return { reply: "सबसे सस्ती ट्रेनें पहले दिखा रहा हूं।", patch: { cheapest: true } };
  }

  if (/रात|night/.test(t)) {
    return { reply: "रात की ट्रेनें दिखा रहा हूं।", patch: { buckets: ["evening", "night"] } };
  }

  if (/कितना समय|how long|duration|समय/.test(t)) {
    return { reply: "सबसे कम समय वाली ट्रेनें पहले दिखा रहा हूं।", patch: { shortest: true } };
  }

  if (/रद्द|cancel|tdr|टीडीआर|रिफंड|refund/.test(t)) {
    return {
      reply:
        "ठीक है, रिफंड की जानकारी दे रहा हूं। TDR चार्ट बनने के बाद भी भरा जा सकता है; रिफंड 5–7 दिनों में आता है।",
    };
  }

  if (/साफ|रीसेट|reset|सब दिखाओ/.test(t)) {
    return { reply: "सभी फ़िल्टर हटा दिए हैं।", patch: DEFAULT_FILTERS };
  }

  return {
    reply: "मैं बर्थ, कोटा, तत्काल, AC, सस्ती या रात की ट्रेनों में मदद कर सकता हूं। जैसे: “नीचे की बर्थ चाहिए”।",
  };
}
