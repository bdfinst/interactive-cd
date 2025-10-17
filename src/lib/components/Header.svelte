<script>
  let showGithubTooltip = false;
  let showMinimumCDTooltip = false;
  let showSupportTooltip = false;
</script>

<header class="header">
  <div class="header-container">
    <!-- Left spacer for layout balance -->
    <div class="header-left"></div>

    <!-- Center title -->
    <h1 class="header-title">CD Dependency Tree</h1>

    <!-- Right links -->
    <div class="header-right">
      <div class="tooltip-wrapper">
        <a
          href="https://github.com/bdfinst/interactive-cd"
          target="_blank"
          rel="noopener noreferrer"
          class="github-link"
          aria-label="View on GitHub"
          on:mouseenter={() => showGithubTooltip = true}
          on:mouseleave={() => showGithubTooltip = false}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
        </a>
        {#if showGithubTooltip}
          <div class="custom-tooltip">View on GitHub</div>
        {/if}
      </div>

      <div class="tooltip-wrapper">
        <a
          href="https://minimumcd.org"
          target="_blank"
          rel="noopener noreferrer"
          class="minimumcd-logo-link"
          aria-label="MinimumCD.org"
          on:mouseenter={() => showMinimumCDTooltip = true}
          on:mouseleave={() => showMinimumCDTooltip = false}
        >
          <img
            src="/images/minimumCD-logo-sm.png"
            alt="MinimumCD.org"
            class="minimumcd-logo"
          />
        </a>
        {#if showMinimumCDTooltip}
          <div class="custom-tooltip">MinimumCD.org</div>
        {/if}
      </div>

      <div class="tooltip-wrapper">
        <a
          href="https://ko-fi.com/bryanfinster"
          target="_blank"
          rel="noopener noreferrer"
          class="kofi-button"
          aria-label="Support this project"
          on:mouseenter={() => showSupportTooltip = true}
          on:mouseleave={() => showSupportTooltip = false}
        >
          🥃
        </a>
        {#if showSupportTooltip}
          <div class="custom-tooltip">Support this project</div>
        {/if}
      </div>
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
    align-items: center;
    gap: 0.75rem;
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

  .github-link {
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    padding: 0.5rem;
    border-radius: 0.375rem;
    transition: background-color 0.2s ease-in-out;
  }

  .github-link:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }

  .github-link svg {
    width: 24px;
    height: 24px;
  }

  .minimumcd-logo-link {
    display: flex;
    align-items: center;
    padding: 0.25rem 0.5rem;
    border-radius: 0.375rem;
    transition: background-color 0.2s ease-in-out;
  }

  .minimumcd-logo-link:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }

  .minimumcd-logo {
    height: 24px;
    width: auto;
  }

  .kofi-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: white;
    text-decoration: none;
    padding: 0.5rem;
    border-radius: 0.375rem;
    transition: background-color 0.2s ease-in-out;
    font-size: 1.5rem;
    line-height: 1;
  }

  .kofi-button:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }

  .tooltip-wrapper {
    position: relative;
    display: inline-flex;
  }

  .custom-tooltip {
    position: absolute;
    top: calc(100% + 0.5rem);
    left: 50%;
    transform: translateX(-50%);
    background-color: rgba(0, 0, 0, 0.9);
    color: white;
    padding: 0.5rem 0.75rem;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    white-space: nowrap;
    pointer-events: none;
    z-index: 2000;
  }

  .custom-tooltip::before {
    content: '';
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 0.375rem solid transparent;
    border-bottom-color: rgba(0, 0, 0, 0.9);
  }

  @media (max-width: 768px) {
    .header-title {
      font-size: 1.25rem;
    }

    .header-link {
      padding: 0.375rem 0.625rem;
      font-size: 0.75rem;
    }

    .kofi-button {
      font-size: 1.25rem;
    }

    .github-link svg {
      width: 20px;
      height: 20px;
    }

    .minimumcd-logo {
      height: 20px;
    }

    .custom-tooltip {
      font-size: 0.75rem;
      padding: 0.375rem 0.625rem;
    }

    .header-right {
      gap: 0.5rem;
    }
  }

  @media (max-width: 640px) {
    .header-link {
      display: none;
    }

    .kofi-button {
      font-size: 1.25rem;
    }

    .github-link svg {
      width: 22px;
      height: 22px;
    }

    .minimumcd-logo {
      height: 22px;
    }

    .custom-tooltip {
      font-size: 0.75rem;
      padding: 0.375rem 0.5rem;
    }
  }
</style>
