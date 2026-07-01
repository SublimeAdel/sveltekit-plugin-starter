<script lang="ts">
  import { untrack } from 'svelte'
  import type { SettingsComponentProps } from '$lib/plugins/_core/types.client'
  import { defaultAnnouncementSettings } from '../schema'

  let { settings, onUpdate, loading = false, error }: SettingsComponentProps = $props()

  // seed the editable form from the settings prop once, without subscribing to it.
  let heading = $state(
    untrack(() => (settings.heading as string) ?? defaultAnnouncementSettings.heading),
  )
  let body = $state(untrack(() => (settings.body as string) ?? defaultAnnouncementSettings.body))
</script>

<form
  class="settings"
  onsubmit={(e) => {
    e.preventDefault()
    onUpdate?.({ heading, body })
  }}
>
  <label>
    <span>heading</span>
    <input bind:value={heading} />
  </label>
  <label>
    <span>body</span>
    <textarea bind:value={body} rows="3"></textarea>
  </label>

  {#if error}<p class="error">{error}</p>{/if}
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
  input,
  textarea {
    padding: 0.5rem;
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
    font: inherit;
  }
  .error {
    color: crimson;
    margin: 0;
    font-size: 0.85rem;
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
  }
</style>
