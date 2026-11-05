const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const ts = require("typescript");

// Load the pure TypeScript adapters without starting Next or contacting cinemas.
function loadSource(file, dependencies = {}) {
  const filename = path.resolve(__dirname, "..", file);
  const source = new Module(filename, module);
  source.filename = filename;
  source.paths = Module._nodeModulePaths(path.dirname(filename));
  const originalRequire = source.require.bind(source);
  source.require = (name) => dependencies[name] || originalRequire(name);
  source._compile(ts.transpileModule(fs.readFileSync(filename, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText, filename);
  return source.exports;
}

const geo = loadSource("lib/cinemas.ts");
const dates = loadSource("lib/movie-dates.ts");
const { parseTengis, parseUrgoo, parsePrime } = loadSource("lib/local-listings.ts", { "./cinemas": geo, "./movie-dates": dates });
const { findLocalShowings } = loadSource("lib/local-showings.ts", { "./cinemas": geo });
const today = "2026-10-30";

test("Tengis lists only the requested Mongolia date and strips upstream private fields", () => {
  const movie = { id: "1", title: "Өнөөдрийн кино", slug: "today", status: "ENABLED", verticalPosterUrl: "/poster.jpg", rating: "PG13", theatres: [{ vistaApiKey: "private-upstream-field" }] };
  const data = { props: { pageProps: { repo: { ongoings: [{ day: "2026-10-29", movies: [{ ...movie, title: "Өчигдөр" }] }, { day: today, movies: [movie, { ...movie, id: "2", status: "DISABLED" }] }] } } } };
  const html = '<script id="__NEXT_DATA__" type="application/json">' + JSON.stringify(data) + "</script>";
  const result = parseTengis(html, today);
  assert.equal(result.length, 1);
  assert.equal(result[0].title, movie.title);
  assert.equal(result[0].poster, "https://www.tengis.mn/poster.jpg");
  assert(!JSON.stringify(result).includes("private-upstream-field"));
  assert.deepEqual(parseTengis(html, "2026-10-31"), []);
});

test("Urgoo excludes upcoming films and extracts an actual portrait", () => {
  const card = '<a href="/movies/HO1"><img alt="" src="data:image/webp;base64,x"><img alt="Одоо" src="https://media.urgoo.oneline.mn/cdn-cgi/image/width=640/films/HO1/portrait-poster.webp"><span>PG13</span></a>';
  const html = '<div id="now-showing">' + card + card + '</div><div id="coming-soon"><a href="/movies/HO2"><img alt="Удахгүй" src="https://media.urgoo.oneline.mn/films/HO2/portrait-next.webp"></a></div>';
  const result = parseUrgoo(html);
  assert.equal(result.length, 1);
  assert.equal(result[0].title, "Одоо");
  assert.equal(result[0].poster, "https://media.urgoo.oneline.mn/films/HO1/portrait-poster.webp");
  assert.equal(result[0].url, "https://new.urgoo.mn/movies/HO1");
});

test("Cinema opening dates preserve Mongolia's calendar day and reject invalid dates", () => {
  assert.equal(dates.cinemaOpeningDate("2026-10-29T16:00:00.000Z"), "2026-10-30");
  assert.equal(dates.cinemaOpeningDate("2026-10-30T00:00:00+08:00"), "2026-10-30");
  assert.equal(dates.cinemaOpeningDate("2026-10-30"), "2026-10-30");
  assert.equal(dates.validMovieDate("2024-02-29"), "2024-02-29");
  for (const value of ["2026-02-29", "2026-04-31", "2026-13-01", "yesterday", "", null, 0]) {
    assert.equal(dates.cinemaOpeningDate(value), undefined);
    assert.equal(dates.validMovieDate(value), null);
  }
  assert.equal(dates.cinemaOpeningDate("2026-10-30T00:00:00"), undefined, "Do not guess the source timezone");
});

test("Tengis opening dates come from release metadata, not the listing's update time", () => {
  const movie = { id: "1", title: "Кино", slug: "film", status: "ENABLED", nationalOpenDate: "2026-10-29T16:00:00Z", updatedAt: "2026-10-30T20:00:00Z" };
  const html = (value) => '<script id="__NEXT_DATA__">' + JSON.stringify({ props: { pageProps: { repo: { ongoings: [{ day: today, movies: [value] }] } } } }) + '</script>';
  assert.equal(parseTengis(html(movie), today)[0].releaseDate, "2026-10-30");
  assert.equal(parseTengis(html({ ...movie, nationalOpenDate: null }), today)[0].releaseDate, undefined);
});

test("Movie showings match exact titles and aliases only in available current listings", () => {
  const film = { id: "prime-1", provider: "prime", title: "Godzilla: Minus Zero IMAX", url: "https://www.primecineplex.mn/", poster: null };
  const listing = { provider: "prime", available: true, date: today, movies: [film] };
  assert.equal(findLocalShowings(["Godzilla Minus Zero"], [listing], today).length, 1);
  assert.equal(findLocalShowings(["Монгол нэр", "Godzilla: Minus Zero"], [listing], today).length, 1);
  assert.equal(findLocalShowings(["Godzilla"], [listing], today).length, 0, "Partial names must not match another film");
  assert.equal(findLocalShowings([film.title], [{ ...listing, available: false }], today).length, 0);
  assert.equal(findLocalShowings([film.title], [{ ...listing, date: "2026-10-29" }], today).length, 0);
  assert.equal(findLocalShowings(["", "!!!"], [listing], today).length, 0);
});

test("Latest Mongolia cinema release excludes future, digital, and other-country dates", () => {
  const release = (release_date, type = 3) => ({ release_date, type });
  const data = { results: [
    { iso_3166_1: "MN", release_dates: [release("2026-09-01T00:00:00Z"), release("2026-10-15T00:00:00Z", 2), release("2026-10-25T00:00:00Z", 4), release("2026-12-01T00:00:00Z"), release("bad-date")] },
    { iso_3166_1: "US", release_dates: [release("2026-10-29T00:00:00Z")] },
  ] };
  assert.equal(dates.latestMongoliaTheatricalDate(data, today), "2026-10-15");
  assert.equal(dates.latestMongoliaTheatricalDate(data, "2026-08-01"), undefined);
  assert.equal(dates.latestMongoliaTheatricalDate(undefined, today), undefined);
});

test("Cinema adapters reject changed markup instead of fabricating listings", () => {
  assert.throws(() => parseUrgoo("<p>Maintenance</p>"));
  assert.throws(() => parsePrime("<p>Maintenance</p>"));
  assert.throws(() => parseTengis("<p>Maintenance</p>"));
});

test("Prime requires today's bookable sessions and deduplicates film formats", () => {
  const card = (id, date) => '<div class="itemsContainer-sam"><div class="col-7">Кино ' + id + '</div><div class="col-5">2D / PG13</div><a href="/Home/GetMovieDetails?EventID=' + id + '"><img src="https://thumbnail.primecineplex.mn/poster.jpg"></a><a href="/ShoppingCart/Index?ShowDate=' + encodeURIComponent(date) + '">20:00</a></div>';
  const html = '<div id="tab_1">' + card("1", "10/30/2026 8:00:00 PM") + card("1", "10/30/2026 9:00:00 PM") + card("2", "10/31/2026 8:00:00 PM") + '</div><div id="tab_2">' + card("3", "10/30/2026 8:00:00 PM") + "</div>";
  const result = parsePrime(html, today);
  assert.equal(result.length, 1);
  assert.equal(result[0].title, "Кино 1");
});

test("External poster hosts are excluded from scraped listings", () => {
  const data = { props: { pageProps: { repo: { ongoings: [{ day: today, movies: [{ id: 1, title: "Кино", slug: "film", status: "ENABLED", verticalPosterUrl: "https://untrusted.example/image.jpg" }] }] } } } };
  const result = parseTengis('<script id="__NEXT_DATA__">' + JSON.stringify(data) + "</script>", today);
  assert.equal(result[0].poster, null);
});

test("Distances rank Tengis correctly and remain plausible between cities", () => {
  const here = { latitude: 47.9228, longitude: 106.9045 };
  const sorted = [...geo.cinemas].sort((a, b) => geo.distanceKm(here, a) - geo.distanceKm(here, b));
  assert.equal(sorted[0].id, "tengis-1");
  assert(geo.distanceKm(here, sorted[0]) < 0.01);
  const darkhan = geo.cinemas.find((cinema) => cinema.id === "urgoo-6");
  assert(geo.distanceKm(here, darkhan) > 170 && geo.distanceKm(here, darkhan) < 200);
  assert.equal(geo.distanceKm(here, here), 0);
});

test("Local dates cross midnight in Mongolia regardless of the server timezone", () => {
  assert.equal(geo.mongoliaDate(new Date("2026-10-30T15:59:00Z")), "2026-10-30");
  assert.equal(geo.mongoliaDate(new Date("2026-10-30T16:01:00Z")), "2026-10-31");
  assert.equal(geo.cinemaDateLabel("2026-10-30T16:01:00Z"), "10-р сарын 31, бямба гараг");
});

test("Cinema records have unique IDs, valid Mongolia coordinates, and usable directions", () => {
  assert.equal(new Set(geo.cinemas.map((cinema) => cinema.id)).size, geo.cinemas.length);
  for (const cinema of geo.cinemas) {
    assert(cinema.latitude > 41 && cinema.latitude < 53);
    assert(cinema.longitude > 87 && cinema.longitude < 120);
    assert.equal(new URL(cinema.sourceUrl).protocol, "https:");
    const url = new URL(geo.directionsUrl(cinema));
    assert.equal(url.searchParams.get("destination"), cinema.latitude + "," + cinema.longitude);
  }
});
