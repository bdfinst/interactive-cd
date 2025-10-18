# CD Dependency Visualization App - Implementation Plan

> **⚠️ Historical Document**: This is the original planning document created before implementation. Code examples show class-based OOP approach, but the **actual implementation uses Functional Programming** (pure functions, factory functions, Object.freeze). See [OOP-vs-FP-comparison.md](./OOP-vs-FP-comparison.md) for details on the architectural decision. For current code patterns, see the actual implementation in `/src`.

## Overview

Build a web application to visualize how different activities impact Continuous Delivery, showing dependencies between practices, tooling, behaviors, and culture based on MinimumCD.org.

## Data from MinimumCD.org

### Core Continuous Delivery Practices

1. **Continuous Integration (CI)**
2. **Application Pipeline**
3. **Immutable Artifact**
4. **Production-like Test Environment**

### Practice Requirements

#### Continuous Delivery Minimum Requirements

- Use Continuous Integration
- Application pipeline is the only deployment method
- Pipeline determines releasability of changes
- Create immutable artifacts
- Stop feature work when pipeline fails
- Maintain production-like test environment
- Enable on-demand rollback
- Deploy application configuration with artifact

#### Continuous Integration Minimum Requirements

- Use Trunk-based Development
- Integrate work to trunk at least daily
- Automated testing before merging to trunk
- Automatically test work with other work on merge
- Stop feature work when build fails
- Ensure new work doesn't break existing work

#### Trunk-based Development Minimum Requirements

- All changes integrate into trunk
- If branches are used:
  - Originate from trunk
  - Re-integrate to trunk
  - Short-lived and removed after merge

### Dependency Hierarchy

- **Trunk-based Development** is prerequisite for **Continuous Integration**
- **Continuous Integration** is prerequisite for **Continuous Delivery**

## 1. Domain Model Design

### Overview

This application is built around the **Continuous Delivery domain** as defined by MinimumCD.org. The domain model reflects the deep knowledge of CD practices, their relationships, and how teams adopt them.

### Ubiquitous Language

Core terms used throughout the codebase, matching MinimumCD.org vocabulary:

- **Practice** - A CD behavior or process (e.g., Continuous Integration, Trunk-based Development)
- **Platform Capability** - A tooling or infrastructure capability (e.g., Version Control System, Build Automation)
- **Prerequisite** - A dependency on another practice or platform capability
- **Practice Prerequisite** - Depends on adopting another practice first
- **Capability Prerequisite** - Depends on having a platform capability available
- **Foundation** - A practice or capability with no prerequisites (leaf node)
- **Journey** - The path a team takes to adopt CD practices
- **Readiness** - How prepared a team is to adopt a practice
- **Requirement** - What must be implemented to satisfy a practice
- **Benefit** - The value gained from adopting a practice
- **Maturity** - Current level of CD capability
- **Blocker** - Something preventing practice adoption

### Bounded Contexts

This application spans three bounded contexts:

1. **Practice Catalog** (Core Domain) - Authoritative source for CD practices
2. **Journey Planning** (Core Domain) - Help teams plan adoption paths
3. **Visualization** (Supporting) - Present practices visually

#### 1. Practice Catalog Context (Core Domain)

**Purpose**: Maintain authoritative definitions of CD practices and platform capabilities

**Aggregate: CDPractice**

```javascript
class CDPractice {
	constructor(id, name, category, description) {
		this.id = PracticeId.from(id)
		this.name = name
		this.category = PracticeCategory.from(category)
		this.description = description
		this.practicePrerequisites = []
		this.capabilityPrerequisites = []
		this.requirements = []
		this.benefits = []
	}

	// Domain behavior - Practice dependencies
	requiresPractice(practiceId, rationale, type = PrerequisiteType.REQUIRED) {
		const prereq = new PracticePrerequisite(practiceId, rationale, type)
		this.validateNoCycles(prereq)
		this.practicePrerequisites.push(prereq)
		this.recordEvent(new PracticePrerequisiteAdded(this.id, practiceId))
	}

	// Domain behavior - Platform capability dependencies
	requiresCapability(capabilityId, rationale, type = PrerequisiteType.REQUIRED) {
		const prereq = new CapabilityPrerequisite(capabilityId, rationale, type)
		this.capabilityPrerequisites.push(prereq)
		this.recordEvent(new CapabilityPrerequisiteAdded(this.id, capabilityId))
	}

	canBeAdoptedBy(teamContext) {
		const hasPractices = this.practicePrerequisites
			.filter(p => p.isRequired())
			.every(p => teamContext.hasPractice(p.practiceId))

		const hasCapabilities = this.capabilityPrerequisites
			.filter(c => c.isRequired())
			.every(c => teamContext.hasCapability(c.capabilityId))

		return hasPractices && hasCapabilities
	}

	assessReadiness(teamContext) {
		const scores = this.requirements.map(req => req.assessReadiness(teamContext))
		return ReadinessScore.average(scores)
	}

	getAllPrerequisites() {
		return [...this.practicePrerequisites, ...this.capabilityPrerequisites]
	}
}
```

**Aggregate: PlatformCapability**

```javascript
class PlatformCapability {
	constructor(id, name, category, description) {
		this.id = CapabilityId.from(id)
		this.name = name
		this.category = CapabilityCategory.from(category)
		this.description = description
		this.capabilityPrerequisites = []
		this.implementationOptions = []
	}

	// Domain behavior - Capabilities can depend on other capabilities
	requiresCapability(capabilityId, rationale) {
		const prereq = new CapabilityPrerequisite(capabilityId, rationale)
		this.capabilityPrerequisites.push(prereq)
	}

	addImplementationOption(name, vendor, notes) {
		const option = new ImplementationOption(name, vendor, notes)
		this.implementationOptions.push(option)
	}

	isAvailableFor(teamContext) {
		return this.capabilityPrerequisites.every(c => teamContext.hasCapability(c.capabilityId))
	}
}
```

**Value Objects:**

- `PracticeId` - Type-safe practice identifier
- `CapabilityId` - Type-safe capability identifier
- `PracticeCategory` - PRACTICE | BEHAVIOR | CULTURE
- `CapabilityCategory` - TOOLING | INFRASTRUCTURE | PLATFORM
- `PracticePrerequisite` - {practiceId, rationale, type, isOptional}
- `CapabilityPrerequisite` - {capabilityId, rationale, type, isOptional}
- `Requirement` - {text, validationRule}
- `Benefit` - {description, measurableCriteria}
- `ImplementationOption` - {name, vendor, notes}
- `PrerequisiteType` - REQUIRED | RECOMMENDED | COMPLEMENTARY

**Domain Events:**

- `PracticeAdded` - New practice added to catalog
- `CapabilityAdded` - New platform capability added
- `PracticePrerequisiteAdded` - Practice now depends on another practice
- `CapabilityPrerequisiteAdded` - Practice/capability now depends on a capability
- `PracticeUpdated` - Practice definition changed

**Repositories:**

```javascript
class PracticeRepository {
	async findById(practiceId) {
		/* ... */
	}
	async findAll() {
		/* ... */
	}
	async findByCategory(category) {
		/* ... */
	}
	async findPracticePrerequisites(practiceId) {
		/* ... */
	}
	async findCapabilityPrerequisites(practiceId) {
		/* ... */
	}
	async findDependents(practiceId) {
		/* ... */
	}
	async save(practice) {
		/* ... */
	}
}

class CapabilityRepository {
	async findById(capabilityId) {
		/* ... */
	}
	async findAll() {
		/* ... */
	}
	async findByCategory(category) {
		/* ... */
	}
	async findPrerequisites(capabilityId) {
		/* ... */
	}
	async save(capability) {
		/* ... */
	}
}
```

#### 2. Journey Planning Context (Core Domain)

**Purpose**: Help teams plan their CD adoption journey

**Aggregate: AdoptionJourney**

```javascript
class AdoptionJourney {
	constructor(targetPracticeId, teamContext) {
		this.id = JourneyId.generate()
		this.targetPractice = targetPracticeId
		this.teamContext = teamContext
		this.steps = []
		this.currentStep = null
	}

	// Domain behavior
	addStep(practice, estimatedDuration) {
		const step = new JourneyStep(practice.id, practice.name, estimatedDuration)
		this.validateStepOrder(step)
		this.steps.push(step)
	}

	completeCurrentStep() {
		if (!this.currentStep) throw new Error('No step in progress')
		this.currentStep.markComplete()
		this.recordEvent(new StepCompleted(this.id, this.currentStep.id))
		this.currentStep = this.getNextStep()
	}

	calculateProgress() {
		const completed = this.steps.filter(s => s.isComplete()).length
		return completed / this.steps.length
	}
}
```

**Domain Service: JourneyPlanner**

```javascript
class JourneyPlanner {
	constructor(practiceRepository) {
		this.practiceRepository = practiceRepository
	}

	async planJourney(targetPracticeId, teamContext) {
		const target = await this.practiceRepository.findById(targetPracticeId)
		const allPrereqs = await this.getAllPrerequisites(target)
		const missing = allPrereqs.filter(p => !teamContext.hasPractice(p.id))
		const ordered = this.topologicalSort(missing)

		const journey = new AdoptionJourney(targetPracticeId, teamContext)
		for (const practice of ordered) {
			const duration = this.estimateDuration(practice, teamContext)
			journey.addStep(practice, duration)
		}

		return journey
	}

	// Domain logic for optimal path finding
	async getAllPrerequisites(practice) {
		/* ... */
	}
	topologicalSort(practices) {
		/* ... */
	}
	estimateDuration(practice, context) {
		/* ... */
	}
}
```

#### 3. Visualization Context (Supporting Subdomain)

**Purpose**: Present practices in interactive visual formats

**Anti-Corruption Layer**: Translate between domain and UI

```javascript
class PracticePresenter {
	// Translates domain to UI representation
	static toGraphNode(cdPractice) {
		return {
			id: cdPractice.id.toString(),
			label: cdPractice.name,
			icon: cdPractice.category.icon,
			color: this.categoryColor(cdPractice.category),
			requirementCount: cdPractice.getRequirements().length,
			benefitCount: cdPractice.getBenefits().length
		}
	}

	static toGraphEdge(prerequisite) {
		return {
			from: prerequisite.practiceId.toString(),
			to: prerequisite.dependentId.toString(),
			type: prerequisite.type.toString(),
			style: prerequisite.isOptional() ? 'dashed' : 'solid'
		}
	}
}
```

### Domain Model Rules (Invariants)

1. **Practice Catalog:**
   - Every practice must have at least one requirement
   - Every practice must have at least one benefit
   - Prerequisites cannot create cycles
   - Practice IDs must be unique and immutable

2. **Journey Planning:**
   - Journey target must be a valid practice
   - Steps must satisfy prerequisite order
   - Cannot complete steps out of order
   - Team context must be provided

3. **Cross-Context:**
   - Journey planning depends on practice catalog
   - Changes to practice prerequisites invalidate existing journeys

### Persistence Mapping

The domain model maps to PostgreSQL tables:

**practices table** → `CDPractice` aggregate

- Stores practice entity state
- JSONB for requirements and benefits arrays

**platform_capabilities table** → `PlatformCapability` aggregate

- Stores capability entity state
- JSONB for implementation options

**practice_dependencies table** → Practice-to-Practice prerequisites

- Junction table: practice_id → depends_on_practice_id

**practice_capability_dependencies table** → Practice-to-Capability prerequisites

- Junction table: practice_id → depends_on_capability_id

**capability_dependencies table** → Capability-to-Capability prerequisites

- Junction table: capability_id → depends_on_capability_id

**Repository Pattern** handles translation:

- Database rows → Rich domain objects
- Domain objects → Database representation
- Maintains aggregate boundaries
- Handles polymorphic prerequisite queries

### Practice and Capability Hierarchy

- **Goal:** Continuous Delivery (practice)
  - **Practice Prerequisites:**
    - Continuous Integration (practice)
      - **Practice Prerequisites:** Trunk-based Development (practice)
      - **Capability Prerequisites:** Version Control System, Build Automation, Test Automation Framework
    - Application Pipeline (practice)
      - **Capability Prerequisites:** CI/CD Platform, Deployment Automation
  - **Capability Prerequisites:**
    - Production-like Test Environment (capability)
    - Artifact Repository (capability)

**Key Distinction:**

- **Practices** = What teams DO (behaviors, processes)
- **Capabilities** = What platforms PROVIDE (tools, infrastructure)

**Example:**

- **"Trunk-based Development"** is a practice (team behavior)
- **"Version Control System"** is a capability (Git, SVN, etc.)
- **"Continuous Integration"** practice requires:
  - **Practice:** Trunk-based Development (must adopt the behavior first)
  - **Capabilities:** Version Control System, Build Automation (must have the tools)

### Key Design Decisions

1. **Rich Domain Model** - Business logic lives in domain objects, not services
2. **Functional Core** - Value objects are immutable, use functional patterns
3. **Event-Driven** - Domain events capture what happened
4. **Bounded Contexts** - Clear boundaries between practice catalog and journey planning
5. **Dependency Inversion** - Domain defines interfaces, infrastructure implements

## 2. Technology Stack

### Frontend

- **Svelte** - Lightweight, reactive component framework with no virtual DOM
- **SvelteKit** - Full-stack framework with routing and SSR support
- **D3.js** or **Svelvet** - Interactive graph visualization library
- **Tailwind CSS** - Utility-first styling
- **Svelte Motion** or native Svelte transitions - Smooth animations

### Backend

- **PostgreSQL** - Relational database (via Netlify Postgres free tier)
- **SvelteKit API routes** - REST API endpoints
- **Node.js** - Server runtime

### Data & Persistence

- **PostgreSQL** with recursive CTEs for unlimited dependency depth
- **pg** library for database client
- Repository pattern for data access
- Initial data from MinimumCD.org (23 practices)

### Build Tools

- **Vite** - Fast development and build (built into SvelteKit)
- **JavaScript** - Pure JS, no TypeScript
- **Vitest** - Unit and integration testing
- **Playwright** - E2E testing

### Additional Libraries

- **Svelte Stores** - Built-in reactive state management
- **SvelteKit routing** - File-based routing (built-in)
- Native Svelte fetch capabilities

### Development Approach

- **BDD** - Gherkin feature files for specifications
- **ATDD** - Acceptance tests from BDD scenarios
- **TDD** - Test-first development
- **Functional Programming** - Pure functions, immutability, composition
- **DDD** - Domain-driven design with rich domain models

### Why Svelte?

**Performance Benefits:**

- No virtual DOM - compiles to vanilla JavaScript
- Smaller bundle sizes (typically 50-70% smaller than React)
- Faster runtime performance for animations and transitions
- Better for interactive visualizations with frequent updates

**Developer Experience:**

- Less boilerplate code than React
- Built-in reactivity without hooks
- Native transitions and animations
- Scoped CSS by default
- Works great with pure JavaScript

**Perfect for This Project:**

- Graph visualizations benefit from direct DOM manipulation
- Smooth animations are critical for expand/collapse UX
- Smaller bundle = faster initial load for users
- Reactive stores ideal for managing domain state

## 3. UI/UX Flow

### Initial State

```
┌─────────────────────────┐
│   Start Your CD Journey │
│         [Button]         │
└─────────────────────────┘
```

### Expanded State (Example)

```
                    ┌──────────────────┐
                    │ Continuous       │
                    │ Delivery         │
                    └──────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
   ┌─────────┐      ┌─────────────┐    ┌──────────┐
   │   CI    │      │  Pipeline   │    │ Artifact │
   └─────────┘      └─────────────┘    └──────────┘
        │
   ┌─────────┐
   │  TBD    │
   └─────────┘
```

### Interaction Patterns

- **Click node** → Expand/collapse children
- **Hover** → Show tooltip with description
- **Double-click** → Open detail panel
- **Drag** → Pan canvas
- **Scroll** → Zoom in/out
- **Color coding** → Category visualization (tooling/behavior/culture)

### Visual Design

- Clean, modern interface
- Node styling by category type
- Connecting lines showing dependencies
- Smooth expand/collapse animations
- Responsive layout for mobile/tablet

## 4. Key Features

### Core Features

1. **Progressive disclosure** - Start simple, reveal complexity on demand
2. **Interactive graph** - Pan, zoom, click to navigate dependency tree
3. **Search/filter** - Find specific practices quickly
4. **Breadcrumb navigation** - Track path through hierarchy
5. **Detail panel** - Show full requirements when node selected
6. **Visual indicators** - Icons for practice categories

### Enhanced Features

7. **Export/share** - Generate custom learning paths
8. **Bookmarks** - Save favorite practices
9. **Progress tracking** - Mark practices as "implemented" or "in progress"
10. **Related practices** - Show connections beyond direct dependencies

### Future Enhancements

- Multi-language support
- Community contributions for practices
- Integration with assessment tools
- Customizable views (timeline, checklist, etc.)

## 5. Implementation Phases

### Phase 1: Foundation (Week 1)

- Set up project structure with SvelteKit
- Create TypeScript interfaces for data model
- Build practices.json with MinimumCD data
- Basic routing and layout components

**Deliverables:**

- Working dev environment
- Data structure defined
- Basic app shell

### Phase 2: Visualization (Week 2)

- Implement interactive graph with D3.js or Svelvet
- Build Node component with category styling
- Add expand/collapse animations using Svelte transitions
- Implement pan/zoom functionality

**Deliverables:**

- Interactive dependency graph
- Smooth animations
- Basic navigation

### Phase 3: Interactivity (Week 3)

- Click handlers for node expansion
- Detail panel with practice information
- Search and filter functionality
- Breadcrumb navigation

**Deliverables:**

- Full interaction model
- Search/filter working
- Detail views implemented

### Phase 4: Enhancement (Week 4)

- Progressive loading for performance
- Mobile-responsive design
- Custom learning path builder
- Export/share functionality
- Testing and refinement

**Deliverables:**

- Production-ready application
- Mobile support
- Export features
- Comprehensive testing

## 6. Layered Architecture & Project Structure

### Architecture Layers

```
┌─────────────────────────────────────┐
│         Presentation Layer          │
│  (Svelte UI, API Routes)            │
└────────┬──────────────┬─────────────┘
         │              │
         ▼              ▼
┌────────────────┐  ┌──────────────┐
│  Application   │  │    Domain    │
│     Layer      │──│     Layer    │
│  (Use Cases)   │  │ (Pure Logic) │
└────────┬───────┘  └──────────────┘
         │
         ▼
┌──────────────────┐
│  Infrastructure  │
│  (PostgreSQL)    │
└──────────────────┘
```

**Key Principles:**

- Domain layer has **no dependencies** on infrastructure or UI
- Infrastructure implements **interfaces defined in domain**
- Application layer **orchestrates** domain objects
- Presentation layer uses **anti-corruption layer** to translate domain to UI

### Directory Structure

```
interactive-cd/
├── db/                              # Database files
│   ├── schema.sql                   # Complete database schema
│   ├── seed.sql                     # Initial data
│   ├── migrations/                  # Schema migrations
│   ├── data/                        # Data migrations
│   └── deploy-*.sh                  # Deployment scripts
│
├── docs/                            # Documentation
│   ├── features/                    # BDD Gherkin feature files
│   │   └── outline-view.feature
│   ├── PLAN.md
│   ├── DATABASE.md
│   └── DEPLOYMENT.md
│
├── src/
│   ├── domain/                      # Pure domain logic (no framework dependencies)
│   │   ├── practice-catalog/        # Bounded context
│   │   │   ├── entities/
│   │   │   │   ├── CDPractice.js
│   │   │   │   └── PlatformCapability.js
│   │   │   ├── value-objects/
│   │   │   │   ├── PracticeId.js
│   │   │   │   ├── CapabilityId.js
│   │   │   │   ├── PracticeCategory.js
│   │   │   │   ├── CapabilityCategory.js
│   │   │   │   ├── PracticePrerequisite.js
│   │   │   │   ├── CapabilityPrerequisite.js
│   │   │   │   ├── PrerequisiteType.js
│   │   │   │   ├── Requirement.js
│   │   │   │   ├── Benefit.js
│   │   │   │   └── ImplementationOption.js
│   │   │   ├── services/
│   │   │   │   └── DependencyValidator.js
│   │   │   ├── repositories/
│   │   │   │   ├── PracticeRepository.js       # Interface
│   │   │   │   └── CapabilityRepository.js     # Interface
│   │   │   ├── events/
│   │   │   │   ├── PracticeAdded.js
│   │   │   │   ├── CapabilityAdded.js
│   │   │   │   ├── PracticePrerequisiteAdded.js
│   │   │   │   └── CapabilityPrerequisiteAdded.js
│   │   │   └── errors/
│   │   │       └── InvalidPrerequisiteError.js
│   │   │
│   │   └── journey-planning/        # Bounded context (future)
│   │       ├── entities/
│   │       │   ├── AdoptionJourney.js
│   │       │   └── JourneyStep.js
│   │       ├── value-objects/
│   │       │   ├── ReadinessScore.js
│   │       │   ├── TeamContext.js
│   │       │   └── AdoptionDifficulty.js
│   │       └── services/
│   │           └── JourneyPlanner.js
│   │
│   ├── application/                 # Application services (use cases)
│   │   ├── practice-catalog/
│   │   │   ├── AddPracticeService.js
│   │   │   ├── AddCapabilityService.js
│   │   │   ├── UpdatePracticeService.js
│   │   │   ├── GetPracticeTreeService.js
│   │   │   └── GetFullTreeService.js    # Practices + Capabilities
│   │   └── journey-planning/        # Future
│   │       ├── CreateJourneyService.js
│   │       └── AssessReadinessService.js
│   │
│   ├── infrastructure/              # Infrastructure implementations
│   │   ├── persistence/
│   │   │   ├── PostgresPracticeRepository.js
│   │   │   ├── PostgresCapabilityRepository.js
│   │   │   ├── InMemoryPracticeRepository.js    # For testing
│   │   │   ├── InMemoryCapabilityRepository.js  # For testing
│   │   │   └── db.js                # Database client
│   │   └── events/
│   │       └── SimpleEventBus.js
│   │
│   ├── lib/                         # Presentation layer
│   │   ├── components/              # Svelte components
│   │   │   ├── PracticeOutline.svelte
│   │   │   ├── PracticeCard.svelte
│   │   │   ├── PracticeGraph.svelte    # Future
│   │   │   └── JourneyPlanner.svelte   # Future
│   │   ├── stores/
│   │   │   └── practiceStore.js     # UI state management
│   │   ├── adapters/                # Anti-corruption layer
│   │   │   ├── PracticePresenter.js      # Domain → UI translation
│   │   │   └── CapabilityPresenter.js    # Domain → UI translation
│   │   └── utils/
│   │       └── formatters.js        # UI utilities
│   │
│   ├── routes/                      # SvelteKit routes
│   │   ├── +page.svelte             # Home page (outline view)
│   │   ├── +layout.svelte           # App layout
│   │   └── api/
│   │       ├── practices/
│   │       │   ├── +server.js       # GET /api/practices
│   │       │   └── tree/
│   │       │       └── +server.js   # GET /api/practices/tree
│   │       ├── capabilities/
│   │       │   └── +server.js       # GET /api/capabilities
│   │       └── tree/
│   │           └── +server.js       # GET /api/tree (full hierarchy)
│   │
│   └── app.css                      # Global styles
│
├── tests/
│   ├── unit/                        # Unit tests (Vitest)
│   │   ├── domain/
│   │   │   └── practice-catalog/
│   │   │       ├── CDPractice.test.js
│   │   │       ├── PlatformCapability.test.js
│   │   │       ├── PracticeCategory.test.js
│   │   │       ├── PracticePrerequisite.test.js
│   │   │       └── CapabilityPrerequisite.test.js
│   │   └── application/
│   ├── integration/                 # Integration tests (Vitest)
│   │   └── repositories/
│   │       ├── PostgresPracticeRepository.test.js
│   │       └── PostgresCapabilityRepository.test.js
│   └── e2e/                         # E2E tests (Playwright)
│       └── outline-view.spec.js
│
├── .claude/                         # Claude Code agents
│   └── agents/
│       ├── bdd-expert.md
│       ├── ddd-expert.md
│       └── test-quality-reviewer.md
│
├── package.json
├── svelte.config.js
├── vite.config.js
├── playwright.config.js
├── tailwind.config.js
├── CLAUDE.md                        # Development guide
└── README.md
```

### First Release Scope (Outline View Only)

For the first release, we're implementing only the **outline view** from the BDD feature file:

**In Scope:**

- Domain layer: `CDPractice` entity with basic behavior
- Application layer: `GetPracticeTreeService`
- Infrastructure layer: `PostgresPracticeRepository`
- Presentation layer: `PracticeOutline.svelte`
- API route: `GET /api/practices/tree`

**Out of Scope (Future Releases):**

- Journey planning bounded context
- Interactive graph visualization
- Search and filter
- User progress tracking
- Expand/collapse functionality

## 7. Domain Model Examples

### Database Schema (PostgreSQL)

The persistence layer stores domain objects:

```sql
-- Practices table stores CDPractice aggregates
CREATE TABLE practices (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('root', 'practice')),
  category VARCHAR(50) NOT NULL CHECK (category IN ('practice', 'behavior', 'culture')),
  description TEXT NOT NULL,
  requirements JSONB NOT NULL DEFAULT '[]',
  benefits JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Platform capabilities table stores PlatformCapability aggregates
CREATE TABLE platform_capabilities (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('tooling', 'infrastructure', 'platform')),
  description TEXT NOT NULL,
  implementation_options JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Practice-to-Practice dependencies
CREATE TABLE practice_dependencies (
  practice_id VARCHAR(255) REFERENCES practices(id),
  depends_on_practice_id VARCHAR(255) REFERENCES practices(id),
  rationale TEXT,
  prerequisite_type VARCHAR(50) NOT NULL DEFAULT 'required' CHECK (prerequisite_type IN ('required', 'recommended', 'complementary')),
  PRIMARY KEY (practice_id, depends_on_practice_id)
);

-- Practice-to-Capability dependencies
CREATE TABLE practice_capability_dependencies (
  practice_id VARCHAR(255) REFERENCES practices(id),
  depends_on_capability_id VARCHAR(255) REFERENCES platform_capabilities(id),
  rationale TEXT,
  prerequisite_type VARCHAR(50) NOT NULL DEFAULT 'required' CHECK (prerequisite_type IN ('required', 'recommended', 'complementary')),
  PRIMARY KEY (practice_id, depends_on_capability_id)
);

-- Capability-to-Capability dependencies
CREATE TABLE capability_dependencies (
  capability_id VARCHAR(255) REFERENCES platform_capabilities(id),
  depends_on_capability_id VARCHAR(255) REFERENCES platform_capabilities(id),
  rationale TEXT,
  PRIMARY KEY (capability_id, depends_on_capability_id)
);

-- Indexes for efficient querying
CREATE INDEX idx_practice_deps_practice ON practice_dependencies(depends_on_practice_id);
CREATE INDEX idx_practice_cap_deps ON practice_capability_dependencies(depends_on_capability_id);
CREATE INDEX idx_cap_deps ON capability_dependencies(depends_on_capability_id);
```

### Domain Object Examples (Runtime)

```javascript
// CDPractice - Rich domain object for a practice
const continuousIntegration = new CDPractice(
	PracticeId.from('continuous-integration'),
	'Continuous Integration',
	PracticeCategory.PRACTICE,
	'Integrate code changes frequently to detect integration issues early'
)

// Add practice prerequisites
continuousIntegration.requiresPractice(
	PracticeId.from('trunk-based-development'),
	'TBD enables frequent integration without breaking builds',
	PrerequisiteType.REQUIRED
)

// Add platform capability prerequisites
continuousIntegration.requiresCapability(
	CapabilityId.from('version-control-system'),
	'Need VCS to store and track code changes',
	PrerequisiteType.REQUIRED
)

continuousIntegration.requiresCapability(
	CapabilityId.from('build-automation'),
	'Automated builds verify integration success',
	PrerequisiteType.REQUIRED
)

continuousIntegration.requiresCapability(
	CapabilityId.from('test-automation-framework'),
	'Automated tests catch integration issues',
	PrerequisiteType.REQUIRED
)

// Add requirements as value objects
continuousIntegration.addRequirement(
	Requirement.create(
		'Integrate work to trunk at least daily',
		teamContext => teamContext.integrateFrequency >= 1
	)
)

// Domain behavior - checks both practice AND capability prerequisites
const isReady = continuousIntegration.canBeAdoptedBy(teamContext)
// Returns true only if team has:
// - Adopted trunk-based development practice
// - Has version control system capability
// - Has build automation capability
// - Has test automation framework capability

const readiness = continuousIntegration.assessReadiness(teamContext)
```

```javascript
// PlatformCapability - Rich domain object for a capability
const versionControlSystem = new PlatformCapability(
	CapabilityId.from('version-control-system'),
	'Version Control System',
	CapabilityCategory.TOOLING,
	'System for tracking changes to source code over time'
)

// Add implementation options
versionControlSystem.addImplementationOption(
	'Git',
	'GitHub / GitLab / Bitbucket',
	'Distributed version control, industry standard'
)

versionControlSystem.addImplementationOption(
	'Subversion',
	'Apache',
	'Centralized version control, legacy systems'
)

// Capabilities can have prerequisites too
const cicdPlatform = new PlatformCapability(
	CapabilityId.from('cicd-platform'),
	'CI/CD Platform',
	CapabilityCategory.PLATFORM,
	'Automated platform for building, testing, and deploying'
)

// CI/CD platform requires VCS as a capability prerequisite
cicdPlatform.requiresCapability(
	CapabilityId.from('version-control-system'),
	'CI/CD needs to pull code from version control'
)
```

### API Response (UI Representation)

```json
{
	"id": "continuous-integration",
	"name": "Continuous Integration",
	"type": "practice",
	"category": "practice",
	"icon": "🔄",
	"description": "Integrate code changes frequently to detect integration issues early",
	"practicePrerequisites": [
		{
			"id": "trunk-based-development",
			"name": "Trunk-based Development",
			"type": "practice",
			"prerequisiteType": "required",
			"rationale": "TBD enables frequent integration without breaking builds"
		}
	],
	"capabilityPrerequisites": [
		{
			"id": "version-control-system",
			"name": "Version Control System",
			"type": "capability",
			"category": "tooling",
			"prerequisiteType": "required",
			"rationale": "Need VCS to store and track code changes"
		},
		{
			"id": "build-automation",
			"name": "Build Automation",
			"type": "capability",
			"category": "tooling",
			"prerequisiteType": "required",
			"rationale": "Automated builds verify integration success"
		},
		{
			"id": "test-automation-framework",
			"name": "Test Automation Framework",
			"type": "capability",
			"category": "tooling",
			"prerequisiteType": "required",
			"rationale": "Automated tests catch integration issues"
		}
	],
	"requirements": [
		"Integrate work to trunk at least daily",
		"Automated testing before merging to trunk",
		"Stop feature work when build fails"
	],
	"benefits": [
		"Early detection of integration issues",
		"Reduced merge conflicts",
		"Faster feedback cycles"
	],
	"requirementCount": 6,
	"benefitCount": 4
}
```

**Platform Capability Response:**

```json
{
	"id": "version-control-system",
	"name": "Version Control System",
	"type": "capability",
	"category": "tooling",
	"icon": "🛠️",
	"description": "System for tracking changes to source code over time",
	"capabilityPrerequisites": [],
	"implementationOptions": [
		{
			"name": "Git",
			"vendor": "GitHub / GitLab / Bitbucket",
			"notes": "Distributed version control, industry standard"
		},
		{
			"name": "Subversion",
			"vendor": "Apache",
			"notes": "Centralized version control, legacy systems"
		}
	]
}
```

### Translation Layer (Anti-Corruption Layer)

```javascript
// PracticePresenter.js - translates domain to UI
class PracticePresenter {
	static toApiResponse(cdPractice, practicePrereqs, capabilityPrereqs) {
		return {
			id: cdPractice.id.toString(),
			name: cdPractice.name,
			type: 'practice',
			category: cdPractice.category.toString(),
			icon: cdPractice.category.icon,
			description: cdPractice.description,
			practicePrerequisites: practicePrereqs.map(p => ({
				id: p.practiceId.toString(),
				name: p.name,
				type: 'practice',
				prerequisiteType: p.type.toString(),
				rationale: p.rationale
			})),
			capabilityPrerequisites: capabilityPrereqs.map(c => ({
				id: c.capabilityId.toString(),
				name: c.name,
				type: 'capability',
				category: c.category.toString(),
				prerequisiteType: c.type.toString(),
				rationale: c.rationale
			})),
			requirements: cdPractice.getRequirements().map(r => r.text),
			benefits: cdPractice.getBenefits().map(b => b.description),
			requirementCount: cdPractice.getRequirements().length,
			benefitCount: cdPractice.getBenefits().length
		}
	}
}

// CapabilityPresenter.js - translates capabilities to UI
class CapabilityPresenter {
	static toApiResponse(platformCapability, capabilityPrereqs) {
		return {
			id: platformCapability.id.toString(),
			name: platformCapability.name,
			type: 'capability',
			category: platformCapability.category.toString(),
			icon: platformCapability.category.icon,
			description: platformCapability.description,
			capabilityPrerequisites: capabilityPrereqs.map(c => ({
				id: c.capabilityId.toString(),
				name: c.name,
				type: 'capability',
				rationale: c.rationale
			})),
			implementationOptions: platformCapability.getImplementationOptions().map(opt => ({
				name: opt.name,
				vendor: opt.vendor,
				notes: opt.notes
			}))
		}
	}
}
```

## 8. Success Metrics

### User Experience

- Time to understand CD dependencies < 5 minutes
- Intuitive navigation (minimal confusion)
- Mobile usability score > 90%

### Technical

- Initial load time < 2 seconds
- Smooth animations (60fps)
- Supports 100+ practice nodes
- Cross-browser compatibility

### Business

- Adoption by CD practitioners
- Integration with MinimumCD.org community
- Contributions for additional practices

## 9. Next Steps

1. **Validate approach** - Review plan with stakeholders
2. **Set up repository** - Initialize Git repo and project
3. **Create data model** - Build practices.json from MinimumCD.org
4. **Build prototype** - Create basic visualization
5. **Iterate** - Gather feedback and refine

## 10. Resources

- **MinimumCD.org** - https://minimumcd.org
- **Svelte** - https://svelte.dev/
- **SvelteKit** - https://kit.svelte.dev/
- **Svelvet** - https://www.svelvet.io/ (Svelte graph visualization)
- **D3.js** - https://d3js.org/
- **Tailwind CSS** - https://tailwindcss.com/

---

**Status:** Planning Complete - Domain Model Defined
**Last Updated:** 2025-10-17
**Technology Stack:** SvelteKit + JavaScript + PostgreSQL + Tailwind + D3.js/Svelvet
**Development Approach:** BDD → ATDD → TDD with DDD and Functional Programming
**Next Action:** Begin Phase 1 implementation - Outline view with rich domain model

## Summary

This plan transforms the CD Practices application from a simple data visualization tool into a **domain-rich platform** that captures the essence of Continuous Delivery adoption:

### Key Architectural Decisions

1. **Domain-Driven Design** - Rich domain model with behavior-focused entities and value objects
2. **Bounded Contexts** - Clear separation between Practice Catalog, Journey Planning, and Visualization
3. **Layered Architecture** - Domain, Application, Infrastructure, and Presentation layers with dependency inversion
4. **Ubiquitous Language** - Using MinimumCD.org terminology throughout the codebase
5. **Functional Programming** - Pure functions, immutability, and composition in JavaScript
6. **BDD/ATDD/TDD** - Test-driven development informed by behavior specifications

### First Release Focus

The initial release delivers a **simple, behavior-focused outline view** that:

- Displays all 23 CD practices from MinimumCD.org
- Shows hierarchical prerequisite relationships
- Presents practice requirements and benefits
- Provides visual category differentiation
- Maintains domain model integrity

### Future Enhancements

With the domain model in place, future releases can easily add:

- **Journey Planning** - Personalized adoption paths for teams
- **Readiness Assessment** - Evaluate capability and identify blockers
- **Interactive Graph** - Visual exploration of practice landscape
- **Progress Tracking** - Monitor implementation over time
- **Team Collaboration** - Shared journeys and assessments

The strong domain foundation ensures these features will integrate naturally, maintaining consistency with the core CD practice knowledge from MinimumCD.org.
