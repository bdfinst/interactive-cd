<script>
  /**
   * SEO Component
   *
   * Manages all SEO metadata, Open Graph, and Twitter card tags
   */
  export let title = 'CD Dependency Tree - Interactive Continuous Delivery Practices Explorer';
  export let description = 'Explore Continuous Delivery practices and their dependencies through an interactive dependency graph. Understand the requirements and benefits of each CD practice.';
  export let keywords = 'continuous delivery, continuous deployment, CD, DevOps, practices, dependencies, software development, agile, deployment pipeline';
  export let author = 'Bryan Finster';
  export let url = 'https://practices.minimumcd.org/';
  export let image = 'https://practices.minimumcd.org/images/og-image.png';
  export let siteName = 'CD Dependency Tree';
  export let twitterCreator = '@bdfinst';
  export let themeColor = '#cbd5e1';
  export let canonical = 'https://practices.minimumcd.org/';
</script>

<svelte:head>
  <!-- Primary Meta Tags -->
  <title>{title}</title>
  <meta name="title" content={title} />
  <meta name="description" content={description} />
  <meta name="keywords" content={keywords} />
  <meta name="author" content={author} />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content={url} />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:image" content={image} />
  <meta property="og:site_name" content={siteName} />

  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image" />
  <meta property="twitter:url" content={url} />
  <meta property="twitter:title" content={title} />
  <meta property="twitter:description" content={description} />
  <meta property="twitter:image" content={image} />
  <meta property="twitter:creator" content={twitterCreator} />

  <!-- Additional SEO -->
  <meta name="robots" content="index, follow" />
  <meta name="language" content="English" />
  <meta name="revisit-after" content="7 days" />
  <link rel="canonical" href={canonical} />

  <!-- Favicon -->
  <link rel="icon" type="image/png" href="/favicon.png" />
  <link rel="apple-touch-icon" href="/images/logo.png" />

  <!-- Theme Color -->
  <meta name="theme-color" content={themeColor} />
</svelte:head>
