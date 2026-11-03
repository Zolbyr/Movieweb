import { NextResponse } from "next/server";
import { cinemaProviders, mongoliaDate, type LocalListing } from "../../../lib/cinemas";
import { listingParsers } from "../../../lib/local-listings";

export async function GET() {
  const date = mongoliaDate();
  const listings = await Promise.all(cinemaProviders.map(async (provider): Promise<LocalListing> => {
    try {
      const response = await fetch(provider.url, {
        headers: { accept: "text/html", "User-Agent": "MovieZ/1.0 (cinema listings; links to original sources)" },
        signal: AbortSignal.timeout(10000),
        next: { revalidate: 300 },
      });
      if (!response.ok) throw new Error("Cinema service unavailable");
      const movies = listingParsers[provider.id](await response.text(), date);
      return { provider: provider.id, available: true, movies, date };
    } catch {
      return { provider: provider.id, available: false, movies: [], date };
    }
  }));
  return NextResponse.json({ listings, fetchedAt: new Date().toISOString() });
}
