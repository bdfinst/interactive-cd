<header class="header">
  <div class="header-container">
    <!-- Left spacer for layout balance -->
    <div class="header-left"></div>

    <!-- Center title -->
    <h1 class="header-title">CD Practices</h1>

    <!-- Right link -->
    <div class="header-right">
      <a
        href="https://minimumcd.org"
        target="_blank"
        rel="noopener noreferrer"
        class="header-link"
      >
        MinimumCD.org
      </a>
    </div>
  </div>
</header>

<style>
  .header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background-color: #1e3a8a; /* Navy blue (Tailwind blue-900) */
    color: white;
    z-index: 1000;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .header-container {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    max-width: 1280px;
    margin: 0 auto;
    padding: 1rem 1.5rem;
    gap: 1rem;
  }

  .header-left {
    /* Empty spacer for grid balance */
  }

  .header-title {
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0;
    text-align: center;
    white-space: nowrap;
  }

  .header-right {
    display: flex;
    justify-content: flex-end;
  }

  .header-link {
    color: white;
    text-decoration: none;
    font-weight: 500;
    padding: 0.5rem 1rem;
    border-radius: 0.375rem;
    transition: background-color 0.2s ease-in-out;
  }

  .header-link:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }

  @media (max-width: 640px) {
    .header-title {
      font-size: 1.25rem;
    }

    .header-link {
      padding: 0.5rem;
      font-size: 0.875rem;
    }
  }
</style>
