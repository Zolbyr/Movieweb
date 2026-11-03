import { load } from "cheerio";
import { mongoliaDate, type LocalMovie, type ProviderId } from "./cinemas";

function safeUrl(value: string | undefined, base: string, hosts: string[]) {
  if (!value) return null;
  try {
    const url = new URL(value, base);
    return url.protocol === "https:" && hosts.includes(url.hostname) ? url.href : null;
  } catch { return null; }
}

export function parseTengis(html: string, today = mongoliaDate()): LocalMovie[] {
  const $ = load(html);
  const data = JSON.parse($("#__NEXT_DATA__").text());
  const day = data?.props?.pageProps?.repo?.ongoings?.find((entry: { day: string }) => entry.day === today);
  if (!day || !Array.isArray(day.movies)) return [];
  const movies: LocalMovie[] = [];
  for (const movie of day.movies) {
    if (typeof movie.title !== "string" || typeof movie.slug !== "string" || movie.status !== "ENABLED") continue;
    const url = safeUrl("/film/" + encodeURIComponent(movie.slug), "https://www.tengis.mn", ["www.tengis.mn"]);
    if (!url) continue;
    movies.push({
      id: "tengis-" + movie.id,
      title: movie.title.trim(),
      poster: safeUrl(movie.verticalPosterUrl, "https://www.tengis.mn", ["www.tengis.mn"]),
      url, provider: "tengis", rating: typeof movie.rating === "string" ? movie.rating : undefined,
    });
  }
  return movies;
}

export function parseUrgoo(html: string): LocalMovie[] {
  const $ = load(html);
  const movies: LocalMovie[] = [];
  const seen = new Set<string>();
  $("#now-showing a[href^='/movies/']").each((_, element) => {
    const card = $(element);
    const image = card.find("img[alt]").filter((_, element) => Boolean($(element).attr("alt")) && Boolean($(element).attr("src")?.includes("/portrait-"))).first();
    const title = image.attr("alt")?.trim();
    const url = safeUrl(card.attr("href"), "https://new.urgoo.mn", ["new.urgoo.mn"]);
    if (!title || !url || seen.has(url)) return;
    seen.add(url);
    // Use the original portrait rather than the site's full-size CDN transform.
    const transformed = image.attr("src") || "";
    const original = transformed.match(/https:\/\/media\.urgoo\.oneline\.mn\/.*?(\/films\/.+)$/);
    const poster = safeUrl(original ? "https://media.urgoo.oneline.mn" + original[1] : transformed, "https://new.urgoo.mn", ["media.urgoo.oneline.mn"]);
    const rating = card.find("span").map((_, element) => $(element).text().trim()).get().find((text) => /^(G|PG|PG13|PG-13|R|R16|R18)$/.test(text));
    movies.push({ id: "urgoo-" + url.split("/").pop(), title, poster, url, provider: "urgoo", rating });
  });
  if (!$("#now-showing").length) throw new Error("Urgoo listing markup changed");
  return movies;
}

export function parsePrime(html: string, today = mongoliaDate()): LocalMovie[] {
  const $ = load(html);
  const movies: LocalMovie[] = [];
  const seen = new Set<string>();
  // Only include films with an actual booking on today's first tab.
  $("#tab_1 .itemsContainer-sam").each((_, element) => {
    const card = $(element);
    const hasToday = card.find("a[href*='ShowDate=']").toArray().some((element) => {
      try {
        const date = new URL($(element).attr("href")!, "https://www.primecineplex.mn").searchParams.get("ShowDate")?.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
        return date && date[3] + "-" + date[1].padStart(2, "0") + "-" + date[2].padStart(2, "0") === today;
      } catch { return false; }
    });
    if (!hasToday) return;
    const anchor = card.find("a[href*='GetMovieDetails']").first();
    const url = safeUrl(anchor.attr("href"), "https://www.primecineplex.mn", ["www.primecineplex.mn"]);
    const title = card.find(".col-7").first().text().replace(/\s+/g, " ").trim();
    if (!url || !title || seen.has(url)) return;
    seen.add(url);
    movies.push({
      id: "prime-" + new URL(url).searchParams.get("EventID"), title, url, provider: "prime",
      poster: safeUrl(anchor.find("img").first().attr("src"), "https://www.primecineplex.mn", ["thumbnail.primecineplex.mn", "www.primecineplex.mn"]),
      format: card.find(".col-5").first().text().replace(/\s+/g, " ").trim(),
    });
  });
  if (!$("#tab_1").length) throw new Error("Prime listing markup changed");
  return movies;
}

export const listingParsers: Record<ProviderId, (html: string, today: string) => LocalMovie[]> = { tengis: parseTengis, urgoo: parseUrgoo, prime: parsePrime };
