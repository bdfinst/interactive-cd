# Database Archive

**Note:** These files are no longer used in production but are preserved for reference.

## What's Here

- **db/** - Database migrations and scripts (PostgreSQL)
- **export-db-to-json.sh** - Script to export database to JSON

## Why Archived?

The application now uses **file-based data** instead of a database:
- Data stored in: `src/lib/data/cd-practices.json`
- No database needed for production
- Zero database hosting costs
- Faster page loads (no queries)
- Data version controlled in Git

## If You Need Database Access

If you want to use the database for editing data (then export to JSON):

1. **Setup PostgreSQL locally:**
   ```bash
   createdb interactive_cd
   ```

2. **Run migrations:**
   ```bash
   bash archive/database/db/migrate-local.sh
   ```

3. **Export to JSON:**
   ```bash
   bash archive/database/export-db-to-json.sh
   ```

4. **Commit the JSON:**
   ```bash
   git add src/lib/data/cd-practices.json
   git commit -m "feat: update practice data"
   ```

## Recommended Workflow

**For small changes:** Edit `src/lib/data/cd-practices.json` directly

**For bulk updates:** Use database → export → commit

---

**Last Updated:** 2025-10-20
**Status:** Archived (not required for production)
