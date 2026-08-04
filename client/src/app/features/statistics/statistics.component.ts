import { Component, OnInit, signal } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { ApiService } from '@core/services/api.service';
import { WatchlistService } from '@core/services/watchlist.service';
import { TmdbService } from '@core/services/tmdb.service';
import { StatisticsSnapshot, TmdbMovieDetails, TmdbTvDetails } from '@core/models/movie.model';
import { SkeletonLoaderComponent } from '@shared/components/skeleton-loader/skeleton-loader.component';
import { StatTileComponent } from '@shared/components/stat-tile/stat-tile.component';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';

interface DonutSegment {
  label: string;
  percent: number;
  color: string;
  dash: string;
  offset: string;
}

/** Radius 14 in a 36×36 viewBox → circumference used for arc maths. */
const RING_CIRCUMFERENCE = 2 * Math.PI * 14;

/** Fixed palette so the same genre always reads the same color across renders. */
const GENRE_COLORS = ['#FFC107', '#D4A017', '#60A5FA', '#34D399'];
const OTHER_COLOR = '#3A3A3C';

/** Typical drama episode length, used when TMDb doesn't report one for a show. */
const DEFAULT_EPISODE_MINUTES = 45;

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [SkeletonLoaderComponent, StatTileComponent, EmptyStateComponent],
  template: `
    <div class="page-container animate-fade-in">
      <!-- Header -->
      <div class="flex items-center justify-between gap-4 flex-wrap mb-6">
        <h1 class="page-title">My Stats</h1>
        <span class="chip !h-8 !px-3.5 !text-[13px] bg-primary text-surface-deep">All Time</span>
      </div>

      @if (loading()) {
        <div class="grid gap-4 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
            @for (i of [1, 2, 3, 4, 5, 6]; track i) {
              <app-skeleton height="108px" className="rounded-xl" />
            }
          </div>
          <app-skeleton height="232px" className="rounded-2xl" />
        </div>
      } @else if (stats()) {
        <!-- alias binding is only available on a leading @if, so re-narrow here -->
        @if (stats(); as s) {
        <div class="grid gap-4 lg:gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)] mb-6">
          <!-- Stat tiles -->
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <app-stat-tile label="In Watchlist" [value]="s.totals.watchlist" />
            <app-stat-tile label="Movies" [value]="s.byMediaType.movie" />
            <app-stat-tile label="TV Shows" [value]="s.byMediaType.tv" />
            <app-stat-tile label="Completed" [value]="s.totals.completed" />
            <app-stat-tile label="Hours Watched" [value]="hoursWatched()" />
            <app-stat-tile
              label="Average Rating"
              [value]="s.ratings.averageScore !== null ? s.ratings.averageScore!.toFixed(1) : '—'"
              [icon]="s.ratings.averageScore !== null ? 'star' : null"
            />
          </div>

          <!-- Genres donut -->
          <div class="panel p-5 sm:p-6">
            @if (loadingGenres()) {
              <div class="flex items-center gap-5 sm:gap-6 h-full">
                <app-skeleton width="128px" height="128px" className="rounded-full shrink-0" />
                <div class="flex-1 space-y-2.5">
                  @for (i of [1, 2, 3, 4]; track i) {
                    <app-skeleton height="14px" className="rounded" />
                  }
                </div>
              </div>
            } @else if (donutSegments.length === 0) {
              <div class="flex flex-col items-center justify-center h-full text-center py-6">
                <h3 class="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">
                  Genres Distribution
                </h3>
                <p class="text-[13px] text-text-muted">
                  Add movies or shows to your watchlist to see your genre mix.
                </p>
              </div>
            } @else {
              <div class="flex items-center gap-5 sm:gap-6 h-full">
                <div class="relative w-32 h-32 sm:w-36 sm:h-36 shrink-0">
                  <svg viewBox="0 0 36 36" class="w-full h-full -rotate-90" aria-hidden="true">
                    <circle cx="18" cy="18" r="14" fill="none" stroke="#2C2C2E" stroke-width="4.5" />
                    @for (segment of donutSegments; track segment.label) {
                      <circle
                        cx="18"
                        cy="18"
                        r="14"
                        fill="none"
                        [attr.stroke]="segment.color"
                        stroke-width="4.5"
                        stroke-linecap="round"
                        [attr.stroke-dasharray]="segment.dash"
                        [attr.stroke-dashoffset]="segment.offset"
                        class="transition-all duration-700 ease-smooth"
                      />
                    }
                  </svg>
                </div>

                <div class="flex-1 min-w-0">
                  <h3 class="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-3">
                    Genres Distribution
                  </h3>
                  <ul class="space-y-2">
                    @for (segment of donutSegments; track segment.label) {
                      <li class="flex items-center justify-between gap-3">
                        <span class="flex items-center gap-2 min-w-0">
                          <span
                            class="h-2 w-2 rounded-full shrink-0"
                            [style.background]="segment.color"
                          ></span>
                          <span class="text-[13px] text-text-secondary truncate">
                            {{ segment.label }}
                          </span>
                        </span>
                        <span class="text-[13px] font-semibold text-text-primary shrink-0">
                          {{ segment.percent }}%
                        </span>
                      </li>
                    }
                  </ul>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Library breakdown -->
        <div class="panel p-5 sm:p-6">
          <h3 class="section-title mb-5">Library Overview</h3>

          <dl class="grid gap-x-8 gap-y-3 sm:grid-cols-2">
            @for (row of overviewRows(s); track row.label) {
              <div
                class="flex items-center justify-between gap-4 py-2.5 border-b border-hairline last:border-0"
              >
                <dt class="text-[13px] text-text-secondary">{{ row.label }}</dt>
                <dd class="text-[13px] font-bold text-text-primary">{{ row.value }}</dd>
              </div>
            }
          </dl>
        </div>
        }
      } @else {
        <app-empty-state
          icon="chart"
          title="No statistics yet"
          message="Start tracking movies and shows and your stats will build up here."
        />
      }
    </div>
  `,
})
export class StatisticsComponent implements OnInit {
  stats = signal<StatisticsSnapshot | null>(null);
  loading = signal(true);
  donutSegments: DonutSegment[] = [];
  loadingGenres = signal(true);
  hoursWatched = signal(0);

  constructor(
    private api: ApiService,
    private watchlistService: WatchlistService,
    private tmdb: TmdbService,
  ) {}

  ngOnInit(): void {
    // The server caches the last computed snapshot and only recomputes when
    // asked to — without `refresh`, this would silently show stale totals
    // from whenever the snapshot was first generated.
    this.api.get<{ statistics: StatisticsSnapshot }>('/statistics', { refresh: true }).subscribe({
      next: (res) => {
        this.stats.set(res.data.statistics);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });

    this.loadGenreDistribution();
  }

  /**
   * Derives genre distribution and real watch-time from the user's watchlist,
   * since the backend snapshot only stores counts, not TMDb metadata. One
   * batch of TMDb detail requests feeds both: genre tallies across every
   * tracked item, and total runtime summed only across "completed" items
   * (the only status that means "I actually watched all of this").
   */
  private loadGenreDistribution(): void {
    this.watchlistService.getAll({ limit: 100 }).subscribe({
      next: (data) => {
        if (data.items.length === 0) {
          this.loadingGenres.set(false);
          return;
        }

        const detailRequests = data.items.map((item) => {
          const request$: Observable<TmdbMovieDetails | TmdbTvDetails> =
            item.mediaType === 'movie' ? this.tmdb.getMovie(item.tmdbId) : this.tmdb.getTv(item.tmdbId);
          return request$.pipe(catchError(() => of(null)));
        });

        forkJoin(detailRequests).subscribe((detailsList) => {
          const counts = new Map<string, number>();
          let totalGenreHits = 0;
          let totalMinutes = 0;

          detailsList.forEach((details, i) => {
            if (!details) return;

            for (const genre of details.genres ?? []) {
              counts.set(genre.name, (counts.get(genre.name) ?? 0) + 1);
              totalGenreHits++;
            }

            if (data.items[i].status === 'completed') {
              if ('runtime' in details) {
                totalMinutes += details.runtime ?? 0;
              } else {
                // TMDb has been dropping `episode_run_time` for many shows
                // (returns []); fall back to a typical episode length rather
                // than silently counting a fully-watched series as 0 hours.
                const perEpisode = details.episode_run_time?.[0] || DEFAULT_EPISODE_MINUTES;
                totalMinutes += perEpisode * (details.number_of_episodes ?? 0);
              }
            }
          });

          this.donutSegments = totalGenreHits > 0 ? buildDonut(toTopSegments(counts, totalGenreHits)) : [];
          this.hoursWatched.set(Math.round(totalMinutes / 60));
          this.loadingGenres.set(false);
        });
      },
      error: () => this.loadingGenres.set(false),
    });
  }

  overviewRows(s: StatisticsSnapshot): { label: string; value: string | number }[] {
    return [
      { label: 'Favorites', value: s.totals.favorites },
      { label: 'Ratings Given', value: s.totals.ratings },
      { label: 'Journal Entries', value: s.totals.journalEntries },
      { label: 'Collections', value: s.totals.collections },
      { label: 'Plan to Watch', value: s.totals.planToWatch },
      { label: 'Watching', value: s.totals.watching },
      { label: 'Dropped', value: s.totals.dropped },
      {
        label: 'Highest Rating',
        value: s.ratings.highestScore !== null ? s.ratings.highestScore.toFixed(1) : '—',
      },
      {
        label: 'Lowest Rating',
        value: s.ratings.lowestScore !== null ? s.ratings.lowestScore.toFixed(1) : '—',
      },
    ];
  }
}

/**
 * Reduces raw genre counts to the top 4 genres plus an "Other" bucket
 * covering everything else, each expressed as a whole-number percentage.
 */
function toTopSegments(
  counts: Map<string, number>,
  total: number,
): { label: string; percent: number; color: string }[] {
  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  const top = sorted.slice(0, 4);
  const otherCount = sorted.slice(4).reduce((sum, [, count]) => sum + count, 0);

  const segments = top.map(([label, count], i) => ({
    label,
    percent: Math.round((count / total) * 100),
    color: GENRE_COLORS[i],
  }));

  if (otherCount > 0) {
    segments.push({ label: 'Other', percent: Math.round((otherCount / total) * 100), color: OTHER_COLOR });
  }

  return segments;
}

/** Turns percentages into stacked SVG arc dash/offset pairs. */
function buildDonut(parts: { label: string; percent: number; color: string }[]): DonutSegment[] {
  let consumed = 0;

  return parts.map((part) => {
    const length = (part.percent / 100) * RING_CIRCUMFERENCE;
    const segment: DonutSegment = {
      ...part,
      dash: `${length.toFixed(2)} ${RING_CIRCUMFERENCE.toFixed(2)}`,
      offset: `${(-consumed).toFixed(2)}`,
    };
    consumed += length;
    return segment;
  });
}
