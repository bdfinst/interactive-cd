# Netlify Deployment Guide

Complete guide for deploying the CD Practices application to Netlify with PostgreSQL database.

## Prerequisites

- [Netlify Account](https://app.netlify.com/signup) (free tier works)
- [Netlify CLI](https://docs.netlify.com/cli/get-started/) installed: `npm install -g netlify-cli`
- Git repository connected to Netlify
- This application already uses `@sveltejs/adapter-netlify`

## Quick Deploy

### Option 1: Netlify CLI (Recommended for First Deploy)

```bash
# 1. Login to Netlify
netlify login

# 2. Initialize Netlify site
netlify init

# 3. Create Netlify Postgres database
netlify addons:create postgres

# 4. Get database connection string
netlify addons:auth postgres

# 5. Set environment variables
netlify env:set DATABASE_URL "postgresql://user:pass@host:port/database"
netlify env:set NODE_ENV "production"

# 6. Deploy database schema
export DATABASE_URL="postgresql://user:pass@host:port/database"
./db/deploy-initial.sh

# 7. Deploy site
netlify deploy --prod
```

### Option 2: Netlify Web UI (Git-based Deploy)

1. Go to [Netlify Dashboard](https://app.netlify.com/)
2. Click "Add new site" → "Import an existing project"
3. Connect your Git repository
4. Configure build settings (see below)
5. Add Netlify Postgres addon
6. Deploy!

## Detailed Configuration

### 1. Build Settings

**File**: `netlify.toml` (create in project root)

```toml
[build]
  command = "npm run build"
  publish = "build"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

### 2. Environment Variables

Set these in Netlify Dashboard → Site Settings → Environment Variables:

| Variable | Value | Notes |
|----------|-------|-------|
| `DATABASE_URL` | `postgresql://...` | From Netlify Postgres addon |
| `NODE_ENV` | `production` | For production optimizations |

**How to Set**:

Via CLI:
```bash
netlify env:set DATABASE_URL "postgresql://user:pass@host:port/database"
netlify env:set NODE_ENV "production"
```

Via UI:
1. Go to Site Settings → Environment Variables
2. Click "Add a variable"
3. Enter name and value
4. Save

### 3. Database Setup (Netlify Postgres)

#### Create Database Addon

**Via CLI**:
```bash
# Create addon
netlify addons:create postgres

# Get connection details
netlify addons:auth postgres

# This outputs:
# DATABASE_URL=postgresql://...
```

**Via UI**:
1. Go to Site Settings → Add-ons
2. Click "Search for add-ons"
3. Find "Netlify Postgres" and click "Install"
4. Choose free tier (500MB storage, 1M rows)
5. Copy the `DATABASE_URL` to environment variables

#### Deploy Database Schema

```bash
# Export the DATABASE_URL from addon
export DATABASE_URL="postgresql://user:pass@host:port/database"

# Run initial deployment script
./db/deploy-initial.sh

# Verify
psql "$DATABASE_URL" -c "SELECT COUNT(*) FROM practices;"
# Should return: 23
```

### 4. SvelteKit Configuration

**File**: `svelte.config.js` (already configured)

```javascript
import adapter from '@sveltejs/adapter-netlify';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter(),
    alias: {
      '$domain': './src/domain',
      '$application': './src/application',
      '$infrastructure': './src/infrastructure'
    }
  }
};

export default config;
```

### 5. Package.json Scripts

**File**: `package.json` (already configured)

```json
{
  "scripts": {
    "dev": "vite dev",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

## Deployment Steps

### Initial Deployment

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   netlify login
   ```

2. **Initialize Netlify Site**
   ```bash
   netlify init

   # Follow prompts:
   # - Create new site
   # - Choose team
   # - Enter site name
   # - Build command: npm run build
   # - Publish directory: build
   ```

3. **Add Netlify Postgres**
   ```bash
   netlify addons:create postgres
   netlify addons:auth postgres
   ```

4. **Set Environment Variables**
   ```bash
   # Copy DATABASE_URL from addon auth output
   netlify env:set DATABASE_URL "postgresql://..."
   netlify env:set NODE_ENV "production"
   ```

5. **Deploy Database**
   ```bash
   export DATABASE_URL="postgresql://..."
   ./db/deploy-initial.sh
   ```

6. **Deploy Site**
   ```bash
   # Draft deploy (test first)
   netlify deploy

   # Production deploy
   netlify deploy --prod
   ```

### Subsequent Deployments

**Automatic (Git-based)**:
```bash
git add .
git commit -m "Update feature"
git push origin main

# Netlify auto-deploys on push to main
```

**Manual (CLI)**:
```bash
netlify deploy --prod
```

## Database Updates

### Adding New Practices

1. **Create Migration File**
   ```bash
   cp db/data/002_example_new_practice.sql db/data/003_my_new_practice.sql
   ```

2. **Edit Migration**
   ```sql
   INSERT INTO practices (id, name, type, category, description, requirements, benefits)
   VALUES (
     'my-practice',
     'My Practice',
     'practice',
     'tooling',
     'Description',
     '["Req 1"]'::jsonb,
     '["Benefit 1"]'::jsonb
   ) ON CONFLICT (id) DO UPDATE SET
     name = EXCLUDED.name;
   ```

3. **Deploy Migration**
   ```bash
   export DATABASE_URL="$(netlify env:get DATABASE_URL)"
   ./db/deploy-updates.sh
   ```

4. **Verify**
   ```bash
   psql "$DATABASE_URL" -c "SELECT id, name FROM practices WHERE id = 'my-practice';"
   ```

## Monitoring & Debugging

### View Logs

**Via CLI**:
```bash
netlify functions:log
netlify dev:log
```

**Via UI**:
1. Go to Site Dashboard
2. Click "Functions" or "Logs"
3. View real-time logs

### Common Issues

#### Issue: Build Fails

**Check**:
```bash
# Test build locally
npm run build

# Check build logs in Netlify UI
```

**Fix**: Ensure all dependencies in `package.json`

#### Issue: Database Connection Error

**Check**:
```bash
# Verify DATABASE_URL is set
netlify env:get DATABASE_URL

# Test connection
psql "$(netlify env:get DATABASE_URL)" -c "SELECT 1;"
```

**Fix**:
- Ensure DATABASE_URL environment variable is set
- Check Netlify Postgres addon is active
- Verify IP allowlist (Netlify Postgres allows all by default)

#### Issue: API Routes Not Working

**Check**:
- Verify `netlify.toml` has API redirects
- Check function logs: `netlify functions:log`

**Fix**:
```bash
# Ensure adapter is netlify
npm list @sveltejs/adapter-netlify

# Rebuild
npm run build
netlify deploy --prod
```

## Performance Optimization

### Edge Functions (Optional)

For faster API responses, move to Netlify Edge Functions:

**File**: `netlify/edge-functions/practices-tree.js`
```javascript
import { Context } from "@netlify/edge-functions";

export default async (request: Request, context: Context) => {
  // Your API logic here
  // Runs on edge (faster than serverless functions)
};

export const config = { path: "/api/practices/tree" };
```

### Caching

**File**: `netlify.toml`
```toml
[[headers]]
  for = "/api/practices/tree"
  [headers.values]
    Cache-Control = "public, max-age=300, s-maxage=600"
```

### Database Connection Pooling

Already configured in `src/infrastructure/persistence/db.js`:
```javascript
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,  // Max connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
});
```

## Security Checklist

- [ ] Environment variables set in Netlify (not in code)
- [ ] `.env` file in `.gitignore`
- [ ] Database credentials not committed
- [ ] HTTPS enabled (automatic on Netlify)
- [ ] Security headers configured in `netlify.toml`
- [ ] Dependency vulnerabilities checked: `npm audit`

## Cost Considerations

### Netlify Free Tier
- 100GB bandwidth/month
- 300 build minutes/month
- Unlimited sites
- ✅ Sufficient for this app

### Netlify Postgres Free Tier
- 500MB storage
- 1M rows
- Shared connection pool
- ✅ Sufficient for 23 practices + future growth

### Upgrading
If you exceed free tier:
- **Pro**: $19/month (1TB bandwidth, 25 concurrent builds)
- **Postgres Pro**: $12/month (2GB storage, 10M rows)

## Useful Commands

```bash
# Deploy status
netlify status

# Open site in browser
netlify open:site

# Open admin dashboard
netlify open:admin

# View environment variables
netlify env:list

# Link local project to Netlify site
netlify link

# Run local dev with Netlify environment
netlify dev

# Test functions locally
netlify functions:serve

# Database connection string
netlify addons:auth postgres
```

## Rollback Strategy

### Rollback Deployment

**Via UI**:
1. Go to Deploys
2. Find previous working deploy
3. Click "Publish deploy"

**Via CLI**:
```bash
# List deploys
netlify deploy:list

# Rollback to specific deploy
netlify deploy:rollback <deploy-id>
```

### Rollback Database

```sql
-- Example: Remove bad practice
BEGIN;
DELETE FROM practice_dependencies WHERE practice_id = 'bad-practice';
DELETE FROM practices WHERE id = 'bad-practice';
COMMIT;
```

## CI/CD Integration

### GitHub Actions (Optional)

**File**: `.github/workflows/deploy.yml`
```yaml
name: Deploy to Netlify

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18

      - run: npm ci
      - run: npm test
      - run: npm run build

      - uses: netlify/actions/cli@master
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
        with:
          args: deploy --prod
```

## Support Resources

- [Netlify Docs](https://docs.netlify.com/)
- [SvelteKit Netlify Adapter](https://github.com/sveltejs/kit/tree/master/packages/adapter-netlify)
- [Netlify Postgres](https://docs.netlify.com/postgres/)
- [Netlify CLI](https://cli.netlify.com/)

---

**Quick Start Summary**:
1. `netlify init` - Initialize site
2. `netlify addons:create postgres` - Add database
3. `netlify env:set DATABASE_URL "..."` - Set connection
4. `./db/deploy-initial.sh` - Deploy schema
5. `netlify deploy --prod` - Deploy app

**Live Site**: Your app will be at `https://your-site-name.netlify.app`
