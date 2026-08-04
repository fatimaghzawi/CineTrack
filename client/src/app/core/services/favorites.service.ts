import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';

import { ApiService } from './api.service';
import { FavoriteItem, MediaType } from '../models/movie.model';
import { PaginatedData } from '../models/api-response.model';

@Injectable({ providedIn: 'root' })
export class FavoritesService {
  constructor(private api: ApiService) {}

  getAll(params?: {
    mediaType?: MediaType;
    page?: number;
    limit?: number;
  }): Observable<PaginatedData<FavoriteItem>> {
    return this.api
      .get<PaginatedData<FavoriteItem>>('/favorites', params as Record<string, string | number>)
      .pipe(map((res) => res.data));
  }

  add(tmdbId: number, mediaType: MediaType): Observable<FavoriteItem> {
    return this.api
      .post<{ favorite: FavoriteItem }>('/favorites', { tmdbId, mediaType })
      .pipe(map((res) => res.data.favorite));
  }

  remove(id: string): Observable<void> {
    return this.api.delete<void>(`/favorites/${id}`).pipe(map(() => void 0));
  }
}
