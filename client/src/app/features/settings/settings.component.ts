import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AuthService } from '@core/services/auth.service';
import { ApiService } from '@core/services/api.service';
import { ToastService } from '@core/services/toast.service';
import { User } from '@core/models/user.model';
import { IconComponent } from '@shared/components/icon/icon.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [FormsModule, IconComponent],
  template: `
    <div class="page-container animate-fade-in max-w-3xl">
      <h1 class="page-title">Settings</h1>
      <p class="mt-1.5 text-sm text-text-secondary mb-7">Manage your account</p>

      <!-- Profile -->
      <section class="panel p-5 sm:p-6 mb-5">
        <h2 class="section-title mb-5">Profile</h2>

        <div class="flex items-center gap-4 pb-5 mb-5 border-b border-hairline">
          <span
            class="grid place-items-center h-14 w-14 rounded-full bg-gold-gradient
                   text-xl font-bold text-surface-deep shrink-0"
          >
            {{ userInitial() }}
          </span>
          <div class="min-w-0">
            <p class="font-semibold text-text-primary truncate">
              {{ auth.user()?.displayName }}
            </p>
            <p class="text-[13px] text-text-muted truncate">{{ auth.user()?.email }}</p>
          </div>
        </div>

        <label for="s-name" class="label">Display Name</label>
        <input
          id="s-name"
          type="text"
          [(ngModel)]="displayName"
          placeholder="Your display name"
          class="input-field"
        />

        <div class="flex justify-end mt-5">
          <button
            type="button"
            (click)="updateProfile()"
            [disabled]="savingProfile()"
            class="btn-primary"
          >
            {{ savingProfile() ? 'Saving...' : 'Update Profile' }}
          </button>
        </div>
      </section>

      <!-- Password -->
      <section class="panel p-5 sm:p-6 mb-5">
        <h2 class="section-title mb-5">Change Password</h2>

        <div class="space-y-5">
          <div>
            <label for="s-current" class="label">Current Password</label>
            <input
              id="s-current"
              type="password"
              autocomplete="current-password"
              [(ngModel)]="currentPassword"
              placeholder="Enter current password"
              class="input-field"
            />
          </div>

          <div>
            <label for="s-new" class="label">New Password</label>
            <input
              id="s-new"
              type="password"
              autocomplete="new-password"
              [(ngModel)]="newPassword"
              placeholder="Min 8 characters"
              class="input-field"
            />
          </div>

          <div>
            <label for="s-confirm" class="label">Confirm New Password</label>
            <input
              id="s-confirm"
              type="password"
              autocomplete="new-password"
              [(ngModel)]="confirmNewPassword"
              placeholder="Repeat new password"
              class="input-field"
            />
          </div>
        </div>

        <div class="flex justify-end mt-6">
          <button
            type="button"
            (click)="changePassword()"
            [disabled]="savingPassword()"
            class="btn-primary"
          >
            {{ savingPassword() ? 'Updating...' : 'Change Password' }}
          </button>
        </div>
      </section>

      <!-- Session -->
      <section class="panel p-5 sm:p-6 border-red-500/20">
        <h2 class="section-title !text-red-400">Danger Zone</h2>
        <p class="mt-2 mb-5 text-[13px] text-text-muted">
          Once you log out, you'll need to sign in again.
        </p>
        <button type="button" (click)="onLogout()" class="btn-danger btn-sm">
          <app-icon name="logout" class="w-4 h-4" />
          Log Out
        </button>
      </section>
    </div>
  `,
})
export class SettingsComponent implements OnInit {
  displayName = '';
  currentPassword = '';
  newPassword = '';
  confirmNewPassword = '';
  savingProfile = signal(false);
  savingPassword = signal(false);

  constructor(
    public auth: AuthService,
    private api: ApiService,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.displayName = this.auth.user()?.displayName ?? '';
  }

  userInitial(): string {
    return (this.auth.user()?.displayName ?? '?').charAt(0).toUpperCase();
  }

  updateProfile(): void {
    if (!this.displayName.trim() || this.displayName.trim().length < 2) {
      this.toast.error('Display name must be at least 2 characters');
      return;
    }

    this.savingProfile.set(true);
    this.api
      .patch<{ user: User }>('/users/me', { displayName: this.displayName.trim() })
      .subscribe({
        next: () => {
          this.savingProfile.set(false);
          this.toast.success('Profile updated!');
          // Update local storage user
          const stored = localStorage.getItem('ct_user');
          if (stored) {
            const user = JSON.parse(stored);
            user.displayName = this.displayName.trim();
            localStorage.setItem('ct_user', JSON.stringify(user));
          }
        },
        error: (err) => {
          this.savingProfile.set(false);
          this.toast.error(err.error?.error?.message || 'Failed to update');
        },
      });
  }

  changePassword(): void {
    if (!this.currentPassword || !this.newPassword) {
      this.toast.error('Please fill in all password fields');
      return;
    }
    if (this.newPassword.length < 8) {
      this.toast.error('New password must be at least 8 characters');
      return;
    }
    if (this.newPassword !== this.confirmNewPassword) {
      this.toast.error('New passwords do not match');
      return;
    }

    this.savingPassword.set(true);
    this.api
      .patch('/users/me/password', {
        currentPassword: this.currentPassword,
        newPassword: this.newPassword,
      })
      .subscribe({
        next: () => {
          this.savingPassword.set(false);
          this.currentPassword = '';
          this.newPassword = '';
          this.confirmNewPassword = '';
          this.toast.success('Password changed!');
        },
        error: (err) => {
          this.savingPassword.set(false);
          this.toast.error(err.error?.error?.message || 'Failed to change password');
        },
      });
  }

  onLogout(): void {
    this.auth.logout();
  }
}
