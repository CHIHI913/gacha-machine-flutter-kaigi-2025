/**
 * データソース設定ストア
 * LocalStorageまたはGoogle Sheetsのどちらを使用するかを管理
 */

export type DataSourceType = 'local' | 'sheets';

const STORAGE_KEY = 'gachaDataSource';
const LEGACY_STORAGE_KEY = 'dataSource';

class DataSourceStore {
  private _dataSource = $state<DataSourceType>('sheets');

  constructor() {
    // LocalStorageから設定を読み込む
    this.loadFromStorage();
  }

  get dataSource(): DataSourceType {
    return this._dataSource;
  }

  /**
   * データソースを設定
   * @param source データソース種別
   */
  setDataSource(source: DataSourceType): void {
    this._dataSource = source;
    this.saveToStorage();
  }

  /**
   * Google Sheetsが有効かどうか
   */
  get isGoogleSheetsEnabled(): boolean {
    return this._dataSource === 'sheets';
  }

  /**
   * LocalStorageから設定を読み込む
   */
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'local' || stored === 'sheets') {
        this._dataSource = stored;
        return;
      }

      // 旧キーの設定は無効化し、デフォルト(=sheets)へ移行
      if (localStorage.getItem(LEGACY_STORAGE_KEY) !== null) {
        localStorage.removeItem(LEGACY_STORAGE_KEY);
        this.saveToStorage();
      }
    } catch (error) {
      console.error('Failed to load data source setting:', error);
    }
  }

  /**
   * LocalStorageに設定を保存
   */
  private saveToStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEY, this._dataSource);
    } catch (error) {
      console.error('Failed to save data source setting:', error);
    }
  }
}

export const dataSourceStore = new DataSourceStore();
