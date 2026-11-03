"use client";

import { useState } from "react";
import { Button, Modal, Spinner } from "@heroui/react";
import { Play, X } from "lucide-react";
import { useMovies } from "./useMovies";
import { ErrorState } from "./MovieGrid";

type Videos = { results: { type: string; site: string; key: string }[] };

export function TrailerButton({ movieId, title, videoKey, onOpenChange, className = "button button-primary" }: { movieId: number; title: string; videoKey?: string; onOpenChange?: (open: boolean) => void; className?: string }) {
  const [open, setOpen] = useState(false);
  const { data, error, loading, retry } = useMovies<Videos>(open && !videoKey ? "movie/" + movieId + "/videos?language=en-US" : null);
  const trailer = videoKey || data?.results?.find((video) => video.site === "YouTube" && video.type === "Trailer")?.key;

  return <Modal isOpen={open} onOpenChange={(value) => { setOpen(value); onOpenChange?.(value); }}>
    <Button className={className}><Play size={15} fill="currentColor" /> Трейлер үзэх</Button>
    <Modal.Backdrop variant="blur" className="cinema-modal-backdrop">
      <Modal.Container size="cover" placement="center" className="cinema-modal-container">
        <Modal.Dialog className="cinema-trailer-dialog" aria-describedby={"trailer-description-" + movieId}>
          <Modal.Header className="trailer-header"><div><Modal.Heading>{title}</Modal.Heading><p id={"trailer-description-" + movieId}>Киноны трейлер</p></div><Modal.CloseTrigger className="icon-button" aria-label="Трейлерийг хаах"><X size={22} /></Modal.CloseTrigger></Modal.Header>
          <Modal.Body className="trailer-player">
            {loading ? <p className="trailer-loading" role="status"><Spinner size="sm" />Трейлерийг ачаалж байна…</p> : error ? <ErrorState message={error} retry={retry} /> : trailer ? <iframe src={"https://www.youtube.com/embed/" + encodeURIComponent(trailer) + "?autoplay=1&rel=0"} title={title + " киноны трейлер"} allow="autoplay; encrypted-media; picture-in-picture" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen /> : <p className="trailer-loading">Энэ киноны трейлер олдсонгүй.</p>}
          </Modal.Body>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  </Modal>;
}
