"use client";

import { useState } from "react";
import { Button, Card, Chip, Link, Skeleton } from "@heroui/react";
import { ArrowUpRight, ChevronLeft, ChevronRight, MessageSquare, RefreshCw, Star } from "lucide-react";
import { reviewScore, reviewSource, reviewText, type ReviewResults } from "../../lib/reviews";
import { useMovies } from "./useMovies";

export function MovieReviews({ movieId, title, compact = false }: { movieId: number; title: string; compact?: boolean }) {
  const [sourcePage, setSourcePage] = useState(1);
  const { data, loading, error, retry } = useMovies<ReviewResults>("movie/" + movieId + "/reviews?language=en-US&page=" + sourcePage);
  const [page, setPage] = useState(0);
  const reviews = (data?.results || []).filter((review) => typeof review.content === "string" && reviewText(review.content));
  const size = compact ? 2 : 3;
  const pages = Math.ceil(reviews.length / size);
  const current = ((page % (pages || 1)) + (pages || 1)) % (pages || 1);
  const shown = reviews.slice(current * size, current * size + size);
  const sourcePages = Math.max(1, Math.min(data?.total_pages || 1, 500));
  const changePage = (step: number) => {
    if (step > 0 && current + 1 < pages) { setPage(current + 1); return; }
    if (step < 0 && current > 0) { setPage(current - 1); return; }
    setSourcePage(step > 0 ? sourcePage < sourcePages ? sourcePage + 1 : 1 : sourcePage > 1 ? sourcePage - 1 : sourcePages);
    setPage(step > 0 ? 0 : -1);
  };

  return <aside className={"movie-reviews " + (compact ? "movie-reviews-compact" : "")} aria-label={title + " киноны үзэгчдийн сэтгэгдэл"} data-movie-id={movieId}>
    <div className="reviews-heading"><div><p className="eyebrow"><MessageSquare size={14} /> TMDB-ийн үзэгчдээс</p><h2>Үзэгчдийн сэтгэгдэл</h2></div>{!loading && !error && <Chip size="sm" variant="soft">{data?.total_results || 0}</Chip>}</div>
    <p className="reviews-film-title">{title}</p>
    {loading ? <div className="reviews-list" aria-busy="true" aria-label="Сэтгэгдлүүдийг ачаалж байна">{Array.from({ length: size }, (_, index) => <Card className="review-skeleton" key={index} aria-hidden="true"><Skeleton className="skeleton-title" /><Skeleton className="skeleton-title" /><Skeleton className="skeleton-subtitle" /></Card>)}</div>
      : error ? <div className="reviews-empty" role="alert"><MessageSquare size={22} /><p>Сэтгэгдлүүдийг ачаалж чадсангүй.</p><Button size="sm" variant="outline" onPress={retry}><RefreshCw size={14} />Дахин оролдох</Button></div>
      : !shown.length ? <div className="reviews-empty"><MessageSquare size={25} /><p>Энэ кинонд одоогоор сэтгэгдэл нийтлэгдээгүй байна.</p><Link href={"https://www.themoviedb.org/movie/" + movieId + "/reviews"} target="_blank" rel="noreferrer">TMDB дээр харах <ArrowUpRight size={13} /></Link></div>
      : <div className="reviews-list" key={current}>{shown.map((review) => {
        const author = String(review.author_details?.name?.trim() || review.author || review.author_details?.username || "TMDB хэрэглэгч");
        const score = reviewScore(review.author_details?.rating);
        const source = reviewSource(review.url);
        const date = new Date(review.created_at);
        return <Card className="review-card" key={review.id}>
          <Card.Header className="review-author"><span className="review-initial" aria-hidden="true">{Array.from(author)[0]?.toUpperCase()}</span><div><strong>{author}</strong>{Number.isFinite(date.getTime()) && <time dateTime={review.created_at}>{new Intl.DateTimeFormat("mn-MN", { year: "numeric", month: "2-digit", day: "2-digit" }).format(date)}</time>}</div>{score !== null && <span className="review-score"><Star size={12} />{score}<small>/10</small></span>}</Card.Header>
          <Card.Content><p className="review-excerpt">{reviewText(review.content)}</p></Card.Content>
          {source && <Card.Footer><Link href={source} target="_blank" rel="noreferrer" className="review-source">Сэтгэгдлийг бүтнээр нь унших <ArrowUpRight size={13} /></Link></Card.Footer>}
        </Card>;
      })}</div>}
    <div className="reviews-footer"><p>Сэтгэгдлүүдийг эх хэлээр нь харуулав.</p>{!loading && !error && shown.length > 0 && (data?.total_results || 0) > size && <div className="review-controls"><Button isIconOnly variant="ghost" aria-label="Өмнөх сэтгэгдлүүд" onPress={() => changePage(-1)}><ChevronLeft size={16} /></Button><span aria-live="polite">{(sourcePage - 1) * 20 + current * size + 1}–{(sourcePage - 1) * 20 + current * size + shown.length} / {data?.total_results}</span><Button isIconOnly variant="ghost" aria-label="Дараагийн сэтгэгдлүүд" onPress={() => changePage(1)}><ChevronRight size={16} /></Button></div>}</div>
  </aside>;
}
