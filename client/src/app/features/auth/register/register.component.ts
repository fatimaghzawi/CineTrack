/**
 * Registration page — demonstrates Angular's **template-driven forms**
 * (as opposed to the alternative, more complex "reactive forms" API built
 * around `FormGroup`/`FormControl`).
 *
 * Template-driven forms bind form fields straight to component properties
 * with `[(ngModel)]` — Angular's "banana in a box" two-way binding syntax.
 * `[(ngModel)]="email"` is shorthand for `[ngModel]="email" (ngModelChange)="email = $event"`:
 * the input's value flows into `email` and back out again on every
 * keystroke, without any FormControl object in between. This requires
 * `FormsModule` in the component's `imports` array (see below) — ngModel
 * isn't available on plain `<input>` elements otherwise.
 *
 * Validation here is deliberately manual (see onRegister()) rather than
 * using Angular's built-in Validators — simple, readable for a small form,
 * at the cost of not getting free per-field error states the way reactive
 * forms' FormControl.errors would give you.
 */
import {
  Component,
  ElementRef,
  OnInit,
  OnDestroy,
  effect,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { AuthService } from '@core/services/auth.service';
import { ToastService } from '@core/services/toast.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="min-h-screen lg:flex bg-surface-deep">
      <!-- Brand panel: centered video with margins (desktop only, not rendered on mobile) -->
      @if (isDesktop()) {
        <aside class="hidden lg:flex lg:w-1/2 relative items-center justify-center p-10 bg-surface-dark border-r border-surface-elevated/50">
          <div class="relative w-full h-full max-h-[90vh] rounded-3xl overflow-hidden shadow-2xl shadow-black/50 border border-surface-elevated/40">
            <video
              #brandVideo
              class="w-full h-full object-cover"
              autoplay
              [muted]="true"
              loop
              playsinline
              poster="assets/videos/Cinetrack-poster.svg"
            >
              <source src="assets/videos/CineTrack.mp4" type="video/mp4" />
            </video>

            <!-- Dark overlay for contrast -->
            <div class="absolute inset-0 bg-surface-deep/40"></div>
            <div class="absolute inset-0 bg-gradient-to-t from-surface-deep via-transparent to-surface-deep/20"></div>
          </div>
        </aside>
      }

      <!-- Form -->
      <main class="flex-1 grid place-items-center p-6 sm:p-12">
        <div class="w-full max-w-md animate-fade-in">
          <h2 class="text-3xl font-bold text-text-primary mb-2">Create Account</h2>
          <p class="text-text-secondary mb-8">Join CineTrack and start your journey</p>

          <div class="space-y-5">
            <div>
              <label class="block text-sm font-medium text-text-secondary mb-2">Display Name</label>
              <input
                type="text"
                autocomplete="nickname"
                [(ngModel)]="displayName"
                placeholder="How should we call you?"
                class="input-field"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-text-secondary mb-2">Email</label>
              <input
                type="email"
                autocomplete="email"
                [(ngModel)]="email"
                placeholder="you&#64;example.com"
                class="input-field"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-text-secondary mb-2">Password</label>
              <div class="relative">
                <input
                  [type]="showPassword() ? 'text' : 'password'"
                  autocomplete="new-password"
                  [(ngModel)]="password"
                  placeholder="Min 8 characters"
                  class="input-field pr-12"
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

            <div>
              <label class="block text-sm font-medium text-text-secondary mb-2">Confirm Password</label>
              <input
                type="password"
                autocomplete="new-password"
                [(ngModel)]="confirmPassword"
                placeholder="Repeat your password"
                class="input-field"
                (keyup.enter)="onRegister()"
              />
            </div>

            <button
              (click)="onRegister()"
              [disabled]="loading()"
              class="btn-primary w-full flex items-center justify-center gap-2"
            >
              @if (loading()) {
                <svg class="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Creating account...
              } @else {
                Create Account
              }
            </button>
          </div>

          <p class="mt-8 text-center text-text-secondary text-sm">
            Already have an account?
            <a routerLink="/login" class="text-primary hover:text-primary-hover font-medium transition-colors">
              Sign in
            </a>
          </p>
        </div>
      </main>
    </div>
  `,
})
export class RegisterComponent implements OnInit, OnDestroy {
  // Plain component properties, not FormControls — each one is the "source
  // of truth" its matching [(ngModel)] binding reads from and writes to.
  displayName = '';
  email = '';
  password = '';
  confirmPassword = '';
  loading = signal(false);
  showPassword = signal(false);
  isDesktop = signal(false);

  private mediaQuery: MediaQueryList | null = null;
  private mediaQueryHandler = (e: MediaQueryListEvent) => this.isDesktop.set(e.matches);

  // viewChild() is the signal-based replacement for the older @ViewChild()
  // decorator — it returns a signal holding a reference to the `#brandVideo`
  // template element (or undefined before it's rendered / if the @if above
  // hasn't rendered it yet). Reading it reactively via the signal is what
  // lets the effect() below re-run once the video element actually appears.
  private brandVideo = viewChild<ElementRef<HTMLVideoElement>>('brandVideo');

  constructor(
    private auth: AuthService,
    private toast: ToastService,
    private router: Router,
  ) {
    // effect() re-runs its callback automatically whenever any signal it
    // reads changes — here, whenever brandVideo() switches from undefined
    // to an actual element (i.e. once isDesktop() flips true and the @if
    // block renders the <video>). This is Angular's way of running
    // imperative side effects (touching the DOM directly, calling
    // non-Angular browser APIs) in reaction to signal state, similar in
    // spirit to a `useEffect` dependency array in React, but the
    // dependencies are inferred automatically from which signals get read.
    //
    // The video only exists once isDesktop() flips true, so this runs when the
    // query resolves. Browsers refuse to autoplay unless `muted` is set as a DOM
    // property — the bare `muted` attribute in a template is not enough — and
    // some still need an explicit play() call.
    effect(() => {
      const video = this.brandVideo()?.nativeElement;
      if (!video) return;

      video.muted = true;
      video.play().catch(() => {
        // Autoplay refused (e.g. a strict browser setting); the poster stays up.
      });
    });
  }

  // ngOnInit / ngOnDestroy are two of Angular's component lifecycle hooks —
  // methods Angular calls automatically at specific points in a component's
  // life. ngOnInit fires once, after the component's inputs are set and its
  // own view is initialized (the right place for setup logic); ngOnDestroy
  // fires right before Angular removes the component (the right place to
  // clean up anything that would otherwise leak, like this event listener).
  ngOnInit(): void {
    // 1024px matches Tailwind's `lg` breakpoint
    this.mediaQuery = window.matchMedia('(min-width: 1024px)');
    this.isDesktop.set(this.mediaQuery.matches);
    this.mediaQuery.addEventListener('change', this.mediaQueryHandler);
  }

  ngOnDestroy(): void {
    this.mediaQuery?.removeEventListener('change', this.mediaQueryHandler);
  }

  /** Manual, sequential validation — first failing rule wins and stops the submit. */
  onRegister(): void {
    if (!this.displayName || !this.email || !this.password) {
      this.toast.error('Please fill in all fields');
      return;
    }
    if (this.password.length < 8) {
      this.toast.error('Password must be at least 8 characters');
      return;
    }
    if (this.password !== this.confirmPassword) {
      this.toast.error('Passwords do not match');
      return;
    }

    this.loading.set(true);
    // AuthService.register() returns an Observable — nothing happens until
    // .subscribe() is called. The `next`/`error` callbacks here mirror a
    // Promise's `.then`/`.catch`, but Observables (unlike Promises) can
    // in principle emit more than once and must be actively subscribed to.
    this.auth
      .register({
        email: this.email,
        password: this.password,
        displayName: this.displayName,
      })
      .subscribe({
        next: () => {
          this.toast.success('Account created! Welcome aboard.');
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.loading.set(false);
          const msg = err.error?.error?.message || 'Registration failed';
          this.toast.error(msg);
        },
      });
  }
}
