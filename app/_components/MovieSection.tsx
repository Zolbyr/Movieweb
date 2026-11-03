"use client";

import { categories, type Movie, type MovieResults } from "../../lib/movies";
import { useMovies } from "./useMovies";
import { EmptyState, ErrorState, MovieCard, MovieGrid } from "./MovieGrid";
import { RevolverShelf } from "./RevolverShelf";

export function MovieSection({ category }: { category: keyof typeof categories; number?: string }) {
  const { title, endpoint } = categories[category];
  const { data, loading, error, retry } = useMovies<MovieResults>(endpoint + "?language=en-US&page=1");
  const heading = <h2 id={"section-" + category}>{title}</h2>;
  return <section className="movie-section" aria-labelledby={"section-" + category}>
    {loading || error || !data?.results?.length ? <><div className="section-heading">{heading}</div>{error ? <ErrorState message={error} retry={retry} /> : loading ? <MovieGrid loading count={6} /> : <EmptyState title="Киноны жагсаалт алга байна" />}</>
      : <RevolverShelf<Movie> items={data.results} label={title} heading={heading} renderItem={(movie, index) => <MovieCard movie={movie} index={index} />} />}
  </section>;
}
