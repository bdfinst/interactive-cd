<script>
  import { CATEGORIES, CATEGORY_KEYS } from '$lib/constants/categories.js';
</script>

<div class="fixed top-32 left-4 bg-white text-gray-800 rounded-xl p-4 shadow-lg z-[900] w-fit">
  <h3 class="text-sm font-bold text-gray-700 uppercase tracking-wide m-0 mb-3">
    Requires
  </h3>
  <ul class="list-none p-0 m-0 flex flex-col gap-2">
    {#each CATEGORY_KEYS as categoryKey}
      <li class="flex items-center gap-2">
        <span
          class="w-3 h-3 rounded-full flex-shrink-0"
          class:bg-[#10b981]={categoryKey === 'behavior'}
          class:bg-[#f59e0b]={categoryKey === 'culture'}
          class:bg-[#8b5cf6]={categoryKey === 'tooling'}
        ></span>
        <span class="text-sm text-gray-600">{CATEGORIES[categoryKey].label}</span>
      </li>
    {/each}
  </ul>
</div>
