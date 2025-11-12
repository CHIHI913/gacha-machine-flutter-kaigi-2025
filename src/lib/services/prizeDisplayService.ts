import { prizesStore } from '../stores/prizes.svelte';
import { FilterStore } from '../stores/filter.svelte';
import { ProbabilityCalculator } from './probabilityCalculator';
import { RarityClassifier } from './rarityClassifier';
import { PrizeSorter } from './prizeSorter';
import { PrizeFilter } from './prizeFilter';
import type { PrizeDisplayInfo, PrizeStats } from '../types';

/**
 * 景品表示に必要な情報を計算・提供するサービス
 */
export class PrizeDisplayService {
  private probabilityCalculator: ProbabilityCalculator;
  private rarityClassifier: RarityClassifier;
  private prizeSorter: PrizeSorter;
  private prizeFilter: PrizeFilter;

  // 在庫少ない判定を行う在庫比率（10%）
  private readonly LOW_STOCK_RATIO_THRESHOLD = 0.1;

  constructor() {
    this.probabilityCalculator = new ProbabilityCalculator();
    this.rarityClassifier = new RarityClassifier();
    this.prizeSorter = new PrizeSorter();
    this.prizeFilter = new PrizeFilter();
  }

  /**
   * 景品表示情報を取得
   * @param prizeId 景品ID
   * @returns 景品表示情報(確率、レアリティ等を含む)
   * @throws {Error} 景品が見つからない場合
   */
  getPrizeDisplayInfo(prizeId: string): PrizeDisplayInfo {
    const prizes = prizesStore.prizes;
    const prize = prizes.find((p) => p.id === prizeId);

    if (!prize) {
      throw new Error('指定された景品が見つかりません');
    }

    // 確率を計算
    const probabilityMap = this.probabilityCalculator.calculate(prizes);
    const probability = probabilityMap.get(prizeId) ?? 0;

    // レアリティを分類
    const rarity = this.rarityClassifier.classify(probability);

    // 在庫少ないかどうかを判定（在庫/仕入れ総数 <= 10%）
    const denominator = prize.totalStock ?? prize.stock;
    const ratio = denominator > 0 ? prize.stock / denominator : 1;
    const isLowStock = prize.stock > 0 && ratio <= this.LOW_STOCK_RATIO_THRESHOLD;

    return {
      prize,
      probability,
      rarity,
      isLowStock,
    };
  }

  /**
   * 全景品の表示情報を取得
   * @returns 全景品の表示情報配列
   */
  getAllPrizeDisplayInfo(): PrizeDisplayInfo[] {
    const prizes = prizesStore.prizes;

    return prizes.map((prize) => this.getPrizeDisplayInfo(prize.id));
  }

  /**
   * 景品統計情報を取得
   * @returns 統計情報
   */
  getStats(): PrizeStats {
    const prizes = prizesStore.prizes;

    const totalCount = prizes.length;
    const availableCount = prizes.filter((p) => p.stock > 0).length;
    const outOfStockCount = prizes.filter((p) => p.stock === 0).length;
    const remainingStock = prizes.reduce((sum, p) => sum + p.stock, 0);
    const totalStockCapacity = prizes.reduce((sum, p) => sum + (p.totalStock ?? p.stock), 0);

    return {
      totalCount,
      availableCount,
      outOfStockCount,
      remainingStock,
      totalStockCapacity,
      totalStock: remainingStock,
    };
  }

  /**
   * フィルター・ソートを適用した景品表示情報を取得
   * FilterStoreの設定に基づいて、景品をフィルター・ソートして返す
   * @returns フィルター・ソート済みの景品表示情報配列
   */
  getFilteredAndSortedPrizeDisplayInfo(): PrizeDisplayInfo[] {
    // まず全景品の表示情報を取得
    let displayInfoList = this.getAllPrizeDisplayInfo();

    // レアリティでフィルター
    displayInfoList = this.prizeFilter.filterByRarity(
      displayInfoList,
      FilterStore.rarityFilter
    );

    // 在庫切れ表示でフィルター
    displayInfoList = this.prizeFilter.filterByStock(
      displayInfoList,
      FilterStore.showOutOfStock
    );

    // ソート
    displayInfoList = this.prizeSorter.sort(
      displayInfoList,
      FilterStore.sortBy,
      FilterStore.sortOrder
    );

    return displayInfoList;
  }
}
