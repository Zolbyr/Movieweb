import { Link } from "@heroui/react";
import { Clapperboard, ArrowUpRight } from "lucide-react";

export function ContactInfo() {
  return <footer className="site-footer">
    <div className="site-container footer-main">
      <div><Link href="/" className="brand"><span className="brand-icon"><Clapperboard size={21} /></span>Movie <span className="brand-z">Z</span></Link><p>Киноны мэдээлэл, үзвэрийн хуваарь,<br />кино театрын байршил — нэг дор.</p></div>
      <nav aria-label="Киноны жагсаалт"><h2>Киноны жагсаалт</h2><Link href="/in-theaters">Дэлгэцнээ гарч буй кинонууд</Link><Link href="/popular">Эрэлттэй кинонууд</Link><Link href="/upcoming">Удахгүй гарах</Link><Link href="/top-rated">Өндөр үнэлгээтэй</Link><Link href="/cinemas">Кино театр хайх</Link></nav>
      <div className="footer-note"><h2>Мэдээллийн эх сурвалж</h2><p>Үзвэрийн цаг, тасалбарын мэдээллийг Өргөө, Тэнгис, Prime Cineplex-ийн албан ёсны сайтаас шалгана уу.</p><a href="https://www.themoviedb.org/" target="_blank" rel="noreferrer">Киноны мэдээлэл: TMDB <ArrowUpRight size={13} /></a><p className="tmdb-notice">This product uses the TMDB API but is not endorsed or certified by TMDB.</p></div>
    </div>
    <div className="site-container footer-bottom"><span>© 2026 Movie Z</span><span>Монголын кино сонирхогчдод</span></div>
  </footer>;
}
