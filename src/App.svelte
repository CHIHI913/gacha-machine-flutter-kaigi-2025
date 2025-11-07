<script lang="ts">
  import { onMount } from 'svelte';
  import GachaScreen from './lib/components/GachaScreen.svelte';
  import SettingsScreen from './lib/components/SettingsScreen.svelte';
  import ErrorModal from './lib/components/ErrorModal.svelte';
  import { DataInitializer } from './lib/services/dataInitializer';
  import type { Screen } from './lib/types';

  // 画面状態管理
  let currentScreen = $state<Screen>('gacha');

  // 画面遷移ハンドラー
  function handleNavigate(event: CustomEvent<{ screen: Screen }>) {
    currentScreen = event.detail.screen;
  }

  // アプリケーション起動時にデータを初期化
  onMount(async () => {
    const dataInitializer = new DataInitializer();
    await dataInitializer.initialize();
  });
</script>

<div class="app">
  {#if currentScreen === 'gacha'}
    <GachaScreen onnavigate={handleNavigate} />
  {:else if currentScreen === 'settings'}
    <SettingsScreen onnavigate={handleNavigate} />
  {/if}

  <!-- エラーモーダル -->
  <ErrorModal />
</div>

<style>
  .app {
    width: 100%;
    min-height: 100vh;
  }

  :global(body) {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  :global(*) {
    box-sizing: border-box;
  }

  /* カラートークン定義 */
  :global(:root) {
    /* Text & Icon */
    --color-text-high: #15151a;
    --color-text-middle: #8d9099;
    --color-text-low: #c4c4cc;
    --color-text-placeholder: #a8a9b2;
    --color-text-disabled: #c4c4cc;
    --color-text-white: #ffffff;

    /* Border */
    --color-border-low: #e1e1e5;
    --color-border-middle: #a8a9b2;
    --color-border-back-btn: #8d9099;
    --color-border-disabled: #c4c4cc;
    --color-border-white: #ffffff;

    /* Background */
    --color-bg-contents-area: #f5f5f5;
    --color-bg-white: #ffffff;
    --color-bg-high: #c4c4cc;
    --color-bg-middle: #e1e1e5;
    --color-bg-low: #f5f5f5;
    --color-bg-disabled: #c4c4cc;
    --color-bg-dark-tag: #42434d;
    --color-bg-senior-card: #f4f2f0;
    --color-bg-registration: #f9f9f9;
    --color-bg-registration-pagination: rgba(245, 245, 245, 0.5);

    /* Tool */
    --color-scrollbar-bar: #c4c4cc;
    --color-scrollbar-area: #f5f5f5;
    --color-progress-bar: #e1e1e5;

    /* Option */
    --color-overlay: rgba(0, 0, 0, 0.5);
    --color-learning-selected: rgba(215, 12, 24, 0.1);
    --color-option-highlight: #f0f0f2;

    /* Accent */
    --color-accent-red: #d70c18;
    --color-accent-orange: #ff7831;
    --color-accent-yellow: #ffb205;
    --color-accent-gold: #d9b34c;
    --color-accent-light-orange: #ff7250;
    --color-accent-green-light: #00b200;
    --color-accent-ranking-frame: #fbd951;

    /* Brand */
    --color-brand-assign-red: #d70c18;
    --color-brand-white: #ffffff;
  }
</style>
