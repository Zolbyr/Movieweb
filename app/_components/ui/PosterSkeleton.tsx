"use client";

import { Card, Skeleton } from "@heroui/react";

export function PosterSkeleton() {
  return <Card className="movie-skeleton" aria-hidden="true">
    <Skeleton className="skeleton-poster" />
    <Skeleton className="skeleton-title" />
    <Skeleton className="skeleton-subtitle" />
  </Card>;
}
