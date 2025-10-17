import { describe, it, expect } from 'vitest';
import { CDPractice } from '$domain/practice-catalog/entities/CDPractice.js';
import { PracticeId } from '$domain/practice-catalog/value-objects/PracticeId.js';
import { PracticeCategory } from '$domain/practice-catalog/value-objects/PracticeCategory.js';

describe('CDPractice', () => {
	describe('construction', () => {
		it('creates a practice with valid parameters', () => {
			const practice = new CDPractice(
				PracticeId.from('continuous-integration'),
				'Continuous Integration',
				PracticeCategory.PRACTICE,
				'Integrate code changes frequently'
			);

			expect(practice.id.toString()).toBe('continuous-integration');
			expect(practice.name).toBe('Continuous Integration');
			expect(practice.category).toBe(PracticeCategory.PRACTICE);
			expect(practice.description).toBe('Integrate code changes frequently');
		});

		it('throws error when id is missing', () => {
			expect(
				() =>
					new CDPractice(null, 'Continuous Integration', PracticeCategory.PRACTICE, 'Description')
			).toThrow('Practice ID is required');
		});

		it('throws error when name is missing', () => {
			expect(
				() =>
					new CDPractice(
						PracticeId.from('continuous-integration'),
						'',
						PracticeCategory.PRACTICE,
						'Description'
					)
			).toThrow('Practice name is required');
		});

		it('throws error when category is missing', () => {
			expect(
				() =>
					new CDPractice(
						PracticeId.from('continuous-integration'),
						'Continuous Integration',
						null,
						'Description'
					)
			).toThrow('Practice category is required');
		});

		it('throws error when description is missing', () => {
			expect(
				() =>
					new CDPractice(
						PracticeId.from('continuous-integration'),
						'Continuous Integration',
						PracticeCategory.PRACTICE,
						''
					)
			).toThrow('Practice description is required');
		});

		it('initializes with empty prerequisites arrays', () => {
			const practice = new CDPractice(
				PracticeId.from('continuous-integration'),
				'Continuous Integration',
				PracticeCategory.PRACTICE,
				'Description'
			);

			expect(practice.practicePrerequisites).toEqual([]);
			expect(practice.capabilityPrerequisites).toEqual([]);
		});

		it('initializes with empty requirements and benefits arrays', () => {
			const practice = new CDPractice(
				PracticeId.from('continuous-integration'),
				'Continuous Integration',
				PracticeCategory.PRACTICE,
				'Description'
			);

			expect(practice.requirements).toEqual([]);
			expect(practice.benefits).toEqual([]);
		});
	});

	describe('addRequirement', () => {
		it('adds a requirement to the practice', () => {
			const practice = new CDPractice(
				PracticeId.from('continuous-integration'),
				'Continuous Integration',
				PracticeCategory.PRACTICE,
				'Description'
			);

			practice.addRequirement('Integrate to trunk daily');

			expect(practice.requirements).toContain('Integrate to trunk daily');
		});

		it('adds multiple requirements', () => {
			const practice = new CDPractice(
				PracticeId.from('continuous-integration'),
				'Continuous Integration',
				PracticeCategory.PRACTICE,
				'Description'
			);

			practice.addRequirement('Requirement 1');
			practice.addRequirement('Requirement 2');

			expect(practice.requirements).toHaveLength(2);
			expect(practice.requirements).toEqual(['Requirement 1', 'Requirement 2']);
		});

		it('throws error for empty requirement', () => {
			const practice = new CDPractice(
				PracticeId.from('continuous-integration'),
				'Continuous Integration',
				PracticeCategory.PRACTICE,
				'Description'
			);

			expect(() => practice.addRequirement('')).toThrow('Requirement cannot be empty');
		});
	});

	describe('addBenefit', () => {
		it('adds a benefit to the practice', () => {
			const practice = new CDPractice(
				PracticeId.from('continuous-integration'),
				'Continuous Integration',
				PracticeCategory.PRACTICE,
				'Description'
			);

			practice.addBenefit('Early detection of integration issues');

			expect(practice.benefits).toContain('Early detection of integration issues');
		});

		it('adds multiple benefits', () => {
			const practice = new CDPractice(
				PracticeId.from('continuous-integration'),
				'Continuous Integration',
				PracticeCategory.PRACTICE,
				'Description'
			);

			practice.addBenefit('Benefit 1');
			practice.addBenefit('Benefit 2');

			expect(practice.benefits).toHaveLength(2);
		});

		it('throws error for empty benefit', () => {
			const practice = new CDPractice(
				PracticeId.from('continuous-integration'),
				'Continuous Integration',
				PracticeCategory.PRACTICE,
				'Description'
			);

			expect(() => practice.addBenefit('')).toThrow('Benefit cannot be empty');
		});
	});

	describe('requiresPractice', () => {
		it('adds a practice prerequisite', () => {
			const practice = new CDPractice(
				PracticeId.from('continuous-integration'),
				'Continuous Integration',
				PracticeCategory.PRACTICE,
				'Description'
			);

			practice.requiresPractice(
				PracticeId.from('trunk-based-development'),
				'TBD enables frequent integration'
			);

			expect(practice.practicePrerequisites).toHaveLength(1);
			expect(practice.practicePrerequisites[0].practiceId.toString()).toBe(
				'trunk-based-development'
			);
			expect(practice.practicePrerequisites[0].rationale).toBe('TBD enables frequent integration');
		});

		it('adds multiple practice prerequisites', () => {
			const practice = new CDPractice(
				PracticeId.from('continuous-integration'),
				'Continuous Integration',
				PracticeCategory.PRACTICE,
				'Description'
			);

			practice.requiresPractice(PracticeId.from('practice-1'), 'Rationale 1');
			practice.requiresPractice(PracticeId.from('practice-2'), 'Rationale 2');

			expect(practice.practicePrerequisites).toHaveLength(2);
		});
	});

	describe('requiresCapability', () => {
		it('adds a capability prerequisite', () => {
			const practice = new CDPractice(
				PracticeId.from('continuous-integration'),
				'Continuous Integration',
				PracticeCategory.PRACTICE,
				'Description'
			);

			practice.requiresCapability('version-control-system', 'Need VCS to track changes');

			expect(practice.capabilityPrerequisites).toHaveLength(1);
			expect(practice.capabilityPrerequisites[0].capabilityId).toBe('version-control-system');
			expect(practice.capabilityPrerequisites[0].rationale).toBe('Need VCS to track changes');
		});
	});

	describe('getRequirements', () => {
		it('returns a copy of requirements array', () => {
			const practice = new CDPractice(
				PracticeId.from('continuous-integration'),
				'Continuous Integration',
				PracticeCategory.PRACTICE,
				'Description'
			);

			practice.addRequirement('Requirement 1');
			const requirements = practice.getRequirements();

			// Modifying returned array should not affect internal state
			requirements.push('Should not be added');
			expect(practice.requirements).toHaveLength(1);
		});
	});

	describe('getBenefits', () => {
		it('returns a copy of benefits array', () => {
			const practice = new CDPractice(
				PracticeId.from('continuous-integration'),
				'Continuous Integration',
				PracticeCategory.PRACTICE,
				'Description'
			);

			practice.addBenefit('Benefit 1');
			const benefits = practice.getBenefits();

			// Modifying returned array should not affect internal state
			benefits.push('Should not be added');
			expect(practice.benefits).toHaveLength(1);
		});
	});
});
