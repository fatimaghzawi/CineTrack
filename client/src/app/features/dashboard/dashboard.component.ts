import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { TmdbService } from '@core/services/tmdb.service';
import { AuthService } from '@core/services/auth.service';
import { TmdbMedia } from '@core/models/movie.model';
import { MovieCardComponent } from '@shared/components/movie-card/movie-card.component';
import { SkeletonLoaderComponent } from '@shared/components/skeleton-loader/skeleton-loader.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, MovieCardComponent, SkeletonLoaderComponent],
  template: `
    <div class="animate-fade-in">
      <!-- Hero Section -->
      <div class="relative overflow-hidden">
        @if (heroMedia(); as hero) {
          <div class="relative h-[420px] lg:h-[460px]">
            <img
              [src]="tmdb.backdropUrl(hero.backdrop_path)"
              [alt]="tmdb.getTitle(hero)"
              class="absolute inset-0 w-full h-full object-cover"
            />
            <div class="absolute inset-0 bg-gradient-to-r from-surface-deep via-surface-deep/80 to-transparent"></div>
            <div class="absolute inset-0 bg-gradient-to-t from-surface-deep via-transparent to-surface-deep/30"></div>

            <div class="relative h-full flex flex-col justify-center px-6 lg:px-10 max-w-2xl">
              <h1 class="text-5xl lg:text-6xl font-bold leading-tight mb-4">
                <span class="text-text-primary">Track.</span><br/>
                <span class="text-primary">Watch.</span><br/>
                <span class="text-text-primary">Enjoy.</span>
              </h1>
              <p class="text-text-secondary text-base mb-8 max-w-sm">
                Your personal movie tracker.<br/>
                Keep track of what you've watched and what's next.
              </p>
              <div class="flex items-center gap-3">
                <a routerLink="/discover" class="btn-primary flex items-center gap-2 !px-6">
                  Start Exploring
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                  </svg>
                </a>
                <a routerLink="/watchlist" class="btn-outline !border-white/20 !text-white hover:!bg-white/10">
                  My Watchlist
                </a>
              </div>
            </div>
          </div>
        } @else {
          <div class="h-[420px] bg-surface-dark animate-pulse"></div>
        }

        <!-- Stats bar -->
        <div class="relative -mt-16 px-6 lg:px-10 z-10">
          <div class="flex items-center gap-8 lg:gap-12">
            @for (stat of heroStats; track stat.label) {
              <div>
                <p class="text-2xl lg:text-3xl font-bold text-text-primary">{{ stat.value }}</p>
                <p class="text-xs text-text-muted mt-0.5">{{ stat.label }}</p>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Continue Watching -->
      <div class="px-6 lg:px-10 mt-10">
        <div class="flex items-center justify-between mb-5">
          <h2 class="text-xl font-bold text-text-primary">Continue Watching</h2>
          <a routerLink="/watchlist" class="text-sm text-text-secondary hover:text-primary transition-colors flex items-center gap-1">
            View All
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </a>
        </div>

        @if (loadingTrending()) {
          <div class="flex gap-4 overflow-hidden">
            @for (i of [1,2,3,4,5]; track i) {
              <app-skeleton width="220px" height="160px" className="rounded-xl flex-shrink-0" />
            }
          </div>
        } @else {
          <div class="flex gap-4 overflow-x-auto pb-4 scrollbar-none">
            @for (item of continueWatching(); track item.id; let i = $index) {
              <a
                [routerLink]="'/' + (item.media_type || 'movie') + '/' + item.id"
                class="group relative flex-shrink-0 w-[220px] rounded-xl overflow-hidden bg-surface-card hover:ring-1 hover:ring-primary/30 transition-all"
              >
                <div class="relative h-[130px]">
                  <img
                    [src]="tmdb.backdropUrl(item.backdrop_path, 'w780')"
                    [alt]="tmdb.getTitle(item)"
                    class="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div class="absolute inset-0 bg-gradient-to-t from-surface-card to-transparent"></div>
                  <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div class="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <svg class="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"/>
                      </svg>
                    </div>
                  </div>
                </div>
                <div class="p-3">
                  <p class="text-sm font-semibold text-text-primary truncate">{{ tmdb.getTitle(item) }}</p>
                  <p class="text-xs text-text-muted mt-0.5">{{ continueInfo[i] }}</p>
                  <div class="mt-2 w-full h-1 rounded-full bg-surface-elevated overflow-hidden">
                    <div class="h-full rounded-full bg-primary" [style.width.%]="progressValues[i]"></div>
                  </div>
                  <p class="text-[10px] text-text-muted mt-1">{{ remainingTime[i] }}</p>
                </div>
              </a>
            }
          </div>
        }
      </div>

      <div class="px-6 lg:px-10 space-y-10 mt-10 pb-10">
        <!-- Trending Movies -->
        <section>
          <div class="flex items-center justify-between mb-5">
            <h2 class="text-xl font-bold text-text-primary">Trending Movies</h2>
            <a routerLink="/discover" [queryParams]="{tab: 'movies'}" class="text-sm text-text-secondary hover:text-primary transition-colors flex items-center gap-1">
              See all
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </a>
          </div>
          @if (loadingTrending()) {
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              @for (i of [1,2,3,4,5,6]; track i) {
                <app-skeleton height="260px" className="rounded-xl" />
              }
            </div>
          } @else {
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              @for (movie of trendingMovies(); track movie.id) {
                <app-movie-card [media]="movie" />
              }
            </div>
          }
        </section>

        <!-- Trending TV -->
        <section>
          <div class="flex items-center justify-between mb-5">
            <h2 class="text-xl font-bold text-text-primary">Trending TV Shows</h2>
            <a routerLink="/discover" [queryParams]="{tab: 'tv'}" class="text-sm text-text-secondary hover:text-primary transition-colors flex items-center gap-1">
              See all
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </a>
          </div>
          @if (loadingTrending()) {
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              @for (i of [1,2,3,4,5,6]; track i) {
                <app-skeleton height="260px" className="rounded-xl" />
              }
            </div>
          } @else {
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
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
export class DashboardComponent implements OnInit {
  trendingMovies = signal<TmdbMedia[]>([]);
  trendingTv = signal<TmdbMedia[]>([]);
  continueWatching = signal<TmdbMedia[]>([]);
  heroMedia = signal<TmdbMedia | null>(null);
  loadingTrending = signal(true);

  heroStats = [
    { label: 'Movies', value: '1,240' },
    { label: 'TV Shows', value: '320' },
    { label: 'Episodes', value: '12,568' },
    { label: 'Hours Watched', value: '8,450' },
  ];

  continueInfo = ['S3 · E1', 'S21 · E1002', 'S2 · E4', 'S1 · E8', 'S4 · E12'];
  progressValues = [65, 30, 55, 40, 80];
  remainingTime = ['40m left', '18m left', '32m left', '26m left', '12m left'];

  constructor(
    public tmdb: TmdbService,
    public auth: AuthService,
  ) {}

  ngOnInit(): void {
    this.tmdb.getTrending('movie', 'week').subscribe({
      next: (res) => {
        const movies = res.results.slice(0, 12);
        this.trendingMovies.set(movies.map((m) => ({ ...m, media_type: 'movie' as const })));
        if (movies.length > 0) {
          this.heroMedia.set({ ...movies[0], media_type: 'movie' });
        }
      },
    });

    this.tmdb.getTrending('tv', 'week').subscribe({
      next: (res) => {
        const shows = res.results.slice(0, 12);
        this.trendingTv.set(shows.map((t) => ({ ...t, media_type: 'tv' as const })));
        this.continueWatching.set(shows.slice(0, 5).map((t) => ({ ...t, media_type: 'tv' as const })));
        this.loadingTrending.set(false);
      },
      error: () => this.loadingTrending.set(false),
    });
  }
}
