<script lang="ts">
  import { prizesStore } from '../stores/prizes.svelte';
  import { PrizeDisplayService } from '../services/prizeDisplayService';

  // Services
  const prizeDisplayService = new PrizeDisplayService();

  // Derived state
  let stats = $derived.by(() => {
    // prizesStore.prizesを参照することでリアクティビティを確保
    prizesStore.prizes;
    return prizeDisplayService.getStats();
  });
</script>

<div class="stats-widget">
  <h3 class="stats-title">景品統計</h3>

  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-label">登録景品</div>
      <div class="stat-value">{stats.totalCount}</div>
      <div class="stat-unit">個</div>
    </div>

    <div class="stat-card">
      <div class="stat-label">在庫あり</div>
      <div class="stat-value">{stats.availableCount}</div>
      <div class="stat-unit">個</div>
    </div>

    <div class="stat-card">
      <div class="stat-label">在庫切れ</div>
      <div class="stat-value">{stats.outOfStockCount}</div>
      <div class="stat-unit">個</div>
    </div>

    <div class="stat-card">
      <div class="stat-label">残り在庫</div>
      <div class="stat-value">{stats.remainingStock}</div>
      <div class="stat-unit">個</div>
    </div>

    <div class="stat-card">
      <div class="stat-label">仕入れ総数</div>
      <div class="stat-value">{stats.totalStockCapacity}</div>
      <div class="stat-unit">個</div>
    </div>
  </div>

  {#if stats.outOfStockCount > 0}
    <div class="warning-message">
      ⚠️ 在庫切れの景品があります
    </div>
  {/if}
</div>

<style>
  .stats-widget {
    padding: 1.5rem;
    background: var(--bg-white, #ffffff);
    border: 1px solid var(--border-low, #e1e1e5);
    border-radius: 8px;
  }

  .stats-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--text-high, #15151a);
    margin: 0 0 1rem 0;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 1rem;
  }

  .stat-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 1rem;
    background: var(--bg-low, #f5f5f5);
    border-radius: 6px;
  }

  .stat-label {
    font-size: 0.75rem;
    color: var(--text-middle, #8d9099);
    margin-bottom: 0.5rem;
    text-align: center;
  }

  .stat-value {
    font-size: 2rem;
    font-weight: 700;
    color: var(--text-high, #15151a);
    line-height: 1;
  }

  .stat-unit {
    font-size: 0.875rem;
    color: var(--text-middle, #8d9099);
    margin-top: 0.25rem;
  }

  .warning-message {
    margin-top: 1rem;
    padding: 0.75rem 1rem;
    background: var(--accent-yellow, #ffb205);
    color: var(--text-high, #15151a);
    border-radius: 6px;
    font-size: 0.875rem;
    font-weight: 600;
    text-align: center;
  }
</style>
