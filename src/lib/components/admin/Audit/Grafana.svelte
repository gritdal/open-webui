<script lang="ts">
  /**
   * Grafana dashboard embed component.
   *
   * This component renders an iframe pointing at the Policy Enforcer
   * decision logs dashboard served by Grafana on port 8081.  The
   * dashboard URL includes a refresh query parameter so that panels
   * automatically update every 5 seconds.  If you need to embed a
   * different dashboard or adjust the refresh interval, update the
   * ``dashboardUrl`` constant below.
   */
  import { onMount } from 'svelte';

  // Default URL for the Policy Enforcer Decision Logs dashboard.  The
  // Grafana service in docker-compose exposes port 8081 on the host
  // and allows anonymous access.  Replace this with ``http://localhost:8081/dashboards``
  // if you prefer to show the Grafana home page instead of a specific
  // dashboard.
  const dashboardUrl: string =
    'http://localhost:8081/d/policy-enforcer-dashboard/policy-enforcer-decision-logs?orgId=1&refresh=5s';

  // Track whether the iframe has been loaded.  We could use this to
  // display a loading indicator if desired.
  let loaded = false;
  onMount(() => {
    // No special on‑mount logic required, but toggling a flag here
    // allows for future enhancements like a skeleton loader.
    loaded = true;
  });
</script>

<!--
  The wrapper div uses flexbox to stretch the iframe to fill the
  available vertical space.  A small header displays the title and a
  link that opens the dashboard in a new tab for convenience.
-->
<div class="w-full h-full flex flex-col space-y-2">
  <div class="flex items-center justify-between">
    <div class="font-medium">Grafana Dashboard</div>
    <!-- Open in a new tab to view the full Grafana UI.  Use
         target="_blank" and rel="noopener noreferrer" for security. -->
    <a
      href="http://localhost:8081/dashboards"
      target="_blank"
      rel="noopener noreferrer"
      class="text-sm underline hover:no-underline"
      >Open in new tab</a
    >
  </div>
  <!-- Embed the Grafana dashboard.  The sandbox attribute allows
       scripts and forms within the iframe, and same‑origin is permitted
       so that Grafana can function correctly. -->
  <iframe
    src={dashboardUrl}
    class="flex-1 w-full border rounded-md"
    sandbox="allow-same-origin allow-scripts allow-forms allow-modals"
  />
</div>