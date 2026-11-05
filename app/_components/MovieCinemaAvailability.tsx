"use client";

import { useEffect, useState } from "react";
import { Button, Card, Link, Spinner } from "@heroui/react";
import { ArrowUpRight, CalendarDays, Clapperboard, RefreshCw } from "lucide-react";
import { cinemaProviders, mongoliaDate, type LocalListingsResponse } from "../../lib/cinemas";
import { formatMovieDate } from "../../lib/movie-dates";
import { findLocalShowings } from "../../lib/local-showings";
import { CinemaBrand } from "./ui/CinemaBrand";

export function MovieCinemaAvailability({ title, originalTitle }: { title: string; originalTitle?: string }) {
  const [data, setData] = useState<LocalListingsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(false);
    setData(null);
    fetch("/api/local-movies", { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("Listings unavailable");
        return response.json() as Promise<LocalListingsResponse>;
      })
      .then((result) => { if (!controller.signal.aborted) setData(result); })
      .catch(() => { if (!controller.signal.aborted) setError(true); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [attempt]);

  const today = mongoliaDate();
  const showings = data ? findLocalShowings([title, originalTitle || ""], data.listings, today) : [];
  const incomplete = data && cinemaProviders.some((provider) => !data.listings.some((listing) => listing.provider === provider.id && listing.available && listing.date === today));

  return <section className="movie-cinema-section" id="mongolia-screenings" aria-labelledby="movie-cinema-heading" aria-busy={loading}>
    <div className="movie-cinema-heading"><div><p className="page-eyebrow"><Clapperboard size={14} aria-hidden="true" />Монголын кино театрууд</p><h2 id="movie-cinema-heading">Монгол дахь үзвэр</h2></div><span className="screening-date"><CalendarDays size={14} aria-hidden="true" /><time dateTime={today}>{formatMovieDate(today)}</time></span></div>
    {loading ? <p className="screening-message" role="status"><Spinner size="sm" />Үзвэрийн мэдээллийг шалгаж байна…</p>
      : error ? <div className="screening-message" role="status"><p>Үзвэрийн мэдээллийг ачаалж чадсангүй. Кино театрын албан ёсны сайтаас шалгана уу.</p><Button variant="outline" onPress={() => setAttempt((value) => value + 1)}><RefreshCw size={14} />Дахин оролдох</Button></div>
      : <>
        {!!showings.length && <><p className="screening-note">Албан ёсны жагсаалтаас ижил нэрээр олдсон үзвэрүүд. Захиалахаасаа өмнө киноны хувилбар, үзвэрийн цагийг шалгаарай.</p><div className="movie-cinema-grid">{showings.map((movie) => <Card key={movie.id} className="movie-cinema-card"><CinemaBrand provider={movie.provider} /><Card.Title>{movie.title}</Card.Title><span className="local-showing-label">Өнөөдөр дэлгэцнээ</span>{movie.releaseDate && <p>Кино театрын нээлт: <time dateTime={movie.releaseDate}>{formatMovieDate(movie.releaseDate)}</time></p>}<Link href={movie.url} target="_blank" rel="noreferrer" className="screening-booking">Хуваарь, тасалбар <ArrowUpRight size={14} /></Link></Card>)}</div></>}
        {!showings.length && <p className="screening-message" role="status">Өнөөдрийн жагсаалтаас энэ нэрээр баталгаажсан үзвэр олдсонгүй. Монгол нэрээр эсвэл өөр хувилбараар бүртгэгдсэн байж болох тул кино театрын сайтаас давхар шалгаарай.</p>}
        {incomplete && <p className="screening-note" role="status">Зарим кино театрын мэдээлэл түр ирсэнгүй. Жагсаалт бүрэн биш байж болно.</p>}
      </>}
    <div className="screening-sources"><span>Албан ёсны эх сурвалж:</span>{cinemaProviders.map((provider) => <Link key={provider.id} href={provider.scheduleUrl} target="_blank" rel="noreferrer">{provider.name}<ArrowUpRight size={12} /></Link>)}</div>
  </section>;
}
