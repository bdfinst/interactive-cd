/**
 * GET /api/practices/cards
 *
 * Returns Continuous Delivery practice and its direct dependencies as a flat array
 */
import { json } from '@sveltejs/kit'
import { PostgresPracticeRepository } from '$infrastructure/persistence/PostgresPracticeRepository.js'
import { PracticeId } from '$domain/practice-catalog/value-objects/PracticeId.js'

/**
 * Recursively get all transitive categories for a practice
 */
async function getTransitiveCategories(practiceId, repository, visited = new Set()) {
	// Prevent infinite loops
	if (visited.has(practiceId.toString())) {
		return new Set()
	}
	visited.add(practiceId.toString())

	const categories = new Set()
	const prerequisites = await repository.findPracticePrerequisites(practiceId)

	for (const { practice } of prerequisites) {
		// Add this dependency's category
		categories.add(practice.category.toString())

		// Recursively get categories from this dependency's dependencies
		const subCategories = await getTransitiveCategories(practice.id, repository, visited)
		for (const cat of subCategories) {
			categories.add(cat)
		}
	}

	return categories
}

/** @type {import('./$types').RequestHandler} */
export async function GET({ url }) {
	try {
		const repository = new PostgresPracticeRepository()

		// Get root practice ID from query param, default to 'continuous-delivery'
		const rootIdParam = url.searchParams.get('root') || 'continuous-delivery'
		const rootId = PracticeId.from(rootIdParam)
		const rootPractice = await repository.findById(rootId)

		if (!rootPractice) {
			return json({ error: `Practice '${rootIdParam}' not found` }, { status: 404 })
		}

		// Get direct dependencies
		const prerequisites = await repository.findPracticePrerequisites(rootId)

		// Get all transitive categories (including sub-dependencies)
		const transitiveCategories = await getTransitiveCategories(rootId, repository)
		const dependencyCategories = [...transitiveCategories].sort()

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

				// Get all transitive categories for this practice
				const practiceTransitiveCategories = await getTransitiveCategories(practice.id, repository)
				const practiceDepCategories = [...practiceTransitiveCategories].sort()

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
