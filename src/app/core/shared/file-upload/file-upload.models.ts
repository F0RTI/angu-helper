export type FileUploadStatus = 'idle' | 'ready' | 'uploading' | 'uploaded';

export interface FileUploadConfig {
  multiple?: boolean;
  accept?: string[];
  maxFiles?: number;
  maxFileSizeBytes?: number;
  maxTotalSizeBytes?: number;
}

export interface FileUploadState {
  files: File[];
  status: FileUploadStatus;
  messageKey: string;
  messageParams?: Record<string, string | number>;
}
