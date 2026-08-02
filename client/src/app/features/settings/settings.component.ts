import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AuthService } from '@core/services/auth.service';
import { ApiService } from '@core/services/api.service';
import { ToastService } from '@core/services/toast.service';
import { User } from '@core/models/user.model';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="page-container animate-fade-in max-w-2xl">
      <h1 class="text-3xl font-bold text-text-primary mb-2">Settings</h1>
      <p class="text-text-secondary mb-8">Manage your account</p>

      <!-- Profile section -->
      <section class="card p-6 mb-6">
        <h2 class="text-lg font-semibold text-text-primary mb-5">Profile</h2>

        <div class="flex items-center gap-5 mb-6">
          <div class="w-16 h-16 rounded-full bg-gold-gradient flex items-center justify-center text-2xl font-bold text-surface-deep">
            {{ userInitial() }}
          </div>
          <div>
            <p class="font-semibold text-text-primary">{{ auth.user()?.displayName }}</p>
            <p class="text-sm text-text-muted">{{ auth.user()?.email }}</p>
          </div>
        </div>

        <div class="space-y-5">
          <div>
            <label class="block text-sm font-medium text-text-secondary mb-2">Display Name</label>
            <input
              type="text"
              [(ngModel)]="displayName"
              placeholder="Your display name"
              class="input-field"
            />
          </div>

          <div class="flex justify-end">
            <button
              (click)="updateProfile()"
              [disabled]="savingProfile()"
              class="btn-primary"
            >
              {{ savingProfile() ? 'Saving...' : 'Update Profile' }}
            </button>
          </div>
        </div>
      </section>

      <!-- Password section -->
      <section class="card p-6 mb-6">
        <h2 class="text-lg font-semibold text-text-primary mb-5">Change Password</h2>

        <div class="space-y-5">
          <div>
            <label class="block text-sm font-medium text-text-secondary mb-2">Current Password</label>
            <input
              type="password"
              [(ngModel)]="currentPassword"
              placeholder="Enter current password"
              class="input-field"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-text-secondary mb-2">New Password</label>
            <input
              type="password"
              [(ngModel)]="newPassword"
              placeholder="Min 8 characters"
              class="input-field"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-text-secondary mb-2">Confirm New Password</label>
            <input
              type="password"
              [(ngModel)]="confirmNewPassword"
              placeholder="Repeat new password"
              class="input-field"
            />
          </div>

          <div class="flex justify-end">
            <button
              (click)="changePassword()"
              [disabled]="savingPassword()"
              class="btn-primary"
            >
              {{ savingPassword() ? 'Updating...' : 'Change Password' }}
            </button>
          </div>
        </div>
      </section>

      <!-- Danger zone -->
      <section class="card p-6 border-red-500/20">
        <h2 class="text-lg font-semibold text-red-400 mb-2">Danger Zone</h2>
        <p class="text-sm text-text-muted mb-4">
          Once you log out, you'll need to sign in again.
        </p>
        <button (click)="onLogout()" class="px-5 py-2.5 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all text-sm font-medium">
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
