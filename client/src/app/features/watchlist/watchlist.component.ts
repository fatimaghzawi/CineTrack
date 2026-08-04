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
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';
import { IconComponent } from '@shared/components/icon/icon.component';

type FilterTab = 'all' | 'movie' | 'tv';

interface TabInfo {
  key: FilterTab;
  label: string;
  count: number;
}

@Component({
  selector: 'app-watchlist',
  standalone: true,
  imports: [
    RouterLink,
    FormsModule,
    MovieCardComponent,
    SkeletonLoaderComponent,
    EmptyStateComponent,
    IconComponent,
  ],
  template: `
    <div class="page-container animate-fade-in">
      <h1 class="page-title mb-6">My Watchlist</h1>

      <!-- Media-type chips + sort -->
      <div class="flex items-center justify-between gap-3 flex-wrap mb-4">
        <div class="flex gap-2 overflow-x-auto scrollbar-none -mx-1 px-1 py-0.5">
          @for (tab of tabs(); track tab.key) {
            <button
              type="button"
              (click)="activeTab.set(tab.key); applyFilter()"
              [class]="activeTab() === tab.key ? 'chip-active' : 'chip-idle'"
            >
              {{ tab.label }} ({{ tab.count }})
            </button>
          }
        </div>

        <div class="relative shrink-0">
          <select
            [(ngModel)]="sortBy"
            (ngModelChange)="applyFilter()"
            aria-label="Sort watchlist"
            class="select-field h-9 text-[13px]"
          >
            <option value="recent">Recently Added</option>
            <option value="rating">Highest Rated</option>
            <option value="title">Title A-Z</option>
          </select>
          <app-icon
            name="chevron-down"
            class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none"
          />
        </div>
      </div>

      <!-- Status filter -->
      <div class="flex gap-2 overflow-x-auto scrollbar-none -mx-1 px-1 pb-1 mb-6">
        <button
          type="button"
          (click)="statusFilter.set(undefined); applyFilter()"
          class="chip !h-8 !px-3 !text-xs"
          [class]="
            !statusFilter()
              ? 'bg-primary/15 text-primary'
              : 'text-text-muted hover:text-text-secondary hover:bg-surface-card'
          "
        >
          All Status
        </button>
        @for (status of statuses; track status) {
          <button
            type="button"
            (click)="statusFilter.set(status); applyFilter()"
            class="chip !h-8 !px-3 !text-xs"
            [class]="
              statusFilter() === status
                ? 'bg-primary/15 text-primary'
                : 'text-text-muted hover:text-text-secondary hover:bg-surface-card'
            "
          >
            {{ statusLabels[status] }}
          </button>
        }
      </div>

      @if (loading()) {
        <div class="poster-grid">
          @for (i of skeletons; track i) {
            <app-skeleton className="aspect-[2/3] w-full" />
          }
        </div>
      } @else if (filteredItems().length === 0 && items().length === 0) {
        <app-empty-state
          icon="bookmark"
          title="Your watchlist is empty"
          message="Start discovering movies and TV shows to add them here."
          [hasAction]="true"
        >
          <a routerLink="/discover" class="btn-primary">Discover Now</a>
        </app-empty-state>
      } @else if (filteredItems().length === 0) {
        <app-empty-state
          icon="compass"
          title="No matches"
          message="No items match the current filter. Try a different tab or status."
        />
      } @else {
        <div class="poster-grid">
          @for (item of filteredItems(); track item.id) {
            @if (mediaCache().get(item.tmdbId); as media) {
              <div class="relative group/row">
                <app-movie-card
                  [media]="media"
                  [showWatchedBadge]="item.status === 'completed'"
                  [episodeInfo]="getEpisodeInfo(item)"
                />

                <!-- Inline status editor — always visible; it was hover-only before,
                     which made it undiscoverable on touch devices and easy to miss. -->
                <div class="absolute top-2 left-2 z-10">
                  <select
                    [value]="item.status"
                    [attr.aria-label]="'Watch status'"
                    (change)="updateStatus(item, $event)"
                    (click)="$event.stopPropagation(); $event.preventDefault()"
                    class="appearance-none rounded-lg bg-surface-deep/90 backdrop-blur-md
                           border border-hairline px-2.5 h-7 text-2xs font-medium
                           text-text-primary cursor-pointer focus:outline-none
                           focus:border-primary/70"
                  >
                    @for (status of statuses; track status) {
                      <option [value]="status">{{ statusLabels[status] }}</option>
                    }
                  </select>
                </div>
              </div>
            }
          }

          <!-- Add more -->
          <a routerLink="/discover" class="add-tile aspect-[2/3] group/add">
            <span
              class="grid place-items-center h-12 w-12 rounded-full bg-surface-card
                     transition-colors duration-200 group-hover/add:bg-primary/15"
            >
              <app-icon name="plus" class="w-5 h-5" />
            </span>
            <span class="text-[13px] font-medium">Add More</span>
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
  skeletons = Array.from({ length: 12 }, (_, i) => i);

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
    const obs: Observable<any> =
      mediaType === 'movie' ? this.tmdb.getMovie(tmdbId) : this.tmdb.getTv(tmdbId);

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
      result.sort(
        (a, b) => (cache.get(b.tmdbId)?.vote_average ?? 0) - (cache.get(a.tmdbId)?.vote_average ?? 0),
      );
    } else if (this.sortBy === 'title') {
      result.sort((a, b) => {
        const titleA = this.tmdb.getTitle(cache.get(a.tmdbId) || ({} as TmdbMedia));
        const titleB = this.tmdb.getTitle(cache.get(b.tmdbId) || ({} as TmdbMedia));
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
