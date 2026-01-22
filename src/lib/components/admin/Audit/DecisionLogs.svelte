<script lang="ts">
  import { onMount } from 'svelte';

  let loading = false;
  let error = '';
  let logs: any[] = [];
  let lastUpdated: Date | null = null;
  let autoRefresh = true;
  let intervalId: ReturnType<typeof setInterval> | null = null;

  // If you used a different proxy path, change this to match.
  const API_URL = '/api/v1/audit/decision-logs';

  const resultClass = (r: any) => {
    const v = (typeof r === 'string' ? r : String(r || '')).toLowerCase();
    if (v === 'allow')
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
    if (v === 'block')
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
    // Treat "warn" as a distinct state for styling.  A warn result
    // indicates the request was allowed but a warning action was
    // present.  Display it with a yellow label to differentiate
    // from plain allow.  Default to a neutral grey when the result
    // is unrecognised.
    if (v === 'warn')
      return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
    return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300';
  };

  // Same as resultClass, but also handles a "warn" state in yellow.
  const recommendedActionClass = (a: any) => {
    const v = (typeof a === 'string' ? a : String(a || '')).toLowerCase();
    if (v === 'allow')
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
    if (v === 'block')
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
    if (v === 'warn')
      return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
    return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300';
  };

  async function fetchLogs() {
    loading = true;
    error = '';
    try {
      const res = await fetch(API_URL, { headers: { accept: 'application/json' } });
      const text = await res.text();
      if (!res.ok) throw new Error(text || res.statusText);

      // Accept JSON array or NDJSON
      try {
        const parsed = JSON.parse(text);
        logs = Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        logs = text
          .split('\n')
          .map((l) => l.trim())
          .filter(Boolean)
          .map((l) => {
            try {
              return JSON.parse(l);
            } catch {
              return { raw: l };
            }
          });
      }

      // Optional: sort newest first if timestamps exist
      logs.sort((a, b) => {
        const ta = Date.parse(a?.timestamp || a?.time || 0);
        const tb = Date.parse(b?.timestamp || b?.time || 0);
        return (tb || 0) - (ta || 0);
      });

      lastUpdated = new Date();
    } catch (e: any) {
      error = e?.message ?? 'Failed to load logs';
    } finally {
      loading = false;
    }
  }

  function toggleAutoRefresh() {
    // autoRefresh = !autoRefresh;
    if (autoRefresh) {
      if (intervalId) clearInterval(intervalId);
      intervalId = setInterval(fetchLogs, 5000);
    } else if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }

  onMount(() => {
    fetchLogs();
    //intervalId = setInterval(fetchLogs, 5000);
    if (autoRefresh) intervalId = setInterval(fetchLogs, 5000);
    return () => intervalId && clearInterval(intervalId);
  });

  const fmt = (v: any) => (typeof v === 'string' ? v : JSON.stringify(v));
</script>

<div class="flex items-center justify-between">
  <div class="font-medium">Decision Logs</div>
  <div class="flex items-center gap-2">
    {#if lastUpdated}
      <div class="text-xs opacity-70">Updated {lastUpdated.toLocaleTimeString()}</div>
    {/if}
    <button
      class="text-sm px-2 py-1 rounded-md border hover:bg-gray-100 dark:hover:bg-gray-800"
      on:click={fetchLogs}
      disabled={loading}
    >
      {loading ? 'Loading…' : 'Refresh'}
    </button>
    <label class="text-sm flex items-center gap-2 cursor-pointer select-none">
      <input type="checkbox" bind:checked={autoRefresh} on:change={toggleAutoRefresh} />
      Auto-refresh
    </label>
  </div>
</div>

{#if error}
  <div class="mt-3 text-red-600 text-sm">{error}</div>
{/if}

<div class="mt-3 space-y-3">
  {#if logs.length === 0 && !loading && !error}
    <div class="text-sm opacity-70">No logs yet.</div>
  {/if}

  {#each logs as ev}
    <div class="border rounded-md p-3 bg-gray-50 dark:bg-gray-900">
      <div class="flex flex-wrap gap-x-6 gap-y-1 text-sm">
        <!-- Result shown first with coloured pill -->
        <div class="flex items-center gap-2">
          <span class="opacity-60">Result:</span>
          {#if ev.result}
            <span class={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${resultClass(ev.result)}`}>
              {ev.result}
            </span>
          {:else}
            <span>—</span>
          {/if}
        </div>
        <!-- Recommended action shown after result -->
        <div class="flex items-center gap-2">
          <span class="opacity-60">Recommended Action:</span>
          {#if ev.recommended_action}
            <span class={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${recommendedActionClass(ev.recommended_action)}`}>
              {ev.recommended_action}
            </span>
          {:else}
            <span>—</span>
          {/if}
        </div>
        <div><span class="opacity-60">User Email:</span> {fmt(ev.user_email ?? '—')}</div>
        <div><span class="opacity-60">Phase:</span> {fmt(ev.phase ?? '—')}</div>
        <div><span class="opacity-60">Timestamp:</span> {fmt(ev.timestamp || ev.time || '—')}</div>
        <div><span class="opacity-60">Decision ID:</span> {fmt(ev.decision_id ?? '—')}</div>
      </div>

      {#if ev.summary}
        <div class="mt-2 text-sm">{ev.summary}</div>
      {/if}

      <details class="mt-2">
        <summary class="text-sm cursor-pointer">Raw event</summary>
        <pre class="mt-2 text-xs overflow-auto">{JSON.stringify(ev.raw ?? ev, null, 2)}</pre>
      </details>
    </div>
  {/each}
</div>
