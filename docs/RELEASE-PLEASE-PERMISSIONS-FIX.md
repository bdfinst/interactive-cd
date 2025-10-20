# Release-Please Permissions Fix

**Issue:** GitHub Actions cannot create pull requests
**Error:** `GitHub Actions is not permitted to create or approve pull requests`

---

## Solution 1: Enable Workflow Permissions (Recommended)

### Via GitHub UI

1. **Go to Repository Settings**
   - Navigate to: `https://github.com/bdfinst/interactive-cd/settings`

2. **Go to Actions → General**
   - Click **Actions** in left sidebar
   - Click **General**

3. **Scroll to "Workflow permissions"**
   - Find the "Workflow permissions" section

4. **Select "Read and write permissions"**
   - Change from "Read repository contents and packages permissions"
   - To: ✅ **"Read and write permissions"**

5. **Enable PR creation**
   - ✅ Check: **"Allow GitHub Actions to create and approve pull requests"**

6. **Save**
   - Click **Save** button

### Via GitHub CLI

```bash
gh api repos/bdfinst/interactive-cd -X PATCH \
  -f default_workflow_permissions=write \
  -F allow_actions_to_approve_pull_requests=true
```

---

## Solution 2: Use Personal Access Token (Alternative)

If you prefer more control over permissions:

### Step 1: Create Personal Access Token

1. **Go to GitHub Settings**
   - Click your profile → Settings
   - Developer settings → Personal access tokens → Tokens (classic)

2. **Generate new token (classic)**
   - Name: `release-please-token`
   - Expiration: 90 days (or custom)
   - Select scopes:
     - ✅ `repo` (Full control of private repositories)
     - ✅ `write:packages` (optional)

3. **Copy the token**
   - Save it securely (you won't see it again)

### Step 2: Add Token as Repository Secret

1. **Go to Repository Settings**
   - `https://github.com/bdfinst/interactive-cd/settings/secrets/actions`

2. **New repository secret**
   - Click **New repository secret**
   - Name: `RELEASE_PLEASE_TOKEN`
   - Value: Paste your PAT
   - Click **Add secret**

### Step 3: Update Workflow

Update `.github/workflows/release-please.yml`:

```yaml
- uses: googleapis/release-please-action@v4
  id: release
  with:
    token: ${{ secrets.RELEASE_PLEASE_TOKEN }} # Use PAT instead of GITHUB_TOKEN
```

---

## Comparison

| Approach                  | Pros                                                              | Cons                                      |
| ------------------------- | ----------------------------------------------------------------- | ----------------------------------------- |
| **Workflow Permissions**  | ✅ Simple<br>✅ No token management<br>✅ Works for all workflows | ⚠️ Applies to all workflows               |
| **Personal Access Token** | ✅ More control<br>✅ Specific to release-please                  | ⚠️ Token expiration<br>⚠️ Manual rotation |

---

## Recommended: Workflow Permissions

For most cases, enabling workflow permissions is the simplest solution:

1. One-time setup in repository settings
2. No token management required
3. Works immediately

---

## After Fixing

Once permissions are updated:

1. **Manual trigger** (if workflow already ran):

   ```bash
   git commit --allow-empty -m "chore: trigger release-please"
   git push origin main
   ```

2. **Check workflow**:
   - Go to: `https://github.com/bdfinst/interactive-cd/actions`
   - Verify "Release Please" workflow succeeds
   - Check for new Release PR

3. **Expected result**:
   - ✅ Release PR created: "chore(main): release 0.6.0"
   - ✅ Contains version bump and changelog

---

## Verification

After applying the fix, the workflow should succeed with output like:

```
✔ Successfully updated reference release-please--branches--main--components--interactive-cd
✔ Created pull request #7: chore(main): release 0.6.0
```

---

## Security Note

### Workflow Permissions Approach

- GitHub Actions has write access to repository
- Can create PRs but cannot merge without approval
- Follows repository branch protection rules

### PAT Approach

- Token has your user permissions
- Can bypass some restrictions
- Needs rotation before expiration

**Best Practice:** Use workflow permissions with branch protection rules requiring reviews.

---

## Related Documentation

- **GitHub Actions Permissions:** https://docs.github.com/en/actions/security-guides/automatic-token-authentication#permissions-for-the-github_token
- **release-please Auth:** https://github.com/googleapis/release-please-action#github-credentials

---

## Quick Commands

```bash
# Check current workflow permissions
gh api repos/bdfinst/interactive-cd | jq '.default_workflow_permissions'

# Enable workflow permissions
gh api repos/bdfinst/interactive-cd -X PATCH \
  -f default_workflow_permissions=write \
  -F allow_actions_to_approve_pull_requests=true

# Trigger workflow manually
git commit --allow-empty -m "chore: trigger release-please"
git push origin main

# Check workflow status
gh run list --workflow=release-please.yml --limit=1
```

---

**Status:** Awaiting permission configuration
**Next Step:** Enable workflow permissions in repository settings
**Expected:** Release PR for v0.6.0 will be created
