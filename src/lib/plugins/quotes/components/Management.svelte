<!-- admin management: create/delete authors and edit each author's quotes.
     talks to /api/plugins/quotes/* — the same endpoints any external client would use. -->
<script lang="ts">
  import { onMount } from 'svelte'

  interface AuthorRow {
    id: string
    name: string
    slug: string
    bio: string
    accentColor: string
    quoteCount: number
  }

  let authors = $state<AuthorRow[]>([])
  let error = $state('')

  let name = $state('')
  let slug = $state('')
  let bio = $state('')
  let accentColor = $state('#3b58d6')

  let editingId = $state<string | null>(null)
  let quotesText = $state('')

  const api = '/api/plugins/quotes'

  async function load() {
    const res = await fetch(api)
    if (!res.ok) {
      error = 'failed to load authors (are you logged in as admin?)'
      return
    }
    authors = (await res.json()).authors
  }

  async function createAuthor() {
    error = ''
    const res = await fetch(api, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name, slug, bio, accentColor }),
    })
    if (!res.ok) {
      error = (await res.json()).message ?? 'failed to create author'
      return
    }
    name = slug = bio = ''
    accentColor = '#3b58d6'
    await load()
  }

  async function deleteAuthor(id: string) {
    await fetch(`${api}?id=${id}`, { method: 'DELETE' })
    await load()
  }

  async function saveQuotes(id: string) {
    const quotes = quotesText
      .split('\n')
      .map((q) => q.trim())
      .filter(Boolean)
    await fetch(`${api}/${id}/quotes`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ quotes }),
    })
    editingId = null
    quotesText = ''
    await load()
  }

  onMount(load)
</script>

<div class="management">
  <form
    class="create"
    onsubmit={(e) => {
      e.preventDefault()
      createAuthor()
    }}
  >
    <h3>add author</h3>
    <input bind:value={name} placeholder="name" required />
    <input bind:value={slug} placeholder="slug (e.g. ada-lovelace)" required />
    <input bind:value={bio} placeholder="short bio" />
    <label class="color">accent <input type="color" bind:value={accentColor} /></label>
    <button type="submit">create</button>
    {#if error}<p class="error">{error}</p>{/if}
  </form>

  <ul class="list">
    {#each authors as author (author.id)}
      <li>
        <div class="head" style={`--accent: ${author.accentColor}`}>
          <span class="name">{author.name}</span>
          <span class="slug">/quotes/{author.slug}</span>
          <span class="count">{author.quoteCount} quotes</span>
          <button
            onclick={() => {
              editingId = editingId === author.id ? null : author.id
              quotesText = ''
            }}>quotes</button
          >
          <button class="danger" onclick={() => deleteAuthor(author.id)}>delete</button>
        </div>
        {#if editingId === author.id}
          <div class="editor">
            <textarea bind:value={quotesText} rows="4" placeholder="one quote per line"
            ></textarea>
            <button onclick={() => saveQuotes(author.id)}>save quotes</button>
          </div>
        {/if}
      </li>
    {/each}
  </ul>
</div>

<style>
  .management {
    display: grid;
    gap: 1.5rem;
  }
  .create {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    max-width: 24rem;
  }
  h3 {
    margin: 0;
  }
  input,
  textarea {
    padding: 0.5rem;
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
    font: inherit;
  }
  .color {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.85rem;
  }
  button {
    padding: 0.4rem 0.75rem;
    border: 0;
    border-radius: 0.375rem;
    background: #3b58d6;
    color: #fff;
    cursor: pointer;
  }
  button.danger {
    background: crimson;
  }
  .error {
    color: crimson;
    margin: 0;
    font-size: 0.85rem;
  }
  .list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: grid;
    gap: 0.5rem;
  }
  .head {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem 0.75rem;
    border: 1px solid #e5e7eb;
    border-left: 4px solid var(--accent, #3b58d6);
    border-radius: 0.375rem;
  }
  .name {
    font-weight: 600;
  }
  .slug,
  .count {
    font-size: 0.8rem;
    opacity: 0.6;
  }
  .head button {
    margin-left: auto;
  }
  .head button.danger {
    margin-left: 0;
  }
  .editor {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.75rem;
  }
  .editor button {
    align-self: flex-start;
  }
</style>
