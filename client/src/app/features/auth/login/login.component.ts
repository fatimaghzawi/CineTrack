import { Component, signal } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { AuthService } from '@core/services/auth.service';
import { ToastService } from '@core/services/toast.service';
import { IconComponent } from '@shared/components/icon/icon.component';
import { LogoComponent } from '@shared/components/logo/logo.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, IconComponent, LogoComponent],
  template: `
    <div class="min-h-screen lg:flex bg-surface-deep">
      <!-- Brand panel -->
      <aside
        class="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center p-12
               bg-dark-gradient border-r border-hairline"
      >
        <div class="absolute inset-0 opacity-[0.14] pointer-events-none">
          <div class="absolute top-16 left-16 w-80 h-80 rounded-full bg-primary blur-[140px]"></div>
          <div
            class="absolute bottom-16 right-10 w-96 h-96 rounded-full bg-accent-gold blur-[160px]"
          ></div>
        </div>

        <div class="relative max-w-md">
          <app-logo size="lg" [showWordmark]="false" />

          <h1
            class="mt-8 font-display font-extrabold tracking-tight leading-[0.95] text-5xl"
          >
            <span class="block text-text-primary">Track.</span>
            <span class="block text-primary">Watch.</span>
            <span class="block text-text-primary">Enjoy.</span>
          </h1>

          <p class="mt-6 text-[15px] leading-relaxed text-text-secondary">
            Your personal movie and TV show tracker. Discover, organize, and relive your
            entertainment journey.
          </p>

          <ul class="mt-8 space-y-3">
            @for (perk of perks; track perk) {
              <li class="flex items-center gap-3 text-[13.5px] text-text-secondary">
                <span class="check-dot h-5 w-5 shrink-0">
                  <app-icon name="check" class="w-3 h-3" [strokeWidth]="3.4" />
                </span>
                {{ perk }}
              </li>
            }
          </ul>
        </div>
      </aside>

      <!-- Form -->
      <main class="flex-1 grid place-items-center p-6 sm:p-12">
        <div class="w-full max-w-md animate-fade-in">
          <div class="lg:hidden mb-10">
            <app-logo size="md" />
          </div>

          <h2 class="text-3xl font-bold font-display text-text-primary">Welcome back</h2>
          <p class="mt-2 text-sm text-text-secondary mb-8">Sign in to continue your journey</p>

          <div class="space-y-5">
            <div>
              <label for="l-email" class="label">Email</label>
              <input
                id="l-email"
                type="email"
                autocomplete="email"
                [(ngModel)]="email"
                placeholder="you&#64;example.com"
                class="input-field"
                (keyup.enter)="onLogin()"
              />
            </div>

            <div>
              <label for="l-password" class="label">Password</label>
              <div class="relative">
                <input
                  id="l-password"
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
                  [attr.aria-label]="showPassword() ? 'Hide password' : 'Show password'"
                  class="absolute right-1.5 top-1/2 -translate-y-1/2 btn-round h-8 w-8"
                >
                  <app-icon [name]="showPassword() ? 'eye-off' : 'eye'" class="w-[18px] h-[18px]" />
                </button>
              </div>
            </div>

            <button
              type="button"
              (click)="onLogin()"
              [disabled]="loading()"
              class="btn-primary w-full"
            >
              @if (loading()) {
                <span
                  class="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin"
                ></span>
                Signing in...
              } @else {
                Sign In
                <app-icon name="arrow-right" class="w-4 h-4" />
              }
            </button>
          </div>

          <p class="mt-8 text-center text-sm text-text-secondary">
            Don't have an account?
            <a routerLink="/register" class="font-semibold text-primary hover:text-accent-gold transition-colors">
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

  perks = [
    'Track every movie and episode you watch',
    'Build watchlists, collections and a journal',
    'See your viewing stats at a glance',
  ];

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
