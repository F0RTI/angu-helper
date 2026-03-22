import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { LanguageService } from './core/i18n/language.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, TranslocoPipe],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly languageService = inject(LanguageService);

  protected readonly serviceLinks = [
    { path: '/image-converter', labelKey: 'app.navigation.imageConverter' },
    { path: '/pdf-tools', labelKey: 'app.navigation.pdfTools' },
    { path: '/text-tools', labelKey: 'app.navigation.textTools' },
  ];
  protected readonly languageOptions = [
    { value: 'uk' as const, label: 'Українська' },
    { value: 'en' as const, label: 'English' },
  ];
  protected readonly activeLang = computed(() => this.languageService.activeLang);

  protected onLanguageChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.languageService.setLanguage(select.value as 'uk' | 'en');
  }
}
