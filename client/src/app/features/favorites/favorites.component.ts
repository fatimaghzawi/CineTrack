import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';

import { FavoritesService } from '@core/services/favorites.service';
import { TmdbService } from '@core/services/tmdb.service';
import { ToastService } from '@core/services/toast.service';
import { FavoriteItem, TmdbMedia } from '@core/models/movie.model';
import { MovieCardComponent } from '@shared/components/movie-card/movie-card.component';
import { SkeletonLoaderComponent } from '@shared/components/skeleton-loader/skeleton-loader.component';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';
import { IconComponent } from '@shared/components/icon/icon.component';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [
    RouterLink,
    MovieCardComponent,
    SkeletonLoaderComponent,
    EmptyStateComponent,
    IconComponent,
  ],
  template: `
    <div class="page-container animate-fade-in">
      <h1 class="page-title">Favorites</h1>
      <p class="mt-1.5 text-sm text-text-secondary mb-7">
        {{ items().length }} title{{ items().length === 1 ? '' : 's' }} you love
      </p>

      @if (loading()) {
        <div class="poster-grid">
          @for (i of skeletons; track i) {
            <app-skeleton className="aspect-[2/3] w-full" />
          }
        </div>
      } @else if (items().length === 0) {
        <app-empty-state
          icon="heart"
          title="No favorites yet"
          message="Mark movies and shows as favorites from their detail pages and they'll gather here."
          [hasAction]="true"
        >
          <a routerLink="/discover" class="btn-primary">Discover Now</a>
        </app-empty-state>
      } @else {
        <div class="poster-grid">
          @for (item of items(); track item.id) {
            @if (mediaCache().get(item.tmdbId); as media) {
              <div class="relative group/fav">
                <app-movie-card [media]="media" />

                <button
                  type="button"
                  (click)="removeFavorite(item)"
                  [attr.aria-label]="'Remove ' + tmdb.getTitle(media) + ' from favorites'"
                  class="absolute top-2 left-2 z-10 grid place-items-center h-8 w-8 rounded-lg
                         bg-surface-deep/85 backdrop-blur-md border border-hairline text-red-400
                         opacity-0 group-hover/fav:opacity-100 focus:opacity-100
                         hover:bg-red-500/20 hover:border-red-500/40
                         transition-all duration-200 ease-smooth"
                >
                  <app-icon name="heart" [filled]="true" class="w-4 h-4" />
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
  skeletons = Array.from({ length: 12 }, (_, i) => i);

  constructor(
    private favoritesService: FavoritesService,
    public tmdb: TmdbService,
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
    const obs: Observable<any> =
      mediaType === 'movie' ? this.tmdb.getMovie(tmdbId) : this.tmdb.getTv(tmdbId);

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
