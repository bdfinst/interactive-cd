import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
	plugins: [sveltekit()],
	resolve: {
		alias: {
			$domain: path.resolve('./src/domain'),
			$application: path.resolve('./src/application'),
			$infrastructure: path.resolve('./src/infrastructure')
		},
		conditions: ['browser', 'default']
	},
	test: {
		globals: true,
		environment: 'jsdom',
		setupFiles: ['./src/test/setup.js'],
		include: ['tests/**/*.{test,spec}.{js,mjs,cjs}'],
		exclude: ['tests/e2e/**', 'node_modules/**'],
		browser: {
			enabled: false,
			provider: 'preview'
		},
		server: {
			deps: {
				inline: ['svelte']
			}
		}
	}
})
