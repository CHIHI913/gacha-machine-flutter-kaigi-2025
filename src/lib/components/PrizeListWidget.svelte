<script lang="ts">
  import { prizesStore } from '../stores/prizes.svelte';
  import { FilterStore } from '../stores/filter.svelte';
  import { PrizeDisplayService } from '../services/prizeDisplayService';
  import { RarityClassifier } from '../services/rarityClassifier';

  // Props
  interface Props {
    mode: 'compact' | 'detailed';
    onPrizeClick?: (prizeId: string) => void;
    showControls?: boolean;
  }

  let { mode, onPrizeClick, showControls = false }: Props = $props();

  // Services
  const prizeDisplayService = new PrizeDisplayService();
  const rarityClassifier = new RarityClassifier();

  // State
  let prizes = $derived(prizesStore.prizes);
  let displayInfoList = $derived.by(() => {
    if (prizes.length === 0) return [];
    // FilterStoreの設定を参照することでリアクティビティを確保
    FilterStore.sortBy;
    FilterStore.sortOrder;
    FilterStore.rarityFilter;
    FilterStore.showOutOfStock;
    return prizeDisplayService.getFilteredAndSortedPrizeDisplayInfo();
  });

  // Event handlers
  function handlePrizeClick(prizeId: string) {
    if (onPrizeClick) {
      onPrizeClick(prizeId);
    }
  }
</script>

<div class="prize-list-widget">
  {#if displayInfoList.length === 0}
    <div class="empty-message">景品が設定されていません</div>
  {:else}
    {#if showControls}
      <div class="controls">
        <span>ソート</span>
      </div>
    {/if}

    <div class={`prize-list-${mode}`}>
      {#each displayInfoList as info (info.prize.id)}
        <div
          class="prize-item"
          class:out-of-stock={info.prize.stock === 0}
          data-testid={`prize-${info.prize.id}`}
          onclick={() => handlePrizeClick(info.prize.id)}
          onkeydown={(e) => e.key === 'Enter' && handlePrizeClick(info.prize.id)}
          role="button"
          tabindex="0"
        >
          <div class="prize-header">
            <span
              class="rarity-icon"
              style="color: {rarityClassifier.getColor(info.rarity)}"
            >
              {rarityClassifier.getIcon(info.rarity)}
            </span>
            <span class="prize-name">{info.prize.name}</span>
          </div>

          <div class="prize-info">
            <span class="probability">{info.probability}%</span>
            <span class="stock">
              残り{info.prize.stock} / {info.prize.totalStock ?? info.prize.stock}個
            </span>
            {#if info.isLowStock && info.prize.stock > 0}
              <span class="low-stock-warning">残りわずか</span>
            {/if}
          </div>

          {#if mode === 'detailed' && info.prize.description}
            <div class="prize-description">{info.prize.description}</div>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .prize-list-widget {
    padding: 1rem;
  }

  .empty-message {
    text-align: center;
    color: var(--text-middle, #8d9099);
    padding: 2rem;
  }

  .controls {
    margin-bottom: 1rem;
    padding: 0.5rem;
    background: var(--bg-low, #f5f5f5);
    border-radius: 4px;
  }

  .prize-list-compact,
  .prize-list-detailed {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .prize-item {
    padding: 1rem;
    background: var(--bg-white, #ffffff);
    border: 1px solid var(--border-low, #e1e1e5);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .prize-item:hover {
    background: var(--highlight, #f0f0f2);
  }

  .prize-item.out-of-stock {
    opacity: 0.5;
    background: var(--bg-middle, #e1e1e5);
  }

  .prize-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
  }

  .rarity-icon {
    font-size: 1.2rem;
    line-height: 1;
  }

  .prize-name {
    font-weight: 600;
    color: var(--text-high, #15151a);
    flex: 1;
  }

  .prize-info {
    display: flex;
    align-items: center;
    gap: 1rem;
    font-size: 0.875rem;
    color: var(--text-middle, #8d9099);
  }

  .probability {
    font-weight: 600;
    color: var(--text-high, #15151a);
  }

  .stock {
    color: var(--text-middle, #8d9099);
  }

  .low-stock-warning {
    color: var(--accent-red, #d70c18);
    font-weight: 600;
    font-size: 0.75rem;
  }

  .prize-description {
    margin-top: 0.75rem;
    padding-top: 0.75rem;
    border-top: 1px solid var(--border-low, #e1e1e5);
    font-size: 0.875rem;
    color: var(--text-middle, #8d9099);
    line-height: 1.5;
  }
</style>
