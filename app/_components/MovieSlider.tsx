"use client";

import { useState, useEffect } from "react";
import { Button, Link, Skeleton } from "@heroui/react";
import Image from "next/image";
import { ArrowUpRight, CalendarDays, ChevronLeft, ChevronRight, Pause, Play, Star } from "lucide-react";
import { imageUrl, rating, type MovieResults } from "../../lib/movies";
import { useMovies } from "./useMovies";
import { ErrorState } from "./MovieGrid";
import { TrailerButton } from "./TrailerButton";
import { MovieReviews } from "./MovieReviews";
import { useNavigationMotion } from "./NavigationMotion";
import { formatMovieDate, validMovieDate } from "../../lib/movie-dates";

export function MovieSlider() {
  const { open: navigationOpen } = useNavigationMotion();
  const { data, error, loading, retry } = useMovies<MovieResults>("movie/popular?language=en-US&page=1");
  const movies = data?.results?.slice(0, 5) || [];
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [trailerOpen, setTrailerOpen] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(true);
  const movie = movies[index % (movies.length || 1)];

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    if (movies.length < 2 || paused || hovered || focused || trailerOpen || reducedMotion || navigationOpen) return;
    const timer = setInterval(() => { if (!document.hidden) setIndex((previous) => (previous + 1) % movies.length); }, 6500);
    return () => clearInterval(timer);
  }, [movies.length, paused, hovered, focused, trailerOpen, reducedMotion, navigationOpen]);

  if (loading) return <div className="featured-layout" aria-busy="true"><section className="hero hero-loading" aria-label="Онцлох киноны мэдээллийг ачаалж байна"><div className="hero-fallback"><p className="hero-kicker">Киноны сангаас онцлох</p><Skeleton className="hero-title-skeleton" /><p>Киноны мэдээллийг ачаалж байна…</p></div></section><aside className="movie-reviews" aria-label="Сэтгэгдлүүдийг ачаалж байна"><Skeleton className="skeleton-title" /><Skeleton className="reviews-loading-block" /><Skeleton className="reviews-loading-block" /></aside></div>;
  if (error || !movie) return <section className="hero hero-error"><div className="hero-fallback"><p className="hero-kicker">Киноны сангаас онцлох</p><ErrorState message={error || "Онцлох киноны мэдээлэл олдсонгүй."} retry={retry} /></div></section>;

  return <div className="featured-layout" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onFocusCapture={() => setFocused(true)} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setFocused(false); }}><section className="hero" aria-label="Онцлох кинонууд" aria-roledescription="Киноны слайд">
    <div className="hero-images" aria-hidden="true">
      {movies.map((item, slide) => <div key={item.id} className={"hero-image " + (slide === index % movies.length ? "is-active" : "")}>{imageUrl(item.backdrop_path, "w1280") && <Image src={imageUrl(item.backdrop_path, "w1280")!} alt="" fill sizes="(max-width: 1376px) 100vw, 1280px" />}</div>)}
    </div>
    <div className="hero-shade" />
    <div className="hero-layout">
      <div className="hero-content" key={movie.id}>
        <p className="hero-kicker">Киноны сангаас онцлох <span className="kicker-divider" /> TMDB</p>
        <h1 className="hero-title">{movie.title}</h1>
        <div className="hero-meta"><span className="hero-score"><Star size={14} />{rating(movie.vote_average)}<small>/10</small></span><span className="hero-release-date"><CalendarDays size={14} aria-hidden="true" />Нээлт (TMDB): {validMovieDate(movie.release_date) ? <time dateTime={movie.release_date}>{formatMovieDate(movie.release_date)}</time> : "тодорхойгүй"}</span></div>
        {movie.overview && <p className="hero-overview">{movie.overview}</p>}
        <div className="hero-actions"><TrailerButton key={movie.id} movieId={movie.id} title={movie.title} onOpenChange={setTrailerOpen} /><Link href={"/movie/" + movie.id} className="button button-glass">Дэлгэрэнгүй <ArrowUpRight size={16} /></Link></div>
      </div>
      <div className="hero-bottom"><div className="hero-position"><strong>{String(index % movies.length + 1).padStart(2, "0")}</strong><span>/ {String(movies.length).padStart(2, "0")}</span><div className="slide-dots">{movies.map((item, slide) => <Button variant="ghost" isIconOnly key={item.id} className={slide === index % movies.length ? "active" : ""} onPress={() => setIndex(slide)} aria-label={item.title + " киног харуулах"} aria-pressed={slide === index % movies.length} />)}</div></div>
        <div className="hero-controls"><Button variant="ghost" isIconOnly className="hero-control pause-control" aria-label={paused ? "Автоматаар солихыг үргэлжлүүлэх" : "Автоматаар солихыг түр зогсоох"} aria-pressed={paused} onPress={() => setPaused(!paused)}>{paused ? <Play size={15} /> : <Pause size={15} />}</Button><Button variant="ghost" isIconOnly className="hero-control" aria-label="Өмнөх онцлох киног харуулах" onPress={() => setIndex((previous) => (previous - 1 + movies.length) % movies.length)}><ChevronLeft size={20} /></Button><Button variant="ghost" isIconOnly className="hero-control" aria-label="Дараагийн онцлох киног харуулах" onPress={() => setIndex((previous) => (previous + 1) % movies.length)}><ChevronRight size={20} /></Button></div>
      </div>
    </div>
  </section><MovieReviews key={movie.id} movieId={movie.id} title={movie.title} compact /></div>;
}
