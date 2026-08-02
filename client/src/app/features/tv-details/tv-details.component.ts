import { Component, OnInit, signal, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { TmdbService } from '@core/services/tmdb.service';
import { WatchlistService } from '@core/services/watchlist.service';
import { FavoritesService } from '@core/services/favorites.service';
import { ToastService } from '@core/services/toast.service';
import { TmdbTvDetails, TmdbMedia } from '@core/models/movie.model';
import { MovieCardComponent } from '@shared/components/movie-card/movie-card.component';

type DetailsTab = 'overview' | 'cast' | 'reviews' | 'similar';

@Component({
  selector: 'app-tv-details',
  standalone: true,
  imports: [RouterLink, MovieCardComponent],
  template: `
    @if (show(); as s) {
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
              <img [src]="tmdb.posterUrl(s.poster_path, 'w500')" [alt]="s.name"
                class="w-64 rounded-2xl shadow-2xl shadow-black/40 border border-surface-elevated/30" />
            </div>

            <div class="flex-1">
              <h1 class="text-3xl lg:text-4xl font-bold text-text-primary mb-2">{{ s.name }}</h1>
              <div class="flex flex-wrap items-center gap-2 text-sm text-text-muted mb-4">
                <span>{{ getYear(s.first_air_date) }}</span>
                <span>·</span>
                <span>{{ s.number_of_seasons }} Season{{ s.number_of_seasons > 1 ? 's' : '' }}</span>
                <span>·</span>
                <span>{{ s.number_of_episodes }} Episodes</span>
              </div>

              <div class="flex items-center gap-3 mb-5">
                <div class="flex items-center gap-1.5">
                  <svg class="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                  <span class="font-bold text-text-primary">{{ s.vote_average.toFixed(1) }}</span>
                </div>
                <div class="flex items-center gap-1 text-text-muted">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                  <span class="text-sm">{{ formatVoteCount(s.vote_count) }}</span>
                </div>
              </div>

              <div class="flex items-center gap-3 mb-6">
                <button (click)="addToWatchlist()" class="btn-primary !py-2.5 flex items-center gap-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                  </svg>
                  Watchlist
                </button>
                <button (click)="addToFavorites()" class="btn-outline !py-2.5 flex items-center gap-2">
                  ❤️ Favorite
                </button>
              </div>

              <p class="text-text-secondary leading-relaxed mb-6">{{ s.overview }}</p>

              <div class="space-y-3 mb-6">
                @if (s.created_by?.length) {
                  <div class="flex gap-8">
                    <span class="text-sm text-text-muted w-20 flex-shrink-0">Creator</span>
                    <span class="text-sm text-text-primary">{{ creatorNames(s) }}</span>
                  </div>
                }
                @if (s.credits?.cast?.length) {
                  <div class="flex gap-8">
                    <span class="text-sm text-text-muted w-20 flex-shrink-0">Cast</span>
                    <span class="text-sm text-text-primary">{{ topCastNames(s) }}</span>
                  </div>
                }
                @if (s.genres?.length) {
                  <div class="flex gap-8">
                    <span class="text-sm text-text-muted w-20 flex-shrink-0">Genre</span>
                    <span class="text-sm text-text-primary">{{ genreNames(s) }}</span>
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
                @if (show()!.tagline) {
                  <p class="text-primary italic text-lg mb-4">"{{ show()!.tagline }}"</p>
                }
                <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div class="card p-4">
                    <p class="text-xs text-text-muted mb-1">Seasons</p>
                    <p class="text-lg font-bold text-text-primary">{{ show()!.number_of_seasons }}</p>
                  </div>
                  <div class="card p-4">
                    <p class="text-xs text-text-muted mb-1">Episodes</p>
                    <p class="text-lg font-bold text-text-primary">{{ show()!.number_of_episodes }}</p>
                  </div>
                  <div class="card p-4">
                    <p class="text-xs text-text-muted mb-1">Status</p>
                    <p class="text-lg font-bold text-text-primary">{{ show()!.status }}</p>
                  </div>
                </div>
              }
              @case ('cast') {
                <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  @for (member of show()!.credits?.cast?.slice(0, 18) ?? []; track member.id) {
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
                @if (show()!.recommendations?.results?.length) {
                  <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    @for (rec of show()!.recommendations!.results.slice(0, 12); track rec.id) {
                      <app-movie-card [media]="withType(rec, 'tv')" />
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
export class TvDetailsComponent implements OnInit {
  id = input.required<string>();
  show = signal<TmdbTvDetails | null>(null);
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
    this.tmdb.getTv(Number(this.id())).subscribe({
      next: (show) => this.show.set(show),
    });
  }

  goBack(): void { history.back(); }

  getYear(date: string | undefined): string {
    return date ? date.substring(0, 4) : '—';
  }

  creatorNames(s: TmdbTvDetails): string {
    return s.created_by?.map((c) => c.name).join(', ') ?? '';
  }

  topCastNames(s: TmdbTvDetails): string {
    return s.credits?.cast?.slice(0, 3).map((c) => c.name).join(', ') ?? '';
  }

  genreNames(s: TmdbTvDetails): string {
    return s.genres?.map((g) => g.name).join(', ') ?? '';
  }

  formatVoteCount(count: number): string {
    if (count >= 1000) return (count / 1000).toFixed(0) + 'K';
    return String(count);
  }

  addToWatchlist(): void {
    const s = this.show();
    if (!s) return;
    this.watchlistService.add({ tmdbId: s.id, mediaType: 'tv' }).subscribe({
      next: () => this.toast.success('Added to watchlist!'),
      error: (err) => this.toast.error(err.error?.error?.message || 'Failed'),
    });
  }

  addToFavorites(): void {
    const s = this.show();
    if (!s) return;
    this.favoritesService.add(s.id, 'tv').subscribe({
      next: () => this.toast.success('Added to favorites!'),
      error: (err) => this.toast.error(err.error?.error?.message || 'Failed'),
    });
  }

  withType(media: TmdbMedia, type: 'movie' | 'tv'): TmdbMedia {
    return { ...media, media_type: type };
  }
}
