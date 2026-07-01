<!--
  isolates a plugin component's render errors so one broken plugin can't crash the host page.
  uses svelte 5's <svelte:boundary>. shows a fallback with a retry, and error details in dev.

  usage:
    <PluginErrorBoundary pluginId="quotes">
      <PluginComponent {...props} />
    </PluginErrorBoundary>
-->
<script lang="ts">
  interface Props {
    pluginId: string
    children: import('svelte').Snippet
  }

  let { pluginId, children }: Props = $props()

  function handleError(error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error))
    console.error('[plugin-error-boundary]', { pluginId, error: err })
  }
</script>

<svelte:boundary onerror={handleError}>
  {@render children()}

  {#snippet failed(error, reset)}
    {@const message = error instanceof Error ? error.message : String(error)}
    <div class="fallback" role="alert" aria-live="assertive">
      <h3>plugin error</h3>
      <p>this plugin section encountered an error and couldn't be displayed.</p>
      {#if import.meta.env.DEV && message}
        <details>
          <summary>error details</summary>
          <pre>{message}</pre>
        </details>
      {/if}
      <button type="button" onclick={reset}>try again</button>
    </div>
  {/snippet}
</svelte:boundary>

<style>
  .fallback {
    border: 1px solid color-mix(in srgb, crimson 30%, transparent);
    background: color-mix(in srgb, crimson 8%, transparent);
    border-radius: 0.5rem;
    padding: 1rem 1.25rem;
  }
  h3 {
    margin: 0;
    font-size: 0.9rem;
    color: crimson;
  }
  p {
    margin: 0.4rem 0 0;
    font-size: 0.85rem;
    opacity: 0.85;
  }
  details {
    margin-top: 0.6rem;
    font-size: 0.8rem;
  }
  summary {
    cursor: pointer;
  }
  pre {
    margin-top: 0.4rem;
    padding: 0.5rem;
    overflow-x: auto;
    background: color-mix(in srgb, crimson 12%, transparent);
    border-radius: 0.25rem;
  }
  button {
    margin-top: 0.8rem;
    padding: 0.35rem 0.75rem;
    font-size: 0.8rem;
    border: 0;
    border-radius: 0.375rem;
    cursor: pointer;
  }
</style>
