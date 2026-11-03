"use client";

import { useEffect, useState } from "react";
import { Button, Link, Popover } from "@heroui/react";
import { usePathname } from "next/navigation";
import { ChevronDown, Clapperboard, LayoutGrid } from "lucide-react";
import { genres, genreLabels } from "../../lib/movies";
import { MovieSearch } from "./MovieSearch";
import { SwitchDemo } from "./Switcher";

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <header className="site-header">
      <div className="site-container header-inner">
        <Link href="/" className="brand" aria-label="Movie Z — нүүр хуудас">
          <span className="brand-icon"><Clapperboard size={21} strokeWidth={1.8} /></span>
          Movie <span className="brand-z">Z</span>
        </Link>
        <nav className="desktop-nav" aria-label="Үндсэн цэс">
          {[["/in-theaters", "Дэлгэцнээ"], ["/popular", "Киноны сан"], ["/cinemas", "Кино театрууд"]].map(([href, title]) => (
            <Link key={href} href={href} className={pathname === href || (href === "/in-theaters" && pathname === "/") ? "nav-link active" : "nav-link"} aria-current={pathname === href ? "page" : undefined}>{title}</Link>
          ))}
        </nav>
        <div className="genre-menu">
        <Popover isOpen={open} onOpenChange={setOpen}>
          <Button variant="ghost" className={"genre-trigger " + (open ? "is-open" : "")}>
            <LayoutGrid size={16} /><span>Төрөл</span><ChevronDown size={13} className="genre-chevron" />
          </Button>
          <Popover.Content className="genre-popover" placement="bottom end" offset={14}>
          <Popover.Dialog>
            <Popover.Heading>Киноны төрөл</Popover.Heading>
            <div className="genre-options">
              {genres.map((genre) => <Link href={"/genre/" + genre.slug} key={genre.id} onPress={() => setOpen(false)} className="genre-pill">{genreLabels[genre.slug] || genre.name}</Link>)}
            </div>
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
