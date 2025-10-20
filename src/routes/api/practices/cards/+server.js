/**
 * GET /api/practices/cards
 *
 * Returns Continuous Delivery practice and its direct dependencies as a flat array
 */
import { json } from '@sveltejs/kit'
import { createFilePracticeRepository } from '$infrastructure/persistence/FilePracticeRepository.js'
import { PracticeId } from '$domain/practice-catalog/value-objects/PracticeId.js'

/** @type {import('./$types').RequestHandler} */
export async function GET({ url }) {
	try {
		const repository = createFilePracticeRepository()

		// Get root practice ID from query param, default to 'continuous-delivery'
		const rootIdParam = url.searchParams.get('root') || 'continuous-delivery'
		const rootId = PracticeId.from(rootIdParam)
		const rootPractice = await repository.findById(rootId)

		if (!rootPractice) {
			return json({ error: `Practice '${rootIdParam}' not found` }, { status: 404 })
		}

		// Get direct dependencies
		const prerequisites = await repository.findPracticePrerequisites(rootId)

		// Get all transitive categories (optimized - single pass)
		const dependencyCategories = await repository.getTransitiveCategories(rootId)

		// Format root practice for card display
		const rootCard = {
			id: rootPractice.id.toString(),
			name: rootPractice.name,
			category: rootPractice.category.toString(),
			categories: dependencyCategories, // Transitive categories from all dependencies
			description: rootPractice.description,
			requirements: rootPractice.requirements || [],
			benefits: rootPractice.benefits || [],
			requirementCount: rootPractice.requirements?.length || 0,
			benefitCount: rootPractice.benefits?.length || 0,
			dependencyCount: prerequisites.length
		}

		// Format dependency practices for card display
		const dependencyCards = await Promise.all(
			prerequisites.map(async ({ practice }) => {
				const deps = await repository.findPracticePrerequisites(practice.id)

				// Get all transitive categories for this practice (optimized)
				const practiceDepCategories = await repository.getTransitiveCategories(practice.id)

				return {
					id: practice.id.toString(),
					name: practice.name,
					category: practice.category.toString(),
					categories: practiceDepCategories, // Transitive categories from all dependencies
					description: practice.description,
					requirements: practice.requirements || [],
					benefits: practice.benefits || [],
					requirementCount: practice.requirements?.length || 0,
					benefitCount: practice.benefits?.length || 0,
					dependencyCount: deps.length
				}
			})
		)

		// Return root first, then dependencies
		const practices = [rootCard, ...dependencyCards]

		return json({
			success: true,
			data: practices,
			metadata: {
				rootId: rootIdParam,
				practiceCount: practices.length,
				timestamp: new Date().toISOString()
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
