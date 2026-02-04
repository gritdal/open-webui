<script lang="ts">
  import { onMount } from 'svelte';

  // Track loading state, any error message, and the list of policies.
  let loading = false;
  let error: string = '';
  let policies: Array<{ name: string; policy: string }> = [];
  let lastUpdated: Date | null = null;

  // The API endpoint for retrieving department policies.  This
  // corresponds to the backend route defined in open_webui/routers/audit.py
  // and is prefixed automatically by the server with /api/v1/audit.
  const API_URL = '/api/v1/audit/policies';

  /**
   * Convert a slug or identifier into a human-readable title.  For
   * example, "human_resources" becomes "Human Resources".  This
   * helper replaces underscores with spaces and capitalises the
   * first letter of each word.
   */
  function prettyName(name: string): string {
    return name
      .split('_')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }

  /**
   * Fetch the list of policies from the backend.  On success the
   * ``policies`` array is updated and the lastUpdated timestamp is
   * recorded.  On failure an error message is stored.
   */
  async function fetchPolicies() {
    loading = true;
    error = '';
    try {
      const res = await fetch(API_URL, { headers: { accept: 'application/json' } });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || res.statusText);
      }
      const data = await res.json();
      // Ensure we have an array of objects with name and policy fields.
      policies = Array.isArray(data) ? data : [];
      lastUpdated = new Date();
    } catch (e: any) {
      error = e?.message ?? 'Failed to load policies';
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    fetchPolicies();
  });
</script>

<div class="flex items-center justify-between">
  <div class="font-medium">Policies</div>
  <div class="flex items-center gap-2">
    {#if lastUpdated}
      <div class="text-xs opacity-70">Updated {lastUpdated.toLocaleTimeString()}</div>
    {/if}
    <button
      class="text-sm px-2 py-1 rounded-md border hover:bg-gray-100 dark:hover:bg-gray-800"
      on:click={fetchPolicies}
      disabled={loading}
    >
      {loading ? 'Loading…' : 'Refresh'}
    </button>
  </div>
</div>

{#if error}
  <div class="mt-3 text-red-600 text-sm">{error}</div>
{/if}

<div class="mt-3 space-y-3">
  {#if policies.length === 0 && !loading && !error}
    <div class="text-sm opacity-70">No policies found.</div>
  {/if}

  {#each policies as p}
    <div class="border rounded-md p-3 bg-gray-50 dark:bg-gray-900">
      <details>
        <summary class="cursor-pointer text-sm font-medium">
          {prettyName(p.name)} Policy
        </summary>
        <!-- Display the policy text.  Use whitespace pre-wrap to preserve
             formatting and break long lines if necessary. -->
        <pre class="mt-2 whitespace-pre-wrap break-words text-xs overflow-auto">
{p.policy}
        </pre>
      </details>
    </div>
  {/each}
</div>