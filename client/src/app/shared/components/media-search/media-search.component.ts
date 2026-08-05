import { Component, ElementRef, inject, input, model, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MediaType, TmdbMedia } from '@core/models/movie.model';
import { TmdbService } from '@core/services/tmdb.service';
import { IconComponent } from '@shared/components/icon/icon.component';

/** How many suggestions to show under the field. */
const MAX_SUGGESTIONS = 8;

/**
 * Type-ahead title picker — search by name ("spider") instead of pasting a
 * TMDb id. Binds two-way to the chosen title:
 *
 *   <app-media-search [(selected)]="picked" mediaType="movie" />
 *
 * The selected `TmdbMedia` carries `id` and `media_type`, which is what the
 * journal/collection APIs actually want.
 */
@Component({
  selector: 'app-media-search',
  standalone: true,
  imports: [FormsModule, IconComponent],
  host: {
    class: 'block',
    '(document:click)': 'onDocumentClick($event)',
    '(document:keydown.escape)': 'close()',
  },
  template: `
    <div class="relative" #root>
      @if (selected(); as picked) {
        <!-- Chosen title -->
        <div
          class="flex items-center gap-3 p-2 rounded-lg bg-surface-card border border-hairline"
        >
          <span class="w-9 h-[52px] shrink-0 rounded overflow-hidden bg-surface-elevated">
            <img
              [src]="tmdb.posterUrl(picked.poster_path, 'w185')"
              alt=""
              class="w-full h-full object-cover"
            />
          </span>
          <span class="flex-1 min-w-0">
            <span class="block text-[13.5px] font-semibold text-text-primary truncate">
              {{ tmdb.getTitle(picked) }}
            </span>
            <span class="block text-2xs text-text-muted">
              {{ typeLabel(picked) }} · {{ tmdb.getYear(picked) }}
            </span>
          </span>
          <button
            type="button"
            (click)="clear()"
            class="btn-round h-8 w-8 shrink-0"
            aria-label="Clear selected title"
          >
            <app-icon name="close" class="w-4 h-4" />
          </button>
        </div>
      } @else {
        <!-- Search field -->
        <app-icon
          name="search"
          class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none"
        />
        <input
          type="text"
          autocomplete="off"
          [(ngModel)]="query"
          (ngModelChange)="onQueryChange()"
          (focus)="onQueryChange()"
          [placeholder]="placeholder()"
          [attr.aria-label]="placeholder()"
          class="input-field pl-11"
        />

        @if (open()) {
          <div
            class="absolute left-0 right-0 top-full mt-2 z-40 max-h-80 overflow-y-auto p-1.5
                   bg-surface-dark border border-hairline rounded-xl shadow-pop animate-scale-in"
          >
            @if (loading()) {
              <p class="px-3 py-4 text-center text-[13px] text-text-muted">Searching...</p>
            } @else if (results().length === 0) {
              <p class="px-3 py-4 text-center text-[13px] text-text-muted">
                No titles match "{{ query }}".
              </p>
            } @else {
              @for (item of results(); track item.id) {
                <button
                  type="button"
                  (click)="choose(item)"
                  class="w-full flex items-center gap-3 p-2 rounded-lg text-left
                         transition-colors duration-200 hover:bg-surface-card"
                >
                  <span class="w-8 h-12 shrink-0 rounded overflow-hidden bg-surface-elevated">
                    <img
                      [src]="tmdb.posterUrl(item.poster_path, 'w185')"
                      alt=""
                      class="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </span>
                  <span class="flex-1 min-w-0">
                    <span class="block text-[13.5px] font-medium text-text-primary truncate">
                      {{ tmdb.getTitle(item) }}
                    </span>
                    <span class="block text-2xs text-text-muted">
                      {{ typeLabel(item) }} · {{ tmdb.getYear(item) }}
                    </span>
                  </span>
                </button>
              }
            }
          </div>
        }
      }
    </div>
  `,
})
export class MediaSearchComponent {
  /** Restrict suggestions to one media type, or 'all' to allow both. */
  mediaType = input<MediaType | 'all'>('all');
  placeholder = input('Search by title, e.g. "spider"');
  selected = model<TmdbMedia | null>(null);

  query = '';
  results = signal<TmdbMedia[]>([]);
  loading = signal(false);
  open = signal(false);

  tmdb = inject(TmdbService);

  private root = viewChild<ElementRef<HTMLElement>>('root');
  private timeout: ReturnType<typeof setTimeout> | null = null;

  onQueryChange(): void {
    if (this.timeout) clearTimeout(this.timeout);

    const query = this.query.trim();
    if (query.length < 2) {
      this.open.set(false);
      this.results.set([]);
      return;
    }

    this.open.set(true);
    this.loading.set(true);
    this.timeout = setTimeout(() => this.run(query), 350);
  }

  choose(item: TmdbMedia): void {
    // /search/multi omits media_type on some payloads; pin it so callers can
    // trust `selected().media_type`.
    this.selected.set({ ...item, media_type: this.resolveType(item) });
    this.query = '';
    this.results.set([]);
    this.open.set(false);
  }

  clear(): void {
    this.selected.set(null);
    this.query = '';
    this.results.set([]);
  }

  close(): void {
    this.open.set(false);
  }

  onDocumentClick(event: MouseEvent): void {
    if (!this.open()) return;

    const root = this.root()?.nativeElement;
    if (root && !root.contains(event.target as Node)) this.close();
  }

  typeLabel(item: TmdbMedia): string {
    return this.resolveType(item) === 'tv' ? 'TV Show' : 'Movie';
  }

  private run(query: string): void {
    const wanted = this.mediaType();

    this.tmdb.search(query).subscribe({
      next: (res) => {
        const items = res.results.filter((item) => {
          // /search/multi also returns people; they carry a `name` but no poster,
          // so they'd otherwise be mistaken for shows.
          if (!this.isMedia(item)) return false;
          return wanted === 'all' ? true : this.resolveType(item) === wanted;
        });

        this.results.set(items.slice(0, MAX_SUGGESTIONS));
        this.loading.set(false);
      },
      error: () => {
        this.results.set([]);
        this.loading.set(false);
      },
    });
  }

  private resolveType(item: TmdbMedia): MediaType {
    if (item.media_type === 'movie' || item.media_type === 'tv') return item.media_type;
    return item.title ? 'movie' : 'tv';
  }

  /** TMDb types `media_type` as movie | tv | person; only the first two are titles. */
  private isMedia(item: TmdbMedia): boolean {
    return (item.media_type as string | undefined) !== 'person';
  }
}
