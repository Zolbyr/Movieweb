"use client";

import { useParams } from "next/navigation";
import { Link, Skeleton } from "@heroui/react";
import Image from "next/image";
import { ArrowLeft, ArrowUpRight, Clapperboard, Clock3, Star } from "lucide-react";
import { genres, genreLabels, imageUrl, rating, type Movie, type MovieDetail } from "../../../lib/movies";
import { useMovies } from "../../_components/useMovies";
import { ErrorState, MovieCard } from "../../_components/MovieGrid";
import { TrailerButton } from "../../_components/TrailerButton";
import { MovieReviews } from "../../_components/MovieReviews";
import { RevolverShelf } from "../../_components/RevolverShelf";

function Detail({ id }: { id: string }) {
  const valid = /^[1-9]\d*$/.test(id);
  const { data: movie, loading, error, retry } = useMovies<MovieDetail>(valid ? "movie/" + id + "?append_to_response=credits,videos,similar&language=en-US" : null);
  if (loading) return <div className="site-container detail-loading" role="status" aria-label="Киноны дэлгэрэнгүй мэдээллийг ачаалж байна"><Skeleton className="detail-title-skeleton" /><Skeleton className="detail-image-skeleton" /><Skeleton className="skeleton-title" /><span className="sr-only">Киноны дэлгэрэнгүй мэдээллийг ачаалж байна…</span></div>;
  if (error || !movie || !valid) return <div className="site-container catalog-page"><Link className="back-link" href="/"><ArrowLeft size={15} />Нүүр хуудас</Link><ErrorState message={error || "Энэ киноны мэдээлэл олдсонгүй. Өөр кино хайна уу."} retry={valid ? retry : undefined} /></div>;

  const director = movie.credits?.crew?.filter((person) => person.job === "Director").map((person) => person.name).join(", ");
  const writers = [...new Set(movie.credits?.crew?.filter((person) => person.job === "Writer" || person.job === "Screenplay").map((person) => person.name))].slice(0, 3).join(", ");
  const cast = movie.credits?.cast?.slice(0, 5).map((person) => person.name).join(", ");
  const trailer = movie.videos?.results?.find((video) => video.site === "YouTube" && video.type === "Trailer");
  const year = movie.release_date?.slice(0, 4);
  const backdrop = imageUrl(movie.backdrop_path, "w1280");
  const poster = imageUrl(movie.poster_path);
  return <>
    <section className="detail-hero">
      {backdrop && <Image className="detail-backdrop" src={backdrop} alt="" fill sizes="100vw" preload />}
      <div className="detail-shade" />
      <div className="site-container detail-hero-inner"><Link className="back-link" href="/"><ArrowLeft size={15} /> Нүүр хуудас</Link><div className="detail-heading"><p className="hero-kicker">Киноны мэдээлэл</p><h1>{movie.title}</h1><div className="hero-meta">{year && <span>{year}</span>}{movie.runtime ? <span className="detail-runtime"><Clock3 size={14} />{Math.floor(movie.runtime / 60)} цаг {movie.runtime % 60} мин</span> : null}<span className="hero-score"><Star size={15} />{rating(movie.vote_average)}<small>/10</small></span></div></div></div>
    </section>
    <div className="site-container detail-page">
      <div className="detail-content-layout">
      <div className="detail-overview"><div className="detail-poster">{poster ? <Image src={poster} alt={movie.title + " киноны постер"} fill sizes="(max-width: 640px) 140px, 210px" /> : <div className="poster-fallback"><Clapperboard size={40} /><span>Киноны зураг байхгүй</span></div>}</div>
        <div className="detail-story">
          <div className="genre-options">{movie.genres?.map((genre) => { const item = genres.find((candidate) => candidate.id === genre.id); return item ? <Link className="genre-pill" key={genre.id} href={"/genre/" + item.slug}>{genreLabels[item.slug] || genre.name}<ArrowUpRight size={11} /></Link> : <span className="genre-pill" key={genre.id}>{genre.name}</span>; })}</div>
          <h2>Товч агуулга</h2><p className="synopsis">{movie.overview || "Энэ киноны товч агуулга олдсонгүй."}</p>
          <TrailerButton movieId={movie.id} title={movie.title} videoKey={trailer?.key} />
          <dl className="movie-credits">{director && <div><dt>Найруулагч</dt><dd>{director}</dd></div>}{writers && <div><dt>Кино зохиолч</dt><dd>{writers}</dd></div>}{cast && <div><dt>Жүжигчид</dt><dd>{cast}</dd></div>}<div><dt>Үнэлгээ</dt><dd>{rating(movie.vote_average)} / 10 <span className="muted">· {(movie.vote_count || 0).toLocaleString()} үнэлгээ</span></dd></div></dl>
        </div>
      </div>
      <MovieReviews key={movie.id} movieId={movie.id} title={movie.title} />
      </div>
      {!!movie.similar?.results?.length && <section className="movie-section"><RevolverShelf<Movie> items={movie.similar.results} label="Төстэй кинонууд" heading={<h2>Төстэй кинонууд</h2>} renderItem={(item, index) => <MovieCard movie={item} index={index} />} /></section>}
    </div>
  </>;
}

export default function MovieDetailPage() {
  const { id } = useParams<{ id: string }>();
  return <Detail key={id} id={id} />;
}
