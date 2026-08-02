import { Component, OnInit, signal } from '@angular/core';

import { ApiService } from '@core/services/api.service';
import { StatisticsSnapshot } from '@core/models/movie.model';
import { SkeletonLoaderComponent } from '@shared/components/skeleton-loader/skeleton-loader.component';

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [SkeletonLoaderComponent],
  template: `
    <div class="page-container animate-fade-in">
      <!-- Header with time filter tabs -->
      <div class="flex items-center justify-between mb-8 flex-wrap gap-4">
        <h1 class="text-3xl font-bold text-text-primary">My Stats</h1>
        <div class="flex gap-1 bg-surface-card rounded-xl p-1">
          @for (period of timePeriods; track period.key) {
            <button
              (click)="activePeriod.set(period.key)"
              class="px-4 py-1.5 rounded-lg text-sm font-medium transition-all"
              [class]="activePeriod() === period.key
                ? 'bg-primary text-surface-deep'
                : 'text-text-secondary hover:text-text-primary'"
            >
              {{ period.label }}
            </button>
          }
        </div>
      </div>

      @if (loading()) {
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4">
          @for (i of [1,2,3,4,5,6]; track i) {
            <app-skeleton height="120px" className="rounded-2xl" />
          }
        </div>
      } @else if (stats()) {
        <!-- Top row: big stat cards -->
        <div class="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div class="card p-5">
            <p class="text-sm text-text-secondary mb-1">Total Watched</p>
            <p class="text-3xl font-bold text-text-primary">{{ stats()!.totals.watchlist }}</p>
            <p class="text-xs text-green-400 mt-1">+12 this month</p>
          </div>
          <div class="card p-5">
            <p class="text-sm text-text-secondary mb-1">Movies</p>
            <p class="text-3xl font-bold text-text-primary">{{ stats()!.byMediaType.movie }}</p>
            <p class="text-xs text-green-400 mt-1">+8 this month</p>
          </div>
          <div class="card p-5">
            <p class="text-sm text-text-secondary mb-1">TV Shows</p>
            <p class="text-3xl font-bold text-text-primary">{{ stats()!.byMediaType.tv }}</p>
            <p class="text-xs text-green-400 mt-1">+4 this month</p>
          </div>
        </div>

        <!-- Second row -->
        <div class="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <div class="card p-5">
            <p class="text-sm text-text-secondary mb-1">Completed</p>
            <p class="text-3xl font-bold text-text-primary">{{ stats()!.totals.completed }}</p>
            <p class="text-xs text-green-400 mt-1">+96 this month</p>
          </div>
          <div class="card p-5">
            <p class="text-sm text-text-secondary mb-1">Hours Watched</p>
            <p class="text-3xl font-bold text-text-primary">{{ estimatedHours() }}</p>
            <p class="text-xs text-green-400 mt-1">+35 this month</p>
          </div>
          <div class="card p-5">
            <p class="text-sm text-text-secondary mb-1">Average Rating</p>
            <div class="flex items-center gap-2">
              <p class="text-3xl font-bold text-text-primary">
                {{ stats()!.ratings.averageScore !== null ? stats()!.ratings.averageScore!.toFixed(1) : '—' }}
              </p>
              @if (stats()!.ratings.averageScore !== null) {
                <svg class="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
              }
            </div>
          </div>
        </div>

        <!-- Genre Distribution + Rating Summary row -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Genre distribution donut chart -->
          <div class="card p-6">
            <h3 class="text-lg font-semibold text-text-primary mb-5">Genres Distribution</h3>
            <div class="flex items-center gap-8">
              <!-- SVG Donut -->
              <div class="relative w-36 h-36 flex-shrink-0">
                <svg viewBox="0 0 36 36" class="w-full h-full -rotate-90">
                  @for (segment of donutSegments; track segment.label) {
                    <circle
                      cx="18" cy="18" r="14"
                      fill="none"
                      [attr.stroke]="segment.color"
                      stroke-width="5"
                      [attr.stroke-dasharray]="segment.dash"
                      [attr.stroke-dashoffset]="segment.offset"
                      class="transition-all duration-700"
                    />
                  }
                </svg>
              </div>
              <!-- Legend -->
              <div class="space-y-2.5 flex-1">
                @for (segment of donutSegments; track segment.label) {
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <div class="w-2.5 h-2.5 rounded-full" [style.background]="segment.color"></div>
                      <span class="text-sm text-text-secondary">{{ segment.label }}</span>
                    </div>
                    <span class="text-sm font-medium text-text-primary">{{ segment.percent }}%</span>
                  </div>
                }
              </div>
            </div>
          </div>

          <!-- Additional stats -->
          <div class="card p-6">
            <h3 class="text-lg font-semibold text-text-primary mb-5">Overview</h3>
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <span class="text-sm text-text-secondary">Favorites</span>
                <span class="text-sm font-bold text-red-400">{{ stats()!.totals.favorites }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-text-secondary">Ratings Given</span>
                <span class="text-sm font-bold text-amber-400">{{ stats()!.totals.ratings }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-text-secondary">Journal Entries</span>
                <span class="text-sm font-bold text-indigo-400">{{ stats()!.totals.journalEntries }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-text-secondary">Collections</span>
                <span class="text-sm font-bold text-teal-400">{{ stats()!.totals.collections }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-text-secondary">Plan to Watch</span>
                <span class="text-sm font-bold text-purple-400">{{ stats()!.totals.planToWatch }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-text-secondary">Dropped</span>
                <span class="text-sm font-bold text-red-400">{{ stats()!.totals.dropped }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-text-secondary">Highest Rating</span>
                <span class="text-sm font-bold text-green-400">
                  {{ stats()!.ratings.highestScore !== null ? stats()!.ratings.highestScore!.toFixed(1) : '—' }}
                </span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-text-secondary">Lowest Rating</span>
                <span class="text-sm font-bold text-red-400">
                  {{ stats()!.ratings.lowestScore !== null ? stats()!.ratings.lowestScore!.toFixed(1) : '—' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      } @else {
        <div class="text-center py-20">
          <div class="text-5xl mb-4">📊</div>
          <h3 class="text-xl font-semibold text-text-primary mb-2">No statistics yet</h3>
          <p class="text-text-secondary">Start tracking movies and shows to see your stats</p>
        </div>
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

  // Sample donut chart data
  donutSegments = [
    { label: 'Action', percent: 28, color: '#FFC107', dash: '24.6 87.96', offset: '0' },
    { label: 'Drama', percent: 22, color: '#D4A017', dash: '19.4 87.96', offset: '-24.6' },
    { label: 'Sci-Fi', percent: 18, color: '#60A5FA', dash: '15.8 87.96', offset: '-44' },
    { label: 'Adventure', percent: 15, color: '#34D399', dash: '13.2 87.96', offset: '-59.8' },
    { label: 'Other', percent: 17, color: '#3A3A3C', dash: '15 87.96', offset: '-73' },
  ];

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
}
