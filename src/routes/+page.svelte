<h1>SvelteKit Plugin System</h1>
<p class="lead">
  A manifest-driven plugin architecture: drop a folder under
  <code>src/lib/plugins/</code> and it's auto-discovered — no core code to edit. This app ships
  two example plugins.
</p>

<div class="cards">
  <a class="card" href="/browse">
    <h3>Browse →</h3>
    <p>Plugin-contributed sections, each lazy-loading its own component.</p>
  </a>
  <a class="card" href="/admin/plugins">
    <h3>Admin console →</h3>
    <p>Enable/disable plugins and edit their settings & data.</p>
  </a>
  <a class="card" href="/quotes/ada-lovelace">
    <h3>A plugin page →</h3>
    <p><code>/quotes/&lt;slug&gt;</code>, served by the generic plugin page route.</p>
  </a>
</div>

<section class="quickstart">
  <h2>Try it</h2>
  <ol>
    <li><a href="/login">Log in</a> as the demo admin.</li>
    <li>Open the <a href="/admin/plugins">admin console</a> and enable both plugins.</li>
    <li>Add authors/quotes in the Quotes plugin's management tab.</li>
    <li>Visit <a href="/browse">browse</a> to see the sections render.</li>
  </ol>
</section>

<style>
  .lead {
    font-size: 1.05rem;
    opacity: 0.8;
    max-width: 42rem;
  }
  code {
    background: #f3f4f6;
    padding: 0.1rem 0.35rem;
    border-radius: 0.25rem;
    font-size: 0.9em;
  }
  .cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
    gap: 1rem;
    margin: 2rem 0;
  }
  .card {
    padding: 1.25rem;
    border: 1px solid #e5e7eb;
    border-radius: 0.75rem;
    text-decoration: none;
    color: inherit;
    background: #fff;
    transition: border-color 0.15s ease;
  }
  .card:hover {
    border-color: #3b58d6;
  }
  .card h3 {
    margin: 0 0 0.4rem;
    color: #3b58d6;
  }
  .card p {
    margin: 0;
    font-size: 0.9rem;
    opacity: 0.75;
  }
  .quickstart ol {
    line-height: 1.9;
  }
</style>
