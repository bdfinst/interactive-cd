<script>
	/**
	 * PracticeGraph Component
	 *
	 * Displays practices as a navigable graph with drill-down capability
	 */
	import { onMount, afterUpdate } from 'svelte';
	import GraphNode from './GraphNode.svelte';

	let containerRef;
	let parentRef;
	let currentRef;
	let dependencyRefs = [];
	let connections = [];
	let selectedNodeId = null;

	// Navigation state
	let navigationPath = ['continuous-delivery']; // Stack of practice IDs
	let parentPractice = null;
	let currentPractice = null;
	let dependencies = [];
	let loading = false;

	// Initialize with provided practices
	onMount(async () => {
		await loadCurrentView();
	});

	async function loadCurrentView() {
		loading = true;
		try {
			const currentId = navigationPath[navigationPath.length - 1];
			const response = await fetch(`/api/practices/cards?root=${currentId}`);
			const result = await response.json();

			if (result.success) {
				currentPractice = result.data[0]; // First is always the root/current
				dependencies = result.data.slice(1); // Rest are dependencies

				// Auto-select the current practice (root should always be selected)
				selectedNodeId = currentPractice.id;

				// Load parent if not at root
				if (navigationPath.length > 1) {
					const parentId = navigationPath[navigationPath.length - 2];
					const parentResponse = await fetch(`/api/practices/cards?root=${parentId}`);
					const parentResult = await parentResponse.json();
					if (parentResult.success) {
						parentPractice = parentResult.data[0];
					}
				} else {
					parentPractice = null;
				}
			}
		} catch (error) {
			console.error('Error loading practices:', error);
		} finally {
			loading = false;
		}
	}

	async function expandPractice(practiceId) {
		// Add to navigation path and load new view
		navigationPath = [...navigationPath, practiceId];
		selectedNodeId = null;
		await loadCurrentView();
	}

	async function navigateBack() {
		if (navigationPath.length > 1) {
			navigationPath = navigationPath.slice(0, -1);
			selectedNodeId = null;
			await loadCurrentView();
		}
	}

	function selectNode(practiceId) {
		if (selectedNodeId === practiceId) {
			selectedNodeId = null;
		} else {
			selectedNodeId = practiceId;
		}
		setTimeout(calculateConnections, 50);
	}

	function calculateConnections() {
		if (!containerRef) return;

		const containerRect = containerRef.getBoundingClientRect();
		connections = [];

		// Connection from parent to current (solid line)
		if (parentRef && currentRef) {
			const parentRect = parentRef.getBoundingClientRect();
			const currentRect = currentRef.getBoundingClientRect();

			const parentX = parentRect.left - containerRect.left + parentRect.width / 2;
			const parentY = parentRect.bottom - containerRect.top;
			const currentX = currentRect.left - containerRect.left + currentRect.width / 2;
			const currentY = currentRect.top - containerRect.top;

			connections.push({
				x1: parentX,
				y1: parentY,
				x2: currentX,
				y2: currentY,
				type: 'parent' // Solid line
			});
		}

		// Connections from current to dependencies (dashed lines)
		if (currentRef && dependencyRefs.length > 0) {
			const currentRect = currentRef.getBoundingClientRect();
			const currentX = currentRect.left - containerRect.left + currentRect.width / 2;
			const currentY = currentRect.bottom - containerRect.top;

			dependencyRefs
				.filter((ref) => ref !== null)
				.forEach((ref) => {
					const rect = ref.getBoundingClientRect();
					const depX = rect.left - containerRect.left + rect.width / 2;
					const depY = rect.top - containerRect.top;

					connections.push({
						x1: currentX,
						y1: currentY,
						x2: depX,
						y2: depY,
						type: 'dependency' // Dashed line
					});
				});
		}
	}

	onMount(() => {
		calculateConnections();
		window.addEventListener('resize', calculateConnections);
		return () => window.removeEventListener('resize', calculateConnections);
	});

	afterUpdate(() => {
		setTimeout(calculateConnections, 100);
	});
</script>

<div class="practice-graph" bind:this={containerRef}>
	<!-- Back Button -->
	{#if navigationPath.length > 1}
		<div class="mb-4">
			<button
				on:click={navigateBack}
				class="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold transition-colors flex items-center gap-2"
			>
				← Back to {parentPractice?.name || 'Parent'}
			</button>
		</div>
	{/if}

	{#if loading}
		<div class="flex items-center justify-center py-12">
			<div class="text-center">
				<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
				<p class="text-gray-600">Loading dependencies...</p>
			</div>
		</div>
	{:else}
		<!-- SVG Layer for Connections -->
		<svg class="connections-layer" aria-hidden="true">
			{#each connections as conn}
				<line
					x1={conn.x1}
					y1={conn.y1}
					x2={conn.x2}
					y2={conn.y2}
					stroke="#3b82f6"
					stroke-width="2"
					stroke-dasharray={conn.type === 'parent' ? '0' : '5,5'}
					opacity={conn.type === 'parent' ? '1' : '0.6'}
				/>
				<circle cx={conn.x2} cy={conn.y2} r="4" fill="#3b82f6" />
			{/each}
		</svg>

		<!-- Content Layer -->
		<div class="content-layer">
			<!-- Parent Practice (if in drill-down mode) -->
			{#if parentPractice}
				<div class="parent-container">
					<div bind:this={parentRef}>
						<GraphNode
							practice={parentPractice}
							isRoot={false}
							isSelected={false}
							onClick={() => {}}
							onExpand={null}
						/>
					</div>
				</div>
			{/if}

			<!-- Current Practice -->
			{#if currentPractice}
				<div class="current-container">
					<div bind:this={currentRef}>
						<GraphNode
							practice={currentPractice}
							isRoot={navigationPath.length === 1}
							isSelected={selectedNodeId === currentPractice.id}
							onClick={() => selectNode(currentPractice.id)}
							onExpand={() => expandPractice(currentPractice.id)}
						/>
					</div>
				</div>
			{/if}

			<!-- Dependencies -->
			{#if dependencies.length > 0}
				<div class="dependencies-container">
					{#each dependencies as dependency, i}
						<div bind:this={dependencyRefs[i]}>
							<GraphNode
								practice={dependency}
								isRoot={false}
								isSelected={selectedNodeId === dependency.id}
								onClick={() => selectNode(dependency.id)}
								onExpand={() => expandPractice(dependency.id)}
							/>
						</div>
					{/each}
				</div>
			{:else if currentPractice && currentPractice.dependencyCount === 0}
				<p class="text-center text-gray-500 mt-8">No dependencies (Leaf practice)</p>
			{/if}
		</div>
	{/if}
</div>

<style>
	.practice-graph {
		position: relative;
		width: 100%;
		min-height: 800px;
		padding: 2rem;
	}

	.connections-layer {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
		z-index: 0;
	}

	.content-layer {
		position: relative;
		z-index: 1;
	}

	.parent-container,
	.current-container {
		display: flex;
		justify-content: center;
		margin-bottom: 4rem;
	}

	.parent-container > div,
	.current-container > div {
		max-width: 400px;
		width: 100%;
	}

	.dependencies-container {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 3rem 2rem;
		max-width: 1200px;
		margin: 0 auto;
	}

	@media (min-width: 768px) {
		.dependencies-container {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (min-width: 1024px) {
		.dependencies-container {
			grid-template-columns: repeat(3, 1fr);
		}
	}
</style>
