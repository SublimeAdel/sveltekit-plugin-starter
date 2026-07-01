<!-- browse-section carousel of author cards. each card links to /quotes/<slug>. -->
<script lang="ts">
  import type { AuthorWithQuotes } from '../api'

  interface Props {
    title?: string
    items?: AuthorWithQuotes[]
  }

  let { title = 'Authors', items = [] }: Props = $props()
</script>

<section class="quotes-browse">
  <h2>{title}</h2>
  <div class="row">
    {#each items as author (author.id)}
      <a class="card" href={`/quotes/${author.slug}`} style={`--accent: ${author.accentColor}`}>
        <span class="badge">{author.quotes.length} quotes</span>
        <span class="name">{author.name}</span>
        {#if author.quotes[0]}
          <span class="preview">“{author.quotes[0].text}”</span>
        {/if}
      </a>
    {/each}
  </div>
</section>

<style>
  .quotes-browse {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  h2 {
    margin: 0;
    font-size: 1.1rem;
  }
  .row {
    display: flex;
    gap: 0.75rem;
    overflow-x: auto;
    padding-bottom: 0.5rem;
  }
  .card {
    flex: 0 0 auto;
    width: 14rem;
    padding: 1rem;
    border-radius: 0.75rem;
    border: 1px solid #e5e7eb;
    border-top: 4px solid var(--accent, #3b58d6);
    background: #fff;
    text-decoration: none;
    color: inherit;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    transition: transform 0.15s ease, box-shadow 0.15s ease;
  }
  .card:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
  }
  .badge {
    align-self: flex-start;
    font-size: 0.7rem;
    padding: 0.1rem 0.45rem;
    border-radius: 999px;
    background: color-mix(in srgb, var(--accent, #3b58d6) 12%, transparent);
    color: var(--accent, #3b58d6);
  }
  .name {
    font-weight: 600;
  }
  .preview {
    font-size: 0.85rem;
    opacity: 0.7;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>
