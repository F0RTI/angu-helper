import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { FileUploadStore } from '../../core/shared/file-upload/file-upload.store';
import { FILE_UPLOAD_CONFIG } from '../../core/shared/file-upload/file-upload.tokens';
import { ImageConverterService } from '../../core/shared/image-converter/image-converter.service';
import { ImageFormat } from '../../core/shared/image-converter/image-converter.models';

interface ConvertedFile {
  blob: Blob;
  fileName: string;
  mimeType: ImageFormat;
  size: number;
  originalSize: number;
}

interface ZipEntry {
  fileName: string;
  fileNameBytes: Uint8Array;
  data: Uint8Array;
  crc32: number;
  lastModified: Date;
}

@Component({
  selector: 'app-upload',
  imports: [CommonModule, TranslocoPipe],
  providers: [
    FileUploadStore,
    {
      provide: FILE_UPLOAD_CONFIG,
      useValue: {
        multiple: true,
        accept: ['image/jpeg', 'image/png', 'image/webp'],
        maxFiles: 20,
        maxFileSizeBytes: 10 * 1024 * 1024,
        maxTotalSizeBytes: 40 * 1024 * 1024,
      },
    },
  ],
  templateUrl: './image-converter.html',
  styleUrl: './image-converter.css',
})
export class UploadComponent {
  readonly store = inject(FileUploadStore);
  readonly imageConverter = inject(ImageConverterService);
  private readonly transloco = inject(TranslocoService);
  protected readonly formatOptions = [
    { label: 'JPEG', value: ImageFormat.JPEG },
    { label: 'PNG', value: ImageFormat.PNG },
    { label: 'WEBP', value: ImageFormat.WEBP },
  ];
  protected selectedFormat = ImageFormat.JPEG;
  protected readonly convertedFiles = signal<ConvertedFile[]>([]);
  protected readonly isConverting = signal(false);
  protected readonly isArchiving = signal(false);
  protected readonly conversionMessage = signal('');
  protected readonly canDownload = computed(() => this.convertedFiles().length > 0);
  protected readonly convertedTotalBytes = computed(() =>
    this.convertedFiles().reduce((total, file) => total + file.size, 0),
  );

  protected readonly files = this.store.files;
  protected readonly status = this.store.status;
  protected readonly messageKey = this.store.messageKey;
  protected readonly messageParams = this.store.messageParams;
  protected readonly totalBytes = this.store.totalBytes;
  protected readonly canUpload = this.store.canUpload;
  protected readonly acceptAttribute = this.store.acceptAttribute;

  protected onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);

    this.resetConversionState();
    this.store.setFiles(files);
  }

  protected removeFile(index: number): void {
    this.resetConversionState();
    this.store.removeFile(index);
  }

  protected onFormatChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.selectedFormat = select.value as ImageFormat;
    this.resetConversionState();
  }

  protected clearSelection(input: HTMLInputElement): void {
    input.value = '';
    this.resetConversionState();
    this.store.clear();
  }

  protected async convertFiles(): Promise<void> {
    const files = this.files();

    if (!files.length || this.isConverting()) {
      return;
    }

    this.isConverting.set(true);
    this.conversionMessage.set(this.translate('imageConverter.messages.converting'));

    try {
      const convertedFiles = await Promise.all(
        files.map(async (file) => {
          const blob = await this.imageConverter.convert(file, {
            format: this.selectedFormat,
          });

          return {
            blob,
            fileName: this.buildConvertedFileName(file.name, this.selectedFormat),
            mimeType: this.selectedFormat,
            size: blob.size,
            originalSize: file.size,
          };
        }),
      );

      this.convertedFiles.set(convertedFiles);
      this.conversionMessage.set(
        this.translate('imageConverter.messages.converted', { count: convertedFiles.length }),
      );
    } catch {
      this.convertedFiles.set([]);
      this.conversionMessage.set(this.translate('imageConverter.messages.conversionFailed'));
    } finally {
      this.isConverting.set(false);
    }
  }

  protected downloadConvertedFiles(): void {
    for (const file of this.convertedFiles()) {
      const url = URL.createObjectURL(file.blob);
      const link = document.createElement('a');

      link.href = url;
      link.download = file.fileName;
      link.click();

      URL.revokeObjectURL(url);
    }

    if (this.convertedFiles().length) {
      this.conversionMessage.set(
        this.translate('imageConverter.messages.downloadedFiles', {
          count: this.convertedFiles().length,
        }),
      );
    }
  }

  protected async downloadArchive(): Promise<void> {
    const files = this.convertedFiles();

    if (!files.length || this.isArchiving()) {
      return;
    }

    this.isArchiving.set(true);
    this.conversionMessage.set(this.translate('imageConverter.messages.buildingZip'));

    try {
      const archiveBlob = await this.buildZipArchive(files);
      const archiveName = this.buildArchiveName();

      this.downloadBlob(archiveBlob, archiveName);
      this.conversionMessage.set(
        this.translate('imageConverter.messages.downloadedArchive', { archiveName }),
      );
    } catch {
      this.conversionMessage.set(this.translate('imageConverter.messages.archiveFailed'));
    } finally {
      this.isArchiving.set(false);
    }
  }

  protected formatSize(size: number): string {
    if (size < 1024) {
      return `${size} B`;
    }

    if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(1)} KB`;
    }

    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }

  protected getConvertedFile(index: number): ConvertedFile | undefined {
    return this.convertedFiles()[index];
  }

  private resetConversionState(): void {
    this.convertedFiles.set([]);
    this.conversionMessage.set('');
  }

  private translate(key: string, params?: Record<string, string | number>): string {
    return this.transloco.translate(key, params);
  }

  private async buildZipArchive(files: ConvertedFile[]): Promise<Blob> {
    const entries = await Promise.all(
      files.map(async (file) => {
        const data = new Uint8Array(await file.blob.arrayBuffer());
        const fileNameBytes = new TextEncoder().encode(file.fileName);

        return {
          fileName: file.fileName,
          fileNameBytes,
          data,
          crc32: this.calculateCrc32(data),
          lastModified: new Date(),
        } satisfies ZipEntry;
      }),
    );

    const localFileParts: Uint8Array[] = [];
    const centralDirectoryParts: Uint8Array[] = [];
    let offset = 0;

    for (const entry of entries) {
      const localHeader = this.createLocalFileHeader(entry);
      const centralDirectoryHeader = this.createCentralDirectoryHeader(entry, offset);

      localFileParts.push(localHeader, entry.fileNameBytes, entry.data);
      centralDirectoryParts.push(centralDirectoryHeader, entry.fileNameBytes);

      offset += localHeader.length + entry.fileNameBytes.length + entry.data.length;
    }

    const centralDirectorySize = centralDirectoryParts.reduce(
      (total, part) => total + part.length,
      0,
    );
    const endOfCentralDirectory = this.createEndOfCentralDirectory(
      entries.length,
      centralDirectorySize,
      offset,
    );

    return new Blob(
      [...localFileParts, ...centralDirectoryParts, endOfCentralDirectory].map((part) =>
        this.toArrayBuffer(part),
      ),
      { type: 'application/zip' },
    );
  }

  private createLocalFileHeader(entry: ZipEntry): Uint8Array {
    const { dosTime, dosDate } = this.getDosDateTime(entry.lastModified);
    const header = new Uint8Array(30);
    const view = new DataView(header.buffer);

    view.setUint32(0, 0x04034b50, true);
    view.setUint16(4, 20, true);
    view.setUint16(6, 0x0800, true);
    view.setUint16(8, 0, true);
    view.setUint16(10, dosTime, true);
    view.setUint16(12, dosDate, true);
    view.setUint32(14, entry.crc32, true);
    view.setUint32(18, entry.data.length, true);
    view.setUint32(22, entry.data.length, true);
    view.setUint16(26, entry.fileNameBytes.length, true);
    view.setUint16(28, 0, true);

    return header;
  }

  private createCentralDirectoryHeader(entry: ZipEntry, localHeaderOffset: number): Uint8Array {
    const { dosTime, dosDate } = this.getDosDateTime(entry.lastModified);
    const header = new Uint8Array(46);
    const view = new DataView(header.buffer);

    view.setUint32(0, 0x02014b50, true);
    view.setUint16(4, 20, true);
    view.setUint16(6, 20, true);
    view.setUint16(8, 0x0800, true);
    view.setUint16(10, 0, true);
    view.setUint16(12, dosTime, true);
    view.setUint16(14, dosDate, true);
    view.setUint32(16, entry.crc32, true);
    view.setUint32(20, entry.data.length, true);
    view.setUint32(24, entry.data.length, true);
    view.setUint16(28, entry.fileNameBytes.length, true);
    view.setUint16(30, 0, true);
    view.setUint16(32, 0, true);
    view.setUint16(34, 0, true);
    view.setUint16(36, 0, true);
    view.setUint32(38, 0, true);
    view.setUint32(42, localHeaderOffset, true);

    return header;
  }

  private createEndOfCentralDirectory(
    entriesCount: number,
    centralDirectorySize: number,
    centralDirectoryOffset: number,
  ): Uint8Array {
    const record = new Uint8Array(22);
    const view = new DataView(record.buffer);

    view.setUint32(0, 0x06054b50, true);
    view.setUint16(4, 0, true);
    view.setUint16(6, 0, true);
    view.setUint16(8, entriesCount, true);
    view.setUint16(10, entriesCount, true);
    view.setUint32(12, centralDirectorySize, true);
    view.setUint32(16, centralDirectoryOffset, true);
    view.setUint16(20, 0, true);

    return record;
  }

  private calculateCrc32(data: Uint8Array): number {
    let crc = 0xffffffff;

    for (const byte of data) {
      crc ^= byte;

      for (let bit = 0; bit < 8; bit += 1) {
        const mask = -(crc & 1);
        crc = (crc >>> 1) ^ (0xedb88320 & mask);
      }
    }

    return (crc ^ 0xffffffff) >>> 0;
  }

  private getDosDateTime(date: Date): { dosTime: number; dosDate: number } {
    const year = Math.max(date.getFullYear(), 1980);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = Math.floor(date.getSeconds() / 2);

    return {
      dosTime: (hours << 11) | (minutes << 5) | seconds,
      dosDate: ((year - 1980) << 9) | (month << 5) | day,
    };
  }

  private buildArchiveName(): string {
    const extension = this.getFormatExtension(this.selectedFormat);

    return `converted-images-${extension}.zip`;
  }

  private downloadBlob(blob: Blob, fileName: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = fileName;
    link.click();

    URL.revokeObjectURL(url);
  }

  private toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
    const copy = new Uint8Array(bytes.byteLength);
    copy.set(bytes);
    return copy.buffer;
  }

  private buildConvertedFileName(fileName: string, format: ImageFormat): string {
    const baseName = fileName.replace(/\.[^/.]+$/, '');

    return `${baseName}.${this.getFormatExtension(format)}`;
  }

  private getFormatExtension(format: ImageFormat): string {
    switch (format) {
      case ImageFormat.PNG:
        return 'png';
      case ImageFormat.WEBP:
        return 'webp';
      case ImageFormat.JPEG:
      default:
        return 'jpg';
    }
  }
}
