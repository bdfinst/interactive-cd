import path from 'path'
import { fileURLToPath } from 'url'

import js from '@eslint/js'
import prettier from 'eslint-config-prettier'
import svelte from 'eslint-plugin-svelte'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default [
	js.configs.recommended,
	...svelte.configs['flat/recommended'],
	prettier,
	{
		languageOptions: {
			ecmaVersion: 2024,
			sourceType: 'module',
			parserOptions: {
				ecmaFeatures: {
					impliedStrict: true
				}
			},
			globals: {
				// Browser globals
				window: 'readonly',
				document: 'readonly',
				navigator: 'readonly',
				console: 'readonly',
				fetch: 'readonly',
				URL: 'readonly',
				URLSearchParams: 'readonly',
				IntersectionObserver: 'readonly',
				setTimeout: 'readonly',
				clearTimeout: 'readonly',
				setInterval: 'readonly',
				clearInterval: 'readonly',
				localStorage: 'readonly',
				// Service Worker globals
				self: 'readonly',
				caches: 'readonly',
				// Node globals
				process: 'readonly',
				global: 'readonly',
				Buffer: 'readonly',
				__dirname: 'readonly',
				__filename: 'readonly'
			}
		},
		rules: {
			// ESLint recommended rules are already included
			'no-unused-vars': [
				'error',
				{
					argsIgnorePattern: '^_',
					varsIgnorePattern: '^_',
					destructuredArrayIgnorePattern: '^_'
				}
			],
			'no-console': 'off', // Allow console statements in this project
			'prefer-const': 'error',
			'no-var': 'error'
		}
	},
	{
		files: ['**/*.svelte'],
		rules: {
			// Disable some overly strict Svelte rules for this project
			'svelte/no-unused-svelte-ignore': 'error',
			'svelte/no-at-html-tags': 'error',
			'svelte/require-each-key': 'off', // Allow each blocks without keys
			'svelte/no-navigation-without-resolve': 'off' // Allow external links
		}
	},
	{
		files: ['**/*.test.js', '**/*.spec.js', 'src/lib/testing/**'],
		rules: {
			'no-unused-vars': 'off' // Allow unused vars in tests
		}
	},
	{
		ignores: [
			// From .gitignore - Claude Code
			'.claude-flow/',
			// From .gitignore - OS
			'.DS_Store',
			// From .gitignore - Dependencies
			'node_modules/',
			// From .gitignore - Build
			'build/',
			'.svelte-kit/',
			'package/',
			// From .gitignore - Environment
			'.env',
			'.env.*',
			// From .gitignore - Vite
			'vite.config.js.timestamp-*',
			'vite.config.ts.timestamp-*',
			// From .gitignore - Netlify
			'.netlify/',
			// From .gitignore - Database
			'*.db',
			'*.db-shm',
			'*.db-wal',
			// From .gitignore - Logs
			'*.log',
			'npm-debug.log*',
			'yarn-debug.log*',
			'yarn-error.log*',
			// From .gitignore - IDE
			'.vscode/',
			'.idea/',
			'.hive-mind/',
			// ESLint-specific ignores (not in .gitignore)
			'public/',
			'dist/',
			'scripts/',
			'*.config.js',
			'tests/',
			'playwright.config.js',
			'src/lib/utils/resume.js' // Contains import assertions not yet supported by ESLint
		]
	}
]
