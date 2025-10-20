# Release Workflow

**Strategy:** main (demo + releases) → auto-sync to release (production tracking)  
**Automation:** release-please on main, auto-updates release branch  
**Safety:** CI must pass before release

---

## Workflow Overview

```
Feature → main → CI Tests → release-please → Release PR → merge → release branch updated
           ↓        ↓            ↓              (on main)    ↓           ↓
       Demo     Pass? ✅     Analyzes        Version bump   Release  Force-pushed
       deploys               commits         + CHANGELOG    created  to match main
```

---

## How It Works

### 1. Develop Features on Main Branch

**Purpose:** `main` is the demo/development branch AND source of releases

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

**Steps:**

1. ✅ Checkout code
2. ✅ Setup Node.js
3. ✅ Install dependencies
4. ✅ Run tests (`npm test`)
5. ✅ Build application (`npm run build`)

**If CI fails:**

- ❌ release-please WILL NOT run
- ❌ No Release PR created
- 💡 Fix the issues on main, push again

**If CI succeeds:**

- ✅ CI workflow completes successfully
- ✅ release-please workflow triggers

### 3. release-please Creates Release PR (Automatic)

**Only runs if CI passes!**

**What it does:**

1. ✅ Analyzes commits since last release
2. ✅ Determines version bump (feat → minor, fix → patch)
3. ✅ Creates Release PR **on main branch** with:
   - Updated version in package.json
   - Updated CHANGELOG.md
   - Title: `chore(main): release X.Y.Z`

**Important:** The Release PR is on **main**, not a PR to release branch!

**Example Release PR:**

```
Base: main
Branch: release-please--branches--main--components--interactive-cd

Title: chore(main): release 0.6.0

Files changed:
- package.json: 0.5.1 → 0.6.0
- CHANGELOG.md: Added Features section
- .release-please-manifest.json: Updated

Commits:
- feat: add user dashboard
- fix: resolve navigation bug
```

### 4. Review the Release PR (Manual)

**Your job:** Review the automatically created PR

**Check:**

- ✅ Version bump is correct (feat → minor, fix → patch)
- ✅ CHANGELOG includes all changes
- ✅ All commits are accounted for
- ✅ Tests passed in CI
- ✅ No unexpected changes

### 5. Merge the Release PR on Main (Manual)

**When you merge the Release PR:**

1. ✅ Main branch gets the version bump
2. ✅ GitHub Release is created (e.g., v0.6.0)
3. ✅ Git tag is pushed (e.g., v0.6.0)
4. ✅ **release branch is automatically updated** (force-pushed to match main)
5. ✅ Production deployment triggers

**Key point:** The `release` branch is **overwritten** to match main after the Release PR is merged!

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
# ✅ Demo deploys
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
✅ Creating Release PR on main...
```

**Step 5: Release PR Created on Main (Automatic)**

```
PR on main branch:

Title: chore(main): release 0.6.0

Branch: release-please--branches--main--components--interactive-cd
Base: main

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
# Review the Release PR on main
# Merge the PR (squash or merge commit)
```

**Step 7: Production Release (Automatic)**

```
✅ main branch updated to v0.6.0
✅ GitHub Release v0.6.0 created
✅ Tag v0.6.0 pushed
✅ release branch force-pushed to match main
✅ Production deployment triggered
```

---

## Branch Roles

### main Branch

**Purpose:**

- Demo environment
- Development integration
- Source of releases
- Contains version bumps

**Deploys to:** Preview/Demo environment

**Updated by:**

- Feature merges
- Release PR merges (version bumps)

### release Branch

**Purpose:**

- Production tracking
- Deployment target
- Mirror of main at release points

**Deploys to:** Production environment

**Updated by:**

- Automatic force-push after Release PR merge
- Always matches main after a release

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

## Safety Features

### 1. CI Must Pass

```
Feature merged → CI runs → Tests fail ❌
                          ↓
                   release-please BLOCKED
                   No Release PR created
```

**Why:** Ensures broken code never gets released

### 2. Manual Review Required

```
CI passes → release-please creates PR → You review → You merge
                                           ↓
                                    Check version ✅
                                    Check changelog ✅
                                    Verify changes ✅
```

**Why:** Human oversight before production release

### 3. Automatic release Branch Sync

```
Release PR merged → release branch updated (force-push)
                    ↓
                 Matches main exactly ✅
```

**Why:** release branch always reflects production state

---

## Troubleshooting

### Release PR Not Created After Merging to Main

**Problem:** Merged to main, CI passed, but no Release PR appeared

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
   - Look for existing Release PR on main
   - release-please updates existing PR instead of creating new ones

### release Branch Out of Sync

**Problem:** release branch doesn't match the latest release

**Solution:**

```bash
# Manual sync (if automatic failed)
git fetch origin main
git checkout -B release origin/main
git push origin release --force

# Or wait for next release
# The automatic sync will fix it
```

### Want to Deploy Without a Release

**Problem:** Need to deploy to production but don't want a new version

**Solution:**

```bash
# Use chore commits that don't trigger releases
git commit -m "chore: update configuration"
git push origin main

# Or manually sync release branch
git push origin main:release --force
```

### CI Fails After Release PR Created

**Problem:** Release PR was created but you discover issues

**Solution:**

1. Don't merge the Release PR
2. Fix issues on main
3. Push fixes
4. CI runs again
5. Release PR updates automatically with fixes

---

## Configuration Files

| File                                   | Purpose                                       |
| -------------------------------------- | --------------------------------------------- |
| `.github/workflows/ci.yml`             | Runs tests and build on push to main          |
| `.github/workflows/release-please.yml` | Creates Release PR and updates release branch |
| `release-please-config.json`           | release-please configuration                  |
| `.release-please-manifest.json`        | Current version tracking                      |
| `CHANGELOG.md`                         | Auto-generated changelog                      |

---

## FAQ

### Q: Why is the Release PR on main instead of to release?

**A:** This follows the standard release-please pattern:

- Releases are cut from main
- Version bumps live on main
- release branch is just a deployment target that mirrors main

### Q: What if I don't want release branch to be overwritten?

**A:** You can remove the "Update release branch" step from the workflow. But then you'll need to manually merge main to release after each release.

### Q: Can I still use the release branch?

**A:** Yes! It's the production deployment target. It just gets automatically updated to match main when releases happen.

### Q: What if release branch has commits that main doesn't have?

**A:** Bad! Don't commit directly to release. The force-push will overwrite them. All changes should go through main.

### Q: How do I roll back a release?

**A:**

```bash
# Option 1: Revert on main
git revert <commit-sha>
git push origin main
# Then merge the Release PR that release-please creates

# Option 2: Roll back release branch
git checkout release
git reset --hard v0.5.1  # Previous version
git push origin release --force

# Option 3: Deploy specific tag
# Point production to a specific tag instead of release branch
```

---

## Summary

**The Workflow:**

1. ✅ Features merge to `main`
2. ✅ CI runs (tests + build)
3. ⏸️ CI must pass
4. ✅ release-please creates Release PR **on main**
5. 👤 Team reviews Release PR
6. 👤 Team merges Release PR **on main**
7. ✅ GitHub Release created
8. ✅ `release` branch **force-pushed** to match main
9. ✅ Production deploys from `release`

**Key Points:**

- ✅ `main` = demo environment + source of releases
- ✅ `release` = production deployment target
- ✅ Release PRs are **on main**, not to release
- ✅ `release` branch is **overwritten** after each release
- ✅ All changes flow through main
- ✅ CI must pass before releases
- ✅ Human review before production

---

**Last Updated:** 2025-10-20  
**Workflow:** main (releases) → auto-sync → release (production)  
**Safety:** CI gates + manual review + automatic sync
