# CD Practices Dependency Visualization

Interactive web application to visualize Continuous Delivery practices and their dependencies based on [MinimumCD.org](https://minimumcd.org).

## 🎯 Project Overview

This application shows how different Continuous Delivery practices relate to and depend on each other, helping teams understand the path to achieving CD maturity.

### Key Features

- 🌳 **Hierarchical visualization** of CD practices
- 🔄 **Interactive graph** - click to expand/collapse dependencies
- 📊 **Multiple categories** - Practice, Tooling, Behavior, Culture
- 🔍 **Drill-down navigation** through practice dependencies
- 📱 **Responsive design** for mobile and desktop
- 🗄️ **Postgres-backed** with unlimited dependency depth
- ⚡ **Functional programming** - Pure functions, immutability, composition

## 📁 Project Structure

```bash
interactive-cd/
├── README.md                    # This file
├── docker-compose.yml           # Local PostgreSQL via Docker
├── CLAUDE.md                    # Development guidelines (BDD/TDD/FP)
│
├── 📂 db/                       # Database files
│   ├── README.md                # Database documentation
│   ├── schema.sql               # Complete database schema
│   ├── seed.sql                 # All practice data
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
│   ├── DATA-STRUCTURE.md        # Data model documentation
│   ├── OOP-vs-FP-comparison.md  # Architecture comparison
│   └── features/                # BDD feature files (Gherkin)
│       └── outline-view.feature
│
├── 📂 src/                      # Application source
│   ├── routes/                  # SvelteKit routes
│   │   ├── +layout.svelte       # Root layout
│   │   ├── +page.svelte         # Home page
│   │   └── api/                 # API endpoints
│   │       └── practices/
│   │           ├── cards/       # Practice cards API
│   │           └── tree/        # Practice tree API
│   │
│   ├── domain/                  # Domain layer (pure functions)
│   │   └── practice-catalog/
│   │       ├── entities/        # Domain entities (CDPractice)
│   │       ├── value-objects/   # Value objects (PracticeId, Category)
│   │       └── repositories/    # Repository interfaces
│   │
│   ├── application/             # Application layer (use cases)
│   │   └── practice-catalog/
│   │       └── GetPracticeTreeService.js
│   │
│   ├── infrastructure/          # Infrastructure layer
│   │   └── persistence/
│   │       ├── db.js            # Database client
│   │       └── PostgresPracticeRepository.js
│   │
│   └── lib/                     # UI components and utilities
│       ├── components/          # Svelte components
│       │   ├── GraphNode.svelte
│       │   ├── PracticeGraph.svelte
│       │   ├── Legend.svelte
│       │   ├── Header.svelte
│       │   └── SEO.svelte
│       └── server/
│           └── db.js            # Server-side database utilities
│
└── 📂 tests/                    # Test suite
    ├── unit/                    # Unit tests (Vitest)
    │   ├── domain/              # Domain layer tests
    │   └── components/          # Component tests
    ├── e2e/                     # End-to-end tests (Playwright)
    │   └── practice-navigation.spec.js
    └── utils/                   # Test utilities
        └── builders.js
```

## 🚀 Quick Start (Local Development with Docker)

### Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **Docker Desktop** ([Download](https://www.docker.com/products/docker-desktop/))
- **Git** ([Download](https://git-scm.com/))

### 1. Clone the Repository

```bash
git clone https://github.com/bdfinst/interactive-cd.git
cd interactive-cd
```

### 2. Start PostgreSQL with Docker

```bash
# Start PostgreSQL container (includes schema and seed data)
docker-compose up -d

# Verify database is running
docker-compose ps

# Check logs if needed
docker-compose logs postgres
```

This will:

- Start PostgreSQL 16 on port 5432
- Create database `interactive_cd` with user `cduser`
- Automatically run schema and seed migrations
- Load all 23 practices from MinimumCD.org

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment

```bash
# Copy the example environment file
cp .env.example .env

# The default values work with Docker setup:
# DATABASE_URL=postgresql://cduser:cdpassword@localhost:5432/interactive_cd
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 6. Run Tests

```bash
npm test
```

See the [Testing](#-testing) section for more test commands.

### 7. Stop Database

```bash
# Stop the database container
docker-compose down

# Stop and remove volumes (deletes all data)
docker-compose down -v
```

## 🗄️ Database Management

### Access PostgreSQL CLI

```bash
# Connect to the database
docker-compose exec postgres psql -U cduser -d interactive_cd

# Or use psql directly if installed locally
psql postgresql://cduser:cdpassword@localhost:5432/interactive_cd
```

### Useful Database Commands

```bash
# View all practices
SELECT id, name, category FROM practices ORDER BY name;

# Count practices by category
SELECT category, COUNT(*) FROM practices GROUP BY category;

# View practice dependencies
SELECT p1.name as practice, p2.name as depends_on
FROM practice_dependencies pd
JOIN practices p1 ON pd.practice_id = p1.id
JOIN practices p2 ON pd.depends_on_id = p2.id
ORDER BY p1.name;

# Get practice tree for Continuous Delivery
SELECT * FROM get_practice_tree('continuous-delivery');
```

### Reset Database

```bash
# Stop and remove containers and volumes
docker-compose down -v

# Restart (will reinitialize database)
docker-compose up -d
```

## 📊 Database Schema

- **`practices`** - Core practices (23 rows) with requirements and benefits
- **`practice_dependencies`** - Relationships (41 dependencies)
- **`metadata`** - Dataset metadata

**Functions:** `get_practice_tree()`, `get_practice_dependencies()`, `would_create_cycle()`

**Views:** `practice_summary`, `leaf_practices`

See [docs/DATABASE.md](./docs/DATABASE.md) for complete schema documentation.

## 🎨 Technology Stack

### Frontend

- **Svelte 4** - Reactive UI framework
- **SvelteKit 2** - Full-stack framework with SSR
- **Tailwind CSS** - Utility-first styling
- **Vite** - Fast build tool

### Backend

- **PostgreSQL 16** - Relational database
- **SvelteKit API Routes** - REST API
- **Node.js** - JavaScript runtime

### Architecture

- **Hexagonal Architecture** - Clean separation of concerns
- **Functional Programming** - Pure functions, immutability, composition
- **Domain-Driven Design** - Rich domain model
- **Test-Driven Development** - Tests first, code second

### Why This Stack?

- ⚡ **Performance** - Svelte compiles to vanilla JS
- 🎯 **Simplicity** - No TypeScript, pure JavaScript
- 📦 **Free hosting** - Netlify free tier
- 🌐 **SEO-friendly** - Server-side rendering
- 🧪 **Testability** - Pure functions are easy to test

## 🧪 Testing

### Unit Tests (Vitest)

```bash
# Run unit tests
npm test

# Watch mode
npm run test:watch

# With UI
npm run test:ui
```

### End-to-End Tests (Playwright)

```bash
# Run E2E tests
npm run test:e2e

# Interactive UI mode
npm run test:e2e:ui
```

### Test Coverage

- **128 tests** currently passing
- **100% coverage** of domain layer
- **E2E tests** for critical user flows

## 🎯 Development Practices

This project follows strict development practices documented in [CLAUDE.md](./CLAUDE.md):

### BDD → ATDD → TDD Workflow

1. **BDD (Behavior-Driven Development)** - Define features with Gherkin
2. **ATDD (Acceptance Test-Driven Development)** - Write acceptance tests
3. **TDD (Test-Driven Development)** - Write unit tests first, then code

### Functional Programming Principles

- ✅ **Pure Functions** - No side effects, referentially transparent
- ✅ **Immutability** - Object.freeze() for all data structures
- ✅ **Function Composition** - Build complex operations from simple functions
- ✅ **No Classes** - Factory functions instead of ES6 classes
- ✅ **Type Safety** - Type markers (\_type) for runtime type checking

## 📚 Practice Categories

- 🔄 **Practice** (3) - Core CD practices
- 🛠️ **Tooling** (17) - Technical infrastructure
- 👥 **Behavior** (2) - Team behaviors
- 🌟 **Culture** (1) - Organizational culture

Example hierarchy: Continuous Delivery → Continuous Integration → Trunk-based Development → Version Control

See [docs/DATA-STRUCTURE.md](./docs/DATA-STRUCTURE.md) for complete data model.

## 🚀 Deployment to Netlify

### Prerequisites

- Netlify account
- Netlify CLI installed: `npm install -g netlify-cli`

### Quick Deploy

```bash
# Login to Netlify
netlify login

# Initialize project
netlify init

# Create Netlify Postgres database
netlify db:create --team-id YOUR_TEAM_ID

# Get database URL
netlify env:set DATABASE_URL $(netlify env:get DATABASE_URL)

# Deploy database schema and data
export DATABASE_URL=$(netlify env:get DATABASE_URL)
./db/deploy-initial.sh

# Deploy application
netlify deploy --prod
```

### Environment Variables

Set in Netlify dashboard or via CLI:

```bash
netlify env:set DATABASE_URL "postgresql://..."
netlify env:set NODE_ENV "production"
```

See [DEPLOYMENT.md](./docs/DEPLOYMENT.md) for detailed deployment instructions.

## 📖 Documentation

| File                                                           | Description                         |
| -------------------------------------------------------------- | ----------------------------------- |
| [CLAUDE.md](./CLAUDE.md)                                       | Development guidelines (BDD/TDD/FP) |
| [docs/PLAN.md](./docs/PLAN.md)                                 | Implementation plan and roadmap     |
| [docs/DATABASE.md](./docs/DATABASE.md)                         | Complete database documentation     |
| [docs/DATABASE-QUICKSTART.md](./docs/DATABASE-QUICKSTART.md)   | Quick reference guide               |
| [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)                     | Netlify deployment steps            |
| [docs/DATA-STRUCTURE.md](./docs/DATA-STRUCTURE.md)             | Data model documentation            |
| [docs/OOP-vs-FP-comparison.md](./docs/OOP-vs-FP-comparison.md) | Architecture comparison             |

## 🔧 Available Scripts

| Command            | Description              |
| ------------------ | ------------------------ |
| `npm run dev`      | Start development server |
| `npm run build`    | Build for production     |
| `npm test`         | Run unit tests           |
| `npm run test:e2e` | Run E2E tests            |
| `npm run lint`     | Run ESLint               |

## 🤝 Contributing

This project is based on practices from [MinimumCD.org](https://minimumcd.org).

**Code Style:** Pure JavaScript (no TypeScript), Functional Programming (no classes), TDD/BDD approach, Conventional Commits

**Adding practices:** See [db/README.md](./db/README.md) for SQL migration instructions.

## 📄 License

MIT

## 🔗 Resources

- **MinimumCD.org**: <https://minimumcd.org>
