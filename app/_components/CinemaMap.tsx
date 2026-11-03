"use client";

import { useEffect, useRef, useState } from "react";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import { cinemaProviders, type Cinema, type Coordinates } from "../../lib/cinemas";

export default function CinemaMap({ cinemas, selectedId, position, onSelect }: { cinemas: Cinema[]; selectedId: string | null; position: Coordinates | null; onSelect: (id: string) => void }) {
  const element = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const layer = useRef<L.LayerGroup | null>(null);
  const markers = useRef<Map<string, L.Marker>>(new Map());
  const select = useRef(onSelect);
  const [ready, setReady] = useState(false);
  const [tileError, setTileError] = useState(false);
  select.current = onSelect;

  useEffect(() => {
    if (!element.current) return;
    const instance = L.map(element.current, { scrollWheelZoom: false, zoomControl: false }).setView([47.915, 106.917], 12);
    L.control.zoom({ position: "bottomright", zoomInTitle: "Ойртуулах", zoomOutTitle: "Холдуулах" }).addTo(instance);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors' })
      .on("tileerror", () => setTileError(true))
      .on("tileload", () => setTileError(false))
      .addTo(instance);
    map.current = instance;
    layer.current = L.layerGroup().addTo(instance);
    const observer = new ResizeObserver(() => instance.invalidateSize());
    observer.observe(element.current);
    setReady(true);
    return () => { observer.disconnect(); instance.remove(); map.current = null; layer.current = null; };
  }, []);

  useEffect(() => {
    if (!ready || !map.current || !layer.current) return;
    layer.current.clearLayers();
    markers.current.clear();
    cinemas.forEach((cinema, index) => {
      const color = cinemaProviders.find((item) => item.id === cinema.provider)!.color;
      const marker = L.marker([cinema.latitude, cinema.longitude], {
        icon: L.divIcon({ className: "cinema-map-marker", html: '<span style="--pin-color:' + color + '">' + (index + 1) + "</span>", iconSize: [34, 42], iconAnchor: [17, 40] }),
        title: cinema.name, alt: cinema.name, keyboard: true,
      }).on("click", () => select.current(cinema.id)).addTo(layer.current!);
      const label = document.createElement("span");
      label.textContent = cinema.name;
      marker.bindTooltip(label, { direction: "top", offset: [0, -35] });
      markers.current.set(cinema.id, marker);
    });
    if (position) {
      L.circleMarker([position.latitude, position.longitude], { radius: 8, fillColor: "#418aef", fillOpacity: 1, color: "white", weight: 3 }).bindTooltip("Таны байршил").addTo(layer.current);
    }
    const points: L.LatLngTuple[] = cinemas.slice(0, position ? 4 : cinemas.length).map((cinema) => [cinema.latitude, cinema.longitude]);
    if (position) points.push([position.latitude, position.longitude]);
    if (points.length) map.current.fitBounds(L.latLngBounds(points), { padding: map.current.getSize().x < 400 ? [12, 32] : [40, 40], maxZoom: 13, animate: false });
  }, [cinemas, position, ready]);

  useEffect(() => {
    if (!ready || !map.current) return;
    for (const [id, marker] of markers.current) {
      marker.getElement()?.classList.toggle("selected", id === selectedId);
      marker.setZIndexOffset(id === selectedId ? 1000 : 0);
    }
    const marker = selectedId && markers.current.get(selectedId);
    if (marker) {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      map.current.flyTo(marker.getLatLng(), Math.max(13, map.current.getZoom()), { animate: !reduced, duration: 0.65 });
    }
  }, [selectedId, cinemas, ready]);

  return <div className="cinema-map-shell"><div ref={element} className="cinema-map" role="region" aria-label="Кино театруудын байршлын зураг" />{tileError && <p className="map-tile-message" role="status">Газрын зургийн дэвсгэрийг ачаалж чадсангүй. Театруудын жагсаалт болон чиглэлийн холбоосыг ашиглана уу.</p>}</div>;
}
