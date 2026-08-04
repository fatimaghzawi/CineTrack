import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';

import { ApiService } from './api.service';
import {
  WatchlistItem,
  WatchStatus,
  MediaType,
  WatchProgress,
} from '../models/movie.model';
import { PaginatedData } from '../models/api-response.model';

@Injectable({ providedIn: 'root' })
export class WatchlistService {
  constructor(private api: ApiService) {}

  getAll(
    params?: {
      status?: WatchStatus;
      mediaType?: MediaType;
      page?: number;
      limit?: number;
    },
  ): Observable<PaginatedData<WatchlistItem>> {
    return this.api
      .get<PaginatedData<WatchlistItem>>('/watchlist', params as Record<string, string | number>)
      .pipe(map((res) => res.data));
  }

  add(data: {
    tmdbId: number;
    mediaType: MediaType;
    status?: WatchStatus;
    notes?: string;
  }): Observable<WatchlistItem> {
    return this.api
      .post<{ item: WatchlistItem }>('/watchlist', data)
      .pipe(map((res) => res.data.item));
  }

  update(
    id: string,
    data: { status?: WatchStatus; progress?: WatchProgress; notes?: string },
  ): Observable<WatchlistItem> {
    return this.api
      .patch<{ item: WatchlistItem }>(`/watchlist/${id}`, data)
      .pipe(map((res) => res.data.item));
  }

  remove(id: string): Observable<void> {
    return this.api.delete<void>(`/watchlist/${id}`).pipe(map(() => void 0));
  }
}
