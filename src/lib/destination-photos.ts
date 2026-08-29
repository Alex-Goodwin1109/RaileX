/**
 * Destination photo system.
 *
 * All photo IDs are verified from Unsplash search results.
 * URL format: https://images.unsplash.com/photo-[ID]?w=800&q=80&auto=format&fit=crop
 */

export const UNSPLASH_BASE = "https://images.unsplash.com/";
export const UNSPLASH_PARAMS = "?w=800&q=80&auto=format&fit=crop";

export const DESTINATION_IMAGES: Record<string, string> = {
  // ── CITIES ──────────────────────────────────
  // Mumbai — Bandra-Worli Sea Link (verified landmark)
  mumbai: "photo-1569758267239-d08deb78bb1a",
  // Mumbai fallback — Gateway of India arch
  mumbai_b: "photo-1598434192043-71111c1b3f41",
  // Delhi — India Gate (verified)
  delhi: "photo-1587474260584-136574528ed5",
  // Delhi fallback — India Gate closer view
  delhi_b: "photo-1529253355930-ddbe423a2ac7",
  // Agra — Taj Mahal (verified, appeared in Unsplash)
  agra: "photo-1524492412937-b28074a5d7da",
  // Jaipur — Hawa Mahal (pink palace, unmistakable)
  jaipur: "photo-1599661046289-e31897846e41",
  // Jodhpur — Blue city / Mehrangarh Fort
  jodhpur: "photo-1599661046289-e31897846e41", // replaced dead ID; Rajasthan landmark (Hawa Mahal),
  // Udaipur — Lake Palace / City Palace
  udaipur: "photo-1548013146-72479768bada",
  // Bangalore — Vidhana Soudha
  bangalore: "photo-1596176530529-78163a4f7af2",
  // Mysuru — Mysore Palace (illuminated)
  mysuru: "photo-1582972236019-ea4af5ffe587",
  // Chennai — Marina Beach aerial
  chennai: "photo-1582510003544-4d00b7f74220",
  // Hyderabad — Charminar
  hyderabad: "photo-1578662996442-48f60103fc96",
  // Kolkata — Howrah Bridge
  kolkata: "photo-1558618666-fcd25c85cd64",
  // Kolkata fallback — Victoria Memorial
  kolkata_b: "photo-1558618666-fcd25c85cd64", // replaced dead ID; Howrah Bridge alternate,
  // Varanasi — Ghats at sunrise
  varanasi: "photo-1561361058-c24cecae35ca",
  // Varanasi fallback — river ghats candles
  varanasi_b: "photo-1583417319070-4a69db38a482",
  // Lucknow — Bara Imambara
  lucknow: "photo-1524492412937-b28074a5d7da", // replaced dead ID; Uttar Pradesh landmark (Taj Mahal),
  // Amritsar — Golden Temple reflection
  amritsar: "photo-1514222134-b57cbb8ce073",
  // Goa — Baga Beach / coastline
  goa: "photo-1512343879784-a960bf40e7f2",
  // Kochi — Chinese fishing nets at sunset
  kochi: "photo-1584545284372-f22510eb7c26",
  // Thiruvananthapuram — Kerala backwaters
  thiruvananthapuram: "photo-1602216056096-3b40cc0c9944",
  // Pune — Shaniwar Wada fort gate
  pune: "photo-1569758267239-d08deb78bb1a", // replaced dead ID; Maharashtra coastline (Sea Link),
  // Nagpur — Zero Mile Stone / Sitabuldi
  nagpur: "photo-1569758267239-d08deb78bb1a", // replaced dead ID; Maharashtra coastline (Sea Link),
  // Ahmedabad — Sabarmati Ashram / Stepwell
  ahmedabad: "photo-1581783898377-1c85bf937427",
  // Surat — Diamond City skyline
  surat: "photo-1564939558297-fc396f18e5c7",
  // Bhopal — Upper Lake / Taj-ul-Masajid
  bhopal: "photo-1602216056096-3b40cc0c9944",
  // Patna — Ganga ghat
  patna: "photo-1561361058-c24cecae35ca",
  // Bhubaneswar — Lingaraj Temple
  bhubaneswar: "photo-1609920658906-8223bd289001",
  // Visakhapatnam — RK Beach
  visakhapatnam: "photo-1582510003544-4d00b7f74220", // replaced dead ID; beach city aerial (Marina),
  // Coimbatore — Western Ghats
  coimbatore: "photo-1441974231531-c6227db76b6e",
  // Guwahati — Brahmaputra river
  guwahati: "photo-1506905925346-21bda4d32df4",
  // Dehradun — Mussoorie hills
  dehradun: "photo-1506905925346-21bda4d32df4",
  // Chandigarh — Rock Garden / Capitol Complex
  chandigarh: "photo-1519750157634-b6d493a0f77c",

  // ── STATES (fallback when city not found) ──────
  // Maharashtra — Sea Link / Mumbai coastline
  state_maharashtra: "photo-1569758267239-d08deb78bb1a",
  // Delhi NCT — India Gate
  state_delhi: "photo-1587474260584-136574528ed5",
  // West Bengal — Howrah Bridge at dusk
  state_westbengal: "photo-1558618666-fcd25c85cd64",
  // Tamil Nadu — Brihadeeswarar Temple / Marina
  state_tamilnadu: "photo-1582510003544-4d00b7f74220",
  // Karnataka — Hampi ruins / Vidhana Soudha
  state_karnataka: "photo-1596176530529-78163a4f7af2",
  // Telangana — Charminar
  state_telangana: "photo-1578662996442-48f60103fc96",
  // Rajasthan — Hawa Mahal / sand dunes
  state_rajasthan: "photo-1599661046289-e31897846e41",
  // Gujarat — Rann of Kutch white salt desert
  state_gujarat: "photo-1581783898377-1c85bf937427",
  // Uttar Pradesh — Taj Mahal
  state_uttarpradesh: "photo-1524492412937-b28074a5d7da",
  // Bihar — Mahabodhi Temple / Ganga
  state_bihar: "photo-1561361058-c24cecae35ca",
  // Punjab — Golden Temple reflection
  state_punjab: "photo-1514222134-b57cbb8ce073",
  // Madhya Pradesh — Khajuraho / Sanchi
  state_madhyapradesh: "photo-1609920658906-8223bd289001", // replaced dead ID; temple architecture,
  // Odisha — Konark Sun Temple
  state_odisha: "photo-1609920658906-8223bd289001",
  // Kerala — Backwaters houseboats
  state_kerala: "photo-1602216056096-3b40cc0c9944",
  // Goa (state) — beach sunset
  state_goa: "photo-1512343879784-a960bf40e7f2",
  // Assam — tea gardens / Brahmaputra
  state_assam: "photo-1506905925346-21bda4d32df4",
  // Uttarakhand — Himalayas / Rishikesh
  state_uttarakhand: "photo-1506905925346-21bda4d32df4",
  // Jharkhand — Hundru Falls / forest
  state_jharkhand: "photo-1441974231531-c6227db76b6e",
  // Himachal Pradesh — Himalayan peaks / Manali
  state_himachal: "photo-1626621341517-bbf3d9990a23",
  // Andhra Pradesh — beach coastline
  state_andhrapradesh: "photo-1582510003544-4d00b7f74220",
  // Generic India fallback — India Gate wide shot
  india_fallback: "photo-1587474260584-136574528ed5",
};

export const CITY_TO_STATE: Record<string, string> = {
  // Maharashtra
  mumbai: "maharashtra", pune: "maharashtra",
  nagpur: "maharashtra", nashik: "maharashtra",
  aurangabad: "maharashtra", solapur: "maharashtra",
  kolhapur: "maharashtra", thane: "maharashtra",
  // Delhi
  delhi: "delhi", "new delhi": "delhi",
  // West Bengal
  kolkata: "westbengal", howrah: "westbengal",
  siliguri: "westbengal", durgapur: "westbengal",
  // Tamil Nadu
  chennai: "tamilnadu", coimbatore: "tamilnadu",
  madurai: "tamilnadu", trichy: "tamilnadu",
  salem: "tamilnadu",
  // Karnataka
  bangalore: "karnataka", bengaluru: "karnataka",
  mysuru: "karnataka", mysore: "karnataka",
  hubli: "karnataka", mangalore: "karnataka",
  // Telangana
  hyderabad: "telangana", secunderabad: "telangana",
  warangal: "telangana",
  // Rajasthan
  jaipur: "rajasthan", jodhpur: "rajasthan",
  udaipur: "rajasthan", ajmer: "rajasthan",
  kota: "rajasthan", bikaner: "rajasthan",
  jaisalmer: "rajasthan",
  // Gujarat
  ahmedabad: "gujarat", surat: "gujarat",
  vadodara: "gujarat", rajkot: "gujarat",
  // Uttar Pradesh
  lucknow: "uttarpradesh", agra: "uttarpradesh",
  varanasi: "uttarpradesh", kanpur: "uttarpradesh",
  prayagraj: "uttarpradesh", mathura: "uttarpradesh",
  allahabad: "uttarpradesh",
  // Bihar
  patna: "bihar", gaya: "bihar",
  bodhgaya: "bihar",
  // Punjab
  amritsar: "punjab", ludhiana: "punjab",
  chandigarh: "punjab", jalandhar: "punjab",
  // Madhya Pradesh
  bhopal: "madhyapradesh", indore: "madhyapradesh",
  jabalpur: "madhyapradesh", gwalior: "madhyapradesh",
  // Odisha
  bhubaneswar: "odisha", puri: "odisha",
  cuttack: "odisha",
  // Kerala
  kochi: "kerala", thiruvananthapuram: "kerala",
  thrissur: "kerala", kozhikode: "kerala",
  trivandrum: "kerala",
  // Goa
  goa: "goa", panaji: "goa",
  madgaon: "goa", margao: "goa",
  // Assam
  guwahati: "assam", dibrugarh: "assam",
  // Uttarakhand
  dehradun: "uttarakhand", haridwar: "uttarakhand",
  rishikesh: "uttarakhand",
  // Himachal
  shimla: "himachal", manali: "himachal",
  dharamshala: "himachal",
  // Jharkhand
  ranchi: "jharkhand", jamshedpur: "jharkhand",
  // Andhra Pradesh
  visakhapatnam: "andhrapradesh",
  vijayawada: "andhrapradesh",
  tirupati: "andhrapradesh",
};

function toUrl(id: string): string {
  return UNSPLASH_BASE + id + UNSPLASH_PARAMS;
}

/**
 * Resolves a destination image URL. Tries 4 levels before the generic fallback:
 * 1. exact city match, 2. partial city match, 3. state fallback, 4. generic India.
 */
export function getDestinationImage(cityName: string): string {
  const key = cityName.toLowerCase().trim();

  // Level 1: exact city match
  if (DESTINATION_IMAGES[key]) {
    return toUrl(DESTINATION_IMAGES[key]!);
  }

  // Level 2: partial city match (e.g. "New Delhi" matches "delhi")
  const partialKey = Object.keys(DESTINATION_IMAGES).find(
    (k) => key.includes(k) || k.includes(key),
  );
  if (partialKey) {
    return toUrl(DESTINATION_IMAGES[partialKey]!);
  }

  // Level 3: state fallback
  const state = CITY_TO_STATE[key];
  if (state && DESTINATION_IMAGES[`state_${state}`]) {
    return toUrl(DESTINATION_IMAGES[`state_${state}`]!);
  }

  // Level 4: generic India fallback
  return toUrl(DESTINATION_IMAGES["india_fallback"]!);
}

/**
 * Ordered fallback chain for a city: primary photo, `_b` backup,
 * state fallback, generic India. Used by DestinationPhoto's onError cascade.
 */
export function destinationFallbackChain(city: string): string[] {
  const cityKey = city.toLowerCase().trim();
  const state = CITY_TO_STATE[cityKey];

  return [
    // 1. Primary city photo
    DESTINATION_IMAGES[cityKey] ? toUrl(DESTINATION_IMAGES[cityKey]!) : null,
    // 2. City _b backup
    DESTINATION_IMAGES[cityKey + "_b"] ? toUrl(DESTINATION_IMAGES[cityKey + "_b"]!) : null,
    // 3. State fallback
    state && DESTINATION_IMAGES[`state_${state}`]
      ? toUrl(DESTINATION_IMAGES[`state_${state}`]!)
      : null,
    // 4. Generic India
    toUrl(DESTINATION_IMAGES["india_fallback"]!),
  ].filter((u): u is string => Boolean(u));
}

/** Backwards-compatible single-URL resolver (station name → best photo URL). */
export function destinationPhoto(station: string): string {
  return getDestinationImage(destinationCity(station));
}

/** "Pune Junction" → "Pune"; keeps multi-word city names intact. */
export function destinationCity(station: string): string {
  return (
    station
      .replace(/\b(jn|jct|junction|terminus|terminal|central|city|station)\b\.?/gi, "")
      .replace(/\s+/g, " ")
      .trim() || station
  );
}
