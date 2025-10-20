# Commit Message Conventions

This project uses **[Conventional Commits](https://www.conventionalcommits.org/)** format to ensure consistent, semantic commit messages that work with automated release tools like release-please.

## Quick Reference

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

## Commit Types

| Type       | Description             | Version Bump  |
| ---------- | ----------------------- | ------------- |
| `feat`     | New feature             | Minor (0.x.0) |
| `fix`      | Bug fix                 | Patch (0.0.x) |
| `perf`     | Performance improvement | Patch (0.0.x) |
| `docs`     | Documentation only      | None          |
| `style`    | Code style/formatting   | None          |
| `refactor` | Code restructuring      | None          |
| `test`     | Adding/updating tests   | None          |
| `build`    | Build system changes    | None          |
| `ci`       | CI/CD changes           | None          |
| `chore`    | Maintenance tasks       | None          |
| `revert`   | Revert previous commit  | None          |

## Examples

### Simple Commits

```bash
feat: add user authentication
fix: resolve navigation bug in tree view
docs: update README with installation steps
perf: optimize database queries
```

### With Scope

```bash
feat(auth): add OAuth2 support
fix(api): handle null response in user endpoint
docs(readme): add troubleshooting section
perf(query): cache practice tree results
```

### With Body

```bash
feat: migrate to file-based architecture

Replace PostgreSQL database with JSON file storage for improved
performance and simplified deployment. This reduces initial page
load time by 50% and eliminates database hosting costs.
```

### Breaking Changes

**Method 1:** Add `!` after type

```bash
feat!: redesign API endpoints

BREAKING CHANGE: All API endpoints now require authentication.
Update your API calls to include authentication headers.
```

**Method 2:** Add footer

```bash
feat: redesign API endpoints

BREAKING CHANGE: All API endpoints now require authentication.
Update your API calls to include authentication headers.
```

## Git Hooks

This project uses [Husky](https://typicode.github.io/husky/) to enforce commit message format:

### 1. `prepare-commit-msg` Hook

Provides a helpful template when creating commits:

```bash
git commit
# Opens editor with template showing commit format and examples
```

### 2. `commit-msg` Hook

Validates commit messages before they're saved:

```bash
git commit -m "Invalid message"
# ✖ subject may not be empty [subject-empty]
# ✖ type may not be empty [type-empty]
```

### 3. `pre-commit` Hook

Runs linting and tests before commits:

```bash
git commit
# → lint-staged (runs ESLint and Prettier on staged files)
# → npm test (runs all tests)
```

## Rules

### Required

- ✅ Type must be one of the allowed types
- ✅ Subject must not be empty
- ✅ Type and scope must be lowercase
- ✅ Subject must not end with a period

### Recommended

- ✅ Use imperative mood ("add" not "adds" or "added")
- ✅ Keep header under 100 characters
- ✅ Add blank line before body
- ✅ Add blank line before footer

## Testing Your Commit Message

Before committing, you can test if your message is valid:

```bash
# Test a message
echo "feat: add new feature" | npx commitlint

# Get help with commit format
npm run commit
```

## Common Mistakes

### ❌ Missing Type

```bash
# Bad
git commit -m "add new feature"

# Good
git commit -m "feat: add new feature"
```

### ❌ Uppercase Type

```bash
# Bad
git commit -m "FEAT: add new feature"

# Good
git commit -m "feat: add new feature"
```

### ❌ Period at End

```bash
# Bad
git commit -m "feat: add new feature."

# Good
git commit -m "feat: add new feature"
```

### ❌ Past Tense

```bash
# Bad
git commit -m "feat: added new feature"

# Good
git commit -m "feat: add new feature"
```

## Why Conventional Commits?

1. **Automated versioning** - release-please can determine version bumps
2. **Automated changelogs** - Generate changelogs from commit history
3. **Better navigation** - Search commits by type (all features, all fixes, etc.)
4. **Clear communication** - Everyone understands commit purpose at a glance
5. **Professional standard** - Industry-standard format

## Configuration Files

- `commitlint.config.js` - Commitlint rules and configuration
- `.husky/commit-msg` - Hook that validates commit messages
- `.husky/prepare-commit-msg` - Hook that provides commit template
- `.husky/pre-commit` - Hook that runs linting and tests

## Resources

- [Conventional Commits Specification](https://www.conventionalcommits.org/)
- [Commitlint Documentation](https://commitlint.js.org/)
- [Angular Commit Guidelines](https://github.com/angular/angular/blob/main/CONTRIBUTING.md#-commit-message-format)
- [Semantic Versioning](https://semver.org/)

## Need Help?

Run `npm run commit` to see the commit format help, or check `.husky/prepare-commit-msg` for the template that appears when you run `git commit`.
