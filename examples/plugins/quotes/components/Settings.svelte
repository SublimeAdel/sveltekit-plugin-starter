<!-- admin settings: configure how the section appears (title + author count). -->
<script lang="ts">
  import { untrack } from 'svelte'
  import type { SettingsComponentProps } from '$lib/plugins/_core/types.client'
  import { defaultQuotesSettings } from '../schema'

  let { settings, onUpdate, loading = false, error }: SettingsComponentProps = $props()

  // seed the editable form from the settings prop once, without subscribing to it.
  let sectionTitle = $state(
    untrack(() => (settings.sectionTitle as string) ?? defaultQuotesSettings.sectionTitle),
  )
  let maxAuthors = $state(
    untrack(() => (settings.maxAuthors as number) ?? defaultQuotesSettings.maxAuthors),
  )

  function save() {
    onUpdate?.({ sectionTitle, maxAuthors: Number(maxAuthors) })
  }
</script>

<form
  class="settings"
  onsubmit={(e) => {
    e.preventDefault()
    save()
  }}
>
  <label>
    <span>section title</span>
    <input bind:value={sectionTitle} placeholder="Featured Authors" />
  </label>

  <label>
    <span>max authors on browse</span>
    <input type="number" min="1" max="20" bind:value={maxAuthors} />
  </label>

  {#if error}
    <p class="error">{error}</p>
  {/if}

  <button type="submit" disabled={loading}>{loading ? 'saving…' : 'save settings'}</button>
</form>

<style>
  .settings {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    max-width: 24rem;
  }
  label {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    font-size: 0.85rem;
  }
  input {
    padding: 0.5rem;
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
    font: inherit;
  }
  .error {
    color: crimson;
    font-size: 0.85rem;
    margin: 0;
  }
  button {
    align-self: flex-start;
    padding: 0.5rem 1rem;
    border: 0;
    border-radius: 0.375rem;
    background: #3b58d6;
    color: #fff;
    cursor: pointer;
  }
  button:disabled {
    opacity: 0.6;
    cursor: default;
  }
</style>
