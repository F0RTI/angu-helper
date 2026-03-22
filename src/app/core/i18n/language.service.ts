import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TranslocoService } from '@jsverse/transloco';
import { AppLang } from './translations';

const LANGUAGE_STORAGE_KEY = 'angu-helper.language';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly transloco = inject(TranslocoService);
  private readonly platformId = inject(PLATFORM_ID);
  readonly availableLangs: AppLang[] = ['uk', 'en'];

  constructor() {
    const initialLang = this.readStoredLanguage() ?? 'uk';
    this.transloco.setActiveLang(initialLang);
  }

  get activeLang(): AppLang {
    const lang = this.transloco.getActiveLang();
    return this.isSupportedLang(lang) ? lang : 'uk';
  }

  setLanguage(lang: AppLang): void {
    this.transloco.setActiveLang(lang);

    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    }
  }

  private readStoredLanguage(): AppLang | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }

    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return this.isSupportedLang(stored) ? stored : null;
  }

  private isSupportedLang(lang: string | null): lang is AppLang {
    return lang === 'uk' || lang === 'en';
  }
}
