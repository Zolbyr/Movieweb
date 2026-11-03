export type Movie = {
  id: number;
  title: string;
  overview?: string;
  poster_path: string | null;
  backdrop_path?: string | null;
  vote_average: number;
  release_date?: string;
};

// Match the shared two-, three-, and six-column poster grids.
export const posterSizes = "(max-width: 640px) 46vw, (max-width: 1150px) 30vw, 200px";

export type MovieResults = {
  results: Movie[];
  total_pages: number;
  total_results: number;
};

export type MovieDetail = Movie & {
  runtime: number | null;
  vote_count: number;
  genres: { id: number; name: string }[];
  credits?: {
    crew: { job: string; name: string }[];
    cast: { id: number; name: string }[];
  };
  videos?: { results: { type: string; site: string; key: string }[] };
  similar?: MovieResults;
};

export const genres = [
  { id: 28, name: "Action", slug: "action" },
  { id: 12, name: "Adventure", slug: "adventure" },
  { id: 16, name: "Animation", slug: "animation" },
  { id: 35, name: "Comedy", slug: "comedy" },
  { id: 80, name: "Crime", slug: "crime" },
  { id: 99, name: "Documentary", slug: "documentary" },
  { id: 18, name: "Drama", slug: "drama" },
  { id: 10751, name: "Family", slug: "family" },
  { id: 14, name: "Fantasy", slug: "fantasy" },
  { id: 36, name: "History", slug: "history" },
  { id: 27, name: "Horror", slug: "horror" },
  { id: 10402, name: "Music", slug: "music" },
  { id: 9648, name: "Mystery", slug: "mystery" },
  { id: 10749, name: "Romance", slug: "romance" },
  { id: 878, name: "Science Fiction", slug: "sci-fi" },
  { id: 10770, name: "TV Movie", slug: "tv-movie" },
  { id: 53, name: "Thriller", slug: "thriller" },
  { id: 10752, name: "War", slug: "war" },
  { id: 37, name: "Western", slug: "western" },
];

export const categories = {
  upcoming: { title: "Удахгүй гарах", eyebrow: "Киноны сан", description: "Олон улсад удахгүй нээлтээ хийх кинонууд.", endpoint: "movie/upcoming" },
  popular: { title: "Эрэлттэй кинонууд", eyebrow: "Киноны сан", description: "TMDB-д эрэлттэй байгаа кинонууд.", endpoint: "movie/popular" },
  "top-rated": { title: "Өндөр үнэлгээтэй", eyebrow: "Киноны сан", description: "TMDB-ийн хэрэглэгчдээс өндөр үнэлгээ авсан кинонууд.", endpoint: "movie/top_rated" },
} as const;

export const genreLabels: Record<string, string> = {
  action: "Тулаант", adventure: "Адал явдалт", animation: "Хүүхэлдэйн", comedy: "Инээдмийн", crime: "Гэмт хэргийн",
  documentary: "Баримтат", drama: "Драм", family: "Гэр бүлийн", fantasy: "Уран зөгнөлт", history: "Түүхэн",
  horror: "Аймшгийн", music: "Хөгжимт", mystery: "Нууцлаг", romance: "Хайр дурлалын", "sci-fi": "Шинжлэх ухааны уран зөгнөлт",
  "tv-movie": "Телевизийн", thriller: "Түгшүүрт", war: "Дайны", western: "Вестерн",
};

export function imageUrl(path: string | null | undefined, size = "w500") {
  return path ? `https://image.tmdb.org/t/p/${size}${path}` : null;
}

export function rating(value: number | undefined) {
  return typeof value === "number" && Number.isFinite(value) ? value.toFixed(1) : "—";
}
