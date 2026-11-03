export const cinemaProviders = [
  { id: "urgoo", name: "Өргөө", possessive: "Өргөөгийн", url: "https://new.urgoo.mn/", scheduleUrl: "https://new.urgoo.mn/schedule", color: "#3979e5" },
  { id: "tengis", name: "Тэнгис", possessive: "Тэнгисийн", url: "https://www.tengis.mn/", scheduleUrl: "https://www.tengis.mn/#movies", color: "#8454d9" },
  { id: "prime", name: "Prime Cineplex", possessive: "Prime Cineplex-ийн", url: "https://www.primecineplex.mn/", scheduleUrl: "https://www.primecineplex.mn/", color: "#cb5546" },
] as const;

export type ProviderId = (typeof cinemaProviders)[number]["id"];
export type LocalMovie = {
  id: string;
  title: string;
  poster: string | null;
  url: string;
  provider: ProviderId;
  rating?: string;
  format?: string;
};
export type LocalListing = {
  provider: ProviderId;
  available: boolean;
  movies: LocalMovie[];
  date: string;
};
export type LocalListingsResponse = { listings: LocalListing[]; fetchedAt: string };
export type Coordinates = { latitude: number; longitude: number };
export type Cinema = Coordinates & {
  id: string;
  name: string;
  provider: ProviderId;
  city: "Улаанбаатар" | "Дархан" | "Эрдэнэт";
  address: string;
  url: string;
  sourceUrl: string;
};

// Coordinates verified on 2026-10-30 against official branch maps.
// Tengis coordinates are from the linked OpenStreetMap cinema features.
export const cinemaLocationsUpdated = "2026-10-30";
export const cinemas: Cinema[] = [
  { id: "tengis-1", name: "Тэнгис 1", provider: "tengis", city: "Улаанбаатар", address: "Чингэлтэй дүүрэг, 5-р хороо, Ж. Самбуугийн гудамж", latitude: 47.922808, longitude: 106.904498, url: "https://www.tengis.mn/#movies", sourceUrl: "https://www.openstreetmap.org/way/129230047" },
  { id: "tengis-gegeenten", name: "Тэнгис Гэгээнтэн", provider: "tengis", city: "Улаанбаатар", address: "Хан-Уул дүүрэг, 18-р хороо, Гэгээнтэн цогцолбор, 4 давхар", latitude: 47.897646, longitude: 106.9088988, url: "https://www.tengis.mn/#movies", sourceUrl: "https://www.openstreetmap.org/node/3894640464" },
  { id: "urgoo-1", name: "Өргөө 1, 5 IMAX", provider: "urgoo", city: "Улаанбаатар", address: "Хороолол, Улаанбаатар", latitude: 47.9233, longitude: 106.8748, url: "https://new.urgoo.mn/schedule?cinemas=0001", sourceUrl: "https://new.urgoo.mn/cinemas" },
  { id: "urgoo-7", name: "Өргөө 7", provider: "urgoo", city: "Улаанбаатар", address: "Цэцэрлэгт хүрээлэн, Улаанбаатар", latitude: 47.9028, longitude: 106.9402, url: "https://new.urgoo.mn/schedule?cinemas=0007", sourceUrl: "https://new.urgoo.mn/cinemas" },
  { id: "prime-zaisan", name: "Prime Cineplex Зайсан", provider: "prime", city: "Улаанбаатар", address: "Зайсан, Хан-Уул дүүрэг", latitude: 47.8857474, longitude: 106.9149588, url: "https://www.primecineplex.mn/", sourceUrl: "https://www.primecineplex.mn/Home/contactus" },
  { id: "prime-encanto", name: "Prime Cineplex Энканто", provider: "prime", city: "Улаанбаатар", address: "Энканто, Улаанбаатар", latitude: 47.9027328, longitude: 106.9291229, url: "https://www.primecineplex.mn/", sourceUrl: "https://www.primecineplex.mn/Home/contactus" },
  { id: "prime-botanic", name: "Prime Cineplex Ботаник", provider: "prime", city: "Улаанбаатар", address: "Ботаник, Улаанбаатар", latitude: 47.9126111, longitude: 106.9957437, url: "https://www.primecineplex.mn/", sourceUrl: "https://www.primecineplex.mn/Home/contactus" },
  { id: "prime-dragon", name: "Prime Cineplex Драгон", provider: "prime", city: "Улаанбаатар", address: "Сонгинохайрхан дүүрэг, 29-р хороо, Драгон", latitude: 47.9108735, longitude: 106.8202675, url: "https://www.primecineplex.mn/", sourceUrl: "https://www.primecineplex.mn/Home/contactus" },
  { id: "urgoo-4", name: "Өргөө 4 — Эрдэнэт", provider: "urgoo", city: "Эрдэнэт", address: "Эрдэнэт хот", latitude: 49.0275, longitude: 104.0361, url: "https://new.urgoo.mn/schedule?cinemas=0004", sourceUrl: "https://new.urgoo.mn/cinemas" },
  { id: "urgoo-6", name: "Өргөө 6 — Дархан", provider: "urgoo", city: "Дархан", address: "Дархан хот", latitude: 49.4741, longitude: 105.9472, url: "https://new.urgoo.mn/schedule?cinemas=0006", sourceUrl: "https://new.urgoo.mn/cinemas" },
];

export function distanceKm(from: Coordinates, to: Coordinates) {
  const rad = (degrees: number) => degrees * Math.PI / 180;
  const deltaLat = rad(to.latitude - from.latitude);
  const deltaLon = rad(to.longitude - from.longitude);
  const a = Math.sin(deltaLat / 2) ** 2 + Math.cos(rad(from.latitude)) * Math.cos(rad(to.latitude)) * Math.sin(deltaLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(Math.max(0, 1 - a)));
}

export function formatDistance(km: number) {
  return km < 1 ? Math.round(km * 1000) + " м" : km.toLocaleString("mn-MN", { maximumFractionDigits: km < 10 ? 1 : 0 }) + " км";
}

export function directionsUrl(cinema: Coordinates) {
  return "https://www.google.com/maps/dir/?api=1&destination=" + cinema.latitude + "," + cinema.longitude;
}

export function mongoliaDate(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ulaanbaatar", year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
}

export function cinemaDateLabel(value: string) {
  // Some browsers fall back to English for mn-MN date names.
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Ulaanbaatar", month: "numeric", day: "numeric", weekday: "short" }).formatToParts(new Date(value));
  const part = (name: string) => parts.find((item) => item.type === name)?.value || "";
  const days: Record<string, string> = { Mon: "даваа", Tue: "мягмар", Wed: "лхагва", Thu: "пүрэв", Fri: "баасан", Sat: "бямба", Sun: "ням" };
  return part("month") + "-р сарын " + part("day") + ", " + days[part("weekday")] + " гараг";
}
