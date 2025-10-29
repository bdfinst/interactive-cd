<script>
	import { faCog, faRocket, faSeedling, faTrophy } from '@fortawesome/free-solid-svg-icons'
	import Fa from 'svelte-fa'
	import Tooltip from './Tooltip.svelte'

	/**
	 * MaturityBadge Component
	 *
	 * Displays a maturity level indicator with icon and tooltip
	 */
	const { maturityLevel = 1 } = $props()

	let showTooltip = $state(false)

	// Icon mapping for maturity levels
	const maturityConfig = {
		0: {
			icon: faSeedling,
			label: 'Repeatable',
			description: 'Documented and partly automated'
		},
		1: {
			icon: faCog,
			label: 'Consistent',
			description: 'Automated across entire lifecycle'
		},
		2: {
			icon: faRocket,
			label: 'Quantitatively managed',
			description: 'Measured and controlled'
		},
		3: {
			icon: faTrophy,
			label: 'Optimizing',
			description: 'Focused on improvement'
		}
	}

	const config = $derived(maturityConfig[maturityLevel] || maturityConfig[1])
	const ariaLabel = $derived(`Maturity Level ${maturityLevel}: ${config.label}`)
</script>

<div
	class="relative inline-flex items-center justify-center"
	role="img"
	aria-label={ariaLabel}
	onmouseenter={() => (showTooltip = true)}
	onmouseleave={() => (showTooltip = false)}
	data-testid="maturity-badge"
	data-maturity-level={maturityLevel}
>
	<Fa icon={config.icon} size="sm" class="text-gray-600" />
	<Tooltip text={config.description} visible={showTooltip} position="bottom" size="sm" />
</div>
