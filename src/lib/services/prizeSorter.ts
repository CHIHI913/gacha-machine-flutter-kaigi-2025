import type { PrizeDisplayInfo } from '../types';
import type { SortBy, SortOrder } from '../stores/filter.svelte';

/**
 * 景品のソート機能を提供するサービス
 */
export class PrizeSorter {
  /**
   * 景品表示情報リストをソート
   * @param displayInfoList ソート対象の景品表示情報リスト
   * @param sortBy ソートフィールド
   * @param sortOrder ソート順
   * @returns ソート済みの景品表示情報リスト（新しい配列）
   */
  sort(
    displayInfoList: PrizeDisplayInfo[],
    sortBy: SortBy,
    sortOrder: SortOrder
  ): PrizeDisplayInfo[] {
    // 元の配列を変更しないようにコピー
    const copied = [...displayInfoList];

    // ソート順の乗数（昇順: 1, 降順: -1）
    const orderMultiplier = sortOrder === 'asc' ? 1 : -1;

    // ソートフィールドに応じて比較関数を適用
    copied.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'order':
          comparison = (a.prize.order ?? Infinity) - (b.prize.order ?? Infinity);
          break;

        case 'probability':
          comparison = a.probability - b.probability;
          break;

        case 'stock':
          comparison = a.prize.stock - b.prize.stock;
          break;

        case 'name':
          // 日本語文字列も正しく比較できるようにlocaleCompareを使用
          comparison = a.prize.name.localeCompare(b.prize.name, 'ja');
          break;

        case 'createdAt':
          comparison = a.prize.createdAt - b.prize.createdAt;
          break;
      }

      return comparison * orderMultiplier;
    });

    return copied;
  }
}
