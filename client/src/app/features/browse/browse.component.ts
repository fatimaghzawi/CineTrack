import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { TmdbService } from '@core/services/tmdb.service';
import { MediaType, TmdbMedia } from '@core/models/movie.model';
import { GenreRow, MOVIE_GENRE_ROWS, TV_GENRE_ROWS } from '@core/constants/genres';
import { MediaRowComponent } from '@shared/components/media-row/media-row.component';
import { MovieCardComponent } from '@shared/components/movie-card/movie-card.component';
import { SkeletonLoaderComponent } from '@shared/components/skeleton-loader/skeleton-loader.component';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';
import { IconComponent } from '@shared/components/icon/icon.component';

interface Rail {
  title: string;
  items: TmdbMedia[];
  loading: boolean;
}

/** Number of titles kept per rail — enough to scroll a few pages without over-fetching. */
const RAIL_SIZE = 18;

/**
 * Browse page for `/movies` and `/tv-shows` — a trending rail followed by one
 * horizontally scrolling rail per curated genre. The media type comes from the
 * route's `data.mediaType`, so one component serves both pages.
 *
 * Typing in the search box swaps the rails for a flat result grid; `/discover`
 * remains the dedicated search page with its own pagination.
 */
@Component({
  selector: 'app-browse',
  standalone: true,
  imports: [
    FormsModule,
    MediaRowComponent,
    MovieCardComponent,
    SkeletonLoaderComponent,
    EmptyStateComponent,
    IconComponent,
  ],
  template: `
    <div class="page-container animate-fade-in">
      <h1 class="page-title">{{ pageTitle() }}</h1>
      <p class="mt-1.5 text-sm text-text-secondary">{{ pageSubtitle() }}</p>

      <!-- Search -->
      <div class="relative max-w-xl mt-6">
        <app-icon
          name="search"
          class="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-text-muted pointer-events-none"
        />
        <input
          type="search"
          name="browseSearch"
          [(ngModel)]="searchQuery"
          (ngModelChange)="onSearchChange()"
          [placeholder]="searchPlaceholder()"
          [attr.aria-label]="searchPlaceholder()"
          class="input-field pl-12 h-12"
        />
      </div>

      @if (isSearching()) {
        <!-- Search results: flat grid, same shape as Discover -->
        <div class="mt-7">
          @if (searchLoading()) {
            <div class="poster-grid">
              @for (i of skeletons; track i) {
                <app-skeleton className="aspect-[2/3] w-full" />
              }
            </div>
          } @else if (searchResults().length === 0) {
            <app-empty-state
              icon="film"
              title="No results found"
              message="Try a different search term, or clear the search to browse by category."
            />
          } @else {
            <div class="poster-grid">
              @for (item of searchResults(); track item.id) {
                <app-movie-card [media]="item" />
              }
            </div>
          }
        </div>
      } @else {
        <!-- Category rails -->
        <div class="mt-7 space-y-8">
          @for (rail of rails(); track rail.title) {
            <app-media-row
              [title]="rail.title"
              [items]="rail.items"
              [loading]="rail.loading"
              actionLabel="See all"
              actionRoute="/discover"
              [actionParams]="discoverParams()"
            />
          }
        </div>
      }
    </div>
  `,
})
export class BrowseComponent implements OnInit {
  searchQuery = '';
  mediaType = signal<MediaType>('movie');
  rails = signal<Rail[]>([]);
  searchResults = signal<TmdbMedia[]>([]);
  searchLoading = signal(false);
  isSearching = signal(false);

  skeletons = Array.from({ length: 12 }, (_, i) => i);

  private searchTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private tmdb: TmdbService,
    private route: ActivatedRoute,
  ) {}

  pageTitle(): string {
    return this.mediaType() === 'tv' ? 'TV Shows' : 'Movies';
  }

  pageSubtitle(): string {
    return this.mediaType() === 'tv'
      ? 'Browse series by category'
      : 'Browse movies by category';
  }

  searchPlaceholder(): string {
    return this.mediaType() === 'tv' ? 'Search TV shows...' : 'Search movies...';
  }

  discoverParams(): Record<string, string> {
    return { tab: this.mediaType() === 'tv' ? 'tv' : 'movies' };
  }

  ngOnInit(): void {
    const type = (this.route.snapshot.data['mediaType'] as MediaType | undefined) ?? 'movie';
    this.mediaType.set(type);
    this.loadRails(type);
  }

  onSearchChange(): void {
    if (this.searchTimeout) clearTimeout(this.searchTimeout);

    const query = this.searchQuery.trim();
    if (!query) {
      this.isSearching.set(false);
      this.searchResults.set([]);
      return;
    }

    this.isSearching.set(true);
    this.searchLoading.set(true);
    this.searchTimeout = setTimeout(() => this.runSearch(query), 400);
  }

  private runSearch(query: string): void {
    const type = this.mediaType();

    this.tmdb.search(query).subscribe({
      next: (res) => {
        // /search/multi also returns people; drop them, then keep only this
        // page's media type.
        this.searchResults.set(
          res.results.filter(
            (item) =>
              (item.media_type as string | undefined) !== 'person' &&
              this.resolveType(item) === type,
          ),
        );
        this.searchLoading.set(false);
      },
      error: () => {
        this.searchResults.set([]);
        this.searchLoading.set(false);
      },
    });
  }

  private loadRails(type: MediaType): void {
    const genres: GenreRow[] = type === 'tv' ? TV_GENRE_ROWS : MOVIE_GENRE_ROWS;

    // Seed every rail up front so headings and skeletons paint immediately,
    // then patch each one in place as its request lands.
    this.rails.set([
      { title: 'Trending This Week', items: [], loading: true },
      ...genres.map((genre) => ({ title: genre.name, items: [], loading: true })),
    ]);

    this.tmdb.getTrending(type, 'week').subscribe({
      next: (res) => this.fillRail(0, res.results, type),
      error: () => this.fillRail(0, [], type),
    });

    genres.forEach((genre, i) => {
      const request =
        type === 'tv'
          ? this.tmdb.discoverTv(1, 'popularity.desc', String(genre.id))
          : this.tmdb.discoverMovies(1, 'popularity.desc', String(genre.id));

      request.subscribe({
        next: (res) => this.fillRail(i + 1, res.results, type),
        error: () => this.fillRail(i + 1, [], type),
      });
    });
  }

  private fillRail(index: number, items: TmdbMedia[], type: MediaType): void {
    // Both trending (called with an explicit type) and discover return a single
    // media type, but discover omits `media_type` — stamp it so the poster card
    // can derive its /movie/:id vs /tv/:id link.
    const stamped = items.slice(0, RAIL_SIZE).map((item) => ({ ...item, media_type: type }));

    this.rails.update((rails) =>
      rails.map((rail, i) => (i === index ? { ...rail, items: stamped, loading: false } : rail)),
    );
  }

  /** /search/multi mixes movies, shows and people; infer the type when TMDb omits it. */
  private resolveType(item: TmdbMedia): string {
    return item.media_type || (item.title ? 'movie' : 'tv');
  }
}
