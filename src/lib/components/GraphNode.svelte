<script>
  /**
   * GraphNode Component
   *
   * Displays a practice as a node in the dependency graph
   */
  import { CATEGORY_COLORS } from '$lib/constants/categories.js';

  export let practice
  export let isRoot = false
  export let isSelected = false
  export let isExpanded = false
  export let onClick = () => {}
  export let onExpand = null

  $: categories = practice.categories && practice.categories.length > 0
    ? practice.categories
    : (Array.isArray(practice.category) ? practice.category : [practice.category])

  $: borderClass = isSelected
    ? 'border-4 border-blue-600'
    : 'border-2 border-black hover:border-gray-600'

  function handleExpand(event) {
    event.stopPropagation()
    if (onExpand) {
      onExpand()
    }
  }
</script>

<button
  class="block w-full bg-white text-gray-800 rounded-[20px] shadow-md p-4 text-left cursor-pointer transition-all duration-200 {borderClass} hover:shadow-lg"
  data-testid="graph-node"
  data-practice-id={practice.id}
  data-selected={isSelected}
  on:click={onClick}
>
  <!-- Title Section -->
  <div class="mb-2 text-center">
    <h3 class="text-lg font-bold text-gray-900 leading-tight mb-2">
      {practice.name}
    </h3>
    <div class="flex gap-1 items-center justify-center" role="img" aria-label="Category: {categories.join(', ')}">
      {#each categories as category}
        <span
          class="category-dot"
          style="--dot-color: {CATEGORY_COLORS[category] || '#6b7280'}"
          title={category}
        ></span>
      {/each}
    </div>
  </div>

  {#if isSelected}
    <!-- Description -->
    <p class="text-gray-600 text-sm mb-3">{practice.description}</p>

    <!-- Benefits -->
    {#if practice.benefits && practice.benefits.length > 0}
      <div class="mb-3">
        <h4 class="text-sm font-semibold text-green-700 mb-2">Benefits</h4>
        <ul class="space-y-1 text-xs text-gray-700 list-none pl-0">
          {#each practice.benefits as benefit}
            <li class="flex items-start gap-2">
              <span class="text-green-600 flex-shrink-0">→</span>
              <span>{benefit}</span>
            </li>
          {/each}
        </ul>
      </div>
    {/if}

    <!-- Dependency Count -->
    {#if practice.dependencyCount !== undefined && practice.dependencyCount > 0}
      <div class="mb-3 flex items-center gap-2">
        <span class="text-xs font-semibold text-gray-500">Dependencies:</span>
        <span class="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded-full">
          {practice.dependencyCount}
        </span>
      </div>
    {/if}

    <!-- Expand Button -->
    {#if onExpand && practice.dependencyCount > 0 && !isRoot}
      <button
        on:click={handleExpand}
        class="w-full px-3 py-2 rounded-md font-semibold text-sm border-none cursor-pointer transition-colors {isExpanded
          ? 'bg-gray-500 text-white hover:bg-gray-600'
          : 'bg-blue-600 text-white hover:bg-blue-700'}"
      >
        {isExpanded ? 'Collapse' : 'Expand'} Dependencies ({practice.dependencyCount})
      </button>
    {/if}
  {/if}
</button>

<style>
  .category-dot {
    width: 0.875rem;
    height: 0.875rem;
    border-radius: 50%;
    flex-shrink: 0;
    background-color: var(--dot-color);
  }
</style>
