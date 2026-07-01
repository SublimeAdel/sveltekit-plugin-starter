<script lang="ts">
  import type { PageData } from './$types'

  let { data }: { data: PageData } = $props()

  const statusColor: Record<string, string> = {
    enabled: '#16a34a',
    disabled: '#9ca3af',
    misconfigured: '#d97706',
  }
</script>

<h1>Plugins</h1>
<p class="lead">Discovered from <code>src/lib/plugins/*/plugin.manifest.ts</code>.</p>

<ul class="plugins">
  {#each data.plugins as plugin (plugin.id)}
    <li>
      <a href={`/admin/plugins/${plugin.id}`}>
        <div class="top">
          <span class="name">{plugin.name}</span>
          <span class="version">v{plugin.version}</span>
          <span class="status" style={`--c: ${statusColor[plugin.status]}`}>{plugin.status}</span>
        </div>
        <p class="desc">{plugin.description}</p>
        <div class="caps">
          {#if plugin.hasBrowseSection}<span>browse</span>{/if}
          {#if plugin.hasSettings}<span>settings</span>{/if}
          {#if plugin.hasManagement}<span>management</span>{/if}
          {#if plugin.hasPage}<span>page</span>{/if}
        </div>
      </a>
    </li>
  {/each}
</ul>

<style>
  h1 {
    margin-bottom: 0.25rem;
  }
  .lead {
    opacity: 0.7;
    margin-top: 0;
  }
  code {
    background: #f3f4f6;
    padding: 0.1rem 0.35rem;
    border-radius: 0.25rem;
    font-size: 0.85em;
  }
  .plugins {
    list-style: none;
    padding: 0;
    display: grid;
    gap: 0.75rem;
  }
  a {
    display: block;
    padding: 1rem 1.25rem;
    border: 1px solid #e5e7eb;
    border-radius: 0.75rem;
    text-decoration: none;
    color: inherit;
    transition: border-color 0.15s ease;
  }
  a:hover {
    border-color: #3b58d6;
  }
  .top {
    display: flex;
    align-items: center;
    gap: 0.6rem;
  }
  .name {
    font-weight: 600;
  }
  .version {
    font-size: 0.75rem;
    opacity: 0.6;
  }
  .status {
    margin-left: auto;
    font-size: 0.75rem;
    color: var(--c);
    border: 1px solid var(--c);
    padding: 0.05rem 0.5rem;
    border-radius: 999px;
  }
  .desc {
    margin: 0.5rem 0;
    opacity: 0.75;
    font-size: 0.9rem;
  }
  .caps {
    display: flex;
    gap: 0.35rem;
    flex-wrap: wrap;
  }
  .caps span {
    font-size: 0.7rem;
    background: #eef2ff;
    color: #3b58d6;
    padding: 0.1rem 0.45rem;
    border-radius: 0.25rem;
  }
</style>
