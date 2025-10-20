<script>
	import { version } from '../../../package.json'

	let showGithubTooltip = $state(false)
	let showMinimumCDTooltip = $state(false)
	let showSupportTooltip = $state(false)

	// Determine if version is beta (< 1.0.0)
	const isBeta = version.split('.')[0] === '0'
</script>

<header class="fixed top-0 left-0 right-0 bg-slate-300 text-gray-800 z-[1000] shadow-md">
	<div class="max-w-screen-xl mx-auto px-6 py-5">
		<!-- Large screens: 3-column grid (logo left, title center, menu right) -->
		<div class="hidden lg:grid lg:grid-cols-[1fr_auto_1fr] items-center gap-4">
			<!-- Left: Logo -->
			<div class="flex items-center justify-start">
				<img src="/images/logo.png" alt="Logo" class="h-logo-lg w-auto" />
			</div>

			<!-- Center: Title -->
			<div class="flex flex-col items-center">
				<h1 class="text-title-lg font-bold m-0 text-center whitespace-nowrap">
					CD Dependency Tree
				</h1>
				<div class="text-sm text-gray-600 mt-0.5">
					{#if isBeta}
						<span class="font-semibold">v{version}</span>
						<span
							class="ml-1 px-1.5 py-0.5 bg-amber-500 text-white rounded text-xs font-bold uppercase"
							>beta</span
						>
					{:else}
						<span class="font-semibold">v{version}</span>
					{/if}
				</div>
			</div>

			<!-- Right: Menu buttons -->
			<div class="flex items-center justify-end gap-3">
				<!-- GitHub Link -->
				<div class="relative inline-flex">
					<a
						href="https://github.com/bdfinst/interactive-cd"
						target="_blank"
						rel="noopener noreferrer"
						class="flex items-center justify-center text-gray-800 p-2 rounded-md transition-colors hover:bg-black/10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
						aria-label="View on GitHub"
						onmouseenter={() => (showGithubTooltip = true)}
						onmouseleave={() => (showGithubTooltip = false)}
					>
						<svg
							width="29"
							height="29"
							viewBox="0 0 24 24"
							fill="currentColor"
							xmlns="http://www.w3.org/2000/svg"
							class="w-6 sm:w-7 md:w-7"
						>
							<path
								d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
							/>
						</svg>
					</a>
					{#if showGithubTooltip}
						<div
							class="absolute top-[calc(100%+0.5rem)] left-1/2 -translate-x-1/2 bg-black/90 text-white px-2 py-1.5 rounded-md text-xs whitespace-nowrap pointer-events-none z-[2000] before:content-[''] before:absolute before:bottom-full before:left-1/2 before:-translate-x-1/2 before:border-[6px] before:border-transparent before:border-b-black/90 sm:px-2.5 sm:py-1.5 sm:text-xs md:px-3 md:py-2 md:text-sm"
						>
							View on GitHub
						</div>
					{/if}
				</div>

				<!-- MinimumCD Logo -->
				<div class="relative inline-flex">
					<a
						href="https://minimumcd.org"
						target="_blank"
						rel="noopener noreferrer"
						class="flex items-center px-2 py-1 rounded-md transition-colors hover:bg-black/10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
						aria-label="MinimumCD.org"
						onmouseenter={() => (showMinimumCDTooltip = true)}
						onmouseleave={() => (showMinimumCDTooltip = false)}
					>
						<img
							src="/images/minimumCD-logo-sm.png"
							alt="MinimumCD.org"
							class="h-6 sm:h-7 md:h-7 w-auto"
						/>
					</a>
					{#if showMinimumCDTooltip}
						<div
							class="absolute top-[calc(100%+0.5rem)] left-1/2 -translate-x-1/2 bg-black/90 text-white px-2 py-1.5 rounded-md text-xs whitespace-nowrap pointer-events-none z-[2000] before:content-[''] before:absolute before:bottom-full before:left-1/2 before:-translate-x-1/2 before:border-[6px] before:border-transparent before:border-b-black/90 sm:px-2.5 sm:py-1.5 sm:text-xs md:px-3 md:py-2 md:text-sm"
						>
							MinimumCD.org
						</div>
					{/if}
				</div>

				<!-- Ko-fi Button -->
				<div class="relative inline-flex">
					<a
						href="https://ko-fi.com/bryanfinster"
						target="_blank"
						rel="noopener noreferrer"
						class="inline-flex items-center justify-center text-gray-800 no-underline p-2 rounded-md transition-colors text-2xl md:text-3xl leading-none hover:bg-black/10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
						aria-label="Support this project"
						onmouseenter={() => (showSupportTooltip = true)}
						onmouseleave={() => (showSupportTooltip = false)}
					>
						🥃
					</a>
					{#if showSupportTooltip}
						<div
							class="absolute top-[calc(100%+0.5rem)] left-1/2 -translate-x-1/2 bg-black/90 text-white px-2 py-1.5 rounded-md text-xs whitespace-nowrap pointer-events-none z-[2000] before:content-[''] before:absolute before:bottom-full before:left-1/2 before:-translate-x-1/2 before:border-[6px] before:border-transparent before:border-b-black/90 sm:px-2.5 sm:py-1.5 sm:text-xs md:px-3 md:py-2 md:text-sm"
						>
							Support this project
						</div>
					{/if}
				</div>
			</div>
		</div>

		<!-- Medium and smaller: Stacked layout (no logo) -->
		<div class="flex lg:hidden flex-col gap-4">
			<!-- Top: Title (centered) -->
			<div class="flex flex-col items-center">
				<h1 class="text-title-sm md:text-title-md font-bold m-0 text-center whitespace-nowrap">
					CD Dependency Tree
				</h1>
				<div class="text-xs md:text-sm text-gray-600 mt-0.5">
					{#if isBeta}
						<span class="font-semibold">v{version}</span>
						<span
							class="ml-1 px-1.5 py-0.5 bg-amber-500 text-white rounded text-[10px] md:text-xs font-bold uppercase"
							>beta</span
						>
					{:else}
						<span class="font-semibold">v{version}</span>
					{/if}
				</div>
			</div>

			<!-- Bottom: Menu buttons (centered) -->
			<div class="flex items-center justify-center gap-2 md:gap-3">
				<!-- GitHub Link -->
				<div class="relative inline-flex">
					<a
						href="https://github.com/bdfinst/interactive-cd"
						target="_blank"
						rel="noopener noreferrer"
						class="flex items-center justify-center text-gray-800 p-2 rounded-md transition-colors hover:bg-black/10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
						aria-label="View on GitHub"
					>
						<svg
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="currentColor"
							xmlns="http://www.w3.org/2000/svg"
							class="w-6"
						>
							<path
								d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
							/>
						</svg>
					</a>
				</div>

				<!-- MinimumCD Logo -->
				<div class="relative inline-flex">
					<a
						href="https://minimumcd.org"
						target="_blank"
						rel="noopener noreferrer"
						class="flex items-center px-2 py-1 rounded-md transition-colors hover:bg-black/10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
						aria-label="MinimumCD.org"
					>
						<img src="/images/minimumCD-logo-sm.png" alt="MinimumCD.org" class="h-6 w-auto" />
					</a>
				</div>

				<!-- Ko-fi Button -->
				<div class="relative inline-flex">
					<a
						href="https://ko-fi.com/bryanfinster"
						target="_blank"
						rel="noopener noreferrer"
						class="inline-flex items-center justify-center text-gray-800 no-underline p-2 rounded-md transition-colors text-2xl leading-none hover:bg-black/10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
						aria-label="Support this project"
					>
						🥃
					</a>
				</div>
			</div>
		</div>
	</div>
</header>
