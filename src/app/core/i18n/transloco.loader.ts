import { Injectable } from '@angular/core';
import { Translation, TranslocoLoader } from '@jsverse/transloco';
import { Observable, of } from 'rxjs';
import { AppLang, TRANSLATIONS } from './translations';

@Injectable({ providedIn: 'root' })
export class AppTranslocoLoader implements TranslocoLoader {
  getTranslation(lang: string): Observable<Translation> {
    const translation = TRANSLATIONS[lang as AppLang] ?? TRANSLATIONS.uk;
    return of(translation as Translation);
  }
}
