"use client";

import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "../@/components/ui/navigation-menu";
import { MovieCards } from "./_components/moviecards";
import { MovieSlider } from "./_components/MovieSlider";
import { SwitchDemo } from "./_components/Switcher";
import { MoviePopular } from "./_components/moviepopular";
import { MovieTopRated } from "./_components/movietoprated";
import { ContactInfo } from "./_components/Contactinfo";
import { MovieSearch } from "./_components/MovieSearch";

const genres = [
  "Action", "Adventure", "Animation", "Biography", "Comedy", "Crime",
  "Documentary", "Drama", "Family", "Fantasy", "Film-Noir", "Game-Show",
  "History", "Horror", "Music", "Musical", "Mystery", "News", "Reality-TV",
  "Romance", "Sci-Fi", "Short", "Sport", "Talk-Show", "Thriller", "War", "Western",
];

export default function Home() {
  return (
    <div className="w-full overflow-x-hidden">

      <nav className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b">
        <div className="max-w-screen-2xl mx-auto px-6 flex items-center justify-between h-14">
          <a href="/" className="flex items-center gap-2 shrink-0">
            <img src="/film.png" className="w-5 h-5" alt="logo" />
            <span className="font-semibold text-sm tracking-wide whitespace-nowrap">Movie Z</span>
          </a>

          <div className="flex items-center gap-3">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-sm">Genres</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="p-4 w-[540px]">
                      <h2 className="text-base font-semibold mb-1">Genres</h2>
                      <p className="text-xs text-muted-foreground mb-3">
                        See lists of movies by genre
                      </p>
                      <div className="grid grid-cols-4 gap-2">
                        {genres.map((genre) => (
                          <NavigationMenuLink
                            key={genre}
                            href={`/genre/${genre.toLowerCase()}`}
                            className="rounded-full border px-3 py-1 text-xs text-center hover:bg-accent transition"
                          >
                            {genre}
                          </NavigationMenuLink>
                        ))}
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
            <MovieSearch />
          </div>

          <SwitchDemo />
        </div>
      </nav>

<div className="w-full h-[520px] overflow-hidden">
  <MovieSlider />
</div>

      <div className="max-w-screen-2xl mx-auto px-6 py-10 space-y-12">
        <MovieCards />
        <MoviePopular />
        <MovieTopRated />
      </div>

      <ContactInfo />
    </div>
  );
}