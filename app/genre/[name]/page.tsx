import { notFound } from "next/navigation";
import { genres, genreLabels } from "../../../lib/movies";
import { Catalog } from "../../_components/Catalog";

type Props = { params: Promise<{ name: string }> };

function findGenre(name: string) {
  return genres.find((item) => item.slug === name.toLowerCase() || item.name.toLowerCase() === name.toLowerCase());
}

export async function generateMetadata({ params }: Props) {
  const genre = findGenre((await params).name);
  if (!genre) notFound();
  const title = (genreLabels[genre.slug] || genre.name) + " кино";
  return { title, description: title + "ны жагсаалт. Киноны товч агуулга, трейлер, үнэлгээг харах." };
}

export default async function GenrePage({ params }: Props) {
  const { name } = await params;
  const genre = findGenre(name);
  if (!genre) notFound();
  return <Catalog key={genre.id} genre={genre} />;
}
