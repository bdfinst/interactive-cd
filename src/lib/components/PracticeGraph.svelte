<script>
	/**
	 * PracticeGraph Component
	 *
	 * Displays practices as a navigable graph with drill-down capability
	 */
	import { onMount, afterUpdate } from 'svelte';
	import GraphNode from './GraphNode.svelte';

	let containerRef;
	let ancestorRefs = [];
	let currentRef;
	let dependencyRefs = [];
	let connections = [];
	let selectedNodeId = null;

	// Navigation state
	let navigationPath = ['continuous-delivery']; // Stack of practice IDs
	let ancestorPractices = []; // All ancestors in the path
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

				// Load ALL ancestors if not at root
				ancestorPractices = [];
				if (navigationPath.length > 1) {
					// Load all ancestors except the current one
					for (let i = 0; i < navigationPath.length - 1; i++) {
						const ancestorId = navigationPath[i];
						const ancestorResponse = await fetch(`/api/practices/cards?root=${ancestorId}`);
						const ancestorResult = await ancestorResponse.json();
						if (ancestorResult.success) {
							ancestorPractices.push(ancestorResult.data[0]);
						}
					}
				}
			}
		} catch (error) {
			console.error('Error loading practices:', error);
		} finally {
			loading = false;
		}
	}

	async function expandPractice(practiceId) {
		// Get the current practice ID
		const currentId = navigationPath[navigationPath.length - 1];

		if (practiceId === currentId) {
			// Trying to collapse the current practice - navigate back
			await navigateBack();
		} else {
			// Expand a dependency - add to navigation path and load new view
			navigationPath = [...navigationPath, practiceId];
			selectedNodeId = null;
			await loadCurrentView();
		}
	}

	function isPracticeExpanded(practiceId) {
		// A practice is expanded if it's the current practice and we can navigate back
		const currentId = navigationPath[navigationPath.length - 1];
		return practiceId === currentId && navigationPath.length > 1;
	}

	async function navigateBack() {
		if (navigationPath.length > 1) {
			navigationPath = navigationPath.slice(0, -1);
			selectedNodeId = null;
			await loadCurrentView();
		}
	}

	async function navigateToAncestor(ancestorIndex) {
		// Navigate to a specific ancestor by trimming the path
		if (ancestorIndex >= 0 && ancestorIndex < navigationPath.length - 1) {
			navigationPath = navigationPath.slice(0, ancestorIndex + 1);
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

		// Connections between all ancestors (solid lines)
		if (ancestorRefs.length > 0) {
			for (let i = 0; i < ancestorRefs.length - 1; i++) {
				const currentAncestorRef = ancestorRefs[i];
				const nextAncestorRef = ancestorRefs[i + 1];

				if (currentAncestorRef && nextAncestorRef) {
					const rect1 = currentAncestorRef.getBoundingClientRect();
					const rect2 = nextAncestorRef.getBoundingClientRect();

					const x1 = rect1.left - containerRect.left + rect1.width / 2;
					const y1 = rect1.bottom - containerRect.top;
					const x2 = rect2.left - containerRect.left + rect2.width / 2;
					const y2 = rect2.top - containerRect.top;

					connections.push({
						x1,
						y1,
						x2,
						y2,
						type: 'ancestor' // Solid line
					});
				}
			}
		}

		// Connection from last ancestor to current (solid line)
		if (ancestorRefs.length > 0 && currentRef) {
			const lastAncestorRef = ancestorRefs[ancestorRefs.length - 1];
			if (lastAncestorRef) {
				const ancestorRect = lastAncestorRef.getBoundingClientRect();
				const currentRect = currentRef.getBoundingClientRect();

				const ancestorX = ancestorRect.left - containerRect.left + ancestorRect.width / 2;
				const ancestorY = ancestorRect.bottom - containerRect.top;
				const currentX = currentRect.left - containerRect.left + currentRect.width / 2;
				const currentY = currentRect.top - containerRect.top;

				connections.push({
					x1: ancestorX,
					y1: ancestorY,
					x2: currentX,
					y2: currentY,
					type: 'ancestor' // Solid line
				});
			}
		}

		// Connections from current to dependencies
		if (currentRef && dependencyRefs.length > 0) {
			const currentRect = currentRef.getBoundingClientRect();
			const currentX = currentRect.left - containerRect.left + currentRect.width / 2;
			const currentY = currentRect.bottom - containerRect.top;

			dependencyRefs
				.filter((ref) => ref !== null)
				.forEach((ref, index) => {
					const rect = ref.getBoundingClientRect();
					const depX = rect.left - containerRect.left + rect.width / 2;
					const depY = rect.top - containerRect.top;

					// Check if this dependency is selected
					const isSelected = dependencies[index] && selectedNodeId === dependencies[index].id;

					connections.push({
						x1: currentX,
						y1: currentY,
						x2: depX,
						y2: depY,
						type: isSelected ? 'selected' : 'dependency' // Solid if selected, dashed otherwise
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

<div class="relative w-full min-h-screen p-8 mt-16" bind:this={containerRef}>
	{#if loading}
		<div class="flex items-center justify-center py-12">
			<div class="text-center">
				<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
				<p class="text-gray-300">Loading dependencies...</p>
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
					stroke-dasharray={conn.type === 'ancestor' || conn.type === 'selected' ? '0' : '5,5'}
					opacity={conn.type === 'ancestor' || conn.type === 'selected' ? '1' : '0.6'}
				/>
				<circle cx={conn.x2} cy={conn.y2} r="4" fill="#3b82f6" />
			{/each}
		</svg>

		<!-- Content Layer -->
		<div class="content-layer">
			<!-- Ancestor Practices (all ancestors in the path) -->
			{#if ancestorPractices.length > 0}
				{#each ancestorPractices as ancestor, i}
					<div class="ancestor-container">
						<div bind:this={ancestorRefs[i]}>
							<GraphNode
								practice={ancestor}
								isRoot={i === 0}
								isSelected={false}
								onClick={() => navigateToAncestor(i)}
								onExpand={() => navigateToAncestor(i)}
							/>
						</div>
					</div>
				{/each}
			{/if}

			<!-- Current Practice -->
			{#if currentPractice}
				<div class="current-container">
					<div bind:this={currentRef}>
						<GraphNode
							practice={currentPractice}
							isRoot={navigationPath.length === 1}
							isSelected={selectedNodeId === currentPractice.id}
							isExpanded={isPracticeExpanded(currentPractice.id)}
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
								isExpanded={isPracticeExpanded(dependency.id)}
								onClick={() => selectNode(dependency.id)}
								onExpand={() => expandPractice(dependency.id)}
							/>
						</div>
					{/each}
				</div>
			{:else if currentPractice && currentPractice.dependencyCount === 0}
				<p class="text-center text-gray-300 mt-8">No dependencies (Leaf practice)</p>
			{/if}
		</div>
	{/if}
</div>

<style>
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
		z-index: 10;
	}

	.ancestor-container,
	.current-container {
		display: flex;
		justify-content: center;
		margin-bottom: 4rem;
	}

	.ancestor-container > div,
	.current-container > div {
		max-width: 400px;
		width: 100%;
	}

	.dependencies-container {
		display: grid;
		gap: 3rem 2rem;
		max-width: 1280px;
		margin: 0 auto;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
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
