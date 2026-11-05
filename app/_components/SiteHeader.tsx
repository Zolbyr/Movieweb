"use client";

import { useEffect } from "react";
import { Button, Link, Popover } from "@heroui/react";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronRight, Clapperboard, LayoutGrid, X } from "lucide-react";
import { genres, genreLabels } from "../../lib/movies";
import { MovieSearch } from "./MovieSearch";
import { SwitchDemo } from "./Switcher";
import { useNavigationMotion } from "./NavigationMotion";

export function SiteHeader() {
  const pathname = usePathname();
  const { open, setOpen } = useNavigationMotion();

  useEffect(() => { setOpen(false); }, [pathname, setOpen]);

  return (
    <header className="site-header">
      <div className="site-container header-inner">
        <Link href="/" className="brand" aria-label="Movie Z — нүүр хуудас">
          <span className="brand-icon"><Clapperboard size={21} strokeWidth={1.8} /></span>
          Movie <span className="brand-z">Z</span>
        </Link>
        <nav className="desktop-nav" aria-label="Үндсэн цэс">
          {[["/in-theaters", "Дэлгэцнээ"], ["/popular", "Киноны сан"], ["/cinemas", "Кино театрууд"]].map(([href, title]) => (
            <Link key={href} href={href} className={pathname === href || (href === "/in-theaters" && pathname === "/") ? "nav-link active" : "nav-link"} aria-current={pathname === href || (href === "/in-theaters" && pathname === "/") ? "page" : undefined}>{title}</Link>
          ))}
        </nav>
        <div className="genre-menu">
        <Popover isOpen={open} onOpenChange={setOpen}>
          <Button variant="ghost" className={"genre-trigger " + (open ? "is-open" : "")}>
            <LayoutGrid size={16} /><span>Төрөл</span><ChevronDown size={13} className="genre-chevron" />
          </Button>
          <Popover.Content className="genre-popover" placement="bottom end" offset={10} isNonModal>
          <Popover.Dialog>
            <div className="genre-menu-heading"><div><Popover.Heading>Киноны төрөл</Popover.Heading><p>Сонирхсон төрлөөрөө киногоо олоорой.</p></div><Button variant="ghost" isIconOnly aria-label="Төрлийн цэсийг хаах" onPress={() => setOpen(false)}><X size={18} /></Button></div>
            <nav className="genre-menu-grid" aria-label="Киноны төрөл сонгох">
              {genres.map((genre) => <Link href={"/genre/" + genre.slug} key={genre.id} onPress={() => setOpen(false)} className="genre-option" aria-current={pathname === "/genre/" + genre.slug ? "page" : undefined}><span>{genreLabels[genre.slug] || genre.name}</span><ChevronRight size={14} aria-hidden="true" /></Link>)}
            </nav>
          </Popover.Dialog>
          </Popover.Content>
        </Popover>
        </div>
        <div className="header-search"><MovieSearch /></div>
        <SwitchDemo />
      </div>
    </header>
  );
}
