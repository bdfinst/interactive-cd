import { describe, it, expect } from 'vitest'
import { createCurvePath } from '$lib/domain/practice-graph/connections.js'

describe('Practice Graph Connections', () => {
	describe('createCurvePath', () => {
		it('creates SVG path for vertical line', () => {
			const path = createCurvePath(100, 100, 100, 200)

			expect(path).toBe('M 100,100 C 100,150 100,150 100,200')
		})

		it('creates SVG path for horizontal line with vertical component', () => {
			const path = createCurvePath(100, 100, 200, 200)

			expect(path).toBe('M 100,100 C 100,150 200,150 200,200')
		})

		it('handles negative coordinates', () => {
			const path = createCurvePath(-100, -100, -50, -50)

			expect(path).toBe('M -100,-100 C -100,-75 -50,-75 -50,-50')
		})

		it('handles zero coordinates', () => {
			const path = createCurvePath(0, 0, 0, 100)

			expect(path).toBe('M 0,0 C 0,50 0,50 0,100')
		})

		it('creates smooth curve with 50% control offset', () => {
			const x1 = 100
			const y1 = 100
			const x2 = 150
			const y2 = 300

			const path = createCurvePath(x1, y1, x2, y2)

			// Verify the control points are at 50% of vertical distance
			const dy = y2 - y1 // 200
			const expectedOffset = dy * 0.5 // 100

			expect(path).toBe(
				`M ${x1},${y1} C ${x1},${y1 + expectedOffset} ${x2},${y2 - expectedOffset} ${x2},${y2}`
			)
		})

		it('handles downward curves (positive dy)', () => {
			const path = createCurvePath(100, 50, 100, 150)

			// dy = 100, control offset = 50
			expect(path).toBe('M 100,50 C 100,100 100,100 100,150')
		})

		it('handles upward curves (negative dy)', () => {
			const path = createCurvePath(100, 150, 100, 50)

			// dy = -100, control offset = 50 (abs)
			expect(path).toBe('M 100,150 C 100,200 100,0 100,50')
		})

		it('returns valid SVG path format', () => {
			const path = createCurvePath(100, 100, 200, 200)

			// Verify it starts with M (moveto)
			expect(path).toMatch(/^M /)
			// Verify it contains C (cubic bezier)
			expect(path).toContain(' C ')
			// Verify it has correct number of coordinates
			const coords = path.match(/[\d.-]+/g)
			expect(coords).toHaveLength(8) // 2 for M, 6 for C
		})

		it('handles same start and end point', () => {
			const path = createCurvePath(100, 100, 100, 100)

			expect(path).toBe('M 100,100 C 100,100 100,100 100,100')
		})

		it('handles large coordinate values', () => {
			const path = createCurvePath(1000, 1000, 2000, 3000)

			expect(path).toBe('M 1000,1000 C 1000,2000 2000,2000 2000,3000')
		})

		it('handles decimal coordinates', () => {
			const path = createCurvePath(100.5, 100.5, 150.5, 200.5)

			expect(path).toBe('M 100.5,100.5 C 100.5,150.5 150.5,150.5 150.5,200.5')
		})
	})
})
