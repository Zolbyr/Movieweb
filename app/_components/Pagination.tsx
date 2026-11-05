"use client";

import { Fragment } from "react";
import { Pagination as UIPagination } from "@heroui/react";
import { ChevronLeft, ChevronRight, Ellipsis } from "lucide-react";

export function Pagination({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (page: number) => void }) {
  if (!Number.isFinite(totalPages) || totalPages <= 1) return null;
  const pages = [...new Set([1, ...Array.from({ length: 5 }, (_, index) => page - 2 + index).filter((value) => value > 0 && value <= totalPages), totalPages])].sort((a, b) => a - b);
  const change = (value: number) => {
    onChange(value);
    const heading = document.getElementById("results-top");
    heading?.scrollIntoView({ block: "start", behavior: "auto" });
    heading?.focus({ preventScroll: true });
  };
  return <UIPagination className="movie-pagination" size="sm" aria-label="Киноны жагсаалтын хуудас">
    <UIPagination.Content>
      <UIPagination.Item><UIPagination.Previous isDisabled={page <= 1} onPress={() => change(page - 1)} aria-label="Өмнөх хуудас"><ChevronLeft size={16} aria-hidden="true" /><span className="pagination-word">Өмнөх</span></UIPagination.Previous></UIPagination.Item>
      {pages.map((value, index) => <Fragment key={value}>
        {index > 0 && value - pages[index - 1] > 1 && <UIPagination.Item><UIPagination.Ellipsis aria-label="Бусад хуудас"><Ellipsis size={16} aria-hidden="true" /></UIPagination.Ellipsis></UIPagination.Item>}
        <UIPagination.Item><UIPagination.Link aria-label={"Хуудас " + value} isActive={page === value} onPress={() => change(value)}>{value}</UIPagination.Link></UIPagination.Item>
      </Fragment>)}
      <UIPagination.Item><UIPagination.Next isDisabled={page >= totalPages} onPress={() => change(page + 1)} aria-label="Дараагийн хуудас"><span className="pagination-word">Дараагийн</span><ChevronRight size={16} aria-hidden="true" /></UIPagination.Next></UIPagination.Item>
    </UIPagination.Content>
  </UIPagination>;
}
