"use client";

import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { Button } from "@heroui/react";
import { ChevronLeft, ChevronRight, MoveHorizontal } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures";

export function RevolverShelf<T>({ items, label, renderItem, heading, footer, gridClassName = "movie-grid" }: {
  items: T[];
  label: string;
  renderItem: (item: T, index: number) => ReactNode;
  heading?: ReactNode;
  footer?: ReactNode;
  gridClassName?: string;
}) {
  const [reducedMotion, setReducedMotion] = useState(true);
  const [selected, setSelected] = useState(0);
  const [canPrevious, setCanPrevious] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const interacted = useRef(false);
  const hintId = useId();
  const plugins = useMemo(() => [WheelGesturesPlugin()], []);
  const [viewportRef, api] = useEmblaCarousel({
    loop: true,
    align: "start",
    slidesToScroll: 1,
    dragFree: !reducedMotion,
    skipSnaps: true,
    duration: reducedMotion ? 0 : 25,
  }, plugins);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!api) return;
    const updateSelection = () => {
      setSelected(api.selectedScrollSnap());
      setCanPrevious(api.canScrollPrev());
      setCanNext(api.canScrollNext());
    };
    const updateCurve = () => {
      const viewport = api.rootNode().getBoundingClientRect();
      const center = viewport.left + viewport.width / 2;
      // Transform an inner wrapper so Embla can manage the outer slide's loop position.
      const frames = api.slideNodes().map((slide) => {
        const rect = slide.getBoundingClientRect();
        const distance = Math.max(-1, Math.min(1, (rect.left + rect.width / 2 - center) / (viewport.width / 2 || 1)));
        return { node: slide.firstElementChild as HTMLElement, distance };
      });
      frames.forEach(({ node, distance }) => {
        if (!node) return;
        node.style.transform = reducedMotion ? "none" : "perspective(1000px) rotateY(" + (-distance * 12).toFixed(2) + "deg) translateY(" + (Math.abs(distance) * 5).toFixed(2) + "px) scale(" + (1 - Math.abs(distance) * .025).toFixed(3) + ")";
      });
    };
    const onPointerDown = () => { interacted.current = true; };
    const onSettle = () => {
      if (interacted.current) setAnnouncement(label + ": " + (api.selectedScrollSnap() + 1) + " дахь кино, нийт " + items.length + ".");
    };
    const onReInit = () => { updateSelection(); updateCurve(); };
    onReInit();
    api.on("select", updateSelection).on("scroll", updateCurve).on("reInit", onReInit).on("pointerDown", onPointerDown).on("settle", onSettle);
    return () => {
      api.off("select", updateSelection).off("scroll", updateCurve).off("reInit", onReInit).off("pointerDown", onPointerDown).off("settle", onSettle);
    };
  }, [api, items.length, label, reducedMotion]);

  const move = (direction: number) => {
    if (!api) return;
    interacted.current = true;
    if (direction > 0) api.scrollNext(reducedMotion);
    else api.scrollPrev(reducedMotion);
  };

  const controls = <div className="reload-controls">
    <span id={hintId} className="carousel-gesture-hint"><MoveHorizontal size={15} aria-hidden="true" />Гулсуулж үзээрэй</span>
    <span className="reload-count" aria-hidden="true">{items.length ? String(selected + 1).padStart(2, "0") : "00"}<span> / {items.length}</span></span>
    <Button className="reload-previous carousel-arrow" variant="outline" isIconOnly isDisabled={!canPrevious} onPress={() => move(-1)} aria-label={label + " — өмнөх кинонууд"}><ChevronLeft size={18} /></Button>
    <Button className="reload-next carousel-arrow" variant="outline" isIconOnly isDisabled={!canNext} onPress={() => move(1)} aria-label={label + " — дараагийн кинонууд"}><ChevronRight size={18} /></Button>
  </div>;

  return <div className="revolver-shelf" data-position={selected}>
    {heading && <div className="section-heading">{heading}{controls}</div>}
    <div className="revolver-deck" ref={viewportRef} role="region" aria-roledescription="Киноны гулсдаг жагсаалт" aria-label={label} aria-describedby={hintId} tabIndex={0}
      onKeyDown={(event) => {
        if (event.target !== event.currentTarget || !api) return;
        if (event.key === "ArrowLeft" || event.key === "ArrowRight") { event.preventDefault(); move(event.key === "ArrowRight" ? 1 : -1); }
        else if (event.key === "Home" || event.key === "End") { event.preventDefault(); interacted.current = true; api.scrollTo(event.key === "Home" ? 0 : api.scrollSnapList().length - 1, reducedMotion); }
      }}>
      <div className={gridClassName + " revolver-track"}>{items.map((item, index) => <div className="revolver-slot" key={index} role="group" aria-roledescription="Кино" aria-label={(index + 1) + " / " + items.length}>
        <div className="revolver-card">{renderItem(item, index)}</div>
      </div>)}</div>
    </div>
    {!heading && <div className="local-source-line">{footer}{controls}</div>}
    <p role="status" aria-live="polite" className="sr-only">{announcement}</p>
  </div>;
}
