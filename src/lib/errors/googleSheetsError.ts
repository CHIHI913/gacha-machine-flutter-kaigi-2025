export type GoogleSheetsErrorCategory =
  | 'network'
  | 'unauthorized'
  | 'forbidden'
  | 'not_found'
  | 'rate_limit'
  | 'server'
  | 'script'
  | 'unknown';

export interface GoogleSheetsErrorOptions {
  status?: number;
  statusText?: string;
  category?: GoogleSheetsErrorCategory;
  details?: string;
  originalError?: unknown;
}

/**
 * Google Sheets連携時の詳細エラー
 */
export class GoogleSheetsError extends Error {
  readonly status?: number;
  readonly statusText?: string;
  readonly category: GoogleSheetsErrorCategory;
  readonly details?: string;
  readonly originalError?: unknown;

  constructor(message: string, options: GoogleSheetsErrorOptions = {}) {
    super(message);
    this.name = 'GoogleSheetsError';
    this.status = options.status;
    this.statusText = options.statusText;
    this.category = options.category ?? 'unknown';
    this.details = options.details;
    this.originalError = options.originalError;
  }
}

/**
 * HTTPステータスコードをアプリ内カテゴリに変換
 */
export function toGoogleSheetsErrorCategory(status?: number): GoogleSheetsErrorCategory {
  if (!status) {
    return 'unknown';
  }

  if (status === 401) {
    return 'unauthorized';
  }
  if (status === 403) {
    return 'forbidden';
  }
  if (status === 404) {
    return 'not_found';
  }
  if (status === 429) {
    return 'rate_limit';
  }
  if (status >= 500) {
    return 'server';
  }

  return 'unknown';
}
