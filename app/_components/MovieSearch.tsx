"use client";

import { useState, useRef, useEffect, useId } from "react";
import { Button, Link, SearchField, Spinner } from "@heroui/react";
import Image from "next/image";
import { Search, ArrowUpRight, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { imageUrl, type MovieResults } from "../../lib/movies";
import { getMovies } from "./useMovies";

export function MovieSearch() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<MovieResults | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const wrapper = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const listId = useId();
  const pathname = usePathname();
  const router = useRouter();
  const submit = (value: string) => {
    if (!value.trim()) return;
    setOpen(false);
    input.current?.blur();
    router.push("/search?q=" + encodeURIComponent(value.trim()));
  };

  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (!wrapper.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setResult(null);
    setError("");
    if (query.trim().length < 2) { setLoading(false); return () => controller.abort(); }
    setLoading(true);
    const timer = setTimeout(() => {
      getMovies<MovieResults>("search/movie?query=" + encodeURIComponent(query.trim()) + "&page=1", controller.signal)
        .then((data) => { if (!controller.signal.aborted) { setResult(data); setLoading(false); } })
        .catch((err: unknown) => { if (!controller.signal.aborted) { setError(err instanceof Error ? err.message : "Хайлт хийх боломжгүй байна. Дахин оролдоно уу."); setLoading(false); } });
    }, 300);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [query]);

  return (
    <div className="search-wrapper" ref={wrapper} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setOpen(false); }}>
      <SearchField className="movie-search-field" aria-label="Киноны нэрээр хайх" value={query} onChange={(value) => { setQuery(value); setOpen(true); }} onSubmit={submit}>
        <SearchField.Group>
          <Button variant="ghost" isIconOnly className="search-submit" aria-label="Кино хайх" onPress={() => submit(query)}><Search size={17} aria-hidden="true" /></Button>
          <SearchField.Input ref={input} aria-expanded={open && query.trim().length >= 2} aria-controls={open && query.trim().length >= 2 ? listId : undefined} autoComplete="off" placeholder="Киноны нэрээр хайх" onFocus={() => setOpen(true)} onKeyDown={(event) => { if (event.key === "Escape") setOpen(false); }} />
          <SearchField.ClearButton className="search-clear" aria-label="Хайлтын үгийг арилгах" onPress={() => setOpen(false)}><X size={14} /></SearchField.ClearButton>
        </SearchField.Group>
      </SearchField>
      {open && query.trim().length >= 2 && <div className="search-dropdown" id={listId}>
        <p className="dropdown-label">Кинонууд</p>
        <div aria-live="polite">
          {loading ? <p className="search-message"><Spinner size="sm" /> Хайж байна…</p>
            : error ? <p className="search-message">{error}</p>
            : result && !result.results?.length ? <p className="search-message">Кино олдсонгүй. Өөр нэрээр хайна уу.</p>
            : result?.results?.slice(0, 5).map((movie) => <Link key={movie.id} className="search-result" href={"/movie/" + movie.id} onPress={() => { setOpen(false); setQuery(""); }}>
              {imageUrl(movie.poster_path, "w92") ? <Image src={imageUrl(movie.poster_path, "w92")!} alt="" width={34} height={48} /> : <span className="search-poster-fallback"><Search size={16} /></span>}
              <span><strong>{movie.title}</strong><small>{movie.release_date?.slice(0, 4) || "Нээлтийн огноо тодорхойгүй"}</small></span><ArrowUpRight size={15} />
            </Link>)}
        </div>
        <Link href={"/search?q=" + encodeURIComponent(query.trim())} className="all-results" onPress={() => setOpen(false)}>Бүх үр дүнг харах <ArrowUpRight size={14} /></Link>
      </div>}
    </div>
  );
}
