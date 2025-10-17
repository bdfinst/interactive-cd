# CD Practices Dependency Visualization

Interactive web application to visualize Continuous Delivery practices and their dependencies based on [MinimumCD.org](https://minimumcd.org).

## 🎯 Project Overview

This application shows how different Continuous Delivery practices relate to and depend on each other, helping teams understand the path to achieving CD maturity.

### Key Features

- 🌳 **Hierarchical visualization** of CD practices
- 🔄 **Interactive graph** - click to expand/collapse dependencies
- 📊 **Multiple categories** - Practice, Tooling, Behavior, Culture
- 🔍 **Search & filter** capabilities
- 📱 **Responsive design** for mobile and desktop
- 🗄️ **Postgres-backed** with unlimited dependency depth

## 📁 Project Structure

```
interactive-cd/
├── README.md                    # This file
│
├── 📂 db/                       # Database files
│   ├── README.md                # Database documentation
│   ├── schema.sql               # Complete database schema
│   ├── seed.sql                 # All-in-one for first release
│   ├── client.example.js        # Database client example
│   ├── deploy-initial.sh        # First deployment script
│   ├── deploy-updates.sh        # Ongoing deployment script
│   ├── migrations/              # Schema migrations
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_add_functions.sql
│   │   └── 003_add_views.sql
│   └── data/                    # Data-only migrations
│       ├── 001_initial_data.sql
│       └── 002_example_new_practice.sql
│
├── 📂 docs/                     # Documentation
│   ├── PLAN.md                  # Implementation plan
│   ├── DATABASE.md              # Database schema docs
│   ├── DATABASE-QUICKSTART.md   # Quick reference
│   ├── DEPLOYMENT.md            # Netlify deployment guide
│   └── DATA-STRUCTURE.md        # Data model documentation
│
└── 📂 src/                      # Frontend (to be implemented)
    ├── lib/
    │   ├── components/          # Svelte components
    │   ├── stores/              # State management
    │   └── server/
    │       └── db.js            # Database client
    └── routes/
        └── api/                 # API endpoints
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL (via Netlify free tier)
- Netlify account

### 1. Setup Database (First Release)

```bash
# Set database connection string
export DATABASE_URL="postgresql://user:pass@host:5432/db"

# Run initial deployment script
./db/deploy-initial.sh

# This will:
# - Create all tables, functions, and views
# - Load initial data (23 practices from MinimumCD.org)
# - Verify the installation

# Expected output: 23 practices loaded
```

### 2. Install Dependencies

```bash
npm install
npm install pg
npm install -D @sveltejs/adapter-netlify
```

### 3. Configure Environment

Create `.env`:

```bash
DATABASE_URL=postgresql://...
```

### 4. Run Development Server

```bash
npm run dev
```

### 5. Deploy to Netlify

```bash
# Deploy application
netlify deploy --prod

# Apply any new data migrations
./db/deploy-updates.sh
```

## 📊 Database Schema

### Tables

- **`practices`** - Core practices table (23 rows)
- **`practice_dependencies`** - Junction table for relationships (41 dependencies)
- **`metadata`** - Dataset metadata

### Key Features

✅ **Unlimited depth** - Supports infinite nesting via recursive queries
✅ **Prevents cycles** - Built-in cycle detection
✅ **Efficient queries** - Optimized indexes and views
✅ **JavaScript-based** - No TypeScript dependencies

### Example Queries

```sql
-- Get practice tree
SELECT * FROM get_practice_tree('continuous-delivery');

-- Get practice dependencies
SELECT * FROM get_practice_dependencies('continuous-integration');

-- Get leaf practices (no dependencies)
SELECT * FROM leaf_practices;

-- Check for circular dependency
SELECT would_create_cycle('practice-a', 'practice-b');
```

## 🎨 Technology Stack

### Frontend
- **Svelte/SvelteKit** - Reactive UI framework
- **D3.js** or **Svelvet** - Graph visualization
- **Tailwind CSS** - Styling

### Backend
- **Netlify Postgres** - Database (free tier)
- **SvelteKit API routes** - REST API
- **PostgreSQL** - Relational database

### Why This Stack?

- ⚡ **Performance** - Svelte compiles to vanilla JS (smaller bundles)
- 🎯 **Built-in reactivity** - No useState or hooks needed
- 📦 **Free hosting** - Netlify free tier includes Postgres
- 🌐 **SEO-friendly** - SSR with SvelteKit

## 📚 Data Model

### Practice Structure

Each practice in the database has:

- **id** - Unique identifier (kebab-case)
- **name** - Human-readable name
- **type** - `root` or `practice`
- **category** - `practice`, `tooling`, `behavior`, or `culture`
- **description** - Detailed explanation
- **requirements** - JSONB array of implementation requirements
- **benefits** - JSONB array of benefits
- **dependencies** - Related practices via junction table

### Categories

- 🔄 **Practice** (3) - Core CD practices
- 🛠️ **Tooling** (17) - Technical infrastructure
- 👥 **Behavior** (2) - Team behaviors
- 🌟 **Culture** (1) - Organizational culture

### Hierarchy Example

```
🎯 Continuous Delivery (root)
   ├── 🔄 Continuous Integration
   │   ├── 👥 Trunk-based Development
   │   │   ├── 🛠️ Version Control
   │   │   └── 🛠️ Feature Flags
   │   ├── 🔄 Automated Testing
   │   └── 🛠️ Build Automation
   ├── 🛠️ Application Pipeline
   └── 🛠️ Immutable Artifact
```

## 🔧 Development

### Database Migrations

```bash
# Run all migrations
for f in db/migrations/*.sql; do
  psql $DATABASE_URL -f $f
done

# Or use the all-in-one schema
psql $DATABASE_URL -f db/schema.sql
```

### Validate Database

```bash
# Check practice count
psql $DATABASE_URL -c "SELECT COUNT(*) FROM practices;"

# Check dependencies
psql $DATABASE_URL -c "SELECT COUNT(*) FROM practice_dependencies;"

# View practice summary
psql $DATABASE_URL -c "SELECT * FROM practice_summary ORDER BY dependent_count DESC;"
```

### Export Data

```bash
# Export practices to JSON
psql $DATABASE_URL -c "SELECT json_agg(p) FROM practices p;" > practices-export.json

# Backup entire database
pg_dump $DATABASE_URL > backup.sql
```

## 📖 Documentation

| File | Description |
|------|-------------|
| [docs/PLAN.md](docs/PLAN.md) | Implementation plan and roadmap |
| [docs/DATABASE.md](docs/DATABASE.md) | Complete database documentation |
| [docs/DATABASE-QUICKSTART.md](docs/DATABASE-QUICKSTART.md) | Quick reference guide |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Netlify deployment steps |
| [docs/DATA-STRUCTURE.md](docs/DATA-STRUCTURE.md) | Data model documentation |

## 🧪 Testing

### Validate Database Integrity

```bash
# Check for orphaned dependencies
psql $DATABASE_URL -c "
  SELECT pd.* FROM practice_dependencies pd
  LEFT JOIN practices p1 ON pd.practice_id = p1.id
  LEFT JOIN practices p2 ON pd.depends_on_id = p2.id
  WHERE p1.id IS NULL OR p2.id IS NULL;
"
# Should return 0 rows

# Verify no cycles
psql $DATABASE_URL -c "
  SELECT * FROM practices p
  WHERE exists(
    SELECT 1 FROM get_practice_ancestors(p.id)
    WHERE id = p.id AND level > 0
  );
"
# Should return 0 rows
```

### Test API Routes

```bash
# Get all practices
curl http://localhost:5173/api/practices

# Get practice tree
curl http://localhost:5173/api/tree?root=continuous-delivery

# Get single practice
curl http://localhost:5173/api/practices/continuous-integration
```

## 🚀 Deployment

### Netlify Setup

1. Create Netlify Postgres database (free tier)
2. Set `DATABASE_URL` environment variable
3. Run migrations on Netlify database
4. Deploy SvelteKit app

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for detailed steps.

### Production Checklist

- [ ] Database schema applied
- [ ] Seed data loaded
- [ ] Environment variables set
- [ ] API routes tested
- [ ] Frontend connected to API
- [ ] Error handling implemented
- [ ] Performance optimized
- [ ] SEO metadata added
- [ ] Analytics configured

## 📊 Database Statistics

- **Total Practices**: 23
- **Total Dependencies**: 41
- **Database Size**: ~100 KB
- **Max Depth**: 4 levels
- **Leaf Nodes**: 7 (foundation practices)

### Most Critical Practices

1. **Version Control** - 6 dependents
2. **Build Automation** - 5 dependents
3. **Configuration Management** - 4 dependents
4. **Automated Testing** - 3 dependents
5. **Deployment Automation** - 3 dependents

## 🎯 Roadmap

### Phase 1: Foundation ✅
- [x] Data model design
- [x] Database schema
- [x] Seed data (23 practices from MinimumCD.org)
- [x] Documentation

### Phase 2: Backend (In Progress)
- [ ] SvelteKit setup
- [ ] Database client
- [ ] API routes
- [ ] Error handling
- [ ] Testing

### Phase 3: Frontend
- [ ] Graph visualization
- [ ] Interactive nodes
- [ ] Search/filter
- [ ] Detail panels
- [ ] Responsive design

### Phase 4: Polish
- [ ] Animations
- [ ] Mobile optimization
- [ ] Performance tuning
- [ ] Analytics
- [ ] SEO

## 🤝 Contributing

This project is based on practices from [MinimumCD.org](https://minimumcd.org).

### Adding New Practices

New practices are added via data migration files as part of the deployment process.

**Step 1: Create Migration File**

```bash
# Copy the template
cp db/data/002_example_new_practice.sql db/data/003_my_new_practice.sql
```

**Step 2: Edit the Migration**

```sql
-- db/data/003_my_new_practice.sql
BEGIN;

INSERT INTO practices (id, name, type, category, description, requirements, benefits)
VALUES (
  'my-new-practice',
  'My New Practice',
  'practice',
  'tooling',
  'Description here',
  '["Requirement 1", "Requirement 2"]'::jsonb,
  '["Benefit 1", "Benefit 2"]'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  requirements = EXCLUDED.requirements,
  benefits = EXCLUDED.benefits;

-- Add dependencies
INSERT INTO practice_dependencies (practice_id, depends_on_id)
VALUES ('my-new-practice', 'version-control')
ON CONFLICT DO NOTHING;

COMMIT;
```

**Step 3: Test and Deploy**

```bash
# Test locally
psql $DATABASE_URL -f db/data/003_my_new_practice.sql

# Commit to git
git add db/data/003_my_new_practice.sql
git commit -m "Add new practice: My New Practice"

# Deploy
git push
netlify deploy --prod
./db/deploy-updates.sh
```

See [db/README.md](db/README.md) for detailed instructions.

## 📄 License

MIT

## 🔗 Resources

- **MinimumCD.org**: https://minimumcd.org
- **Svelte**: https://svelte.dev
- **SvelteKit**: https://kit.svelte.dev
- **Netlify Postgres**: https://docs.netlify.com/databases/overview/
- **D3.js**: https://d3js.org

---

**Status**: Database schema complete ✅ | Frontend in progress ⏳

**Last Updated**: 2025-10-17
