<script lang="ts">
  import { errorStore } from '../stores/error.svelte';

  function closeModal() {
    errorStore.clearError();
  }

  // 詳細を表示するかどうか
  let showDetails = $state(false);

  function toggleDetails() {
    showDetails = !showDetails;
  }
</script>

{#if errorStore.hasError && errorStore.currentError}
  <div class="modal-overlay">
    <div class="modal-content">
      <div class="error-modal">
        <div class="error-header">
          <h2>⚠️ {errorStore.currentError.title}</h2>
        </div>

        <div class="error-body">
          <p class="error-message">{errorStore.currentError.message}</p>

          {#if errorStore.currentError.details}
            <div class="error-details-section">
              <button class="details-toggle" onclick={toggleDetails}>
                {showDetails ? '▼' : '▶'} 詳細を{showDetails ? '非表示' : '表示'}
              </button>

              {#if showDetails}
                <div class="error-details">
                  <pre>{errorStore.currentError.details}</pre>
                </div>
              {/if}
            </div>
          {/if}
        </div>

        <div class="error-footer">
          <button class="close-button" onclick={closeModal}>
            閉じる
          </button>
        </div>
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
    background-color: var(--color-overlay);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
  }

  .modal-content {
    background-color: var(--color-bg-white);
    border-radius: 8px;
    padding: 2rem;
    max-width: 600px;
    width: 90%;
    max-height: 80vh;
    overflow-y: auto;
  }

  .error-modal {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .error-header h2 {
    margin: 0;
    font-size: 1.5rem;
    color: var(--color-accent-red);
  }

  .error-body {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .error-message {
    margin: 0;
    font-size: 1rem;
    color: var(--color-text-high);
    line-height: 1.6;
  }

  .error-details-section {
    margin-top: 1rem;
  }

  .details-toggle {
    padding: 0.5rem 1rem;
    background-color: var(--color-bg-low);
    border: 1px solid var(--color-border-low);
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.875rem;
    color: var(--color-text-high);
    width: 100%;
    text-align: left;
  }

  .details-toggle:hover {
    background-color: var(--color-option-highlight);
  }

  .error-details {
    margin-top: 0.5rem;
    padding: 1rem;
    background-color: var(--color-bg-low);
    border: 1px solid var(--color-border-low);
    border-radius: 4px;
    max-height: 200px;
    overflow-y: auto;
  }

  .error-details pre {
    margin: 0;
    font-size: 0.75rem;
    color: var(--color-text-middle);
    white-space: pre-wrap;
    word-wrap: break-word;
    font-family: 'Courier New', monospace;
  }

  .error-footer {
    display: flex;
    justify-content: flex-end;
  }

  .close-button {
    padding: 0.75rem 2rem;
    font-size: 1rem;
    font-weight: bold;
    background-color: var(--color-brand-assign-red);
    color: var(--color-text-white);
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  .close-button:hover {
    opacity: 0.9;
  }
</style>
