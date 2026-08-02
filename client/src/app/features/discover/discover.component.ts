import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { TmdbService } from '@core/services/tmdb.service';
import { TmdbMedia } from '@core/models/movie.model';
import { MovieCardComponent } from '@shared/components/movie-card/movie-card.component';
import { SkeletonLoaderComponent } from '@shared/components/skeleton-loader/skeleton-loader.component';

type Tab = 'all' | 'movies' | 'tv';

@Component({
  selector: 'app-discover',
  standalone: true,
  imports: [FormsModule, MovieCardComponent, SkeletonLoaderComponent],
  template: `
    <div class="page-container animate-fade-in">
      <h1 class="text-3xl font-bold text-text-primary mb-2">Discover</h1>
      <p class="text-text-secondary mb-6">Explore movies and TV shows</p>

      <!-- Search bar -->
      <div class="relative max-w-xl mb-8">
        <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
        <input
          type="text"
          [(ngModel)]="searchQuery"
          (ngModelChange)="onSearchChange($event)"
          placeholder="Search movies or TV shows..."
          class="input-field pl-12 text-base"
        />
      </div>

      <!-- Tabs -->
      <div class="flex gap-2 mb-8">
        @for (tab of tabs; track tab.key) {
          <button
            (click)="activeTab.set(tab.key); loadContent()"
            class="px-5 py-2 rounded-xl text-sm font-medium transition-all duration-200"
            [class]="activeTab() === tab.key
              ? 'bg-primary text-surface-deep'
              : 'bg-surface-card text-text-secondary hover:text-text-primary hover:bg-surface-elevated'"
          >
            {{ tab.label }}
          </button>
        }
      </div>

      <!-- Results grid -->
      @if (loading()) {
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          @for (i of skeletons; track i) {
            <app-skeleton height="280px" className="rounded-2xl" />
          }
        </div>
      } @else if (results().length === 0) {
        <div class="text-center py-20">
          <div class="text-5xl mb-4">🎬</div>
          <h3 class="text-xl font-semibold text-text-primary mb-2">No results found</h3>
          <p class="text-text-secondary">Try a different search term or browse trending</p>
        </div>
      } @else {
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          @for (item of results(); track item.id) {
            <app-movie-card [media]="item" />
          }
        </div>

        <!-- Load more -->
        @if (hasMore()) {
          <div class="flex justify-center mt-8 pb-8">
            <button (click)="loadMore()" class="btn-outline" [disabled]="loadingMore()">
              {{ loadingMore() ? 'Loading...' : 'Load More' }}
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
        next: (res) => this.handleResults(
          res.results.map((r) => ({ ...r, media_type: 'tv' as const })),
          res.total_pages, page, reset, tab,
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

  private handleResults(items: TmdbMedia[], totalPages: number, page: number, reset: boolean, tab: Tab): void {
    let filtered = items;
    if (tab === 'movies') filtered = items.filter((i) => (i.media_type || 'movie') === 'movie');
    if (tab === 'tv') filtered = items.filter((i) => (i.media_type || (i.name ? 'tv' : 'movie')) === 'tv');

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
