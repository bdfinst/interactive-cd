<script>
  import { CATEGORY_COLORS, CATEGORY_LABELS, CATEGORIES } from '$lib/constants/categories.js';
</script>

<div class="fixed top-32 left-4 bg-white text-gray-800 rounded-xl p-4 shadow-lg z-[900] w-fit">
  <h3 class="text-sm font-bold text-gray-700 uppercase tracking-wide m-0 mb-3">
    Requires
  </h3>
  <ul class="list-none p-0 m-0 flex flex-col gap-2">
    {#each CATEGORIES as category}
      <li class="flex items-center gap-2">
        <span
          class="w-3 h-3 rounded-full flex-shrink-0"
          class:bg-[#10b981]={category === 'behavior'}
          class:bg-[#f59e0b]={category === 'culture'}
          class:bg-[#8b5cf6]={category === 'tooling'}
        ></span>
        <span class="text-sm text-gray-600">{CATEGORY_LABELS[category]}</span>
      </li>
    {/each}
  </ul>
</div>
