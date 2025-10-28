<script>
	import { menuStore, getMenuItems } from '$lib/stores/menuStore.js'
	import MenuItem from './MenuItem.svelte'
	import MenuToggle from './MenuToggle.svelte'

	/**
	 * Props for action handlers
	 */
	const { onExport = null, onImport = null } = $props()

	/**
	 * Get menu items from pure function
	 */
	const menuItems = getMenuItems()

	/**
	 * Split menu items into main and bottom sections
	 */
	const bottomItemIds = ['support', 'github', 'minimum-cd']
	const mainItems = menuItems.filter(item => !bottomItemIds.includes(item.id))
	const bottomItems = bottomItemIds
		.map(id => menuItems.find(item => item.id === id))
		.filter(Boolean)

	/**
	 * Subscribe to menu store for reactive updates
	 */
	const isExpanded = $derived($menuStore.isExpanded)

	/**
	 * Handle toggle button click
	 */
	const handleToggle = () => {
		menuStore.toggle()
	}

	/**
	 * Handle menu item action clicks
	 */
	const handleItemClick = item => {
		if (item.action === 'export' && onExport) {
			onExport()
		} else if (item.action === 'import' && onImport) {
			onImport()
		}
	}
</script>

<!-- Navigation -->
<nav aria-label="Main navigation" class="relative">
	<!-- Menu Sidebar - Always visible, toggles width -->
	<div
		data-testid="menu-content"
		class="fixed top-0 left-0 h-full bg-slate-200 shadow-lg z-[1100] transition-all duration-300 ease-in-out {isExpanded
			? 'w-64'
			: 'w-16'} overflow-y-auto flex flex-col"
	>
		<!-- Logo at top -->
		<div
			class="flex items-center justify-center {isExpanded
				? 'p-4'
				: 'p-2'} border-b border-slate-300"
		>
			<a
				href="/"
				class="rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
				aria-label="Return to home page"
			>
				<picture>
					<source srcset="/images/logo-md.webp 1x, /images/logo-lg.webp 2x" type="image/webp" />
					<img
						src="/images/logo.png"
						alt="Logo"
						class="{isExpanded ? 'h-12' : 'h-10'} w-auto transition-all duration-300"
						loading="lazy"
						decoding="async"
					/>
				</picture>
			</a>
		</div>

		<!-- Toggle button -->
		<div
			class="flex items-center {isExpanded
				? 'justify-end'
				: 'justify-center'} p-2 border-b border-slate-300"
		>
			<MenuToggle {isExpanded} onclick={handleToggle} />
		</div>

		<!-- Menu Items Container - Centers both sections together -->
		<div class="flex-1 flex flex-col items-center">
			<div class="flex flex-col w-fit gap-2 py-2">
				<!-- Main Menu Items List -->
				<ul class="flex flex-col items-center gap-2">
					{#each mainItems as item (item.id)}
						<li>
							{#if item.action}
								<MenuItem {item} {isExpanded} onclick={() => handleItemClick(item)} />
							{:else if item.href}
								<MenuItem {item} {isExpanded} />
							{/if}
						</li>
					{/each}
				</ul>

				<!-- Separator -->
				<div class="border-t border-slate-300 my-2"></div>

				<!-- Bottom Menu Items (GitHub, MinimumCD, Support) -->
				<ul class="flex flex-col items-start gap-2">
					{#each bottomItems as item (item.id)}
						<li>
							{#if item.action}
								<MenuItem {item} {isExpanded} onclick={() => handleItemClick(item)} />
							{:else if item.href}
								<MenuItem {item} {isExpanded} />
							{/if}
						</li>
					{/each}
				</ul>
			</div>
		</div>
	</div>
</nav>
