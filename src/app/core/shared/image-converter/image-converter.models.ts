export enum ImageFormat {
  JPEG = 'image/jpeg',
  PNG = 'image/png',
  WEBP = 'image/webp',
}

export interface ImageConvertOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: ImageFormat;
}

export interface ConvertedFile {
  blob: Blob;
  fileName: string;
  mimeType: ImageFormat;
  size: number;
  originalSize: number;
}
