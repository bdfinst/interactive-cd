# Netlify Database Setup with Neon

This guide explains how to configure different databases for production and pre-production environments on Netlify using Neon (serverless Postgres).

## Overview

Your Netlify site can use different Neon databases for:
- **Production** - Main branch deploys
- **Deploy Previews** - Pull request previews
- **Branch Deploys** - Feature branch deploys

## Step 1: Set Up Neon Database Branches

Neon supports database branching, which creates isolated copies of your database.

### In Neon Dashboard:

1. Go to your Neon project
2. Navigate to **Branches** tab
3. Create branches for each environment:

```
main (production)
├── preview (for deploy-previews)
└── staging (for branch-deploys)
```

### Get Connection Strings:

Each branch has its own connection string:

```
Production:      postgres://user:pass@ep-xxx-main-xxx.neon.tech/main
Deploy Previews: postgres://user:pass@ep-xxx-preview-xxx.neon.tech/main
Branch Deploys:  postgres://user:pass@ep-xxx-staging-xxx.neon.tech/main
```

## Step 2: Configure Netlify Environment Variables

### In Netlify Dashboard:

1. Go to **Site Settings → Environment Variables**
2. Click **"Add a variable"**
3. Add `DATABASE_URL` with different values for each context:

#### Production Environment:
- Variable: `DATABASE_URL`
- Value: `postgres://...main...`
- Scopes: **Production** only

#### Deploy Preview Environment:
- Variable: `DATABASE_URL`
- Value: `postgres://...preview...`
- Scopes: **Deploy previews** only

#### Branch Deploy Environment:
- Variable: `DATABASE_URL`
- Value: `postgres://...staging...`
- Scopes: **Branch deploys** only

## Step 3: How It Works

### When a deployment runs:

1. **Production Deploy (main branch)**
   - Netlify sets `CONTEXT=production`
   - Uses production `DATABASE_URL`
   - Runs migrations on main database

2. **Deploy Preview (pull request)**
   - Netlify sets `CONTEXT=deploy-preview`
   - Uses preview `DATABASE_URL`
   - Runs migrations on preview database

3. **Branch Deploy (feature branch)**
   - Netlify sets `CONTEXT=branch-deploy`
   - Uses branch-deploy `DATABASE_URL`
   - Runs migrations on staging database

### Build Output:

You'll see in the build logs:
```
============================================================================
  DATABASE MIGRATIONS - CI/CD DEPLOYMENT
============================================================================

🌐 Netlify Context: deploy-preview
📊 Database: postgres://user:***@ep-xxx-preview-xxx.neon.tech/main
```

## Step 4: Initialize Databases

Each Neon branch needs to be initialized with the schema.

### Option A: Neon Branching (Automatic)

When you create a branch in Neon, it automatically copies the schema and data from the parent branch. This is the easiest approach.

### Option B: Manual Initialization

If you need to manually initialize a database:

```bash
# Set DATABASE_URL to your preview/staging database
export DATABASE_URL="postgres://...preview..."

# Run initial deployment
./db/deploy-initial.sh
```

## Neon-Specific Features

### Database Branching Benefits:
- **Instant creation** - Branches are created in seconds
- **Copy-on-write** - Only stores differences, saving storage
- **Point-in-time recovery** - Create branches from any point in time
- **Autoscaling** - Each branch scales independently

### Managing Branches:

```bash
# Create a branch from main
neon branches create --name preview --parent main

# Create a branch from a specific point in time
neon branches create --name staging --parent main --timestamp "2024-01-15 10:00:00"

# Delete a branch
neon branches delete preview
```

## Testing Your Setup

### Test Deploy Preview:

1. Create a pull request
2. Wait for Netlify deploy preview
3. Check build logs for database context
4. Verify preview uses preview database

### Test Branch Deploy:

1. Push to a feature branch
2. Wait for branch deploy
3. Check build logs for database context
4. Verify branch uses staging database

## Troubleshooting

### Build fails with "DATABASE_URL not set"
- Check environment variable is set for correct context
- Verify scope includes the deployment context

### Migrations fail on preview database
- Ensure preview database is initialized
- Check if schema version matches migration expectations

### Can't connect to database
- Verify connection string is correct
- Check Neon database is running (not suspended)
- Ensure IP allowlist includes Netlify (if configured)

## Security Best Practices

1. **Never commit database URLs** - Always use environment variables
2. **Use separate databases** - Don't share production DB with previews
3. **Rotate credentials** - Regularly update database passwords
4. **Monitor access** - Review Neon access logs periodically

## Cost Optimization

Neon branches are cost-effective:
- **Free tier** - Includes 10 branches
- **Autosuspend** - Preview databases suspend when inactive
- **Storage** - Only changed data counts toward storage quota

## References

- [Neon Branching Documentation](https://neon.tech/docs/guides/branching)
- [Netlify Environment Variables](https://docs.netlify.com/environment-variables/overview/)
- [Netlify Deploy Contexts](https://docs.netlify.com/site-deploys/overview/#deploy-contexts)
