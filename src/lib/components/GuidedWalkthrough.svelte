<script>
	/**
	 * GuidedWalkthrough Component
	 *
	 * Fixed bottom panel showing adoption progress and recommending
	 * the next practice to adopt based on dependency analysis.
	 */
	import { walkthroughDismissed, walkthroughState } from '$lib/stores/walkthroughStore.js'
	import { menuStore } from '$lib/stores/menuStore.js'
	import { faTimes, faCompass } from '@fortawesome/free-solid-svg-icons'
	import Fa from 'svelte-fa'

	const { onNavigateToPractice = () => {} } = $props()

	const isDismissed = $derived($walkthroughDismissed)
	const state = $derived($walkthroughState)
	const recommendation = $derived(state.recommendation)
	const progress = $derived(state.progress)
	const isMenuExpanded = $derived($menuStore.isExpanded)

	const shouldShow = $derived(!isDismissed && progress.total > 0)

	function handleViewPractice() {
		if (recommendation) {
			onNavigateToPractice(recommendation.id)
		}
	}
</script>

{#if shouldShow}
	<div
		class="fixed right-0 left-0 bottom-0 bg-indigo-950/95 backdrop-blur-sm z-[998] border-t border-indigo-800/50 transition-all duration-300
		{isMenuExpanded ? 'md:left-[200px]' : 'md:left-16'}"
		data-testid="guided-walkthrough"
		role="complementary"
		aria-label="Adoption guide"
	>
		<div class="max-w-screen-xl mx-auto px-4 py-2.5">
			<div class="flex items-center justify-between gap-4">
				<!-- Progress and recommendation -->
				<div class="flex items-center gap-4 text-white min-w-0 flex-1">
					<!-- Progress indicator -->
					<div class="flex items-center gap-2 shrink-0">
						<Fa icon={faCompass} class="text-indigo-300" />
						<span class="text-sm font-medium text-indigo-200">
							{progress.adopted}/{progress.total}
						</span>
						<span class="text-xs text-indigo-400">({progress.percentage}%)</span>
					</div>

					<!-- Separator -->
					<div class="w-px h-5 bg-indigo-700 shrink-0 hidden sm:block"></div>

					<!-- Recommendation -->
					<div class="flex items-center gap-3 min-w-0">
						{#if recommendation}
							<span class="text-sm text-indigo-200 truncate">
								Next: <span class="font-semibold text-white">{recommendation.name}</span>
							</span>
							<button
								onclick={handleViewPractice}
								class="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-md transition-colors shrink-0"
								data-testid="walkthrough-view-practice"
							>
								View Practice
							</button>
						{:else if progress.adopted === progress.total}
							<span class="text-sm text-emerald-300 font-semibold"> All practices adopted! </span>
						{:else}
							<span class="text-sm text-indigo-300">
								Adopt dependencies to unlock next recommendations
							</span>
						{/if}
					</div>
				</div>

				<!-- Dismiss button -->
				<button
					onclick={() => walkthroughDismissed.dismiss()}
					class="text-indigo-400 hover:text-white transition-colors p-1.5 shrink-0"
					aria-label="Dismiss guide"
					data-testid="walkthrough-dismiss"
				>
					<Fa icon={faTimes} />
				</button>
			</div>
		</div>
	</div>
{:else if isDismissed}
	<!-- Show Guide button when dismissed -->
	<button
		class="fixed bottom-4 right-4 bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-2 rounded-lg shadow-lg z-[998] text-sm font-medium transition-colors flex items-center gap-2"
		onclick={() => walkthroughDismissed.show()}
		data-testid="walkthrough-show-guide"
		aria-label="Show adoption guide"
	>
		<Fa icon={faCompass} size="sm" />
		Show Guide
	</button>
{/if}
