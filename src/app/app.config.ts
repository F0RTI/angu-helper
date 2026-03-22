import { ApplicationConfig, isDevMode, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideTransloco } from '@jsverse/transloco';
import { routes } from './app.routes';
import { AppTranslocoLoader } from './core/i18n/transloco.loader';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideTransloco({
      config: {
        availableLangs: ['uk', 'en'],
        defaultLang: 'uk',
        reRenderOnLangChange: true,
        prodMode: !isDevMode(),
      },
      loader: AppTranslocoLoader,
    }),
  ],
};
