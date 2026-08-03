import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { SidebarComponent } from '../sidebar/sidebar.component';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, NavbarComponent],
  template: `
    <div class="min-h-screen bg-surface-deep lg:flex">
      <app-sidebar [open]="menuOpen()" (navigate)="menuOpen.set(false)" />

      <!-- Mobile scrim -->
      @if (menuOpen()) {
        <div
          class="fixed inset-0 z-30 bg-black/70 backdrop-blur-sm lg:hidden animate-fade-in"
          (click)="menuOpen.set(false)"
          aria-hidden="true"
        ></div>
      }

      <div class="flex-1 min-w-0 flex flex-col">
        <app-navbar (menuClick)="menuOpen.set(!menuOpen())" />

        <main class="flex-1 min-w-0">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
})
export class LayoutComponent {
  menuOpen = signal(false);
}
