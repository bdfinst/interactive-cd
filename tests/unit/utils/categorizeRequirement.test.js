import { describe, it, expect } from 'vitest'
import { categorizeRequirement } from '$lib/utils/categorizeRequirement.js'

describe('categorizeRequirement', () => {
	describe('tooling detection', () => {
		it('categorizes pipeline requirements', () => {
			expect(categorizeRequirement('Pipeline determines production readiness')).toContain('tooling')
			expect(categorizeRequirement('Create immutable artifacts')).toContain('tooling')
		})

		it('categorizes artifact requirements', () => {
			expect(categorizeRequirement('Deploy application configuration with artifact')).toContain(
				'tooling'
			)
		})

		it('categorizes deployment requirements', () => {
			expect(categorizeRequirement('Enable on-demand rollback')).toContain('tooling')
		})

		it('categorizes automation requirements', () => {
			expect(categorizeRequirement('Automated deployment system')).toContain('tooling')
			expect(categorizeRequirement('Infrastructure as code')).toContain('tooling')
		})
	})

	describe('behavior detection', () => {
		it('categorizes action-based requirements', () => {
			const result = categorizeRequirement('Test before committing code')
			expect(result).toContain('behavior')
			// Also contains tooling because of "test"
		})

		it('categorizes monitoring requirements', () => {
			expect(categorizeRequirement('Monitor production metrics daily')).toContain('behavior')
			expect(categorizeRequirement('Measure deployment frequency')).toContain('behavior')
		})

		it('categorizes validation requirements', () => {
			expect(categorizeRequirement('Validate changes in staging')).toContain('behavior')
		})

		it('categorizes merge requirements', () => {
			expect(categorizeRequirement('Merge to main daily')).toContain('behavior')
		})

		it('categorizes release requirements', () => {
			expect(categorizeRequirement('Release frequently to production')).toContain('behavior')
		})
	})

	describe('culture detection', () => {
		it('categorizes team requirements', () => {
			expect(categorizeRequirement('Team owns their deployment process')).toContain('culture')
			expect(categorizeRequirement('Cross-functional teams collaborate daily')).toContain('culture')
		})

		it('categorizes ownership requirements', () => {
			expect(categorizeRequirement('Developers have ownership of production')).toContain('culture')
		})

		it('categorizes collaboration requirements', () => {
			expect(categorizeRequirement('Collaborate across teams')).toContain('culture')
		})

		it('categorizes trust requirements', () => {
			expect(categorizeRequirement('Build trust through transparency')).toContain('culture')
		})

		it('categorizes organizational requirements', () => {
			expect(categorizeRequirement('Organization values continuous improvement')).toContain(
				'culture'
			)
		})

		it('categorizes shared responsibility', () => {
			expect(categorizeRequirement('Shared responsibility for quality')).toContain('culture')
		})
	})

	describe('comprehensive practices', () => {
		it('identifies all three dimensions for Continuous Integration', () => {
			const result = categorizeRequirement('Use Continuous Integration')
			expect(result).toContain('culture')
			expect(result).toContain('tooling')
			expect(result).toContain('behavior')
			expect(result).toHaveLength(3)
		})

		it('identifies all three dimensions for Trunk-based Development', () => {
			const result = categorizeRequirement('Use Trunk-based Development')
			expect(result).toContain('culture')
			expect(result).toContain('tooling')
			expect(result).toContain('behavior')
			expect(result).toHaveLength(3)
		})
	})

	describe('multi-category requirements', () => {
		it('identifies tooling + behavior for pipeline behavior requirements', () => {
			const result = categorizeRequirement('Application pipeline is the only path to production')
			expect(result).toContain('tooling')
			expect(result).toContain('behavior')
			expect(result).toHaveLength(2)
		})

		it('identifies tooling + behavior for pipeline failures', () => {
			const result = categorizeRequirement('Stop feature work when pipeline fails')
			expect(result).toContain('tooling')
			expect(result).toContain('behavior')
			expect(result).toHaveLength(2)
		})

		it('identifies tooling + behavior for environment maintenance', () => {
			const result = categorizeRequirement('Maintain production-like test environment')
			expect(result).toContain('tooling')
			expect(result).toContain('behavior')
			expect(result).toHaveLength(2)
		})

		it('identifies culture + tooling + behavior for team-based technical practices', () => {
			const result = categorizeRequirement('Team maintains automated deployment pipeline')
			expect(result).toContain('culture')
			expect(result).toContain('tooling')
			expect(result).toContain('behavior')
			expect(result).toHaveLength(3)
		})

		it('identifies culture + behavior for team practices', () => {
			const result = categorizeRequirement('Team must review pull requests daily')
			expect(result).toContain('culture')
			expect(result).toContain('behavior')
			expect(result.length).toBeGreaterThanOrEqual(2)
		})
	})

	describe('edge cases', () => {
		it('handles empty string', () => {
			expect(categorizeRequirement('')).toEqual(['behavior'])
		})

		it('handles generic requirements as behavior by default', () => {
			expect(categorizeRequirement('Do the thing')).toEqual(['behavior'])
			expect(categorizeRequirement('Follow best practices')).toContain('behavior')
		})

		it('handles case-insensitive matching', () => {
			expect(categorizeRequirement('PIPELINE must be automated')).toContain('tooling')
			expect(categorizeRequirement('Team Must Collaborate')).toContain('culture')
		})
	})
})
