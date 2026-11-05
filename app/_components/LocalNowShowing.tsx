"use client";

import { useEffect, useState } from "react";
import { Button, Card, Chip, Link, Tabs } from "@heroui/react";
import Image from "next/image";
import { ArrowUpRight, CalendarDays, Clapperboard, Clock3, MapPin, RefreshCw } from "lucide-react";
import { cinemaProviders, cinemaDateLabel, type LocalListingsResponse, type LocalMovie, type ProviderId } from "../../lib/cinemas";
import { posterSizes } from "../../lib/movies";
import { PosterSkeleton } from "./ui/PosterSkeleton";
import { RevolverShelf } from "./RevolverShelf";
import { CinemaBrand } from "./ui/CinemaBrand";
import { useScrollScene } from "./useScrollScene";
import { MovieRating } from "./ui/MovieRating";
import { formatMovieDate } from "../../lib/movie-dates";

function LocalMovieCard({ movie, index }: { movie: LocalMovie; index: number }) {
  const [failed, setFailed] = useState(false);
  return <Card<"a"> render={(props) => <a {...props} href={movie.url} target="_blank" rel="noreferrer" />} className="local-movie-card" style={{ "--delay": index * 35 + "ms" } as React.CSSProperties}>
    <div className="movie-poster">
      {movie.poster && !failed ? <Image src={movie.poster} alt={movie.title + " киноны постер"} fill sizes={posterSizes} onError={() => setFailed(true)} /> : <div className="poster-fallback"><Clapperboard size={30} /><span>Киноны зураг байхгүй</span></div>}
      <span className="poster-overlay"><span>Хуваарь, тасалбар <ArrowUpRight size={15} /></span></span>
    </div>
    <Card.Title><span>{movie.title}</span></Card.Title>
    <Card.Description>{movie.rating && <Chip size="sm" variant="soft" className="age-rating">{movie.rating}</Chip>}<span className="local-ticket-label">Хуваарь, тасалбар <ArrowUpRight size={13} /></span></Card.Description>
    <div className="local-card-facts"><CinemaBrand provider={movie.provider} /><span className="local-showing-label">Өнөөдөр дэлгэцнээ</span><span className="local-release-date"><CalendarDays size={12} aria-hidden="true" />{movie.releaseDate ? <>Нээлт: <time dateTime={movie.releaseDate}>{formatMovieDate(movie.releaseDate)}</time></> : "Нээлтийн огноо тодорхойгүй"}</span></div>
    <MovieRating />
  </Card>;
}

export function LocalNowShowing({ full = false }: { full?: boolean }) {
  const scene = useScrollScene();
  const [active, setActive] = useState<ProviderId>("urgoo");
  const [data, setData] = useState<LocalListingsResponse | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(false);
    fetch("/api/local-movies", { signal: controller.signal })
      .then(async (response) => { if (!response.ok) throw new Error("Unavailable"); return response.json() as Promise<LocalListingsResponse>; })
      .then((result) => { if (!controller.signal.aborted) { setData(result); setLoading(false); } })
      .catch(() => { if (!controller.signal.aborted) { setError(true); setLoading(false); } });
    return () => controller.abort();
  }, [attempt]);

  const updated = data ? new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Ulaanbaatar", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(data.fetchedAt)) : null;
  const date = data ? cinemaDateLabel(data.fetchedAt) : "Өнөөдрийн хуваарь";
  const Heading = full ? "h1" : "h2";

  return <section ref={scene} className={"local-cinema-section scroll-scene " + (full ? "local-cinema-full" : "")} aria-labelledby="local-cinema-title">
    <div className="local-section-top">
      <div className="local-heading">
        <p className="local-date">{date}</p>
        <Heading id="local-cinema-title">Дэлгэцнээ гарч буй <span>кинонууд</span></Heading>
        <p className="local-intro">Кино театраа сонгоод үзвэрийн хуваарь, тасалбарын мэдээллийг хараарай.</p>
      </div>
      <Link href="/cinemas" className="local-map-link">
        <span className="local-map-symbol" aria-hidden="true"><MapPin size={25} strokeWidth={1.5} /></span>
        <span className="local-map-copy"><strong>Ойр кино театр хайх</strong><small>Байршил, хүрэх чиглэл</small></span>
        <ArrowUpRight size={18} />
      </Link>
    </div>
    <Tabs className="cinema-provider-tabs" selectedKey={active} onSelectionChange={(key) => setActive(String(key) as ProviderId)}>
      <div className="local-toolbar"><div className="provider-tabs-shell"><Tabs.List className="provider-tabs" aria-label="Кино театр сонгох">{cinemaProviders.map((item) => <Tabs.Tab key={item.id} id={item.id}><CinemaBrand provider={item.id} /><Tabs.Indicator /></Tabs.Tab>)}</Tabs.List></div><span className="local-data-note">{loading ? "Мэдээллийг шинэчилж байна…" : updated ? <><Clock3 size={13} /><span>Шинэчилсэн: {updated}</span></> : null}</span></div>
      {cinemaProviders.map((provider) => {
        const listing = data?.listings.find((item) => item.provider === provider.id);
        const movies = listing?.movies;
        const source = <p>Эх сурвалж: <Link href={provider.url} target="_blank" rel="noreferrer"><CinemaBrand provider={provider.id} /> <ArrowUpRight size={11} /></Link> · Үзвэрийн цаг, тасалбарын мэдээллийг кино театрын албан ёсны сайтаас шалгана уу.</p>;
        return <Tabs.Panel id={provider.id} key={provider.id} className="cinema-listing-panel">
          {loading ? <div className="local-movie-grid" aria-label="Киноны мэдээллийг ачаалж байна" aria-busy="true">{Array.from({ length: 6 }, (_, index) => <PosterSkeleton key={index} />)}</div>
            : error || !listing?.available ? <Card className="local-listing-empty" role="alert"><Clapperboard size={25} /><Card.Title>Киноны жагсаалтыг ачаалж чадсангүй</Card.Title><Card.Description>{provider.possessive} албан ёсны сайтаас үзвэрийн хуваарийг шалгана уу.</Card.Description><div><Button variant="outline" onPress={() => setAttempt((value) => value + 1)}><RefreshCw size={14} /> Дахин оролдох</Button><Link className="button button-primary" href={provider.scheduleUrl} target="_blank" rel="noreferrer">Хуваарь харах <ArrowUpRight size={15} /></Link></div></Card>
            : !movies?.length ? <Card className="local-listing-empty"><Clapperboard size={25} /><Card.Title>Өнөөдрийн киноны жагсаалт олдсонгүй</Card.Title><Card.Description>Үзвэрийн хуваарийг албан ёсны сайтаас шалгана уу.</Card.Description><Link className="button button-secondary" href={provider.scheduleUrl} target="_blank" rel="noreferrer">Үзвэрийн хуваарь харах <ArrowUpRight size={15} /></Link></Card>
            : full ? <div className="local-movie-grid">{movies.map((movie, index) => <LocalMovieCard movie={movie} key={movie.id} index={index} />)}</div>
              : <RevolverShelf key={provider.id} items={movies} label={provider.name} gridClassName="local-movie-grid" footer={source} renderItem={(movie, index) => <LocalMovieCard movie={movie} key={movie.id} index={index} />} />}
          {(full || loading || error || !listing?.available || !movies?.length) && <div className="local-source-line">{source}</div>}
        </Tabs.Panel>;
      })}
    </Tabs>
  </section>;
}
