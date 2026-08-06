/**
 * Auth state + auth API calls in one service — a good example of Angular's
 * "services hold state, components just render it" pattern.
 *
 * State here is held in **Signals**, Angular's modern (v16+) reactivity
 * primitive: `signal(initialValue)` creates a reactive box you read by
 * *calling* it like a function (`this.currentUser()`) and write with
 * `.set()`/`.update()`. Any template or `computed()` that reads a signal
 * automatically re-runs when that signal changes — no manual subscribing,
 * no Zone.js-driven "check everything" pass. This largely replaces the
 * older pattern of exposing `Observable<T>` state via BehaviorSubjects.
 */
import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';

import { environment } from '@env/environment';
import {
  User,
  AuthResponse,
  LoginPayload,
  RegisterPayload,
} from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = `${environment.apiUrl}/auth`;

  // Private, writable signals — only this service is allowed to change them.
  private currentUser = signal<User | null>(null);
  private accessToken = signal<string | null>(null);

  // Publicly exposed as read-only. `.asReadonly()` returns a signal that can
  // be read but not `.set()` from outside, so components can react to the
  // logged-in user without being able to overwrite it themselves.
  readonly user = this.currentUser.asReadonly();

  // `computed()` derives a new signal from others. It's lazily recalculated
  // only when read *and* one of its dependencies (currentUser here) has
  // actually changed since the last read — not recomputed on every change
  // detection cycle.
  readonly isAuthenticated = computed(() => !!this.currentUser());

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {
    // Re-hydrate signals from localStorage on app startup, so a page
    // refresh doesn't log the user out.
    this.loadFromStorage();
  }

  register(payload: RegisterPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.api}/register`, payload).pipe(
      // tap() runs a side effect (updating our signals) without changing
      // what flows through the Observable — the component that calls
      // register() still receives the original AuthResponse in .subscribe().
      tap((res) => this.handleAuthSuccess(res)),
      catchError((err) => throwError(() => err)),
    );
  }

  login(payload: LoginPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.api}/login`, payload).pipe(
      tap((res) => this.handleAuthSuccess(res)),
      catchError((err) => throwError(() => err)),
    );
  }

  logout(): void {
    this.http.post(`${this.api}/logout`, {}).subscribe({
      complete: () => this.clearSession(),
      error: () => this.clearSession(),
    });
  }

  getToken(): string | null {
    return this.accessToken();
  }

  /** Updates in-memory signals + persists to localStorage after a successful login/register. */
  private handleAuthSuccess(res: AuthResponse): void {
    this.currentUser.set(res.data.user);
    this.accessToken.set(res.data.accessToken);
    localStorage.setItem('ct_user', JSON.stringify(res.data.user));
    localStorage.setItem('ct_token', res.data.accessToken);
  }

  private clearSession(): void {
    this.currentUser.set(null);
    this.accessToken.set(null);
    localStorage.removeItem('ct_user');
    localStorage.removeItem('ct_token');
    this.router.navigate(['/login']);
  }

  private loadFromStorage(): void {
    try {
      const user = localStorage.getItem('ct_user');
      const token = localStorage.getItem('ct_token');
      if (user && token) {
        this.currentUser.set(JSON.parse(user));
        this.accessToken.set(token);
      }
    } catch {
      this.clearSession();
    }
  }
}
