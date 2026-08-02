import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';

import { ApiService } from './api.service';
import {
  TmdbMedia,
  TmdbMovieDetails,
  TmdbTvDetails,
  TmdbSearchResults,
} from '../models/movie.model';
import { environment } from '@env/environment';

@Injectable({ providedIn: 'root' })
export class TmdbService {
  constructor(private api: ApiService) {}

  search(query: string, page = 1): Observable<TmdbSearchResults> {
    return this.api
      .get<TmdbSearchResults>('/tmdb/search', { query, page })
      .pipe(map((res) => res.data));
  }

  getMovie(id: number): Observable<TmdbMovieDetails> {
    return this.api
      .get<TmdbMovieDetails>(`/tmdb/movie/${id}`)
      .pipe(map((res) => res.data));
  }

  getTv(id: number): Observable<TmdbTvDetails> {
    return this.api
      .get<TmdbTvDetails>(`/tmdb/tv/${id}`)
      .pipe(map((res) => res.data));
  }

  getTrending(
    mediaType: 'all' | 'movie' | 'tv' = 'all',
    timeWindow: 'day' | 'week' = 'week',
    page = 1,
  ): Observable<TmdbSearchResults> {
    return this.api
      .get<TmdbSearchResults>('/tmdb/trending', { mediaType, timeWindow, page })
      .pipe(map((res) => res.data));
  }

  discoverMovies(page = 1, sortBy?: string): Observable<TmdbSearchResults> {
    const params: Record<string, string | number> = { page };
    if (sortBy) params['sortBy'] = sortBy;
    return this.api
      .get<TmdbSearchResults>('/tmdb/discover/movie', params)
      .pipe(map((res) => res.data));
  }

  discoverTv(page = 1, sortBy?: string): Observable<TmdbSearchResults> {
    const params: Record<string, string | number> = { page };
    if (sortBy) params['sortBy'] = sortBy;
    return this.api
      .get<TmdbSearchResults>('/tmdb/discover/tv', params)
      .pipe(map((res) => res.data));
  }

  // Helper: build poster URL
  posterUrl(path: string | null, size: 'w185' | 'w342' | 'w500' | 'original' = 'w342'): string {
    if (!path) return 'assets/no-poster.svg';
    return `${environment.tmdbImageBase}/${size}${path}`;
  }

  // Helper: build backdrop URL
  backdropUrl(path: string | null, size: 'w780' | 'w1280' | 'original' = 'w1280'): string {
    if (!path) return '';
    return `${environment.tmdbImageBase}/${size}${path}`;
  }

  // Helper: get display title
  getTitle(media: TmdbMedia): string {
    return media.title || media.name || 'Unknown';
  }

  // Helper: get release year
  getYear(media: TmdbMedia): string {
    const date = media.release_date || media.first_air_date;
    return date ? date.substring(0, 4) : '—';
  }
}
