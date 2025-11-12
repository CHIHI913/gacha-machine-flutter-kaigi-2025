import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/svelte';
import { prizesStore, resetPrizes } from '../stores/prizes.svelte';
import PrizeListWidget from './PrizeListWidget.svelte';
import type { Prize } from '../types';

describe('PrizeListWidget', () => {
  beforeEach(() => {
    resetPrizes();
  });

  afterEach(() => {
    cleanup();
  });

  describe('基本表示', () => {
    it('should render component', () => {
      render(PrizeListWidget, { props: { mode: 'compact' } });
      expect(document.body).toBeTruthy();
    });

    it('should show empty message when no prizes', () => {
      render(PrizeListWidget, { props: { mode: 'compact' } });
      expect(screen.getByText('景品が設定されていません')).toBeTruthy();
    });

    it('should display prize list when prizes exist', () => {
      const prizes: Prize[] = [
        {
          id: '1',
          name: 'Prize A',
          imageUrl: '/a.png',
          stock: 5,
          createdAt: Date.now(),
        },
      ];

      prizesStore.setPrizes(prizes);
      render(PrizeListWidget, { props: { mode: 'compact' } });

      expect(screen.getByText('Prize A')).toBeTruthy();
    });

    it('should display probability for each prize', () => {
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
          stock: 5,
          createdAt: Date.now(),
        },
      ];

      prizesStore.setPrizes(prizes);
      render(PrizeListWidget, { props: { mode: 'compact' } });

      // 5/10 * 100 = 50%
      const probabilities = screen.getAllByText(/50%/);
      expect(probabilities.length).toBe(2);
    });

    it('should display stock for each prize', () => {
      const prizes: Prize[] = [
        {
          id: '1',
          name: 'Prize A',
          imageUrl: '/a.png',
          stock: 5,
          createdAt: Date.now(),
        },
      ];

      prizesStore.setPrizes(prizes);
      render(PrizeListWidget, { props: { mode: 'compact' } });

      expect(screen.getByText(/5\s*\/\s*5個/)).toBeTruthy();
    });

    it('should show low stock warning when remaining stock is 10% or less of total', () => {
      const prizes: Prize[] = [
        {
          id: '1',
          name: 'Prize A',
          imageUrl: '/a.png',
          stock: 4,
          totalStock: 40,
          createdAt: Date.now(),
        },
      ];

      prizesStore.setPrizes(prizes);
      render(PrizeListWidget, { props: { mode: 'compact' } });

      expect(screen.getByText(/残りわずか/)).toBeTruthy();
    });

    it('should not show low stock warning when remaining stock exceeds 10% of total', () => {
      const prizes: Prize[] = [
        {
          id: '1',
          name: 'Prize A',
          imageUrl: '/a.png',
          stock: 15,
          totalStock: 100,
          createdAt: Date.now(),
        },
      ];

      prizesStore.setPrizes(prizes);
      render(PrizeListWidget, { props: { mode: 'compact' } });

      expect(screen.queryByText(/残りわずか/)).toBeNull();
    });

    it('should gray out prizes with 0 stock', () => {
      const prizes: Prize[] = [
        {
          id: '1',
          name: 'Prize A',
          imageUrl: '/a.png',
          stock: 0,
          createdAt: Date.now(),
        },
      ];

      prizesStore.setPrizes(prizes);
      const { container } = render(PrizeListWidget, { props: { mode: 'compact' } });

      const prizeElement = container.querySelector('[data-testid="prize-1"]');
      expect(prizeElement?.classList.contains('out-of-stock')).toBe(true);
    });
  });

  describe('モード切り替え', () => {
    it('should render in compact mode', () => {
      const prizes: Prize[] = [
        {
          id: '1',
          name: 'Prize A',
          imageUrl: '/a.png',
          stock: 5,
          createdAt: Date.now(),
        },
      ];

      prizesStore.setPrizes(prizes);
      const { container } = render(PrizeListWidget, { props: { mode: 'compact' } });

      expect(container.querySelector('.prize-list-compact')).toBeTruthy();
    });

    it('should render in detailed mode', () => {
      const prizes: Prize[] = [
        {
          id: '1',
          name: 'Prize A',
          imageUrl: '/a.png',
          stock: 5,
          createdAt: Date.now(),
        },
      ];

      prizesStore.setPrizes(prizes);
      const { container } = render(PrizeListWidget, { props: { mode: 'detailed' } });

      expect(container.querySelector('.prize-list-detailed')).toBeTruthy();
    });

    it('should show description in detailed mode', () => {
      const prizes: Prize[] = [
        {
          id: '1',
          name: 'Prize A',
          imageUrl: '/a.png',
          stock: 5,
          createdAt: Date.now(),
          description: 'Test description',
        },
      ];

      prizesStore.setPrizes(prizes);
      render(PrizeListWidget, { props: { mode: 'detailed' } });

      expect(screen.getByText('Test description')).toBeTruthy();
    });
  });

  describe('ソート・フィルタコントロール', () => {
    it('should show controls when showControls is true', () => {
      const prizes: Prize[] = [
        {
          id: '1',
          name: 'Prize A',
          imageUrl: '/a.png',
          stock: 5,
          createdAt: Date.now(),
        },
      ];

      prizesStore.setPrizes(prizes);
      render(PrizeListWidget, { props: { mode: 'compact', showControls: true } });

      expect(screen.getByText(/ソート/)).toBeTruthy();
    });

    it('should not show controls when showControls is false', () => {
      render(PrizeListWidget, { props: { mode: 'compact', showControls: false } });

      expect(screen.queryByText(/ソート/)).toBeNull();
    });
  });
});
