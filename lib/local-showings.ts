import { mongoliaDate, type LocalListing, type LocalMovie } from "./cinemas";

function titleKey(title: string) {
  return title.normalize("NFKC").toLowerCase()
    .replace(/(?:\s+|\s*\()(?:imax|3d|2d|laser\s*2d)\)?$/i, "")
    .replace(/[^\p{L}\p{N}]/gu, "");
}

// Title matches are suggestions, not proof that two releases are the same film.
export function findLocalShowings(titles: string[], listings: LocalListing[], today = mongoliaDate()): LocalMovie[] {
  const keys = new Set(titles.map(titleKey).filter(Boolean));
  return listings.filter((listing) => listing.available && listing.date === today)
    .flatMap((listing) => listing.movies.filter((movie) => keys.has(titleKey(movie.title))));
}
