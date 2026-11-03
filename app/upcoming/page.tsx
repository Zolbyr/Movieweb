import { Catalog } from "../_components/Catalog";
import { categories } from "../../lib/movies";
export const metadata = { title: "Удахгүй гарах кинонууд", description: categories.upcoming.description };
export default function UpcomingPage() { return <Catalog category="upcoming" />; }
