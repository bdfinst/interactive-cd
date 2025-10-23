/**
 * Merge automated-build into application-pipeline
 *
 * Strategy:
 * 1. Enhance application-pipeline with best content from both practices
 * 2. Add build-automation as dependency of application-pipeline
 * 3. Update all references to automated-build to point to application-pipeline
 * 4. Remove automated-build practice
 */

import fs from 'fs'
import path from 'path'

const DATA_FILE = path.join(process.cwd(), 'src/lib/data/cd-practices.json')

// Read the data
const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'))

// Find the practices
const automatedBuild = data.practices.find(p => p.id === 'automated-build')
const applicationPipeline = data.practices.find(p => p.id === 'application-pipeline')

console.log('\n📊 Merging automated-build into application-pipeline...\n')

// Enhanced application-pipeline with merged content
const mergedPipeline = {
	...applicationPipeline,
	description:
		'Comprehensive automated pipeline that is the only path to production, integrating build, test, and deployment stages with quality gates.',
	requirements: [
		// From application-pipeline (strategic)
		'Only path to production',
		'Determines production readiness',
		'Visible to entire team',
		// From automated-build (technical build requirements)
		'CI/CD build pipeline configuration',
		'One-command build from any commit',
		'Repeatable builds with same inputs',
		'Fast execution with caching strategies',
		'Fail fast on errors with clear messages',
		'Parallel build stages where possible',
		// From application-pipeline (testing and deployment)
		'Automated testing stages',
		'Automated deployment capability'
	],
	benefits: [
		// Combined and deduplicated
		'Consistent deployment process',
		'Consistency across all builds',
		'Automated quality gates',
		'Reduced human error in build and deployment',
		'Fast feedback to developers',
		'Easy onboarding for new team members',
		'Build reproducibility and traceability'
	]
}

console.log('✅ Merged practice definition:')
console.log('   - Requirements:', mergedPipeline.requirements.length)
console.log('   - Benefits:', mergedPipeline.benefits.length)

// Update the practice in the array
const pipelineIndex = data.practices.findIndex(p => p.id === 'application-pipeline')
data.practices[pipelineIndex] = mergedPipeline

// Add build-automation as a dependency of application-pipeline
const hasBuildAutomationDep = data.dependencies.some(
	d => d.practice_id === 'application-pipeline' && d.depends_on_id === 'build-automation'
)

if (!hasBuildAutomationDep) {
	data.dependencies.push({
		practice_id: 'application-pipeline',
		depends_on_id: 'build-automation'
	})
	console.log('\n✅ Added build-automation as dependency of application-pipeline')
}

// Update all dependencies that reference automated-build
let updatedDeps = 0
data.dependencies = data.dependencies
	.map(dep => {
		if (dep.depends_on_id === 'automated-build') {
			updatedDeps++
			return {
				...dep,
				depends_on_id: 'application-pipeline'
			}
		}
		if (dep.practice_id === 'automated-build') {
			// Skip - these will be removed
			return null
		}
		return dep
	})
	.filter(d => d !== null)

console.log(`✅ Updated ${updatedDeps} dependency references`)

// Remove automated-build practice
const beforeCount = data.practices.length
data.practices = data.practices.filter(p => p.id !== 'automated-build')
const afterCount = data.practices.length

console.log(`✅ Removed automated-build practice (${beforeCount} → ${afterCount} practices)`)

// Write the updated data
fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2) + '\n', 'utf-8')

console.log('\n✅ Successfully merged automated-build into application-pipeline')
console.log(`📝 Updated ${DATA_FILE}`)
console.log('\nNext steps:')
console.log('  1. Review the changes in git diff')
console.log('  2. Run validation: npm run validate:data')
console.log('  3. Test in dev mode: npm run dev')
