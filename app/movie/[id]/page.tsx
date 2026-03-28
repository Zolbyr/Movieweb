"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Play, Star, ArrowLeft } from "lucide-react";
import { SwitchDemo } from "../../_components/Switcher";
import { MovieSearch } from "../../_components/MovieSearch";
import { ContactInfo } from "../../_components/Contactinfo";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "../../../@/components/ui/navigation-menu";

const TMDB_TOKEN = process.env.NEXT_PUBLIC_TMDB_TOKEN!

const genres = [
  "Action","Adventure","Animation","Biography","Comedy","Crime",
  "Documentary","Drama","Family","Fantasy","Film-Noir","Game-Show",
  "History","Horror","Music","Musical","Mystery","News","Reality-TV",
  "Romance","Sci-Fi","Short","Sport","Talk-Show","Thriller","War","Western",
];

type MovieDetail = {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  vote_average: number;
  vote_count: number;
  release_date: string;
  runtime: number;
  genres: { id: number; name: string }[];
  credits?: {
    crew: { job: string; name: string }[];
    cast: { id: number; name: string }[];
  };
};

type SimilarMovie = {
  id: number;
  title: string;
  poster_path: string;
  vote_average: number;
};

export default function MovieDetailPage() {
  const { id } = useParams();
  const [movie, setMovie] = useState<MovieDetail | null>(null);
  const [similar, setSimilar] = useState<SimilarMovie[]>([]);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const headers = { accept: "application/json", Authorization: TMDB_TOKEN };
    
    fetch(
      `https://api.themoviedb.org/3/movie/${id}?append_to_response=credits&language=en-US`,
      { headers }
    )
      .then((r) => r.json())
      .then((d) => setMovie(d))
      .catch(console.error)
      .finally(() => setLoading(false));

    fetch(`https://api.themoviedb.org/3/movie/${id}/videos?language=en-US`, {
      headers,
    })
      .then((r) => r.json())
      .then((d) => {
        const trailer = d.results?.find(
          (v: { type: string; site: string; key: string }) =>
            v.type === "Trailer" && v.site === "YouTube"
        );
        if (trailer) setTrailerKey(trailer.key);
      })
      .catch(console.error);

    fetch(`https://api.themoviedb.org/3/movie/${id}/similar?language=en-US&page=1`, {
      headers,
    })
      .then((r) => r.json())
      .then((d) => setSimilar(d.results?.slice(0, 5) || []))
      .catch(console.error);
  }, [id]);

  const formatRuntime = (min: number) => {
    const h = Math.floor(min / 60);
    const m = min % 60;
    return `${h}h ${m}m`;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
  };

  const director = movie?.credits?.crew?.find((c) => c.job === "Director");
  const writers = movie?.credits?.crew?.filter((c) => c.job === "Writer" || c.job === "Screenplay").slice(0, 3);
  const cast = movie?.credits?.cast?.slice(0, 3);

  if (loading)
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <p className="text-muted-foreground animate-pulse">Loading...</p>
      </div>
    );

  if (!movie) return null;

  return (
    <div className="w-full overflow-x-hidden">
      <nav className="sticky top-0 z-50 bg-background border-b shadow-sm">
        <div className="max-w-screen-2xl mx-auto px-6 flex items-center justify-between h-14">
          <a href="/" className="flex items-center gap-2 shrink-0">
            <img src="/film.png" className="w-5 h-5" alt="logo" />
            <span className="font-semibold text-sm tracking-wide whitespace-nowrap">
              Movie Z
            </span>
          </a>
          <div className="flex items-center gap-3">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-sm">Genres</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="p-4 w-[540px]">
                      <h2 className="text-base font-semibold mb-1">Genres</h2>
                      <p className="text-xs text-muted-foreground mb-3">
                        See lists of movies by genre
                      </p>
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


      <div className="max-w-screen-lg mx-auto px-6 py-8">


        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition"
        >
          <ArrowLeft size={14} /> Back
        </Link>


        <div className="flex items-start justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold">{movie.title}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {formatDate(movie.release_date)}
              {movie.runtime ? ` · PG · ${formatRuntime(movie.runtime)}` : ""}
            </p>
          </div>
          <div className="text-right shrink-0 ml-6">
            <p className="text-xs text-muted-foreground mb-1">Rating</p>
            <div className="flex items-center gap-1 justify-end">
              <Star size={14} className="text-yellow-400 fill-yellow-400" />
              <span className="font-bold text-base">
                {movie.vote_average.toFixed(1)}
              </span>
              <span className="text-xs text-muted-foreground">/10</span>
            </div>
            <p className="text-xs text-muted-foreground">{movie.vote_count?.toLocaleString()}</p>
          </div>
        </div>


        <div className="flex gap-4 mb-5">

          <div className="w-[180px] shrink-0 rounded-xl overflow-hidden">
            <img
              src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
              alt={movie.title}
              className="w-full h-full object-cover"
            />
          </div>


          <div className="flex-1 rounded-xl overflow-hidden relative bg-black min-h-[260px]">
            {trailerKey ? (
              <iframe
                src={`https://www.youtube.com/embed/${trailerKey}?autoplay=0`}
                title="Trailer"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full min-h-[260px]"
              />
            ) : (
              <>
                <img
                  src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
                  alt={movie.title}
                  className="w-full h-full object-cover min-h-[260px]"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                    <Play size={20} className="text-white ml-1" />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>


        <div className="flex gap-2 flex-wrap mb-4">
          {movie.genres?.map((g) => (
            <Link
              key={g.id}
              href={`/genre/${g.name.toLowerCase()}`}
              className="rounded-full border px-3 py-1 text-xs hover:bg-accent transition"
            >
              {g.name}
            </Link>
          ))}
        </div>


        <p className="text-sm text-muted-foreground leading-relaxed mb-6">
          {movie.overview}
        </p>

  
        <div className="border-t divide-y text-sm">
          {director && (
            <div className="py-3 flex gap-4">
              <span className="font-semibold w-24 shrink-0">Director</span>
              <span className="text-muted-foreground">{director.name}</span>
            </div>
          )}
          {writers && writers.length > 0 && (
            <div className="py-3 flex gap-4">
              <span className="font-semibold w-24 shrink-0">Writers</span>
              <span className="text-muted-foreground">
                {writers.map((w) => w.name).join(" · ")}
              </span>
            </div>
          )}
          {cast && cast.length > 0 && (
            <div className="py-3 flex gap-4">
              <span className="font-semibold w-24 shrink-0">Stars</span>
              <span className="text-muted-foreground">
                {cast.map((c) => c.name).join(" · ")}
              </span>
            </div>
          )}
        </div>

        {/* More like this */}
        {similar.length > 0 && (
          <div className="mt-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">More like this</h2>
              <span className="text-sm text-muted-foreground cursor-pointer hover:text-foreground flex items-center gap-1">
                See more →
              </span>
            </div>
            <div className="grid grid-cols-5 gap-4">
              {similar.map((m) => (
                <Link key={m.id} href={`/movie/${m.id}`} className="group cursor-pointer">
                  <div className="aspect-[2/3] rounded-lg overflow-hidden mb-2">
                    <img
                      src={`https://image.tmdb.org/t/p/w500${m.poster_path}`}
                      alt={m.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  </div>
                  <div className="flex items-center gap-1 mb-1">
                    <Star size={10} className="text-yellow-400 fill-yellow-400" />
                    <span className="text-xs font-semibold text-yellow-500">
                      {m.vote_average.toFixed(1)}
                    </span>
                    <span className="text-xs text-muted-foreground">/10</span>
                  </div>
                  <h3 className="text-xs font-medium line-clamp-2">{m.title}</h3>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <ContactInfo />
    </div>
  );
}