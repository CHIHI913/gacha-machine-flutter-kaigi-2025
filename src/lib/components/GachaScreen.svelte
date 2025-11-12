<script lang="ts">
  import { prizesStore } from '../stores/prizes.svelte';
  import { PrizeService } from '../services/prizeService';
  import { AudioPlayer } from '../services/audioPlayer';
  import { createSpinAnimation, createRevealAnimation } from '../services/animationEngine';
  import PrizeListWidget from './PrizeListWidget.svelte';
  import PrizeDetailModal from './PrizeDetailModal.svelte';
  import gachaHeroImage from '../../assets/gacha/garagara.png';
  import type { GachaState, Prize } from '../types';

  // Props: イベントコールバック
  let { onnavigate }: { onnavigate?: (event: CustomEvent<{ screen: 'settings' }>) => void } = $props();

  // サービスの初期化
  const prizeService = new PrizeService();
  const audioPlayer = new AudioPlayer();

  // アニメーションストア
  const spinAnimation = createSpinAnimation();
  const revealAnimation = createRevealAnimation({ duration: 1000 });

  // ガチャ状態の管理
  let gachaState = $state<GachaState>('idle');
  let selectedPrize = $state<Prize | null>(null);

  // 景品詳細モーダルの状態
  let showDetailModal = $state(false);
  let selectedPrizeIdForDetail = $state<string | null>(null);

  // 設定画面への遷移
  function navigateToSettings() {
    onnavigate?.(new CustomEvent('navigate', { detail: { screen: 'settings' } }));
  }

  // ガチャ実行
  async function executeGacha() {
    if (!prizesStore.isGachaAvailable) return;

    // 1. スピニング状態へ遷移
    gachaState = 'spinning';
    audioPlayer.playSE('spin');
    spinAnimation.set(360);

    // スピニングアニメーション待機(2.0秒で適切な緊張感)
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // 2. 景品抽選
    const drawnPrize = prizeService.drawPrize();
    if (!drawnPrize) {
      // 抽選失敗（在庫切れ）
      gachaState = 'idle';
      return;
    }
    selectedPrize = drawnPrize;

    // 3. リビール状態へ遷移
    gachaState = 'revealing';
    audioPlayer.playSE('reveal');
    revealAnimation.set(1);

    // リビールアニメーション待機(0.8秒でスムーズに)
    await new Promise((resolve) => setTimeout(resolve, 800));

    // 4. 結果表示状態へ遷移
    gachaState = 'result';
    audioPlayer.playSE('result');

    // 5. 在庫を減らす
    try {
      await prizeService.decrementStock(drawnPrize.id);
    } catch (error) {
      console.error('Failed to decrement stock:', error);
      // エラーが発生してもUI上は続行（在庫は楽観的に更新済み）
    }
  }

  // 結果画面を閉じる
  function closeResult() {
    gachaState = 'idle';
    selectedPrize = null;
    spinAnimation.set(0);
    revealAnimation.set(0);
  }

  // 景品詳細モーダルを開く
  function handlePrizeClick(prizeId: string) {
    selectedPrizeIdForDetail = prizeId;
    showDetailModal = true;
  }

  // 景品詳細モーダルを閉じる
  function closeDetailModal() {
    showDetailModal = false;
    selectedPrizeIdForDetail = null;
  }
</script>

<div class="gacha-screen" data-testid="gacha-screen">
  <!-- 設定ボタン（絶対配置） -->
  <header class="header">
    <button
      class="settings-button"
      data-testid="settings-button"
      onclick={navigateToSettings}
      aria-label="設定"
    >
      ⚙️
    </button>
  </header>

  <!-- メインコンテンツ -->
  <main class="main-content">
    {#if gachaState === 'idle'}
      <div class="idle-container">
        <!-- メインビジュアル -->
        <h2 class="gacha-hero-heading">ASSIGNノベルティが必ず当たる！</h2>
        <div class="gacha-visual">
          <img
            class="gacha-hero-image"
            src={gachaHeroImage}
            alt="Flutter Kaigi 2025 ガチャマシンのビジュアル"
            loading="lazy"
          />
        </div>

        <!-- ガチャボタン -->
        <div class="gacha-button-container">
          <button
            class="gacha-button"
            data-testid="gacha-button"
            disabled={!prizesStore.isGachaAvailable}
            onclick={executeGacha}
          >
            ガチャを引く
          </button>

          {#if !prizesStore.isGachaAvailable}
            <p class="no-stock-message">現在、景品の在庫がありません</p>
          {/if}
        </div>

        <div class="prize-list-section">
          <PrizeListWidget
            mode="compact"
            onPrizeClick={handlePrizeClick}
            showControls={false}
          />
        </div>
      </div>
    {:else if gachaState === 'spinning'}
      <!-- スピニングアニメーション表示 -->
      <div class="spinning-container">
        <div class="spinning-orb">
          <div class="orb-inner"></div>
          <div class="particle particle-1"></div>
          <div class="particle particle-2"></div>
          <div class="particle particle-3"></div>
          <div class="particle particle-4"></div>
          <div class="particle particle-5"></div>
          <div class="particle particle-6"></div>
          <div class="particle particle-7"></div>
          <div class="particle particle-8"></div>
        </div>
        <p class="spinning-text">抽選中...</p>
        <div class="light-rays">
          <div class="ray ray-1"></div>
          <div class="ray ray-2"></div>
          <div class="ray ray-3"></div>
          <div class="ray ray-4"></div>
        </div>
      </div>
    {:else if gachaState === 'revealing'}
      <!-- リビールアニメーション表示 -->
      <div class="revealing-container">
        <div class="reveal-flash"></div>
        <p class="revealing-text">結果を表示中...</p>
      </div>
    {:else if gachaState === 'result'}
      <!-- 結果表示 -->
      <div class="result-container">
        <div class="star-burst">
          <div class="star star-1">★</div>
          <div class="star star-2">★</div>
          <div class="star star-3">★</div>
          <div class="star star-4">★</div>
          <div class="star star-5">★</div>
          <div class="star star-6">★</div>
          <div class="star star-7">★</div>
          <div class="star star-8">★</div>
          <div class="star star-9">★</div>
          <div class="star star-10">★</div>
        </div>
        {#if selectedPrize}
          <h2>{selectedPrize.name}</h2>
          <div class="prize-image-wrapper">
            <img src={selectedPrize.imageUrl} alt={selectedPrize.name} />
            <div class="glow-effect"></div>
          </div>
          <button onclick={closeResult}>閉じる</button>
        {/if}
      </div>
    {/if}
  </main>

  <!-- 景品詳細モーダル -->
  <PrizeDetailModal
    isOpen={showDetailModal}
    prizeId={selectedPrizeIdForDetail}
    onClose={closeDetailModal}
  />
</div>

<style>
  .gacha-screen {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    background-color: var(--color-bg-contents-area);
    position: relative;
  }

  .header {
    position: absolute;
    top: 1rem;
    right: 1rem;
    z-index: 10;
  }

  .settings-button {
    padding: 0.5rem 1rem;
    background-color: var(--color-bg-white);
    border: 1px solid var(--color-border-low);
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
    color: var(--color-text-high);
  }

  .settings-button:hover {
    background-color: var(--color-option-highlight);
  }

  .main-content {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    overflow-y: auto;
  }

  .idle-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3rem;
    width: 100%;
    max-width: 1200px;
  }

  .gacha-button-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .prize-list-section {
    width: 100%;
    max-width: 800px;
  }

  .gacha-visual {
    width: 100%;
    max-width: 560px;
    aspect-ratio: 16 / 9;
    border-radius: 24px;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--color-bg-white, #ffffff);
    border: 3px solid rgba(255, 255, 255, 0.8);
  }

  .gacha-hero-heading {
    font-size: 2.5rem;
    font-weight: 700;
    color: var(--color-text-high, #15151a);
    margin: 0 0 0.75rem 0;
    text-align: center;
  }

  .gacha-hero-image {
    height: 100%;
    width: auto;
    max-width: none;
    object-fit: cover;
    display: block;
  }

  .gacha-button {
    padding: 1.5rem 3rem;
    font-size: 1.5rem;
    font-weight: bold;
    background-color: var(--color-brand-assign-red);
    color: var(--color-text-white);
    border: none;
    border-radius: 12px;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
    box-shadow: 0 4px 12px rgba(215, 12, 24, 0.3);
  }

  .gacha-button:hover:not(:disabled) {
    transform: scale(1.05);
    box-shadow: 0 6px 16px rgba(215, 12, 24, 0.4);
  }

  .gacha-button:active:not(:disabled) {
    transform: scale(0.98);
  }

  .gacha-button:disabled {
    background-color: var(--color-bg-disabled);
    color: var(--color-text-disabled);
    cursor: not-allowed;
    box-shadow: none;
  }

  .no-stock-message {
    color: var(--color-text-middle);
    font-size: 1rem;
  }

  .spinning-container,
  .revealing-container {
    text-align: center;
    position: relative;
    width: 100%;
    height: 400px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  /* スピニング中の光る玉 */
  .spinning-orb {
    position: relative;
    width: 150px;
    height: 150px;
    border-radius: 50%;
    background: radial-gradient(circle at 30% 30%, #ff5a65, #f03444, #d70c18, #a0090f);
    animation: orbSpin 2s linear infinite, orbPulse 1s ease-in-out infinite;
    box-shadow:
      0 0 40px rgba(215, 12, 24, 0.8),
      0 0 80px rgba(240, 52, 68, 0.6),
      inset 0 0 30px rgba(255, 255, 255, 0.4);
  }

  .orb-inner {
    position: absolute;
    top: 20%;
    left: 20%;
    width: 40%;
    height: 40%;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.8), transparent);
    animation: innerGlow 1.5s ease-in-out infinite;
  }

  @keyframes orbSpin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  @keyframes orbPulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
  }

  @keyframes innerGlow {
    0%, 100% { opacity: 0.5; }
    50% { opacity: 1; }
  }

  /* パーティクル（星のきらめき） */
  .particle {
    position: absolute;
    width: 8px;
    height: 8px;
    background: #ff5a65;
    border-radius: 50%;
    box-shadow: 0 0 10px rgba(255, 90, 101, 0.9), 0 0 20px rgba(215, 12, 24, 0.6);
  }

  .particle-1 { top: 0%; left: 50%; animation: particleFloat1 2s ease-in-out infinite; }
  .particle-2 { top: 15%; left: 85%; animation: particleFloat2 2.2s ease-in-out infinite; }
  .particle-3 { top: 50%; left: 100%; animation: particleFloat3 2.4s ease-in-out infinite; }
  .particle-4 { top: 85%; left: 85%; animation: particleFloat4 2.6s ease-in-out infinite; }
  .particle-5 { top: 100%; left: 50%; animation: particleFloat5 2.8s ease-in-out infinite; }
  .particle-6 { top: 85%; left: 15%; animation: particleFloat6 3s ease-in-out infinite; }
  .particle-7 { top: 50%; left: 0%; animation: particleFloat7 3.2s ease-in-out infinite; }
  .particle-8 { top: 15%; left: 15%; animation: particleFloat8 3.4s ease-in-out infinite; }

  @keyframes particleFloat1 {
    0%, 100% { transform: translate(0, 0) scale(1); opacity: 1; }
    50% { transform: translate(0, -30px) scale(1.5); opacity: 0.5; }
  }
  @keyframes particleFloat2 {
    0%, 100% { transform: translate(0, 0) scale(1); opacity: 1; }
    50% { transform: translate(20px, -20px) scale(1.5); opacity: 0.5; }
  }
  @keyframes particleFloat3 {
    0%, 100% { transform: translate(0, 0) scale(1); opacity: 1; }
    50% { transform: translate(30px, 0) scale(1.5); opacity: 0.5; }
  }
  @keyframes particleFloat4 {
    0%, 100% { transform: translate(0, 0) scale(1); opacity: 1; }
    50% { transform: translate(20px, 20px) scale(1.5); opacity: 0.5; }
  }
  @keyframes particleFloat5 {
    0%, 100% { transform: translate(0, 0) scale(1); opacity: 1; }
    50% { transform: translate(0, 30px) scale(1.5); opacity: 0.5; }
  }
  @keyframes particleFloat6 {
    0%, 100% { transform: translate(0, 0) scale(1); opacity: 1; }
    50% { transform: translate(-20px, 20px) scale(1.5); opacity: 0.5; }
  }
  @keyframes particleFloat7 {
    0%, 100% { transform: translate(0, 0) scale(1); opacity: 1; }
    50% { transform: translate(-30px, 0) scale(1.5); opacity: 0.5; }
  }
  @keyframes particleFloat8 {
    0%, 100% { transform: translate(0, 0) scale(1); opacity: 1; }
    50% { transform: translate(-20px, -20px) scale(1.5); opacity: 0.5; }
  }

  /* スピニング中のテキスト */
  .spinning-text {
    margin-top: 40px;
    font-size: 1.5rem;
    font-weight: bold;
    color: var(--color-text-high);
    animation: textPulse 1.5s ease-in-out infinite;
  }

  @keyframes textPulse {
    0%, 100% { opacity: 0.6; transform: scale(1); }
    50% { opacity: 1; transform: scale(1.05); }
  }

  /* 光線エフェクト */
  .light-rays {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 300px;
    height: 300px;
    animation: raysRotate 3s linear infinite;
  }

  .ray {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 4px;
    height: 150px;
    background: linear-gradient(to bottom, transparent, rgba(215, 12, 24, 0.7), rgba(255, 90, 101, 0.5), transparent);
    transform-origin: center 0;
    opacity: 0.8;
  }

  .ray-1 { transform: translate(-50%, 0) rotate(0deg); }
  .ray-2 { transform: translate(-50%, 0) rotate(90deg); }
  .ray-3 { transform: translate(-50%, 0) rotate(180deg); }
  .ray-4 { transform: translate(-50%, 0) rotate(270deg); }

  @keyframes raysRotate {
    from { transform: translate(-50%, -50%) rotate(0deg); }
    to { transform: translate(-50%, -50%) rotate(360deg); }
  }

  /* リビール時のフラッシュ */
  .revealing-container {
    background: radial-gradient(circle, rgba(215, 12, 24, 0.2), transparent);
  }

  .reveal-flash {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 300px;
    height: 300px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.95), rgba(255, 90, 101, 0.6), rgba(215, 12, 24, 0.4), transparent);
    animation: flashExpand 0.8s ease-out forwards;
  }

  @keyframes flashExpand {
    0% {
      width: 50px;
      height: 50px;
      opacity: 1;
    }
    100% {
      width: 400px;
      height: 400px;
      opacity: 0;
    }
  }

  .revealing-text {
    position: relative;
    z-index: 1;
    margin-top: 40px;
    font-size: 1.5rem;
    font-weight: bold;
    color: var(--color-text-high);
    animation: revealTextGlow 0.8s ease-out;
  }

  @keyframes revealTextGlow {
    0% {
      opacity: 0;
      transform: scale(0.5);
      text-shadow: 0 0 30px rgba(215, 12, 24, 1), 0 0 50px rgba(255, 90, 101, 0.8);
    }
    100% {
      opacity: 1;
      transform: scale(1);
      text-shadow: 0 0 10px rgba(215, 12, 24, 0.6);
    }
  }

  .result-container {
    text-align: center;
    background-color: var(--color-bg-white);
    padding: 2rem;
    border-radius: 16px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    animation: slideUp 0.3s ease-out;
    position: relative;
    overflow: visible;
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* 星のバースト */
  .star-burst {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 400px;
    height: 400px;
    transform: translate(-50%, -50%);
    pointer-events: none;
  }

  .star {
    position: absolute;
    font-size: 2rem;
    color: #ff5a65;
    text-shadow:
      0 0 10px rgba(255, 90, 101, 0.9),
      0 0 20px rgba(215, 12, 24, 0.7),
      0 0 30px rgba(215, 12, 24, 0.5);
    animation: starBurst 1s ease-out forwards;
    opacity: 0;
  }

  .star-1 { top: 50%; left: 50%; animation-delay: 0s; }
  .star-2 { top: 50%; left: 50%; animation-delay: 0.05s; }
  .star-3 { top: 50%; left: 50%; animation-delay: 0.1s; }
  .star-4 { top: 50%; left: 50%; animation-delay: 0.15s; }
  .star-5 { top: 50%; left: 50%; animation-delay: 0.2s; }
  .star-6 { top: 50%; left: 50%; animation-delay: 0.25s; }
  .star-7 { top: 50%; left: 50%; animation-delay: 0.3s; }
  .star-8 { top: 50%; left: 50%; animation-delay: 0.35s; }
  .star-9 { top: 50%; left: 50%; animation-delay: 0.4s; }
  .star-10 { top: 50%; left: 50%; animation-delay: 0.45s; }

  @keyframes starBurst {
    0% {
      opacity: 1;
      transform: translate(0, 0) scale(0) rotate(0deg);
    }
    50% {
      opacity: 1;
    }
    100% {
      opacity: 0;
      transform: translate(var(--tx), var(--ty)) scale(1) rotate(360deg);
    }
  }

  .star-1 { --tx: 0; --ty: -150px; }
  .star-2 { --tx: 106px; --ty: -106px; }
  .star-3 { --tx: 150px; --ty: 0; }
  .star-4 { --tx: 106px; --ty: 106px; }
  .star-5 { --tx: 0; --ty: 150px; }
  .star-6 { --tx: -106px; --ty: 106px; }
  .star-7 { --tx: -150px; --ty: 0; }
  .star-8 { --tx: -106px; --ty: -106px; }
  .star-9 { --tx: 75px; --ty: -130px; }
  .star-10 { --tx: -75px; --ty: -130px; }

  .result-container h2 {
    margin: 0 0 1.5rem 0;
    font-size: 1.75rem;
    color: var(--color-text-high);
    position: relative;
    z-index: 1;
    animation: titleGlow 1s ease-out;
  }

  @keyframes titleGlow {
    0% {
      opacity: 0;
      transform: scale(0.8);
      text-shadow:
        0 0 20px rgba(215, 12, 24, 1),
        0 0 40px rgba(255, 90, 101, 0.8);
    }
    50% {
      text-shadow:
        0 0 15px rgba(215, 12, 24, 0.7),
        0 0 30px rgba(255, 90, 101, 0.5);
    }
    100% {
      opacity: 1;
      transform: scale(1);
      text-shadow:
        0 0 5px rgba(215, 12, 24, 0.5),
        0 0 10px rgba(255, 90, 101, 0.3);
    }
  }

  /* 景品画像のラッパー */
  .prize-image-wrapper {
    position: relative;
    display: inline-block;
    margin: 1rem 0;
  }

  .prize-image-wrapper img {
    max-width: 300px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    position: relative;
    z-index: 1;
    animation: imageReveal 0.6s ease-out 0.3s backwards;
  }

  @keyframes imageReveal {
    from {
      opacity: 0;
      transform: scale(0.8) rotateY(-90deg);
    }
    to {
      opacity: 1;
      transform: scale(1) rotateY(0deg);
    }
  }

  /* グローエフェクト */
  .glow-effect {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 120%;
    height: 120%;
    background: radial-gradient(
      circle,
      rgba(255, 90, 101, 0.4) 0%,
      rgba(215, 12, 24, 0.3) 40%,
      transparent 70%
    );
    border-radius: 50%;
    animation: glowPulse 2s ease-in-out infinite;
    z-index: 0;
  }

  @keyframes glowPulse {
    0%, 100% {
      opacity: 0.6;
      transform: translate(-50%, -50%) scale(1);
    }
    50% {
      opacity: 0.9;
      transform: translate(-50%, -50%) scale(1.1);
    }
  }

  .result-container button {
    margin-top: 1rem;
    padding: 0.75rem 2rem;
    font-size: 1rem;
    font-weight: bold;
    background-color: var(--color-brand-assign-red);
    color: var(--color-text-white);
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: opacity 0.2s;
  }

  .result-container button:hover {
    opacity: 0.9;
  }

  /* レスポンシブデザイン */
  @media (max-width: 768px) {
    .gacha-button {
      padding: 1.25rem 2.5rem;
      font-size: 1.25rem;
    }

    .result-container {
      padding: 1.5rem;
      max-width: 90%;
    }

    .result-container img {
      max-width: 250px;
    }

    .result-container h2 {
      font-size: 1.5rem;
    }
  }

  @media (max-width: 480px) {
    .gacha-button {
      padding: 1rem 2rem;
      font-size: 1.125rem;
    }

    .result-container img {
      max-width: 200px;
    }

    .result-container h2 {
      font-size: 1.25rem;
    }
  }
</style>
