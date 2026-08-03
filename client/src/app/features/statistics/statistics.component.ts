import { Component, OnInit, signal } from '@angular/core';

import { ApiService } from '@core/services/api.service';
import { StatisticsSnapshot } from '@core/models/movie.model';
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

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [SkeletonLoaderComponent, StatTileComponent, EmptyStateComponent],
  template: `
    <div class="page-container animate-fade-in">
      <!-- Header + period switcher -->
      <div class="flex items-center justify-between gap-4 flex-wrap mb-6">
        <h1 class="page-title">My Stats</h1>

        <div class="flex gap-1.5 overflow-x-auto scrollbar-none -mx-1 px-1 py-0.5">
          @for (period of timePeriods; track period.key) {
            <button
              type="button"
              (click)="activePeriod.set(period.key)"
              class="chip !h-8 !px-3.5 !text-[13px]"
              [class]="
                activePeriod() === period.key
                  ? 'bg-primary text-surface-deep'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-card'
              "
            >
              {{ period.label }}
            </button>
          }
        </div>
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
            <app-stat-tile label="Total Watched" [value]="s.totals.watchlist" delta="+12 this month" />
            <app-stat-tile label="Movies" [value]="s.byMediaType.movie" delta="+8 this month" />
            <app-stat-tile label="TV Shows" [value]="s.byMediaType.tv" delta="+4 this month" />
            <app-stat-tile label="Completed" [value]="s.totals.completed" delta="+96 this month" />
            <app-stat-tile label="Hours Watched" [value]="estimatedHours()" delta="+35 this month" />
            <app-stat-tile
              label="Average Rating"
              [value]="s.ratings.averageScore !== null ? s.ratings.averageScore!.toFixed(1) : '—'"
              [icon]="s.ratings.averageScore !== null ? 'star' : null"
            />
          </div>

          <!-- Genres donut -->
          <div class="panel p-5 sm:p-6">
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
  activePeriod = signal('all');

  timePeriods = [
    { key: 'all', label: 'All Time' },
    { key: 'year', label: 'This Year' },
    { key: 'month', label: 'This Month' },
    { key: 'week', label: 'This Week' },
  ];

  /** Sample genre split — arcs are derived so the ring always closes cleanly. */
  donutSegments: DonutSegment[] = buildDonut([
    { label: 'Action', percent: 28, color: '#FFC107' },
    { label: 'Drama', percent: 22, color: '#D4A017' },
    { label: 'Sci-Fi', percent: 18, color: '#60A5FA' },
    { label: 'Adventure', percent: 15, color: '#34D399' },
    { label: 'Other', percent: 17, color: '#3A3A3C' },
  ]);

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.get<{ snapshot: StatisticsSnapshot }>('/statistics').subscribe({
      next: (res) => {
        this.stats.set(res.data.snapshot);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  estimatedHours(): string {
    const s = this.stats();
    if (!s) return '0';
    // Rough estimate: completed * 2 hours avg
    const hours = s.totals.completed * 2;
    return hours.toLocaleString();
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
