# CD Practices Dependency Visualization

Interactive web application to visualize Continuous Delivery practices and their dependencies based on [MinimumCD.org](https://minimumcd.org).

## Status

[![Tests](https://github.com/bdfinst/interactive-cd/actions/workflows/ci.yml/badge.svg)](https://github.com/bdfinst/interactive-cd/actions/workflows/ci.yml)
[![Netlify Status](https://api.netlify.com/api/v1/badges/c3e3e144-dbf9-4bc5-b4a0-e8cd955eb797/deploy-status)](https://app.netlify.com/projects/dojoconsortium/deploys)

## 🎯 Project Overview

This application shows how different Continuous Delivery practices relate to and depend on each other, helping teams
understand the path to achieving CD.

## 🚀 Quick Start (Local Development)

### Prerequisites

- **Node.js** 22+ ([Download](https://nodejs.org/))
- **Git** ([Download](https://git-scm.com/))

### 1. Clone the Repository

```bash
git clone https://github.com/bdfinst/interactive-cd.git
cd interactive-cd
```

### 2. Install Dependencies

```bash
npm ci
```

### 3. Run Development Server

```bash
npm start
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. Run Tests

```bash
# Run unit tests
npm test

# Run E2E tests
npm run test:e2e
```

See the [Testing](#-testing) section for more test commands.

## 📊 Data Architecture

This application uses a **file-based architecture** for simplicity and performance:

- **Data source:** `src/lib/data/cd-practices.json` (46KB)
- **Repository pattern:** `FilePracticeRepository.js` for data access

### Data Structure

```json
{
  "practices": [
    {
      "id": "continuous-delivery",
      "name": "Continuous Delivery",
      "type": "root",
      "category": "practice",
      "description": "...",
      "requirements": [...],
      "benefits": [...]
    }
  ],
  "dependencies": [
    {
      "practice_id": "continuous-delivery",
      "depends_on_id": "continuous-integration"
    }
  ],
  "metadata": {
    "version": "1.5.0",
    "source": "MinimumCD.org"
  }
}
```

See [docs/FILE-BASED-DATA.md](./docs/FILE-BASED-DATA.md) for complete architecture documentation.

## 🎨 Technology Stack

### Frontend

- **SvelteKit**
- **Tailwind CSS**

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

## 🚀 Deployment

### Netlify (Recommended)

The application is a static site and deploys easily to Netlify:

1. **Connect Repository**
   - Push to GitHub
   - Connect repository in Netlify dashboard

2. **Configure Build**
   - Build command: `npm run build`
   - Publish directory: `build`

3. **Deploy**
   - Deploys automatically

### Manual Deployment

```bash
# Build the static site
npm run build

# Deploy the build/ directory to any static hosting provider
```

The build output is a fully static site that can be hosted anywhere (Netlify, Vercel, GitHub Pages, S3, etc.)

See [docs/RELEASE-WORKFLOW.md](./docs/RELEASE-WORKFLOW.md) for automated release process.

## 📖 Documentation

| File                                                    | Description                             |
| ------------------------------------------------------- | --------------------------------------- |
| [CLAUDE.md](./CLAUDE.md)                                | Development guidelines (BDD/TDD/FP)     |
| [docs/practices/](./docs/practices/)                    | **Comprehensive practices guide**       |
| [docs/TESTING-GUIDE.md](./docs/TESTING-GUIDE.md)        | **Complete testing practices**          |
| [docs/FILE-BASED-DATA.md](./docs/FILE-BASED-DATA.md)    | File-based architecture documentation   |
| [docs/RELEASE-WORKFLOW.md](./docs/RELEASE-WORKFLOW.md)  | Automated release process               |
| [docs/COMMIT-CONVENTIONS.md](./docs/COMMIT-CONVENTIONS.md) | Commit message format                |
| [docs/CONTRIBUTING.md](./docs/CONTRIBUTING.md)          | Contributor guidelines and Git workflow |

## 🔧 Available Scripts

| Command            | Description              |
| ------------------ | ------------------------ |
| `npm run dev`      | Start development server |
| `npm run build`    | Build for production     |
| `npm test`         | Run unit tests           |
| `npm run test:e2e` | Run E2E tests            |
| `npm run lint`     | Run ESLint               |

## 🤝 Contributing

This project is based on practices from [MinimumCD.org](https://minimumcd.org) and Bryan Finster's original CD
dependency diagram fro 2015.

**Code Style:** Pure JavaScript (no TypeScript), Functional Programming (no classes), TDD/BDD approach, Conventional Commits

**Adding practices:** Edit `src/lib/data/cd-practices.json` and submit a pull request.

See [docs/CONTRIBUTING.md](./docs/CONTRIBUTING.md) and [docs/COMMIT-CONVENTIONS.md](./docs/COMMIT-CONVENTIONS.md) for details.

## 📄 License

MIT

## 🔗 Resources

- [**MinimumCD.org**](https://minimumcd.org)
- [**2015 Bryan Finster CD Dependency Tree**](./docs/cd-depedency-diagram.md)
