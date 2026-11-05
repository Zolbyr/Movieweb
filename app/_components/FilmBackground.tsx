"use client";

import { memo, useEffect, useState } from "react";
import Image from "next/image";
import { Button, Tooltip } from "@heroui/react";
import { Pause, Play } from "lucide-react";
import { useNavigationMotion } from "./NavigationMotion";

// Existing local artwork keeps the decorative background independent of the movie API.
const posters = ["alien.jpg", "wicked.jpg", "dragon.jpg", "sonic3.png", "ashes.jpg", "getaway.jpg", "sololevel.jpg", "theorder.jpg", "y3k.jpg", "spacedog.jpg", "santa.jpg", "wicked.jpg"];
const rows = Array.from({ length: 4 }, (_, row) => posters.map((_, index) => posters[(index + row * 3) % posters.length]));
const preferenceKey = "movie-z-background-paused";

const PosterWall = memo(function PosterWall() {
  return <div className="film-background-wall">
    {rows.map((row, index) => <div className={"film-background-row film-background-row-" + index} key={index}>
      {[0, 1].map((copy) => <div className="film-background-run" key={copy}>
        {row.map((poster, slot) => <Image className="film-background-poster" key={slot} src={"/" + poster} alt="" width={180} height={270} sizes="(max-width: 1000px) 120px, 12vw" loading="eager" fetchPriority="low" draggable={false} />)}
      </div>)}
    </div>)}
  </div>;
});

export function FilmBackground() {
  const { open } = useNavigationMotion();
  const [paused, setPaused] = useState(true);
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    try { setPaused(localStorage.getItem(preferenceKey) === "true"); } catch { setPaused(false); }
    const onVisibility = () => setHidden(document.hidden);
    onVisibility();
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  const toggle = () => {
    const value = !paused;
    setPaused(value);
    try { localStorage.setItem(preferenceKey, String(value)); } catch { /* The control still works when storage is unavailable. */ }
  };
  const label = paused ? "Арын хөдөлгөөнийг үргэлжлүүлэх" : "Арын хөдөлгөөнийг түр зогсоох";

  return <>
    <div className="film-background" aria-hidden="true" data-paused={paused || hidden || open}>
      <PosterWall />
      <div className="film-background-shade" />
    </div>
    <Tooltip>
      <Button variant="outline" isIconOnly className="film-motion-toggle" onPress={toggle} aria-label={label} aria-pressed={paused}>
        {paused ? <Play size={16} aria-hidden="true" /> : <Pause size={16} aria-hidden="true" />}
      </Button>
      <Tooltip.Content>{label}</Tooltip.Content>
    </Tooltip>
  </>;
}
