"use client";

import { useEffect, useRef, useState } from "react";
import { Button, Card, Link } from "@heroui/react";
import { ArrowUpRight, Navigation, X } from "lucide-react";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import { cinemaProviders, directionsUrl, type Cinema, type Coordinates } from "../../lib/cinemas";
import { CinemaLogo } from "./ui/CinemaBrand";

export default function CinemaMap({ cinemas, selectedId, position, onSelect }: { cinemas: Cinema[]; selectedId: string | null; position: Coordinates | null; onSelect: (id: string | null) => void }) {
  const element = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const layer = useRef<L.LayerGroup | null>(null);
  const markers = useRef<Map<string, L.Marker>>(new Map());
  const layoutPins = useRef<() => void>(() => {});
  const selection = useRef(selectedId);
  const select = useRef(onSelect);
  const [ready, setReady] = useState(false);
  const [tileError, setTileError] = useState(false);
  const selected = cinemas.find((cinema) => cinema.id === selectedId);
  select.current = onSelect;
  selection.current = selectedId;

  useEffect(() => {
    if (!element.current) return;
    const instance = L.map(element.current, { scrollWheelZoom: false, zoomControl: false }).setView([47.915, 106.917], 12);
    L.control.zoom({ position: "topright", zoomInTitle: "Ойртуулах", zoomOutTitle: "Холдуулах" }).addTo(instance);
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
    cinemas.forEach((cinema) => {
      const brand = cinemaProviders.find((item) => item.id === cinema.provider)!;
      const pin = document.createElement("span");
      pin.className = "cinema-marker-pin cinema-marker-pin-" + brand.id;
      pin.style.setProperty("--pin-color", brand.color);
      const logo = document.createElement("img");
      logo.src = brand.logo;
      logo.alt = "";
      logo.width = 48;
      logo.height = 24;
      logo.draggable = false;
      pin.append(logo);
      const marker = L.marker([cinema.latitude, cinema.longitude], {
        icon: L.divIcon({ className: "cinema-map-marker", html: pin, iconSize: [64, 50], iconAnchor: [32, 48] }),
        title: cinema.name, alt: cinema.name, keyboard: true, riseOnHover: true,
      }).on("click", () => select.current(cinema.id)).on("keydown", (event: L.LeafletKeyboardEvent) => {
        if (event.originalEvent.key === "Enter" || event.originalEvent.key === " ") {
          L.DomEvent.stop(event.originalEvent);
          select.current(cinema.id);
        }
      }).addTo(layer.current!);
      marker.getElement()?.setAttribute("aria-label", cinema.name + " — салбарын мэдээлэл харах");
      const label = document.createElement("span");
      label.textContent = cinema.name;
      marker.bindTooltip(label, { direction: "top", offset: [0, -43] });
      markers.current.set(cinema.id, marker);
    });
    if (position) {
      L.circleMarker([position.latitude, position.longitude], { radius: 8, fillColor: "#418aef", fillOpacity: 1, color: "white", weight: 3 }).bindTooltip("Таны байршил").addTo(layer.current);
    }
    const instance = map.current;
    const connections = L.layerGroup().addTo(layer.current);
    const arrange = () => {
      connections.clearLayers();
      const size = instance.getSize();
      const container = instance.getContainer();
      const bounds = container.getBoundingClientRect();
      const occupied = Array.from(container.querySelectorAll<HTMLElement>(".leaflet-control"), (control) => {
        const rect = control.getBoundingClientRect();
        return { left: rect.left - bounds.left, right: rect.right - bounds.left, top: rect.top - bounds.top, bottom: rect.bottom - bounds.top };
      });
      const slots: L.PointTuple[] = [];
      for (let x = 38; x <= size.x - 38; x += 72) for (let y = 54; y <= size.y - 8; y += 56) slots.push([x, y]);
      // Give each badge its own tap area while keeping the true location marked.
      const ordered = [...cinemas].sort((a, b) => Number(b.id === selection.current) - Number(a.id === selection.current));
      ordered.forEach((cinema) => {
        const marker = markers.current.get(cinema.id)!;
        const node = marker.getElement();
        if (!node) return;
        const point = instance.latLngToContainerPoint(marker.getLatLng());
        let offset: L.PointTuple = [0, 0];
        if (point.x >= 0 && point.x <= size.x && point.y >= 0 && point.y <= size.y) {
          const candidates = [...slots].sort((a, b) => (a[0] - point.x) ** 2 + (a[1] - point.y) ** 2 - (b[0] - point.x) ** 2 - (b[1] - point.y) ** 2);
          if (cinema.id === selection.current) candidates.unshift([point.x, point.y]);
          const slot = candidates.find(([x, y]) => {
            const box = { left: x - 32, right: x + 32, top: y - 48, bottom: y + 2 };
            return box.left >= 6 && box.right <= size.x - 6 && box.top >= 6 && box.bottom <= size.y - 6
              && occupied.every((other) => box.right + 6 <= other.left || box.left >= other.right + 6 || box.bottom + 6 <= other.top || box.top >= other.bottom + 6);
          });
          if (slot) offset = [slot[0] - point.x, slot[1] - point.y];
          occupied.push({ left: point.x + offset[0] - 32, right: point.x + offset[0] + 32, top: point.y + offset[1] - 48, bottom: point.y + offset[1] + 2 });
        }
        node.style.marginLeft = (offset[0] - 32) + "px";
        node.style.marginTop = (offset[1] - 48) + "px";
        const tooltip = marker.getTooltip();
        if (tooltip) { tooltip.options.offset = L.point(offset[0], offset[1] - 43); if (tooltip.isOpen()) tooltip.update(); }
        if (offset[0] || offset[1]) {
          const color = cinemaProviders.find((brand) => brand.id === cinema.provider)!.color;
          const end = instance.containerPointToLatLng(point.add(offset));
          L.polyline([marker.getLatLng(), end], { color, weight: 1.5, opacity: .8, interactive: false }).addTo(connections);
          L.circleMarker(marker.getLatLng(), { radius: 3, color: "white", weight: 1, fillColor: color, fillOpacity: 1, interactive: false }).addTo(connections);
        }
      });
    };
    layoutPins.current = arrange;
    instance.on("zoomend moveend resize", arrange);
    const points: L.LatLngTuple[] = cinemas.slice(0, position ? 4 : cinemas.length).map((cinema) => [cinema.latitude, cinema.longitude]);
    if (position) points.push([position.latitude, position.longitude]);
    if (points.length) map.current.fitBounds(L.latLngBounds(points), { padding: map.current.getSize().x < 400 ? [38, 48] : [48, 48], maxZoom: 13, animate: false });
    arrange();
    return () => { instance.off("zoomend moveend resize", arrange); layoutPins.current = () => {}; };
  }, [cinemas, position, ready]);

  useEffect(() => {
    if (!ready || !map.current) return;
    for (const [id, marker] of markers.current) {
      marker.getElement()?.classList.toggle("selected", id === selectedId);
      marker.getElement()?.setAttribute("aria-pressed", String(id === selectedId));
      marker.setZIndexOffset(id === selectedId ? 1000 : 0);
      if (id !== selectedId) marker.closeTooltip();
    }
    const marker = selectedId && markers.current.get(selectedId);
    if (marker) {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const zoom = Math.max(13, map.current.getZoom());
      // Keep the selected pin above the branch card on a small map.
      const center = map.current.getSize().y < 450
        ? map.current.unproject(map.current.project(marker.getLatLng(), zoom).add([0, 65]), zoom)
        : marker.getLatLng();
      map.current.flyTo(center, zoom, { animate: !reduced, duration: 0.65 });
      marker.openTooltip();
    }
    layoutPins.current();
  }, [selectedId, cinemas, ready]);

  return <div className="cinema-map-shell"><div ref={element} className="cinema-map" role="region" aria-label="Кино театруудын байршлын зураг" />
    <div className="map-selection" aria-live="polite">
      {selected && <Card className="map-selection-card" aria-label="Сонгосон кино театр">
        <Card.Header><CinemaLogo provider={selected.provider} /><div><Card.Title>{selected.name}</Card.Title><Card.Description>{selected.city}</Card.Description></div><Button isIconOnly variant="ghost" aria-label="Салбарын сонголтыг арилгах" onPress={() => { onSelect(null); markers.current.get(selected.id)?.getElement()?.focus(); }}><X size={16} /></Button></Card.Header>
        <Card.Content><p>{selected.address}</p></Card.Content>
        <Card.Footer><Link href={directionsUrl(selected)} target="_blank" rel="noreferrer"><Navigation size={14} />Чиглэл харах</Link><Link href={selected.url} target="_blank" rel="noreferrer">Үзвэрийн хуваарь<ArrowUpRight size={14} /></Link></Card.Footer>
      </Card>}
    </div>
    {tileError && <p className="map-tile-message" role="status">Газрын зургийн дэвсгэрийг ачаалж чадсангүй. Театруудын жагсаалт болон чиглэлийн холбоосыг ашиглана уу.</p>}</div>;
}
