import { Link } from "@heroui/react";
import { ArrowLeft, Clapperboard } from "lucide-react";

export default function NotFound() {
  return <div className="site-container not-found"><span className="empty-icon"><Clapperboard size={30} /></span><p className="eyebrow">404</p><h1>Хуудас олдсонгүй</h1><p>Энэ хаяг дахь хуудас эсвэл киноны төрөл байхгүй байна.</p><Link className="button button-primary" href="/"><ArrowLeft size={16} /> Нүүр хуудас</Link></div>;
}
