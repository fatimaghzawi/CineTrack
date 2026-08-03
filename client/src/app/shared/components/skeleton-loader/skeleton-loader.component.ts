import { Component, input } from '@angular/core';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  host: { class: 'block' },
  template: `
    <div
      class="skeleton rounded-xl"
      [class]="className()"
      [style.width]="width() || null"
      [style.height]="height() || null"
      aria-hidden="true"
    ></div>
  `,
})
export class SkeletonLoaderComponent {
  /** Leave blank to let `className` (e.g. an aspect ratio) drive the box. */
  width = input('100%');
  height = input('');
  className = input('');
}
