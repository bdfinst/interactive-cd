# Release Workflow

**Strategy:** main (demo) → auto PR to release (production)  
**Automation:** release-please monitors main, creates PR to release  
**Safety:** Waits for CI tests to pass before creating release PR

---

## Workflow Overview

```
Feature → main → CI Tests → release-please → PR (main→release) → merge → Production
           ↓        ↓            ↓               ↓                 ↓
       Auto-deploy Pass?    Analyzes        Version bump      GitHub Release
       to preview   ↓       commits         + CHANGELOG       + deployment
                   ✅
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
```

**What happens:**

- ✅ Demo environment deploys automatically
- ✅ CI workflow runs (tests + build)

### 2. CI Workflow Runs (Automatic)

**Workflow:** `.github/workflows/ci.yml`

```yaml
name: Run Tests
on:
  push:
    branches: [main]
```

**Steps:**

1. ✅ Checkout code
2. ✅ Setup Node.js
3. ✅ Install dependencies
4. ✅ Run tests (`npm test`)
5. ✅ Build application (`npm run build`)

**If CI fails:**

- ❌ release-please WILL NOT run
- ❌ No release PR created
- 💡 Fix the issues on main, push again

**If CI succeeds:**

- ✅ CI workflow completes successfully
- ✅ release-please workflow triggers

### 3. release-please Creates PR (Automatic)

**Only runs if CI passes!**

**Workflow:** `.github/workflows/release-please.yml`

```yaml
name: Release Please
on:
  workflow_run:
    workflows: ['Run Tests'] # Waits for CI
    types: [completed]
    branches: [main]

jobs:
  release-please:
    if: ${{ github.event.workflow_run.conclusion == 'success' }}
```

**What it does:**

1. ✅ Analyzes commits since last release
2. ✅ Determines version bump (feat → minor, fix → patch)
3. ✅ Creates PR from main to release with:
   - Updated version in package.json
   - Updated CHANGELOG.md
   - Title: `chore(main): release X.Y.Z`

**Example PR created by release-please:**

```
Title: chore(main): release 0.6.0

Base: release ← Head: main

Files changed:
- package.json: 0.5.1 → 0.6.0
- CHANGELOG.md: Added Features section
- .release-please-manifest.json: Updated

Commits included:
- feat: add user dashboard
- fix: resolve navigation bug
```

### 4. Review the Release PR (Manual)

**Your job:** Review the automatically created PR

**Check:**

- ✅ Version bump is correct (feat → minor, fix → patch)
- ✅ CHANGELOG includes all changes
- ✅ All commits are accounted for
- ✅ No unexpected changes

### 5. Merge the Release PR (Manual)

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
```

**Step 3: CI Workflow Runs (Automatic)**

```
✅ Checkout code
✅ Setup Node.js
✅ Install dependencies
✅ Run tests (186/186 passing)
✅ Build application
✅ CI workflow succeeded!
```

**Step 4: release-please Triggers (Automatic)**

```
Waiting for "Run Tests" workflow...
✅ "Run Tests" succeeded!
✅ Analyzing commits on main...
✅ Found: "feat: add CSV export..."
✅ Determined: Minor bump (0.5.1 → 0.6.0)
✅ Creating PR: main → release
```

**Step 5: Release PR Created (Automatic)**

```
PR: main → release

Title: chore(main): release 0.6.0

Changes:
- package.json: version 0.6.0
- CHANGELOG.md:
  ## [0.6.0] - 2025-10-20
  ### Features
  - add CSV export for practice data
  ### Tests
  - add CSV export tests
```

**Step 6: Review and Merge Release PR (Manual)**

```bash
# Go to GitHub
# Review the PR created by release-please
# Merge the PR (main → release)
```

**Step 7: Production Release (Automatic)**

```
✅ release branch updated to v0.6.0
✅ GitHub Release v0.6.0 created
✅ Tag v0.6.0 pushed
✅ Production deployment triggered
```

---

## Safety Features

### 1. CI Must Pass

```
Feature merged → CI runs → Tests fail ❌
                          ↓
                   release-please BLOCKED
                   No release PR created
```

**Why:** Ensures broken code never reaches production

### 2. Manual Review Required

```
CI passes → release-please creates PR → You review → You merge
                                           ↓
                                    Check version ✅
                                    Check changelog ✅
                                    Verify changes ✅
```

**Why:** Human oversight before production release

### 3. Branch Protection

**Recommended settings for `release` branch:**

- ✅ Require pull request before merging
- ✅ Require status checks to pass
- ✅ Require 2 approvals
- ❌ Do not allow force pushes

---

## Version Bumping Rules

| Commit Type                         | Version Bump         | Example         |
| ----------------------------------- | -------------------- | --------------- |
| `feat:`                             | **Minor** (0.X.0)    | 0.5.1 → 0.6.0   |
| `fix:`                              | **Patch** (0.0.X)    | 0.5.1 → 0.5.2   |
| `perf:`                             | **Patch** (0.0.X)    | 0.5.1 → 0.5.2   |
| `feat!:` or `BREAKING CHANGE:`      | **Major** (X.0.0)    | 0.5.1 → 1.0.0   |
| `docs:`, `test:`, `refactor:`       | Patch (in changelog) | 0.5.1 → 0.5.2   |
| `chore:`, `ci:`, `build:`, `style:` | None (hidden)        | No version bump |

---

## Troubleshooting

### Release PR Not Created After Merging to Main

**Problem:** Merged to main, CI passed, but no release PR appeared

**Solutions:**

1. **Check if CI actually passed:**

   ```
   Go to GitHub → Actions → "Run Tests" workflow
   Verify it shows green checkmark ✅
   ```

2. **Check release-please workflow:**

   ```
   Go to GitHub → Actions → "Release Please" workflow
   Should show: "Waiting for workflow 'Run Tests'"
   Then: "Workflow completed successfully"
   ```

3. **Verify commit format:**

   ```bash
   git log --oneline -5
   # Should see: feat:, fix:, perf:, etc.
   ```

4. **Check if PR already exists:**
   - Look for existing PR from main to release
   - release-please updates existing PR instead of creating new ones

### CI Fails, What Happens?

**Scenario:** Tests fail after merge to main

**Result:**

- ❌ CI workflow fails
- ❌ release-please does NOT run
- ❌ No release PR created

**Fix:**

```bash
# Fix the issue on main
git checkout main
git pull
# Make fixes
git commit -m "fix: resolve test failures"
git push origin main

# CI runs again
# If it passes, release-please triggers
```

### Release PR Was Created But CI Failed Later

**Problem:** release-please created PR, but you discover CI actually failed

**Solution:**
This shouldn't happen! The workflow is configured to only run if CI succeeds.

But if it does:

1. Close the release PR
2. Fix issues on main
3. Push to main
4. CI runs and passes
5. release-please creates fresh PR

---

## Configuration Files

| File                                   | Purpose                              |
| -------------------------------------- | ------------------------------------ |
| `.github/workflows/ci.yml`             | Runs tests and build on push to main |
| `.github/workflows/release-please.yml` | Creates release PR after CI passes   |
| `release-please-config.json`           | release-please configuration         |
| `.release-please-manifest.json`        | Current version tracking             |
| `CHANGELOG.md`                         | Auto-generated changelog             |

---

## FAQ

### Q: What if CI is slow? Will release-please wait?

**A:** Yes! release-please uses `workflow_run` which waits for CI to complete (no timeout).

### Q: Can I merge to main without triggering a release?

**A:** Yes! Use commit types that don't trigger releases:

```bash
git commit -m "chore: update dependencies"  # No release
git commit -m "docs: update README"         # Included in next release
git commit -m "feat: new feature"           # Triggers release
```

### Q: What if I want to release even though CI failed?

**A:** Don't! Fix CI first. Broken code should never reach production.

If absolutely necessary (emergency):

1. Fix CI on main
2. Create manual PR: main → release
3. Manually update version and CHANGELOG
4. Not recommended!

### Q: Can I see what will be released before CI runs?

**A:** The release PR is created AFTER CI passes, so you can't preview it before CI.

But you can check what commits will be included:

```bash
git log --oneline $(git describe --tags --abbrev=0)..HEAD
```

---

## Summary

**The Safe, Automated Workflow:**

1. ✅ Developer merges feature → `main`
2. ✅ Demo environment deploys
3. ✅ CI workflow runs (tests + build)
4. ⏸️ **CI must pass** before proceeding
5. ✅ release-please analyzes commits (only if CI passed)
6. ✅ release-please creates PR: main → release
7. 👤 Team reviews PR
8. 👤 Team merges PR
9. ✅ `release` branch gets new version
10. ✅ GitHub Release created
11. ✅ Production deploys

**Key Safety Features:**

- ✅ CI must pass before release PR is created
- ✅ Human review required before production
- ✅ Conventional commits enforce semantic versioning
- ✅ Automatic changelog generation
- ✅ Branch protection prevents accidents

---

**Last Updated:** 2025-10-20  
**Workflow:** main (demo) → CI → auto PR → release (production)  
**Safety:** CI must pass before release-please runs
