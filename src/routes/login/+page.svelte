<script lang="ts">
  import { page } from '$app/state'
</script>

<div class="login">
  <h1>Demo login</h1>
  <p>
    This reference app has no real auth. Click below to become "admin" (sets a cookie) so you can
    open the admin console and use plugin write endpoints.
  </p>
  <form method="POST" action={`?/login&next=${page.url.searchParams.get('next') ?? '/admin/plugins'}`}>
    <button type="submit">Continue as admin</button>
  </form>
</div>

<style>
  .login {
    max-width: 32rem;
    margin: 4rem auto;
  }
  button {
    padding: 0.6rem 1.2rem;
    border: 0;
    border-radius: 0.5rem;
    background: #3b58d6;
    color: #fff;
    cursor: pointer;
    font: inherit;
  }
</style>
