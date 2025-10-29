/**
 * GET /api/practices/tree
 *
 * Returns the complete practice tree starting from the root practice
 * (default: continuous-delivery)
 */
import { json } from '@sveltejs/kit'
import { createFilePracticeRepository } from '$infrastructure/persistence/FilePracticeRepository.js'
import { createGetPracticeTreeService } from '$application/practice-catalog/GetPracticeTreeService.js'
import { generateETag, getCacheControl, isCacheFresh } from '$lib/server/etag.js'

/* global Response */

/** @type {import('./$types').RequestHandler} */
export async function GET({ url, request }) {
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

		// Generate ETag from response data for cache validation
		const etag = generateETag(result)

		// Check if client's cached version is still fresh
		if (isCacheFresh(request, etag)) {
			return new Response(null, {
				status: 304,
				headers: {
					ETag: etag,
					'Cache-Control': getCacheControl(3600)
				}
			})
		}

		// Return fresh data with ETag
		return json(result, {
			headers: {
				ETag: etag,
				'Cache-Control': getCacheControl(3600)
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
