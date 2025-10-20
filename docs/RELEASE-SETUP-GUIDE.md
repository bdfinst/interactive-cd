# Release Setup Quick Start Guide

This guide walks you through setting up the automated release process for the Interactive CD project.

---

## Prerequisites

- GitHub repository: `bdfinst/interactive-cd`
- Admin access to repository settings
- GitHub Actions enabled

---

## Step 1: Create Release Branch

```bash
# Clone repository if not already done
git clone https://github.com/bdfinst/interactive-cd.git
cd interactive-cd

# Create release branch from main
git checkout main
git pull origin main
git checkout -b release
git push -u origin release
```

---

## Step 2: Configure Branch Protection

### For Main Branch

1. Go to: `https://github.com/bdfinst/interactive-cd/settings/branches`
2. Click **Add rule**
3. Branch name pattern: `main`
4. Configure:
   - ✅ Require pull request before merging
     - Required approvals: **1**
     - ✅ Dismiss stale pull request approvals
   - ✅ Require status checks to pass before merging
     - ✅ Require branches to be up to date
     - Required checks: **test** (from CI workflow)
   - ✅ Require conversation resolution
   - ✅ Require linear history
   - ❌ Do not allow force pushes
   - ❌ Do not allow deletions
5. Click **Create** or **Save changes**

### For Release Branch

1. Click **Add rule** again
2. Branch name pattern: `release`
3. Configure:
   - ✅ Require pull request before merging
     - Required approvals: **2**
     - ✅ Dismiss stale pull request approvals
   - ✅ Require status checks to pass before merging
     - ✅ Require branches to be up to date
     - Required checks: **test** (from CI workflow)
   - ✅ Require conversation resolution
   - ✅ Require linear history
   - ❌ Do not allow force pushes
   - ❌ Do not allow deletions
   - ✅ Restrict who can push (optional)
     - Add: Repository maintainers
4. Click **Create** or **Save changes**

---

## Step 3: Verify GitHub Actions

1. Go to: `https://github.com/bdfinst/interactive-cd/actions`
2. Verify workflows are enabled:
   - ✅ **Build and test** (ci.yml)
   - ✅ **Release Please** (release-please.yml)
3. If disabled, click **Enable workflow**

---

## Step 4: Configure GitHub Secrets (if needed)

For production deployment, add these secrets:

1. Go to: `https://github.com/bdfinst/interactive-cd/settings/secrets/actions`
2. Click **New repository secret**
3. Add:
   - **Name:** `DATABASE_URL`
   - **Value:** Your production database URL
4. Click **Add secret**

Add other secrets as needed for your deployment target (Netlify, Vercel, etc.)

---

## Step 5: Test the Workflow

### Create a Test Release

```bash
# 1. Create test feature on main
git checkout main
git checkout -b feat/test-release-please
echo "# Test" > TEST.md
git add TEST.md
git commit -m "feat: test release-please workflow"
git push origin feat/test-release-please

# 2. Create PR to main, merge it
# (via GitHub UI)

# 3. Merge main to release
git checkout release
git pull origin release
git merge main
git push origin release

# 4. Check GitHub Actions
# Go to: https://github.com/bdfinst/interactive-cd/actions
# Verify "Release Please" workflow runs

# 5. Check for Release PR
# Go to: https://github.com/bdfinst/interactive-cd/pulls
# Should see a PR from release-please bot
```

---

## Step 6: Merge First Release

1. **Review the Release PR** created by release-please
   - Check version bump (should be 1.4.0 for new feat)
   - Review CHANGELOG.md
   - Verify package.json updated
2. **Merge the Release PR**
3. **Verify Release Created**
   - Go to: `https://github.com/bdfinst/interactive-cd/releases`
   - Should see new release with tag

---

## Step 7: Configure Deployment (Optional)

### Netlify Deployment

1. Go to Netlify dashboard
2. Link repository
3. Configure build settings:
   - **Base directory:** (leave empty)
   - **Build command:** `npm run build`
   - **Publish directory:** `build`
4. Add environment variables:
   - `DATABASE_URL`: Your production database URL
5. Configure deploy contexts:
   - **Production branch:** `release`
   - **Branch deploys:** `main`
6. Save settings

Now:
- Pushes to `main` → Deploy to preview URL
- Releases on `release` → Deploy to production URL

---

## Verification Checklist

After setup, verify:

- [ ] Release branch exists
- [ ] Branch protection enabled on `main`
- [ ] Branch protection enabled on `release`
- [ ] GitHub Actions workflows enabled
- [ ] release-please workflow runs on push to `release`
- [ ] Release PR created successfully
- [ ] Merging Release PR creates GitHub Release
- [ ] Git tags created for releases
- [ ] CHANGELOG.md auto-generated
- [ ] package.json version auto-updated
- [ ] Deployment triggered on release (if configured)

---

## Daily Workflow

Once set up, the daily workflow is:

```bash
# 1. Develop on feature branch
git checkout -b feat/new-feature main
git commit -m "feat: add new feature"
git push origin feat/new-feature

# 2. Create PR to main, get reviewed, merge
# → Auto-deploys to demo/preview

# 3. When ready for production release
git checkout release
git merge main
git push origin release

# 4. release-please creates Release PR
# → Review and merge Release PR

# 5. Release created automatically
# → Auto-deploys to production
```

---

## Troubleshooting

### Release PR Not Created

**Check:**
1. Are commits using conventional format? (`feat:`, `fix:`, etc.)
2. Is the release-please workflow enabled?
3. Check GitHub Actions logs for errors
4. Verify `.release-please-manifest.json` exists

**Fix:**
```bash
# Ensure conventional commits
git commit --amend -m "feat: your feature description"
git push --force-with-lease

# Verify workflow file
cat .github/workflows/release-please.yml
```

### Wrong Version Bump

**Check:**
1. Commit type: `feat:` = minor, `fix:` = patch
2. Breaking change: `BREAKING CHANGE:` in footer = major
3. `.release-please-manifest.json` for overrides

**Fix:**
Update commit message or add breaking change footer:
```bash
git commit --amend -m "feat: new feature

BREAKING CHANGE: This changes the API"
```

### Build Failing

**Check:**
1. Database migrations applied
2. Environment variables set
3. Dependencies installed
4. Tests passing locally

**Fix:**
```bash
# Test locally first
npm ci
npm test
npm run build

# Ensure DATABASE_URL is set in GitHub Secrets
```

---

## Support

For issues:
1. Check [Release Process Documentation](./RELEASE-PROCESS.md)
2. Review [release-please docs](https://github.com/googleapis/release-please)
3. Open issue with `release` label

---

## Summary

You've now set up:

✅ **Automated versioning** via release-please
✅ **Automated changelog** generation
✅ **Branch protection** for main and release
✅ **Release workflow** from release branch
✅ **GitHub Releases** with tags

**Next Steps:**
1. Start using conventional commits
2. Merge features to main for demo
3. Merge main to release when ready
4. Let release-please handle the rest!

---

**Setup Time:** ~15 minutes
**Maintenance:** Near zero (fully automated)
**Benefits:** Consistent releases, clear changelogs, semantic versioning

Happy releasing! 🚀
