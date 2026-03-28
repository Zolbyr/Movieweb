"use client";

import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";

const TMDB_TOKEN = process.env.NEXT_PUBLIC_TMDB_TOKEN!

type Movie = {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
};

export const MovieSearch = () => {
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState<Movie[]>([]);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    if (value.length < 2) { setMovies([]); setOpen(false); return; }
    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(value)}&language=en-US&page=1&include_adult=false`,
        { headers: { accept: "application/json", Authorization: TMDB_TOKEN } }
      );
      const data = await res.json();
      setMovies(data.results?.slice(0, 6) || []);
      setOpen(true);
    } catch (err) { console.error(err); }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && query.trim()) {
      setOpen(false);
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  // ✅ Dropdown item дарахад movie detail руу очно
  const handleSelect = (id: number) => {
    setOpen(false);
    setQuery("");
    setMovies([]);
    router.push(`/movie/${id}`);
  };

  return (
    <div className="relative w-[220px]" ref={wrapperRef}>
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <Input
          type="text"
          value={query}
          onChange={handleSearch}
          onKeyDown={handleKeyDown}
          onFocus={() => movies.length > 0 && setOpen(true)}
          placeholder="Search..."
          className="pl-8 h-9 text-sm"
        />
      </div>

      {open && movies.length > 0 && (
        <div className="absolute top-full mt-1 left-0 right-0 bg-background border rounded-lg shadow-xl z-50 overflow-hidden">
          {movies.map((m) => (
            <div
              key={m.id}
              className="flex items-center gap-3 px-3 py-2 hover:bg-accent cursor-pointer transition"
              onClick={() => handleSelect(m.id)}
            >
              {m.poster_path ? (
                <img
                  src={`https://image.tmdb.org/t/p/w92${m.poster_path}`}
                  alt={m.title}
                  className="w-8 h-11 object-cover rounded flex-shrink-0"
                />
              ) : (
                <div className="w-8 h-11 bg-muted rounded flex-shrink-0 flex items-center justify-center text-xs text-muted-foreground">?</div>
              )}
              <div className="min-w-0">
                <p className="text-sm font-medium line-clamp-1">{m.title}</p>
                <p className="text-xs text-muted-foreground">{m.release_date?.slice(0, 4) || "—"}</p>
              </div>
            </div>
          ))}
          <div
            className="px-3 py-2 text-xs text-center text-muted-foreground hover:bg-accent cursor-pointer border-t transition"
            onClick={() => {
              setOpen(false);
              router.push(`/search?q=${encodeURIComponent(query.trim())}`);
            }}
          >
            See all results for "{query}" →
          </div>
        </div>
      )}
    </div>
  );
};