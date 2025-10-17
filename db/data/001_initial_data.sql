-- ============================================================================
-- SEED DATA FOR CD PRACTICES DATABASE
-- Generated from practices.json
-- Date: 2025-10-17T12:46:32.087Z
-- ============================================================================

BEGIN;

-- ============================================================================
-- METADATA
-- ============================================================================

INSERT INTO metadata (key, value) VALUES
  ('version', '"1.0.0"'),
  ('source', '"MinimumCD.org"'),
  ('lastUpdated', '"2025-10-17"'),
  ('description', '"Hierarchical data structure for Continuous Delivery practices and their dependencies"')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- ============================================================================
-- PRACTICES
-- ============================================================================

INSERT INTO practices (id, name, type, category, description, requirements, benefits) VALUES
  ('continuous-delivery', 'Continuous Delivery', 'root', 'practice', 'Continuous delivery improves both delivery performance and quality, and also helps improve culture and reduce burnout and deployment pain.', '["Use Continuous Integration","Application pipeline is the only path to production","Pipeline determines production readiness","Create immutable artifacts","Stop feature work when pipeline fails","Maintain production-like test environment","Enable on-demand rollback","Deploy application configuration with artifact"]'::jsonb, '["Improved delivery performance","Higher quality releases","Better team culture","Reduced burnout","Less deployment pain"]'::jsonb),
  ('continuous-integration', 'Continuous Integration', 'practice', 'practice', 'Integrate code changes frequently to detect integration issues early and maintain a working mainline.', '["Use Trunk-based Development","Integrate work to trunk at least daily","Automated testing before merging to trunk","Automatically test work with other work on merge","Stop feature work when build fails","Ensure new work doesn''t break existing work"]'::jsonb, '["Early detection of integration issues","Reduced merge conflicts","Always-releasable codebase","Faster feedback cycles"]'::jsonb),
  ('trunk-based-development', 'Trunk-based Development', 'practice', 'behavior', 'All developers work on a single branch (trunk/main) with short-lived feature branches that integrate frequently.', '["All changes integrate into trunk","Branches originate from trunk","Branches re-integrate to trunk","Short-lived branches (hours to days)","Branches removed after merge"]'::jsonb, '["Minimized merge conflicts","Faster integration","Simplified branching model","Encourages small, frequent commits"]'::jsonb),
  ('application-pipeline', 'Application Pipeline', 'practice', 'tooling', 'Automated pipeline that is the only path to production, validating every change through build, test, and deployment stages.', '["Only path to production","Determines production readiness","Automated build process","Automated testing stages","Automated deployment capability","Visible to entire team"]'::jsonb, '["Consistent deployment process","Automated quality gates","Reduced human error","Fast feedback on changes"]'::jsonb),
  ('immutable-artifact', 'Immutable Artifact', 'practice', 'tooling', 'Build artifacts once and promote the same artifact through all environments without rebuilding.', '["Build once, deploy many times","Same artifact across all environments","Versioned and traceable","No environment-specific builds","Configuration separated from artifact"]'::jsonb, '["Consistency across environments","Confidence in what''s being deployed","Faster deployments","Simplified rollback"]'::jsonb),
  ('test-environment', 'Production-like Test Environment', 'practice', 'tooling', 'Maintain test environments that closely mirror production to catch environment-specific issues early.', '["Mirrors production infrastructure","Same OS and versions as production","Similar data volumes","Same network topology where critical","Regularly validated against production"]'::jsonb, '["Catch environment issues early","Reduce production surprises","Accurate performance testing","Confident deployments"]'::jsonb),
  ('rollback-capability', 'On-demand Rollback', 'practice', 'tooling', 'Ability to quickly rollback to a previous known-good version if issues are detected in production.', '["Rollback mechanism in place","Tested regularly","Fast execution (minutes)","Database migration compatibility","Monitoring to detect issues"]'::jsonb, '["Reduced risk of deployments","Faster incident recovery","Increased deployment confidence","Lower MTTR (Mean Time To Recovery)"]'::jsonb),
  ('configuration-management', 'Application Configuration Management', 'practice', 'tooling', 'Manage application configuration separately from code, versioned and deployed alongside artifacts.', '["Configuration versioned in source control","Deployed with artifact","Environment-specific values externalized","No secrets in source code","Auditable changes"]'::jsonb, '["Traceable configuration changes","Environment parity","Secure secret management","Easy configuration rollback"]'::jsonb),
  ('automated-testing', 'Automated Testing', 'practice', 'practice', 'Comprehensive automated test suite that runs on every code change to ensure quality and catch regressions.', '["Run on every commit","Fast feedback (< 10 minutes for unit tests)","Multiple test levels (unit, integration, acceptance)","High code coverage","Tests must pass before merge","Flaky tests fixed immediately"]'::jsonb, '["Early defect detection","Refactoring confidence","Living documentation","Reduced manual testing effort"]'::jsonb),
  ('build-automation', 'Build Automation', 'practice', 'tooling', 'Fully automated build process that compiles, packages, and validates code without manual intervention.', '["One-command build","Repeatable builds","Fast execution","Runs in CI environment","Fail fast on errors"]'::jsonb, '["Consistency across builds","Reduced human error","Fast feedback","Easy onboarding"]'::jsonb),
  ('deployment-automation', 'Deployment Automation', 'practice', 'tooling', 'Automated deployment process that can push artifacts to any environment without manual steps.', '["No manual deployment steps","Push-button deployment","Environment-agnostic scripts","Idempotent operations","Automated verification"]'::jsonb, '["Consistent deployments","Reduced deployment time","Lower error rates","Deployable at any time"]'::jsonb),
  ('version-control', 'Version Control', 'practice', 'tooling', 'All code, configuration, and infrastructure definitions stored in version control system.', '["Single source of truth","All team members have access","Commit frequently","Meaningful commit messages","Protected main branch"]'::jsonb, '["Complete change history","Collaboration enabled","Rollback capability","Code review workflows"]'::jsonb),
  ('feature-flags', 'Feature Flags', 'practice', 'tooling', 'Runtime toggles that allow features to be deployed to production but not yet enabled for users.', '["Decouple deployment from release","Toggle features at runtime","Environment-specific controls","User/group targeting","Flag lifecycle management"]'::jsonb, '["Deploy incomplete features safely","Enable A/B testing","Fast feature rollback","Gradual rollouts"]'::jsonb),
  ('infrastructure-automation', 'Infrastructure Automation', 'practice', 'tooling', 'Infrastructure provisioned and configured through code, enabling repeatable and consistent environments.', '["Infrastructure as Code (IaC)","Version controlled","Automated provisioning","Idempotent operations","Tested like application code"]'::jsonb, '["Environment consistency","Fast environment creation","Disaster recovery","Documentation through code"]'::jsonb),
  ('monitoring', 'Monitoring & Observability', 'practice', 'tooling', 'Comprehensive monitoring of application and infrastructure health to detect and diagnose issues quickly.', '["Application metrics","Infrastructure metrics","Log aggregation","Alerting on anomalies","Distributed tracing","Real-time dashboards"]'::jsonb, '["Early issue detection","Faster troubleshooting","Performance insights","Informed decision making"]'::jsonb),
  ('test-automation-framework', 'Test Automation Framework', 'practice', 'tooling', 'Framework and tools that enable writing and executing automated tests efficiently.', '["Support multiple test types","Easy to write tests","Fast execution","Clear reporting","CI/CD integration"]'::jsonb, '["Faster test development","Consistent test execution","Better test maintainability","Scalable test suite"]'::jsonb),
  ('artifact-repository', 'Artifact Repository', 'practice', 'tooling', 'Central storage for build artifacts, ensuring traceability and enabling artifact promotion across environments.', '["Version all artifacts","Secure storage","Fast retrieval","Retention policies","Access controls"]'::jsonb, '["Artifact traceability","Consistent deployments","Audit trail","Easy rollback"]'::jsonb),
  ('secret-management', 'Secret Management', 'practice', 'tooling', 'Secure storage and access control for secrets like passwords, API keys, and certificates.', '["Encrypted at rest","Access controls","Audit logging","No secrets in source code","Rotation capability"]'::jsonb, '["Enhanced security","Compliance","Centralized management","Reduced secret sprawl"]'::jsonb),
  ('database-migration-strategy', 'Database Migration Strategy', 'practice', 'behavior', 'Approach to database changes that supports continuous delivery and enables safe rollbacks.', '["Backward compatible changes","Automated migrations","Versioned with code","Testable migrations","Rollback plan for each change"]'::jsonb, '["Safe database deployments","Rollback capability","Reduced deployment risk","Schema version control"]'::jsonb),
  ('test-data-management', 'Test Data Management', 'practice', 'tooling', 'Strategy for creating, managing, and maintaining test data that supports automated testing.', '["Representative data sets","Data privacy compliance","Fast data refresh","Version controlled fixtures","Isolated test data"]'::jsonb, '["Reliable tests","Faster test execution","Compliance with regulations","Easier debugging"]'::jsonb),
  ('dependency-management', 'Dependency Management', 'practice', 'tooling', 'Systematic approach to managing third-party libraries and dependencies.', '["Declare all dependencies","Pin versions","Vulnerability scanning","Regular updates","License compliance"]'::jsonb, '["Reproducible builds","Security awareness","Reduced conflicts","Easy upgrades"]'::jsonb),
  ('pipeline-visibility', 'Pipeline Visibility', 'practice', 'culture', 'Make pipeline status and results visible to the entire team to encourage collaboration and quick response to failures.', '["Real-time status display","Visible to all team members","Clear failure indicators","Build history accessible","Notifications on failure"]'::jsonb, '["Faster failure response","Team accountability","Transparency","Improved collaboration"]'::jsonb),
  ('logging-infrastructure', 'Logging Infrastructure', 'practice', 'tooling', 'Centralized logging system that aggregates logs from all application components and infrastructure.', '["Centralized log storage","Searchable logs","Structured logging","Log retention policies","Fast querying"]'::jsonb, '["Easier troubleshooting","Compliance","Performance analysis","Security monitoring"]'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  type = EXCLUDED.type,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  requirements = EXCLUDED.requirements,
  benefits = EXCLUDED.benefits;

-- ============================================================================
-- DEPENDENCIES
-- ============================================================================

INSERT INTO practice_dependencies (practice_id, depends_on_id) VALUES
  ('continuous-delivery', 'continuous-integration'),
  ('continuous-delivery', 'application-pipeline'),
  ('continuous-delivery', 'immutable-artifact'),
  ('continuous-delivery', 'test-environment'),
  ('continuous-delivery', 'rollback-capability'),
  ('continuous-delivery', 'configuration-management'),
  ('continuous-integration', 'trunk-based-development'),
  ('continuous-integration', 'automated-testing'),
  ('continuous-integration', 'build-automation'),
  ('continuous-integration', 'version-control'),
  ('trunk-based-development', 'version-control'),
  ('trunk-based-development', 'feature-flags'),
  ('application-pipeline', 'build-automation'),
  ('application-pipeline', 'automated-testing'),
  ('application-pipeline', 'deployment-automation'),
  ('application-pipeline', 'pipeline-visibility'),
  ('immutable-artifact', 'build-automation'),
  ('immutable-artifact', 'artifact-repository'),
  ('immutable-artifact', 'configuration-management'),
  ('test-environment', 'infrastructure-automation'),
  ('test-environment', 'test-data-management'),
  ('rollback-capability', 'deployment-automation'),
  ('rollback-capability', 'database-migration-strategy'),
  ('rollback-capability', 'monitoring'),
  ('configuration-management', 'version-control'),
  ('configuration-management', 'secret-management'),
  ('configuration-management', 'deployment-automation'),
  ('automated-testing', 'test-automation-framework'),
  ('automated-testing', 'build-automation'),
  ('automated-testing', 'test-data-management'),
  ('build-automation', 'version-control'),
  ('build-automation', 'dependency-management'),
  ('deployment-automation', 'infrastructure-automation'),
  ('deployment-automation', 'configuration-management'),
  ('deployment-automation', 'monitoring'),
  ('feature-flags', 'configuration-management'),
  ('infrastructure-automation', 'version-control'),
  ('monitoring', 'logging-infrastructure'),
  ('database-migration-strategy', 'version-control'),
  ('database-migration-strategy', 'automated-testing'),
  ('pipeline-visibility', 'build-automation')
ON CONFLICT (practice_id, depends_on_id) DO NOTHING;

COMMIT;

-- ============================================================================
-- SEED DATA COMPLETE
-- ============================================================================
-- Total Practices: 23
-- Total Dependencies: 41
-- ============================================================================
