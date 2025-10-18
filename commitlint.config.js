/**
 * Commitlint Configuration
 *
 * Enforces Conventional Commits specification
 * https://www.conventionalcommits.org/
 *
 * Valid commit types:
 * - feat: A new feature
 * - fix: A bug fix
 * - docs: Documentation only changes
 * - style: Changes that don't affect code meaning (white-space, formatting, etc)
 * - refactor: Code change that neither fixes a bug nor adds a feature
 * - perf: Code change that improves performance
 * - test: Adding missing tests or correcting existing tests
 * - build: Changes that affect the build system or external dependencies
 * - ci: Changes to CI configuration files and scripts
 * - chore: Other changes that don't modify src or test files
 * - revert: Reverts a previous commit
 *
 * Format: <type>(<scope>): <subject>
 * Example: feat(api): add endpoint for practice dependencies
 */

export default {
	extends: ['@commitlint/config-conventional'],
	rules: {
		'type-enum': [
			2,
			'always',
			['feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'build', 'ci', 'chore', 'revert']
		],
		'subject-case': [2, 'never', ['upper-case', 'pascal-case']],
		'subject-empty': [2, 'never'],
		'subject-full-stop': [2, 'never', '.'],
		'type-case': [2, 'always', 'lower-case'],
		'type-empty': [2, 'never'],
		'scope-case': [2, 'always', 'lower-case']
	}
}
