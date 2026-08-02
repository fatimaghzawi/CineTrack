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

  private currentUser = signal<User | null>(null);
  private accessToken = signal<string | null>(null);

  readonly user = this.currentUser.asReadonly();
  readonly isAuthenticated = computed(() => !!this.currentUser());

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {
    this.loadFromStorage();
  }

  register(payload: RegisterPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.api}/register`, payload).pipe(
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
