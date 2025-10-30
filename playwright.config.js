import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
	testDir: './tests/e2e',
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 1 : 0, // Reduced from 2 to 1
	workers: process.env.CI ? 4 : undefined, // Increased from 1 to 4 for better parallelization
	reporter: 'list',
	use: {
		baseURL: 'http://localhost:5173',
		trace: 'on-first-retry'
	},
	projects: [
		// Desktop
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'] }
		},
		// Mobile Chrome (Android)
		{
			name: 'mobile-chrome',
			use: {
				...devices['Pixel 5'],
				hasTouch: true,
				isMobile: true
			}
		}
	],
	webServer: {
		command: 'npm run dev',
		url: 'http://localhost:5173',
		reuseExistingServer: !process.env.CI,
		env: {
			// Override environment variables for E2E tests
			// Feature flags should be disabled by default in tests
			VITE_ENABLE_PRACTICE_ADOPTION: 'false'
		}
	}
})
