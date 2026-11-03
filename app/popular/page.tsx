import { Catalog } from "../_components/Catalog";
import { categories } from "../../lib/movies";
export const metadata = { title: categories.popular.title, description: categories.popular.description };
export default function PopularPage() { return <Catalog category="popular" />; }
