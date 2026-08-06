/**
 * Movie details page — a fuller example of a standalone Angular component:
 * route-param input, signal-based state, the modern `@if`/`@for`/`@switch`
 * template control-flow syntax (Angular 17+, replacing the older
 * `*ngIf`/`*ngFor`/`*ngSwitch` structural directives), and composing
 * multiple injected services.
 *
 * Because app.config.ts enables `withComponentInputBinding()`, the `:id`
 * route parameter from app.routes.ts (`movie/:id`) is bound straight to
 * the `id` input below — no manual `ActivatedRoute.paramMap.subscribe(...)`
 * needed just to read a route param.
 */
import { Component, OnInit, signal, input } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { TmdbService } from '@core/services/tmdb.service';
import { WatchlistService } from '@core/services/watchlist.service';
import { FavoritesService } from '@core/services/favorites.service';
import { ToastService } from '@core/services/toast.service';
import {
  TmdbMovieDetails,
  TmdbMedia,
  WatchStatus,
  WATCH_STATUS_LABELS,
} from '@core/models/movie.model';
import { MovieCardComponent } from '@shared/components/movie-card/movie-card.component';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';
import { IconComponent } from '@shared/components/icon/icon.component';

type DetailsTab = 'overview' | 'cast' | 'reviews' | 'similar';

@Component({
  selector: 'app-movie-details',
  standalone: true,
  // Every template symbol used below (app-icon, app-movie-card, ngModel...)
  // has to be explicitly imported here — standalone components declare
  // their own dependencies instead of inheriting a shared NgModule's.
  imports: [FormsModule, MovieCardComponent, EmptyStateComponent, IconComponent],
  template: `
    <!--
      @if (movie(); as m) — evaluates the movie() signal once and aliases
      the result to template variable "m" for the rest of this block, so
      the loading spinner in @else only shows while movie() is still null,
      and every {{ m.xxx }} below doesn't have to call movie() repeatedly.
    -->
    @if (movie(); as m) {
      <div class="animate-fade-in">
        <!-- Ambient backdrop wash -->
        @if (m.backdrop_path) {
          <div class="absolute inset-x-0 top-0 h-[420px] pointer-events-none overflow-hidden">
            <img
              [src]="tmdb.backdropUrl(m.backdrop_path)"
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
            <!-- Poster -->
            <img
              [src]="tmdb.posterUrl(m.poster_path, 'w500')"
              [alt]="m.title"
              class="w-40 sm:w-52 lg:w-[220px] shrink-0 rounded-xl object-cover
                     ring-1 ring-hairline shadow-pop self-start"
            />

            <!-- Meta -->
            <div class="flex-1 min-w-0">
              <h1
                class="font-display font-extrabold tracking-tight text-text-primary
                       text-2xl sm:text-3xl lg:text-4xl"
              >
                {{ m.title }}
              </h1>

              <p class="mt-2 text-[13px] text-text-secondary">
                {{ getYear(m.release_date) }}
                <span class="mx-1.5 text-text-muted">·</span>
                {{ formatRuntime(m.runtime) }}
                @if (m.status) {
                  <span class="mx-1.5 text-text-muted">·</span>
                  {{ m.status }}
                }
              </p>

              <!-- Rating -->
              <div class="mt-3 flex items-center gap-3">
                <span class="inline-flex items-center gap-1.5">
                  <app-icon name="star" class="w-[18px] h-[18px] text-primary" />
                  <span class="font-bold text-text-primary">{{ m.vote_average.toFixed(1) }}</span>
                </span>
                <span class="badge-neutral">
                  <app-icon name="users" class="w-3 h-3" />
                  {{ formatVoteCount(m.vote_count) }}
                </span>
              </div>

              <!-- Actions -->
              <div class="mt-5 flex flex-wrap items-center gap-3">
                @if (trailerKey()) {
                  <a
                    [href]="'https://www.youtube.com/watch?v=' + trailerKey()"
                    target="_blank"
                    rel="noopener"
                    class="btn-primary"
                  >
                    <app-icon name="play" class="w-4 h-4" />
                    Play
                  </a>
                }
                <!--
                  A <select> used as an action menu rather than a plain form
                  field: [ngModel]="null" always resets it to the placeholder
                  option after each pick, and (ngModelChange) fires
                  addToWatchlist() with whichever WatchStatus was chosen —
                  see the class below for what happens with that value.
                -->
                <div class="relative">
                  <select
                    [ngModel]="null"
                    (ngModelChange)="addToWatchlist($event)"
                    aria-label="Add to watchlist with status"
                    class="btn-outline appearance-none pr-9 cursor-pointer"
                  >
                    <option [ngValue]="null" disabled>+ Watchlist</option>
                    @for (status of watchStatuses; track status) {
                      <option [ngValue]="status">{{ statusLabels[status] }}</option>
                    }
                  </select>
                  <app-icon
                    name="chevron-down"
                    class="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  />
                </div>
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

              @if (m.overview) {
                <p class="mt-6 text-sm leading-relaxed text-text-secondary max-w-2xl">
                  {{ m.overview }}
                </p>
              }

              <!-- Credits table -->
              <dl class="mt-6 space-y-2.5 max-w-2xl">
                @if (getDirector()) {
                  <div class="flex gap-4 sm:gap-8">
                    <dt class="w-16 sm:w-20 shrink-0 text-[13px] text-text-muted">Director</dt>
                    <dd class="text-[13px] text-text-primary">{{ getDirector() }}</dd>
                  </div>
                }
                @if (m.credits?.cast?.length) {
                  <div class="flex gap-4 sm:gap-8">
                    <dt class="w-16 sm:w-20 shrink-0 text-[13px] text-text-muted">Cast</dt>
                    <dd class="text-[13px] text-text-primary">{{ getTopCastNames() }}</dd>
                  </div>
                }
                @if (m.genres.length) {
                  <div class="flex gap-4 sm:gap-8">
                    <dt class="w-16 sm:w-20 shrink-0 text-[13px] text-text-muted">Genre</dt>
                    <dd class="text-[13px] text-text-primary">{{ getGenreNames() }}</dd>
                  </div>
                }
              </dl>

              <!-- Tabs -->
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

          <!--
            @switch/@case — Angular's control-flow equivalent of a JS
            switch statement, used here to render exactly one tab panel
            based on the activeTab() signal instead of four separate @if
            blocks that would each need their own negated conditions.
          -->
          <div class="mt-7 pb-10">
            @switch (activeTab()) {
              @case ('overview') {
                @if (m.tagline) {
                  <p class="text-primary italic text-base sm:text-lg mb-5">"{{ m.tagline }}"</p>
                }
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  @if (m.budget) {
                    <div class="card p-4">
                      <p class="text-xs text-text-muted">Budget</p>
                      <p class="mt-1.5 text-lg font-bold font-display text-text-primary">
                        \${{ formatMoney(m.budget) }}
                      </p>
                    </div>
                  }
                  @if (m.revenue) {
                    <div class="card p-4">
                      <p class="text-xs text-text-muted">Revenue</p>
                      <p class="mt-1.5 text-lg font-bold font-display text-text-primary">
                        \${{ formatMoney(m.revenue) }}
                      </p>
                    </div>
                  }
                  <div class="card p-4">
                    <p class="text-xs text-text-muted">Runtime</p>
                    <p class="mt-1.5 text-lg font-bold font-display text-text-primary">
                      {{ formatRuntime(m.runtime) }}
                    </p>
                  </div>
                  <div class="card p-4">
                    <p class="text-xs text-text-muted">Rating</p>
                    <p class="mt-1.5 text-lg font-bold font-display text-primary">
                      {{ m.vote_average.toFixed(1) }}/10
                    </p>
                  </div>
                </div>
              }

              @case ('cast') {
                <div class="grid gap-5 grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9">
                  @for (member of m.credits?.cast?.slice(0, 18) ?? []; track member.id) {
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
                  message="Reviews appear here once you write about this title in your Journal."
                />
              }

              @case ('similar') {
                @if (m.recommendations?.results?.length) {
                  <div class="poster-grid">
                    @for (rec of m.recommendations!.results.slice(0, 12); track rec.id) {
                      <app-movie-card [media]="withType(rec, 'movie')" />
                    }
                  </div>
                } @else {
                  <app-empty-state
                    icon="compass"
                    title="No similar titles"
                    message="We couldn't find related recommendations for this movie."
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
export class MovieDetailsComponent implements OnInit {
  // input.required<string>() declares a signal-based component input that
  // *must* be supplied — here it's populated automatically from the route's
  // `:id` segment (thanks to withComponentInputBinding() in app.config.ts),
  // not passed down from a parent component template the way inputs
  // normally are.
  id = input.required<string>();

  // Local component state, all as signals — movie() starts null (nothing
  // fetched yet), which is exactly what the @if/@else in the template
  // switches on to show a spinner vs. the real content.
  movie = signal<TmdbMovieDetails | null>(null);
  trailerKey = signal('');
  activeTab = signal<DetailsTab>('overview');

  detailTabs = [
    { key: 'overview' as DetailsTab, label: 'Overview' },
    { key: 'cast' as DetailsTab, label: 'Cast' },
    { key: 'reviews' as DetailsTab, label: 'Reviews' },
    { key: 'similar' as DetailsTab, label: 'Similar' },
  ];

  watchStatuses: WatchStatus[] = ['plan_to_watch', 'watching', 'completed', 'dropped'];
  statusLabels = WATCH_STATUS_LABELS;

  // Four separate services injected via the constructor — each handles one
  // concern (TMDb reads, watchlist writes, favorites writes, toasts) and
  // none of them know about each other; this component is what composes
  // them together for this one page.
  constructor(
    public tmdb: TmdbService,
    private watchlistService: WatchlistService,
    private favoritesService: FavoritesService,
    private toast: ToastService,
  ) {}

  // Data fetching happens in ngOnInit, not the constructor — by this point
  // Angular guarantees `id` (the route-bound input) has already been set.
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

  goBack(): void {
    history.back();
  }

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
    return cast
      .slice(0, 3)
      .map((c) => c.name)
      .join(', ');
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

  addToWatchlist(status: WatchStatus | null): void {
    const m = this.movie();
    if (!m || !status) return;
    this.watchlistService.add({ tmdbId: m.id, mediaType: 'movie', status }).subscribe({
      next: () => this.toast.success(`Added to watchlist as "${this.statusLabels[status]}"`),
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
