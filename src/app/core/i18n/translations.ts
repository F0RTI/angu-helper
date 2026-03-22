export const TRANSLATIONS = {
  uk: {
    app: {
      brand: {
        eyebrow: 'Angu Helper',
        title: 'Набір корисних сервісів',
        subtitle: 'Конвертер зображень та майбутні інструменти в одному застосунку.',
      },
      language: 'Мова',
      navigation: {
        title: 'Сервіси',
        imageConverter: 'Конвертер зображень',
        pdfTools: 'PDF інструменти',
        textTools: 'Текстові інструменти',
      },
      placeholders: {
        pdfToolsTitle: 'PDF інструменти',
        pdfToolsDescription: 'Тут можна буде об’єднувати, стискати та перетворювати PDF-документи.',
        textToolsTitle: 'Текстові інструменти',
        textToolsDescription: 'Тут можна буде очищати, форматувати та аналізувати текстові дані.',
        comingSoon: 'Сервіс ще в розробці, але місце в меню вже готове.',
      },
    },
    imageConverter: {
      eyebrow: 'Сервіс зображень',
      title: 'Конвертер зображень',
      lead: 'Оберіть кілька зображень, конвертуйте їх у потрібний формат та за потреби завантажте окремо або ZIP-архівом.',
      actions: {
        selectFiles: 'Вибрати файли',
        convertTo: 'Конвертувати в',
        convertFiles: 'Конвертувати файли',
        convertingFiles: 'Конвертація...',
        download: 'Завантажити',
        downloadZip: 'Завантажити ZIP',
        buildingZip: 'Створення ZIP...',
        clear: 'Очистити',
        remove: 'Видалити',
      },
      summary: {
        status: 'Статус',
        format: 'Формат',
        converted: 'Конвертовано',
        before: 'До',
        after: 'Після',
      },
      status: {
        idle: 'очікування',
        ready: 'готово',
        uploading: 'обробка',
        uploaded: 'завершено',
      },
      queue: {
        unknownType: 'невідомий тип',
        empty:
          'Черга порожня. Виберіть кілька файлів, щоб почати конвертацію та порівняти результат.',
      },
      messages: {
        converting: 'Конвертація файлів...',
        converted: 'Сконвертовано файлів: {{count}}.',
        conversionFailed: 'Не вдалося виконати конвертацію. Спробуйте інший файл або формат.',
        downloadedFiles: 'Завантажено конвертованих файлів: {{count}}.',
        buildingZip: 'Формування ZIP-архіву...',
        downloadedArchive: 'Архів {{archiveName}} завантажено.',
        archiveFailed: 'Не вдалося створити архів. Спробуйте ще раз.',
      },
    },
    fileUpload: {
      messages: {
        selectFiles: 'Виберіть файли для старту.',
        selectedFiles: 'Вибрано файлів: {{count}}.',
        selectionCleared: 'Вибір очищено.',
        uploadingQueue: 'Обробка черги файлів...',
        uploadedFiles: 'Оброблено файлів: {{count}}.',
      },
      validation: {
        tooManyFiles: 'Забагато файлів. Максимум: {{maxFiles}}.',
        invalidType: 'Файл {{fileName}} має неприпустимий тип. Дозволено: {{allowedTypes}}.',
        fileTooLarge: 'Файл {{fileName}} завеликий. Максимальний розмір: {{maxSize}}.',
        totalTooLarge: 'Загальний розмір файлів завеликий. Максимум: {{maxSize}}.',
      },
    },
  },
  en: {
    app: {
      brand: {
        eyebrow: 'Angu Helper',
        title: 'Useful Services Workspace',
        subtitle: 'Image converter and future tools in one application.',
      },
      language: 'Language',
      navigation: {
        title: 'Services',
        imageConverter: 'Image Converter',
        pdfTools: 'PDF Tools',
        textTools: 'Text Tools',
      },
      placeholders: {
        pdfToolsTitle: 'PDF Tools',
        pdfToolsDescription:
          'This area will handle merging, compressing, and converting PDF documents.',
        textToolsTitle: 'Text Tools',
        textToolsDescription:
          'This area will handle cleaning, formatting, and analyzing text content.',
        comingSoon: 'This service is not ready yet, but the navigation slot is prepared.',
      },
    },
    imageConverter: {
      eyebrow: 'Image Service',
      title: 'Image Converter',
      lead: 'Choose several images, convert them into the required format, then download them individually or as a ZIP archive.',
      actions: {
        selectFiles: 'Select files',
        convertTo: 'Convert to',
        convertFiles: 'Convert files',
        convertingFiles: 'Converting...',
        download: 'Download',
        downloadZip: 'Download ZIP',
        buildingZip: 'Building ZIP...',
        clear: 'Clear',
        remove: 'Remove',
      },
      summary: {
        status: 'Status',
        format: 'Format',
        converted: 'Converted',
        before: 'Before',
        after: 'After',
      },
      status: {
        idle: 'idle',
        ready: 'ready',
        uploading: 'processing',
        uploaded: 'completed',
      },
      queue: {
        unknownType: 'unknown type',
        empty: 'Queue is empty. Select a few files to start converting and compare the result.',
      },
      messages: {
        converting: 'Converting files...',
        converted: 'Converted files: {{count}}.',
        conversionFailed: 'Conversion failed. Please try another file or format.',
        downloadedFiles: 'Downloaded converted files: {{count}}.',
        buildingZip: 'Building ZIP archive...',
        downloadedArchive: 'Archive {{archiveName}} downloaded.',
        archiveFailed: 'Archive creation failed. Please try again.',
      },
    },
    fileUpload: {
      messages: {
        selectFiles: 'Select files to start.',
        selectedFiles: 'Selected files: {{count}}.',
        selectionCleared: 'Selection cleared.',
        uploadingQueue: 'Processing file queue...',
        uploadedFiles: 'Processed files: {{count}}.',
      },
      validation: {
        tooManyFiles: 'Too many files. Maximum: {{maxFiles}}.',
        invalidType: 'File {{fileName}} has an invalid type. Allowed: {{allowedTypes}}.',
        fileTooLarge: 'File {{fileName}} is too large. Maximum size: {{maxSize}}.',
        totalTooLarge: 'Total file size is too large. Maximum: {{maxSize}}.',
      },
    },
  },
} as const;

export type AppLang = keyof typeof TRANSLATIONS;
