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
    <div class="min-h-screen lg:flex bg-surface-deep">
      <!-- Brand panel: centered video with margins -->
      <aside class="hidden lg:flex lg:w-1/2 relative items-center justify-center p-10 bg-surface-dark border-r border-surface-elevated/50">
        <div class="relative w-full h-full max-h-[90vh] rounded-3xl overflow-hidden shadow-2xl shadow-black/50 border border-surface-elevated/40">
          <video
            class="w-full h-full object-cover"
            autoplay
            muted
            loop
            playsinline
            poster="assets/videos/Cinetrack-poster.svg"
          >
            <source src="assets/videos/CineTrack.mp4" type="video/mp4" />
          </video>

          <!-- Dark overlay for contrast -->
          <div class="absolute inset-0 bg-surface-deep/40"></div>
          <div class="absolute inset-0 bg-gradient-to-t from-surface-deep via-transparent to-surface-deep/20"></div>

          <!-- Small logo mark, top-left -->
          <!-- <div class="absolute top-6 left-6 flex items-center gap-2.5">
            <img src="assets/images/Logo.png" alt="CineTrack" class="w-9 h-9 object-contain" />
            <span class="text-lg font-bold text-text-primary tracking-tight">
              Cine<span class="text-primary">Track</span>
            </span>
          </div> -->
        </div>
      </aside>

      <!-- Form -->
      <main class="flex-1 grid place-items-center p-6 sm:p-12">
        <div class="w-full max-w-md animate-fade-in">
          <!-- Mobile logo -->
          <div class="lg:hidden flex items-center gap-2.5 mb-10">
            <img src="assets/images/logo-icon.png" alt="CineTrack" class="w-10 h-10 object-contain" />
            <span class="text-xl font-bold">Cine<span class="text-primary">Track</span></span>
          </div>

          <h2 class="text-3xl font-bold text-text-primary mb-2">Welcome back</h2>
          <p class="text-text-secondary mb-8">Sign in to continue your journey</p>

          <div class="space-y-5">
            <div>
              <label class="block text-sm font-medium text-text-secondary mb-2">Email</label>
              <input
                type="email"
                autocomplete="email"
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
                  autocomplete="current-password"
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
      </main>
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