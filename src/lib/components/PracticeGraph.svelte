<script>
	/**
	 * PracticeGraph Component
	 *
	 * Displays practices as a navigable graph with drill-down capability
	 */
	import { onMount, tick } from 'svelte'
	import { isFullTreeExpanded } from '$lib/stores/treeState.js'
	import GraphNode from './GraphNode.svelte'
	import {
		expandPractice as expandPracticeLogic,
		navigateToAncestor as navigateToAncestorLogic,
		isPracticeExpanded as isPracticeExpandedLogic
	} from '$lib/domain/practice-graph/navigation.js'
	import { flattenTree } from '$lib/domain/practice-graph/tree.js'
	import { createCurvePath } from '$lib/domain/practice-graph/connections.js'

	let containerRef = $state()
	const ancestorRefs = $state([])
	let currentRef = $state()
	const dependencyRefs = $state([])
	let connections = $state([])
	let selectedNodeId = $state(null)

	// Navigation state
	let navigationPath = $state(['continuous-delivery']) // Stack of practice IDs
	let ancestorPractices = $state([]) // All ancestors in the path
	let currentPractice = $state(null)
	let dependencies = $state([])
	let loading = $state(false)

	// Full tree data
	let fullTreeData = $state(null)

	// Initialize with provided practices
	onMount(async () => {
		await loadCurrentView()
		recalculateAllConnections()
		window.addEventListener('resize', recalculateAllConnections)
		return () => window.removeEventListener('resize', recalculateAllConnections)
	})

	// React to expand/collapse changes from store
	$effect(() => {
		if ($isFullTreeExpanded) {
			handleExpand()
		} else {
			handleCollapse()
		}
	})

	async function handleExpand() {
		if (!fullTreeData) {
			await loadFullTree()
			selectedNodeId = currentPractice?.id || 'continuous-delivery'
		}
	}

	async function handleCollapse() {
		if (fullTreeData) {
			navigationPath = ['continuous-delivery']
			selectedNodeId = null
			fullTreeData = null
			await loadCurrentView()
		}
	}

	async function loadCurrentView() {
		loading = true
		try {
			const currentId = navigationPath[navigationPath.length - 1]
			const response = await fetch(`/api/practices/cards?root=${currentId}`)
			const result = await response.json()

			if (result.success) {
				currentPractice = result.data[0] // First is always the root/current
				dependencies = result.data.slice(1) // Rest are dependencies

				// Auto-select the current practice (root should always be selected)
				selectedNodeId = currentPractice.id

				// Load ALL ancestors if not at root
				ancestorPractices = []
				if (navigationPath.length > 1) {
					// Load all ancestors in parallel to avoid N+1 queries
					const ancestorIds = navigationPath.slice(0, -1)
					const ancestorPromises = ancestorIds.map(ancestorId =>
						fetch(`/api/practices/cards?root=${ancestorId}`).then(res => res.json())
					)
					const ancestorResults = await Promise.all(ancestorPromises)
					ancestorPractices = ancestorResults
						.filter(result => result.success)
						.map(result => result.data[0])
				}
			}
		} catch (error) {
			console.error('Error loading practices:', error)
		} finally {
			loading = false
		}
	}

	async function expandPractice(practiceId) {
		navigationPath = expandPracticeLogic(navigationPath, practiceId)
		selectedNodeId = null
		await loadCurrentView()
	}

	function isPracticeExpanded(practiceId) {
		return isPracticeExpandedLogic(navigationPath, practiceId)
	}

	async function navigateToAncestor(ancestorIndex) {
		navigationPath = navigateToAncestorLogic(navigationPath, ancestorIndex)
		selectedNodeId = null
		await loadCurrentView()
	}

	async function selectNode(practiceId) {
		if (selectedNodeId === practiceId) {
			selectedNodeId = null
		} else {
			selectedNodeId = practiceId
		}
		await tick()
		recalculateAllConnections()
	}

	async function loadFullTree() {
		loading = true
		try {
			const response = await fetch('/api/practices/tree?root=continuous-delivery')
			const result = await response.json()

			if (result.success) {
				fullTreeData = result.data
				// Flatten the tree for easier rendering
				flattenedTree = flattenTree(fullTreeData)
			}
		} catch (error) {
			console.error('Error loading full tree:', error)
		} finally {
			loading = false
		}
	}

	let flattenedTree = $state([])
	const treeNodeRefs = $state({})
	let treeConnections = $state([])

	// Group practices by hierarchy level for horizontal display
	const groupedByLevel = $derived(
		flattenedTree.reduce((acc, practice) => {
			if (!acc[practice.level]) {
				acc[practice.level] = []
			}
			acc[practice.level].push(practice)
			return acc
		}, {})
	)

	function calculateTreeConnections() {
		if (!containerRef || flattenedTree.length === 0) return

		const containerRect = containerRef.getBoundingClientRect()
		treeConnections = []

		// Draw connections from each practice to its dependencies
		flattenedTree.forEach(practice => {
			if (!practice.dependencies || practice.dependencies.length === 0) return

			const parentRef = treeNodeRefs[practice.id]
			if (!parentRef) return

			const parentRect = parentRef.getBoundingClientRect()
			const parentX = parentRect.left - containerRect.left + parentRect.width / 2
			const parentY = parentRect.bottom - containerRect.top

			practice.dependencies.forEach(dep => {
				// Dependencies are full objects, not just IDs
				const childRef = treeNodeRefs[dep.id]
				if (!childRef) return

				const childRect = childRef.getBoundingClientRect()
				const childX = childRect.left - containerRect.left + childRect.width / 2
				const childY = childRect.top - containerRect.top

				treeConnections.push({
					x1: parentX,
					y1: parentY,
					x2: childX,
					y2: childY,
					type: 'tree'
				})
			})
		})
	}

	function calculateConnections() {
		if (!containerRef) return

		const containerRect = containerRef.getBoundingClientRect()
		connections = []

		// Connections between all ancestors (solid lines)
		if (ancestorRefs.length > 0) {
			for (let i = 0; i < ancestorRefs.length - 1; i++) {
				const currentAncestorRef = ancestorRefs[i]
				const nextAncestorRef = ancestorRefs[i + 1]

				if (currentAncestorRef && nextAncestorRef) {
					const rect1 = currentAncestorRef.getBoundingClientRect()
					const rect2 = nextAncestorRef.getBoundingClientRect()

					const x1 = rect1.left - containerRect.left + rect1.width / 2
					const y1 = rect1.bottom - containerRect.top
					const x2 = rect2.left - containerRect.left + rect2.width / 2
					const y2 = rect2.top - containerRect.top

					connections.push({
						x1,
						y1,
						x2,
						y2,
						type: 'ancestor' // Solid line
					})
				}
			}
		}

		// Connection from last ancestor to current (solid line)
		if (ancestorRefs.length > 0 && currentRef) {
			const lastAncestorRef = ancestorRefs[ancestorRefs.length - 1]
			if (lastAncestorRef) {
				const ancestorRect = lastAncestorRef.getBoundingClientRect()
				const currentRect = currentRef.getBoundingClientRect()

				const ancestorX = ancestorRect.left - containerRect.left + ancestorRect.width / 2
				const ancestorY = ancestorRect.bottom - containerRect.top
				const currentX = currentRect.left - containerRect.left + currentRect.width / 2
				const currentY = currentRect.top - containerRect.top

				connections.push({
					x1: ancestorX,
					y1: ancestorY,
					x2: currentX,
					y2: currentY,
					type: 'ancestor' // Solid line
				})
			}
		}

		// Connections from current to dependencies
		if (currentRef && dependencyRefs.length > 0) {
			const currentRect = currentRef.getBoundingClientRect()
			const currentX = currentRect.left - containerRect.left + currentRect.width / 2
			const currentY = currentRect.bottom - containerRect.top

			dependencyRefs
				.filter(ref => ref !== null)
				.forEach((ref, index) => {
					const rect = ref.getBoundingClientRect()
					const depX = rect.left - containerRect.left + rect.width / 2
					const depY = rect.top - containerRect.top

					// Check if this dependency is selected
					const isSelected = dependencies[index] && selectedNodeId === dependencies[index].id

					connections.push({
						x1: currentX,
						y1: currentY,
						x2: depX,
						y2: depY,
						type: isSelected ? 'selected' : 'dependency' // Solid if selected, dashed otherwise
					})
				})
		}
	}

	function recalculateAllConnections() {
		if ($isFullTreeExpanded) {
			calculateTreeConnections()
		} else {
			calculateConnections()
		}
	}

	// Recalculate connections whenever state changes that affect DOM layout
	$effect(() => {
		// Track dependencies that affect rendering
		ancestorPractices
		currentPractice
		dependencies
		selectedNodeId
		flattenedTree
		$isFullTreeExpanded

		// Use tick() to ensure DOM has updated before calculating positions
		tick().then(() => {
			recalculateAllConnections()
		})
	})

	function toggleFullTree() {
		isFullTreeExpanded.toggle()
	}
</script>

<div
	class="relative w-full min-h-screen p-8"
	bind:this={containerRef}
	role="main"
	aria-label="Practice dependency graph"
>
	<!-- Expand/Collapse Button - Fixed in upper left corner -->
	<button
		onclick={toggleFullTree}
		class="fixed top-[6.5rem] left-4 z-[1100] px-3 py-1.5 rounded-lg font-semibold text-sm border-2 transition-colors shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 {$isFullTreeExpanded
			? 'bg-gray-600 text-white border-gray-600 hover:bg-gray-700 focus:ring-gray-500'
			: 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700 focus:ring-blue-500'}"
		data-testid="toggle-full-tree"
		aria-label={$isFullTreeExpanded ? 'Collapse tree view' : 'Expand tree view'}
	>
		{$isFullTreeExpanded ? 'Collapse' : 'Expand'}
	</button>

	{#if loading}
		<div class="flex items-center justify-center py-12" role="status" aria-live="polite">
			<div class="text-center">
				<div
					class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"
					aria-hidden="true"
				/>
				<p class="text-gray-300">Loading dependencies...</p>
			</div>
		</div>
	{:else if $isFullTreeExpanded}
		<!-- SVG Layer for Tree Connections -->
		<svg class="absolute top-0 left-0 w-full h-full pointer-events-none z-0" aria-hidden="true">
			{#each treeConnections as conn}
				<path
					d={createCurvePath(conn.x1, conn.y1, conn.x2, conn.y2)}
					stroke="#93c5fd"
					stroke-width="2"
					opacity="0.7"
					fill="none"
				/>
				<!-- Start point (parent) -->
				<circle cx={conn.x1} cy={conn.y1} r="6" fill="#93c5fd" opacity="0.8" />
				<!-- End point (child) -->
				<circle cx={conn.x2} cy={conn.y2} r="6" fill="#93c5fd" opacity="0.8" />
			{/each}
		</svg>

		<!-- Full Tree View - Hierarchical Grid Layout -->
		<section class="relative z-10 space-y-8" aria-label="Full dependency tree">
			{#if flattenedTree.length > 0}
				{#each Object.keys(groupedByLevel).sort((a, b) => Number(a) - Number(b)) as level (level)}
					<div class="space-y-4">
						<!-- Cards at this level in horizontal grid -->
						<div class="grid gap-x-4 gap-y-4 max-w-screen-xl mx-auto grid-cols-12">
							{#each groupedByLevel[level] as practice (practice.id)}
								{@const isSelected = selectedNodeId === practice.id}
								<div
									bind:this={treeNodeRefs[practice.id]}
									class="col-span-6 {isSelected
										? 'sm:col-span-6 md:col-span-4 lg:col-span-3'
										: 'sm:col-span-4 md:col-span-3 lg:col-span-2'}"
								>
									<GraphNode
										{practice}
										isRoot={practice.level === 0}
										{isSelected}
										onclick={() => selectNode(practice.id)}
										onexpand={null}
										compact={true}
									/>
								</div>
							{/each}
						</div>
					</div>
				{/each}
			{/if}
		</section>
	{:else}
		<!-- SVG Layer for Connections -->
		<svg class="absolute top-0 left-0 w-full h-full pointer-events-none z-0" aria-hidden="true">
			{#each connections as conn}
				<path
					d={createCurvePath(conn.x1, conn.y1, conn.x2, conn.y2)}
					stroke="#93c5fd"
					stroke-width="2"
					stroke-dasharray={conn.type === 'ancestor' || conn.type === 'selected' ? '0' : '5,5'}
					opacity={conn.type === 'ancestor' || conn.type === 'selected' ? '0.9' : '0.7'}
					fill="none"
				/>
				<!-- Start point (parent) -->
				<circle cx={conn.x1} cy={conn.y1} r="6" fill="#93c5fd" opacity="0.8" />
				<!-- End point (child) -->
				<circle cx={conn.x2} cy={conn.y2} r="6" fill="#93c5fd" opacity="0.8" />
			{/each}
		</svg>

		<!-- Content Layer -->
		<div class="relative z-10" role="region" aria-label="Practice navigation view">
			<!-- Ancestor Practices (all ancestors in the path) -->
			{#if ancestorPractices.length > 0}
				{#each ancestorPractices as ancestor, i (ancestor.id)}
					<div class="flex justify-center mb-16">
						<div bind:this={ancestorRefs[i]} class="max-w-[400px] w-full">
							<GraphNode
								practice={ancestor}
								isRoot={i === 0}
								isSelected={false}
								onclick={() => navigateToAncestor(i)}
								onexpand={() => navigateToAncestor(i)}
							/>
						</div>
					</div>
				{/each}
			{/if}

			<!-- Current Practice -->
			{#if currentPractice}
				<div class="flex justify-center mb-16">
					<div bind:this={currentRef} class="max-w-[400px] w-full">
						<GraphNode
							practice={currentPractice}
							isRoot={navigationPath.length === 1}
							isSelected={selectedNodeId === currentPractice.id}
							isExpanded={isPracticeExpanded(currentPractice.id)}
							onclick={() => selectNode(currentPractice.id)}
							onexpand={() => expandPractice(currentPractice.id)}
						/>
					</div>
				</div>
			{/if}

			<!-- Dependencies -->
			{#if dependencies.length > 0}
				<section
					class="grid gap-x-8 gap-y-12 max-w-screen-xl mx-auto grid-cols-12"
					role="region"
					aria-label="Practice dependencies"
				>
					{#each dependencies as dependency, i (dependency.id)}
						{@const isSelected = selectedNodeId === dependency.id}
						<div
							bind:this={dependencyRefs[i]}
							class="col-span-12 {isSelected
								? 'md:col-span-8 lg:col-span-6'
								: 'md:col-span-6 lg:col-span-4'}"
						>
							<GraphNode
								practice={dependency}
								isRoot={false}
								{isSelected}
								isExpanded={isPracticeExpanded(dependency.id)}
								onclick={() => selectNode(dependency.id)}
								onexpand={() => expandPractice(dependency.id)}
							/>
						</div>
					{/each}
				</section>
			{:else if currentPractice && currentPractice.dependencyCount === 0}
				<p class="text-center text-gray-300 mt-8">No dependencies (Leaf practice)</p>
			{/if}
		</div>
	{/if}
</div>
