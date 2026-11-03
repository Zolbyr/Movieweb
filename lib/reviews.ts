export type MovieReview = {
  id: string;
  author: string;
  author_details?: { name?: string; username?: string; rating?: number | null };
  content: string;
  created_at: string;
  url: string;
};

export type ReviewResults = {
  id: number;
  results: MovieReview[];
  total_results: number;
  total_pages: number;
};

// Review text is rendered as plain React text, never as HTML from an external author.
export function reviewText(content: string) {
  return content
    .replace(/<[^>]*>/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[*_`#>~]+/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function reviewSource(url: string) {
  try {
    const source = new URL(url);
    return source.protocol === "https:" && ["www.themoviedb.org", "themoviedb.org"].includes(source.hostname) && source.pathname.startsWith("/review/") ? source.href : null;
  } catch { return null; }
}

export function reviewScore(score: unknown) {
  return typeof score === "number" && Number.isFinite(score) && score >= 0 && score <= 10 ? score : null;
}
