# Netlify Deployment Guide

## Overview

Deploy the CD Practices visualization app to Netlify with Postgres database.

## Prerequisites

- Netlify account
- Git repository
- Node.js installed locally

## Setup Steps

### 1. Create Netlify Postgres Database

1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Navigate to **Add-ons** → **Databases**
3. Click **Create Database**
4. Select **PostgreSQL**
5. Choose **Free tier** (1GB storage, 60 hours/month)
6. Name your database: `cd-practices-db`
7. Note the connection string provided

### 2. Set Environment Variables

In your Netlify project settings:

```bash
# Navigate to Site Settings → Environment Variables
DATABASE_URL=postgresql://user:password@host:port/database
NODE_VERSION=18
```

### 3. Initialize Database

Option A: Using Netlify CLI
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Link to your site
netlify link

# Run migrations
netlify env:import .env  # if you have local .env
psql $DATABASE_URL -f schema.sql
psql $DATABASE_URL -f seed.sql
```

Option B: Using direct connection
```bash
# Set DATABASE_URL from Netlify dashboard
export DATABASE_URL="postgresql://..."

# Run migrations
psql $DATABASE_URL -f schema.sql
psql $DATABASE_URL -f seed.sql
```

### 4. Project Configuration

Create `netlify.toml`:

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
  for = "/api/*"
  [headers.values]
    Access-Control-Allow-Origin = "*"
    Access-Control-Allow-Methods = "GET, POST, PUT, DELETE, OPTIONS"
    Access-Control-Allow-Headers = "Content-Type"
```

### 5. SvelteKit Configuration

Update `svelte.config.js`:

```javascript
import adapter from '@sveltejs/adapter-netlify';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: adapter({
      edge: false,
      split: false
    })
  }
};

export default config;
```

### 6. Install Dependencies

```bash
npm install pg
npm install -D @sveltejs/adapter-netlify
```

Update `package.json`:

```json
{
  "scripts": {
    "dev": "vite dev",
    "build": "vite build",
    "preview": "vite preview",
    "db:migrate": "psql $DATABASE_URL -f schema.sql",
    "db:seed": "node seed-data.js | psql $DATABASE_URL",
    "db:reset": "npm run db:migrate && npm run db:seed"
  },
  "dependencies": {
    "pg": "^8.11.0"
  },
  "devDependencies": {
    "@sveltejs/adapter-netlify": "^4.0.0",
    "@sveltejs/kit": "^2.0.0",
    "svelte": "^4.0.0",
    "vite": "^5.0.0"
  }
}
```

### 7. Create Database Client

File: `src/lib/server/db.ts`

```typescript
import { DATABASE_URL } from '$env/static/private';
import pkg from 'pg';
const { Pool } = pkg;

export const db = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 10
});

// Test connection
db.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Database connected:', res.rows[0].now);
  }
});
```

### 8. Create API Routes

File: `src/routes/api/practices/+server.ts`

```typescript
import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
  try {
    const result = await db.query('SELECT * FROM practices ORDER BY name');
    return json(result.rows);
  } catch (error) {
    console.error('Database error:', error);
    return json({ error: 'Failed to fetch practices' }, { status: 500 });
  }
};
```

File: `src/routes/api/tree/+server.ts`

```typescript
import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
  const rootId = url.searchParams.get('root') || 'continuous-delivery';

  try {
    const result = await db.query(
      'SELECT * FROM get_practice_tree($1)',
      [rootId]
    );
    return json(result.rows);
  } catch (error) {
    console.error('Database error:', error);
    return json({ error: 'Failed to fetch tree' }, { status: 500 });
  }
};
```

### 9. Deploy to Netlify

```bash
# Using Netlify CLI
netlify deploy --prod

# Or push to Git (if auto-deploy enabled)
git add .
git commit -m "Initial deployment"
git push origin main
```

### 10. Verify Deployment

1. Check build logs in Netlify dashboard
2. Verify environment variables are set
3. Test API endpoints:
   - `https://your-site.netlify.app/api/practices`
   - `https://your-site.netlify.app/api/tree`
4. Check database connections in Netlify Functions logs

## Database Maintenance

### View Connection Info

```bash
netlify addons:list
netlify addons:auth cd-practices-db
```

### Run Queries

```bash
# Connect to database
netlify addons:auth cd-practices-db --json | jq -r .connection_string | xargs psql

# Or export and use psql
export DATABASE_URL=$(netlify addons:auth cd-practices-db --json | jq -r .connection_string)
psql $DATABASE_URL
```

### Backup Database

```bash
# Export all data
pg_dump $DATABASE_URL > backup.sql

# Export just data (for seed file regeneration)
psql $DATABASE_URL -c "COPY (SELECT * FROM practices) TO STDOUT WITH CSV HEADER" > practices.csv
```

### Update Schema

```bash
# Add new migration
psql $DATABASE_URL -f migrations/004_new_feature.sql
```

## Performance Optimization

### 1. Enable Connection Pooling

Already configured in `db.ts` with max connections.

### 2. Cache API Responses

```typescript
// src/routes/api/practices/+server.ts
import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';

export const GET: RequestHandler = async ({ setHeaders }) => {
  const result = await db.query('SELECT * FROM practices');

  // Cache for 5 minutes
  setHeaders({
    'cache-control': 'public, max-age=300'
  });

  return json(result.rows);
};
```

### 3. Use SvelteKit Load Functions

```typescript
// src/routes/+page.server.ts
import { db } from '$lib/server/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  const result = await db.query('SELECT * FROM practices');
  return {
    practices: result.rows
  };
};
```

## Monitoring

### Check Database Usage

```bash
# Connect to database
psql $DATABASE_URL

# Check table sizes
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

# Check row counts
SELECT 'practices' as table_name, COUNT(*) FROM practices
UNION ALL
SELECT 'practice_dependencies', COUNT(*) FROM practice_dependencies;
```

### Function Logs

View in Netlify Dashboard → Functions → Select function → Logs

## Troubleshooting

### "relation does not exist" error

Run migrations:
```bash
psql $DATABASE_URL -f schema.sql
```

### "Cannot connect to database"

Check DATABASE_URL is set:
```bash
netlify env:list
```

### "SSL connection required"

Ensure `ssl: { rejectUnauthorized: false }` in Pool config.

### Build failures

Check Node version matches:
```bash
# In netlify.toml
[build.environment]
  NODE_VERSION = "18"
```

## Cost Monitoring

Free tier limits:
- **Storage**: 1 GB
- **Runtime**: 60 hours/month
- **Rows**: No hard limit (1GB of data)

Current usage:
- **Practices**: ~23 rows × ~2KB = ~46 KB
- **Dependencies**: ~50 rows × ~100B = ~5 KB
- **Total**: < 100 KB (well within limits)

## Next Steps

1. ✅ Database deployed and seeded
2. ⏳ Connect SvelteKit frontend
3. ⏳ Build interactive graph visualization
4. ⏳ Add search and filtering
5. ⏳ Deploy production version
