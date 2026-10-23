import { useEffect, useState } from "react";
import type { ConcessionId } from "@/lib/concessions";

export type Passenger = {
  id: string;
  name: string;
  age: number;
  gender: "F" | "M" | "Other";
  berth: string;
  id_type: string;
  /** Optional IR concession category applied to this passenger's fare. */
  concession?: ConcessionId | "";
  /** True while the concession is derived automatically from the details above. */
  concessionAuto?: boolean;
  /** Free-text hints (e.g. imported contact-card notes) used for auto concessions. */
  notes?: string;
};

export type RailPreferences = {
  name: string;
  email: string;
  lowerBerth: boolean;
  alerts: boolean;
  acPreference: "any" | "ac" | "non-ac";
};

export const DEFAULT_PASSENGERS: Passenger[] = [
  { id: "p1", name: "Priya Sharma", gender: "F", age: 67, berth: "Lower berth", id_type: "Aadhaar" },
  { id: "p2", name: "Rahul Sharma", gender: "M", age: 35, berth: "Any", id_type: "Aadhaar" },
];

export const DEFAULT_PREFERENCES: RailPreferences = {
  name: "Rahul Sharma",
  email: "rahul@example.com",
  lowerBerth: true,
  alerts: true,
  acPreference: "any",
};

const PASSENGER_KEY = "rail.saved-passengers.v1";
const PREFERENCE_KEY = "rail.preferences.v1";

function load<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function useTravellerStore() {
  const [passengers, setPassengers] = useState<Passenger[]>(DEFAULT_PASSENGERS);
  const [preferences, setPreferences] = useState<RailPreferences>(DEFAULT_PREFERENCES);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setPassengers(load(PASSENGER_KEY, DEFAULT_PASSENGERS));
    setPreferences(load(PREFERENCE_KEY, DEFAULT_PREFERENCES));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(PASSENGER_KEY, JSON.stringify(passengers));
  }, [hydrated, passengers]);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(PREFERENCE_KEY, JSON.stringify(preferences));
  }, [hydrated, preferences]);

  return { passengers, setPassengers, preferences, setPreferences };
}