import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { TmdbService } from '@core/services/tmdb.service';
import { AuthService } from '@core/services/auth.service';
import { TmdbMedia } from '@core/models/movie.model';
import { MovieCardComponent } from '@shared/components/movie-card/movie-card.component';
import { MediaTileComponent } from '@shared/components/media-tile/media-tile.component';
import { SectionHeaderComponent } from '@shared/components/section-header/section-header.component';
import { SkeletonLoaderComponent } from '@shared/components/skeleton-loader/skeleton-loader.component';
import { IconComponent } from '@shared/components/icon/icon.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    RouterLink,
    MovieCardComponent,
    MediaTileComponent,
    SectionHeaderComponent,
    SkeletonLoaderComponent,
    IconComponent,
  ],
  template: `
    <div class="animate-fade-in pb-10">
      <!-- ══ Hero ══════════════════════════════════════════════ -->
      <section class="relative">
        @if (heroMedia(); as hero) {
          <div class="relative h-[520px] sm:h-[500px] lg:h-[540px] overflow-hidden">
            <img
              [src]="tmdb.backdropUrl(hero.backdrop_path)"
              [alt]="tmdb.getTitle(hero)"
              class="absolute inset-0 w-full h-full object-cover object-center"
            />
            <!-- Scrims: left wash for copy, bottom fade into the page -->
            <div class="absolute inset-0 bg-hero-scrim"></div>
            <div
              class="absolute inset-x-0 bottom-0 h-40
                     bg-gradient-to-t from-surface-deep to-transparent"
            ></div>

            <div
              class="relative h-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8
                     flex flex-col justify-center"
            >
              <div class="max-w-xl">
                <h1
                  class="font-display font-extrabold tracking-tight leading-[0.95]
                         text-[44px] sm:text-6xl lg:text-[68px]"
                >
                  <span class="block text-text-primary">Track.</span>
                  <span class="block text-primary">Watch.</span>
                  <span class="block text-text-primary">Enjoy.</span>
                </h1>

                <p class="mt-5 text-sm sm:text-[15px] leading-relaxed text-text-secondary max-w-sm">
                  Your personal movie tracker. Keep track of what you've watched and what's next.
                </p>

                <div class="mt-7 flex flex-wrap items-center gap-3">
                  <a routerLink="/discover" class="btn-primary">
                    Start Exploring
                    <app-icon name="arrow-right" class="w-4 h-4" />
                  </a>
                  <a
                    routerLink="/watchlist"
                    class="btn-outline !border-white/25 hover:!border-primary"
                  >
                    My Watchlist
                  </a>
                </div>
              </div>
            </div>
          </div>
        } @else {
          <div class="h-[520px] sm:h-[500px] lg:h-[540px] skeleton !rounded-none"></div>
        }

        <!-- Stats strip + carousel controls, overlapping the hero -->
        <div class="relative z-10 -mt-24 sm:-mt-28 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex flex-wrap items-end justify-between gap-6">
            <dl class="flex items-center gap-5 sm:gap-8 flex-wrap">
              @for (stat of heroStats; track stat.label; let last = $last) {
                <div class="flex items-center gap-5 sm:gap-8">
                  <div>
                    <dt class="text-2xs sm:text-xs text-text-secondary">{{ stat.label }}</dt>
                    <dd
                      class="mt-1 font-display font-bold text-text-primary text-xl sm:text-2xl"
                    >
                      {{ stat.value }}
                    </dd>
                  </div>
                  @if (!last) {
                    <span class="hidden sm:block h-9 w-px bg-white/15"></span>
                  }
                </div>
              }
            </dl>

            <!-- Featured spotlight -->
            @if (heroMedia(); as hero) {
              <div class="flex items-center gap-4 ml-auto">
                <div class="text-right hidden sm:block">
                  <p class="text-sm font-semibold text-text-primary truncate max-w-[180px]">
                    {{ tmdb.getTitle(hero) }}
                  </p>
                  <p
                    class="mt-0.5 text-2xs text-primary inline-flex items-center gap-1.5 justify-end"
                  >
                    <app-icon name="play" class="w-3 h-3" />
                    Continue Watching
                  </p>
                </div>
                <a
                  [routerLink]="'/' + (hero.media_type || 'movie') + '/' + hero.id"
                  class="play-fab h-11 w-11"
                  [attr.aria-label]="'Open ' + tmdb.getTitle(hero)"
                >
                  <app-icon name="play" class="w-4 h-4 ml-0.5" />
                </a>
              </div>
            }
          </div>

          <!-- Carousel dots -->
          @if (heroPool().length > 1) {
            <div class="flex items-center gap-2 mt-6">
              @for (item of heroPool(); track item.id; let i = $index) {
                <button
                  type="button"
                  (click)="setHero(i)"
                  class="h-1.5 rounded-full transition-all duration-300 ease-smooth"
                  [class]="i === heroIndex() ? 'w-6 bg-primary' : 'w-1.5 bg-white/30 hover:bg-white/60'"
                  [attr.aria-label]="'Show featured title ' + (i + 1)"
                  [attr.aria-current]="i === heroIndex()"
                ></button>
              }
            </div>
          }
        </div>
      </section>

      <!-- ══ Continue Watching ═════════════════════════════════ -->
      <section class="page-container !pb-0">
        <div class="panel p-5 sm:p-6">
          <app-section-header title="Continue Watching" actionRoute="/watchlist" />

          @if (loadingTrending()) {
            <div class="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
              @for (i of [1, 2, 3, 4]; track i) {
                <app-skeleton height="150px" className="rounded-xl" />
              }
            </div>
          } @else if (continueWatching().length === 0) {
            <p class="py-8 text-center text-sm text-text-muted">
              Nothing in progress yet — start something from Explore.
            </p>
          } @else {
            <div class="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
              @for (item of continueWatching(); track item.id; let i = $index) {
                <app-media-tile
                  [media]="item"
                  [subtitle]="continueInfo[i]"
                  [progress]="progressValues[i]"
                  [remaining]="remainingTime[i]"
                />
              }
            </div>
          }
        </div>
      </section>

      <!-- ══ Trending rails ════════════════════════════════════ -->
      <div class="page-container space-y-8">
        <section>
          <app-section-header
            title="Trending Movies"
            actionLabel="See all"
            actionRoute="/discover"
            [actionParams]="{ tab: 'movies' }"
          />
          @if (loadingTrending()) {
            <div class="poster-grid">
              @for (i of skeletons; track i) {
                <app-skeleton className="aspect-[2/3] w-full" />
              }
            </div>
          } @else {
            <div class="poster-grid">
              @for (movie of trendingMovies(); track movie.id) {
                <app-movie-card [media]="movie" />
              }
            </div>
          }
        </section>

        <section>
          <app-section-header
            title="Trending TV Shows"
            actionLabel="See all"
            actionRoute="/discover"
            [actionParams]="{ tab: 'tv' }"
          />
          @if (loadingTrending()) {
            <div class="poster-grid">
              @for (i of skeletons; track i) {
                <app-skeleton className="aspect-[2/3] w-full" />
              }
            </div>
          } @else {
            <div class="poster-grid">
              @for (show of trendingTv(); track show.id) {
                <app-movie-card [media]="show" />
              }
            </div>
          }
        </section>
      </div>
    </div>
  `,
})
export class DashboardComponent implements OnInit, OnDestroy {
  trendingMovies = signal<TmdbMedia[]>([]);
  trendingTv = signal<TmdbMedia[]>([]);
  continueWatching = signal<TmdbMedia[]>([]);
  heroPool = signal<TmdbMedia[]>([]);
  heroIndex = signal(0);
  loadingTrending = signal(true);

  heroStats = [
    { label: 'Movies', value: '1,240' },
    { label: 'TV Shows', value: '320' },
    { label: 'Episodes', value: '12,568' },
    { label: 'Hours Watched', value: '8,450' },
  ];

  continueInfo = ['S3 · E1', 'S21 · E1002', 'S2 · E4', 'S1 · E8'];
  progressValues = [65, 30, 55, 40];
  remainingTime = ['45m left', '18m left', '32m left', '26m left'];

  skeletons = Array.from({ length: 6 }, (_, i) => i);

  private rotation: ReturnType<typeof setInterval> | null = null;

  constructor(
    public tmdb: TmdbService,
    public auth: AuthService,
  ) {}

  heroMedia(): TmdbMedia | null {
    return this.heroPool()[this.heroIndex()] ?? null;
  }

  setHero(index: number): void {
    this.heroIndex.set(index);
    this.startRotation();
  }

  ngOnInit(): void {
    this.tmdb.getTrending('movie', 'week').subscribe({
      next: (res) => {
        const movies = res.results.slice(0, 12).map((m) => ({ ...m, media_type: 'movie' as const }));
        this.trendingMovies.set(movies);
        this.heroPool.set(movies.filter((m) => !!m.backdrop_path).slice(0, 4));
        this.startRotation();
      },
    });

    this.tmdb.getTrending('tv', 'week').subscribe({
      next: (res) => {
        const shows = res.results.slice(0, 12).map((t) => ({ ...t, media_type: 'tv' as const }));
        this.trendingTv.set(shows);
        this.continueWatching.set(shows.slice(0, 4));
        this.loadingTrending.set(false);
      },
      error: () => this.loadingTrending.set(false),
    });
  }

  ngOnDestroy(): void {
    this.stopRotation();
  }

  private startRotation(): void {
    this.stopRotation();
    if (this.heroPool().length < 2) return;

    this.rotation = setInterval(() => {
      this.heroIndex.update((i) => (i + 1) % this.heroPool().length);
    }, 8000);
  }

  private stopRotation(): void {
    if (this.rotation) {
      clearInterval(this.rotation);
      this.rotation = null;
    }
  }
}
