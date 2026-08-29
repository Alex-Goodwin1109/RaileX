import { STATION_GROUPS } from "@/lib/rail-data";

/** Approximate city centres for the cities covered by STATION_GROUPS. */
export const CITY_COORDS: Record<string, { lat: number; lon: number }> = {
  Mumbai: { lat: 19.076, lon: 72.8777 },
  Pune: { lat: 18.5204, lon: 73.8567 },
  Delhi: { lat: 28.6139, lon: 77.209 },
  Bangalore: { lat: 12.9716, lon: 77.5946 },
  Chennai: { lat: 13.0827, lon: 80.2707 },
  Hyderabad: { lat: 17.385, lon: 78.4867 },
  Kolkata: { lat: 22.5726, lon: 88.3639 },
  Jaipur: { lat: 26.9124, lon: 75.7873 },
  Ahmedabad: { lat: 23.0225, lon: 72.5714 },
  Surat: { lat: 21.1702, lon: 72.8311 },
  Vadodara: { lat: 22.3072, lon: 73.1812 },
  Lucknow: { lat: 26.8467, lon: 80.9462 },
  Varanasi: { lat: 25.3176, lon: 82.9739 },
  Bhopal: { lat: 23.2599, lon: 77.4126 },
  Indore: { lat: 22.7196, lon: 75.8577 },
  Nagpur: { lat: 21.1458, lon: 79.0882 },
  Patna: { lat: 25.5941, lon: 85.1376 },
  Chandigarh: { lat: 30.7333, lon: 76.7794 },
  Amritsar: { lat: 31.634, lon: 74.8723 },
  Kochi: { lat: 9.9312, lon: 76.2673 },
  Coimbatore: { lat: 11.0168, lon: 76.9558 },
  Goa: { lat: 15.4909, lon: 73.8278 },
  Jodhpur: { lat: 26.2389, lon: 73.0243 },
  Udaipur: { lat: 24.5854, lon: 73.7125 },
  Agra: { lat: 27.1767, lon: 78.0081 },
  Mysuru: { lat: 12.2958, lon: 76.6394 },
  Thiruvananthapuram: { lat: 8.5241, lon: 76.9366 },
  Solapur: { lat: 17.6599, lon: 75.9064 },
};

const R = 6371;
const rad = (d: number) => (d * Math.PI) / 180;

export function distanceKm(a: { lat: number; lon: number }, b: { lat: number; lon: number }) {
  const dLat = rad(b.lat - a.lat);
  const dLon = rad(b.lon - a.lon);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Approximate coordinates for every railway station in STATION_GROUPS, by code. */
export const STATION_COORDS: Record<string, { lat: number; lon: number }> = {
  CSMT: { lat: 18.9402, lon: 72.8356 },
  BCT: { lat: 18.9696, lon: 72.8194 },
  DR: { lat: 19.0186, lon: 72.8442 },
  BDTS: { lat: 19.0629, lon: 72.8402 },
  PUNE: { lat: 18.5286, lon: 73.8743 },
  SVJR: { lat: 18.5314, lon: 73.8497 },
  HDP: { lat: 18.5074, lon: 73.9411 },
  KK: { lat: 18.5629, lon: 73.8467 },
  NDLS: { lat: 28.6425, lon: 77.2196 },
  NZM: { lat: 28.5883, lon: 77.2513 },
  DEE: { lat: 28.6636, lon: 77.1793 },
  ANVT: { lat: 28.6503, lon: 77.3152 },
  SBC: { lat: 12.9776, lon: 77.5713 },
  YPR: { lat: 13.0234, lon: 77.5527 },
  BAND: { lat: 13.0154, lon: 77.6513 },
  MAS: { lat: 13.0827, lon: 80.2755 },
  MS: { lat: 13.0784, lon: 80.2609 },
  TBM: { lat: 12.9249, lon: 80.1195 },
  SC: { lat: 17.4344, lon: 78.5013 },
  HYB: { lat: 17.3841, lon: 78.4735 },
  KCG: { lat: 17.3922, lon: 78.4967 },
  HWH: { lat: 22.5839, lon: 88.3425 },
  SDAH: { lat: 22.5675, lon: 88.3701 },
  KOAA: { lat: 22.5966, lon: 88.3736 },
  SHM: { lat: 22.5556, lon: 88.3131 },
  JP: { lat: 26.9196, lon: 75.7878 },
  GADJ: { lat: 26.8985, lon: 75.8305 },
  DPA: { lat: 26.8564, lon: 75.7891 },
  ADI: { lat: 23.0264, lon: 72.6008 },
  SBIB: { lat: 23.0742, lon: 72.5793 },
  MAN: { lat: 22.9968, lon: 72.6032 },
  GNC: { lat: 23.2237, lon: 72.6503 },
  ST: { lat: 21.2065, lon: 72.8399 },
  UDN: { lat: 21.1697, lon: 72.8404 },
  BRC: { lat: 22.3103, lon: 73.1812 },
  PRTN: { lat: 22.2955, lon: 73.2075 },
  LKO: { lat: 26.8309, lon: 80.9236 },
  LJN: { lat: 26.8353, lon: 80.9264 },
  GTNR: { lat: 26.8497, lon: 81.0125 },
  BSB: { lat: 25.3271, lon: 83.0106 },
  BSBS: { lat: 25.3266, lon: 82.9578 },
  DDU: { lat: 25.2833, lon: 83.1167 },
  BPL: { lat: 23.2681, lon: 77.4045 },
  RKMP: { lat: 23.2286, lon: 77.4258 },
  INDB: { lat: 22.7196, lon: 75.8698 },
  LMNR: { lat: 22.7089, lon: 75.8523 },
  NGP: { lat: 21.1526, lon: 79.0882 },
  AJNI: { lat: 21.1288, lon: 79.0857 },
  PNBE: { lat: 25.6017, lon: 85.1376 },
  RJPB: { lat: 25.5878, lon: 85.1487 },
  DNR: { lat: 25.5978, lon: 85.0453 },
  CDG: { lat: 30.7096, lon: 76.8375 },
  SASN: { lat: 30.7078, lon: 76.7115 },
  ASR: { lat: 31.6338, lon: 74.8654 },
  ERS: { lat: 9.9705, lon: 76.2884 },
  ERN: { lat: 9.9884, lon: 76.2822 },
  AWY: { lat: 10.1093, lon: 76.3517 },
  CBE: { lat: 10.997, lon: 76.9673 },
  MAO: { lat: 15.2731, lon: 73.9614 },
  VSG: { lat: 15.4009, lon: 73.8145 },
  THVM: { lat: 15.6531, lon: 73.8248 },
  JU: { lat: 26.2957, lon: 73.0243 },
  UDZ: { lat: 24.5809, lon: 73.6919 },
  AGC: { lat: 27.1573, lon: 78.0022 },
  AF: { lat: 27.1799, lon: 78.0203 },
  MYS: { lat: 12.3157, lon: 76.6394 },
  TVC: { lat: 8.4885, lon: 76.9503 },
  KCVL: { lat: 8.5194, lon: 76.8894 },
  SUR: { lat: 17.6599, lon: 75.9064 },
};

/** Main railway station label ("Name (CODE)") for a city, if we know one. */
export function primaryStationFor(city: string): string | null {
  const group = STATION_GROUPS.find(
    (g) => g.city === city && g.label.toLowerCase().startsWith("stations"),
  );
  const item = group?.items[0];
  return item ? `${item.name} (${item.code})` : null;
}

export type NearestCity = { city: string; station: string; km: number };

export function nearestCity(lat: number, lon: number): NearestCity | null {
  let best: NearestCity | null = null;
  for (const [city, coords] of Object.entries(CITY_COORDS)) {
    const km = distanceKm({ lat, lon }, coords);
    const station = primaryStationFor(city);
    if (!station) continue;
    if (!best || km < best.km) best = { city, station, km: Math.round(km) };
  }
  return best;
}

/** Nearest actual railway station (falls back to the nearest city centre). */
export function nearestStation(lat: number, lon: number): NearestCity | null {
  let best: NearestCity | null = null;
  for (const group of STATION_GROUPS) {
    if (!group.label.toLowerCase().startsWith("stations")) continue; // skip airports
    for (const item of group.items) {
      const coords = STATION_COORDS[item.code] ?? CITY_COORDS[group.city];
      if (!coords) continue;
      const km = distanceKm({ lat, lon }, coords);
      if (!best || km < best.km) {
        best = { city: group.city, station: `${item.name} (${item.code})`, km: Math.round(km) };
      }
    }
  }
  return best ?? nearestCity(lat, lon);
}

export const GEO_PROMPT_KEY = "railex.geo.v1";

export type GeoFix = { lat: number; lon: number; source: "gps" | "network" };

function gpsFix(opts: PositionOptions): Promise<GeoFix> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(new Error("Location is not available on this device."));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude, source: "gps" }),
      (err) => reject(new Error(err.message || "Location permission denied.")),
      opts,
    );
  });
}

/** Coarse fallback used when the browser blocks or times out the GPS request. */
async function networkFix(): Promise<GeoFix> {
  const endpoints = [
    "https://ipapi.co/json/",
    "https://ipwho.is/",
  ];
  for (const url of endpoints) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 6000);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timer);
      if (!res.ok) continue;
      const data = (await res.json()) as { latitude?: number; longitude?: number };
      if (typeof data.latitude === "number" && typeof data.longitude === "number") {
        return { lat: data.latitude, lon: data.longitude, source: "network" };
      }
    } catch {
      /* try the next provider */
    }
  }
  throw new Error("Could not work out where you are.");
}

/** Best available fix: quick GPS attempt, then a high-accuracy retry, then IP lookup. */
export async function currentFix(): Promise<GeoFix> {
  try {
    return await gpsFix({ enableHighAccuracy: false, timeout: 8000, maximumAge: 300_000 });
  } catch {
    /* fall through to a more patient attempt */
  }
  try {
    return await gpsFix({ enableHighAccuracy: true, timeout: 15_000, maximumAge: 0 });
  } catch {
    /* fall through to the coarse network lookup */
  }
  return networkFix();
}

export async function requestNearestStation(): Promise<NearestCity> {
  const fix = await currentFix();
  const match = nearestStation(fix.lat, fix.lon);
  if (!match) throw new Error("No nearby station found.");
  return match;
}
