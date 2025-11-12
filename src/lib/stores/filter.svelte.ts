import type { RarityLevel } from '../types';

/**
 * ソートフィールドの種類
 */
export type SortBy = 'order' | 'probability' | 'stock' | 'name' | 'createdAt';

/**
 * ソート順
 */
export type SortOrder = 'asc' | 'desc';

/**
 * レアリティフィルター (all = すべて表示)
 */
export type RarityFilter = RarityLevel | 'all';

/**
 * フィルター状態
 */
interface FilterState {
  sortBy: SortBy;
  sortOrder: SortOrder;
  rarityFilter: RarityFilter;
  showOutOfStock: boolean;
}

/**
 * デフォルトのフィルター状態
 */
const defaultFilterState: FilterState = {
  sortBy: 'order',
  sortOrder: 'asc',
  rarityFilter: 'all',
  showOutOfStock: true,
};

/**
 * フィルター状態管理ストア
 * Svelte 5のRunesを使用したリアクティブストア
 */
class FilterStoreClass {
  private _sortBy = $state<SortBy>(defaultFilterState.sortBy);
  private _sortOrder = $state<SortOrder>(defaultFilterState.sortOrder);
  private _rarityFilter = $state<RarityFilter>(defaultFilterState.rarityFilter);
  private _showOutOfStock = $state<boolean>(defaultFilterState.showOutOfStock);

  /**
   * 現在のソートフィールド
   */
  get sortBy(): SortBy {
    return this._sortBy;
  }

  /**
   * 現在のソート順
   */
  get sortOrder(): SortOrder {
    return this._sortOrder;
  }

  /**
   * 現在のレアリティフィルター
   */
  get rarityFilter(): RarityFilter {
    return this._rarityFilter;
  }

  /**
   * 在庫切れを表示するか
   */
  get showOutOfStock(): boolean {
    return this._showOutOfStock;
  }

  /**
   * ソートフィールドを設定
   */
  setSortBy(sortBy: SortBy): void {
    this._sortBy = sortBy;
  }

  /**
   * ソート順を設定
   */
  setSortOrder(sortOrder: SortOrder): void {
    this._sortOrder = sortOrder;
  }

  /**
   * レアリティフィルターを設定
   */
  setRarityFilter(rarityFilter: RarityFilter): void {
    this._rarityFilter = rarityFilter;
  }

  /**
   * 在庫切れ表示を設定
   */
  setShowOutOfStock(showOutOfStock: boolean): void {
    this._showOutOfStock = showOutOfStock;
  }

  /**
   * フィルターをデフォルト状態にリセット
   */
  reset(): void {
    this._sortBy = defaultFilterState.sortBy;
    this._sortOrder = defaultFilterState.sortOrder;
    this._rarityFilter = defaultFilterState.rarityFilter;
    this._showOutOfStock = defaultFilterState.showOutOfStock;
  }
}

/**
 * グローバルなフィルターストアインスタンス
 */
export const FilterStore = new FilterStoreClass();

/**
 * フィルターをリセットする関数
 * テスト用のヘルパー関数
 */
export function resetFilter(): void {
  FilterStore.reset();
}
