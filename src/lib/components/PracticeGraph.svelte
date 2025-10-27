<script>
	/**
	 * PracticeGraph Component
	 *
	 * Displays practices as a navigable graph with drill-down capability
	 */
	import { createCurvePath } from '$lib/domain/practice-graph/connections.js'
	import { filterTreeBySelection } from '$lib/domain/practice-graph/filter.js'
	import { optimizeLayerOrdering } from '$lib/domain/practice-graph/layout.js'
	import {
		expandPractice as expandPracticeLogic,
		isPracticeExpanded as isPracticeExpandedLogic,
		navigateToAncestor as navigateToAncestorLogic
	} from '$lib/domain/practice-graph/navigation.js'
	import { enrichWithDependencyCounts, flattenTree } from '$lib/domain/practice-graph/tree.js'
	import { adoptionStore } from '$lib/stores/adoptionStore.js'
	import { expandButtonRenderer } from '$lib/stores/expandButton.js'
	import { isFullTreeExpanded } from '$lib/stores/treeState.js'
	import { calculateAdoptedDependencies } from '$lib/utils/adoption.js'
	import { debounce } from '$lib/utils/debounce.js'
	import { onMount, tick } from 'svelte'
	import GraphNode from './GraphNode.svelte'
	import LoadingSpinner from './LoadingSpinner.svelte'

	// Accept initial server data
	const { initialData = null } = $props()

	// Subscribe to adoption store
	let adoptedPractices = $state(new Set())
	adoptionStore.subscribe(value => {
		adoptedPractices = value
	})

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

	// Practice map for transitive dependency calculations
	let practiceMap = $state(new Map())

	/**
	 * Build a map of practice ID to practice object from tree data
	 * @param {Object} node - Tree node (practice with nested dependencies)
	 * @param {Map} map - Map to populate
	 */
	function buildPracticeMap(node, map) {
		// eslint-disable-next-line svelte/prefer-svelte-reactivity -- Building map from tree data, not reactive state
		if (!map) map = new Map()
		if (!node) return map

		map.set(node.id, node)

		if (node.dependencies && Array.isArray(node.dependencies)) {
			node.dependencies.forEach(dep => buildPracticeMap(dep, map))
		}

		return map
	}

	// Initialize with provided practices
	onMount(async () => {
		// Initialize adoption store with all valid practice IDs
		// Load full tree to get all practice IDs
		const treeResponse = await fetch('/api/practices/tree?root=continuous-delivery')
		const treeResult = await treeResponse.json()

		if (treeResult.success) {
			// Build practice map for transitive dependency calculations
			practiceMap = buildPracticeMap(treeResult.data)

			// Extract all practice IDs from the tree
			// eslint-disable-next-line svelte/prefer-svelte-reactivity -- temporary Set, not reactive state
			const allPracticeIds = new Set()
			const extractIds = node => {
				allPracticeIds.add(node.id)
				if (node.dependencies) {
					node.dependencies.forEach(extractIds)
				}
			}
			extractIds(treeResult.data)

			// Initialize adoption store with valid practice IDs
			adoptionStore.initialize(allPracticeIds)
		}

		// Use server data if available, otherwise fetch
		if (initialData?.initialPractices) {
			const practices = initialData.initialPractices
			currentPractice = practices[0] // First is always the root/current
			dependencies = practices.slice(1) // Rest are dependencies
			selectedNodeId = currentPractice.id // Auto-select the root practice
		} else {
			await loadCurrentView()
		}
		recalculateAllConnections()
		// Debounce resize handler to prevent layout thrashing on mobile
		const debouncedResize = debounce(recalculateAllConnections, 150)
		window.addEventListener('resize', debouncedResize, { passive: true })
		return () => window.removeEventListener('resize', debouncedResize)
	})

	// Set expand button renderer on mount, clear on unmount
	$effect(() => {
		const expanded = $isFullTreeExpanded // Track reactively

		expandButtonRenderer.set({
			type: 'expand-button',
			toggleFullTree,
			isExpanded: expanded
		})

		return () => {
			expandButtonRenderer.set(null)
		}
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

				selectedNodeId = currentPractice.id // Auto-select the current practice

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
				// Enrich tree with dependency counts
				fullTreeData = enrichWithDependencyCounts(result.data)
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

	// Filter the tree based on selected practice in expanded view
	const filteredTree = $derived.by(() => {
		if ($isFullTreeExpanded && selectedNodeId) {
			return filterTreeBySelection(flattenedTree, selectedNodeId)
		}
		return flattenedTree
	})

	// Group practices by hierarchy level for horizontal display
	const groupedByLevel = $derived.by(() => {
		const grouped = filteredTree.reduce((acc, practice) => {
			if (!acc[practice.level]) {
				acc[practice.level] = []
			}
			acc[practice.level].push(practice)
			return acc
		}, {})

		// Optimize ordering to minimize connection line lengths
		return optimizeLayerOrdering(grouped, 3)
	})

	function calculateTreeConnections() {
		if (!containerRef || filteredTree.length === 0) return

		// PHASE 1: Batch all DOM reads to prevent layout thrashing
		const containerRect = containerRef.getBoundingClientRect()
		const rectCache = {}

		// Read all rects in one pass
		filteredTree.forEach(practice => {
			const ref = treeNodeRefs[practice.id]
			if (ref) {
				rectCache[practice.id] = ref.getBoundingClientRect()
			}
		})

		// PHASE 2: Calculate connections from cached data (no forced layouts)
		const newConnections = []

		filteredTree.forEach(practice => {
			if (!practice.dependencies || practice.dependencies.length === 0) return

			const parentRect = rectCache[practice.id]
			if (!parentRect) return

			const parentX = parentRect.left - containerRect.left + parentRect.width / 2
			const parentY = parentRect.bottom - containerRect.top

			// Check if this practice is selected
			const isSelected = selectedNodeId === practice.id

			practice.dependencies.forEach(dep => {
				// Dependencies are full objects, not just IDs
				const childRect = rectCache[dep.id]
				if (!childRect) return

				const childX = childRect.left - containerRect.left + childRect.width / 2
				const childY = childRect.top - containerRect.top

				newConnections.push({
					x1: parentX,
					y1: parentY,
					x2: childX,
					y2: childY,
					type: 'tree',
					highlighted: isSelected
				})
			})
		})

		// PHASE 3: Single write operation
		treeConnections = newConnections
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
	{#if loading}
		<LoadingSpinner />
	{:else if $isFullTreeExpanded}
		<!-- SVG Layer for Tree Connections -->
		<svg class="absolute top-0 left-0 w-full h-full pointer-events-none z-0" aria-hidden="true">
			{#each treeConnections as conn}
				{@const strokeColor = conn.highlighted ? '#eab308' : '#93c5fd'}
				{@const fillColor = conn.highlighted ? '#eab308' : '#93c5fd'}
				<path
					d={createCurvePath(conn.x1, conn.y1, conn.x2, conn.y2)}
					stroke={strokeColor}
					stroke-width={conn.highlighted ? '3' : '2'}
					opacity={conn.highlighted ? '1' : '0.7'}
					fill="none"
				/>
				<!-- Start point (parent) -->
				<circle
					cx={conn.x1}
					cy={conn.y1}
					r={conn.highlighted ? '7' : '6'}
					fill={fillColor}
					opacity={conn.highlighted ? '1' : '0.8'}
				/>
				<!-- End point (child) -->
				<circle
					cx={conn.x2}
					cy={conn.y2}
					r={conn.highlighted ? '7' : '6'}
					fill={fillColor}
					opacity={conn.highlighted ? '1' : '0.8'}
				/>
			{/each}
		</svg>

		<!-- Full Tree View - Hierarchical Grid Layout -->
		<section class="relative z-10 space-y-8" aria-label="Full dependency tree">
			{#if flattenedTree.length > 0}
				{#each Object.keys(groupedByLevel).sort((a, b) => Number(a) - Number(b)) as level (level)}
					<div class="space-y-4">
						<!-- Selected card on its own centered row -->
						{#each groupedByLevel[level] as practice (practice.id)}
							{@const isSelected = selectedNodeId === practice.id}
							{#if isSelected}
								{@const adoptionCounts = calculateAdoptedDependencies(
									practice,
									adoptedPractices,
									practiceMap
								)}
								<div class="flex justify-center">
									<div
										bind:this={treeNodeRefs[practice.id]}
										class="w-full max-w-[482px] min-h-[300px]"
									>
										<GraphNode
											{practice}
											isRoot={practice.level === 0}
											{isSelected}
											isTreeExpanded={$isFullTreeExpanded}
											isAdopted={adoptedPractices.has(practice.id)}
											adoptedDependencyCount={adoptionCounts.adoptedCount}
											totalDependencyCount={adoptionCounts.totalCount}
											onclick={() => selectNode(practice.id)}
											onExpand={null}
											onToggleAdoption={() => adoptionStore.toggle(practice.id)}
											compact={true}
										/>
									</div>
								</div>
							{/if}
						{/each}

						<!-- Unselected cards in horizontal grid -->
						{#each [groupedByLevel[level].filter(p => selectedNodeId !== p.id)] as unselectedPractices}
							{#if unselectedPractices.length > 0}
								<div class="flex flex-wrap justify-center gap-x-4 gap-y-4 max-w-screen-xl">
									{#each unselectedPractices as practice (practice.id)}
										{@const adoptionCounts = calculateAdoptedDependencies(
											practice,
											adoptedPractices,
											practiceMap
										)}
										<div
											bind:this={treeNodeRefs[practice.id]}
											class="w-full min-w-[120px] max-w-[150px] min-h-[80px]"
										>
											<GraphNode
												{practice}
												isRoot={practice.level === 0}
												isSelected={false}
												isTreeExpanded={$isFullTreeExpanded}
												isAdopted={adoptedPractices.has(practice.id)}
												adoptedDependencyCount={adoptionCounts.adoptedCount}
												totalDependencyCount={adoptionCounts.totalCount}
												onclick={() => selectNode(practice.id)}
												onExpand={null}
												onToggleAdoption={() => adoptionStore.toggle(practice.id)}
												compact={true}
											/>
										</div>
									{/each}
								</div>
							{/if}
						{/each}
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
								isTreeExpanded={false}
								onclick={() => navigateToAncestor(i)}
								onExpand={() => navigateToAncestor(i)}
							/>
						</div>
					</div>
				{/each}
			{/if}

			<!-- Current Practice -->
			{#if currentPractice}
				{@const adoptionCounts = calculateAdoptedDependencies(
					currentPractice,
					adoptedPractices,
					practiceMap
				)}
				<div class="flex justify-center mb-16">
					<div bind:this={currentRef} class="max-w-[400px] w-full">
						<GraphNode
							practice={currentPractice}
							isRoot={navigationPath.length === 1}
							isSelected={selectedNodeId === currentPractice.id}
							isExpanded={isPracticeExpanded(currentPractice.id)}
							isTreeExpanded={false}
							isAdopted={adoptedPractices.has(currentPractice.id)}
							adoptedDependencyCount={adoptionCounts.adoptedCount}
							totalDependencyCount={adoptionCounts.totalCount}
							onclick={() => selectNode(currentPractice.id)}
							onExpand={() => expandPractice(currentPractice.id)}
							onToggleAdoption={() => adoptionStore.toggle(currentPractice.id)}
						/>
					</div>
				</div>
			{/if}

			<!-- Dependencies -->
			{#if dependencies.length > 0}
				<section
					class="flex flex-wrap justify-center gap-8 max-w-screen-xl mx-auto"
					aria-label="Practice dependencies"
				>
					{#each dependencies as dependency, i (dependency.id)}
						{@const isSelected = selectedNodeId === dependency.id}
						{@const depAdoptionCounts = calculateAdoptedDependencies(
							dependency,
							adoptedPractices,
							practiceMap
						)}
						<div
							bind:this={dependencyRefs[i]}
							class="w-full {isSelected ? 'md:w-2/3 lg:w-1/2' : ''}"
							style={isSelected ? '' : 'max-width: 250px; height: 140px;'}
						>
							<GraphNode
								practice={dependency}
								isRoot={false}
								{isSelected}
								isExpanded={isPracticeExpanded(dependency.id)}
								isTreeExpanded={false}
								isAdopted={adoptedPractices.has(dependency.id)}
								adoptedDependencyCount={depAdoptionCounts.adoptedCount}
								totalDependencyCount={depAdoptionCounts.totalCount}
								onclick={() => selectNode(dependency.id)}
								onExpand={() => expandPractice(dependency.id)}
								onToggleAdoption={() => adoptionStore.toggle(dependency.id)}
								compact={!isSelected}
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
