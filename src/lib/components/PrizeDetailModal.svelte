<script lang="ts">
  import { prizesStore } from '../stores/prizes.svelte';
  import { PrizeDisplayService } from '../services/prizeDisplayService';
  import { RarityClassifier } from '../services/rarityClassifier';

  // Props
  interface Props {
    isOpen: boolean;
    prizeId: string | null;
    onClose: () => void;
  }

  let { isOpen, prizeId, onClose }: Props = $props();

  // Services
  const prizeDisplayService = new PrizeDisplayService();
  const rarityClassifier = new RarityClassifier();

  // Derived state
  let displayInfo = $derived.by(() => {
    if (!isOpen || !prizeId) return null;

    try {
      return prizeDisplayService.getPrizeDisplayInfo(prizeId);
    } catch (e) {
      return null;
    }
  });

  // Event handlers
  function handleOverlayClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }

  function handleCloseClick() {
    onClose();
  }
</script>

{#if isOpen && displayInfo}
  <div class="modal-overlay" onclick={handleOverlayClick} role="presentation">
    <div class="modal-content">
      <button class="close-button" onclick={handleCloseClick} aria-label="閉じる">
        ×
      </button>

      <div class="prize-detail">
        <div class="prize-image-container">
          <img
            src={displayInfo.prize.imageUrl}
            alt={displayInfo.prize.name}
            class="prize-image"
          />
        </div>

        <div class="prize-header">
          <span
            class="rarity-icon"
            style="color: {rarityClassifier.getColor(displayInfo.rarity)}"
          >
            {rarityClassifier.getIcon(displayInfo.rarity)}
          </span>
          <h2 class="prize-name">{displayInfo.prize.name}</h2>
        </div>

        <div class="prize-stats">
          <div class="stat-item">
            <span class="stat-label">確率</span>
            <span class="stat-value">{displayInfo.probability}%</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">在庫</span>
            <span class="stat-value">
              {displayInfo.prize.stock} / {displayInfo.prize.totalStock ?? displayInfo.prize.stock}個
            </span>
          </div>
        </div>

        {#if displayInfo.prize.description}
          <div class="prize-description">
            <h3 class="description-label">説明</h3>
            <p class="description-text">{displayInfo.prize.description}</p>
          </div>
        {/if}

        {#if displayInfo.isLowStock && displayInfo.prize.stock > 0}
          <div class="low-stock-notice">残りわずかです!</div>
        {/if}

        {#if displayInfo.prize.stock === 0}
          <div class="out-of-stock-notice">在庫切れです</div>
        {/if}
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: var(--overlay, rgba(0, 0, 0, 0.5));
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1rem;
  }

  .modal-content {
    background: var(--bg-white, #ffffff);
    border-radius: 12px;
    max-width: 500px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    position: relative;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  }

  .close-button {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: transparent;
    border: none;
    font-size: 2rem;
    line-height: 1;
    cursor: pointer;
    color: var(--text-middle, #8d9099);
    padding: 0;
    width: 2rem;
    height: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color 0.2s ease;
  }

  .close-button:hover {
    color: var(--text-high, #15151a);
  }

  .prize-detail {
    padding: 2rem;
  }

  .prize-image-container {
    width: 100%;
    aspect-ratio: 1 / 1;
    border-radius: 8px;
    overflow: hidden;
    background: var(--bg-low, #f5f5f5);
    margin-bottom: 1.5rem;
  }

  .prize-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .prize-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
  }

  .rarity-icon {
    font-size: 2rem;
    line-height: 1;
  }

  .prize-name {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-high, #15151a);
    margin: 0;
  }

  .prize-stats {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .stat-item {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding: 1rem;
    background: var(--bg-low, #f5f5f5);
    border-radius: 8px;
  }

  .stat-label {
    font-size: 0.875rem;
    color: var(--text-middle, #8d9099);
  }

  .stat-value {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--text-high, #15151a);
  }

  .prize-description {
    margin-bottom: 1.5rem;
  }

  .description-label {
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-high, #15151a);
    margin: 0 0 0.5rem 0;
  }

  .description-text {
    font-size: 0.875rem;
    line-height: 1.6;
    color: var(--text-middle, #8d9099);
    margin: 0;
  }

  .low-stock-notice {
    padding: 0.75rem 1rem;
    background: var(--accent-yellow, #ffb205);
    color: var(--text-high, #15151a);
    border-radius: 6px;
    font-weight: 600;
    text-align: center;
    margin-top: 1rem;
  }

  .out-of-stock-notice {
    padding: 0.75rem 1rem;
    background: var(--bg-middle, #e1e1e5);
    color: var(--text-middle, #8d9099);
    border-radius: 6px;
    font-weight: 600;
    text-align: center;
    margin-top: 1rem;
  }
</style>
