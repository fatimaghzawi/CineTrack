import { Component, signal } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { AuthService } from '@core/services/auth.service';
import { ToastService } from '@core/services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex bg-surface-deep">
      <!-- Left: branding panel -->
      <div class="hidden lg:flex lg:w-1/2 bg-dark-gradient items-center justify-center p-12 relative overflow-hidden">
        <div class="absolute inset-0 opacity-10">
          <div class="absolute top-20 left-20 w-72 h-72 bg-primary rounded-full blur-[120px]"></div>
          <div class="absolute bottom-20 right-20 w-96 h-96 bg-accent-gold rounded-full blur-[150px]"></div>
        </div>
        <div class="relative z-10 max-w-md text-center">
          <div class="w-16 h-16 rounded-2xl bg-gold-gradient flex items-center justify-center mx-auto mb-8">
            <svg class="w-9 h-9 text-surface-deep" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z"/>
            </svg>
          </div>
          <h1 class="text-4xl font-bold text-text-primary mb-4">
            Cine<span class="text-primary">Track</span>
          </h1>
          <p class="text-text-secondary text-lg leading-relaxed">
            Your personal movie and TV show tracker. Discover, organize, and relive your entertainment journey.
          </p>
        </div>
      </div>

      <!-- Right: login form -->
      <div class="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div class="w-full max-w-md animate-fade-in">
          <!-- Mobile logo -->
          <div class="lg:hidden flex items-center gap-3 mb-10">
            <div class="w-10 h-10 rounded-xl bg-gold-gradient flex items-center justify-center">
              <svg class="w-6 h-6 text-surface-deep" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z"/>
              </svg>
            </div>
            <span class="text-xl font-bold">Cine<span class="text-primary">Track</span></span>
          </div>

          <h2 class="text-3xl font-bold text-text-primary mb-2">Welcome back</h2>
          <p class="text-text-secondary mb-8">Sign in to continue your journey</p>

          <!-- Form -->
          <div class="space-y-5">
            <div>
              <label class="block text-sm font-medium text-text-secondary mb-2">Email</label>
              <input
                type="email"
                [(ngModel)]="email"
                placeholder="you&#64;example.com"
                class="input-field"
                (keyup.enter)="onLogin()"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-text-secondary mb-2">Password</label>
              <div class="relative">
                <input
                  [type]="showPassword() ? 'text' : 'password'"
                  [(ngModel)]="password"
                  placeholder="Enter your password"
                  class="input-field pr-12"
                  (keyup.enter)="onLogin()"
                />
                <button
                  type="button"
                  (click)="showPassword.set(!showPassword())"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
                >
                  {{ showPassword() ? '🙈' : '👁️' }}
                </button>
              </div>
            </div>

            <button
              (click)="onLogin()"
              [disabled]="loading()"
              class="btn-primary w-full flex items-center justify-center gap-2"
            >
              @if (loading()) {
                <svg class="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Signing in...
              } @else {
                Sign In
              }
            </button>
          </div>

          <p class="mt-8 text-center text-text-secondary text-sm">
            Don't have an account?
            <a routerLink="/register" class="text-primary hover:text-primary-hover font-medium transition-colors">
              Create one
            </a>
          </p>
        </div>
      </div>
    </div>
  `,
})
export class LoginComponent {
  email = '';
  password = '';
  loading = signal(false);
  showPassword = signal(false);

  constructor(
    private auth: AuthService,
    private toast: ToastService,
    private router: Router,
  ) {}

  onLogin(): void {
    if (!this.email || !this.password) {
      this.toast.error('Please fill in all fields');
      return;
    }
    this.loading.set(true);
    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.toast.success('Welcome back!');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading.set(false);
        const msg = err.error?.error?.message || 'Invalid email or password';
        this.toast.error(msg);
      },
    });
  }
}
