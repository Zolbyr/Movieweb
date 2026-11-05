"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, Card, Link as UILink } from "@heroui/react";
import Image from "next/image";
import { ArrowUpRight, Clapperboard, RefreshCw, Search } from "lucide-react";
import { imageUrl, posterSizes, type Movie } from "../../lib/movies";
import { PosterSkeleton } from "./ui/PosterSkeleton";
import { MovieRating } from "./ui/MovieRating";
import { formatMovieDate, validMovieDate } from "../../lib/movie-dates";

export function MovieCard({ movie, index = 0 }: { movie: Movie; index?: number }) {
  const [failed, setFailed] = useState(false);
  const poster = imageUrl(movie.poster_path);
  return <Card<"a"> render={(props) => <Link {...props} href={"/movie/" + movie.id} />} className="movie-card" style={{ "--delay": Math.min(index, 9) * 35 + "ms" } as React.CSSProperties}>
    <div className="movie-poster">
      {poster && !failed ? <Image src={poster} alt={movie.title + " киноны постер"} fill sizes={posterSizes} onError={() => setFailed(true)} /> : <div className="poster-fallback"><Clapperboard size={34} /><span>Киноны зураг байхгүй</span></div>}
      <span className="poster-overlay"><span>Дэлгэрэнгүй <ArrowUpRight size={15} /></span></span>
    </div>
    <Card.Content className="movie-card-info"><Card.Title><span>{movie.title}</span></Card.Title><Card.Description className="movie-release-date">{validMovieDate(movie.release_date) ? <time dateTime={movie.release_date} title="Нээлтийн огноо · TMDB"><span className="sr-only">Нээлт (TMDB): </span>{formatMovieDate(movie.release_date)}</time> : "Огноо тодорхойгүй"}</Card.Description><MovieRating score={movie.vote_average} voteCount={movie.vote_count} source="TMDB" /></Card.Content>
  </Card>;
}

export function MovieGrid({ movies, loading = false, count = 10 }: { movies?: Movie[]; loading?: boolean; count?: number }) {
  return <div className="movie-grid" aria-busy={loading}>
    {loading ? Array.from({ length: count }, (_, index) => <PosterSkeleton key={index} />)
      : movies?.map((movie, index) => <MovieCard key={movie.id} movie={movie} index={index} />)}
  </div>;
}

export function ErrorState({ message, retry }: { message: string; retry?: () => void }) {
  return <Card className="empty-state" role="alert"><span className="empty-icon"><Clapperboard size={25} /></span><Card.Title>Мэдээллийг ачаалж чадсангүй</Card.Title><Card.Description>{message}</Card.Description>{retry && <Button variant="outline" onPress={retry}><RefreshCw size={15} />Дахин оролдох</Button>}</Card>;
}

export function EmptyState({ title = "Кино олдсонгүй", message = "Өөр нэр эсвэл төрлөөр хайна уу." }: { title?: string; message?: string }) {
  return <Card className="empty-state"><span className="empty-icon"><Search size={25} /></span><Card.Title>{title}</Card.Title><Card.Description>{message}</Card.Description><UILink className="button button-secondary" href="/">Нүүр хуудас <ArrowUpRight size={15} /></UILink></Card>;
}
