import { MovieGrid } from "./_components/MovieGrid";
import { Skeleton } from "@heroui/react";

export default function Loading() {
  return <div className="site-container catalog-page" role="status"><span className="sr-only">Киноны мэдээллийг ачаалж байна…</span><Skeleton className="detail-title-skeleton" /><MovieGrid loading /></div>;
}
