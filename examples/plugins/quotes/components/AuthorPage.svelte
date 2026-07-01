<!-- consumer page for /quotes/<slug>. renders props resolved by the plugin's page load;
     it does no fetching itself. -->
<script lang="ts">
  import type { AuthorWithQuotes } from '../api'

  interface Props {
    author: AuthorWithQuotes
    canonicalUrl: string
  }

  let { author, canonicalUrl }: Props = $props()
</script>

<svelte:head>
  <title>{author.name} — Quotes</title>
  <meta name="description" content={author.bio} />
  <link rel="canonical" href={canonicalUrl} />
</svelte:head>

<article class="author" style={`--accent: ${author.accentColor}`}>
  <header>
    <a class="back" href="/browse">← browse</a>
    <h1>{author.name}</h1>
    {#if author.bio}<p class="bio">{author.bio}</p>{/if}
  </header>

  {#if author.quotes.length}
    <ul class="quotes">
      {#each author.quotes as quote (quote.id)}
        <li>“{quote.text}”</li>
      {/each}
    </ul>
  {:else}
    <p class="empty">no quotes yet for this author.</p>
  {/if}
</article>

<style>
  .author {
    max-width: 42rem;
    margin: 0 auto;
    padding: 2rem 1.5rem;
  }
  .back {
    font-size: 0.85rem;
    color: var(--accent, #3b58d6);
    text-decoration: none;
  }
  h1 {
    margin: 0.5rem 0 0;
    border-bottom: 4px solid var(--accent, #3b58d6);
    display: inline-block;
    padding-bottom: 0.25rem;
  }
  .bio {
    opacity: 0.7;
  }
  .quotes {
    list-style: none;
    padding: 0;
    margin: 1.5rem 0 0;
    display: grid;
    gap: 1rem;
  }
  .quotes li {
    padding: 1rem 1.25rem;
    border-left: 3px solid var(--accent, #3b58d6);
    background: #f9fafb;
    border-radius: 0 0.5rem 0.5rem 0;
    font-size: 1.05rem;
  }
  .empty {
    margin-top: 1.5rem;
    opacity: 0.6;
  }
</style>
