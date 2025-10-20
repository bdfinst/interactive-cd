# Branch Strategy & Protection Rules

This document describes the branching strategy and GitHub branch protection rules for the Interactive CD project.

---

## Branch Overview

| Branch        | Purpose             | Deployment         | Auto-Deploy         | Protection |
| ------------- | ------------------- | ------------------ | ------------------- | ---------- |
| **main**      | Demo/Development    | Netlify Preview    | ✅ Yes              | Medium     |
| **release**   | Production          | Netlify Production | ✅ Yes (on release) | High       |
| **feat/\***   | Feature development | None               | ❌ No               | None       |
| **fix/\***    | Bug fixes           | None               | ❌ No               | None       |
| **hotfix/\*** | Production hotfixes | None               | ❌ No               | None       |

---

## Branch Workflow

```
feat/new-feature ──┐
                   ├─→ main (demo) ──→ release (production)
fix/bug-fix ───────┘
```

### Development Flow

1. **Create feature branch** from `main`

   ```bash
   git checkout -b feat/new-feature main
   ```

2. **Make changes** with conventional commits

   ```bash
   git commit -m "feat: add user profile page"
   ```

3. **Push and create PR** to `main`

   ```bash
   git push origin feat/new-feature
   ```

4. **Merge to main** after approval
   - Demo environment auto-deploys
   - Available for stakeholder review

5. **Release to production** when ready
   - Create PR from `main` to `release`
   - Merge after review
   - release-please creates Release PR
   - Merge Release PR → Production deployment

---

## Branch Protection Rules

### Main Branch (Demo)

**Settings:**

- ✅ Require pull request before merging
  - Required reviewers: 1
  - Dismiss stale reviews: ✅ Yes
  - Require review from Code Owners: ❌ No (optional)
- ✅ Require status checks to pass
  - Build and test (CI)
  - Lint checks
  - Unit tests
  - Integration tests
- ✅ Require conversation resolution before merging
- ✅ Require branches to be up to date before merging
- ✅ Require linear history (squash or rebase)
- ❌ Do not allow force pushes
- ❌ Do not allow deletions

**Rationale:**

- Demo branch should be stable enough for stakeholder review
- Single reviewer sufficient for faster iteration
- All checks must pass to maintain quality

### Release Branch (Production)

**Settings:**

- ✅ Require pull request before merging
  - Required reviewers: 2
  - Dismiss stale reviews: ✅ Yes
  - Require review from Code Owners: ✅ Yes (if configured)
- ✅ Require status checks to pass
  - Build and test (CI)
  - Lint checks
  - Unit tests
  - Integration tests
  - E2E tests
  - Database migrations check
- ✅ Require conversation resolution before merging
- ✅ Require branches to be up to date before merging
- ✅ Require linear history
- ✅ Require signed commits (optional, recommended)
- ❌ Do not allow force pushes
- ❌ Do not allow deletions
- ✅ Restrict who can push to this branch
  - Allow: Maintainers only
- ✅ Require deployments to succeed before merging (optional)

**Rationale:**

- Production branch requires higher scrutiny
- Two reviewers reduce risk of production issues
- All tests must pass including E2E
- Restricted push access prevents accidents

---

## Setting Up Branch Protection

### Via GitHub UI

1. **Navigate to repository settings**
   - Go to: `https://github.com/bdfinst/interactive-cd/settings/branches`

2. **Add rule for main branch**
   - Branch name pattern: `main`
   - Configure settings as documented above
   - Click "Create" or "Save changes"

3. **Add rule for release branch**
   - Branch name pattern: `release`
   - Configure settings as documented above
   - Click "Create" or "Save changes"

### Via GitHub CLI

```bash
# Install GitHub CLI if not already installed
# brew install gh

# Set up main branch protection
gh api repos/bdfinst/interactive-cd/branches/main/protection \
  -X PUT \
  -F required_pull_request_reviews='{"required_approving_review_count":1,"dismiss_stale_reviews":true}' \
  -F required_status_checks='{"strict":true,"contexts":["test"]}' \
  -F enforce_admins=false \
  -F restrictions=null

# Set up release branch protection
gh api repos/bdfinst/interactive-cd/branches/release/protection \
  -X PUT \
  -F required_pull_request_reviews='{"required_approving_review_count":2,"dismiss_stale_reviews":true}' \
  -F required_status_checks='{"strict":true,"contexts":["test","build"]}' \
  -F enforce_admins=false \
  -F restrictions=null
```

---

## Creating the Release Branch

If the `release` branch doesn't exist yet:

```bash
# 1. Ensure you're on main and up to date
git checkout main
git pull origin main

# 2. Create release branch from main
git checkout -b release

# 3. Push release branch to GitHub
git push -u origin release

# 4. Set up branch protection (see above)

# 5. Configure as default branch for releases
# GitHub Settings → Branches → Default branch (keep as main)
# release-please will target release branch automatically
```

---

## Branch Naming Conventions

### Feature Branches

```
feat/<short-description>
```

Examples:

- `feat/user-profile`
- `feat/csv-export`
- `feat/dark-mode`

### Bug Fix Branches

```
fix/<issue-number>-<short-description>
```

Examples:

- `fix/123-navigation-bug`
- `fix/login-error`
- `fix/database-connection`

### Hotfix Branches

```
hotfix/<version>-<short-description>
```

Examples:

- `hotfix/1.3.2-critical-security`
- `hotfix/1.4.1-database-migration`

### Documentation Branches

```
docs/<short-description>
```

Examples:

- `docs/api-guide`
- `docs/setup-instructions`

### Chore Branches

```
chore/<short-description>
```

Examples:

- `chore/update-dependencies`
- `chore/cleanup-tests`

---

## Commit Message Convention

All commits must follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, semicolons)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `build`: Build system changes
- `ci`: CI/CD changes
- `chore`: Other changes (dependencies, tooling)

### Examples

```bash
# Feature
git commit -m "feat: add user profile page"

# Bug fix
git commit -m "fix: resolve navigation menu bug"

# Breaking change
git commit -m "feat!: redesign API endpoints

BREAKING CHANGE: API endpoints now use /v2/ prefix"

# Scoped commit
git commit -m "feat(auth): add OAuth2 support"
```

---

## Pull Request Process

### Creating a PR

1. **Create feature branch**

   ```bash
   git checkout -b feat/new-feature main
   ```

2. **Make changes with conventional commits**

   ```bash
   git add .
   git commit -m "feat: implement new feature"
   ```

3. **Push to GitHub**

   ```bash
   git push origin feat/new-feature
   ```

4. **Open PR on GitHub**
   - Base: `main`
   - Compare: `feat/new-feature`
   - Title: Same as commit message (conventional format)
   - Description: What, why, how, testing notes

### PR Template (Optional)

Create `.github/PULL_REQUEST_TEMPLATE.md`:

```markdown
## Description

<!-- Describe what this PR does and why -->

## Type of Change

- [ ] feat: New feature
- [ ] fix: Bug fix
- [ ] docs: Documentation update
- [ ] refactor: Code refactoring
- [ ] test: Test updates
- [ ] chore: Other changes

## Testing

<!-- How was this tested? -->

- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] E2E tests added/updated
- [ ] Manual testing completed

## Checklist

- [ ] Code follows project style guidelines
- [ ] Tests pass locally
- [ ] Conventional commit format used
- [ ] Documentation updated (if needed)
- [ ] No breaking changes (or documented)

## Screenshots (if applicable)

<!-- Add screenshots for UI changes -->
```

### Reviewing PRs

**Reviewer Checklist:**

- [ ] Code quality
  - [ ] Follows functional programming principles
  - [ ] Pure functions with no side effects
  - [ ] Immutability maintained
  - [ ] No classes (functional approach)
- [ ] Tests
  - [ ] Behavior-focused tests (not implementation)
  - [ ] Coverage meets targets
  - [ ] Tests pass in CI
- [ ] Commits
  - [ ] Conventional commit format
  - [ ] Clear, descriptive messages
  - [ ] Atomic commits
- [ ] Documentation
  - [ ] Code comments explain "why"
  - [ ] README updated if needed
  - [ ] Feature files aligned with code
- [ ] Security
  - [ ] No secrets in code
  - [ ] Input validation present
  - [ ] Security best practices followed

---

## Handling Conflicts

### Main Branch Conflicts

```bash
# Update your feature branch with main
git checkout feat/your-feature
git fetch origin
git rebase origin/main

# Resolve conflicts
# Edit conflicting files
git add .
git rebase --continue

# Force push (your feature branch only!)
git push --force-with-lease origin feat/your-feature
```

### Release Branch Conflicts

```bash
# Sync release with main
git checkout release
git fetch origin
git merge origin/main

# Resolve conflicts
# Edit conflicting files
git add .
git commit -m "chore: merge main into release"

# Push to release
git push origin release
```

---

## Emergency Procedures

### Hotfix to Production

```bash
# 1. Create hotfix branch from release
git checkout -b hotfix/1.3.2-critical-fix release

# 2. Make fix with conventional commit
git commit -m "fix: critical security vulnerability"

# 3. Create PR to release
git push origin hotfix/1.3.2-critical-fix

# 4. Fast-track review and merge
# 5. release-please creates patch release automatically

# 6. Backport to main
git checkout main
git merge release
git push origin main
```

### Rollback Production

See [Release Process - Rollback](./RELEASE-PROCESS.md#rollback-process)

---

## Troubleshooting

### "Branch protection prevents push"

**Solution:** Create a pull request instead of pushing directly.

### "Required status checks must pass"

**Solution:** Fix failing tests/lints before merging.

### "Pull request review required"

**Solution:** Request review from team member(s).

### "Branch is out of date"

**Solution:** Update your branch with latest changes:

```bash
git pull origin main --rebase
git push --force-with-lease
```

---

## Best Practices

### ✅ DO

- ✅ Create feature branches from `main`
- ✅ Use conventional commit format
- ✅ Keep branches short-lived (hours to days)
- ✅ Merge `main` to `release` when ready
- ✅ Delete feature branches after merge
- ✅ Write clear PR descriptions
- ✅ Request reviews early
- ✅ Respond to review comments promptly

### ❌ DON'T

- ❌ Commit directly to `main` or `release`
- ❌ Force push to protected branches
- ❌ Merge without required reviews
- ❌ Skip CI checks
- ❌ Leave feature branches open too long
- ❌ Merge broken code
- ❌ Ignore branch protection rules

---

## Related Documentation

- [Release Process](./RELEASE-PROCESS.md) - Automated release workflow
- [Contributing Guide](./CONTRIBUTING.md) - How to contribute
- [Development Guide](../CLAUDE.md) - BDD/ATDD/TDD workflow

---

**Last Updated:** 2025-10-20
**Branch Strategy:** main (demo) → release (production)
**Protection Level:** Medium (main), High (release)
