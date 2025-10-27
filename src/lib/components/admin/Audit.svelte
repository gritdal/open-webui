<script lang="ts">
  import { getContext, onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';

  import DecisionLogs from '$lib/components/admin/Audit/DecisionLogs.svelte';

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
        <!-- simple list icon; you can swap to match Users icons -->
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="size-4">
          <path d="M3 4h10v2H3V4zm0 4h10v2H3V8zm0 4h10v2H3v-2z" />
        </svg>
      </div>
      <div class="self-center">{$i18n.t('Decision Logs')}</div>
    </button>
  </div>

  <!-- RIGHT CONTENT -->
  <div class="flex-1 mt-1 lg:mt-0 px-[16px] lg:pr-[16px] lg:pl-0 overflow-y-scroll">
    {#if selectedTab === 'decision-logs'}
      <DecisionLogs />
    {/if}
  </div>
</div>
