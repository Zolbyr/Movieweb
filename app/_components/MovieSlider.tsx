"use client";

import { useState, useEffect, useCallback } from "react";
import { Play, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const TMDB_TOKEN = process.env.NEXT_PUBLIC_TMDB_TOKEN!

type Movie = {
  id: number;
  title: string;
  overview: string;
  backdrop_path: string;
  vote_average: number;
};

export const MovieSlider = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [index, setIndex] = useState(0);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [showTrailer, setShowTrailer] = useState(false);

  useEffect(() => {
    fetch("https://api.themoviedb.org/3/movie/upcoming?language=en-US&page=1", {
      headers: { accept: "application/json", Authorization: TMDB_TOKEN },
    })
      .then((r) => r.json())
      .then((json) => setMovies(json.results || []))
      .catch(console.error);
  }, []);

  const fetchTrailer = async (movieId: number) => {
    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/movie/${movieId}/videos?language=en-US`,
        { headers: { accept: "application/json", Authorization: TMDB_TOKEN } }
      );
      const data = await res.json();
      const trailer = data.results?.find(
        (v: { type: string; site: string; key: string }) =>
          v.type === "Trailer" && v.site === "YouTube"
      );
      setTrailerKey(trailer?.key || null);
      setShowTrailer(true);
    } catch (err) {
      console.error(err);
    }
  };

  const next = useCallback(
    () => setIndex((p) => (p + 1) % movies.length),
    [movies.length]
  );
  const prev = () =>
    setIndex((p) => (p - 1 + movies.length) % movies.length);

  useEffect(() => {
    if (!movies.length || showTrailer) return;
    const t = setInterval(next, 5000);
    return () => clearInterval(t);
  }, [movies.length, next, showTrailer]);

  if (!movies.length)
    return (
      <div className="w-full h-full flex items-center justify-center bg-black">
        <p className="text-white animate-pulse">Loading...</p>
      </div>
    );

  const movie = movies[index];

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Backdrop */}
      <img
        src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
        className="w-full h-full object-cover"
        alt={movie.title}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

      {showTrailer && (
        <div className="absolute inset-0 z-30 bg-black/90 flex items-center justify-center">
          <button
            onClick={() => { setShowTrailer(false); setTrailerKey(null); }}
            className="absolute top-4 right-4 text-white bg-black/50 hover:bg-black/80 rounded-full p-2 transition z-40"
          >
            <X size={20} />
          </button>
          {trailerKey ? (
            <iframe
              src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1`}
              title="Trailer"
              allow="autoplay; encrypted-media"
              allowFullScreen
              className="w-[85%] h-[85%] rounded-xl"
            />
          ) : (
            <p className="text-white">Trailer байхгүй байна.</p>
          )}
        </div>
      )}

      <div className="absolute bottom-14 left-10 text-white max-w-lg z-20">
        <p className="text-xs uppercase tracking-widest text-gray-300 mb-2">Now Playing</p>
        <h2 className="text-4xl font-bold mb-3 drop-shadow">{movie.title}</h2>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-yellow-400">⭐</span>
          <span className="text-sm font-semibold">{movie.vote_average.toFixed(1)}</span>
          <span className="text-xs text-gray-400">/10</span>
        </div>
        <p className="text-sm text-gray-300 leading-relaxed mb-5 line-clamp-3">
          {movie.overview}
        </p>
        <Button
          className="h-10 px-6 gap-2 text-sm"
          onClick={() => fetchTrailer(movie.id)}
        >
          <Play size={15} /> Watch Trailer
        </Button>
      </div>

      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/30 hover:bg-black/60 text-white flex items-center justify-center transition"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/30 hover:bg-black/60 text-white flex items-center justify-center transition"
      >
        <ChevronRight size={20} />
      </button>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {movies.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`rounded-full transition-all duration-300 ${
              i === index ? "bg-white w-6 h-2" : "bg-white/40 w-2 h-2"
            }`}
          />
        ))}
      </div>
    </div>
  );
};