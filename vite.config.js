import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vitest/config'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { spawn } from 'child_process'

/**
 * Vite plugin to validate cd-practices.json on change
 * Runs validation script whenever the JSON file is modified
 */
function validateCDPractices() {
	return {
		name: 'validate-cd-practices',
		handleHotUpdate({ file, server }) {
			if (file.endsWith('cd-practices.json')) {
				console.log('\n📊 CD Practices data changed, running validation...')

				// Run validation script
				const validate = spawn('node', ['scripts/validate-cd-practices.js'], {
					stdio: 'inherit'
				})

				validate.on('close', code => {
					if (code !== 0) {
						console.error('❌ Validation failed!')
					} else {
						console.log('✅ Validation passed, reloading...')
						// Trigger full reload to ensure SSR picks up changes
						server.ws.send({
							type: 'full-reload',
							path: '*'
						})
					}
				})
			}
		}
	}
}

export default defineConfig({
	plugins: [sveltekit(), tailwindcss(), validateCDPractices()],
	server: {
		fs: {
			allow: ['.']
		}
	},
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
