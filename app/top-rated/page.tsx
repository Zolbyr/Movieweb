import { Catalog } from "../_components/Catalog";
import { categories } from "../../lib/movies";
export const metadata = { title: "Өндөр үнэлгээтэй кинонууд", description: categories["top-rated"].description };
export default function TopRatedPage() { return <Catalog category="top-rated" />; }
