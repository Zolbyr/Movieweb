"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Link } from "@heroui/react";
import { ArrowLeft } from "lucide-react";
import { type MovieResults } from "../../lib/movies";
import { useMovies } from "../_components/useMovies";
import { EmptyState, ErrorState, MovieGrid } from "../_components/MovieGrid";
import { GenreFilters } from "../_components/Catalog";
import { Pagination } from "../_components/Pagination";

function Results({ query }: { query: string }) {
  const [page, setPage] = useState(1);
  const { data, error, loading, retry } = useMovies<MovieResults>(query ? "search/movie?query=" + encodeURIComponent(query) + "&page=" + page : null);
  const totalPages = Math.max(1, Math.min(data?.total_pages || 1, 500));
  return <>
    <div className="page-heading" id="results-top"><h1>{query ? "Хайлтын үр дүн" : "Кино хайх"}</h1><p>{query ? <><strong>“{query}”</strong> нэрээр олдсон кинонууд.</> : "Киноны нэрээр эсвэл төрлөөр нь хайна уу."}</p></div>
    {query && <><div className="results-caption" role="status"><span>{loading ? "Хайж байна…" : error ? "Хайлт түр ажиллахгүй байна" : (data?.total_results || 0).toLocaleString() + " үр дүн"}</span><span>Хуудас {page}</span></div>
      {error ? <ErrorState message={error} retry={retry} /> : !loading && !data?.results?.length ? <EmptyState message={"“" + query + "” нэрээр кино олдсонгүй. Өөр нэрээр хайна уу."} /> : <MovieGrid key={page} loading={loading} movies={data?.results} count={20} />}
      {!loading && !error && <Pagination page={page} totalPages={totalPages} onChange={setPage} />}</>}
    <GenreFilters />
  </>;
}

function SearchContent() {
  const query = (useSearchParams().get("q") || "").trim();
  return <Results key={query} query={query} />;
}

export default function SearchPage() {
  return <div className="site-container catalog-page"><Link href="/" className="back-link"><ArrowLeft size={15} /> Нүүр хуудас</Link><Suspense fallback={<MovieGrid loading />}><SearchContent /></Suspense></div>;
}
