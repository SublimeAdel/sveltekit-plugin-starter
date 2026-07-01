<!--
  loads a plugin's Browse.svelte on mount and renders it inside an error boundary.
  shows a generic skeleton while the code-split component is in flight.
-->
<script lang="ts">
  import type { Component } from 'svelte'
  import { onMount } from 'svelte'
  import { loadComponent } from '$lib/plugins/_core/loader'
  import type { BrowseSectionProps } from '$lib/plugins/_core/types.client'
  import PluginErrorBoundary from './PluginErrorBoundary.svelte'

  interface Props {
    pluginId: string
    sectionProps: BrowseSectionProps
  }

  let { pluginId, sectionProps }: Props = $props()

  let browseComponent = $state<Component<BrowseSectionProps> | undefined>(undefined)
  let loaded = $state(false)

  onMount(() => {
    loadComponent<BrowseSectionProps>(pluginId, 'browse').then((comp) => {
      browseComponent = comp
      loaded = true
    })
  })
</script>

{#if loaded && browseComponent}
  <PluginErrorBoundary {pluginId}>
    {@const Browse = browseComponent}
    <Browse {...sectionProps} />
  </PluginErrorBoundary>
{:else}
  <section class="skeleton" aria-hidden="true">
    <div class="title"></div>
    <div class="row">
      {#each Array(5) as _, i (i)}
        <div class="card"></div>
      {/each}
    </div>
  </section>
{/if}

<style>
  .skeleton {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  .title {
    width: 12rem;
    height: 1.25rem;
    border-radius: 0.25rem;
    background: var(--skeleton, #e5e7eb);
  }
  .row {
    display: flex;
    gap: 0.75rem;
    overflow: hidden;
  }
  .card {
    flex: 0 0 auto;
    width: 9rem;
    height: 6rem;
    border-radius: 0.5rem;
    background: var(--skeleton, #e5e7eb);
    animation: pulse 1.5s ease-in-out infinite;
  }
  @keyframes pulse {
    50% {
      opacity: 0.5;
    }
  }
</style>
