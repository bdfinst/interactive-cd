import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import SEO from '$lib/components/SEO.svelte'

describe('SEO', () => {
	describe('default metadata', () => {
		it('sets default title', () => {
			render(SEO)

			const title = document.querySelector('title')
			expect(title?.textContent).toContain('CD Dependency Tree')
		})

		it('sets default description meta tag', () => {
			render(SEO)

			const description = document.querySelector('meta[name="description"]')
			expect(description?.getAttribute('content')).toContain('Continuous Delivery practices')
		})

		it('sets default keywords', () => {
			render(SEO)

			const keywords = document.querySelector('meta[name="keywords"]')
			expect(keywords?.getAttribute('content')).toContain('continuous delivery')
		})

		it('sets default author', () => {
			render(SEO)

			const author = document.querySelector('meta[name="author"]')
			expect(author?.getAttribute('content')).toBe('Bryan Finster')
		})
	})

	describe('custom props', () => {
		it('accepts custom title', () => {
			render(SEO, { props: { title: 'Custom Page Title' } })

			const title = document.querySelector('title')
			expect(title?.textContent).toBe('Custom Page Title')
		})

		it('accepts custom description', () => {
			render(SEO, { props: { description: 'Custom description text' } })

			const description = document.querySelector('meta[name="description"]')
			expect(description?.getAttribute('content')).toBe('Custom description text')
		})

		it('accepts custom URL', () => {
			render(SEO, { props: { url: 'https://example.com/custom' } })

			const ogUrl = document.querySelector('meta[property="og:url"]')
			expect(ogUrl?.getAttribute('content')).toBe('https://example.com/custom')
		})

		it('accepts custom image', () => {
			render(SEO, { props: { image: 'https://example.com/custom-image.png' } })

			const ogImage = document.querySelector('meta[property="og:image"]')
			expect(ogImage?.getAttribute('content')).toBe('https://example.com/custom-image.png')
		})
	})

	describe('Open Graph tags', () => {
		it('sets og:type to website', () => {
			render(SEO)

			const ogType = document.querySelector('meta[property="og:type"]')
			expect(ogType?.getAttribute('content')).toBe('website')
		})

		it('sets og:title', () => {
			render(SEO, { props: { title: 'Test Title' } })

			const ogTitle = document.querySelector('meta[property="og:title"]')
			expect(ogTitle?.getAttribute('content')).toBe('Test Title')
		})

		it('sets og:description', () => {
			render(SEO, { props: { description: 'Test description' } })

			const ogDescription = document.querySelector('meta[property="og:description"]')
			expect(ogDescription?.getAttribute('content')).toBe('Test description')
		})

		it('sets og:image', () => {
			render(SEO)

			const ogImage = document.querySelector('meta[property="og:image"]')
			expect(ogImage?.getAttribute('content')).toContain('og-image.png')
		})

		it('sets og:site_name', () => {
			render(SEO)

			const ogSiteName = document.querySelector('meta[property="og:site_name"]')
			expect(ogSiteName?.getAttribute('content')).toBe('CD Dependency Tree')
		})
	})

	describe('Twitter Card tags', () => {
		it('sets twitter:card to summary_large_image', () => {
			render(SEO)

			const twitterCard = document.querySelector('meta[property="twitter:card"]')
			expect(twitterCard?.getAttribute('content')).toBe('summary_large_image')
		})

		it('sets twitter:title', () => {
			render(SEO, { props: { title: 'Test Title' } })

			const twitterTitle = document.querySelector('meta[property="twitter:title"]')
			expect(twitterTitle?.getAttribute('content')).toBe('Test Title')
		})

		it('sets twitter:description', () => {
			render(SEO, { props: { description: 'Test description' } })

			const twitterDescription = document.querySelector('meta[property="twitter:description"]')
			expect(twitterDescription?.getAttribute('content')).toBe('Test description')
		})

		it('sets twitter:creator', () => {
			render(SEO, { props: { twitterCreator: '@testuser' } })

			const twitterCreator = document.querySelector('meta[property="twitter:creator"]')
			expect(twitterCreator?.getAttribute('content')).toBe('@testuser')
		})
	})

	describe('SEO optimization tags', () => {
		it('sets robots meta for indexing', () => {
			render(SEO)

			const robots = document.querySelector('meta[name="robots"]')
			expect(robots?.getAttribute('content')).toBe('index, follow')
		})

		it('sets language meta', () => {
			render(SEO)

			const language = document.querySelector('meta[name="language"]')
			expect(language?.getAttribute('content')).toBe('English')
		})

		it('sets canonical URL', () => {
			render(SEO, { props: { canonical: 'https://example.com/canonical' } })

			const canonical = document.querySelector('link[rel="canonical"]')
			expect(canonical?.getAttribute('href')).toBe('https://example.com/canonical')
		})

		it('sets viewport meta', () => {
			render(SEO)

			const viewport = document.querySelector('meta[name="viewport"]')
			expect(viewport?.getAttribute('content')).toContain('width=device-width')
		})
	})

	describe('favicons and theme', () => {
		it('sets favicon link', () => {
			render(SEO)

			const favicon = document.querySelector('link[rel="icon"]')
			expect(favicon?.getAttribute('href')).toBe('/images/favicons/favicon.png')
		})

		it('sets apple touch icon', () => {
			render(SEO)

			const appleTouchIcon = document.querySelector('link[rel="apple-touch-icon"]')
			expect(appleTouchIcon?.getAttribute('href')).toBe('/images/favicons/favicon-180x180.png')
		})

		it('sets theme color', () => {
			render(SEO, { props: { themeColor: '#ff0000' } })

			const themeColor = document.querySelector('meta[name="theme-color"]')
			expect(themeColor?.getAttribute('content')).toBe('#ff0000')
		})
	})
})
