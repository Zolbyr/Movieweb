import { Star } from "lucide-react";
import { rating } from "../../../lib/movies";

export function MovieRating({ score, voteCount, source }: { score?: number | null; voteCount?: number; source?: string }) {
  const available = typeof score === "number" && Number.isFinite(score) && score >= 0 && score <= 10
    && (voteCount === undefined ? score > 0 : voteCount > 0);
  const value = available ? rating(score) : null;
  return <div className={"movie-rating " + (available ? "" : "movie-rating-empty")} role="img" aria-label={value ? (source ? source + ": " : "") + "10-аас " + value + " оноо" : "Үнэлгээ байхгүй"}>
    <Star size={16} fill={available ? "currentColor" : "none"} aria-hidden="true" />
    {value ? <><strong>{value}</strong><span className="movie-rating-scale">/ 10</span>{source && <span className="movie-rating-source">{source}</span>}</> : <span>Үнэлгээ байхгүй</span>}
  </div>;
}
