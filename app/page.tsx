import { MovieSlider } from "./_components/MovieSlider";
import { MovieCards } from "./_components/moviecards";
import { MoviePopular } from "./_components/moviepopular";
import { MovieTopRated } from "./_components/movietoprated";
import { LocalNowShowing } from "./_components/LocalNowShowing";

export default function Home() {
  return <div className="site-container home-page">
    <section className="featured-section" aria-label="Киноны сангаас онцлох"><MovieSlider /></section>
    <LocalNowShowing />
    <div className="home-library"><MoviePopular /><MovieCards /><MovieTopRated /></div>
  </div>;
}
