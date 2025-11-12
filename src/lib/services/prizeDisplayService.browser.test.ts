import { describe, it, expect, beforeEach } from 'vitest';
import { PrizeDisplayService } from './prizeDisplayService';
import { prizesStore, resetPrizes } from '../stores/prizes.svelte';
import { FilterStore, resetFilter } from '../stores/filter.svelte';
import type { Prize } from '../types';

describe('PrizeDisplayService', () => {
  let service: PrizeDisplayService;

  beforeEach(() => {
    resetPrizes();
    resetFilter();
    service = new PrizeDisplayService();
  });

  describe('getPrizeDisplayInfo', () => {
    it('should return correct display info for a prize', () => {
      const prizes: Prize[] = [
        {
          id: '1',
          name: 'Prize A',
          imageUrl: '/a.png',
          stock: 5,
          totalStock: 50,
          createdAt: Date.now(),
        },
        {
          id: '2',
          name: 'Prize B',
          imageUrl: '/b.png',
          stock: 5,
          totalStock: 50,
          createdAt: Date.now(),
        },
      ];

      prizesStore.setPrizes(prizes);

      const displayInfo = service.getPrizeDisplayInfo('1');

      expect(displayInfo.prize.id).toBe('1');
      expect(displayInfo.probability).toBe(50); // 5/10 * 100
      expect(displayInfo.rarity).toBe('Normal'); // 50% >= 10%
      expect(displayInfo.isLowStock).toBe(true); // 5/50 = 10%
    });

    it('should classify as Rare when probability is between 3% and 10%', () => {
      const prizes: Prize[] = [
        {
          id: '1',
          name: 'Prize A',
          imageUrl: '/a.png',
          stock: 5,
          createdAt: Date.now(),
        },
        {
          id: '2',
          name: 'Prize B',
          imageUrl: '/b.png',
          stock: 95,
          createdAt: Date.now(),
        },
      ];

      prizesStore.setPrizes(prizes);

      const displayInfo = service.getPrizeDisplayInfo('1');

      expect(displayInfo.probability).toBe(5); // 5/100 * 100
      expect(displayInfo.rarity).toBe('Rare'); // 5% is between 3% and 10%
    });

    it('should classify as SuperRare when probability is less than 3%', () => {
      const prizes: Prize[] = [
        {
          id: '1',
          name: 'Prize A',
          imageUrl: '/a.png',
          stock: 1,
          createdAt: Date.now(),
        },
        {
          id: '2',
          name: 'Prize B',
          imageUrl: '/b.png',
          stock: 99,
          createdAt: Date.now(),
        },
      ];

      prizesStore.setPrizes(prizes);

      const displayInfo = service.getPrizeDisplayInfo('1');

      expect(displayInfo.probability).toBe(1); // 1/100 * 100
      expect(displayInfo.rarity).toBe('SuperRare'); // 1% < 3%
    });

    it('should mark isLowStock as false when remaining stock ratio exceeds 10%', () => {
      const prizes: Prize[] = [
        {
          id: '1',
          name: 'Prize A',
          imageUrl: '/a.png',
          stock: 10,
          totalStock: 50,
          createdAt: Date.now(),
        },
      ];

      prizesStore.setPrizes(prizes);

      const displayInfo = service.getPrizeDisplayInfo('1');

      expect(displayInfo.isLowStock).toBe(false);
    });

    it('should throw error when prize not found', () => {
      expect(() => service.getPrizeDisplayInfo('non-existent')).toThrow(
        '指定された景品が見つかりません'
      );
    });
  });

  describe('getAllPrizeDisplayInfo', () => {
    it('should return display info for all prizes', () => {
      const prizes: Prize[] = [
        {
          id: '1',
          name: 'Prize A',
          imageUrl: '/a.png',
          stock: 8,
          createdAt: Date.now(),
        },
        {
          id: '2',
          name: 'Prize B',
          imageUrl: '/b.png',
          stock: 2,
          createdAt: Date.now(),
        },
      ];

      prizesStore.setPrizes(prizes);

      const allDisplayInfo = service.getAllPrizeDisplayInfo();

      expect(allDisplayInfo.length).toBe(2);
      expect(allDisplayInfo[0].prize.id).toBe('1');
      expect(allDisplayInfo[0].probability).toBe(80);
      expect(allDisplayInfo[1].prize.id).toBe('2');
      expect(allDisplayInfo[1].probability).toBe(20);
    });

    it('should return empty array when no prizes', () => {
      const allDisplayInfo = service.getAllPrizeDisplayInfo();

      expect(allDisplayInfo).toEqual([]);
    });
  });

  describe('getStats', () => {
    it('should return correct statistics', () => {
      const prizes: Prize[] = [
        {
          id: '1',
          name: 'Prize A',
          imageUrl: '/a.png',
          stock: 5,
          createdAt: Date.now(),
        },
        {
          id: '2',
          name: 'Prize B',
          imageUrl: '/b.png',
          stock: 3,
          createdAt: Date.now(),
        },
        {
          id: '3',
          name: 'Prize C',
          imageUrl: '/c.png',
          stock: 0,
          createdAt: Date.now(),
        },
      ];

      prizesStore.setPrizes(prizes);

      const stats = service.getStats();

      expect(stats.totalCount).toBe(3);
      expect(stats.availableCount).toBe(2); // Prize A, B
      expect(stats.outOfStockCount).toBe(1); // Prize C
      expect(stats.totalStock).toBe(8); // 5 + 3 + 0
    });

    it('should handle empty prizes', () => {
      const stats = service.getStats();

      expect(stats.totalCount).toBe(0);
      expect(stats.availableCount).toBe(0);
      expect(stats.outOfStockCount).toBe(0);
      expect(stats.totalStock).toBe(0);
    });

    it('should handle all prizes out of stock', () => {
      const prizes: Prize[] = [
        {
          id: '1',
          name: 'Prize A',
          imageUrl: '/a.png',
          stock: 0,
          createdAt: Date.now(),
        },
        {
          id: '2',
          name: 'Prize B',
          imageUrl: '/b.png',
          stock: 0,
          createdAt: Date.now(),
        },
      ];

      prizesStore.setPrizes(prizes);

      const stats = service.getStats();

      expect(stats.totalCount).toBe(2);
      expect(stats.availableCount).toBe(0);
      expect(stats.outOfStockCount).toBe(2);
      expect(stats.totalStock).toBe(0);
    });
  });

  describe('getFilteredAndSortedPrizeDisplayInfo', () => {
    const prizes: Prize[] = [
      {
        id: '1',
        name: 'Common Prize A',
        imageUrl: '/a.png',
        stock: 50,
        createdAt: 1000,
      },
      {
        id: '2',
        name: 'Rare Prize B',
        imageUrl: '/b.png',
        stock: 5,
        createdAt: 2000,
      },
      {
        id: '3',
        name: 'Super Rare Prize C',
        imageUrl: '/c.png',
        stock: 1,
        createdAt: 3000,
      },
      {
        id: '4',
        name: 'Out of Stock',
        imageUrl: '/d.png',
        stock: 0,
        createdAt: 4000,
      },
    ];

    beforeEach(() => {
      prizesStore.setPrizes(prizes);
    });

    it('should apply default sort (probability desc)', () => {
      const result = service.getFilteredAndSortedPrizeDisplayInfo();

      expect(result.length).toBe(4);
      // 確率の降順: Common(50/56≈89%) > Rare(5/56≈9%) > SuperRare(1/56≈2%) > OutOfStock(0%)
      expect(result[0].prize.name).toBe('Common Prize A');
      expect(result[3].prize.name).toBe('Out of Stock');
    });

    it('should sort by stock ascending', () => {
      FilterStore.setSortBy('stock');
      FilterStore.setSortOrder('asc');

      const result = service.getFilteredAndSortedPrizeDisplayInfo();

      expect(result[0].prize.stock).toBe(0);
      expect(result[1].prize.stock).toBe(1);
      expect(result[2].prize.stock).toBe(5);
      expect(result[3].prize.stock).toBe(50);
    });

    it('should sort by name ascending', () => {
      FilterStore.setSortBy('name');
      FilterStore.setSortOrder('asc');

      const result = service.getFilteredAndSortedPrizeDisplayInfo();

      expect(result[0].prize.name).toBe('Common Prize A');
      expect(result[1].prize.name).toBe('Out of Stock');
      expect(result[2].prize.name).toBe('Rare Prize B');
      expect(result[3].prize.name).toBe('Super Rare Prize C');
    });

    it('should sort by createdAt descending (newest first)', () => {
      FilterStore.setSortBy('createdAt');
      FilterStore.setSortOrder('desc');

      const result = service.getFilteredAndSortedPrizeDisplayInfo();

      expect(result[0].prize.createdAt).toBe(4000);
      expect(result[1].prize.createdAt).toBe(3000);
      expect(result[2].prize.createdAt).toBe(2000);
      expect(result[3].prize.createdAt).toBe(1000);
    });

    it('should filter by rarity', () => {
      FilterStore.setRarityFilter('Rare');

      const result = service.getFilteredAndSortedPrizeDisplayInfo();

      expect(result.length).toBe(1);
      expect(result[0].prize.name).toBe('Rare Prize B');
      expect(result[0].rarity).toBe('Rare');
    });

    it('should filter out out-of-stock items', () => {
      FilterStore.setShowOutOfStock(false);

      const result = service.getFilteredAndSortedPrizeDisplayInfo();

      expect(result.length).toBe(3);
      expect(result.every((item) => item.prize.stock > 0)).toBe(true);
    });

    it('should apply both filters and sort', () => {
      // SuperRareのみ、在庫ありのみ、在庫数で昇順
      FilterStore.setRarityFilter('SuperRare');
      FilterStore.setShowOutOfStock(false);
      FilterStore.setSortBy('stock');
      FilterStore.setSortOrder('asc');

      const result = service.getFilteredAndSortedPrizeDisplayInfo();

      expect(result.length).toBe(1);
      expect(result[0].prize.name).toBe('Super Rare Prize C');
      expect(result[0].rarity).toBe('SuperRare');
      expect(result[0].prize.stock).toBeGreaterThan(0);
    });

    it('should return empty array when filters exclude all items', () => {
      FilterStore.setRarityFilter('SuperRare');
      FilterStore.setShowOutOfStock(false);

      // Super Rare Prize Cは在庫1なので、実際には1件返る
      // 在庫0のものをフィルターするケース
      prizesStore.setPrizes([
        {
          id: '1',
          name: 'Out of Stock SuperRare',
          imageUrl: '/a.png',
          stock: 0,
          createdAt: 1000,
        },
      ]);

      const result = service.getFilteredAndSortedPrizeDisplayInfo();

      expect(result.length).toBe(0);
    });

    it('should return all when filters are permissive', () => {
      FilterStore.setRarityFilter('all');
      FilterStore.setShowOutOfStock(true);

      const result = service.getFilteredAndSortedPrizeDisplayInfo();

      expect(result.length).toBe(4);
    });
  });
});
