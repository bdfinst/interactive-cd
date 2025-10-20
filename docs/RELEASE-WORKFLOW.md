# Release Workflow

**Strategy:** main (demo) → auto PR to release (production)  
**Automation:** release-please monitors main, creates PR to release

---

## Workflow Overview

```
Feature Branch → main (demo) → release-please → PR (main→release) → merge → release (production)
                   ↓              ↓                  ↓                ↓
               Auto-deploy    Analyzes          Version bump     GitHub Release
               to preview     commits           + CHANGELOG       + deployment
```

---

## How It Works

### 1. Develop Features on Main Branch

**Purpose:** `main` is the demo/development branch

```bash
# Create feature branch
git checkout -b feat/new-feature main

# Make changes with conventional commits
git commit -m "feat: add user dashboard"

# Push and create PR to main
git push origin feat/new-feature

# After approval, merge to main
# ✅ Demo environment deploys automatically
# ✅ release-please analyzes the new commits
```

### 2. release-please Automatically Creates PR (main → release)

**What happens automatically when you merge to main:**

1. **release-please triggers** (monitors main branch)
2. **Analyzes commits** since last release
3. **Determines version bump** based on conventional commits
4. **Creates a PR** from main to release branch with:
   - Updated version in package.json
   - Updated CHANGELOG.md with new entries
   - Updated .release-please-manifest.json
   - Title: `chore(main): release <version>`

**Example PR created by release-please:**

```
Title: chore(main): release 0.6.0

Base: release ← Head: main

Files changed:
- package.json: 0.5.1 → 0.6.0
- CHANGELOG.md: Added Features section
- .release-please-manifest.json: Updated version

Commits included:
- feat: add user dashboard
- fix: resolve navigation bug
- perf: optimize tree rendering
```

### 3. Review the Release PR

**Your job:** Review the automatically created PR

**Check:**

- ✅ Version bump is correct (feat → minor, fix → patch)
- ✅ CHANGELOG includes all changes
- ✅ All commits are accounted for
- ✅ Tests pass in CI
- ✅ No unexpected changes

### 4. Merge the Release PR

**When you merge the PR (main → release):**

1. ✅ `release` branch gets updated with new version
2. ✅ GitHub Release is created (e.g., v0.6.0)
3. ✅ Git tag is pushed (e.g., v0.6.0)
4. ✅ Production deployment triggers (if configured)

---

## Complete Example

### Scenario: Adding CSV Export Feature

**Step 1: Develop Feature**

```bash
git checkout -b feat/csv-export main
git commit -m "feat: add CSV export for practice data"
git commit -m "test: add CSV export tests"
git push origin feat/csv-export
```

**Step 2: Create PR and Merge to Main**

```bash
# Create PR: feat/csv-export → main
# Get approval, merge PR
# ✅ Demo deploys with new feature
```

**Step 3: release-please Automatically Creates PR**

Within seconds of merging to main, release-please:

```
✅ Analyzes: "feat: add CSV export..."
✅ Determines: Minor version bump (0.5.1 → 0.6.0)
✅ Creates PR: main → release

PR Details:
Title: chore(main): release 0.6.0
Base: release ← Head: main

Changes:
- package.json: version 0.6.0
- CHANGELOG.md:
  ## [0.6.0] - 2025-10-20
  ### Features
  - add CSV export for practice data
  ### Tests
  - add CSV export tests
```

**Step 4: Review and Merge Release PR**

```bash
# Go to GitHub
# Review the PR created by release-please
# Merge the PR (main → release)

# Automatically happens:
# ✅ release branch updated to 0.6.0
# ✅ GitHub Release v0.6.0 created
# ✅ Tag v0.6.0 pushed
# ✅ Production deploys
```

---

## Version Bumping Rules

release-please determines version bumps based on conventional commits:

| Commit Type                         | Version Bump         | Example         |
| ----------------------------------- | -------------------- | --------------- |
| `feat:`                             | **Minor** (0.X.0)    | 0.5.1 → 0.6.0   |
| `fix:`                              | **Patch** (0.0.X)    | 0.5.1 → 0.5.2   |
| `perf:`                             | **Patch** (0.0.X)    | 0.5.1 → 0.5.2   |
| `feat!:` or `BREAKING CHANGE:`      | **Major** (X.0.0)    | 0.5.1 → 1.0.0   |
| `docs:`, `test:`, `refactor:`       | Patch (in changelog) | 0.5.1 → 0.5.2   |
| `chore:`, `ci:`, `build:`, `style:` | None (hidden)        | No version bump |

---

## Hotfix Process

For urgent production fixes:

**Option 1: Via Main (Recommended)**

```bash
# 1. Create hotfix branch from main
git checkout -b hotfix/critical-bug main

# 2. Fix the bug
git commit -m "fix: resolve critical payment processing bug"

# 3. Create PR: hotfix → main
git push origin hotfix/critical-bug

# 4. Merge to main
# ✅ release-please creates patch release PR (0.6.0 → 0.6.1)

# 5. Merge the Release PR
# ✅ v0.6.1 released to production
```

**Option 2: Direct to Release (Emergency Only)**

```bash
# 1. Create hotfix branch from release
git checkout -b hotfix/critical-bug release

# 2. Fix the bug
git commit -m "fix: critical security issue"

# 3. Push and merge directly to release
git push origin hotfix/critical-bug
# Create PR: hotfix → release
# Merge (bypassing main)

# 4. Backport to main
git checkout main
git cherry-pick <commit-sha>
git push origin main
```

---

## Key Configuration

### Workflow Trigger

```yaml
# .github/workflows/release-please.yml
on:
  push:
    branches:
      - main # Triggers when you merge to main
```

### Target Branch

```yaml
# .github/workflows/release-please.yml
- uses: googleapis/release-please-action@v4
  with:
    token: ${{ secrets.GITHUB_TOKEN }}
    target-branch: release # Creates PR targeting release branch
```

---

## Troubleshooting

### PR Not Created After Merging to Main

**Problem:** Merged to main, but no PR appeared from main to release

**Solutions:**

1. **Check GitHub Actions tab:**
   - Go to Actions → Release Please workflow
   - Look for errors or failures

2. **Verify commit format:**

   ```bash
   # Check your commit messages follow conventional format
   git log --oneline -5

   # Should see: feat:, fix:, etc.
   # Not: "add feature", "bug fix"
   ```

3. **Check if PR already exists:**
   - Look for existing PR from main to release
   - release-please updates existing PR instead of creating new ones

4. **Manually trigger workflow:**
   ```bash
   # Push an empty commit to main
   git commit --allow-empty -m "chore: trigger release-please"
   git push origin main
   ```

### Wrong Version Bump

**Problem:** Expected minor bump (feat), got patch

**Solution:** Verify commit message format:

```bash
# Wrong
git commit -m "add new feature"  # Missing type

# Right
git commit -m "feat: add new feature"
```

### Multiple Release PRs Open

**Problem:** Several release PRs exist

**Solution:**

1. Close old/stale PRs
2. Push to main again
3. release-please creates fresh PR

### Release PR Conflicts

**Problem:** PR from main to release has merge conflicts

**Solution:**

```bash
# 1. Checkout release
git checkout release
git pull origin release

# 2. Merge main into release locally
git merge main

# 3. Resolve conflicts
# Edit conflicting files

# 4. Commit and push
git add .
git commit -m "chore: resolve merge conflicts"
git push origin release

# release-please PR will update automatically
```

---

## FAQ

### Q: When does release-please create the PR?

**A:** Immediately after you merge to main (within seconds to minutes)

### Q: Can I control which commits trigger a release?

**A:** Yes! Use commit types:

- `feat:`, `fix:`, `perf:` → Create release
- `chore:`, `ci:`, `style:` → No release (hidden from changelog)

### Q: What if I don't want to release yet?

**A:** Don't merge the PR! release-please will keep updating it as you merge more to main.

### Q: Can I batch multiple features into one release?

**A:** Yes! Merge multiple features to main, then merge the single Release PR when ready.

### Q: How do I force a specific version?

**A:** Add to commit body:

```bash
git commit -m "feat: new feature

Release-As: 2.0.0"
```

### Q: Does this work with protected branches?

**A:** Yes! release-please creates PRs, so it works with any branch protection rules.

---

## Summary

**The Automated Workflow:**

1. ✅ Developer merges feature → `main`
2. ✅ Demo environment deploys
3. ✅ release-please analyzes commits
4. ✅ release-please creates PR: main → release
5. ✅ Team reviews PR
6. ✅ Team merges PR
7. ✅ `release` branch gets new version
8. ✅ GitHub Release created
9. ✅ Production deploys

**Key Benefits:**

- ✅ Automatic version bumping
- ✅ Automatic changelog generation
- ✅ Automatic PR creation (main → release)
- ✅ Clear separation: main (demo) vs release (production)
- ✅ No manual version management
- ✅ Semantic versioning enforced

---

**Last Updated:** 2025-10-20  
**Workflow:** main (demo) → auto PR → release (production)  
**Automation:** release-please monitors main, targets release
