"use client";

import { useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function useUrlPagination() {
  const params = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const raw = params.get("page") || "1";
  const value = /^\d+$/.test(raw) ? Number(raw) : NaN;
  const page = Number.isInteger(value) && value >= 1 && value <= 500 ? value : 1;

  const setPage = (nextPage: number) => {
    if (!Number.isInteger(nextPage) || nextPage < 1 || nextPage > 500 || nextPage === page) return;
    const next = new URLSearchParams(params.toString());
    if (nextPage === 1) next.delete("page");
    else next.set("page", String(nextPage));
    const query = next.toString();
    startTransition(() => router.push(pathname + (query ? "?" + query : ""), { scroll: false }));
  };

  return { page, setPage, pending };
}
