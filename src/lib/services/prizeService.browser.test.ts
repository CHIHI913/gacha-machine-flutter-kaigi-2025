import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PrizeService } from './prizeService';
import { prizesStore, resetPrizes } from '../stores/prizes.svelte';
import type { Prize, AddPrizeRequest, UpdatePrizeRequest } from '../types';

describe('PrizeService', () => {
  let prizeService: PrizeService;

  beforeEach(() => {
    // 各テスト前に状態をリセット
    resetPrizes();
    // ストレージをモック化(localStorage使用を想定)
    localStorage.clear();
    // サービスのインスタンスを作成
    prizeService = new PrizeService();
  });

  describe('getPrizes', () => {
    it('should return all prizes', () => {
      const testPrizes: Prize[] = [
        {
          id: '1',
          name: 'Prize A',
          imageUrl: '/a.png',
          stock: 5,
          createdAt: Date.now(),
        },
      ];

      prizesStore.setPrizes(testPrizes);

      const result = prizeService.getPrizes();
      expect(result).toEqual(testPrizes);
    });

    it('should return empty array when no prizes exist', () => {
      const result = prizeService.getPrizes();
      expect(result).toEqual([]);
    });
  });

  describe('addPrize', () => {
    it('should add a prize with generated ID and createdAt', async () => {
      const request: AddPrizeRequest = {
        name: 'New Prize',
        imageUrl: '/new.png',
        stock: 10,
      };

      const result = await prizeService.addPrize(request);

      expect(result.id).toBeDefined();
      expect(result.id.length).toBeGreaterThan(0);
      expect(result.name).toBe('New Prize');
      expect(result.imageUrl).toBe('/new.png');
      expect(result.stock).toBe(10);
      expect(result.createdAt).toBeDefined();
      expect(typeof result.createdAt).toBe('number');
    });

    it('should add prize to store', async () => {
      const request: AddPrizeRequest = {
        name: 'New Prize',
        imageUrl: '/new.png',
        stock: 10,
      };

      await prizeService.addPrize(request);

      const prizes = prizesStore.prizes;
      expect(prizes.length).toBe(1);
      expect(prizes[0].name).toBe('New Prize');
    });

    it('should save to localStorage after adding', async () => {
      const request: AddPrizeRequest = {
        name: 'New Prize',
        imageUrl: '/new.png',
        stock: 10,
      };

      await prizeService.addPrize(request);

      const saved = localStorage.getItem('prizes');
      expect(saved).toBeDefined();
      const parsed = JSON.parse(saved!);
      expect(parsed.length).toBe(1);
      expect(parsed[0].name).toBe('New Prize');
    });

    it('should generate unique IDs for multiple prizes', async () => {
      const request1: AddPrizeRequest = {
        name: 'Prize 1',
        imageUrl: '/1.png',
        stock: 5,
      };
      const request2: AddPrizeRequest = {
        name: 'Prize 2',
        imageUrl: '/2.png',
        stock: 3,
      };

      const prize1 = await prizeService.addPrize(request1);
      const prize2 = await prizeService.addPrize(request2);

      expect(prize1.id).not.toBe(prize2.id);
    });

    it('should add prize with description field', async () => {
      const request: AddPrizeRequest = {
        name: 'Prize with Description',
        imageUrl: '/prize.png',
        stock: 5,
        description: 'This is a test prize description',
      };

      const result = await prizeService.addPrize(request);

      expect(result.description).toBe('This is a test prize description');
    });

    it('should add prize without description field', async () => {
      const request: AddPrizeRequest = {
        name: 'Prize without Description',
        imageUrl: '/prize.png',
        stock: 5,
      };

      const result = await prizeService.addPrize(request);

      expect(result.description).toBeUndefined();
    });

    it('should save prize with description to localStorage', async () => {
      const request: AddPrizeRequest = {
        name: 'Prize',
        imageUrl: '/prize.png',
        stock: 5,
        description: 'Test description',
      };

      await prizeService.addPrize(request);

      const saved = localStorage.getItem('prizes');
      const parsed = JSON.parse(saved!);
      expect(parsed[0].description).toBe('Test description');
    });
  });

  describe('updatePrize', () => {
    it('should update prize name', async () => {
      const prize = await prizeService.addPrize({
        name: 'Old Name',
        imageUrl: '/old.png',
        stock: 5,
      });

      const request: UpdatePrizeRequest = {
        id: prize.id,
        name: 'New Name',
      };

      await prizeService.updatePrize(request);

      const updated = prizesStore.prizes.find((p) => p.id === prize.id);
      expect(updated?.name).toBe('New Name');
      expect(updated?.imageUrl).toBe('/old.png'); // 変更されていないことを確認
      expect(updated?.stock).toBe(5); // 変更されていないことを確認
    });

    it('should update prize imageUrl', async () => {
      const prize = await prizeService.addPrize({
        name: 'Prize',
        imageUrl: '/old.png',
        stock: 5,
      });

      const request: UpdatePrizeRequest = {
        id: prize.id,
        imageUrl: '/new.png',
      };

      await prizeService.updatePrize(request);

      const updated = prizesStore.prizes.find((p) => p.id === prize.id);
      expect(updated?.imageUrl).toBe('/new.png');
    });

    it('should update prize stock', async () => {
      const prize = await prizeService.addPrize({
        name: 'Prize',
        imageUrl: '/prize.png',
        stock: 5,
      });

      const request: UpdatePrizeRequest = {
        id: prize.id,
        stock: 10,
      };

      await prizeService.updatePrize(request);

      const updated = prizesStore.prizes.find((p) => p.id === prize.id);
      expect(updated?.stock).toBe(10);
    });

    it('should update multiple fields at once', async () => {
      const prize = await prizeService.addPrize({
        name: 'Old Prize',
        imageUrl: '/old.png',
        stock: 5,
      });

      const request: UpdatePrizeRequest = {
        id: prize.id,
        name: 'New Prize',
        imageUrl: '/new.png',
        stock: 20,
      };

      await prizeService.updatePrize(request);

      const updated = prizesStore.prizes.find((p) => p.id === prize.id);
      expect(updated?.name).toBe('New Prize');
      expect(updated?.imageUrl).toBe('/new.png');
      expect(updated?.stock).toBe(20);
    });

    it('should save to localStorage after updating', async () => {
      const prize = await prizeService.addPrize({
        name: 'Prize',
        imageUrl: '/prize.png',
        stock: 5,
      });

      const request: UpdatePrizeRequest = {
        id: prize.id,
        name: 'Updated Prize',
      };

      await prizeService.updatePrize(request);

      const saved = localStorage.getItem('prizes');
      const parsed = JSON.parse(saved!);
      expect(parsed[0].name).toBe('Updated Prize');
    });

    it('should throw error when prize not found', async () => {
      const request: UpdatePrizeRequest = {
        id: 'non-existent-id',
        name: 'New Name',
      };

      await expect(prizeService.updatePrize(request)).rejects.toThrow(
        '指定された景品が見つかりません'
      );
    });

    it('should update prize description', async () => {
      const prize = await prizeService.addPrize({
        name: 'Prize',
        imageUrl: '/prize.png',
        stock: 5,
        description: 'Old description',
      });

      const request: UpdatePrizeRequest = {
        id: prize.id,
        description: 'New description',
      };

      await prizeService.updatePrize(request);

      const updated = prizesStore.prizes.find((p) => p.id === prize.id);
      expect(updated?.description).toBe('New description');
      expect(updated?.name).toBe('Prize'); // 変更されていないことを確認
    });

    it('should update prize and add description to prize without one', async () => {
      const prize = await prizeService.addPrize({
        name: 'Prize',
        imageUrl: '/prize.png',
        stock: 5,
      });

      const request: UpdatePrizeRequest = {
        id: prize.id,
        description: 'Added description',
      };

      await prizeService.updatePrize(request);

      const updated = prizesStore.prizes.find((p) => p.id === prize.id);
      expect(updated?.description).toBe('Added description');
    });

    it('should save updated description to localStorage', async () => {
      const prize = await prizeService.addPrize({
        name: 'Prize',
        imageUrl: '/prize.png',
        stock: 5,
      });

      const request: UpdatePrizeRequest = {
        id: prize.id,
        description: 'Updated description',
      };

      await prizeService.updatePrize(request);

      const saved = localStorage.getItem('prizes');
      const parsed = JSON.parse(saved!);
      expect(parsed[0].description).toBe('Updated description');
    });
  });

  describe('deletePrize', () => {
    it('should delete prize from store', async () => {
      const prize = await prizeService.addPrize({
        name: 'Prize to Delete',
        imageUrl: '/delete.png',
        stock: 5,
      });

      await prizeService.deletePrize(prize.id);

      const prizes = prizesStore.prizes;
      expect(prizes.length).toBe(0);
    });

    it('should save to localStorage after deleting', async () => {
      const prize = await prizeService.addPrize({
        name: 'Prize',
        imageUrl: '/prize.png',
        stock: 5,
      });

      await prizeService.deletePrize(prize.id);

      const saved = localStorage.getItem('prizes');
      const parsed = JSON.parse(saved!);
      expect(parsed.length).toBe(0);
    });

    it('should throw error when prize not found', async () => {
      await expect(prizeService.deletePrize('non-existent-id')).rejects.toThrow(
        '指定された景品が見つかりません'
      );
    });

    it('should only delete specified prize', async () => {
      const prize1 = await prizeService.addPrize({
        name: 'Prize 1',
        imageUrl: '/1.png',
        stock: 5,
      });
      const prize2 = await prizeService.addPrize({
        name: 'Prize 2',
        imageUrl: '/2.png',
        stock: 3,
      });

      await prizeService.deletePrize(prize1.id);

      const prizes = prizesStore.prizes;
      expect(prizes.length).toBe(1);
      expect(prizes[0].id).toBe(prize2.id);
    });
  });

  describe('drawPrize', () => {
    it('should return null when no prizes available', () => {
      const result = prizeService.drawPrize();
      expect(result).toBeNull();
    });

    it('should return null when all prizes have 0 stock', async () => {
      await prizeService.addPrize({
        name: 'Prize A',
        imageUrl: '/a.png',
        stock: 0,
      });
      await prizeService.addPrize({
        name: 'Prize B',
        imageUrl: '/b.png',
        stock: 0,
      });

      const result = prizeService.drawPrize();
      expect(result).toBeNull();
    });

    it('should return a prize when prizes with stock are available', async () => {
      await prizeService.addPrize({
        name: 'Prize A',
        imageUrl: '/a.png',
        stock: 5,
      });

      const result = prizeService.drawPrize();
      expect(result).not.toBeNull();
      expect(result?.name).toBe('Prize A');
    });

    it('should only draw from prizes with stock > 0', async () => {
      await prizeService.addPrize({
        name: 'Prize A',
        imageUrl: '/a.png',
        stock: 0,
      });
      const prizeB = await prizeService.addPrize({
        name: 'Prize B',
        imageUrl: '/b.png',
        stock: 1,
      });

      const result = prizeService.drawPrize();
      expect(result?.id).toBe(prizeB.id);
    });

    it('should randomly select from multiple available prizes', async () => {
      await prizeService.addPrize({
        name: 'Prize A',
        imageUrl: '/a.png',
        stock: 5,
      });
      await prizeService.addPrize({
        name: 'Prize B',
        imageUrl: '/b.png',
        stock: 5,
      });
      await prizeService.addPrize({
        name: 'Prize C',
        imageUrl: '/c.png',
        stock: 5,
      });

      // 複数回抽選して、異なる結果が出る確率を確認
      const results = new Set<string>();
      for (let i = 0; i < 20; i++) {
        const result = prizeService.drawPrize();
        if (result) {
          results.add(result.name);
        }
      }

      // 20回抽選すれば、少なくとも2種類以上の景品が選ばれる可能性が高い
      expect(results.size).toBeGreaterThan(1);
    });
  });

  describe('decrementStock', () => {
    it('should decrease prize stock by 1', async () => {
      const prize = await prizeService.addPrize({
        name: 'Prize',
        imageUrl: '/prize.png',
        stock: 5,
      });

      const remaining = await prizeService.decrementStock(prize.id);

      const updated = prizesStore.prizes.find((p) => p.id === prize.id);
      expect(updated?.stock).toBe(4);
      expect(remaining).toBe(4);
    });

    it('should not decrease stock below 0', async () => {
      const prize = await prizeService.addPrize({
        name: 'Prize',
        imageUrl: '/prize.png',
        stock: 1,
      });

      const first = await prizeService.decrementStock(prize.id);
      const second = await prizeService.decrementStock(prize.id); // 2回目

      const updated = prizesStore.prizes.find((p) => p.id === prize.id);
      expect(updated?.stock).toBe(0);
      expect(first).toBe(0);
      expect(second).toBe(0);
    });

    it('should save to localStorage after decrementing', async () => {
      const prize = await prizeService.addPrize({
        name: 'Prize',
        imageUrl: '/prize.png',
        stock: 5,
      });

      await prizeService.decrementStock(prize.id);

      const saved = localStorage.getItem('prizes');
      const parsed = JSON.parse(saved!);
      expect(parsed[0].stock).toBe(4);
    });

    it('should throw error when prize not found', async () => {
      await expect(prizeService.decrementStock('non-existent-id')).rejects.toThrow(
        '指定された景品が見つかりません'
      );
    });
  });

  describe('loadPrizes', () => {
    it('should load prizes from localStorage', async () => {
      const testPrizes: Prize[] = [
        {
          id: '1',
          name: 'Stored Prize',
          imageUrl: '/stored.png',
          stock: 5,
          createdAt: Date.now(),
        },
      ];

      localStorage.setItem('prizes', JSON.stringify(testPrizes));

      await prizeService.loadPrizes();

      const prizes = prizesStore.prizes;
      expect(prizes).toEqual(testPrizes);
    });

    it('should handle empty localStorage', async () => {
      await prizeService.loadPrizes();

      const prizes = prizesStore.prizes;
      expect(prizes).toEqual([]);
    });

    it('should handle corrupted data gracefully', async () => {
      localStorage.setItem('prizes', 'invalid json');

      await prizeService.loadPrizes();

      const prizes = prizesStore.prizes;
      expect(prizes).toEqual([]);
    });
  });
});
