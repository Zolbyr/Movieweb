"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Button, Card, Link, SearchField, Spinner } from "@heroui/react";
import { ArrowLeft, ArrowUpRight, Clapperboard, LocateFixed, MapPin, Navigation, Search, X } from "lucide-react";
import { cinemas, cinemaProviders, cinemaLocationsUpdated, directionsUrl, distanceKm, formatDistance, type Coordinates, type ProviderId } from "../../lib/cinemas";
import { CinemaSelect } from "./ui/CinemaSelect";

const CinemaMap = dynamic(() => import("./CinemaMap"), { ssr: false, loading: () => <div className="map-loading" role="status"><MapPin size={28} /><p>Газрын зургийг ачаалж байна…</p></div> });

export function CinemaFinder() {
  const [city, setCity] = useState("Улаанбаатар");
  const [provider, setProvider] = useState<ProviderId | "all">("all");
  const [query, setQuery] = useState("");
  const [position, setPosition] = useState<(Coordinates & { accuracy: number }) | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const filtered = useMemo(() => cinemas.filter((cinema) => (city === "all" || cinema.city === city) && (provider === "all" || cinema.provider === provider) && (cinema.name + " " + cinema.address + " " + cinema.city).toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())).sort((a, b) => position ? distanceKm(position, a) - distanceKm(position, b) : 0), [city, provider, query, position]);
  const selected = filtered.find((cinema) => cinema.id === selectedId) || null;
  const nearest = position && filtered[0] ? distanceKm(position, filtered[0]) : null;

  const selectFromMap = (id: string) => {
    setSelectedId(id);
    const card = document.querySelector<HTMLElement>('[data-cinema-id="' + id + '"]');
    const list = card?.parentElement;
    if (card && list) list.scrollTo({
      top: Math.max(0, card.offsetTop - (list.clientHeight - card.offsetHeight) / 2),
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    });
  };

  const locate = () => {
    setLocationError("");
    if (!navigator.geolocation || !window.isSecureContext) { setLocationError("Энэ хуудаснаас байршил тогтоох боломжгүй байна. Хотоо сонгон кино театр хайна уу."); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setPosition({ latitude: coords.latitude, longitude: coords.longitude, accuracy: coords.accuracy });
        setCity("all");
        setQuery("");
        setSelectedId(null);
        setLocating(false);
      },
      (error) => {
        setLocationError(error.code === 1 ? "Байршил ашиглах зөвшөөрөл олгогдоогүй байна. Хөтчийн тохиргооноос зөвшөөрөл олгох эсвэл хотоо сонгон хайна уу." : error.code === 3 ? "Байршлыг хугацаанд нь тогтоож чадсангүй. Дахин оролдох эсвэл хотоо сонгоно уу." : "Байршлыг тогтоож чадсангүй. Хотоо сонгон кино театр хайна уу.");
        setLocating(false);
      },
      { enableHighAccuracy: false, timeout: 12000, maximumAge: 60000 },
    );
  };

  return <div className="site-container cinema-finder-page">
    <Link href="/" className="back-link"><ArrowLeft size={15} /> Нүүр хуудас</Link>
    <div className="finder-heading"><div><h1>Кино театрууд</h1><p>Улаанбаатар, Дархан, Эрдэнэт хот дахь 10 салбар.</p></div><div className="location-action"><Button onPress={locate} isDisabled={locating}>{locating ? <Spinner size="sm" color="current" /> : <LocateFixed size={17} />}{locating ? "Байршлыг тогтоож байна…" : position ? "Байршлаа шинэчлэх" : "Ойр кино театруудыг хайх"}</Button><p>Байршлыг зөвхөн таны зөвшөөрлөөр тогтооно.</p></div></div>
    {locationError && <div className="location-notice" role="alert"><MapPin size={17} /><p>{locationError}</p><Button variant="ghost" isIconOnly aria-label="Мэдэгдэл хаах" onPress={() => setLocationError("")}><X size={16} /></Button></div>}
    {position && <div className="location-success" role="status"><LocateFixed size={16} /><span>Байршлыг тогтоолоо · Нарийвчлал: ±{Math.round(position.accuracy)} м{nearest !== null && <> · Хамгийн ойр салбар хүртэл <strong>{formatDistance(nearest)}</strong></>}</span><Button variant="ghost" size="sm" onPress={() => { setPosition(null); setSelectedId(null); }}>Байршлыг арилгах</Button></div>}
    <div className="finder-filters">
      <SearchField className="cinema-search-field" aria-label="Кино театр, дүүрэг, хотын нэрээр хайх" value={query} onChange={(value) => { setQuery(value); setSelectedId(null); }}>
        <SearchField.Group><SearchField.SearchIcon /><SearchField.Input placeholder="Театр, дүүрэг, хотын нэр" /><SearchField.ClearButton aria-label="Хайлтын үгийг арилгах" /></SearchField.Group>
      </SearchField>
      <CinemaSelect label="Хот сонгох" value={city} onChange={(value) => { setCity(value); setSelectedId(null); }} options={[{ id: "all", label: "Бүх хот" }, ...["Улаанбаатар", "Дархан", "Эрдэнэт"].map((name) => ({ id: name, label: name }))]} />
      <CinemaSelect label="Кино театрын сүлжээ" value={provider} onChange={(value) => { setProvider(value as ProviderId | "all"); setSelectedId(null); }} options={[{ id: "all", label: "Бүгд" }, ...cinemaProviders.map((item) => ({ id: item.id, label: item.name }))]} />
    </div>
    <div className="finder-layout"><section className="cinema-results" aria-label="Кино театрын жагсаалт"><div className="finder-results-label" role="status"><strong>{filtered.length} салбар</strong><span>{position ? "Ойроос хол руу" : "Газрын зураг дээр сонгоорой"}</span></div><div className="cinema-results-scroll">
      {!filtered.length ? <div className="finder-empty"><Search size={25} /><h2>Тохирох кино театр олдсонгүй</h2><p>Өөр хот, кино театр сонгох эсвэл хайлтын үгээ өөрчилнө үү.</p><Button variant="outline" onPress={() => { setCity("all"); setProvider("all"); setQuery(""); }}>Шүүлтүүрийг арилгах</Button></div> : filtered.map((cinema, index) => {
        const brand = cinemaProviders.find((item) => item.id === cinema.provider)!;
        return <Card<"article"> render={(props) => <article {...props} />} key={cinema.id} className={"cinema-result " + (selected?.id === cinema.id ? "selected" : "")} data-cinema-id={cinema.id}>
          <Button variant="ghost" className="cinema-result-select" onPress={() => setSelectedId(cinema.id)} aria-pressed={selected?.id === cinema.id} aria-label={cinema.name + " — газрын зураг дээр харах"}><span className="cinema-result-number" style={{ "--provider": brand.color } as React.CSSProperties}>{index + 1}</span><span><small>{brand.name} · {cinema.city}</small><strong>{cinema.name}</strong><span className="cinema-address">{cinema.address}</span></span>{position && <span className="cinema-distance">{formatDistance(distanceKm(position, cinema))}</span>}</Button>
          <Card.Footer className="cinema-result-actions"><Link href={directionsUrl(cinema)} target="_blank" rel="noreferrer"><Navigation size={13} /> Чиглэл харах</Link><Link href={cinema.url} target="_blank" rel="noreferrer">Хуваарь <ArrowUpRight size={13} /></Link></Card.Footer>
        </Card>;
      })}
    </div></section><div className="finder-map-panel"><CinemaMap cinemas={filtered} selectedId={selected?.id || null} position={position} onSelect={selectFromMap} /><div className="map-legend"><span className="legend-title"><MapPin size={13} />Кино театрууд</span>{cinemaProviders.map((item) => <span key={item.id}><i style={{ backgroundColor: item.color }} />{item.name}</span>)}{position && <span><i className="your-location-dot" />Таны байршил</span>}</div></div></div>
    <div className="finder-footnote"><p>Зайг шулуун шугамаар ойролцоолон тооцно. Жагсаалтад 10 салбар багтсан.</p><p>Байршлын мэдээллийг шинэчилсэн: {cinemaLocationsUpdated} · <a href="https://new.urgoo.mn/cinemas" target="_blank" rel="noreferrer">Өргөө</a>, <a href="https://www.tengis.mn/pages/holboo-barih" target="_blank" rel="noreferrer">Тэнгис</a>, <a href="https://www.primecineplex.mn/Home/contactus" target="_blank" rel="noreferrer">Prime</a> · <a href="https://www.openstreetmap.org/fixthemap" target="_blank" rel="noreferrer">Газрын зургийн алдааг мэдээлэх</a></p></div>
    <Link href="/in-theaters" className="finder-movies-link"><Clapperboard size={21} /><span><strong>Дэлгэцнээ гарч буй кинонууд</strong><small>Кино сонгож, үзвэрийн хуваарь харах</small></span><ArrowUpRight size={20} /></Link>
  </div>;
}
