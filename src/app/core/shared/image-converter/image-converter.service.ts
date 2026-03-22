import { Injectable } from '@angular/core';
import { ImageConvertOptions, ImageFormat } from './image-converter.models';

@Injectable({
  providedIn: 'root',
})
export class ImageConverterService {
  async convert(file: File, options: ImageConvertOptions = {}): Promise<Blob> {
    const image = await this.loadImage(file);

    try {
      const { width, height } = this.calculateSize(
        image.width,
        image.height,
        options.maxWidth,
        options.maxHeight,
      );

      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      if (!context) {
        throw new Error('Canvas context is not available');
      }

      canvas.width = width;
      canvas.height = height;

      context.drawImage(image, 0, 0, width, height);

      const format = options.format ?? ImageFormat.JPEG;
      const quality = options.quality ?? 0.8;

      return await this.toBlob(canvas, format, quality);
    } finally {
      URL.revokeObjectURL(image.src);
    }
  }

  private loadImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.src = URL.createObjectURL(file);
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error(`Failed to load image: ${file.name}`));
    });
  }

  private calculateSize(
    originalWidth: number,
    originalHeight: number,
    maxWidth?: number,
    maxHeight?: number,
  ): { width: number; height: number } {
    if (!maxWidth && !maxHeight) {
      return { width: originalWidth, height: originalHeight };
    }

    let width = originalWidth;
    let height = originalHeight;
    const aspectRatio = width / height;

    if (maxWidth && width > maxWidth) {
      width = maxWidth;
      height = width / aspectRatio;
    }

    if (maxHeight && height > maxHeight) {
      height = maxHeight;
      width = height * aspectRatio;
    }

    return {
      width: Math.round(width),
      height: Math.round(height),
    };
  }

  private toBlob(canvas: HTMLCanvasElement, format: ImageFormat, quality: number): Promise<Blob> {
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Canvas conversion failed'));
            return;
          }

          resolve(blob);
        },
        format,
        quality,
      );
    });
  }
}
