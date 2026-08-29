export type StationGroup = {
  city: string;
  label: string;
  items: { name: string; code: string }[];
};

export const STATION_GROUPS: StationGroup[] = [
  {
    city: "Mumbai",
    label: "Stations in Mumbai",
    items: [
      { name: "Chhatrapati Shivaji Maharaj Terminus", code: "CSMT" },
      { name: "Mumbai Central", code: "BCT" },
      { name: "Dadar", code: "DR" },
      { name: "Bandra Terminus", code: "BDTS" },
    ],
  },
  {
    city: "Mumbai",
    label: "Airports near Mumbai",
    items: [{ name: "Chhatrapati Shivaji Intl", code: "BOM" }],
  },
  {
    city: "Pune",
    label: "Stations in Pune",
    items: [
      { name: "Pune Junction", code: "PUNE" },
      { name: "Shivajinagar", code: "SVJR" },
      { name: "Hadapsar", code: "HDP" },
      { name: "Khadki", code: "KK" },
    ],
  },
  {
    city: "Delhi",
    label: "Stations in Delhi",
    items: [
      { name: "New Delhi", code: "NDLS" },
      { name: "Hazrat Nizamuddin", code: "NZM" },
      { name: "Delhi Sarai Rohilla", code: "DEE" },
      { name: "Anand Vihar Terminal", code: "ANVT" },
    ],
  },
  {
    city: "Bangalore",
    label: "Stations in Bangalore",
    items: [
      { name: "KSR Bengaluru City", code: "SBC" },
      { name: "Yesvantpur Junction", code: "YPR" },
      { name: "Banaswadi", code: "BAND" },
    ],
  },
  {
    city: "Chennai",
    label: "Stations in Chennai",
    items: [
      { name: "Chennai Central", code: "MAS" },
      { name: "Chennai Egmore", code: "MS" },
      { name: "Tambaram", code: "TBM" },
    ],
  },
  {
    city: "Hyderabad",
    label: "Stations in Hyderabad",
    items: [
      { name: "Secunderabad Junction", code: "SC" },
      { name: "Hyderabad Deccan", code: "HYB" },
      { name: "Kacheguda", code: "KCG" },
    ],
  },
  {
    city: "Kolkata",
    label: "Stations in Kolkata",
    items: [
      { name: "Howrah Junction", code: "HWH" },
      { name: "Sealdah", code: "SDAH" },
      { name: "Kolkata Terminal", code: "KOAA" },
      { name: "Shalimar", code: "SHM" },
    ],
  },
  {
    city: "Jaipur",
    label: "Stations in Jaipur",
    items: [
      { name: "Jaipur Junction", code: "JP" },
      { name: "Gandhinagar Jaipur", code: "GADJ" },
      { name: "Durgapura", code: "DPA" },
    ],
  },
  {
    city: "Ahmedabad",
    label: "Stations in Ahmedabad",
    items: [
      { name: "Ahmedabad Junction", code: "ADI" },
      { name: "Sabarmati Junction", code: "SBIB" },
      { name: "Maninagar", code: "MAN" },
      { name: "Gandhinagar Capital", code: "GNC" },
    ],
  },
  {
    city: "Ahmedabad",
    label: "Airports near Ahmedabad",
    items: [{ name: "Sardar Vallabhbhai Patel Intl", code: "AMD" }],
  },
  {
    city: "Surat",
    label: "Stations in Surat",
    items: [
      { name: "Surat", code: "ST" },
      { name: "Udhna Junction", code: "UDN" },
    ],
  },
  {
    city: "Vadodara",
    label: "Stations in Vadodara",
    items: [
      { name: "Vadodara Junction", code: "BRC" },
      { name: "Pratapnagar", code: "PRTN" },
    ],
  },
  {
    city: "Lucknow",
    label: "Stations in Lucknow",
    items: [
      { name: "Lucknow Charbagh NR", code: "LKO" },
      { name: "Lucknow Junction NER", code: "LJN" },
      { name: "Gomti Nagar", code: "GTNR" },
    ],
  },
  {
    city: "Varanasi",
    label: "Stations in Varanasi",
    items: [
      { name: "Varanasi Junction", code: "BSB" },
      { name: "Banaras", code: "BSBS" },
      { name: "Pt. Deen Dayal Upadhyaya Jn", code: "DDU" },
    ],
  },
  {
    city: "Bhopal",
    label: "Stations in Bhopal",
    items: [
      { name: "Bhopal Junction", code: "BPL" },
      { name: "Rani Kamlapati", code: "RKMP" },
    ],
  },
  {
    city: "Indore",
    label: "Stations in Indore",
    items: [
      { name: "Indore Junction", code: "INDB" },
      { name: "Laxmibai Nagar", code: "LMNR" },
    ],
  },
  {
    city: "Nagpur",
    label: "Stations in Nagpur",
    items: [
      { name: "Nagpur Junction", code: "NGP" },
      { name: "Ajni", code: "AJNI" },
    ],
  },
  {
    city: "Patna",
    label: "Stations in Patna",
    items: [
      { name: "Patna Junction", code: "PNBE" },
      { name: "Rajendra Nagar Terminal", code: "RJPB" },
      { name: "Danapur", code: "DNR" },
    ],
  },
  {
    city: "Chandigarh",
    label: "Stations in Chandigarh",
    items: [
      { name: "Chandigarh Junction", code: "CDG" },
      { name: "Mohali", code: "SASN" },
    ],
  },
  {
    city: "Amritsar",
    label: "Stations in Amritsar",
    items: [{ name: "Amritsar Junction", code: "ASR" }],
  },
  {
    city: "Kochi",
    label: "Stations in Kochi",
    items: [
      { name: "Ernakulam Junction", code: "ERS" },
      { name: "Ernakulam Town", code: "ERN" },
      { name: "Aluva", code: "AWY" },
    ],
  },
  {
    city: "Coimbatore",
    label: "Stations in Coimbatore",
    items: [{ name: "Coimbatore Junction", code: "CBE" }],
  },
  {
    city: "Goa",
    label: "Stations in Goa",
    items: [
      { name: "Madgaon Junction", code: "MAO" },
      { name: "Vasco da Gama", code: "VSG" },
      { name: "Thivim", code: "THVM" },
    ],
  },
  {
    city: "Jodhpur",
    label: "Stations in Jodhpur",
    items: [{ name: "Jodhpur Junction", code: "JU" }],
  },
  {
    city: "Udaipur",
    label: "Stations in Udaipur",
    items: [{ name: "Udaipur City", code: "UDZ" }],
  },
  {
    city: "Agra",
    label: "Stations in Agra",
    items: [
      { name: "Agra Cantt", code: "AGC" },
      { name: "Agra Fort", code: "AF" },
    ],
  },
  {
    city: "Mysuru",
    label: "Stations in Mysuru",
    items: [{ name: "Mysuru Junction", code: "MYS" }],
  },
  {
    city: "Thiruvananthapuram",
    label: "Stations in Thiruvananthapuram",
    items: [
      { name: "Thiruvananthapuram Central", code: "TVC" },
      { name: "Kochuveli", code: "KCVL" },
    ],
  },
  {
    city: "Solapur",
    label: "Stations in Solapur",
    items: [{ name: "Solapur Jn", code: "SUR" }],
  },
];


export type ClassCode = "SL" | "3AC" | "2AC" | "1AC" | "CC" | "EC";

export type Availability = {
  cls: ClassCode;
  status: string;
  tone: "ok" | "warn" | "bad";
  lower?: boolean;
  fare: number;
  tooltip: string;
};

export type Train = {
  id: string;
  number: string;
  name: string;
  type: "Shatabdi" | "Intercity" | "Express" | "Duronto";
  dep: string;
  arr: string;
  duration: string;
  depBucket: "morning" | "afternoon" | "evening" | "night";
  durationMins: number;
  tatkal: boolean;
  emergencyQuota: boolean;
  seniorQuota: boolean;
  avail: Availability[];
};

export const TRAINS: Train[] = [
  {
    id: "t1",
    number: "12222",
    name: "Pune Express",
    type: "Express",
    dep: "06:10",
    arr: "09:35",
    duration: "3h 25m",
    durationMins: 205,
    depBucket: "morning",
    tatkal: true,
    emergencyQuota: false,
    seniorQuota: true,
    avail: [
      { cls: "SL", status: "AVL 42 · Lower", tone: "ok", lower: true, fare: 285, tooltip: "42 berths free. Lower berth can be requested at booking." },
      { cls: "3AC", status: "AVL 12 · Lower", tone: "ok", lower: true, fare: 610, tooltip: "12 berths free in 3AC, lower berths still open." },
      { cls: "2AC", status: "WL 3", tone: "warn", fare: 880, tooltip: "GNWL/3 — General waitlist, position 3. Very likely to confirm." },
    ],
  },
  {
    id: "t2",
    number: "12027",
    name: "Deccan Shatabdi",
    type: "Shatabdi",
    dep: "05:40",
    arr: "08:55",
    duration: "3h 15m",
    durationMins: 195,
    depBucket: "morning",
    tatkal: true,
    emergencyQuota: false,
    seniorQuota: false,
    avail: [
      { cls: "CC", status: "AVL 88", tone: "ok", fare: 520, tooltip: "Chair car, 88 seats open. No berths on this train." },
      { cls: "EC", status: "AVL 9", tone: "ok", fare: 1010, tooltip: "Executive chair car, 9 seats open." },
    ],
  },
  {
    id: "t3",
    number: "11007",
    name: "Deccan Express",
    type: "Express",
    dep: "07:00",
    arr: "11:10",
    duration: "4h 10m",
    durationMins: 250,
    depBucket: "morning",
    tatkal: false,
    emergencyQuota: false,
    seniorQuota: true,
    avail: [
      { cls: "SL", status: "GNWL 43", tone: "bad", fare: 300, tooltip: "GNWL/43 — General waitlist, position 43. Unlikely to confirm." },
      { cls: "3AC", status: "RAC 6", tone: "warn", fare: 590, tooltip: "RAC 6 — you get a shared side-lower seat, often upgraded to a full berth." },
    ],
  },
  {
    id: "t4",
    number: "12124",
    name: "Deccan Queen",
    type: "Intercity",
    dep: "17:10",
    arr: "20:25",
    duration: "3h 15m",
    durationMins: 195,
    depBucket: "evening",
    tatkal: true,
    emergencyQuota: true,
    seniorQuota: true,
    avail: [
      { cls: "CC", status: "AVL 31", tone: "ok", fare: 495, tooltip: "Chair car, 31 seats open." },
      { cls: "SL", status: "AVL 8 · Lower", tone: "ok", lower: true, fare: 310, tooltip: "8 sleeper berths open including lower berths." },
      { cls: "2AC", status: "WL 11", tone: "warn", fare: 905, tooltip: "GNWL/11 — General waitlist, position 11. Often clears near departure." },
    ],
  },
  {
    id: "t5",
    number: "12126",
    name: "Pragati Express",
    type: "Express",
    dep: "16:25",
    arr: "19:40",
    duration: "3h 15m",
    durationMins: 195,
    depBucket: "afternoon",
    tatkal: true,
    emergencyQuota: false,
    seniorQuota: false,
    avail: [
      { cls: "CC", status: "AVL 54", tone: "ok", fare: 480, tooltip: "Chair car, 54 seats open." },
      { cls: "3AC", status: "AVL 4 · Lower", tone: "ok", lower: true, fare: 600, tooltip: "Only 4 berths left in 3AC; lower berth available." },
    ],
  },
  {
    id: "t6",
    number: "12263",
    name: "Duronto Special",
    type: "Duronto",
    dep: "23:05",
    arr: "02:20",
    duration: "3h 15m",
    durationMins: 195,
    depBucket: "night",
    tatkal: true,
    emergencyQuota: true,
    seniorQuota: false,
    avail: [
      { cls: "3AC", status: "AVL 19 · Lower", tone: "ok", lower: true, fare: 640, tooltip: "19 berths open in 3AC, lower berths available." },
      { cls: "2AC", status: "AVL 5", tone: "ok", fare: 960, tooltip: "5 berths open in 2AC — upper berths only." },
      { cls: "1AC", status: "WL 2", tone: "warn", fare: 1580, tooltip: "GNWL/2 — first AC waitlist, position 2. Usually confirms." },
    ],
  },
  {
    id: "t7",
    number: "11029",
    name: "Koyna Express",
    type: "Express",
    dep: "21:40",
    arr: "01:30",
    duration: "3h 50m",
    durationMins: 230,
    depBucket: "night",
    tatkal: false,
    emergencyQuota: false,
    seniorQuota: true,
    avail: [
      { cls: "SL", status: "AVL 27 · Lower", tone: "ok", lower: true, fare: 290, tooltip: "27 sleeper berths open including lower berths." },
      { cls: "3AC", status: "GNWL 21", tone: "bad", fare: 585, tooltip: "GNWL/21 — General waitlist, position 21. Confirmation is a coin flip." },
    ],
  },
  {
    id: "t8",
    number: "12115",
    name: "Siddheshwar Intercity",
    type: "Intercity",
    dep: "13:20",
    arr: "17:05",
    duration: "3h 45m",
    durationMins: 225,
    depBucket: "afternoon",
    tatkal: true,
    emergencyQuota: false,
    seniorQuota: true,
    avail: [
      { cls: "SL", status: "AVL 61 · Lower", tone: "ok", lower: true, fare: 295, tooltip: "Plenty of sleeper berths, lower berths free." },
      { cls: "CC", status: "AVL 12", tone: "ok", fare: 470, tooltip: "Chair car, 12 seats open." },
      { cls: "3AC", status: "RAC 14", tone: "warn", fare: 605, tooltip: "RAC 14 — shared side seat now, likely full berth later." },
    ],
  },
];

/**
 * Direction of travel (compass bearing, degrees) for each mock service. Up trains run
 * east-southeast out of Mumbai; the down services (Deccan Queen, Koyna) head back
 * west-northwest, which flips which window side catches the afternoon sun.
 */
export const TRAIN_BEARINGS: Record<string, number> = {
  t1: 100,
  t2: 104,
  t3: 98,
  t4: 282,
  t5: 100,
  t6: 96,
  t7: 278,
  t8: 108,
};

export function trainBearing(trainId: string): number {
  return TRAIN_BEARINGS[trainId] ?? 100;
}

export const FARE_WEEK = [

  { day: "Mon", fare: 285 },
  { day: "Tue", fare: 310 },
  { day: "Wed", fare: 295 },
  { day: "Thu", fare: 430 },
  { day: "Fri", fare: 610 },
  { day: "Sat", fare: 580 },
  { day: "Sun", fare: 365 },
];

export const PASSENGERS = [
  { id: "p1", name: "Priya Sharma", gender: "F", age: 67, berth: "Lower berth", id_type: "Aadhaar" },
  { id: "p2", name: "Rahul Sharma", gender: "M", age: 35, berth: "Any", id_type: "Aadhaar" },
];

export const TRANSPORT = [
  { id: "train", icon: "🚂", label: "Train", time: "~14h", price: "₹450" },
  { id: "flight", icon: "✈️", label: "Flight", time: "~2h", price: "₹4200" },
  { id: "bus", icon: "🚌", label: "Bus", time: "~18h", price: "₹320" },
] as const;

export type Flight = {
  id: string;
  airline: string;
  number: string;
  dep: string;
  arr: string;
  duration: string;
  stops: string;
  fare: number;
  cabin: string;
  baggage: string;
};

export const FLIGHTS: Flight[] = [
  { id: "f1", airline: "IndiGo", number: "6E 512", dep: "06:30", arr: "08:35", duration: "2h 05m", stops: "Non-stop", fare: 4210, cabin: "Economy", baggage: "15 kg" },
  { id: "f2", airline: "Akasa Air", number: "QP 143", dep: "09:15", arr: "11:25", duration: "2h 10m", stops: "Non-stop", fare: 4480, cabin: "Economy", baggage: "15 kg" },
  { id: "f3", airline: "Air India", number: "AI 614", dep: "14:20", arr: "16:30", duration: "2h 10m", stops: "Non-stop", fare: 4960, cabin: "Economy", baggage: "20 kg" },
  { id: "f4", airline: "SpiceJet", number: "SG 672", dep: "19:10", arr: "21:20", duration: "2h 10m", stops: "Non-stop", fare: 4385, cabin: "Economy", baggage: "15 kg" },
];
