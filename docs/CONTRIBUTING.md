# Contributing Guide

## Development Setup

This project uses several tools to maintain code quality and enforce best practices:

- **ESLint**: Code linting for JavaScript and Svelte files
- **Husky**: Git hooks management
- **lint-staged**: Run linters on staged files
- **commitlint**: Enforce conventional commit messages

### Prerequisites

```bash
npm install
```

This will automatically set up Husky hooks via the `prepare` script.

## Code Quality

### Linting

Lint all files:

```bash
npm run lint
```

Auto-fix linting issues:

```bash
npm run lint:fix
```

### Testing

Run unit tests:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

Run E2E tests:

```bash
npm run test:e2e
```

## Commit Guidelines

This project follows [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Valid Commit Types

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that don't affect code meaning (formatting, whitespace)
- **refactor**: Code change that neither fixes a bug nor adds a feature
- **perf**: Code change that improves performance
- **test**: Adding or correcting tests
- **build**: Changes to build system or dependencies
- **ci**: Changes to CI configuration
- **chore**: Other changes that don't modify src or test files
- **revert**: Reverts a previous commit

### Examples

Good commit messages:

```
feat(graph): add zoom functionality to practice graph
fix(api): handle null response in practice endpoint
docs(readme): update installation instructions
refactor(components): extract SEO metadata to component
test(graph): add tests for node selection
```

Bad commit messages:

```
Fixed stuff
Update files
WIP
changes
```

### Scope (Optional)

The scope provides additional context:

- `graph`: Practice graph visualization
- `api`: API endpoints
- `components`: UI components
- `db`: Database layer
- `styles`: Styling changes

## Git Hooks

### Pre-commit Hook

Runs automatically before each commit:

1. **ESLint**: Auto-fixes and lints staged files
2. **Vitest**: Runs tests related to changed files

If either step fails, the commit is blocked.

### Commit-msg Hook

Runs automatically on commit message:

- Validates commit message format
- Ensures conventional commit structure
- Blocks commit if message is invalid

### Bypassing Hooks (Not Recommended)

Only in emergencies:

```bash
git commit --no-verify -m "emergency fix"
```

## Workflow

### Making Changes

1. Create a feature branch:

```bash
git checkout -b feat/my-new-feature
```

2. Make your changes

3. Stage your files:

```bash
git add .
```

4. Commit (pre-commit hook runs automatically):

```bash
git commit -m "feat(graph): add zoom functionality"
```

5. Push changes:

```bash
git push origin feat/my-new-feature
```

### What Happens During Commit

```
┌─────────────────────────────────────┐
│ git commit                          │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ Pre-commit Hook                     │
│ 1. ESLint auto-fix staged files     │
│ 2. Run tests for changed files      │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ Commit Message Hook                 │
│ 1. Validate conventional format     │
│ 2. Check type, scope, subject       │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ ✅ Commit Success                   │
└─────────────────────────────────────┘
```

## Code Style

### JavaScript/Svelte

- Use ES6+ features
- Prefer `const` over `let`
- Use arrow functions for callbacks
- Follow functional programming principles
- No `var` declarations
- Destructure props in Svelte components

### Naming Conventions

- **Components**: PascalCase (e.g., `GraphNode.svelte`)
- **Functions**: camelCase (e.g., `fetchPractices`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `CATEGORY_COLORS`)
- **Files**: kebab-case (e.g., `practice-graph.js`)

## Troubleshooting

### Husky hooks not running

Re-initialize Husky:

```bash
npm run prepare
```

### Lint errors on commit

Fix automatically:

```bash
npm run lint:fix
git add .
git commit
```

### Tests failing on commit

Run tests manually to debug:

```bash
npm test
```

### Invalid commit message

Fix the message format:

```bash
git commit --amend -m "feat(scope): proper message"
```

## Getting Help

- Check [Conventional Commits](https://www.conventionalcommits.org/)
- Review [ESLint Rules](https://eslint.org/docs/rules/)
- Read [Husky Documentation](https://typicode.github.io/husky/)
