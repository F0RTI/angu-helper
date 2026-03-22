import { Injectable, computed, inject } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { FileUploadConfig, FileUploadState } from './file-upload.models';
import { FILE_UPLOAD_CONFIG } from './file-upload.tokens';

@Injectable()
export class FileUploadStore extends ComponentStore<FileUploadState> {
  private readonly config = inject(FILE_UPLOAD_CONFIG, { optional: true }) ?? {};

  readonly files = this.selectSignal((state) => state.files);
  readonly status = this.selectSignal((state) => state.status);
  readonly messageKey = this.selectSignal((state) => state.messageKey);
  readonly messageParams = this.selectSignal((state) => state.messageParams);
  readonly totalBytes = this.selectSignal((state) =>
    state.files.reduce((total, file) => total + file.size, 0),
  );
  readonly canUpload = this.selectSignal(
    this.files,
    this.status,
    (files, status) => files.length > 0 && status !== 'uploading',
  );
  readonly acceptAttribute = computed(() => this.buildAcceptAttribute(this.config));

  readonly setFiles = this.updater((state, incomingFiles: File[]) => {
    const normalizedFiles = this.normalizeFiles(incomingFiles);
    const validationError = this.validateSelection(normalizedFiles);

    if (validationError) {
      return {
        ...state,
        files: [],
        status: 'idle' as const,
        messageKey: validationError.messageKey,
        messageParams: validationError.messageParams,
      };
    }

    return {
      files: normalizedFiles,
      status: normalizedFiles.length ? ('ready' as const) : ('idle' as const),
      messageKey: normalizedFiles.length
        ? 'fileUpload.messages.selectedFiles'
        : 'fileUpload.messages.selectFiles',
      messageParams: normalizedFiles.length ? { count: normalizedFiles.length } : undefined,
    };
  });

  readonly removeFile = this.updater((state, index: number) => {
    const files = state.files.filter((_, itemIndex) => itemIndex !== index);

    return {
      files,
      status: files.length ? ('ready' as const) : ('idle' as const),
      messageKey: files.length
        ? 'fileUpload.messages.selectedFiles'
        : 'fileUpload.messages.selectFiles',
      messageParams: files.length ? { count: files.length } : undefined,
    };
  });

  readonly clear = this.updater(() => ({
    files: [],
    status: 'idle' as const,
    messageKey: 'fileUpload.messages.selectionCleared',
    messageParams: undefined,
  }));

  readonly setUploading = this.updater((state) => ({
    ...state,
    status: 'uploading' as const,
    messageKey: 'fileUpload.messages.uploadingQueue',
    messageParams: undefined,
  }));

  readonly setUploaded = this.updater((state) => ({
    ...state,
    status: state.files.length ? ('uploaded' as const) : ('idle' as const),
    messageKey: state.files.length
      ? 'fileUpload.messages.uploadedFiles'
      : 'fileUpload.messages.selectFiles',
    messageParams: state.files.length ? { count: state.files.length } : undefined,
  }));

  readonly setMessage = this.updater(
    (
      state,
      payload: {
        messageKey: string;
        messageParams?: Record<string, string | number>;
      },
    ) => ({
      ...state,
      messageKey: payload.messageKey,
      messageParams: payload.messageParams,
    }),
  );

  constructor() {
    super({
      files: [],
      status: 'idle',
      messageKey: 'fileUpload.messages.selectFiles',
      messageParams: undefined,
    });
  }

  private normalizeFiles(files: File[]): File[] {
    return this.config.multiple === false ? files.slice(0, 1) : files;
  }

  private validateSelection(files: File[]): {
    messageKey: string;
    messageParams?: Record<string, string | number>;
  } | null {
    if (!files.length) {
      return null;
    }

    if (this.config.maxFiles && files.length > this.config.maxFiles) {
      return {
        messageKey: 'fileUpload.validation.tooManyFiles',
        messageParams: { maxFiles: this.config.maxFiles },
      };
    }

    if (this.config.accept?.length) {
      const invalidFile = files.find((file) => !this.isAcceptedFileType(file, this.config.accept!));

      if (invalidFile) {
        return {
          messageKey: 'fileUpload.validation.invalidType',
          messageParams: {
            fileName: invalidFile.name,
            allowedTypes: this.config.accept.join(', '),
          },
        };
      }
    }

    if (this.config.maxFileSizeBytes) {
      const oversizedFile = files.find((file) => file.size > this.config.maxFileSizeBytes!);

      if (oversizedFile) {
        return {
          messageKey: 'fileUpload.validation.fileTooLarge',
          messageParams: {
            fileName: oversizedFile.name,
            maxSize: this.formatBytes(this.config.maxFileSizeBytes),
          },
        };
      }
    }

    if (this.config.maxTotalSizeBytes) {
      const totalBytes = files.reduce((total, file) => total + file.size, 0);

      if (totalBytes > this.config.maxTotalSizeBytes) {
        return {
          messageKey: 'fileUpload.validation.totalTooLarge',
          messageParams: {
            maxSize: this.formatBytes(this.config.maxTotalSizeBytes),
          },
        };
      }
    }

    return null;
  }

  private isAcceptedFileType(file: File, accept: string[]): boolean {
    return accept.some((rule) => {
      if (rule.endsWith('/*')) {
        const category = rule.slice(0, rule.length - 1);
        return file.type.startsWith(category);
      }

      if (rule.startsWith('.')) {
        return file.name.toLowerCase().endsWith(rule.toLowerCase());
      }

      return file.type === rule;
    });
  }

  private buildAcceptAttribute(config: FileUploadConfig): string | null {
    return config.accept?.length ? config.accept.join(',') : null;
  }

  private formatBytes(size: number): string {
    if (size < 1024) {
      return `${size} B`;
    }

    if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(1)} KB`;
    }

    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }
}
