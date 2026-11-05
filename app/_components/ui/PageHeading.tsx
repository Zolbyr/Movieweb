import type { ReactNode } from "react";

export function PageHeading({ title, description, eyebrow, id }: {
  title: string;
  description: ReactNode;
  eyebrow: string;
  id?: string;
}) {
  return <div className="page-heading" id={id}>
    <p className="page-eyebrow">{eyebrow}</p>
    <h1>{title}</h1>
    <p className="page-description">{description}</p>
  </div>;
}
