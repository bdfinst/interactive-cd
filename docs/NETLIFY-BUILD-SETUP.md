# Netlify Build Setup - Database Migrations

This guide explains how database migrations work in Netlify builds.

## ✅ Current Solution: Node.js Migration Runner

**Status:** Migrations now work automatically in all Netlify builds!

We use a Node.js-based migration runner (`db/deploy-migrations.js`) that uses the `pg` npm package instead of requiring the `psql` command-line tool. This works in any Node.js environment without additional setup.

### How It Works:

1. **Build process** runs `npm run build`
2. **Build script** runs `npm run db:migrate:node` before building the app
3. **Node.js runner** uses the `pg` package to:
   - Connect to the database
   - Read SQL migration files
   - Execute migrations
   - Report results

### Benefits:

- ✅ Works in all Netlify build environments (no psql required)
- ✅ No custom Docker images needed
- ✅ No build plugins required
- ✅ Uses existing `pg` npm dependency
- ✅ Identical output format to bash version
- ✅ Automatic in production, previews, and branch deploys

## Previous Approaches (Historical Reference)

### **Option 1: Use Netlify's Default Image (Recommended - Try First)**

Netlify's current default build image (Ubuntu Focal 20.04) may already include PostgreSQL client tools.

**Action Required:** None - just deploy and check build logs.

If the build succeeds and you see:
```
✅ PostgreSQL client installed
```

Then you're all set! The current configuration will work.

If you see:
```
⚠️  WARNING: psql (PostgreSQL client) not found in build environment
```

Then proceed to Option 2 or 3.

---

### **Option 2: Configure Netlify to Use Docker Build Image**

Use a Docker image that includes PostgreSQL client tools.

#### **Step 1: Create Dockerfile**

Create a file `netlify.Dockerfile` in your project root:

```dockerfile
# Use Netlify's base image
FROM node:24-bookworm

# Install PostgreSQL client
RUN apt-get update && \
    apt-get install -y postgresql-client && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /opt/build/repo
```

#### **Step 2: Update netlify.toml**

Add build image configuration:

```toml
[build]
  command = "npm run build"
  publish = "build"

[build.environment]
  NODE_VERSION = "24.8.0"

# Use custom Docker image with PostgreSQL
[build.processing.image]
  dockerfile = "netlify.Dockerfile"
```

#### **Step 3: Deploy**

Commit and push the changes. Netlify will build using your custom Docker image.

**Pros:**
- ✅ Full control over build environment
- ✅ Guaranteed to have psql available
- ✅ Consistent builds

**Cons:**
- ❌ Longer build times (Docker image build)
- ❌ More complex configuration

---

### **Option 3: Skip Database Migrations During Build (Simplest)**

Run migrations separately from the build process.

#### **How It Works:**

Your current script already handles this gracefully. If `psql` is not available, it exits with:
```
Skipping database migrations (build will continue).
```

#### **Run Migrations Separately:**

**After deploying to Netlify:**

```bash
# Set DATABASE_URL to your Netlify database
export DATABASE_URL="postgres://user:pass@xxx.neon.tech/main"

# Run migrations manually
./db/deploy-migrations.sh
```

**Or using Netlify CLI:**

```bash
# Deploy the site
netlify deploy --prod

# Run migrations via Netlify CLI
netlify env:set DATABASE_URL "postgres://..."
netlify build --context production
```

**Pros:**
- ✅ Simplest setup
- ✅ No build configuration needed
- ✅ Fast builds (skips migration step)

**Cons:**
- ❌ Manual step required after deployment
- ❌ Potential for production to run without latest migrations

---

### **Option 4: Use Netlify Functions for Migrations**

Run migrations as a Netlify Function that executes on first deployment.

#### **Create Migration Function:**

Create `netlify/functions/migrate.js`:

```javascript
import { Client } from 'pg'

export async function handler(event, context) {
  // Only allow POST requests from authorized sources
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  // Verify authorization (use environment variable for secret)
  const authHeader = event.headers.authorization
  if (authHeader !== `Bearer ${process.env.MIGRATION_SECRET}`) {
    return { statusCode: 401, body: 'Unauthorized' }
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  })

  try {
    await client.connect()

    // Run migrations here
    // (You can read SQL files or include migration logic)

    await client.end()

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: 'Migrations applied' })
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: error.message })
    }
  }
}
```

#### **Trigger After Deploy:**

```bash
# After deployment, trigger migration function
curl -X POST https://your-site.netlify.app/.netlify/functions/migrate \
  -H "Authorization: Bearer YOUR_SECRET"
```

**Pros:**
- ✅ No psql dependency
- ✅ Can be automated via build hooks
- ✅ Uses existing pg npm package

**Cons:**
- ❌ More complex implementation
- ❌ Need to reimplement migration logic in JavaScript
- ❌ Security considerations (need to secure endpoint)

---

## Recommended Approach

For most use cases, we recommend **Option 3 (Skip During Build)** initially:

1. **First deployment:** Run `./db/deploy-initial.sh` manually once
2. **Subsequent deployments:** Netlify builds skip migrations gracefully
3. **When adding data:** Run `./db/deploy-migrations.sh` manually

**Why?**
- ✅ No build configuration changes needed
- ✅ Works immediately
- ✅ Clear separation of concerns
- ✅ Easy to understand and debug

**When to use other options:**
- **Option 1:** Try first - it might just work!
- **Option 2:** When you need automatic migrations on every deploy
- **Option 4:** When you want fully automated migrations without build dependencies

---

## Testing Your Setup

### **Test Build Locally:**

```bash
# Simulate Netlify build environment
export CONTEXT=production
export DATABASE_URL="your-database-url"

# Run build
npm run build
```

### **Check Build Logs in Netlify:**

Look for:
```
============================================================================
  DATABASE MIGRATIONS - CI/CD DEPLOYMENT
============================================================================

🌐 Netlify Context: production
📊 Database: postgres://user:***@xxx.neon.tech/main
```

### **Verify Migrations Applied:**

```bash
# Check migration history
psql $DATABASE_URL -c "SELECT * FROM schema_migrations ORDER BY applied_at DESC LIMIT 10;"
```

---

## Troubleshooting

### Build fails with "psql: command not found"

**Solution:** Script already handles this gracefully. Check build logs to confirm it says:
```
⚠️  WARNING: psql (PostgreSQL client) not found in build environment
Skipping database migrations (build will continue).
```

If build still fails, there's a different issue. Check full build logs.

### Migrations don't run but build succeeds

**Expected behavior** if psql is not available. Run migrations manually:
```bash
export DATABASE_URL="..."
./db/deploy-migrations.sh
```

### Want automatic migrations on every deploy

**Solution:** Use Option 2 (Docker build image) or Option 4 (Netlify Functions).

---

## Current Configuration

Your current setup (`db/deploy-migrations.sh`) already implements graceful handling:

```bash
if ! command -v psql &> /dev/null; then
  echo "⚠️  WARNING: psql (PostgreSQL client) not found"
  echo "Skipping database migrations (build will continue)."
  exit 0  # Exit gracefully - don't fail the build
fi
```

This means:
- ✅ Builds will **never fail** due to missing psql
- ✅ You can run migrations manually when needed
- ✅ No configuration changes required

---

## Next Steps

1. **Try deploying as-is** - Check if Netlify's default image includes psql
2. **If migrations are skipped** - Choose Option 3 (manual migrations)
3. **If you need automation** - Implement Option 2 (Docker) or Option 4 (Functions)

For questions or issues, see:
- [Netlify Build Documentation](https://docs.netlify.com/configure-builds/overview/)
- [Neon Database Documentation](https://neon.tech/docs)
