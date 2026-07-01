<!-- the browse page renders only generic PluginSectionLoaders. it has no knowledge of any
     specific plugin — sections come from /api/plugins/browse-sections and each loads its own
     Browse.svelte on the client. -->
<script lang="ts">
  import PluginSectionLoader from '$lib/plugins/components/PluginSectionLoader.svelte'
  import type { BrowseSectionProps } from '$lib/plugins/_core/types.client'
  import type { PageData } from './$types'

  let { data }: { data: PageData } = $props()
</script>

<h1>Browse</h1>

{#if data.sections.length === 0}
  <p class="empty">
    No enabled plugin sections. Enable a plugin in the
    <a href="/admin/plugins">admin console</a>.
  </p>
{/if}

<div class="sections">
  {#each data.sections as section (section.pluginId)}
    <PluginSectionLoader
      pluginId={section.pluginId}
      sectionProps={section.props as BrowseSectionProps}
    />
  {/each}
</div>

<style>
  .sections {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    margin-top: 1.5rem;
  }
  .empty {
    opacity: 0.7;
  }
</style>
