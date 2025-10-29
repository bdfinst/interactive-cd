import aboutMd from '../../../static/ABOUT.md?raw'

/**
 * Server-side data loading for about page
 *
 * Uses Vite's ?raw import suffix to load ABOUT.md as a string at build time.
 * This approach works in both development and production modes:
 * - Development: Vite reads from static/ABOUT.md
 * - Production: The content is bundled into the server code during build
 *
 * This is consistent with how the project imports data files (see FilePracticeRepository.js)
 * and follows SvelteKit/Vite best practices for static content.
 *
 * @type {import('./$types').PageServerLoad}
 */
export async function load() {
	return {
		markdown: aboutMd
	}
}
