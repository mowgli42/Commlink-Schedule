<script>
  import { toasts, dismissToast } from '$lib/utils/toast.js';

  let items = $state([]);
  toasts.subscribe(v => items = v);
</script>

{#if items.length > 0}
<div class="toast-container">
  {#each items as t (t.id)}
    <div class="toast toast-{t.type}">
      <span>{t.message}</span>
      <button class="toast-dismiss" onclick={() => dismissToast(t.id)}>&times;</button>
    </div>
  {/each}
</div>
{/if}

<style>
  .toast-container {
    position: fixed;
    top: 60px;
    right: var(--space-lg);
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
    pointer-events: none;
  }
  .toast {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    padding: var(--space-sm) var(--space-md);
    border-radius: var(--radius-md);
    font-size: var(--text-sm);
    box-shadow: var(--shadow-lg);
    animation: slideIn 0.3s ease;
    pointer-events: auto;
    max-width: 360px;
  }
  .toast-success { background: rgba(63,185,80,0.92); color: #fff; }
  .toast-warning { background: rgba(210,153,34,0.92); color: #fff; }
  .toast-error   { background: rgba(248,81,73,0.92); color: #fff; }
  .toast-info    { background: rgba(88,166,255,0.92); color: #fff; }
  .toast-dismiss {
    background: none;
    border: none;
    color: rgba(255,255,255,0.7);
    cursor: pointer;
    font-size: var(--text-lg);
    padding: 0 2px;
    line-height: 1;
  }
  .toast-dismiss:hover { color: #fff; }

  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to   { transform: translateX(0);    opacity: 1; }
  }
</style>
