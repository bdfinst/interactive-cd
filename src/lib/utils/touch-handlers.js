/**
 * Touch Handler Utilities
 *
 * Provides reusable touch event handlers for mobile-friendly interactions.
 * Implements patterns for touch-based tooltip toggling with auto-dismiss.
 */

/**
 * Creates a touch-enabled toggle handler for tooltips and similar UI elements.
 *
 * Usage:
 * ```javascript
 * let showTooltip = $state(false)
 * const tooltipHandlers = createTouchToggle((value) => showTooltip = value)
 *
 * <button {...tooltipHandlers}>Hover or tap me</button>
 * ```
 *
 * @param {Function} setState - Function to update the visibility state (true/false)
 * @param {number} autoDismissDelay - Milliseconds before auto-dismissing on touch (default: 3000)
 * @returns {Object} Event handlers for mouse and touch events
 */
export function createTouchToggle(setState, autoDismissDelay = 3000) {
	let touchTimeout

	return {
		onmouseenter: () => setState(true),
		onmouseleave: () => setState(false),
		ontouchstart: e => {
			e.preventDefault() // Prevent mouse event emulation
			clearTimeout(touchTimeout)

			// Toggle state
			setState(prev => {
				const newValue = typeof prev === 'function' ? !prev() : !prev
				// Auto-dismiss after delay if showing
				if (newValue) {
					touchTimeout = setTimeout(() => setState(false), autoDismissDelay)
				}
				return newValue
			})
		}
	}
}

/**
 * Creates a simple touch tap handler (no hover state).
 * Useful for buttons and clickable elements that don't need hover feedback.
 *
 * @param {Function} callback - Function to call on tap
 * @returns {Object} Touch event handler
 */
export function createTouchTap(callback) {
	return {
		ontouchstart: e => {
			e.preventDefault()
			callback(e)
		}
	}
}

/**
 * Creates touch handlers with visual feedback (press state).
 *
 * @param {Function} onPress - Function to call when pressed
 * @param {Function} onRelease - Function to call when released (optional)
 * @returns {Object} Touch event handlers
 */
export function createTouchPress(onPress, onRelease = () => {}) {
	return {
		ontouchstart: e => {
			onPress(e)
		},
		ontouchend: e => {
			onRelease(e)
		},
		ontouchcancel: e => {
			onRelease(e)
		}
	}
}
