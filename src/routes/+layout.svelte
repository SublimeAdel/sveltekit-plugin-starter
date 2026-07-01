<script lang="ts">
  import favicon from '$lib/assets/favicon.svg'
  import type { LayoutData } from './$types'

  let { children, data }: { children: import('svelte').Snippet; data: LayoutData } = $props()
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

<nav>
  <a class="brand" href="/">plugin-system</a>
  <a href="/browse">browse</a>
  <a href="/admin/plugins">admin</a>
  <span class="spacer"></span>
  {#if data.isAdmin}
    <form method="POST" action="/login?/logout">
      <button type="submit">log out</button>
    </form>
  {:else}
    <a href="/login">log in</a>
  {/if}
</nav>

<main>
  {@render children()}
</main>

<style>
  :global(body) {
    margin: 0;
    font-family:
      system-ui,
      -apple-system,
      sans-serif;
    color: #111827;
    background: #fafafa;
  }
  nav {
    display: flex;
    align-items: center;
    gap: 1.25rem;
    padding: 0.85rem 1.5rem;
    border-bottom: 1px solid #e5e7eb;
    background: #fff;
  }
  nav a {
    text-decoration: none;
    color: #374151;
    font-size: 0.9rem;
  }
  nav a:hover {
    color: #3b58d6;
  }
  .brand {
    font-weight: 700;
    color: #111827;
  }
  .spacer {
    flex: 1;
  }
  nav button {
    background: none;
    border: 0;
    color: #374151;
    cursor: pointer;
    font: inherit;
    font-size: 0.9rem;
  }
  main {
    max-width: 60rem;
    margin: 0 auto;
    padding: 2rem 1.5rem;
  }
</style>
