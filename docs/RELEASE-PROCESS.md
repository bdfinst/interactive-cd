# Release Process

This document describes the automated release process for the Interactive CD project using [release-please](https://github.com/googleapis/release-please).

---

## Overview

The project uses **automated versioning and releases** based on [Conventional Commits](https://www.conventionalcommits.org/):

- **Main branch** (`main`) - Demo/development branch
- **Release branch** (`release`) - Production release branch
- **Versioning** - Automated via release-please based on commit messages
- **Changelog** - Auto-generated from conventional commits

---

## Branch Strategy

### Main Branch (Demo)

- **Purpose:** Continuous development and demo environment
- **Audience:** Developers, stakeholders viewing latest features
- **Deployment:** Auto-deploys to demo environment (Netlify preview)
- **Commits:** All development work merges here

### Release Branch (Production)

- **Purpose:** Production-ready releases
- **Audience:** End users, production environment
- **Deployment:** Auto-deploys to production on release creation
- **Commits:** Merged from `main` when ready for release

---

## How It Works

### 1. Conventional Commits

All commits to the `release` branch must follow [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

#### Commit Types

| Type       | Version Bump      | Description             | Example                              |
| ---------- | ----------------- | ----------------------- | ------------------------------------ |
| `feat`     | **Minor** (0.x.0) | New feature             | `feat: add dark mode toggle`         |
| `fix`      | **Patch** (0.0.x) | Bug fix                 | `fix: correct navigation bug`        |
| `perf`     | **Patch**         | Performance improvement | `perf: optimize database queries`    |
| `refactor` | **Patch**         | Code refactoring        | `refactor: extract validation logic` |
| `docs`     | **None**          | Documentation only      | `docs: update API guide`             |
| `test`     | **None**          | Test changes only       | `test: add E2E tests for login`      |
| `chore`    | **None**          | Maintenance tasks       | `chore: update dependencies`         |
| `ci`       | **None**          | CI/CD changes           | `ci: add release workflow`           |
| `build`    | **None**          | Build system changes    | `build: configure webpack`           |
| `style`    | **None**          | Code style changes      | `style: fix linting errors`          |

#### Breaking Changes

For **major version bumps** (x.0.0), include `BREAKING CHANGE:` in the footer:

```
feat: redesign navigation API

BREAKING CHANGE: Navigation component now requires `items` prop instead of `children`
```

---

## Release Workflow

### Step 1: Develop on Main Branch

```bash
# Create feature branch
git checkout -b feat/new-feature main

# Make changes with conventional commits
git commit -m "feat: add user profile page"

# Push and create PR to main
git push origin feat/new-feature
```

### Step 2: Merge to Main (Demo)

```bash
# After PR approval, merge to main
# This deploys to demo environment automatically
```

### Step 3: Prepare Release

When ready to release to production:

```bash
# Create PR from main to release
git checkout release
git pull origin release
git merge main
git push origin release
```

Or via GitHub UI:

1. Go to **Pull Requests** → **New Pull Request**
2. Base: `release` ← Compare: `main`
3. Title: `chore: prepare release vX.Y.Z`
4. Create and merge PR

### Step 4: Automated Release

When commits are pushed to `release` branch:

1. **release-please bot** analyzes conventional commits
2. **Opens/updates a Release PR** with:
   - Bumped version in `package.json`
   - Updated `CHANGELOG.md`
   - Proposed release notes
3. **Review the Release PR**
   - Check version bump is correct
   - Verify changelog entries
   - Review release notes
4. **Merge the Release PR**
   - Creates a GitHub Release
   - Tags the commit (e.g., `v1.4.0`)
   - Publishes to production

---

## Version Strategy

The project follows [Semantic Versioning](https://semver.org/) (SemVer):

```
MAJOR.MINOR.PATCH
```

### Current Version

**v1.3.1** (as of 2025-10-20)

- Database schema version: `1.3.1`
- Package.json version: `1.3.1`
- Aligned with database migrations

### Version Alignment

| Component        | Version | Notes                                 |
| ---------------- | ------- | ------------------------------------- |
| **Package.json** | 1.3.1   | Application version                   |
| **Database**     | 1.3.1   | Schema version in metadata table      |
| **Git Tag**      | v1.3.1  | Release tag created by release-please |

### Version History

- **v1.3.1** - Added unified-team-backlog → product-goals dependency
- **v1.3.0** - Added product-goals practice
- **v1.2.0** - Added 26 practices from CD diagram
- **v1.1.0** - Added deterministic-tests practice
- **v1.0.0** - Initial release

---

## Example: Creating a Release

### Scenario: Add New Feature and Release

```bash
# 1. Develop on feature branch
git checkout -b feat/export-functionality main
git commit -m "feat: add CSV export for practices"
git commit -m "test: add E2E tests for CSV export"
git push origin feat/export-functionality

# 2. Create PR to main, get approval, merge
# → Deploys to demo environment

# 3. When ready for production, merge main to release
git checkout release
git pull origin release
git merge main
git push origin release

# 4. release-please creates Release PR automatically
# → Review version bump (1.3.1 → 1.4.0 for feat)
# → Review CHANGELOG.md updates
# → Merge Release PR

# 5. Release created automatically
# → Git tag: v1.4.0
# → GitHub Release with notes
# → Production deployment triggered
```

---

## Changelog Management

The `CHANGELOG.md` is **automatically generated** by release-please based on conventional commits.

### Changelog Sections

- ✨ **Features** - `feat:` commits
- 🐛 **Bug Fixes** - `fix:` commits
- ⚡ **Performance Improvements** - `perf:` commits
- ♻️ **Code Refactoring** - `refactor:` commits
- 📝 **Documentation** - `docs:` commits
- ✅ **Tests** - `test:` commits

Hidden from changelog (but tracked):

- 🔧 Build System - `build:` commits
- 👷 CI/CD - `ci:` commits
- 🎨 Styles - `style:` commits
- 🔨 Chores - `chore:` commits

---

## Manual Release (Emergency)

If you need to create a release manually:

```bash
# 1. Update version in package.json
npm version patch  # or minor, major

# 2. Update CHANGELOG.md manually
# Add entry for new version

# 3. Commit and tag
git add package.json CHANGELOG.md
git commit -m "chore(release): v1.3.2"
git tag -a v1.3.2 -m "Release v1.3.2"

# 4. Push to release branch
git push origin release
git push origin v1.3.2

# 5. Create GitHub Release manually
# Go to Releases → Draft new release → Select tag → Publish
```

---

## Release Checklist

Before merging Release PR:

- [ ] Version bump is correct (major/minor/patch)
- [ ] CHANGELOG.md is accurate and complete
- [ ] Release notes describe changes clearly
- [ ] All tests pass in CI/CD
- [ ] Database migrations are included
- [ ] Documentation is updated
- [ ] Breaking changes are documented
- [ ] Migration guides provided (if breaking)

---

## Rollback Process

If a release needs to be rolled back:

### Option 1: Revert Release (Recommended)

```bash
# Create revert commit
git revert <release-commit-sha>

# Push to release branch
git push origin release

# release-please will create new patch release
```

### Option 2: Hotfix Release

```bash
# Create hotfix branch from previous release
git checkout -b hotfix/critical-fix v1.3.0

# Fix issue
git commit -m "fix: critical production bug"

# Merge to release
git checkout release
git merge hotfix/critical-fix
git push origin release

# release-please creates patch release (v1.3.1)
```

### Option 3: Manual Rollback (Emergency)

```bash
# Reset release branch to previous version
git checkout release
git reset --hard v1.3.0
git push --force origin release

# Update main branch
git checkout main
git merge release
git push origin main
```

**⚠️ Warning:** Force pushes should be avoided. Use revert commits when possible.

---

## Branch Protection Rules

### Main Branch

- ✅ Require pull request reviews (1 reviewer)
- ✅ Require status checks (tests, lint)
- ✅ Require conventional commits
- ✅ Require branches to be up to date
- ❌ Do NOT require signed commits (optional)

### Release Branch

- ✅ Require pull request reviews (2 reviewers)
- ✅ Require status checks (tests, lint, build)
- ✅ Require conventional commits
- ✅ Require branches to be up to date
- ✅ Require linear history
- ❌ Restrict force pushes
- ❌ Restrict deletions

---

## CI/CD Integration

### On Push to Main

```yaml
- Run unit tests
- Run E2E tests
- Build application
- Deploy to demo environment
```

### On Push to Release

```yaml
- release-please opens/updates Release PR
- Run all tests
- Build application
- Prepare deployment artifacts
```

### On Release PR Merge

```yaml
- Create GitHub Release
- Create Git tag
- Build production artifacts
- Deploy to production
- Update documentation site
```

---

## Configuration Files

### `.github/workflows/release-please.yml`

GitHub Action workflow that runs release-please on push to `release` branch.

### `release-please-config.json`

Configuration for release-please:

- Release type: `node`
- Changelog sections
- Version bump strategy
- Extra files to update (package.json)

### `.release-please-manifest.json`

Current version manifest:

```json
{
	".": "1.3.1"
}
```

### `package.json`

Version field updated automatically by release-please.

---

## Troubleshooting

### Release PR Not Created

**Problem:** Pushed to release branch but no Release PR appeared.

**Solutions:**

1. Check conventional commit format
2. Ensure commits have user-facing changes (`feat`, `fix`, etc.)
3. Check GitHub Actions logs for errors
4. Verify release-please workflow is enabled

### Version Not Bumping Correctly

**Problem:** Expected minor bump, got patch.

**Solutions:**

1. Use `feat:` prefix for features (minor bump)
2. Use `fix:` prefix for bug fixes (patch bump)
3. Add `BREAKING CHANGE:` footer for major bump
4. Check `.release-please-manifest.json` for overrides

### Changelog Missing Entries

**Problem:** Commits not appearing in changelog.

**Solutions:**

1. Use conventional commit format
2. Ensure commit type is not hidden (check `release-please-config.json`)
3. Squash commits may combine changelog entries
4. Check Release PR for generated changelog

---

## Best Practices

### ✅ DO

- ✅ Use conventional commits consistently
- ✅ Write clear, descriptive commit messages
- ✅ Review Release PRs carefully before merging
- ✅ Keep main and release branches in sync
- ✅ Test thoroughly before merging to release
- ✅ Document breaking changes clearly
- ✅ Align database version with package version

### ❌ DON'T

- ❌ Manually edit CHANGELOG.md (auto-generated)
- ❌ Force push to release branch
- ❌ Merge non-conventional commits to release
- ❌ Skip CI checks
- ❌ Release without testing
- ❌ Create releases directly without Release PR
- ❌ Bump versions manually in package.json

---

## Resources

- **Conventional Commits:** https://www.conventionalcommits.org/
- **Semantic Versioning:** https://semver.org/
- **release-please:** https://github.com/googleapis/release-please
- **GitHub Releases:** https://docs.github.com/en/repositories/releasing-projects-on-github

---

## Support

For questions or issues with the release process:

1. Check [Release Process Issues](https://github.com/bdfinst/interactive-cd/issues?q=label%3Arelease)
2. Review [release-please documentation](https://github.com/googleapis/release-please)
3. Consult the team in Slack/Discord

---

**Last Updated:** 2025-10-20
**Current Version:** 1.3.1
**Next Release:** TBD (automated based on commits)
