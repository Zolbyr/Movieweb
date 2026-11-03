const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');

const filename = path.resolve(__dirname, '../lib/reviews.ts');
const source = new Module(filename, module);
source._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, filename);
const { reviewText, reviewSource, reviewScore } = source.exports;

test('Review excerpts preserve readable author text without HTML or Markdown embeds', () => {
  assert.equal(reviewText('**Great film**\n\n[Full review](https://example.com) ![poster](https://example.com/a.jpg)<b>Worth watching.</b>'), 'Great film Full review Worth watching.');
  assert.equal(reviewText('  Монгол сэтгэгдэл.\n\n Дараагийн өгүүлбэр. '), 'Монгол сэтгэгдэл. Дараагийн өгүүлбэр.');
});

test('Review attribution only opens TMDB review pages', () => {
  assert.equal(reviewSource('https://www.themoviedb.org/review/abc'), 'https://www.themoviedb.org/review/abc');
  for (const url of ['javascript:alert(1)', 'https://themoviedb.org.evil.example/review/abc', 'http://www.themoviedb.org/review/abc', 'https://www.themoviedb.org/movie/1', '/review/abc']) assert.equal(reviewSource(url), null);
});

test('Missing ratings remain absent while zero is a valid viewer rating', () => {
  assert.equal(reviewScore(0), 0);
  assert.equal(reviewScore(10), 10);
  for (const value of [null, undefined, NaN, Infinity, -1, 11, '8']) assert.equal(reviewScore(value), null);
});
