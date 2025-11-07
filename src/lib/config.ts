import { dataSourceStore } from './stores/dataSource.svelte';

/**
 * アプリケーション設定
 */
export const config = {
  /**
   * Google Sheets API URL
   */
  googleSheetsApiUrl: import.meta.env.VITE_GOOGLE_SHEETS_API_URL || '',

  /**
   * Google Sheets API URLが設定されているかどうか
   */
  get hasGoogleSheetsApiUrl(): boolean {
    return this.googleSheetsApiUrl !== '';
  },

  /**
   * Google Sheetsが有効かどうか（ストアの設定とAPIのURL両方が必要）
   */
  get isGoogleSheetsEnabled(): boolean {
    return dataSourceStore.isGoogleSheetsEnabled && this.hasGoogleSheetsApiUrl;
  },

  /**
   * 現在のデータソース
   */
  get dataSource() {
    return dataSourceStore.dataSource;
  },
};
