import { readFileSync } from 'fs'
import { join } from 'path'

export async function load() {
	try {
		// Read CAPABILITIES.md from project root
		const capabilitiesPath = join(process.cwd(), 'CAPABILITIES.md')
		const markdown = readFileSync(capabilitiesPath, 'utf-8')

		return {
			markdown
		}
	} catch (error) {
		console.error('Error loading CAPABILITIES.md:', error)
		return {
			markdown: '# Error\n\nCould not load capabilities documentation.'
		}
	}
}
