import { Component, OnInit, signal, input } from '@angular/core';
import { SlicePipe } from '@angular/common';
import { RouterLink } from '@angular/router';

import { TmdbService } from '@core/services/tmdb.service';
import { WatchlistService } from '@core/services/watchlist.service';
import { FavoritesService } from '@core/services/favorites.service';
import { ToastService } from '@core/services/toast.service';
import { TmdbMovieDetails, TmdbMedia } from '@core/models/movie.model';
import { MovieCardComponent } from '@shared/components/movie-card/movie-card.component';
import { RatingStarsComponent } from '@shared/components/rating-stars/rating-stars.component';
import { TruncatePipe } from '@shared/pipes/truncate.pipe';

type DetailsTab = 'overview' | 'cast' | 'reviews' | 'similar';

@Component({
  selector: 'app-movie-details',
  standalone: true,
  imports: [SlicePipe, RouterLink, MovieCardComponent, RatingStarsComponent, TruncatePipe],
  template: `
    @if (movie(); as m) {
      <div class="animate-fade-in">
        <div class="page-container">
          <button (click)="goBack()" class="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors mb-6">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
            <span class="text-sm">Back</span>
          </button>

          <div class="flex flex-col lg:flex-row gap-8">
            <div class="flex-shrink-0">
              <img
                [src]="tmdb.posterUrl(m.poster_path, 'w500')"
                [alt]="m.title"
                class="w-64 rounded-2xl shadow-2xl shadow-black/40 border border-surface-elevated/30"
              />
            </div>

            <div class="flex-1">
              <h1 class="text-3xl lg:text-4xl font-bold text-text-primary mb-2">{{ m.title }}</h1>

              <div class="flex flex-wrap items-center gap-2 text-sm text-text-muted mb-4">
                <span>{{ getYear(m.release_date) }}</span>
                <span>·</span>
                <span>{{ formatRuntime(m.runtime) }}</span>
                @if (m.status) {
                  <span>·</span>
                  <span>{{ m.status }}</span>
                }
              </div>

              <div class="flex items-center gap-3 mb-5">
                <div class="flex items-center gap-1.5">
                  <svg class="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                  <span class="font-bold text-text-primary">{{ m.vote_average.toFixed(1) }}</span>
                </div>
                <div class="flex items-center gap-1 text-text-muted">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                  <span class="text-sm">{{ formatVoteCount(m.vote_count) }}</span>
                </div>
              </div>

              <div class="flex items-center gap-3 mb-6">
                @if (trailerKey()) {
                  <a
                    [href]="'https://www.youtube.com/watch?v=' + trailerKey()"
                    target="_blank"
                    class="flex items-center gap-2 bg-surface-card border border-surface-elevated rounded-xl px-5 py-2.5 text-sm font-medium text-text-primary hover:border-primary/50 transition-all"
                  >
                    <svg class="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"/>
                    </svg>
                    Play
                  </a>
                }
                <button (click)="addToWatchlist()" class="btn-primary !py-2.5 flex items-center gap-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                  </svg>
                  Watchlist
                </button>
                <button
                  (click)="addToFavorites()"
                  class="w-10 h-10 rounded-xl bg-surface-card border border-surface-elevated flex items-center justify-center hover:border-primary/50 transition-all text-text-muted hover:text-primary"
                >
                  ❤️
                </button>
              </div>

              <p class="text-text-secondary leading-relaxed mb-6">{{ m.overview }}</p>

              <div class="space-y-3 mb-6">
                @if (getDirector()) {
                  <div class="flex gap-8">
                    <span class="text-sm text-text-muted w-20 flex-shrink-0">Director</span>
                    <span class="text-sm text-text-primary">{{ getDirector() }}</span>
                  </div>
                }
                @if (m.credits?.cast?.length) {
                  <div class="flex gap-8">
                    <span class="text-sm text-text-muted w-20 flex-shrink-0">Cast</span>
                    <span class="text-sm text-text-primary">{{ getTopCastNames() }}</span>
                  </div>
                }
                @if (m.genres?.length) {
                  <div class="flex gap-8">
                    <span class="text-sm text-text-muted w-20 flex-shrink-0">Genre</span>
                    <span class="text-sm text-text-primary">{{ getGenreNames() }}</span>
                  </div>
                }
              </div>

              <div class="border-b border-surface-elevated/50">
                <div class="flex gap-6">
                  @for (tab of detailTabs; track tab.key) {
                    <button
                      (click)="activeTab.set(tab.key)"
                      class="pb-3 text-sm font-medium transition-all border-b-2"
                      [class]="activeTab() === tab.key
                        ? 'text-text-primary border-primary'
                        : 'text-text-muted border-transparent hover:text-text-secondary'"
                    >
                      {{ tab.label }}
                    </button>
                  }
                </div>
              </div>
            </div>
          </div>

          <div class="mt-8 pb-10">
            @switch (activeTab()) {
              @case ('overview') {
                @if (movie()!.tagline) {
                  <p class="text-primary italic text-lg mb-4">"{{ movie()!.tagline }}"</p>
                }
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  @if (movie()!.budget) {
                    <div class="card p-4">
                      <p class="text-xs text-text-muted mb-1">Budget</p>
                      <p class="text-lg font-bold text-text-primary">\${{ formatMoney(movie()!.budget) }}</p>
                    </div>
                  }
                  @if (movie()!.revenue) {
                    <div class="card p-4">
                      <p class="text-xs text-text-muted mb-1">Revenue</p>
                      <p class="text-lg font-bold text-text-primary">\${{ formatMoney(movie()!.revenue) }}</p>
                    </div>
                  }
                  <div class="card p-4">
                    <p class="text-xs text-text-muted mb-1">Runtime</p>
                    <p class="text-lg font-bold text-text-primary">{{ formatRuntime(movie()!.runtime) }}</p>
                  </div>
                  <div class="card p-4">
                    <p class="text-xs text-text-muted mb-1">Rating</p>
                    <p class="text-lg font-bold text-primary">{{ movie()!.vote_average.toFixed(1) }}/10</p>
                  </div>
                </div>
              }
              @case ('cast') {
                <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  @for (member of movie()!.credits?.cast?.slice(0, 18) ?? []; track member.id) {
                    <div class="text-center">
                      <div class="w-20 h-20 rounded-full overflow-hidden mx-auto mb-2 bg-surface-card">
                        @if (member.profile_path) {
                          <img [src]="tmdb.posterUrl(member.profile_path, 'w185')" [alt]="member.name"
                            class="w-full h-full object-cover" loading="lazy" />
                        } @else {
                          <div class="w-full h-full flex items-center justify-center text-2xl text-text-muted">👤</div>
                        }
                      </div>
                      <p class="text-xs font-medium text-text-primary truncate">{{ member.name }}</p>
                      <p class="text-xs text-text-muted truncate">{{ member.character }}</p>
                    </div>
                  }
                </div>
              }
              @case ('reviews') {
                <div class="text-center py-12">
                  <p class="text-text-muted">Reviews will appear here when you add them via the Journal.</p>
                </div>
              }
              @case ('similar') {
                @if (movie()!.recommendations?.results?.length) {
                  <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    @for (rec of movie()!.recommendations!.results.slice(0, 12); track rec.id) {
                      <app-movie-card [media]="withType(rec, 'movie')" />
                    }
                  </div>
                } @else {
                  <p class="text-text-muted text-center py-12">No similar titles found.</p>
                }
              }
            }
          </div>
        </div>
      </div>
    } @else {
      <div class="page-container flex items-center justify-center min-h-[60vh]">
        <div class="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div>
      </div>
    }
  `,
})
export class MovieDetailsComponent implements OnInit {
  id = input.required<string>();

  movie = signal<TmdbMovieDetails | null>(null);
  trailerKey = signal('');
  activeTab = signal<DetailsTab>('overview');

  detailTabs = [
    { key: 'overview' as DetailsTab, label: 'Overview' },
    { key: 'cast' as DetailsTab, label: 'Cast' },
    { key: 'reviews' as DetailsTab, label: 'Reviews' },
    { key: 'similar' as DetailsTab, label: 'Similar' },
  ];

  constructor(
    public tmdb: TmdbService,
    private watchlistService: WatchlistService,
    private favoritesService: FavoritesService,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.tmdb.getMovie(Number(this.id())).subscribe({
      next: (movie) => {
        this.movie.set(movie);
        const trailer = movie.videos?.results?.find(
          (v) => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser'),
        );
        if (trailer) this.trailerKey.set(trailer.key);
      },
    });
  }

  goBack(): void { history.back(); }

  getYear(date: string | undefined): string {
    return date ? date.substring(0, 4) : '—';
  }

  getDirector(): string {
    const crew = this.movie()?.credits?.crew;
    if (!crew) return '';
    const dir = crew.find((c) => c.job === 'Director');
    return dir?.name ?? '';
  }

  getTopCastNames(): string {
    const cast = this.movie()?.credits?.cast;
    if (!cast) return '';
    return cast.slice(0, 3).map((c) => c.name).join(', ');
  }

  getGenreNames(): string {
    return this.movie()?.genres?.map((g) => g.name).join(', ') ?? '';
  }

  formatRuntime(minutes: number): string {
    if (!minutes) return '—';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  }

  formatVoteCount(count: number): string {
    if (count >= 1000) return (count / 1000).toFixed(0) + 'K';
    return String(count);
  }

  formatMoney(amount: number): string {
    if (amount >= 1e9) return (amount / 1e9).toFixed(1) + 'B';
    if (amount >= 1e6) return (amount / 1e6).toFixed(0) + 'M';
    return amount.toLocaleString();
  }

  addToWatchlist(): void {
    const m = this.movie();
    if (!m) return;
    this.watchlistService.add({ tmdbId: m.id, mediaType: 'movie' }).subscribe({
      next: () => this.toast.success('Added to watchlist!'),
      error: (err) => this.toast.error(err.error?.error?.message || 'Failed to add'),
    });
  }

  addToFavorites(): void {
    const m = this.movie();
    if (!m) return;
    this.favoritesService.add(m.id, 'movie').subscribe({
      next: () => this.toast.success('Added to favorites!'),
      error: (err) => this.toast.error(err.error?.error?.message || 'Failed to add'),
    });
  }

  withType(media: TmdbMedia, type: 'movie' | 'tv'): TmdbMedia {
    return { ...media, media_type: type };
  }
}