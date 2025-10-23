/**
 * Merge build-automation into application-pipeline (v2)
 *
 * Strategy:
 * 1. Enhance application-pipeline with build-automation content
 * 2. Remove application-pipeline's dependency on build-automation
 * 3. Transfer build-automation's dependencies to application-pipeline
 * 4. Update all practices that depended on build-automation to depend on application-pipeline
 * 5. Remove build-automation practice
 */

import fs from 'fs'
import path from 'path'

const DATA_FILE = path.join(process.cwd(), 'src/lib/data/cd-practices.json')

// Read the data
const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'))

console.log('\n📊 Merging build-automation into application-pipeline...\n')

// Find the practices
const buildAutomation = data.practices.find(p => p.id === 'build-automation')
const applicationPipeline = data.practices.find(p => p.id === 'application-pipeline')

console.log('Current application-pipeline:')
console.log(`  - Requirements: ${applicationPipeline.requirements.length}`)
console.log(`  - Benefits: ${applicationPipeline.benefits.length}`)

console.log('\nbuild-automation to merge:')
console.log(`  - Requirements: ${buildAutomation.requirements.length}`)
console.log(`  - Benefits: ${buildAutomation.benefits.length}`)

// Enhanced application-pipeline (already has automated-build content)
// Just ensure it has all the build-automation essentials
const enhancedPipeline = {
	...applicationPipeline,
	description:
		'Comprehensive automated pipeline that is the only path to production, integrating build, test, and deployment stages with quality gates. Encompasses complete build automation from code to deployable artifacts.',
	// Merge requirements (application-pipeline already has most of these from automated-build merge)
	requirements: [
		...new Set([
			...applicationPipeline.requirements
			// Don't add duplicates from build-automation as automated-build merge already covered them
		])
	],
	// Merge benefits
	benefits: [
		...new Set([
			...applicationPipeline.benefits
			// Don't add duplicates
		])
	]
}

console.log('\n✅ Enhanced application-pipeline definition')

// Update the practice in the array
const pipelineIndex = data.practices.findIndex(p => p.id === 'application-pipeline')
data.practices[pipelineIndex] = enhancedPipeline

// Get build-automation's dependencies
const buildAutomationDeps = data.dependencies.filter(d => d.practice_id === 'build-automation')

console.log(`\nbuild-automation depends on ${buildAutomationDeps.length} practices:`)
buildAutomationDeps.forEach(dep => console.log(`  - ${dep.depends_on_id}`))

// Find who depends on build-automation
const dependsOnBuildAutomation = data.dependencies.filter(
	d => d.depends_on_id === 'build-automation'
)

console.log(`\n${dependsOnBuildAutomation.length} practices depend on build-automation:`)
dependsOnBuildAutomation.forEach(dep => console.log(`  - ${dep.practice_id}`))

console.log('\n📝 Updating dependencies...')

let updatedCount = 0
let addedCount = 0
let removedCount = 0

// Remove all dependencies FROM build-automation and TO build-automation
data.dependencies = data.dependencies.filter(dep => {
	if (dep.practice_id === 'build-automation') {
		removedCount++
		return false
	}
	if (dep.depends_on_id === 'build-automation') {
		removedCount++
		return false
	}
	return true
})

console.log(`  ✅ Removed ${removedCount} build-automation dependencies`)

// Add build-automation's dependencies to application-pipeline (if not already present)
buildAutomationDeps.forEach(dep => {
	const alreadyExists = data.dependencies.some(
		d => d.practice_id === 'application-pipeline' && d.depends_on_id === dep.depends_on_id
	)

	if (!alreadyExists) {
		data.dependencies.push({
			practice_id: 'application-pipeline',
			depends_on_id: dep.depends_on_id
		})
		addedCount++
		console.log(`  ✅ Added ${dep.depends_on_id} as dependency of application-pipeline`)
	} else {
		console.log(`  ℹ️  application-pipeline already depends on ${dep.depends_on_id}`)
	}
})

// Update all practices that depended on build-automation to depend on application-pipeline
dependsOnBuildAutomation.forEach(dep => {
	// Skip if it was application-pipeline depending on build-automation
	if (dep.practice_id === 'application-pipeline') {
		console.log(`  ℹ️  Skipped application-pipeline self-dependency`)
		return
	}

	const alreadyExists = data.dependencies.some(
		d => d.practice_id === dep.practice_id && d.depends_on_id === 'application-pipeline'
	)

	if (!alreadyExists) {
		data.dependencies.push({
			practice_id: dep.practice_id,
			depends_on_id: 'application-pipeline'
		})
		updatedCount++
		console.log(`  ✅ ${dep.practice_id} now depends on application-pipeline`)
	} else {
		console.log(`  ℹ️  ${dep.practice_id} already depends on application-pipeline`)
	}
})

// Remove build-automation practice
const beforeCount = data.practices.length
data.practices = data.practices.filter(p => p.id !== 'build-automation')
const afterCount = data.practices.length

console.log(`\n✅ Removed build-automation practice (${beforeCount} → ${afterCount} practices)`)

// Write the updated data
fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2) + '\n', 'utf-8')

console.log('\n✅ Successfully merged build-automation into application-pipeline')
console.log(`📝 Updated ${DATA_FILE}`)

console.log('\n📋 Summary:')
console.log(`  • Practices updated to depend on application-pipeline: ${updatedCount}`)
console.log(`  • Dependencies inherited by application-pipeline: ${addedCount}`)
console.log(`  • Old dependencies removed: ${removedCount}`)
console.log(`  • Total practices: ${afterCount}`)

console.log('\nNext steps:')
console.log('  1. Review the changes: git diff src/lib/data/cd-practices.json')
console.log('  2. Run validation: npm run validate:data')
console.log('  3. Run tests: npm test && npm run test:e2e')
