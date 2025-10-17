import { describe, it, expect } from 'vitest';
import { PracticeCategory } from '$domain/practice-catalog/value-objects/PracticeCategory.js';

describe('PracticeCategory', () => {
	describe('predefined categories', () => {
		it('has PRACTICE category', () => {
			expect(PracticeCategory.PRACTICE).toBeDefined();
			expect(PracticeCategory.PRACTICE).toBeInstanceOf(PracticeCategory);
		});

		it('has BEHAVIOR category', () => {
			expect(PracticeCategory.BEHAVIOR).toBeDefined();
			expect(PracticeCategory.BEHAVIOR).toBeInstanceOf(PracticeCategory);
		});

		it('has CULTURE category', () => {
			expect(PracticeCategory.CULTURE).toBeDefined();
			expect(PracticeCategory.CULTURE).toBeInstanceOf(PracticeCategory);
		});

		it('each category has unique name', () => {
			const names = [
				PracticeCategory.PRACTICE.toString(),
				PracticeCategory.BEHAVIOR.toString(),
				PracticeCategory.CULTURE.toString()
			];

			const uniqueNames = new Set(names);
			expect(uniqueNames.size).toBe(3);
		});

		it('each category has an icon', () => {
			expect(PracticeCategory.PRACTICE.icon).toBeDefined();
			expect(PracticeCategory.BEHAVIOR.icon).toBeDefined();
			expect(PracticeCategory.CULTURE.icon).toBeDefined();
		});
	});

	describe('from', () => {
		it('returns PRACTICE for "practice" string', () => {
			const category = PracticeCategory.from('practice');

			expect(category).toBe(PracticeCategory.PRACTICE);
		});

		it('returns BEHAVIOR for "behavior" string', () => {
			const category = PracticeCategory.from('behavior');

			expect(category).toBe(PracticeCategory.BEHAVIOR);
		});

		it('returns CULTURE for "culture" string', () => {
			const category = PracticeCategory.from('culture');

			expect(category).toBe(PracticeCategory.CULTURE);
		});

		it('throws error for invalid category', () => {
			expect(() => PracticeCategory.from('invalid')).toThrow('Invalid practice category');
		});

		it('throws error for null', () => {
			expect(() => PracticeCategory.from(null)).toThrow('Invalid practice category');
		});

		it('throws error for undefined', () => {
			expect(() => PracticeCategory.from(undefined)).toThrow('Invalid practice category');
		});

		it('is case-sensitive', () => {
			expect(() => PracticeCategory.from('PRACTICE')).toThrow('Invalid practice category');
		});
	});

	describe('equals', () => {
		it('returns true for same category', () => {
			const cat1 = PracticeCategory.PRACTICE;
			const cat2 = PracticeCategory.PRACTICE;

			expect(cat1.equals(cat2)).toBe(true);
		});

		it('returns false for different categories', () => {
			const cat1 = PracticeCategory.PRACTICE;
			const cat2 = PracticeCategory.BEHAVIOR;

			expect(cat1.equals(cat2)).toBe(false);
		});

		it('returns false when comparing with null', () => {
			expect(PracticeCategory.PRACTICE.equals(null)).toBe(false);
		});
	});

	describe('toString', () => {
		it('returns "practice" for PRACTICE', () => {
			expect(PracticeCategory.PRACTICE.toString()).toBe('practice');
		});

		it('returns "behavior" for BEHAVIOR', () => {
			expect(PracticeCategory.BEHAVIOR.toString()).toBe('behavior');
		});

		it('returns "culture" for CULTURE', () => {
			expect(PracticeCategory.CULTURE.toString()).toBe('culture');
		});
	});

	describe('icon property', () => {
		it('PRACTICE has 🔄 icon', () => {
			expect(PracticeCategory.PRACTICE.icon).toBe('🔄');
		});

		it('BEHAVIOR has 👥 icon', () => {
			expect(PracticeCategory.BEHAVIOR.icon).toBe('👥');
		});

		it('CULTURE has 🌟 icon', () => {
			expect(PracticeCategory.CULTURE.icon).toBe('🌟');
		});
	});

	describe('immutability', () => {
		it('cannot create new instances directly', () => {
			expect(() => new PracticeCategory('practice', '🔄')).toThrow();
		});

		it('cannot modify category name', () => {
			const category = PracticeCategory.PRACTICE;

			expect(() => {
				category.name = 'something-else';
			}).toThrow();
		});

		it('cannot modify category icon', () => {
			const category = PracticeCategory.PRACTICE;

			expect(() => {
				category.icon = '❌';
			}).toThrow();
		});
	});
});
