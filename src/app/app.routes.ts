import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'image-converter',
  },
  {
    path: 'image-converter',
    loadComponent: () =>
      import('./sevices/image-converter/image-converter').then((module) => module.UploadComponent),
  },
  {
    path: 'pdf-tools',
    loadComponent: () =>
      import('./services-placeholder/services-placeholder').then(
        (module) => module.ServicesPlaceholderComponent,
      ),
    data: {
      titleKey: 'app.placeholders.pdfToolsTitle',
      descriptionKey: 'app.placeholders.pdfToolsDescription',
    },
  },
  {
    path: 'text-tools',
    loadComponent: () =>
      import('./services-placeholder/services-placeholder').then(
        (module) => module.ServicesPlaceholderComponent,
      ),
    data: {
      titleKey: 'app.placeholders.textToolsTitle',
      descriptionKey: 'app.placeholders.textToolsDescription',
    },
  },
];
