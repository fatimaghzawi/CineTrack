import { Component, input } from '@angular/core';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  template: `
    <div
      class="animate-pulse rounded-xl bg-surface-card"
      [class]="className()"
      [style.width]="width()"
      [style.height]="height()"
    ></div>
  `,
})
export class SkeletonLoaderComponent {
  width = input('100%');
  height = input('1rem');
  className = input('');
}
