<script>
  /**
   * GraphNode Component
   *
   * Displays a practice as a node in the dependency graph
   */
  export let practice
  export let isRoot = false
  export let isSelected = false
  export let onClick = () => {}
  export let onExpand = null // Function to call when expanding dependencies

  // Get category icon
  const categoryIcons = {
    practice: '🔄',
    behavior: '👥',
    culture: '🌟',
    tooling: '🛠️',
  }

  const icon = categoryIcons[practice.category] || '📦'

  // Border styling based on selection
  $: borderClass = isSelected
    ? 'border-4 border-blue-600'
    : 'border-2 border-black hover:border-gray-600'

  function handleExpand(event) {
    event.stopPropagation() // Prevent card selection when clicking expand
    if (onExpand) {
      onExpand()
    }
  }
</script>

<button
  class="graph-node {borderClass}"
  class:hover:shadow-lg={!isSelected}
  data-testid="graph-node"
  data-practice-id={practice.id}
  data-selected={isSelected}
  on:click={onClick}
>
  <!-- Title Section (always visible) -->
  <div class="flex items-center gap-2 mb-2">
    <span class="text-2xl" aria-label="{practice.category} category"
      >{icon}</span
    >
    <h3 class="text-lg font-bold text-gray-900 leading-tight">
      {practice.name}
    </h3>
  </div>

  {#if isSelected}
    <!-- Description (only when selected) -->
    <p class="text-gray-600 text-sm mb-3">{practice.description}</p>

    <!-- Benefits (only when selected) -->
    {#if practice.benefits && practice.benefits.length > 0}
      <div class="mb-3">
        <h4 class="text-sm font-semibold text-green-700 mb-2">Benefits</h4>
        <ul class="space-y-1 text-xs text-gray-700 list-none pl-0">
          {#each practice.benefits as benefit}
            <li>{benefit}</li>
          {/each}
        </ul>
      </div>
    {/if}

    <!-- Dependency Count (only when selected) -->
    {#if practice.dependencyCount !== undefined && practice.dependencyCount > 0}
      <div class="mb-3 flex items-center gap-2">
        <span class="text-xs font-semibold text-gray-500">Dependencies:</span>
        <span
          class="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded-full"
        >
          {practice.dependencyCount}
        </span>
      </div>
    {/if}

    <!-- Expand Button (only when selected, has dependencies, and not root) -->
    {#if onExpand && practice.dependencyCount > 0 && !isRoot}
      <button
        on:click={handleExpand}
        class="expand-btn"
      >
        Expand Dependencies ({practice.dependencyCount})
      </button>
    {/if}
  {/if}
</button>

<style>
  .graph-node {
    /* Reset button defaults */
    appearance: none;
    border: none;
    font: inherit;

    /* Graph node specific styling */
    display: block;
    width: 100%;
    background-color: white;
    border-radius: 0.5rem;
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
    padding: 1rem;
    text-align: left;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
  }

  .graph-node:hover:not(:focus) {
    box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  }

  .expand-btn {
    width: 100%;
    padding: 0.5rem 0.75rem;
    background-color: #2563eb;
    color: white;
    border-radius: 0.375rem;
    font-weight: 600;
    font-size: 0.875rem;
    border: none;
    cursor: pointer;
    transition: background-color 0.2s ease-in-out;
  }

  .expand-btn:hover {
    background-color: #1d4ed8;
  }
</style>
