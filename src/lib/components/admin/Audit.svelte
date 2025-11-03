<script lang="ts">
  import { getContext, onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';

  import DecisionLogs from '$lib/components/admin/Audit/DecisionLogs.svelte';
  import Policies from '$lib/components/admin/Audit/Policies.svelte';

  const i18n = getContext('i18n');

  let selectedTab = 'decision-logs';
  $: selectedTab = $page.params.tab ?? 'decision-logs';

  // optional: ensure default route if someone hits /admin/audit with no tab
  onMount(() => {
    if (!($page.params.tab)) goto('/admin/audit/decision-logs', { replaceState: true });
  });
</script>

<!-- Match Users.svelte outer layout -->
<div class="flex flex-col lg:flex-row w-full h-full pb-2 lg:space-x-4">
  <!-- LEFT TABS: copy the same classes from Users.svelte for consistency -->
  <div
    id="audit-tabs-container"
    class="mx-[16px] lg:mx-0 lg:px-[16px] flex flex-row lg:flex-col overflow-x-auto lg:overflow-visible
           text-gray-900 dark:text-gray-200 text-sm font-medium text-left scrollbar-none"
  >
    <!-- Decision Logs tab button (same structure & classes as Users tabs) -->
    <button
      id="decision-logs"
      class="px-0.5 py-1 min-w-fit rounded-lg lg:flex-none flex text-right transition
             {selectedTab === 'decision-logs'
               ? ''
               : ' text-gray-300 dark:text-gray-600 hover:text-gray-700 dark:hover:text-white'}"
      on:click={() => goto('/admin/audit/decision-logs')}
    >
      <div class="self-center mr-2">
        <!-- list icon for decision logs -->
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="size-4">
          <path d="M3 4h10v2H3V4zm0 4h10v2H3V8zm0 4h10v2H3v-2z" />
        </svg>
      </div>
      <div class="self-center">{$i18n.t('Decision Logs')}</div>
    </button>

    <!-- Policies tab button -->
    <button
      id="policies"
      class="px-0.5 py-1 min-w-fit rounded-lg lg:flex-none flex text-right transition
             {selectedTab === 'policies'
               ? ''
               : ' text-gray-300 dark:text-gray-600 hover:text-gray-700 dark:hover:text-white'}"
      on:click={() => goto('/admin/audit/policies')}
    >
      <div class="self-center mr-2">
        <!-- document icon for policies -->
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="size-4">
          <path d="M4 2.5A1.5 1.5 0 015.5 1h4a1.5 1.5 0 011.5 1.5V5h3l-4 4-4-4h3V2.5a.5.5 0 00-.5-.5h-4a.5.5 0 00-.5.5v11a.5.5 0 00.5.5h4a.5.5 0 00.5-.5v-3.5h1V13a1.5 1.5 0 01-1.5 1.5h-4A1.5 1.5 0 014 13V2.5z" />
        </svg>
      </div>
      <div class="self-center">{$i18n.t('Policies')}</div>
    </button>
  </div>

  <!-- RIGHT CONTENT -->
  <div class="flex-1 mt-1 lg:mt-0 px-[16px] lg:pr-[16px] lg:pl-0 overflow-y-scroll">
    {#if selectedTab === 'decision-logs'}
      <DecisionLogs />
    {/if}
    {#if selectedTab === 'policies'}
      <Policies />
    {/if}
  </div>
</div>
