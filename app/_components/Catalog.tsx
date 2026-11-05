"use client";

import { useState } from "react";
import { Card, Link } from "@heroui/react";
import { ArrowLeft, SlidersHorizontal } from "lucide-react";
import { categories, genres, genreLabels, type MovieResults } from "../../lib/movies";
import { useMovies } from "./useMovies";
import { EmptyState, ErrorState, MovieGrid } from "./MovieGrid";
import { Pagination } from "./Pagination";
import { PageHeading } from "./ui/PageHeading";

export function GenreFilters({ selected }: { selected?: number }) {
  return <Card className="genre-filter"><p><SlidersHorizontal size={15} /> Киноны төрлөөр хайх</p><div className="genre-options">{genres.map((genre) => <Link key={genre.id} href={"/genre/" + genre.slug} className={"genre-pill " + (selected === genre.id ? "selected" : "")} aria-current={selected === genre.id ? "page" : undefined}>{genreLabels[genre.slug] || genre.name}</Link>)}</div></Card>;
}

export function Catalog({ category, genre }: { category?: keyof typeof categories; genre?: (typeof genres)[number] }) {
  const [page, setPage] = useState(1);
  const info = category ? categories[category] : null;
  const path = genre ? "discover/movie?with_genres=" + genre.id + "&sort_by=popularity.desc&page=" + page : info!.endpoint + "?page=" + page;
  const { data, error, loading, retry } = useMovies<MovieResults>(path);
  const totalPages = Math.max(1, Math.min(data?.total_pages || 1, 500));
  return <div className="site-container catalog-page">
    <Link className="back-link" href="/"><ArrowLeft size={15} /> Нүүр хуудас</Link>
    <PageHeading id="results-top" eyebrow="Киноны сан" title={genre ? (genreLabels[genre.slug] || genre.name) + " кино" : info!.title} description={genre ? "Сонгосон төрөлд хамаарах кинонууд." : info?.description} />
    <nav className="catalog-tabs" aria-label="Киноны ангилал">{Object.entries(categories).map(([key, value]) => <Link href={"/" + key} key={key} className={category === key ? "active" : ""} aria-current={category === key ? "page" : undefined}>{value.title}</Link>)}</nav>
    {genre && <GenreFilters selected={genre.id} />}
    <div className="results-caption" role="status"><span>{loading ? "Киноны мэдээллийг ачаалж байна…" : error ? "Киноны мэдээллийг ачаалж чадсангүй" : (data?.total_results || 0).toLocaleString() + " кино"}</span><span>Хуудас {page}</span></div>
    {error ? <ErrorState message={error} retry={retry} /> : !loading && !data?.results?.length ? <EmptyState /> : <MovieGrid key={page} movies={data?.results} loading={loading} count={20} />}
    {!loading && !error && <Pagination page={page} totalPages={totalPages} onChange={setPage} />}
  </div>;
}
