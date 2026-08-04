import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { TmdbService } from '@core/services/tmdb.service';
import { TmdbMedia } from '@core/models/movie.model';
import { MovieCardComponent } from '@shared/components/movie-card/movie-card.component';
import { SkeletonLoaderComponent } from '@shared/components/skeleton-loader/skeleton-loader.component';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';
import { IconComponent } from '@shared/components/icon/icon.component';

type Tab = 'all' | 'movies' | 'tv';

@Component({
  selector: 'app-discover',
  standalone: true,
  imports: [
    FormsModule,
    MovieCardComponent,
    SkeletonLoaderComponent,
    EmptyStateComponent,
    IconComponent,
  ],
  template: `
    <div class="page-container animate-fade-in">
      <h1 class="page-title">Discover</h1>
      <p class="mt-1.5 text-sm text-text-secondary">Explore movies and TV shows</p>

      <!-- Search -->
      <div class="relative max-w-xl mt-6">
        <app-icon
          name="search"
          class="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-text-muted pointer-events-none"
        />
        <input
          type="search"
          name="discoverSearch"
          [(ngModel)]="searchQuery"
          (ngModelChange)="onSearchChange($event)"
          placeholder="Search movies or TV shows..."
          aria-label="Search movies or TV shows"
          class="input-field pl-12 h-12"
        />
      </div>

      <!-- Type chips -->
      <div class="flex gap-2 mt-5 mb-7 overflow-x-auto scrollbar-none -mx-1 px-1 py-0.5">
        @for (tab of tabs; track tab.key) {
          <button
            type="button"
            (click)="activeTab.set(tab.key); loadContent()"
            [class]="activeTab() === tab.key ? 'chip-active' : 'chip-idle'"
          >
            {{ tab.label }}
          </button>
        }
      </div>

      @if (loading()) {
        <div class="poster-grid">
          @for (i of skeletons; track i) {
            <app-skeleton className="aspect-[2/3] w-full" />
          }
        </div>
      } @else if (results().length === 0) {
        <app-empty-state
          icon="film"
          title="No results found"
          message="Try a different search term, or switch tabs to browse what's trending."
        />
      } @else {
        <div class="poster-grid">
          @for (item of results(); track item.id) {
            <app-movie-card [media]="item" />
          }
        </div>

        @if (hasMore()) {
          <div class="flex justify-center mt-8 pb-4">
            <button type="button" (click)="loadMore()" class="btn-outline" [disabled]="loadingMore()">
              @if (loadingMore()) {
                <span
                  class="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin"
                ></span>
                Loading...
              } @else {
                Load More
                <app-icon name="chevron-down" class="w-4 h-4" />
              }
            </button>
          </div>
        }
      }
    </div>
  `,
})
export class DiscoverComponent implements OnInit {
  searchQuery = '';
  activeTab = signal<Tab>('all');
  results = signal<TmdbMedia[]>([]);
  loading = signal(true);
  loadingMore = signal(false);
  hasMore = signal(false);
  currentPage = 1;
  totalPages = 1;
  searchTimeout: ReturnType<typeof setTimeout> | null = null;

  tabs = [
    { key: 'all' as Tab, label: 'All' },
    { key: 'movies' as Tab, label: 'Movies' },
    { key: 'tv' as Tab, label: 'TV Shows' },
  ];

  skeletons = Array.from({ length: 12 }, (_, i) => i);

  constructor(
    private tmdb: TmdbService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    // Routes like /movies and /tv-shows set a static `defaultTab` so this one
    // component can serve as three distinct pages; a `?tab=` query param
    // (e.g. links from the dashboard) takes priority over it when present.
    const defaultTab = this.route.snapshot.data['defaultTab'] as Tab | undefined;
    if (defaultTab) {
      this.activeTab.set(defaultTab);
    }

    this.route.queryParams.subscribe((params) => {
      if (params['q']) {
        this.searchQuery = params['q'];
      }
      if (params['tab'] && ['all', 'movies', 'tv'].includes(params['tab'])) {
        this.activeTab.set(params['tab'] as Tab);
      }
      this.loadContent();
    });
  }

  onSearchChange(query: string): void {
    if (this.searchTimeout) clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.loadContent();
    }, 400);
  }

  loadContent(): void {
    this.loading.set(true);
    this.currentPage = 1;
    this.fetchData(1, true);
  }

  loadMore(): void {
    this.loadingMore.set(true);
    this.fetchData(this.currentPage + 1, false);
  }

  private fetchData(page: number, reset: boolean): void {
    const query = this.searchQuery.trim();
    const tab = this.activeTab();

    if (query) {
      this.tmdb.search(query, page).subscribe({
        next: (res) => this.handleResults(res.results, res.total_pages, page, reset, tab),
        error: () => this.handleError(reset),
      });
    } else if (tab === 'tv') {
      this.tmdb.discoverTv(page).subscribe({
        next: (res) =>
          this.handleResults(
            res.results.map((r) => ({ ...r, media_type: 'tv' as const })),
            res.total_pages,
            page,
            reset,
            tab,
          ),
        error: () => this.handleError(reset),
      });
    } else {
      this.tmdb.getTrending(tab === 'movies' ? 'movie' : 'all', 'week', page).subscribe({
        next: (res) => this.handleResults(res.results, res.total_pages, page, reset, tab),
        error: () => this.handleError(reset),
      });
    }
  }

  private handleResults(
    items: TmdbMedia[],
    totalPages: number,
    page: number,
    reset: boolean,
    tab: Tab,
  ): void {
    let filtered = items;
    if (tab === 'movies') filtered = items.filter((i) => (i.media_type || 'movie') === 'movie');
    if (tab === 'tv')
      filtered = items.filter((i) => (i.media_type || (i.name ? 'tv' : 'movie')) === 'tv');

    this.currentPage = page;
    this.totalPages = totalPages;
    this.hasMore.set(page < totalPages);

    if (reset) {
      this.results.set(filtered);
    } else {
      this.results.update((prev) => [...prev, ...filtered]);
    }

    this.loading.set(false);
    this.loadingMore.set(false);
  }

  private handleError(reset: boolean): void {
    if (reset) this.results.set([]);
    this.loading.set(false);
    this.loadingMore.set(false);
  }
}
