import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-services-placeholder',
  imports: [CommonModule, TranslocoPipe],
  templateUrl: './services-placeholder.html',
  styleUrl: './services-placeholder.css',
})
export class ServicesPlaceholderComponent {
  private readonly route = inject(ActivatedRoute);

  protected readonly titleKey = computed(() => this.route.snapshot.data['titleKey'] as string);
  protected readonly descriptionKey = computed(
    () => this.route.snapshot.data['descriptionKey'] as string,
  );
}
