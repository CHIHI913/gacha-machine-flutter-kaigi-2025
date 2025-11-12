<script lang="ts">
  import { prizesStore } from '../stores/prizes.svelte';
  import { FilterStore } from '../stores/filter.svelte';
  import { PrizeDisplayService } from '../services/prizeDisplayService';

  // Props
  interface Props {
    mode: 'compact' | 'detailed';
    onPrizeClick?: (prizeId: string) => void;
    showControls?: boolean;
  }

  let { mode, onPrizeClick, showControls = false }: Props = $props();

  // Services
  const prizeDisplayService = new PrizeDisplayService();

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
          <div class="prize-column image">
            <div class="thumbnail">
              {#if info.prize.imageUrl}
                <img src={info.prize.imageUrl} alt={info.prize.name} loading="lazy" />
              {:else}
                <div class="thumbnail-placeholder">No Image</div>
              {/if}
            </div>
          </div>

          <div class="prize-column meta">
            <div class="prize-header">
              <span class="prize-name">{info.prize.name}</span>
            </div>

            <div class="prize-info">
              <span class="stock">
                {info.prize.stock}/{info.prize.totalStock ?? info.prize.stock}個
              </span>
              <span class="probability">{info.probability}%</span>
              {#if info.isLowStock && info.prize.stock > 0}
                <span class="low-stock-warning">残りわずか</span>
              {/if}
            </div>

            {#if mode === 'detailed' && info.prize.description}
              <div class="prize-description">{info.prize.description}</div>
            {/if}
          </div>
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
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 1rem;
  }

  .prize-item {
    display: flex;
    flex-direction: column;
    background: var(--bg-white, #ffffff);
    border: 1px solid var(--border-low, #e1e1e5);
    border-radius: 16px;
    overflow: hidden;
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    position: relative;
  }

  .prize-item:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.08);
  }

  .prize-item.out-of-stock {
    cursor: not-allowed;
    filter: grayscale(1);
  }

  .prize-item.out-of-stock::after {
    content: '';
    position: absolute;
    inset: 0;
    background: rgba(28, 30, 34, 0.45);
    pointer-events: none;
  }

  .prize-name {
    font-weight: 700;
    color: var(--text-high, #15151a);
    flex: 1;
    font-size: 1.05rem;
    line-height: 1.3;
  }

  .prize-info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    font-size: 0.875rem;
    color: var(--text-middle, #8d9099);
    padding-bottom: 0.45rem;
  }

  .probability {
    font-weight: 600;
    color: var(--text-high, #15151a);
  }

  .stock {
    color: var(--text-high, #15151a);
    font-weight: 600;
  }

  .low-stock-warning {
    color: var(--accent-red, #d70c18);
    font-weight: 600;
    font-size: 0.75rem;
  }

  .prize-description {
    margin: 0;
    padding-top: 0.5rem;
    font-size: 0.85rem;
    color: var(--text-middle, #8d9099);
    line-height: 1.4;
  }

  .thumbnail {
    width: 100%;
    aspect-ratio: 4 / 3;
    background: var(--bg-middle, #e1e1e5);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .thumbnail img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .thumbnail-placeholder {
    font-size: 0.75rem;
    color: var(--text-middle, #8d9099);
  }

.prize-column.image {
  width: 100%;
  background: var(--bg-middle, #e1e1e5);
}

.prize-column.meta {
  padding: 1rem 1.1rem 1.3rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  flex: 1;
}
  .prize-header {
    margin: 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  @media (min-width: 640px) {
    .prize-info {
      flex-direction: row;
      align-items: center;
      gap: 1rem;
    }
  }
</style>
