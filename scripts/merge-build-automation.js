/**
 * Merge build-automation into application-pipeline
 *
 * Strategy:
 * 1. Application-pipeline already has build-automation content (from automated-build merge)
 * 2. Update all practices that depend on build-automation to depend on application-pipeline
 * 3. Transfer build-automation's dependencies (version-control, dependency-management) to application-pipeline
 * 4. Remove build-automation practice
 */

import fs from 'fs'
import path from 'path'

const DATA_FILE = path.join(process.cwd(), 'src/lib/data/cd-practices.json')

// Read the data
const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'))

console.log('\n📊 Merging build-automation into application-pipeline...\n')

// Find who depends on build-automation
const dependsOnBuildAutomation = data.dependencies.filter(
	d => d.depends_on_id === 'build-automation' && d.practice_id !== 'application-pipeline'
)

console.log(`Found ${dependsOnBuildAutomation.length} practices that depend on build-automation:`)
dependsOnBuildAutomation.forEach(dep => console.log(`  - ${dep.practice_id}`))

// Find what build-automation depends on
const buildAutomationDeps = data.dependencies.filter(d => d.practice_id === 'build-automation')

console.log(`\nbuild-automation depends on ${buildAutomationDeps.length} practices:`)
buildAutomationDeps.forEach(dep => console.log(`  - ${dep.depends_on_id}`))

// Update dependencies
console.log('\n📝 Updating dependencies...')

let updatedCount = 0
let addedCount = 0

// Update all dependencies to point to application-pipeline instead of build-automation
data.dependencies = data.dependencies
	.map(dep => {
		// Skip build-automation's own dependencies - we'll handle these separately
		if (dep.practice_id === 'build-automation') {
			return null
		}

		// Update dependencies on build-automation to point to application-pipeline
		if (dep.depends_on_id === 'build-automation') {
			updatedCount++
			return {
				...dep,
				depends_on_id: 'application-pipeline'
			}
		}

		return dep
	})
	.filter(d => d !== null)

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

console.log(`\n✅ Updated ${updatedCount} dependency references`)
console.log(`✅ Added ${addedCount} new dependencies to application-pipeline`)

// Remove build-automation practice
const beforeCount = data.practices.length
data.practices = data.practices.filter(p => p.id !== 'build-automation')
const afterCount = data.practices.length

console.log(`✅ Removed build-automation practice (${beforeCount} → ${afterCount} practices)`)

// Write the updated data
fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2) + '\n', 'utf-8')

console.log('\n✅ Successfully merged build-automation into application-pipeline')
console.log(`📝 Updated ${DATA_FILE}`)

console.log('\n📋 Summary:')
console.log(`  • Practices updated to depend on application-pipeline: ${updatedCount}`)
console.log(`  • Dependencies inherited by application-pipeline: ${buildAutomationDeps.length}`)
console.log(`  • Total practices: ${afterCount}`)

console.log('\nNext steps:')
console.log('  1. Review the changes in git diff')
console.log('  2. Run validation: npm run validate:data')
console.log('  3. Run tests: npm test && npm run test:e2e')
console.log('  4. Test in dev mode: npm run dev')
