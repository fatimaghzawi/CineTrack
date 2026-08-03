import { Component, OnInit, signal, input } from '@angular/core';

import { TmdbService } from '@core/services/tmdb.service';
import { WatchlistService } from '@core/services/watchlist.service';
import { FavoritesService } from '@core/services/favorites.service';
import { ToastService } from '@core/services/toast.service';
import { TmdbTvDetails, TmdbMedia } from '@core/models/movie.model';
import { MovieCardComponent } from '@shared/components/movie-card/movie-card.component';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';
import { IconComponent } from '@shared/components/icon/icon.component';

type DetailsTab = 'overview' | 'cast' | 'reviews' | 'similar';

@Component({
  selector: 'app-tv-details',
  standalone: true,
  imports: [MovieCardComponent, EmptyStateComponent, IconComponent],
  template: `
    @if (show(); as s) {
      <div class="animate-fade-in">
        @if (s.backdrop_path) {
          <div class="absolute inset-x-0 top-0 h-[420px] pointer-events-none overflow-hidden">
            <img
              [src]="tmdb.backdropUrl(s.backdrop_path)"
              alt=""
              aria-hidden="true"
              class="w-full h-full object-cover opacity-[0.18]"
            />
            <div
              class="absolute inset-0 bg-gradient-to-b from-surface-deep/40 via-surface-deep/80 to-surface-deep"
            ></div>
          </div>
        }

        <div class="relative page-container">
          <button
            type="button"
            (click)="goBack()"
            class="btn-round -ml-2 mb-5 hover:bg-surface-card"
            aria-label="Go back"
          >
            <app-icon name="chevron-left" class="w-5 h-5" />
          </button>

          <div class="flex flex-col sm:flex-row gap-6 lg:gap-8">
            <img
              [src]="tmdb.posterUrl(s.poster_path, 'w500')"
              [alt]="s.name"
              class="w-40 sm:w-52 lg:w-[220px] shrink-0 rounded-xl object-cover
                     ring-1 ring-hairline shadow-pop self-start"
            />

            <div class="flex-1 min-w-0">
              <h1
                class="font-display font-extrabold tracking-tight text-text-primary
                       text-2xl sm:text-3xl lg:text-4xl"
              >
                {{ s.name }}
              </h1>

              <p class="mt-2 text-[13px] text-text-secondary">
                {{ getYear(s.first_air_date) }}
                <span class="mx-1.5 text-text-muted">·</span>
                {{ s.number_of_seasons }} Season{{ s.number_of_seasons > 1 ? 's' : '' }}
                <span class="mx-1.5 text-text-muted">·</span>
                {{ s.number_of_episodes }} Episodes
              </p>

              <div class="mt-3 flex items-center gap-3">
                <span class="inline-flex items-center gap-1.5">
                  <app-icon name="star" class="w-[18px] h-[18px] text-primary" />
                  <span class="font-bold text-text-primary">{{ s.vote_average.toFixed(1) }}</span>
                </span>
                <span class="badge-neutral">
                  <app-icon name="users" class="w-3 h-3" />
                  {{ formatVoteCount(s.vote_count) }}
                </span>
              </div>

              <div class="mt-5 flex flex-wrap items-center gap-3">
                <button type="button" (click)="addToWatchlist()" class="btn-primary">
                  <app-icon name="plus" class="w-4 h-4" />
                  Watchlist
                </button>
                <button
                  type="button"
                  (click)="addToFavorites()"
                  class="btn-icon"
                  aria-label="Add to favorites"
                  title="Add to favorites"
                >
                  <app-icon name="heart" class="w-[18px] h-[18px]" />
                </button>
              </div>

              @if (s.overview) {
                <p class="mt-6 text-sm leading-relaxed text-text-secondary max-w-2xl">
                  {{ s.overview }}
                </p>
              }

              <dl class="mt-6 space-y-2.5 max-w-2xl">
                @if (s.created_by.length) {
                  <div class="flex gap-4 sm:gap-8">
                    <dt class="w-16 sm:w-20 shrink-0 text-[13px] text-text-muted">Creator</dt>
                    <dd class="text-[13px] text-text-primary">{{ creatorNames(s) }}</dd>
                  </div>
                }
                @if (s.credits?.cast?.length) {
                  <div class="flex gap-4 sm:gap-8">
                    <dt class="w-16 sm:w-20 shrink-0 text-[13px] text-text-muted">Cast</dt>
                    <dd class="text-[13px] text-text-primary">{{ topCastNames(s) }}</dd>
                  </div>
                }
                @if (s.genres.length) {
                  <div class="flex gap-4 sm:gap-8">
                    <dt class="w-16 sm:w-20 shrink-0 text-[13px] text-text-muted">Genre</dt>
                    <dd class="text-[13px] text-text-primary">{{ genreNames(s) }}</dd>
                  </div>
                }
              </dl>

              <div class="mt-7 border-b border-hairline">
                <div class="flex gap-6 overflow-x-auto scrollbar-none">
                  @for (tab of detailTabs; track tab.key) {
                    <button
                      type="button"
                      (click)="activeTab.set(tab.key)"
                      class="tab"
                      [class.tab-active]="activeTab() === tab.key"
                    >
                      {{ tab.label }}
                    </button>
                  }
                </div>
              </div>
            </div>
          </div>

          <div class="mt-7 pb-10">
            @switch (activeTab()) {
              @case ('overview') {
                @if (s.tagline) {
                  <p class="text-primary italic text-base sm:text-lg mb-5">"{{ s.tagline }}"</p>
                }
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div class="card p-4">
                    <p class="text-xs text-text-muted">Seasons</p>
                    <p class="mt-1.5 text-lg font-bold font-display text-text-primary">
                      {{ s.number_of_seasons }}
                    </p>
                  </div>
                  <div class="card p-4">
                    <p class="text-xs text-text-muted">Episodes</p>
                    <p class="mt-1.5 text-lg font-bold font-display text-text-primary">
                      {{ s.number_of_episodes }}
                    </p>
                  </div>
                  <div class="card p-4">
                    <p class="text-xs text-text-muted">Status</p>
                    <p class="mt-1.5 text-lg font-bold font-display text-text-primary">
                      {{ s.status }}
                    </p>
                  </div>
                  <div class="card p-4">
                    <p class="text-xs text-text-muted">Rating</p>
                    <p class="mt-1.5 text-lg font-bold font-display text-primary">
                      {{ s.vote_average.toFixed(1) }}/10
                    </p>
                  </div>
                </div>
              }

              @case ('cast') {
                <div class="grid gap-5 grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9">
                  @for (member of s.credits?.cast?.slice(0, 18) ?? []; track member.id) {
                    <div class="text-center">
                      <div
                        class="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full overflow-hidden
                               bg-surface-card ring-1 ring-hairline"
                      >
                        @if (member.profile_path) {
                          <img
                            [src]="tmdb.posterUrl(member.profile_path, 'w185')"
                            [alt]="member.name"
                            class="w-full h-full object-cover"
                            loading="lazy"
                          />
                        } @else {
                          <span class="w-full h-full grid place-items-center text-text-muted">
                            <app-icon name="user" class="w-6 h-6" />
                          </span>
                        }
                      </div>
                      <p class="mt-2 text-xs font-semibold text-text-primary truncate">
                        {{ member.name }}
                      </p>
                      <p class="text-2xs text-text-muted truncate">{{ member.character }}</p>
                    </div>
                  }
                </div>
              }

              @case ('reviews') {
                <app-empty-state
                  icon="book"
                  title="No reviews yet"
                  message="Reviews appear here once you write about this show in your Journal."
                />
              }

              @case ('similar') {
                @if (s.recommendations?.results?.length) {
                  <div class="poster-grid">
                    @for (rec of s.recommendations!.results.slice(0, 12); track rec.id) {
                      <app-movie-card [media]="withType(rec, 'tv')" />
                    }
                  </div>
                } @else {
                  <app-empty-state
                    icon="compass"
                    title="No similar titles"
                    message="We couldn't find related recommendations for this show."
                  />
                }
              }
            }
          </div>
        </div>
      </div>
    } @else {
      <div class="page-container grid place-items-center min-h-[60vh]">
        <span
          class="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin"
          role="status"
          aria-label="Loading"
        ></span>
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

  goBack(): void {
    history.back();
  }

  getYear(date: string | undefined): string {
    return date ? date.substring(0, 4) : '—';
  }

  creatorNames(s: TmdbTvDetails): string {
    return s.created_by?.map((c) => c.name).join(', ') ?? '';
  }

  topCastNames(s: TmdbTvDetails): string {
    return (
      s.credits?.cast
        ?.slice(0, 3)
        .map((c) => c.name)
        .join(', ') ?? ''
    );
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
