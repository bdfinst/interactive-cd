/**
 * Creates a debounced function that delays invoking `func` until after `wait` milliseconds
 * have elapsed since the last time the debounced function was invoked.
 *
 * @param {Function} func - The function to debounce
 * @param {number} wait - The number of milliseconds to delay
 * @returns {Function} The debounced function
 *
 * @example
 * const debouncedSave = debounce(saveToDatabase, 500)
 * debouncedSave(data) // Will only call saveToDatabase after 500ms of inactivity
 */
export const debounce = (func, wait) => {
	let timeoutId = null

	return function debounced(...args) {
		// Clear any existing timeout
		if (timeoutId !== null) {
			clearTimeout(timeoutId)
		}

		// Set new timeout
		timeoutId = setTimeout(() => {
			timeoutId = null
			func.apply(this, args)
		}, wait)
	}
}
