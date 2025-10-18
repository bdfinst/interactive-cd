<script>
  import { CATEGORY_COLORS, CATEGORY_LABELS, CATEGORIES } from '$lib/constants/categories.js';
</script>

<div class="legend">
  <h3 class="legend-title">Requires</h3>
  <ul class="legend-list">
    {#each CATEGORIES as category}
      <li class="legend-item">
        <span class="legend-dot" style="background-color: {CATEGORY_COLORS[category]}"></span>
        <span class="legend-label">{CATEGORY_LABELS[category]}</span>
      </li>
    {/each}
  </ul>
</div>

<style>
  .legend {
    position: fixed;
    top: 8rem; /* Below the header */
    left: 1rem;
    background-color: white;
    border-radius: 12px;
    padding: 1rem;
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
    z-index: 900;
    min-width: 150px;
  }

  .legend-title {
    font-size: 0.875rem;
    font-weight: 700;
    color: #374151;
    margin: 0 0 0.75rem 0;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .legend-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .legend-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .legend-label {
    font-size: 0.875rem;
    color: #4b5563;
  }

  @media (max-width: 768px) {
    .legend {
      position: static;
      margin-bottom: 1rem;
    }
  }
</style>
