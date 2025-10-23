/**
 * Server-side data loading for home page
 * Runs at build time for SSG (Static Site Generation)
 */
import { createFilePracticeRepository } from '$infrastructure/persistence/FilePracticeRepository.js'
import { PracticeId } from '$domain/practice-catalog/value-objects/PracticeId.js'

/** @type {import('./$types').PageServerLoad} */
export async function load() {
	const repository = createFilePracticeRepository()
	const rootId = PracticeId.from('continuous-delivery')

	// Get root practice
	const rootPractice = await repository.findById(rootId)

	if (!rootPractice) {
		throw new Error('Root practice not found')
	}

	// Get direct dependencies
	const prerequisites = await repository.findPracticePrerequisites(rootId)

	// Get all transitive categories (optimized - single pass)
	const dependencyCategories = await repository.getTransitiveCategories(rootId)

	// Get dependency counts for root practice
	const rootDirectCount = prerequisites.length
	const rootTotalCount = await repository.countTotalDependencies(rootId)

	// Format root practice for card display
	const rootCard = {
		id: rootPractice.id.toString(),
		name: rootPractice.name,
		category: rootPractice.category.toString(),
		categories: dependencyCategories,
		description: rootPractice.description,
		audited: rootPractice.audited !== undefined ? rootPractice.audited : true, // Default to true
		requirements: rootPractice.requirements || [],
		benefits: rootPractice.benefits || [],
		requirementCount: rootPractice.requirements?.length || 0,
		benefitCount: rootPractice.benefits?.length || 0,
		dependencyCount: rootDirectCount,
		directDependencyCount: rootDirectCount,
		totalDependencyCount: rootTotalCount
	}

	// Format dependency practices for card display
	const dependencyCards = await Promise.all(
		prerequisites.map(async ({ practice }) => {
			const deps = await repository.findPracticePrerequisites(practice.id)
			const practiceDepCategories = await repository.getTransitiveCategories(practice.id)

			// Get dependency counts
			const directCount = deps.length
			const totalCount = await repository.countTotalDependencies(practice.id)

			return {
				id: practice.id.toString(),
				name: practice.name,
				category: practice.category.toString(),
				categories: practiceDepCategories,
				description: practice.description,
				audited: practice.audited !== undefined ? practice.audited : true, // Default to true
				requirements: practice.requirements || [],
				benefits: practice.benefits || [],
				requirementCount: practice.requirements?.length || 0,
				benefitCount: practice.benefits?.length || 0,
				dependencyCount: directCount,
				directDependencyCount: directCount,
				totalDependencyCount: totalCount
			}
		})
	)

	// Return initial data for the page
	return {
		initialPractices: [rootCard, ...dependencyCards],
		rootId: 'continuous-delivery'
	}
}
