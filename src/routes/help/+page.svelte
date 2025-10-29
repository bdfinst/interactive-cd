<script>
	import Button from '$lib/components/Button.svelte'
	import SEO from '$lib/components/SEO.svelte'

	const { data } = $props()

	// Simple markdown to HTML converter for basic formatting
	function renderMarkdown(md) {
		let html = md
			// Headers (skip h1 since we'll add it separately for a11y)
			.replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold mt-6 mb-3 text-gray-100">$1</h3>')
			.replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mt-8 mb-4 text-gray-100">$1</h2>')
			.replace(/^# (.*$)/gim, '<div class="sr-only">$1</div>') // Hide markdown h1, we'll add our own
			// Links with focus styles and external link handling
			.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
				const isExternal = url.startsWith('http')
				const externalAttrs = isExternal ? 'target="_blank" rel="noopener noreferrer"' : ''
				const srText = isExternal ? '<span class="sr-only"> (opens in new tab)</span>' : ''
				return `<a href="${url}" class="text-blue-400 hover:text-blue-300 underline focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-gray-800 rounded" ${externalAttrs}>${text}${srText}</a>`
			})
			// Bold
			.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-gray-100">$1</strong>')
			// Code blocks
			.replace(
				/```([^`]+)```/g,
				'<pre class="bg-gray-900 p-4 rounded-lg overflow-x-auto my-4 border border-gray-700"><code class="text-gray-200">$1</code></pre>'
			)
			// Inline code
			.replace(
				/`([^`]+)`/g,
				'<code class="bg-gray-900 px-2 py-1 rounded text-sm font-mono text-blue-300 border border-gray-700">$1</code>'
			)
			// Convert all list items (both checkboxes and regular bullets)
			// Checkbox items (with optional leading spaces for nested lists)
			.replace(
				/^(\s*)- \[ \] (.+)$/gim,
				'<li class="text-gray-300"><input type="checkbox" disabled aria-label="Pending task" class="mr-2">$2</li>'
			)
			.replace(
				/^(\s*)- \[x\] (.+)$/gim,
				'<li class="text-gray-300"><input type="checkbox" disabled checked aria-label="Completed task" class="mr-2">$2</li>'
			)
			// Regular bullet list items (with optional leading spaces for nested lists)
			.replace(/^(\s*)- (.+)$/gim, '<li class="text-gray-300">$2</li>')

		// Wrap consecutive <li> elements in <ul> tags
		html = html.replace(/(<li class="text-gray-300">.*?<\/li>\n?)+/g, match => {
			return `<ul class="list-none ml-6 mb-4 space-y-2">${match}</ul>`
		})

		// Paragraphs
		html = html.replace(/\n\n/g, '</p><p class="mb-4 text-gray-300">')

		return html
	}

	const htmlContent = $derived(
		'<p class="mb-4 text-gray-300">' + renderMarkdown(data.markdown) + '</p>'
	)
</script>

<SEO
	title="Help & Capabilities - Interactive CD"
	description="Learn about the capabilities and features of Interactive CD, and see what's coming next."
	path="/help"
/>

<div class="min-h-screen bg-gray-900">
	<!-- Skip to main content link for keyboard users -->
	<nav aria-label="Skip links">
		<a
			href="#main-content"
			class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
		>
			Skip to main content
		</a>
	</nav>

	<div class="max-w-4xl mx-auto px-4 py-8">
		<!-- Back to Home Button -->
		<nav aria-label="Breadcrumb navigation" class="mb-6">
			<Button href="/" variant="primary" size="lg">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-5 w-5"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					aria-hidden="true"
					focusable="false"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M10 19l-7-7m0 0l7-7m-7 7h18"
					/>
				</svg>
				<span>Back to Interactive CD</span>
			</Button>
		</nav>

		<!-- Main Content -->
		<div
			id="main-content"
			class="bg-gray-800 rounded-lg shadow-lg p-8 max-w-none border border-gray-700"
		>
			<h1 class="text-4xl font-bold mb-6 text-gray-100 border-b border-gray-600 pb-4">
				Interactive CD - Capabilities & Roadmap
			</h1>
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			{@html htmlContent}
		</div>
	</div>
</div>
