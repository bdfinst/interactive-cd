/**
 * Commitlint Configuration
 *
 * Enforces Conventional Commits format:
 * <type>[optional scope]: <description>
 *
 * Valid types:
 * - feat: New feature (minor version bump)
 * - fix: Bug fix (patch version bump)
 * - docs: Documentation changes
 * - style: Code style changes (formatting, no logic change)
 * - refactor: Code refactoring
 * - perf: Performance improvements
 * - test: Adding or updating tests
 * - build: Build system changes
 * - ci: CI/CD changes
 * - chore: Other changes (dependencies, config, etc.)
 * - revert: Revert a previous commit
 *
 * Breaking changes:
 * - Add "!" after type: feat!: breaking change
 * - Or add "BREAKING CHANGE:" in footer
 */
export default {
	extends: ['@commitlint/config-conventional'],

	rules: {
		// Enforce lowercase type
		'type-case': [2, 'always', 'lower-case'],

		// Enforce type is required
		'type-empty': [2, 'never'],

		// Allowed types
		'type-enum': [
			2,
			'always',
			[
				'feat', // New feature
				'fix', // Bug fix
				'docs', // Documentation
				'style', // Formatting
				'refactor', // Code restructuring
				'perf', // Performance
				'test', // Tests
				'build', // Build system
				'ci', // CI/CD
				'chore', // Maintenance
				'revert' // Revert commit
			]
		],

		// Subject must not be empty
		'subject-empty': [2, 'never'],

		// Subject must be lowercase or sentence-case
		'subject-case': [2, 'never', ['start-case', 'pascal-case', 'upper-case']],

		// Subject must not end with period
		'subject-full-stop': [2, 'never', '.'],

		// Header (type + subject) max length
		'header-max-length': [2, 'always', 100],

		// Body should have blank line before it
		'body-leading-blank': [1, 'always'],

		// Footer should have blank line before it
		'footer-leading-blank': [1, 'always'],

		// Scope must be lowercase
		'scope-case': [2, 'always', 'lower-case']
	}
}
