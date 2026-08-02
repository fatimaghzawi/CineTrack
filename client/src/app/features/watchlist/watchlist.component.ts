import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';

import { WatchlistService } from '@core/services/watchlist.service';
import { TmdbService } from '@core/services/tmdb.service';
import { ToastService } from '@core/services/toast.service';
import {
  WatchlistItem,
  WatchStatus,
  WATCH_STATUS_LABELS,
  TmdbMedia,
} from '@core/models/movie.model';
import { MovieCardComponent } from '@shared/components/movie-card/movie-card.component';
import { SkeletonLoaderComponent } from '@shared/components/skeleton-loader/skeleton-loader.component';

type FilterTab = 'all' | 'movie' | 'tv';

interface TabInfo {
  key: FilterTab;
  label: string;
  count: number;
}

@Component({
  selector: 'app-watchlist',
  standalone: true,
  imports: [RouterLink, FormsModule, MovieCardComponent, SkeletonLoaderComponent],
  template: `
    <div class="page-container animate-fade-in">
      <h1 class="text-3xl font-bold text-text-primary mb-6">My Watchlist</h1>

      <!-- Filter tabs + sort -->
      <div class="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div class="flex gap-2">
          @for (tab of tabs(); track tab.key) {
            <button
              (click)="activeTab.set(tab.key); applyFilter()"
              class="px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200"
              [class]="activeTab() === tab.key
                ? 'bg-primary text-surface-deep'
                : 'bg-surface-card text-text-secondary hover:text-text-primary'"
            >
              {{ tab.label }} ({{ tab.count }})
            </button>
          }
        </div>
        <div class="relative">
          <select
            [(ngModel)]="sortBy"
            (ngModelChange)="applyFilter()"
            class="appearance-none bg-surface-card border border-surface-elevated rounded-lg pl-3 pr-8 py-2 text-sm text-text-secondary focus:outline-none focus:border-primary cursor-pointer"
          >
            <option value="recent">Recently Added</option>
            <option value="rating">Highest Rated</option>
            <option value="title">Title A-Z</option>
          </select>
          <svg class="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
          </svg>
        </div>
      </div>

      <!-- Status filter pills -->
      <div class="flex gap-2 mb-6 overflow-x-auto pb-1">
        <button
          (click)="statusFilter.set(undefined); applyFilter()"
          class="px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all"
          [class]="!statusFilter()
            ? 'bg-primary/15 text-primary'
            : 'text-text-muted hover:text-text-secondary'"
        >
          All Status
        </button>
        @for (status of statuses; track status) {
          <button
            (click)="statusFilter.set(status); applyFilter()"
            class="px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all"
            [class]="statusFilter() === status
              ? 'bg-primary/15 text-primary'
              : 'text-text-muted hover:text-text-secondary'"
          >
            {{ statusLabels[status] }}
          </button>
        }
      </div>

      @if (loading()) {
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
          @for (i of [1,2,3,4,5,6,7,8]; track i) {
            <app-skeleton height="260px" className="rounded-xl" />
          }
        </div>
      } @else if (filteredItems().length === 0 && items().length === 0) {
        <div class="text-center py-20">
          <div class="text-5xl mb-4">📋</div>
          <h3 class="text-xl font-semibold text-text-primary mb-2">Your watchlist is empty</h3>
          <p class="text-text-secondary mb-6">Start discovering movies and TV shows to add</p>
          <a routerLink="/discover" class="btn-primary">Discover Now</a>
        </div>
      } @else if (filteredItems().length === 0) {
        <div class="text-center py-16">
          <p class="text-text-secondary">No items match the current filter.</p>
        </div>
      } @else {
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
          @for (item of filteredItems(); track item.id) {
            @if (mediaCache().get(item.tmdbId); as media) {
              <div class="relative group">
                <app-movie-card
                  [media]="media"
                  [showWatchedBadge]="item.status === 'completed'"
                  [episodeInfo]="getEpisodeInfo(item)"
                />
                <div class="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <select
                    [value]="item.status"
                    (change)="updateStatus(item, $event); $event.stopPropagation()"
                    (click)="$event.stopPropagation(); $event.preventDefault()"
                    class="bg-surface-deep/90 backdrop-blur-sm border border-surface-elevated rounded-lg px-2 py-1 text-xs text-text-primary focus:outline-none cursor-pointer"
                  >
                    @for (status of statuses; track status) {
                      <option [value]="status">{{ statusLabels[status] }}</option>
                    }
                  </select>
                </div>
              </div>
            }
          }

          <!-- Add More card -->
          <a
            routerLink="/discover"
            class="aspect-[2/3] rounded-xl border-2 border-dashed border-surface-elevated hover:border-primary/50
                   flex flex-col items-center justify-center gap-3 transition-all hover:bg-surface-card/30 group"
          >
            <div class="w-12 h-12 rounded-full bg-surface-card group-hover:bg-primary/15 flex items-center justify-center transition-colors">
              <svg class="w-6 h-6 text-text-muted group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
            </div>
            <span class="text-sm text-text-muted group-hover:text-primary transition-colors">Add More</span>
          </a>
        </div>
      }
    </div>
  `,
})
export class WatchlistComponent implements OnInit {
  items = signal<WatchlistItem[]>([]);
  filteredItems = signal<WatchlistItem[]>([]);
  mediaCache = signal<Map<number, TmdbMedia>>(new Map());
  loading = signal(true);
  activeTab = signal<FilterTab>('all');
  statusFilter = signal<WatchStatus | undefined>(undefined);
  sortBy = 'recent';

  tabs = signal<TabInfo[]>([
    { key: 'all', label: 'All', count: 0 },
    { key: 'movie', label: 'Movies', count: 0 },
    { key: 'tv', label: 'TV Shows', count: 0 },
  ]);

  statuses: WatchStatus[] = ['plan_to_watch', 'watching', 'completed', 'dropped'];
  statusLabels = WATCH_STATUS_LABELS;

  constructor(
    private watchlistService: WatchlistService,
    public tmdb: TmdbService,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.loadItems();
  }

  loadItems(): void {
    this.loading.set(true);
    this.watchlistService.getAll().subscribe({
      next: (data) => {
        this.items.set(data.items);
        this.updateTabCounts(data.items);
        this.applyFilter();
        this.loading.set(false);

        data.items.forEach((item) => {
          this.fetchMedia(item.tmdbId, item.mediaType);
        });
      },
      error: () => this.loading.set(false),
    });
  }

  private fetchMedia(tmdbId: number, mediaType: string): void {
    const obs: Observable<any> = mediaType === 'movie'
      ? this.tmdb.getMovie(tmdbId)
      : this.tmdb.getTv(tmdbId);

    obs.subscribe((media: any) => {
      this.mediaCache.update((cache) => {
        const updated = new Map(cache);
        updated.set(tmdbId, { ...media, media_type: mediaType } as TmdbMedia);
        return updated;
      });
    });
  }

  applyFilter(): void {
    let result = [...this.items()];
    const tab = this.activeTab();
    const status = this.statusFilter();

    if (tab !== 'all') {
      result = result.filter((i) => i.mediaType === tab);
    }
    if (status) {
      result = result.filter((i) => i.status === status);
    }

    const cache = this.mediaCache();
    if (this.sortBy === 'rating') {
      result.sort((a, b) => (cache.get(b.tmdbId)?.vote_average ?? 0) - (cache.get(a.tmdbId)?.vote_average ?? 0));
    } else if (this.sortBy === 'title') {
      result.sort((a, b) => {
        const titleA = this.tmdb.getTitle(cache.get(a.tmdbId) || {} as TmdbMedia);
        const titleB = this.tmdb.getTitle(cache.get(b.tmdbId) || {} as TmdbMedia);
        return titleA.localeCompare(titleB);
      });
    }

    this.filteredItems.set(result);
  }

  updateTabCounts(items: WatchlistItem[]): void {
    this.tabs.set([
      { key: 'all', label: 'All', count: items.length },
      { key: 'movie', label: 'Movies', count: items.filter((i) => i.mediaType === 'movie').length },
      { key: 'tv', label: 'TV Shows', count: items.filter((i) => i.mediaType === 'tv').length },
    ]);
  }

  updateStatus(item: WatchlistItem, event: Event): void {
    const status = (event.target as HTMLSelectElement).value as WatchStatus;
    this.watchlistService.update(item.id, { status }).subscribe({
      next: () => {
        this.items.update((list) =>
          list.map((i) => (i.id === item.id ? { ...i, status } : i)),
        );
        this.applyFilter();
        this.toast.success('Status updated');
      },
      error: () => this.toast.error('Failed to update'),
    });
  }

  getEpisodeInfo(item: WatchlistItem): string {
    if (item.mediaType === 'tv' && item.progress) {
      const s = item.progress.season;
      const e = item.progress.episode;
      if (s !== undefined && e !== undefined) {
        return `S${s} · E${e}`;
      }
    }
    return '';
  }
}
