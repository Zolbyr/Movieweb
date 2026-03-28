"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SwitchDemo } from "../_components/Switcher";
import { MovieSearch } from "../_components/MovieSearch";
import { ContactInfo } from "../_components/Contactinfo";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "../../@/components/ui/navigation-menu";

const TMDB_TOKEN = "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiNzI5MDBhMDJlOTk5OTc4ZWJhNWU5NDcyNWQyZWYzNyIsIm5iZiI6MTc2MzUyMzYxMC4xNTIsInN1YiI6IjY5MWQzYzFhZWViNzJmMTZmNGMyYTcwZiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.jJiFscoR5GNt3BBn9yMSS8BJMDbt9mcBdXK4x10Aoao";

const genres = [
  "Action","Adventure","Animation","Biography","Comedy","Crime",
  "Documentary","Drama","Family","Fantasy","Film-Noir","Game-Show",
  "History","Horror","Music","Musical","Mystery","News","Reality-TV",
  "Romance","Sci-Fi","Short","Sport","Talk-Show","Thriller","War","Western",
];

type Movie = {
  id: number;
  title: string;
  poster_path: string | null;
  vote_average: number;
};

export default function PopularPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setLoading(true);
    fetch(
      `https://api.themoviedb.org/3/movie/popular?language=en-US&page=${page}`,
      { headers: { accept: "application/json", Authorization: TMDB_TOKEN } }
    )
      .then((r) => r.json())
      .then((d) => {
        setMovies(d.results || []);
        setTotalPages(Math.min(d.total_pages, 10));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page]);

  const pageNumbers = () => {
    const pages: number[] = [];
    const start = Math.max(1, page - 2);
    const end = Math.min(totalPages, page + 2);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  return (
    <div className="w-full overflow-x-hidden">
      <nav className="sticky top-0 z-50 bg-background border-b shadow-sm">
        <div className="max-w-screen-2xl mx-auto px-6 flex items-center justify-between h-14">
          <a href="/" className="flex items-center gap-2 shrink-0">
            <img src="/film.png" className="w-5 h-5" alt="logo" />
            <span className="font-semibold text-sm tracking-wide whitespace-nowrap">Movie Z</span>
          </a>
          <div className="flex items-center gap-3">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-sm">Genres</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="p-4 w-[540px]">
                      <h2 className="text-base font-semibold mb-1">Genres</h2>
                      <p className="text-xs text-muted-foreground mb-3">See lists of movies by genre</p>
                      <div className="grid grid-cols-4 gap-2">
                        {genres.map((genre) => (
                          <NavigationMenuLink
                            key={genre}
                            href={`/genre/${genre.toLowerCase()}`}
                            className="rounded-full border px-3 py-1 text-xs text-center hover:bg-accent transition"
                          >
                            {genre}
                          </NavigationMenuLink>
                        ))}
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
            <MovieSearch />
          </div>
          <SwitchDemo />
        </div>
      </nav>

      <div className="max-w-screen-2xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold mb-6">Popular</h1>

        <div className="grid grid-cols-5 gap-5 mb-10">
          {loading
            ? Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="aspect-[2/3] rounded-lg bg-muted animate-pulse" />
              ))
            : movies.map((movie) => (
                <Link
                  key={movie.id}
                  href={`/movie/${movie.id}`}
                  className="group cursor-pointer"
                >
                  <div className="aspect-[2/3] rounded-lg overflow-hidden mb-2 bg-muted">
                    {movie.poster_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                        alt={movie.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                        No image
                      </div>
                    )}
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

        <div className="flex items-center gap-2 justify-center">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 text-sm border rounded-md disabled:opacity-30 hover:bg-accent transition flex items-center gap-1"
          >
            ← Previous
          </button>
          {pageNumbers().map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-8 h-8 text-sm rounded-md border transition ${
                p === page
                  ? "bg-foreground text-background border-foreground"
                  : "hover:bg-accent"
              }`}
            >
              {p}
            </button>
          ))}
          
          {page + 2 < totalPages && (
            <>
              <span className="text-muted-foreground text-sm">...</span>
              <button
                onClick={() => setPage(totalPages)}
                className="w-8 h-8 text-sm rounded-md border hover:bg-accent transition"
              >
                {totalPages}
              </button>
            </>
          )}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1 text-sm border rounded-md disabled:opacity-30 hover:bg-accent transition flex items-center gap-1"
          >
            Next →
          </button>
        </div>
      </div>

      <ContactInfo />
    </div>
  );
}