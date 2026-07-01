<!-- browse-section UI. receives the props returned by the manifest's browseSection.getData. -->
<script lang="ts">
  interface Item {
    greeting: string
  }

  interface Props {
    items?: Item[]
  }

  let { items = [] }: Props = $props()
  let item = $derived(items[0])
</script>

{#if item}
  <section class="hello">
    <h2>{item.greeting}</h2>
    <p>Edit this section in <code>src/lib/plugins/hello/components/Browse.svelte</code>.</p>
  </section>
{/if}

<style>
  .hello {
    padding: 1.25rem 1.5rem;
    border-radius: 0.75rem;
    background: #f0f9ff;
    border: 1px solid #bae6fd;
  }
  h2 {
    margin: 0 0 0.4rem;
  }
  p {
    margin: 0;
    font-size: 0.9rem;
    opacity: 0.75;
  }
  code {
    background: #e0f2fe;
    padding: 0.1rem 0.35rem;
    border-radius: 0.25rem;
  }
</style>
