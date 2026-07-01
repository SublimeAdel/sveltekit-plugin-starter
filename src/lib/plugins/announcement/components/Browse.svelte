<!-- renders the announcement banner from config-driven props. -->
<script lang="ts">
  interface Item {
    heading: string
    body: string
  }

  interface Props {
    items?: Item[]
  }

  let { items = [] }: Props = $props()
  let announcement = $derived(items[0])
</script>

{#if announcement}
  <aside class="banner">
    <strong>{announcement.heading}</strong>
    {#if announcement.body}<span>{announcement.body}</span>{/if}
  </aside>
{/if}

<style>
  .banner {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 0.5rem;
    padding: 0.85rem 1.1rem;
    border-radius: 0.75rem;
    background: linear-gradient(90deg, #eef2ff, #f0f9ff);
    border: 1px solid #dbeafe;
  }
  strong {
    font-size: 1rem;
  }
  span {
    opacity: 0.75;
    font-size: 0.9rem;
  }
</style>
