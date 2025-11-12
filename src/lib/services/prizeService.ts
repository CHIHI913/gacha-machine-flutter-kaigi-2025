import { nanoid } from 'nanoid';
import { prizesStore } from '../stores/prizes.svelte';
import { StorageService } from './storage';
import { GoogleSheetsService } from './googleSheetsService';
import { config } from '../config';
import type { Prize, AddPrizeRequest, UpdatePrizeRequest } from '../types';

/**
 * 景品管理サービス
 * 景品のCRUD操作とビジネスロジックを提供
 * LocalStorageまたはGoogle Sheetsをバックエンドとして使用
 */
export class PrizeService {
  private storage: StorageService<Prize[]>;
  private sheetsService: GoogleSheetsService | null = null;

  constructor() {
    this.storage = new StorageService<Prize[]>('prizes');

    // Google Sheetsが有効な場合はサービスを初期化
    if (config.isGoogleSheetsEnabled) {
      this.sheetsService = new GoogleSheetsService(config.googleSheetsApiUrl);
    }
  }

  /**
   * 全景品を取得
   * @returns 景品リスト
   */
  getPrizes(): Prize[] {
    return prizesStore.prizes;
  }

  /**
   * 景品を追加
   * @param request 追加する景品の情報
   * @returns 追加された景品(IDとcreatedAtが設定済み)
   */
  async addPrize(request: AddPrizeRequest): Promise<Prize> {
    const totalStock = request.totalStock ?? request.stock;
    const normalizedStock = Math.min(request.stock, totalStock);
    const order = request.order ?? this.getNextOrder();

    const newPrize: Prize = this.normalizePrize({
      id: nanoid(),
      name: request.name,
      imageUrl: request.imageUrl,
      stock: normalizedStock,
      totalStock,
      order,
      createdAt: Date.now(),
      ...(request.description !== undefined && { description: request.description }),
    });

    const currentPrizes = prizesStore.prizes;
    const updatedPrizes = [...currentPrizes, newPrize];

    // ストアを即座に更新（UIの即時反映）
    prizesStore.setPrizes(updatedPrizes);

    // バックエンドに保存
    if (config.isGoogleSheetsEnabled) {
      try {
        await this.sheetsService!.addPrize(newPrize);
      } catch (error) {
        console.error('Failed to add prize to Google Sheets:', error);
        prizesStore.setPrizes(currentPrizes); // 元に戻す
        throw error;
      }
    } else {
      // LocalStorageのみの場合
      this.savePrizes(updatedPrizes);
    }

    return newPrize;
  }

  /**
   * 景品を更新
   * @param request 更新する景品の情報(部分更新対応)
   * @throws {Error} 景品が見つからない場合
   */
  async updatePrize(request: UpdatePrizeRequest): Promise<void> {
    const currentPrizes = prizesStore.prizes;
    const targetIndex = currentPrizes.findIndex((p) => p.id === request.id);

    if (targetIndex === -1) {
      throw new Error('指定された景品が見つかりません');
    }

    const target = currentPrizes[targetIndex];
    const nextTotalStock = request.totalStock ?? target.totalStock ?? target.stock;
    const requestedStock = request.stock ?? target.stock;
    const clampedStock = Math.min(requestedStock, nextTotalStock);
    const nextOrder = request.order ?? target.order ?? targetIndex + 1;

    const updatedPrize: Prize = this.normalizePrize({
      ...target,
      ...(request.name !== undefined && { name: request.name }),
      ...(request.imageUrl !== undefined && { imageUrl: request.imageUrl }),
      stock: clampedStock,
      totalStock: nextTotalStock,
      order: nextOrder,
      ...(request.description !== undefined && { description: request.description }),
    });

    const updatedPrizes = [...currentPrizes];
    updatedPrizes[targetIndex] = updatedPrize;

    // ストアを即座に更新
    prizesStore.setPrizes(updatedPrizes);

    // バックエンドに保存
    if (config.isGoogleSheetsEnabled) {
      try {
        await this.sheetsService!.updatePrize(request);
      } catch (error) {
        console.error('Failed to update prize in Google Sheets:', error);
        prizesStore.setPrizes(currentPrizes);
        throw error;
      }
    } else {
      this.savePrizes(updatedPrizes);
    }
  }

  /**
   * 景品を削除
   * @param id 削除する景品のID
   * @throws {Error} 景品が見つからない場合
   */
  async deletePrize(id: string): Promise<void> {
    const currentPrizes = prizesStore.prizes;
    const targetIndex = currentPrizes.findIndex((p) => p.id === id);

    if (targetIndex === -1) {
      throw new Error('指定された景品が見つかりません');
    }

    const updatedPrizes = currentPrizes.filter((p) => p.id !== id);

    // ストアを即座に更新
    prizesStore.setPrizes(updatedPrizes);

    // バックエンドに保存
    if (config.isGoogleSheetsEnabled) {
      try {
        await this.sheetsService!.deletePrize(id);
      } catch (error) {
        console.error('Failed to delete prize from Google Sheets:', error);
        prizesStore.setPrizes(currentPrizes);
        throw error;
      }
    } else {
      this.savePrizes(updatedPrizes);
    }
  }

  /**
   * 景品データを読み込む
   * Google Sheets有効時はスプレッドシートから、それ以外はLocalStorageから
   */
  async loadPrizes(): Promise<void> {
    // Google Sheetsから読み込み
    if (config.isGoogleSheetsEnabled) {
      try {
        const prizes = await this.sheetsService!.getPrizes();
        prizesStore.setPrizes(prizes.map((p) => this.normalizePrize(p)));
        return;
      } catch (error) {
        console.error('Failed to load prizes from Google Sheets:', error);
        prizesStore.setPrizes([]);
        if (error instanceof Error) {
          throw error;
        }
        throw new Error(String(error));
      }
    }

    // LocalStorageから読み込み
    const storedPrizes = this.storage.get();
    if (storedPrizes) {
      prizesStore.setPrizes(storedPrizes.map((p) => this.normalizePrize(p)));
    } else {
      prizesStore.setPrizes([]);
    }
  }

  /**
   * 在庫がある景品からランダムに1つ抽選
   * @returns 抽選された景品、在庫がない場合はnull
   */
  drawPrize(): Prize | null {
    const availablePrizes = prizesStore.availablePrizes;

    if (availablePrizes.length === 0) {
      return null;
    }

    // ランダムに1つ選択
    const randomIndex = Math.floor(Math.random() * availablePrizes.length);
    return availablePrizes[randomIndex];
  }

  /**
   * 景品の在庫を1つ減らす
   * @param id 景品のID
   * @throws {Error} 景品が見つからない場合
   */
  async decrementStock(id: string): Promise<void> {
    const currentPrizes = prizesStore.prizes;
    const targetIndex = currentPrizes.findIndex((p) => p.id === id);

    if (targetIndex === -1) {
      throw new Error('指定された景品が見つかりません');
    }

    const currentStock = currentPrizes[targetIndex].stock;
    const newStock = Math.max(0, currentStock - 1);

    const updatedPrize: Prize = {
      ...currentPrizes[targetIndex],
      stock: newStock,
    };

    const updatedPrizes = [...currentPrizes];
    updatedPrizes[targetIndex] = updatedPrize;

    // ストアを即座に更新
    prizesStore.setPrizes(updatedPrizes);

    // バックエンドに保存
    if (config.isGoogleSheetsEnabled) {
      try {
        await this.sheetsService!.decrementStock(id);
      } catch (error) {
        console.error('Failed to decrement stock in Google Sheets:', error);
        prizesStore.setPrizes(currentPrizes);
        throw error;
      }
    } else {
      this.savePrizes(updatedPrizes);
    }
  }

  /**
   * LocalStorageに景品データを保存
   * @param prizes 保存する景品リスト
   * @private
   */
  private savePrizes(prizes: Prize[]): void {
    this.storage.set(prizes.map((p) => this.normalizePrize(p)));
  }

  /**
   * totalStockが未設定の場合に補完し、在庫を分母以内に収める
   */
  private normalizePrize(prize: Prize): Prize {
    const totalStock = prize.totalStock ?? prize.stock;
    const stock = Math.min(prize.stock, totalStock);
    const createdAt = prize.createdAt ?? Date.now();
    const orderValue = prize.order ?? createdAt;
    const order = typeof orderValue === 'number' ? orderValue : Number(orderValue) || createdAt;

    return {
      ...prize,
      stock,
      totalStock,
      createdAt,
      order,
    };
  }

  private getNextOrder(): number {
    const prizes = prizesStore.prizes;
    if (prizes.length === 0) {
      return 1;
    }
    return Math.max(...prizes.map((p) => p.order ?? 0)) + 1;
  }

}
