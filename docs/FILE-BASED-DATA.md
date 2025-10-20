# File-Based Data Architecture

## Overview

The Interactive CD application now uses **JSON files** as the single source of truth instead of a database. This provides:

✅ **Zero database queries** - All data loaded at build time
✅ **No database hosting costs** - Save ~$5-20/month
✅ **Ultra-fast page loads** - Pre-rendered static HTML
✅ **Version controlled data** - All changes tracked in Git
✅ **Simple deployment** - Pure static files on CDN
✅ **Easy local development** - No database setup required

---

## Data Source

All practice data is stored in:

```
src/lib/data/cd-practices.json
```

This file contains:

- **practices**: All 51 CD practices with descriptions, requirements, benefits
- **dependencies**: All 89 practice dependencies
- **metadata**: Version, changelog, etc.

---

## Architecture

### File-Based Repository

```javascript
// src/infrastructure/persistence/FilePracticeRepository.js
import data from '$lib/data/cd-practices.json'

export const createFilePracticeRepository = () => ({
	findById: async practiceId => {
		/* ... */
	},
	findAll: async () => {
		/* ... */
	},
	getTransitiveCategories: async practiceId => {
		/* ... */
	}
	// ... other methods
})
```

### Static Site Generation (SSG)

```javascript
// src/routes/+page.js
export const prerender = true // ← Enables SSG
```

All routes and API endpoints are pre-rendered at build time.

---

## Development Workflow

### 1. Editing Practice Data

**Option A: Edit JSON directly**

```bash
# Edit the JSON file manually
vim src/lib/data/cd-practices.json

# Commit changes
git add src/lib/data/cd-practices.json
git commit -m "feat: update practice descriptions"
```

**Option B: Use database for editing, then export**

```bash
# 1. Update database with migrations
npm run db:migrate:local

# 2. Export to JSON
npm run db:export

# 3. Commit the exported JSON
git add src/lib/data/cd-practices.json
git commit -m "feat: add new practice dependencies"
```

### 2. Local Development

```bash
# No database needed!
npm run dev

# Opens at http://localhost:5173
```

### 3. Building for Production

```bash
# Build static site
npm run build

# Preview production build
npm run preview
```

---

## Deployment

### Build Output

The build creates:

- Pre-rendered HTML pages
- Pre-rendered API JSON responses
- Optimized JavaScript bundles
- All static assets

### Deploy to Netlify

```bash
# Netlify auto-deploys on git push
git push origin main

# Or manual deploy
netlify deploy --prod
```

**Zero environment variables needed!** No `DATABASE_URL`, no connection pooling, no database credentials.

---

## Performance Benefits

### Before (Database)

```
Page Load Timeline:
1. Server starts (50ms)
2. HTML sent (100ms)
3. JavaScript loads (200ms)
4. API call to server (50ms)
5. Database query (100ms)
6. Render data (50ms)
───────────────────────
Total: ~550ms + network
```

### After (File-Based SSG)

```
Page Load Timeline:
1. HTML with data sent from CDN (20ms)
2. JavaScript loads (200ms)
3. Hydrate (50ms)
───────────────────────
Total: ~270ms
```

**~50% faster!** Plus instant subsequent loads from CDN cache.

---

## Updating Data

### When to Export from Database

Use the database → export workflow when you need:

- Complex data validation
- Referential integrity checks
- Migration-based updates
- Bulk updates

### When to Edit JSON Directly

Edit JSON directly for:

- Simple text changes
- Adding/removing single items
- Quick fixes
- Documentation updates

---

## Export Script

```bash
npm run db:export
```

This script:

1. Connects to local PostgreSQL
2. Exports all practices, dependencies, and metadata
3. Formats as pretty JSON
4. Saves to `src/lib/data/cd-practices.json`
5. Shows summary (practices count, dependencies count, version)

---

## Data Schema

### Practice Object

```json
{
	"id": "continuous-delivery",
	"name": "Continuous Delivery",
	"type": "root",
	"category": "practice",
	"description": "...",
	"requirements": ["...", "..."],
	"benefits": ["...", "..."]
}
```

### Dependency Object

```json
{
	"practice_id": "continuous-delivery",
	"depends_on_id": "continuous-integration"
}
```

### Metadata Object

```json
{
	"version": "1.5.0",
	"source": "MinimumCD.org",
	"lastUpdated": "2025-10-20",
	"changelog": "..."
}
```

---

## Rollback Strategy

Since data is version controlled:

```bash
# Rollback to previous version
git checkout HEAD~1 -- src/lib/data/cd-practices.json
git commit -m "revert: rollback practice changes"
git push
```

Netlify automatically rebuilds and deploys.

---

## Migration from Database

The migration has already been completed:

1. ✅ Exported current database to JSON
2. ✅ Created file-based repository
3. ✅ Updated API routes to use files
4. ✅ Enabled SSG (prerendering)
5. ✅ Removed database from production dependencies
6. ✅ Updated build process

**Database is now optional** - only needed if you prefer the database-first workflow for edits.

---

## Benefits Summary

| Aspect               | Before (Database)   | After (File-Based) |
| -------------------- | ------------------- | ------------------ |
| **First load**       | ~550ms              | ~270ms (-50%)      |
| **Hosting cost**     | $5-20/month         | $0                 |
| **Environment vars** | DATABASE_URL needed | None               |
| **Local setup**      | Requires PostgreSQL | Just `npm install` |
| **Deployment**       | Database + app      | Static files only  |
| **Caching**          | Complex             | Automatic CDN      |
| **Scalability**      | Limited by DB       | Infinite (CDN)     |
| **Cold starts**      | Yes (serverless)    | None (static)      |

---

## Future Enhancements

Potential improvements:

- GitHub Actions workflow to auto-export on DB changes
- Validation schema for JSON file
- TypeScript types generated from JSON
- Admin UI that edits JSON directly (no database)
- Automated JSON formatting/sorting

---

## Questions?

For issues or questions, see:

- Main README: `/README.md`
- Netlify deploy logs: Netlify dashboard
- Export script: `scripts/export-db-to-json.sh`
- Repository code: `src/infrastructure/persistence/FilePracticeRepository.js`
