<script>
	import Fa from 'svelte-fa'
	import {
		faHome,
		faCircleInfo,
		faDownload,
		faUpload,
		faBug
	} from '@fortawesome/free-solid-svg-icons'
	import { faGithub } from '@fortawesome/free-brands-svg-icons'

	/**
	 * Menu item configuration object
	 * @type {{
	 *   id: string,
	 *   label: string,
	 *   icon: string,
	 *   href?: string,
	 *   action?: string,
	 *   external?: boolean
	 * }}
	 */
	const { item, isExpanded = true, onclick = null } = $props()

	/**
	 * Map icon names to FontAwesome icon objects
	 */
	const iconMap = {
		home: faHome,
		'circle-info': faCircleInfo,
		download: faDownload,
		upload: faUpload,
		bug: faBug,
		github: faGithub
	}

	/**
	 * Get FontAwesome icon for the given icon name
	 */
	const getIcon = iconName => {
		return iconMap[iconName] || null
	}

	/**
	 * Check if this item is a special emoji icon
	 */
	const isEmojiIcon = iconName => {
		return iconName === 'whiskey' || iconName === 'minimumcd'
	}

	/**
	 * Conditional classes based on menu state
	 * Expanded: Normal layout with gap and padding
	 * Collapsed: Centered icon only, compact padding
	 */
	const baseClasses = isExpanded
		? 'flex items-center gap-3 p-3 w-full text-left text-gray-800 rounded-md transition-colors hover:bg-black/10 active:bg-black/20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 touch-manipulation'
		: 'flex items-center justify-center p-3 w-full min-h-11 min-w-11 text-gray-800 rounded-md transition-colors hover:bg-black/10 active:bg-black/20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 touch-manipulation'
</script>

{#if item.href}
	<!-- Render as link -->
	<a
		href={item.href}
		class={baseClasses}
		target={item.external ? '_blank' : undefined}
		rel={item.external ? 'noopener noreferrer' : undefined}
		aria-label={item.label}
		data-testid="menu-item-{item.id}"
	>
		<span data-testid="menu-icon-{item.id}">
			{#if isEmojiIcon(item.icon)}
				<span class={isExpanded ? 'text-2xl' : 'text-xl'} aria-hidden="true">
					{#if item.icon === 'whiskey'}
						🥃
					{:else if item.icon === 'minimumcd'}
						<img
							src="/images/minimumCD-logo-sm.png"
							alt=""
							class="{isExpanded ? 'h-6' : 'h-5'} w-auto"
						/>
					{/if}
				</span>
			{:else}
				<Fa icon={getIcon(item.icon)} size="lg" />
			{/if}
		</span>
		<span class="flex-1 {isExpanded ? '' : 'sr-only'}" data-testid="menu-label-{item.id}"
			>{item.label}</span
		>
	</a>
{:else if item.action}
	<!-- Render as button for actions -->
	<button
		type="button"
		class={baseClasses}
		{onclick}
		aria-label={item.label}
		data-testid="menu-item-{item.id}"
	>
		<span data-testid="menu-icon-{item.id}">
			{#if isEmojiIcon(item.icon)}
				<span class={isExpanded ? 'text-2xl' : 'text-xl'} aria-hidden="true">
					{#if item.icon === 'whiskey'}
						🥃
					{/if}
				</span>
			{:else}
				<Fa icon={getIcon(item.icon)} size="lg" />
			{/if}
		</span>
		<span class="flex-1 {isExpanded ? '' : 'sr-only'}" data-testid="menu-label-{item.id}"
			>{item.label}</span
		>
	</button>
{/if}
