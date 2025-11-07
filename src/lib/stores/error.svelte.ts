/**
 * エラー管理ストア
 * アプリケーション全体のエラーを管理し、モーダルで表示
 */

export interface AppError {
  title: string;
  message: string;
  details?: string;
  timestamp: number;
}

class ErrorStore {
  private _currentError = $state<AppError | null>(null);

  get currentError(): AppError | null {
    return this._currentError;
  }

  get hasError(): boolean {
    return this._currentError !== null;
  }

  /**
   * エラーを設定
   */
  setError(title: string, message: string, details?: string): void {
    this._currentError = {
      title,
      message,
      details,
      timestamp: Date.now(),
    };
  }

  /**
   * エラーをクリア
   */
  clearError(): void {
    this._currentError = null;
  }
}

export const errorStore = new ErrorStore();
