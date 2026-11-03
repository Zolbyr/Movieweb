"use client";

import { ErrorState } from "./_components/MovieGrid";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return <div className="site-container catalog-page"><ErrorState message="Хуудсыг ачаалж чадсангүй. Дахин оролдоно уу." retry={reset} /></div>;
}
