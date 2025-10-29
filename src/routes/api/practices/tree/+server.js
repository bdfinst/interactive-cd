/**
 * GET /api/practices/tree
 *
 * Returns the complete practice tree starting from the root practice
 * (default: continuous-delivery)
 */
import { json } from '@sveltejs/kit'
import { createFilePracticeRepository } from '$infrastructure/persistence/FilePracticeRepository.js'
import { createGetPracticeTreeService } from '$application/practice-catalog/GetPracticeTreeService.js'

/** @type {import('./$types').RequestHandler} */
export async function GET({ url }) {
	try {
		// Get optional root parameter (defaults to 'continuous-delivery')
		const rootId = url.searchParams.get('root') || 'continuous-delivery'

		// Create repository and service (dependency injection)
		const repository = createFilePracticeRepository()
		const service = createGetPracticeTreeService(repository)

		// Execute use case
		const result = await service.execute(rootId)

		if (!result.success) {
			return json(
				{
					error: result.error,
					metadata: result.metadata
				},
				{ status: 404 }
			)
		}

		return json(result, {
			headers: {
				'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400'
			}
		})
	} catch (error) {
		console.error('API error:', error)
		return json(
			{
				error: 'Internal server error',
				message: error.message
			},
			{ status: 500 }
		)
	}
}
