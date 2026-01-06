<script lang="ts">
  import { onMount } from 'svelte';

  /**
   * Action Settings component
   *
   * This component renders a simple form that allows administrators to
   * configure how the AISA orchestrator interprets policy
   * decisions.  The form exposes two settings:
   *
   * 1. decisionBlockLevel – determines when the orchestrator should
   *    block a request based on a policy decision.  Valid values are
   *    ``block`` (default), ``warn`` and ``none``.
   * 2. allowFallbackBlock – when true (the default) a boolean 'False' allow
   *    flag returned by the policy enforcer will result in blocking if
   *    no structured decision is available.  When false the
   *    orchestrator will always allow in this fallback case.
   *
   * The component fetches the current settings on mount via a GET
   * request to ``/api/v1/audit/config``.  Updates are sent to the
   * same endpoint via POST.  Errors are displayed inline.
   */

  // State variables
  let decisionBlockLevel: 'block' | 'warn' | 'none' = 'block';
  let allowFallbackBlock: boolean = true;
  let loading = false;
  let error: string = '';
  let success: string = '';

  // Fetch the current configuration from the backend
  async function fetchConfig() {
    loading = true;
    error = '';
    success = '';
    try {
      const res = await fetch('/api/v1/audit/config', {
        headers: { accept: 'application/json' },
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || res.statusText);
      }
      const data = await res.json();
      // Apply values if present; fall back to defaults
      if (data.decision_block_level && typeof data.decision_block_level === 'string') {
        const lvl = data.decision_block_level.toLowerCase();
        if (lvl === 'block' || lvl === 'warn' || lvl === 'none') {
          decisionBlockLevel = lvl;
        }
      }
      if (typeof data.allow_fallback_block === 'boolean') {
        allowFallbackBlock = data.allow_fallback_block;
      }
    } catch (e: any) {
      error = e?.message ?? 'Failed to load configuration';
    } finally {
      loading = false;
    }
  }

  // Post updated configuration to the backend
  async function updateConfig() {
    loading = true;
    error = '';
    success = '';
    const payload: any = {
      decision_block_level: decisionBlockLevel,
      allow_fallback_block: allowFallbackBlock,
    };
    try {
      const res = await fetch('/api/v1/audit/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || res.statusText);
      }
      const data = await res.json();
      // Reflect returned values in local state
      if (data.decision_block_level && typeof data.decision_block_level === 'string') {
        const lvl = data.decision_block_level.toLowerCase();
        if (lvl === 'block' || lvl === 'warn' || lvl === 'none') {
          decisionBlockLevel = lvl;
        }
      }
      if (typeof data.allow_fallback_block === 'boolean') {
        allowFallbackBlock = data.allow_fallback_block;
      }
      success = 'Settings updated successfully.';
    } catch (e: any) {
      error = e?.message ?? 'Failed to update configuration';
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    fetchConfig();
  });
</script>

<div class="flex items-center justify-between">
  <div class="font-medium">Action Settings</div>
  <button
    class="text-sm px-2 py-1 rounded-md border hover:bg-gray-100 dark:hover:bg-gray-800"
    on:click={fetchConfig}
    disabled={loading}
  >
    {loading ? 'Loading…' : 'Refresh'}
  </button>
</div>

{#if error}
  <div class="mt-3 text-red-600 text-sm">{error}</div>
{/if}
{#if success && !error}
  <div class="mt-3 text-green-600 text-sm">{success}</div>
{/if}

<!-- Configuration form -->
<form class="mt-4 space-y-4" on:submit|preventDefault={updateConfig}>
  <!-- Decision block level radio group -->
  <div>
    <div class="font-medium mb-1">Decision Block Level</div>
    <div class="space-x-6">
      <label class="inline-flex items-center cursor-pointer">
        <input
          type="radio"
          name="decisionBlockLevel"
          value="block"
          bind:group={decisionBlockLevel}
        />
        <span class="ml-1">Block</span>
      </label>
      <label class="inline-flex items-center cursor-pointer">
        <input
          type="radio"
          name="decisionBlockLevel"
          value="warn"
          bind:group={decisionBlockLevel}
        />
        <span class="ml-1">Warn</span>
      </label>
      <label class="inline-flex items-center cursor-pointer">
        <input
          type="radio"
          name="decisionBlockLevel"
          value="none"
          bind:group={decisionBlockLevel}
        />
        <span class="ml-1">Disabled</span>
      </label>
    </div>
    <div class="text-xs opacity-70 mt-1">
      Choose how strictly the orchestrator enforces policy decisions.  "Block"
      blocks only explicit "block" actions.  "Warn" blocks on both
      "warn" and "block" actions.  "Disabled" never blocks based on
      policy actions.
    </div>
  </div>

  <!-- Fallback block toggle -->
  <div>
    <label class="inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        bind:checked={allowFallbackBlock}
      />
      <span class="ml-2">Block on fallback boolean results</span>
    </label>
    <div class="text-xs opacity-70 mt-1">
      When enabled, a simple 'False' allow flag from the policy
      enforcer will block the request if no structured decision action
      is provided.  Disable to always allow in this case.
    </div>
  </div>

  <!-- Save button -->
  <button
    type="submit"
    class="text-sm px-3 py-1 rounded-md border hover:bg-gray-100 dark:hover:bg-gray-800"
    disabled={loading}
  >
    {loading ? 'Saving…' : 'Save'}
  </button>
</form>