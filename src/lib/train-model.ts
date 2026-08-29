export type TrainTypeId =
  | "vande-bharat"
  | "rajdhani"
  | "shatabdi"
  | "duronto"
  | "humsafar"
  | "garib-rath"
  | "superfast"
  | "intercity"
  | "express";

export type TrainPhoto = { label: string; description: string; url: string; rake: string };

const ICF = "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Indian_Railway_ICF_Coach.jpg/1280px-Indian_Railway_ICF_Coach.jpg";

export const TRAIN_PHOTOS: Record<TrainTypeId, TrainPhoto> = {
  "vande-bharat": {
    label: "Vande Bharat Express",
    description: "Semi-high speed EMU · 160 km/h",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Vande_Bharat_Express_train.jpg/1280px-Vande_Bharat_Express_train.jpg",
    rake: "EMU",
  },
  rajdhani: {
    label: "Rajdhani Express",
    description: "Premium overnight · LHB rakes",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/12952_Mumbai_Central_Rajdhani.jpg/1280px-12952_Mumbai_Central_Rajdhani.jpg",
    rake: "LHB rake",
  },
  shatabdi: {
    label: "Shatabdi Express",
    description: "Day intercity · Chair car",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/12027_Chennai_Shatabdi_Express.jpg/1280px-12027_Chennai_Shatabdi_Express.jpg",
    rake: "LHB rake",
  },
  duronto: {
    label: "Duronto Express",
    description: "Non-stop premium · LHB rakes",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/12219_Mumbai_LTT-Secunderabad_Duronto_Express.jpg/1280px-12219_Mumbai_LTT-Secunderabad_Duronto_Express.jpg",
    rake: "LHB rake",
  },
  humsafar: {
    label: "Humsafar Express",
    description: "All 3AC · LHB rakes",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/22501_New_Tinsukia_-_New_Delhi_Weekly_Humsafar_Express.jpg/1280px-22501_New_Tinsukia_-_New_Delhi_Weekly_Humsafar_Express.jpg",
    rake: "LHB rake",
  },
  "garib-rath": {
    label: "Garib Rath Express",
    description: "Budget AC · Blue rakes",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/12203_Saharsa_-_Amritsar_Garib_Rath_Express.jpg/1280px-12203_Saharsa_-_Amritsar_Garib_Rath_Express.jpg",
    rake: "LHB rake",
  },
  superfast: {
    label: "Superfast Express",
    description: "LHB rakes · Mixed classes",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/12951_Mumbai_Rajdhani.jpg/1280px-12951_Mumbai_Rajdhani.jpg",
    rake: "LHB rake",
  },
  intercity: { label: "Intercity Express", description: "Day train · ICF rakes", url: ICF, rake: "ICF rake" },
  express: { label: "Mail / Express", description: "ICF rakes · All classes", url: ICF, rake: "ICF rake" },
};

/** Map an Indian Railways train number to a train type. */
export function trainTypeFor(trainNumber: string): TrainTypeId {
  const n = Number.parseInt(trainNumber, 10);
  if (!Number.isFinite(n)) return "express";
  if (n >= 22200 && n <= 22999) return "vande-bharat";
  if (n >= 12000 && n <= 12099) return "shatabdi";
  if (n >= 12100 && n <= 12199) return "garib-rath";
  if (n >= 12200 && n <= 12299) return "duronto";
  if (n >= 12300 && n <= 12399) return "rajdhani";
  if (n >= 12900 && n <= 12999) return "humsafar";
  if (n >= 12000 && n <= 12999) return "superfast";
  return "express";
}

export const COACH_COLORS: Record<string, number> = {
  loco: 0x1a237e,
  GEN: 0x424242,
  SL: 0x6d1a1a,
  "3AC": 0x1565c0,
  B: 0x1565c0,
  "2AC": 0x0277bd,
  A: 0x0277bd,
  "1AC": 0x4a148c,
  H: 0x4a148c,
  EC: 0x880e4f,
  CC: 0x00695c,
  PA: 0x33691e,
  pantry: 0x33691e,
};

/** Livery overrides for named premium services: body colour plus a waist stripe. */
export const LIVERIES: Partial<Record<TrainTypeId, { body: number; stripe: number }>> = {
  "vande-bharat": { body: 0xfafafa, stripe: 0x1565c0 },
  rajdhani: { body: 0x1a237e, stripe: 0xfff9c4 },
  shatabdi: { body: 0xfafafa, stripe: 0x1565c0 },
  duronto: { body: 0x1b5e20, stripe: 0xf9a825 },
};

export type CoachSpec = { id: string; label: string; type: string };

export const FULL_TRAIN_COMPOSITION: CoachSpec[] = [
  { id: "loco", label: "Engine", type: "loco" },
  { id: "GEN-1", label: "GEN", type: "GEN" },
  { id: "GEN-2", label: "GEN", type: "GEN" },
  { id: "S1", label: "S1", type: "SL" },
  { id: "S2", label: "S2", type: "SL" },
  { id: "S3", label: "S3", type: "SL" },
  { id: "S4", label: "S4", type: "SL" },
  { id: "S5", label: "S5", type: "SL" },
  { id: "S6", label: "S6", type: "SL" },
  { id: "B1", label: "B1", type: "3AC" },
  { id: "B2", label: "B2", type: "3AC" },
  { id: "B3", label: "B3", type: "3AC" },
  { id: "B4", label: "B4", type: "3AC" },
  { id: "B5", label: "B5", type: "3AC" },
  { id: "PA", label: "Pantry", type: "PA" },
  { id: "A1", label: "A1", type: "2AC" },
  { id: "A2", label: "A2", type: "2AC" },
  { id: "A3", label: "A3", type: "2AC" },
  { id: "H1", label: "H1", type: "1AC" },
];

export const CLASS_NAMES: Record<string, string> = {
  loco: "Locomotive",
  GEN: "General / Unreserved",
  SL: "Sleeper Class",
  "3AC": "3-Tier AC",
  "2AC": "2-Tier AC",
  "1AC": "First Class AC",
  PA: "Pantry Car",
  CC: "Chair Car",
  EC: "Executive Chair Car",
};

export const COACH_SPACING = 3.5;

export function coachIndexFor(coach: string): number {
  const i = FULL_TRAIN_COMPOSITION.findIndex((c) => c.id.toLowerCase() === coach.toLowerCase());
  return i >= 0 ? i : 12;
}

export function hexCss(value: number): string {
  return `#${value.toString(16).padStart(6, "0")}`;
}
