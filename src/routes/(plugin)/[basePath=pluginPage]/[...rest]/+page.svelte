<!-- lazy-loads the plugin's page component by its manifest-declared path and renders it
     inside an error boundary. the load already resolved the data. -->
<script lang="ts">
  import type { Component } from 'svelte'
  import { loadComponentByPath } from '$lib/plugins/_core/loader'
  import type { PluginPageProps } from '$lib/plugins/_core/types.client'
  import PluginErrorBoundary from '$lib/plugins/components/PluginErrorBoundary.svelte'
  import type { PageData } from './$types'

  let { data }: { data: PageData } = $props()

  let pageComponent = $state<Component<PluginPageProps> | undefined>(undefined)
  let loadFailed = $state(false)

  $effect(() => {
    loadComponentByPath<PluginPageProps>(data.pluginId, data.component).then((comp) => {
      if (comp) pageComponent = comp
      else loadFailed = true
    })
  })
</script>

{#if pageComponent}
  <PluginErrorBoundary pluginId={data.pluginId}>
    {@const Page = pageComponent}
    <Page {...data.props} />
  </PluginErrorBoundary>
{:else if loadFailed}
  <p class="notice">this page is currently unavailable.</p>
{:else}
  <p class="notice">loading…</p>
{/if}

<style>
  .notice {
    max-width: 42rem;
    margin: 3rem auto;
    text-align: center;
    opacity: 0.6;
  }
</style>
