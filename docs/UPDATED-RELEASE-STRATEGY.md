# Updated Release Strategy

**Date:** 2025-10-20
**Change:** Release-please now triggers on main branch
**Rationale:** Automated release PR creation on every merge to main

---

## Branch Strategy (Updated)

### Main Branch

- **Purpose:** Development + Release source
- **Deployment:** Demo/preview environment
- **Release-please:** Monitors this branch
- **Release PR:** Created automatically on push

### Release Branch (Optional)

- **Purpose:** Production deployment tracking
- **Deployment:** Production environment
- **Updates:** Tagged releases merged here

---

## How It Works Now

### 1. Development Workflow

```bash
# Create feature branch
git checkout -b feat/new-feature main

# Make changes with conventional commits
git commit -m "feat: add user dashboard"

# Push and create PR to main
git push origin feat/new-feature
```

### 2. Merge to Main

```bash
# After PR approval, merge to main
# → Demo environment deploys
# → release-please creates/updates Release PR
```

### 3. Release PR (Automated)

**release-please automatically:**

- Analyzes conventional commits on main
- Creates a "Release PR" on main with:
  - Bumped version in package.json
  - Updated CHANGELOG.md
  - Release notes

**You review the Release PR:**

- Check version bump is correct
- Review changelog entries
- Verify all changes are documented

### 4. Merge Release PR

```bash
# Merge the Release PR
# → Creates GitHub Release with tag (e.g., v1.4.0)
# → Triggers production build
# → Can deploy to production
```

### 5. Deploy to Production (Optional)

If you want a separate release branch for production tracking:

```bash
# Tag gets created automatically by release-please
# Deploy from that tag or merge to release branch

git checkout release
git merge v1.4.0  # Merge the tag
git push origin release
# → Production deploys
```

---

## Workflow Diagram

```
feat/* ──→ main (demo) ──→ Release PR ──→ Merge ──→ GitHub Release (v1.4.0)
                              ↑                              ↓
                      release-please                    production
                      (automatic)                      deployment
```

---

## Example: Complete Flow

### Step 1: Develop Feature

```bash
git checkout -b feat/csv-export main
git commit -m "feat: add CSV export for practices"
git push origin feat/csv-export
```

### Step 2: Create PR and Merge to Main

```bash
# Create PR: feat/csv-export → main
# Review, approve, merge
# ✅ Demo deploys automatically
```

### Step 3: Release PR Created (Automatic)

release-please detects the `feat:` commit and automatically:

**Creates PR on main:**

```
Title: chore(main): release 1.4.0

Changes:
- package.json: 1.3.1 → 1.4.0
- CHANGELOG.md: Added "Features" section
- .release-please-manifest.json: Updated version
```

### Step 4: Review and Merge Release PR

```bash
# Review the Release PR
# Merge it
# ✅ GitHub Release v1.4.0 created
# ✅ Git tag v1.4.0 pushed
# ✅ Production deployment triggered (if configured)
```

---

## Benefits of This Approach

✅ **Continuous releases** - Every merge to main can create a release
✅ **Automated versioning** - No manual version bumps
✅ **Clear changelog** - Auto-generated from commits
✅ **Release preview** - Review Release PR before publishing
✅ **Semantic versioning** - Automatic based on commit types
✅ **Demo environment** - Main branch always deployable

---

## Comparison: Old vs New Strategy

| Aspect                | Old Strategy            | New Strategy        |
| --------------------- | ----------------------- | ------------------- |
| **Trigger**           | Push to release         | Push to main        |
| **Release PR**        | On release branch       | On main branch      |
| **Demo deploys**      | From main               | From main           |
| **Prod deploys**      | From release            | From tags/releases  |
| **Version source**    | release branch          | main branch         |
| **Release frequency** | Manual merge to release | Every merge to main |

---

## Configuration Changes

### Workflow File

**Before:**

```yaml
on:
  push:
    branches:
      - release
```

**After:**

```yaml
on:
  push:
    branches:
      - main
```

### No Other Changes Needed

- `release-please-config.json` - No changes
- `.release-please-manifest.json` - No changes
- Configuration still on main branch ✅

---

## Release Process (Updated)

### For Regular Releases

1. **Merge features to main**
   - release-please creates/updates Release PR

2. **When ready to release**
   - Review Release PR
   - Merge Release PR
   - Release created automatically

### For Hotfixes

1. **Create hotfix branch from latest release tag**

   ```bash
   git checkout -b hotfix/critical-fix v1.4.0
   ```

2. **Fix and commit**

   ```bash
   git commit -m "fix: critical security issue"
   ```

3. **Merge to main**

   ```bash
   git checkout main
   git merge hotfix/critical-fix
   git push origin main
   # → release-please creates patch release PR
   ```

4. **Merge Release PR**
   - Creates v1.4.1 automatically

---

## Release Branch Usage (Optional)

If you still want a `release` branch for production tracking:

### Option 1: Manual Sync

```bash
# After release is created
git checkout release
git merge v1.4.0
git push origin release
```

### Option 2: Automated Sync

Add to `.github/workflows/release-please.yml`:

```yaml
- name: Update release branch
  if: ${{ steps.release.outputs.release_created }}
  run: |
    git checkout release
    git merge ${{ steps.release.outputs.tag_name }}
    git push origin release
```

### Option 3: Don't Use Release Branch

Just deploy from tags:

- v1.4.0 → Production
- main → Demo

---

## Commit Message Requirements

For release-please to work correctly:

### Version Bumps

| Commit Type                    | Version Bump  | Example                    |
| ------------------------------ | ------------- | -------------------------- |
| `feat:`                        | Minor (1.x.0) | `feat: add export feature` |
| `fix:`                         | Patch (1.0.x) | `fix: navigation bug`      |
| `feat!:` or `BREAKING CHANGE:` | Major (x.0.0) | `feat!: redesign API`      |

### Non-Release Commits

These don't trigger releases but appear in changelog:

- `docs:` - Documentation
- `test:` - Tests
- `refactor:` - Refactoring
- `perf:` - Performance

These don't appear in changelog:

- `chore:` - Maintenance
- `ci:` - CI/CD changes
- `build:` - Build system
- `style:` - Formatting

---

## FAQ

### Q: When is a release created?

**A:** When you merge the Release PR that release-please creates.

### Q: What if I don't want to release yet?

**A:** Just don't merge the Release PR. It will accumulate changes until you're ready.

### Q: Can I force a specific version?

**A:** Yes, add to commit message:

```
feat: new feature

Release-As: 2.0.0
```

### Q: How do I skip a release?

**A:** Use `chore:` commits - they don't trigger releases:

```bash
git commit -m "chore: update dependencies"
```

### Q: What if the Release PR is outdated?

**A:** Just push to main again - release-please updates it automatically.

---

## Migration Steps

Since the workflow has been updated:

1. ✅ **Updated** `.github/workflows/release-please.yml` to trigger on main
2. ✅ **No other changes needed** - config files still on main
3. ⏳ **Next:** Push to main to test the workflow
4. ⏳ **Then:** Merge the Release PR release-please creates

---

## Summary

The release strategy is now:

✅ **Main branch** - Development + Release source
✅ **release-please** - Monitors main for changes
✅ **Release PR** - Created automatically on every push to main
✅ **GitHub Releases** - Created when Release PR is merged
✅ **Production** - Deploy from tags or optional release branch

This is the standard release-please pattern and provides:

- Continuous releases
- Automated versioning
- Clear changelog
- Developer-friendly workflow

---

**Updated:** 2025-10-20
**Status:** ✅ Ready to use
**Next Step:** Push to main to trigger release-please 🚀
