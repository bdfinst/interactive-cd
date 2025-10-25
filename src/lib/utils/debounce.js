/**
 * Debounce function - delays function execution until after wait milliseconds have elapsed
 * since the last time the debounced function was invoked.
 *
 * @param {Function} func - The function to debounce
 * @param {number} wait - The number of milliseconds to delay
 * @returns {Function} The debounced function
 *
 * @example
 * const debouncedResize = debounce(() => recalculateConnections(), 150)
 * window.addEventListener('resize', debouncedResize)
 */
export const debounce = (func, wait) => {
	let timeoutId

	return function debounced(...args) {
		const context = this

		clearTimeout(timeoutId)

		timeoutId = setTimeout(() => {
			func.apply(context, args)
		}, wait)
	}
}

/**
 * Debounce function with leading edge option
 * Can execute the function immediately on the first call
 *
 * @param {Function} func - The function to debounce
 * @param {number} wait - The number of milliseconds to delay
 * @param {boolean} immediate - If true, trigger function on leading edge instead of trailing
 * @returns {Function} The debounced function
 */
export const debounceWithImmediate = (func, wait, immediate = false) => {
	let timeoutId

	return function debounced(...args) {
		const context = this
		const callNow = immediate && !timeoutId

		clearTimeout(timeoutId)

		timeoutId = setTimeout(() => {
			timeoutId = null
			if (!immediate) {
				func.apply(context, args)
			}
		}, wait)

		if (callNow) {
			func.apply(context, args)
		}
	}
}
