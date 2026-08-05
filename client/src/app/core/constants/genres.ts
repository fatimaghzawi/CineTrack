/**
 * Curated genre rows for the Movies / TV Shows browse pages.
 *
 * TMDb genre ids are stable public constants and the API exposes no genre-list
 * endpoint through our backend, so the list is kept here — one request saved per
 * page load, and the row order stays under our control.
 *
 * Movie and TV genres are *different* vocabularies: TV has no "Action" (28), it
 * has "Action & Adventure" (10759), and no "Sci-Fi" (878) but "Sci-Fi & Fantasy"
 * (10765).
 */
export interface GenreRow {
  id: number;
  name: string;
}

export const MOVIE_GENRE_ROWS: GenreRow[] = [
  { id: 28, name: 'Action' },
  { id: 35, name: 'Comedy' },
  { id: 27, name: 'Horror' },
  { id: 878, name: 'Science Fiction' },
  { id: 18, name: 'Drama' },
  { id: 16, name: 'Animation' },
  { id: 53, name: 'Thriller' },
];

export const TV_GENRE_ROWS: GenreRow[] = [
  { id: 10759, name: 'Action & Adventure' },
  { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' },
  { id: 18, name: 'Drama' },
  { id: 10765, name: 'Sci-Fi & Fantasy' },
  { id: 16, name: 'Animation' },
  { id: 9648, name: 'Mystery' },
];
