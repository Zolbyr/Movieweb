export function validMovieDate(value: unknown): string | null {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(value + "T00:00:00Z");
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value ? value : null;
}

export function formatMovieDate(value: unknown) {
  return validMovieDate(value)?.replaceAll("-", ".") || "Огноо тодорхойгүй";
}

export function cinemaOpeningDate(value: unknown): string | undefined {
  const dateOnly = validMovieDate(value);
  if (dateOnly) return dateOnly;
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(value) || !validMovieDate(value.slice(0, 10))) return undefined;
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return undefined;
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ulaanbaatar", year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
}

export type CountryReleaseDates = { results: { iso_3166_1: string; release_dates: { release_date: string; type: number }[] }[] };

export function latestMongoliaTheatricalDate(releases: CountryReleaseDates | undefined, today: string): string | undefined {
  // TMDB types 2/3 are theatrical. Digital/TV dates are not cinema releases.
  return releases?.results.filter((country) => country.iso_3166_1 === "MN")
    .flatMap((country) => country.release_dates)
    .filter((release) => release.type === 2 || release.type === 3)
    .map((release) => validMovieDate(release.release_date.slice(0, 10)))
    .filter((date): date is string => date !== null && date <= today)
    .sort().at(-1);
}
