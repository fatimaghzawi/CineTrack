/**
 * Thin wrapper around Angular's HttpClient — the single place that knows
 * the backend's base URL and the shape every response comes wrapped in
 * (`{ success, data }`, see ApiSuccessResponse). Every other service in the
 * app (auth, tmdb, watchlist, ...) calls through here instead of injecting
 * HttpClient directly, so that base-URL/response-shape logic exists once.
 *
 * `@Injectable({ providedIn: 'root' })` registers this class with Angular's
 * dependency-injection system as an app-wide singleton — one instance is
 * created the first time anything injects it, and every subsequent
 * injection (in any component or service, anywhere) gets that same
 * instance back. This is how state and behavior get shared across the app
 * without manually passing objects down through every component.
 *
 * Every method returns an `Observable` (an RxJS stream), not a `Promise`.
 * Nothing happens until something calls `.subscribe()` on it — HttpClient
 * requests are "cold" and lazy, so an unsubscribed Observable never fires
 * the actual HTTP call.
 */
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '@env/environment';
import { ApiSuccessResponse } from '../models/api-response.model';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly baseUrl = environment.apiUrl;

  // Constructor (dependency) injection — Angular sees the `HttpClient` type
  // annotation and automatically supplies an instance when this service is
  // created. Nothing here manually constructs an HttpClient with `new`.
  constructor(private http: HttpClient) {}

  get<T>(path: string, params?: Record<string, string | number | boolean>): Observable<ApiSuccessResponse<T>> {
    // HttpParams is immutable too (same pattern as HttpRequest.clone() in
    // the interceptor) — .set() returns a new HttpParams each time rather
    // than mutating the existing one, hence reassigning httpParams below.
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, String(value));
        }
      });
    }
    return this.http.get<ApiSuccessResponse<T>>(`${this.baseUrl}${path}`, { params: httpParams });
  }

  post<T>(path: string, body: unknown = {}): Observable<ApiSuccessResponse<T>> {
    return this.http.post<ApiSuccessResponse<T>>(`${this.baseUrl}${path}`, body);
  }

  patch<T>(path: string, body: unknown = {}): Observable<ApiSuccessResponse<T>> {
    return this.http.patch<ApiSuccessResponse<T>>(`${this.baseUrl}${path}`, body);
  }

  put<T>(path: string, body: unknown = {}): Observable<ApiSuccessResponse<T>> {
    return this.http.put<ApiSuccessResponse<T>>(`${this.baseUrl}${path}`, body);
  }

  /** `body` is only needed by the few endpoints that identify a sub-resource by
   *  payload rather than by path (e.g. removing a title from a collection). */
  delete<T>(path: string, body?: unknown): Observable<ApiSuccessResponse<T>> {
    return this.http.delete<ApiSuccessResponse<T>>(`${this.baseUrl}${path}`, { body });
  }
}
