-- ============================================================================
-- DATA MIGRATION: Add CD Diagram Practices
-- File: 004_add_cd_diagram_practices.sql
-- Date: 2025-10-20
-- Description: Adds comprehensive CD diagram practice hierarchy from docs/cd-diagram.md
--
-- This migration adds 26 practices derived from the CD diagram structure:
-- - Self-healing services and developer-driven support
-- - Automated database changes (versioned, evolutionary)
-- - Comprehensive testing practices (integration, performance, resilience, exploratory, usability)
-- - Modular system architecture with API management
-- - Build and deployment automation
-- - Pre-commit test automation
-- - Continuous Integration components
--
-- Total additions: 26 practices, ~66 dependencies
-- Version bump: 1.1.0 → 1.2.0
-- ============================================================================

BEGIN;

-- ============================================================================
-- LAYER 1: Foundation Practices (No new dependencies beyond existing)
-- ============================================================================

-- Static Analysis
INSERT INTO practices (id, name, type, category, description, requirements, benefits) VALUES
  ('static-analysis', 'Static Analysis', 'practice', 'tooling',
   'Automated analysis of code without executing it to find bugs, security issues, and code quality problems.',
   '["Static analysis tools (ESLint, SonarQube)","Code quality rules configuration","CI integration","Quality gates and thresholds","Security vulnerability scanning"]'::jsonb,
   '["Early bug detection before runtime","Enforces coding standards consistently","Improves security posture","Reduces technical debt","Faster code reviews"]'::jsonb),

-- Unified Team Backlog
  ('unified-team-backlog', 'Unified Team Backlog', 'practice', 'behavior',
   'Single shared backlog for the entire team with transparent priorities and clear ownership.',
   '["Backlog management tool","Regular backlog refinement sessions","Team access and visibility","Clear ownership and accountability","Priority ordering by business value"]'::jsonb,
   '["Improved transparency across team","Better collaboration and alignment","Reduced silos and handoffs","Shared understanding of priorities","Faster decision making"]'::jsonb),

-- Versioned Database
  ('versioned-database', 'Versioned Database', 'practice', 'practice',
   'Database schemas are version controlled and changes are tracked over time with full history.',
   '["Version control system for schema","Migration scripts in source control","Change tracking and audit trail","Schema documentation","Rollback capability"]'::jsonb,
   '["Reproducible database state","Better team collaboration","Clear change history and audit trail","Simplified rollbacks and recovery","Environment parity"]'::jsonb),

-- Evolutionary Database
  ('evolutionary-database', 'Evolutionary Database', 'practice', 'practice',
   'Database design evolves incrementally through small, reversible, backward-compatible changes.',
   '["Backward compatible schema changes","Incremental migration strategy","Automated migration testing","Refactoring support tooling","Parallel change pattern"]'::jsonb,
   '["Lower risk database changes","Continuous database improvement","Better adaptability to change","Reduced downtime during migrations","Safer deployments"]'::jsonb);

-- ============================================================================
-- LAYER 2: Testing Practices (Depend on automated-testing, test-environment)
-- ============================================================================

-- Functional Testing
INSERT INTO practices (id, name, type, category, description, requirements, benefits) VALUES
  ('functional-testing', 'Functional Testing', 'practice', 'behavior',
   'Testing that verifies the system behaves according to functional requirements and user expectations.',
   '["Test automation framework","Clear functional requirements","Test data management","Test environments","Gherkin or similar specification language"]'::jsonb,
   '["Validates business requirements","Prevents functional regressions","Documents expected behavior","Builds stakeholder confidence","Executable specifications"]'::jsonb),

-- Contract Testing
  ('contract-testing', 'Contract Testing', 'practice', 'behavior',
   'Testing API contracts between services to ensure compatibility and prevent breaking changes.',
   '["Contract testing framework (Pact, Spring Cloud Contract)","Service contract definitions","Consumer-driven contract approach","Contract versioning strategy","Contract broker for sharing"]'::jsonb,
   '["Prevents breaking API changes","Enables independent service deployment","Better API stability and reliability","Faster feedback on incompatibilities","Reduced integration testing needs"]'::jsonb),

-- Integration Testing
  ('integration-testing', 'Integration Testing', 'practice', 'behavior',
   'Testing the interactions between components, services, and external systems to validate integration points.',
   '["Test doubles/mocks for external dependencies","Integration test framework","Test data setup and teardown","Isolated test environments","API and database integration tests"]'::jsonb,
   '["Validates component interactions","Catches interface contract issues","Verifies end-to-end behavior","Reduces integration risks in production","Tests with real dependencies"]'::jsonb),

-- Performance Testing
  ('performance-testing', 'Performance Testing', 'practice', 'behavior',
   'Continuous validation of system performance under load to identify bottlenecks and ensure scalability.',
   '["Load testing tools (JMeter, Gatling, k6)","Performance baselines and SLOs","Realistic test scenarios and data volumes","Performance monitoring and profiling","Continuous performance benchmarking"]'::jsonb,
   '["Identifies performance bottlenecks early","Prevents performance regressions","Validates scalability requirements","Optimizes resource usage and costs","Ensures SLA compliance"]'::jsonb),

-- Resilience Testing
  ('resilience-testing', 'Resilience Testing', 'practice', 'behavior',
   'Testing system behavior under failure conditions using chaos engineering principles.',
   '["Chaos engineering tools (Chaos Monkey, Gremlin)","Failure injection capabilities","Recovery validation procedures","Production-like test environments","Incident runbooks and procedures"]'::jsonb,
   '["Validates failure handling and recovery","Improves system robustness and reliability","Builds confidence in disaster recovery","Identifies architectural weak points","Reduces MTTR in production incidents"]'::jsonb),

-- Exploratory Testing
  ('exploratory-testing', 'Exploratory Testing', 'practice', 'behavior',
   'Unscripted manual testing to discover unexpected behaviors, edge cases, and usability issues.',
   '["Skilled testers with domain knowledge","Test charter templates","Session-based testing approach","Bug tracking and reporting system","Time-boxed testing sessions"]'::jsonb,
   '["Discovers unexpected edge cases","Validates user experience flows","Complements automated testing","Provides creative feedback on features","Finds issues automation misses"]'::jsonb),

-- Usability Testing
  ('usability-testing', 'Usability Testing', 'practice', 'behavior',
   'Testing with real users to validate user experience, interface design, and workflow efficiency.',
   '["User recruitment process","Testing protocol and scripts","Recording capabilities (screen, audio)","Analysis framework for findings","Iterative feedback incorporation"]'::jsonb,
   '["Validates actual user workflows","Improves user satisfaction and adoption","Identifies UX issues early","Reduces support and training costs","Informs design decisions with data"]'::jsonb);

-- ============================================================================
-- LAYER 3: Composite Practices (Depend on testing and foundation practices)
-- ============================================================================

-- Pre-Commit Test Automation
INSERT INTO practices (id, name, type, category, description, requirements, benefits) VALUES
  ('pre-commit-test-automation', 'Pre-Commit Test Automation', 'practice', 'behavior',
   'Automated tests that run locally before code is committed to prevent broken commits and maintain trunk stability.',
   '["Local test execution environment","Pre-commit hooks (git hooks, husky)","Fast test suite execution (< 5 minutes)","Test framework with watch mode","Clear error messages and feedback"]'::jsonb,
   '["Prevents broken commits to trunk","Faster feedback during development","Higher code quality at integration","Reduced CI pipeline load","Encourages test-first development"]'::jsonb),

-- Continuous Testing
  ('continuous-testing', 'Continuous Testing', 'practice', 'practice',
   'Testing throughout the development lifecycle with automated feedback at every stage of the pipeline.',
   '["Test automation framework and tooling","CI/CD pipeline integration","Test data management strategy","Test environment infrastructure","Multiple test levels (unit, integration, E2E)"]'::jsonb,
   '["Early defect detection in pipeline","Faster feedback cycles for developers","Higher confidence in changes and releases","Reduced manual testing effort","Living documentation of system behavior"]'::jsonb),

-- Evolutionary Coding
  ('evolutionary-coding', 'Evolutionary Coding', 'practice', 'behavior',
   'Code evolves incrementally through continuous refactoring, improvement, and responding to change.',
   '["Comprehensive test coverage for safety","Refactoring skills and practices","Code review process and culture","Technical debt tracking and prioritization","Small, incremental changes"]'::jsonb,
   '["Better code quality over time","Reduced technical debt accumulation","Easier maintenance and modification","Continuous improvement mindset","Adaptable to changing requirements"]'::jsonb),

-- Prioritized Features
  ('prioritized-features', 'Prioritized Features', 'practice', 'behavior',
   'Features are ranked by business value and worked on in strict priority order to maximize ROI.',
   '["Prioritization framework (RICE, MoSCoW)","Stakeholder collaboration process","Clear acceptance criteria for features","Value metrics and success criteria","Regular reprioritization cadence"]'::jsonb,
   '["Maximizes business value delivery","Better resource allocation","Clearer team focus and alignment","Stakeholder satisfaction","Data-driven decision making"]'::jsonb),

-- Build on Commit
  ('build-on-commit', 'Build on Commit', 'practice', 'behavior',
   'Every code commit triggers an automated build and test cycle to provide immediate feedback.',
   '["VCS webhooks for triggering builds","CI trigger configuration","Fast build times (< 10 minutes)","Notification system for build status","Protected trunk branch requiring passing builds"]'::jsonb,
   '["Immediate feedback on code changes","Prevents broken builds in trunk","Enforces quality gates automatically","Maintains always-green build status","Reduces integration issues"]'::jsonb),

-- API Management
  ('api-management', 'API Management', 'practice', 'tooling',
   'Governance and lifecycle management of APIs including versioning, documentation, security, and monitoring.',
   '["API gateway infrastructure","API documentation tools (OpenAPI, Swagger)","Versioning strategy (semantic versioning)","Security controls (authentication, authorization)","API analytics and monitoring"]'::jsonb,
   '["Consistent API experience for consumers","Better API discoverability and documentation","Controlled access and security","Version management and deprecation","Usage analytics and insights"]'::jsonb),

-- Modular System
  ('modular-system', 'Modular System', 'practice', 'practice',
   'System architecture based on loosely coupled, independently deployable modules with clear boundaries.',
   '["Clear module boundaries and interfaces","Well-defined contracts between modules","Dependency management and isolation","Service contracts and APIs","Independent deployment capability"]'::jsonb,
   '["Independent module deployment","Better system scalability","Easier maintenance and evolution","Team autonomy and ownership","Parallel development capability"]'::jsonb),

-- Component Ownership
  ('component-ownership', 'Component Ownership', 'practice', 'culture',
   'Clear accountability for each component with a designated team responsible for its entire lifecycle.',
   '["Ownership registry and documentation","Clear team responsibilities and boundaries","Team structure aligned with components","Communication channels for each component","On-call rotation for owned components"]'::jsonb,
   '["Clear accountability and ownership","Faster decision making on changes","Better code and system quality","Reduced cross-team dependencies and handoffs","Stronger team autonomy"]'::jsonb);

-- ============================================================================
-- LAYER 4: Infrastructure Practices (Depend on composite practices)
-- ============================================================================

-- Automated Artifact Versioning
INSERT INTO practices (id, name, type, category, description, requirements, benefits) VALUES
  ('automated-artifact-versioning', 'Automated Artifact Versioning', 'practice', 'tooling',
   'Automatically generating and managing semantic version numbers for build artifacts based on commits.',
   '["Versioning scheme (semantic versioning)","Automated version increment from CI","Artifact repository with version support","Version tagging in VCS (git tags)","Changelog generation from commits"]'::jsonb,
   '["Clear artifact tracking and traceability","Reproducible builds at any point","Better dependency management","Simplified rollbacks to known versions","Automated release notes"]'::jsonb),

-- Automated Environment Provisioning
  ('automated-environment-provisioning', 'Automated Environment Provisioning', 'practice', 'tooling',
   'Infrastructure and environments created automatically through code (IaC) on-demand.',
   '["Infrastructure as Code tools (Terraform, Pulumi)","Configuration management (Ansible, Chef)","Cloud provider APIs and automation","Environment templates and blueprints","Automated testing of infrastructure"]'::jsonb,
   '["Consistent environments across SDLC","Faster environment provisioning","Reduced configuration drift issues","Better disaster recovery capability","Cost optimization through automation"]'::jsonb),

-- Automated DB Changes
  ('automated-db-changes', 'Automated DB Changes', 'practice', 'practice',
   'Database schema and data changes are automated and applied through CI/CD pipeline with version control.',
   '["Database migration tools (Flyway, Liquibase)","Version control for schema changes","Automated testing of migrations","Rollback procedures for each migration","Database change validation in pipeline"]'::jsonb,
   '["Consistent database state across environments","Reduced deployment errors and risks","Faster deployments and releases","Better audit trail of changes","Simplified database versioning"]'::jsonb),

-- Developer Driven Support
  ('developer-driven-support', 'Developer Driven Support', 'practice', 'culture',
   'Development teams take ownership of supporting their services in production with on-call rotations.',
   '["On-call rotation schedule for developers","Access to production monitoring and logs","Incident response training and runbooks","Post-incident review process","Runbook documentation for services"]'::jsonb,
   '["Faster issue resolution and MTTR","Better understanding of production behavior","Improved system design from operational feedback","Stronger ownership mindset in teams","Reduced reliance on separate operations team"]'::jsonb),

-- Monitoring and Alerting
  ('monitoring-and-alerting', 'Monitoring and Alerting', 'practice', 'tooling',
   'Comprehensive observability of system behavior with proactive alerting on anomalies and SLA violations.',
   '["Metrics collection infrastructure (Prometheus, DataDog)","Log aggregation and analysis (ELK, Splunk)","Distributed tracing (Jaeger, Zipkin)","Alert management system (PagerDuty, OpsGenie)","Real-time dashboards and visualization"]'::jsonb,
   '["Early problem detection before user impact","Reduced MTTR with better diagnostics","Better system understanding and insights","Data-driven operational decisions","Proactive issue resolution"]'::jsonb),

-- Self Healing Services
  ('self-healing-services', 'Self-Healing Services', 'practice', 'practice',
   'Services that automatically detect and recover from failures without human intervention.',
   '["Robust health checks and monitoring","Automated recovery procedures and scripts","Circuit breakers and bulkheads","Auto-scaling and self-recovery mechanisms","Chaos engineering validation"]'::jsonb,
   '["Reduced downtime and service interruptions","Improved system reliability and availability","Lower operational overhead and toil","Faster incident recovery without human intervention","Better resilience to transient failures"]'::jsonb);

-- ============================================================================
-- LAYER 5: Automated Build (Connects to Continuous Integration)
-- ============================================================================

-- Automated Build (distinct from build-automation - this is about CI/CD pipelines)
INSERT INTO practices (id, name, type, category, description, requirements, benefits) VALUES
  ('automated-build', 'Automated Build', 'practice', 'tooling',
   'Comprehensive automated build process in CI/CD pipeline that compiles, packages, tests, and validates code.',
   '["CI/CD build pipeline configuration","One-command build from any commit","Repeatable builds with same inputs","Fast execution with caching strategies","Fail fast on errors with clear messages","Parallel build stages where possible"]'::jsonb,
   '["Consistency across all builds","Reduced human error in build process","Fast feedback to developers","Easy onboarding for new team members","Build reproducibility and traceability"]'::jsonb);

-- ============================================================================
-- DEPENDENCIES
-- ============================================================================

-- Layer 1 Dependencies
INSERT INTO practice_dependencies (practice_id, depends_on_id) VALUES
  -- Static analysis depends on version control and build automation
  ('static-analysis', 'version-control'),
  ('static-analysis', 'build-automation'),

  -- Unified team backlog needs basic project management (no deps)

  -- Versioned database depends on version control
  ('versioned-database', 'version-control'),
  ('versioned-database', 'database-migration-strategy'),

  -- Evolutionary database depends on versioned database and automated testing
  ('evolutionary-database', 'versioned-database'),
  ('evolutionary-database', 'automated-testing');

-- Layer 2 Dependencies (Testing practices)
INSERT INTO practice_dependencies (practice_id, depends_on_id) VALUES
  -- Functional testing depends on automated testing infrastructure
  ('functional-testing', 'automated-testing'),
  ('functional-testing', 'test-environment'),

  -- Contract testing depends on automated testing
  ('contract-testing', 'automated-testing'),
  ('contract-testing', 'test-automation-framework'),

  -- Integration testing depends on automated testing and test environment
  ('integration-testing', 'automated-testing'),
  ('integration-testing', 'test-environment'),
  ('integration-testing', 'test-data-management'),

  -- Performance testing depends on automated testing and monitoring
  ('performance-testing', 'automated-testing'),
  ('performance-testing', 'test-environment'),
  ('performance-testing', 'monitoring'),

  -- Resilience testing depends on automated testing and monitoring
  ('resilience-testing', 'automated-testing'),
  ('resilience-testing', 'monitoring'),
  ('resilience-testing', 'infrastructure-automation'),

  -- Exploratory testing depends on test environment
  ('exploratory-testing', 'test-environment'),

  -- Usability testing depends on test environment
  ('usability-testing', 'test-environment');

-- Layer 3 Dependencies (Composite practices)
INSERT INTO practice_dependencies (practice_id, depends_on_id) VALUES
  -- Pre-commit test automation depends on automated testing
  ('pre-commit-test-automation', 'automated-testing'),
  ('pre-commit-test-automation', 'version-control'),

  -- Continuous testing depends on multiple test types
  ('continuous-testing', 'automated-testing'),
  ('continuous-testing', 'integration-testing'),
  ('continuous-testing', 'functional-testing'),

  -- Evolutionary coding depends on version control and automated testing
  ('evolutionary-coding', 'version-control'),
  ('evolutionary-coding', 'automated-testing'),
  ('evolutionary-coding', 'trunk-based-development'),

  -- Prioritized features depends on unified backlog
  ('prioritized-features', 'unified-team-backlog'),

  -- Build on commit depends on build automation and version control
  ('build-on-commit', 'build-automation'),
  ('build-on-commit', 'version-control'),

  -- API management depends on version control and monitoring
  ('api-management', 'version-control'),
  ('api-management', 'monitoring'),

  -- Modular system depends on API management
  ('modular-system', 'api-management'),
  ('modular-system', 'version-control'),

  -- Component ownership depends on version control and monitoring
  ('component-ownership', 'version-control'),
  ('component-ownership', 'monitoring');

-- Layer 4 Dependencies (Infrastructure practices)
INSERT INTO practice_dependencies (practice_id, depends_on_id) VALUES
  -- Automated artifact versioning depends on build and version control
  ('automated-artifact-versioning', 'build-automation'),
  ('automated-artifact-versioning', 'version-control'),
  ('automated-artifact-versioning', 'artifact-repository'),

  -- Automated environment provisioning depends on infrastructure automation
  ('automated-environment-provisioning', 'infrastructure-automation'),
  ('automated-environment-provisioning', 'version-control'),

  -- Automated DB changes depends on versioned database
  ('automated-db-changes', 'versioned-database'),
  ('automated-db-changes', 'automated-testing'),
  ('automated-db-changes', 'deployment-automation'),

  -- Developer driven support depends on monitoring
  ('developer-driven-support', 'monitoring'),
  ('developer-driven-support', 'logging-infrastructure'),

  -- Monitoring and alerting extends basic monitoring
  ('monitoring-and-alerting', 'monitoring'),
  ('monitoring-and-alerting', 'logging-infrastructure'),

  -- Self healing services depends on monitoring and alerting
  ('self-healing-services', 'monitoring-and-alerting'),
  ('self-healing-services', 'developer-driven-support'),
  ('self-healing-services', 'infrastructure-automation');

-- Layer 5 Dependencies (Automated Build connects to CI)
INSERT INTO practice_dependencies (practice_id, depends_on_id) VALUES
  -- Automated build depends on build automation
  ('automated-build', 'build-automation'),
  ('automated-build', 'version-control'),
  ('automated-build', 'build-on-commit');

-- Update existing practice dependencies to connect to new practices
INSERT INTO practice_dependencies (practice_id, depends_on_id) VALUES
  -- Trunk-based development now depends on pre-commit test automation
  ('trunk-based-development', 'pre-commit-test-automation'),
  ('trunk-based-development', 'deterministic-tests'),

  -- Pre-commit test automation enables functional testing, contract testing, and static analysis
  ('functional-testing', 'pre-commit-test-automation'),
  ('contract-testing', 'pre-commit-test-automation'),
  ('static-analysis', 'pre-commit-test-automation'),

  -- Functional testing enables behavior-driven development
  ('behavior-driven-development', 'functional-testing'),

  -- Continuous integration now depends on automated build and prioritized features
  ('continuous-integration', 'automated-build'),
  ('continuous-integration', 'prioritized-features'),

  -- Continuous delivery now depends on self-healing, automated-db-changes, continuous-testing, modular-system, automated-artifact-versioning, automated-environment-provisioning, component-ownership
  ('continuous-delivery', 'self-healing-services'),
  ('continuous-delivery', 'automated-db-changes'),
  ('continuous-delivery', 'continuous-testing'),
  ('continuous-delivery', 'modular-system'),
  ('continuous-delivery', 'automated-artifact-versioning'),
  ('continuous-delivery', 'automated-environment-provisioning'),
  ('continuous-delivery', 'component-ownership')
ON CONFLICT (practice_id, depends_on_id) DO NOTHING;

-- ============================================================================
-- METADATA UPDATE
-- ============================================================================

INSERT INTO metadata (key, value) VALUES
  ('version', '"1.2.0"'::jsonb),
  ('lastUpdated', to_jsonb(CURRENT_TIMESTAMP::text)),
  ('changelog', '"Added 26 practices from CD diagram: testing, database, monitoring, architecture, build automation"'::jsonb)
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = CURRENT_TIMESTAMP;

COMMIT;

-- ============================================================================
-- MIGRATION COMPLETE
--
-- Summary:
-- - Added 26 new practices from CD diagram
-- - Added ~66 new dependency relationships
-- - Updated version from 1.1.0 to 1.2.0
-- - Total practices: 51 (25 existing + 26 new)
-- - Total dependencies: ~113 (47 existing + 66 new)
--
-- Verification queries:
-- SELECT COUNT(*) FROM practices; -- Should be 51
-- SELECT COUNT(*) FROM practice_dependencies; -- Should be ~113
-- SELECT * FROM metadata WHERE key = 'version'; -- Should be 1.2.0
--
-- Cycle detection:
-- SELECT * FROM practices p WHERE exists(
--   SELECT 1 FROM get_practice_ancestors(p.id)
--   WHERE id = p.id AND level > 0
-- ); -- Should return 0 rows
-- ============================================================================
