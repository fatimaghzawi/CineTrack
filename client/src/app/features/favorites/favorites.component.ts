import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';

import { FavoritesService } from '@core/services/favorites.service';
import { TmdbService } from '@core/services/tmdb.service';
import { ToastService } from '@core/services/toast.service';
import { FavoriteItem, TmdbMedia } from '@core/models/movie.model';
import { MovieCardComponent } from '@shared/components/movie-card/movie-card.component';
import { SkeletonLoaderComponent } from '@shared/components/skeleton-loader/skeleton-loader.component';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [RouterLink, MovieCardComponent, SkeletonLoaderComponent],
  template: `
    <div class="page-container animate-fade-in">
      <h1 class="text-3xl font-bold text-text-primary mb-2">Favorites</h1>
      <p class="text-text-secondary mb-8">{{ items().length }} titles you love</p>

      @if (loading()) {
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          @for (i of [1,2,3,4,5,6]; track i) {
            <app-skeleton height="280px" className="rounded-xl" />
          }
        </div>
      } @else if (items().length === 0) {
        <div class="text-center py-20">
          <div class="text-5xl mb-4">❤️</div>
          <h3 class="text-xl font-semibold text-text-primary mb-2">No favorites yet</h3>
          <p class="text-text-secondary mb-6">Mark movies and shows as favorites from their detail pages</p>
          <a routerLink="/discover" class="btn-primary">Discover Now</a>
        </div>
      } @else {
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          @for (item of items(); track item.id) {
            @if (mediaCache().get(item.tmdbId); as media) {
              <div class="relative group">
                <app-movie-card [media]="media" />
                <button
                  (click)="removeFavorite(item)"
                  class="absolute top-2 left-2 p-1.5 rounded-lg bg-surface-deep/80 backdrop-blur-sm
                         text-red-400 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 transition-all z-10"
                >
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd"/>
                  </svg>
                </button>
              </div>
            }
          }
        </div>
      }
    </div>
  `,
})
export class FavoritesComponent implements OnInit {
  items = signal<FavoriteItem[]>([]);
  mediaCache = signal<Map<number, TmdbMedia>>(new Map());
  loading = signal(true);

  constructor(
    private favoritesService: FavoritesService,
    private tmdb: TmdbService,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.favoritesService.getAll().subscribe({
      next: (data) => {
        this.items.set(data.items);
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
      this.mediaCache.update((c) => {
        const m = new Map(c);
        m.set(tmdbId, { ...media, media_type: mediaType } as TmdbMedia);
        return m;
      });
    });
  }

  removeFavorite(item: FavoriteItem): void {
    this.favoritesService.remove(item.id).subscribe({
      next: () => {
        this.items.update((list) => list.filter((i) => i.id !== item.id));
        this.toast.success('Removed from favorites');
      },
      error: () => this.toast.error('Failed to remove'),
    });
  }
}
