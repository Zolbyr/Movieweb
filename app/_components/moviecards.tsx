"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const TMDB_TOKEN = process.env.NEXT_PUBLIC_TMDB_TOKEN;

type Movie = {
  id: number;
  title: string;
  poster_path: string;
  vote_average: number;
};

export const MovieCards = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://api.themoviedb.org/3/movie/upcoming?language=en-US&page=1", {
      headers: { accept: "application/json", Authorization: TMDB_TOKEN },
    })
      .then((r) => r.json())
      .then((d) => setMovies(d.results || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="w-full">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold">Upcoming</h2>
        <Link
          href="/upcoming"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition"
        >
          See more <ArrowRight size={14} />
        </Link>
      </div>

      <div className="grid grid-cols-5 gap-4">
        {loading
          ? Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="aspect-[2/3] rounded-lg bg-muted animate-pulse" />
            ))
          : movies.slice(0, 10).map((movie) => (
              <Link
                key={movie.id}
                href={`/movie/${movie.id}`}
                className="group cursor-pointer"
              >
                <div className="aspect-[2/3] rounded-lg overflow-hidden mb-2">
                  <img
                    src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                    alt={movie.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                </div>
                <div className="flex items-center gap-1 mb-1">
                  <span className="text-yellow-400 text-xs">⭐</span>
                  <span className="text-xs font-semibold text-yellow-500">
                    {movie.vote_average.toFixed(1)}
                  </span>
                  <span className="text-xs text-muted-foreground">/10</span>
                </div>
                <h3 className="text-sm font-medium line-clamp-2">{movie.title}</h3>
              </Link>
            ))}
      </div>
    </section>
  );
};