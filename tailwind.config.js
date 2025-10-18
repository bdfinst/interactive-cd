/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			height: {
				'logo-sm': '60px',
				'logo-md': '66px',
				'logo-lg': '72px'
			},
			fontSize: {
				'title-sm': '2.1rem',
				'title-md': '2.4rem',
				'title-lg': '2.7rem'
			}
		}
	},
	plugins: []
}
