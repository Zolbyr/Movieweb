import { Link } from "@heroui/react";
import { ArrowLeft } from "lucide-react";
import { LocalNowShowing } from "../_components/LocalNowShowing";

export const metadata = { title: "Дэлгэцнээ гарч буй кинонууд", description: "Өргөө, Тэнгис, Prime Cineplex-ийн албан ёсны сайтад нийтэлсэн кинонууд. Үзвэрийн хуваарь, тасалбарын мэдээлэл харах." };

export default function InTheatersPage() {
  return <div className="site-container catalog-page"><Link href="/" className="back-link"><ArrowLeft size={15} /> Нүүр хуудас</Link><LocalNowShowing full /></div>;
}
