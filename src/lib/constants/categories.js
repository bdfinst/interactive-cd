/**
 * Category Colors and Configuration
 *
 * These represent the types of requirements a practice may have:
 * - Behavior: Team behaviors and working patterns
 * - Culture: Organizational culture and mindset
 * - Tooling: Technical infrastructure and tools
 */

export const CATEGORY_COLORS = {
  behavior: '#10b981',    // Green
  culture: '#f59e0b',     // Amber
  tooling: '#8b5cf6'      // Purple
};

export const CATEGORY_LABELS = {
  behavior: 'Behavior',
  culture: 'Culture',
  tooling: 'Tooling'
};

export const CATEGORIES = Object.keys(CATEGORY_COLORS);
