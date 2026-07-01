<!-- generic plugin detail page. it doesn't know what any plugin does — it lazy-loads the
     plugin's settings/management components and renders them, and toggles enabled state. -->
<script lang="ts">
  import type { Component } from 'svelte'
  import { onMount, untrack } from 'svelte'
  import { loadComponent } from '$lib/plugins/_core/loader'
  import type {
    SettingsComponentProps,
    ManagementComponentProps,
  } from '$lib/plugins/_core/types.client'
  import type { PageData } from './$types'

  let { data }: { data: PageData } = $props()

  let enabled = $state(untrack(() => data.enabled))
  let settings = $state<Record<string, unknown>>(untrack(() => data.settings))
  let saving = $state(false)
  let saveError = $state('')
  let saved = $state(false)

  let SettingsComponent = $state<Component<SettingsComponentProps> | undefined>(undefined)
  let ManagementComponent = $state<Component<ManagementComponentProps> | undefined>(undefined)

  onMount(async () => {
    if (data.hasSettings) SettingsComponent = await loadComponent(data.pluginId, 'settings')
    if (data.hasManagement) ManagementComponent = await loadComponent(data.pluginId, 'management')
  })

  async function persist(next: { enabled?: boolean; settings?: Record<string, unknown> }) {
    saving = true
    saveError = ''
    saved = false

    const res = await fetch('/api/plugins', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        pluginId: data.pluginId,
        enabled: next.enabled ?? enabled,
        settings: next.settings ?? settings,
      }),
    })

    saving = false
    if (!res.ok) {
      saveError = (await res.json()).message ?? 'save failed'
      return
    }
    saved = true
    if (next.settings) settings = next.settings
  }

  function toggleEnabled() {
    enabled = !enabled
    persist({ enabled })
  }
</script>

<a class="back" href="/admin/plugins">← all plugins</a>
<div class="head">
  <h1>{data.name}</h1>
  <span class="version">v{data.version}</span>
  <label class="toggle">
    <input type="checkbox" checked={enabled} onchange={toggleEnabled} />
    {enabled ? 'enabled' : 'disabled'}
  </label>
</div>
<p class="desc">{data.description}</p>

{#if saveError}<p class="error">{saveError}</p>{/if}
{#if saved}<p class="ok">saved.</p>{/if}

{#if data.hasSettings}
  <section>
    <h2>Settings</h2>
    {#if SettingsComponent}
      {@const Settings = SettingsComponent}
      <Settings
        {settings}
        loading={saving}
        onUpdate={(next) => persist({ settings: next })}
      />
    {:else}
      <p class="muted">loading settings…</p>
    {/if}
  </section>
{/if}

{#if data.hasManagement}
  <section>
    <h2>Management</h2>
    {#if ManagementComponent}
      {@const Management = ManagementComponent}
      <Management pluginId={data.pluginId} />
    {:else}
      <p class="muted">loading management…</p>
    {/if}
  </section>
{/if}

<style>
  .back {
    font-size: 0.85rem;
    color: #3b58d6;
    text-decoration: none;
  }
  .head {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-top: 0.5rem;
  }
  .version {
    font-size: 0.8rem;
    opacity: 0.6;
  }
  .toggle {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.85rem;
  }
  .desc {
    opacity: 0.75;
  }
  .error {
    color: crimson;
  }
  .ok {
    color: #16a34a;
  }
  .muted {
    opacity: 0.6;
  }
  section {
    margin-top: 2rem;
    padding-top: 1.5rem;
    border-top: 1px solid #e5e7eb;
  }
  h2 {
    margin-top: 0;
  }
</style>
