import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { SidebarComponent } from '../sidebar/sidebar.component';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, NavbarComponent],
  template: `
    <div class="flex h-screen overflow-hidden bg-surface-deep">
      <!-- Sidebar -->
      <app-sidebar
        [collapsed]="sidebarCollapsed()"
        (toggle)="sidebarCollapsed.set(!sidebarCollapsed())"
      />

      <!-- Mobile overlay -->
      @if (!sidebarCollapsed()) {
        <div
          class="fixed inset-0 bg-black/60 z-20 lg:hidden"
          (click)="sidebarCollapsed.set(true)"
        ></div>
      }

      <!-- Main area -->
      <div class="flex-1 flex flex-col overflow-hidden">
        <app-navbar (menuClick)="sidebarCollapsed.set(!sidebarCollapsed())" />

        <main class="flex-1 overflow-y-auto">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
})
export class LayoutComponent {
  sidebarCollapsed = signal(false);
}
