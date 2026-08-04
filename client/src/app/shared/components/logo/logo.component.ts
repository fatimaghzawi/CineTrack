import { Component, input } from '@angular/core';

/**
 * Brand lockup — renders the CineTrack film-reel mark, either alone
 * (`showWordmark="false"`) or paired with the "cinetrack" wordmark image.
 * Both source images are pre-cropped from the master logo in `assets/`.
 */
@Component({
  selector: 'app-logo',
  standalone: true,
  host: { class: 'inline-flex' },
  template: `
    @if (showWordmark()) {
      <img
        src="assets/logo-wordmark.png"
        alt="CineTrack"
        class="w-auto select-none"
        [class]="wordSize()"
      />
    } @else {
      <img
        src="assets/logo-mark.png"
        alt="CineTrack"
        class="w-auto select-none"
        [class]="markSize()"
      />
    }
  `,
})
export class LogoComponent {
  showWordmark = input(true);
  /** 'sm' for compact bars, 'md' for the sidebar, 'lg' for auth screens. */
  size = input<'sm' | 'md' | 'lg'>('md');

  markSize(): string {
    return { sm: 'h-8', md: 'h-9', lg: 'h-20' }[this.size()];
  }

  wordSize(): string {
    return { sm: 'h-9', md: 'h-10', lg: 'h-24' }[this.size()];
  }
}
