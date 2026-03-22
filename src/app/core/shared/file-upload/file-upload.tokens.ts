import { InjectionToken } from '@angular/core';
import { FileUploadConfig } from './file-upload.models';

export const FILE_UPLOAD_CONFIG = new InjectionToken<FileUploadConfig>('FILE_UPLOAD_CONFIG');
