<script>
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	import Audit from '$lib/components/admin/Audit.svelte';

	onMount(() => {
		goto('/admin/audit/decision-logs');
	});
</script>

<Audit />
