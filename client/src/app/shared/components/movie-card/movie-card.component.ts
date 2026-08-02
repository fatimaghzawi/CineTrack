import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';

import { TmdbMedia } from '@core/models/movie.model';
import { TmdbService } from '@core/services/tmdb.service';

@Component({
  selector: 'app-movie-card',
  standalone: true,
  imports: [RouterLink, DecimalPipe],
  template: `
    <a
      [routerLink]="detailRoute()"
      class="group block cursor-pointer"
    >
      <!-- Poster -->
      <div class="relative aspect-[2/3] overflow-hidden rounded-xl bg-surface-card">
        <img
          [src]="tmdb.posterUrl(media().poster_path)"
          [alt]="tmdb.getTitle(media())"
          class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <!-- Watched badge -->
        @if (showWatchedBadge()) {
          <div class="absolute top-2 right-2 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
            <svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
            </svg>
          </div>
        }
        <!-- Hover overlay -->
        <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
          <span class="text-xs text-white/80 font-medium">View Details</span>
        </div>
      </div>

      <!-- Info -->
      <div class="mt-2.5 px-0.5">
        <h3 class="text-sm font-semibold text-text-primary truncate group-hover:text-primary transition-colors">
          {{ tmdb.getTitle(media()) }}
        </h3>
        <div class="flex items-center gap-2 mt-1">
          @if (media().vote_average > 0) {
            <div class="flex items-center gap-1">
              <svg class="w-3.5 h-3.5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
              <span class="text-xs font-medium text-text-secondary">
                {{ media().vote_average.toFixed(1) }}
              </span>
            </div>
          }
          <span class="text-xs text-text-muted">{{ tmdb.getYear(media()) }}</span>
        </div>
        @if (episodeInfo()) {
          <p class="text-xs text-text-muted mt-0.5">{{ episodeInfo() }}</p>
        }
      </div>
    </a>
  `,
})
export class MovieCardComponent {
  media = input.required<TmdbMedia>();
  showWatchedBadge = input(false);
  episodeInfo = input('');

  constructor(public tmdb: TmdbService) {}

  detailRoute(): string {
    const m = this.media();
    const type = m.media_type || (m.title ? 'movie' : 'tv');
    return `/${type}/${m.id}`;
  }
}
