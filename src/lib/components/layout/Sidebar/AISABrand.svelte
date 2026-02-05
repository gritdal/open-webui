<script lang="ts">
	import { WEBUI_BASE_URL } from '$lib/constants';

	export let href: string = 'https://gritdynamics.co';
	export let label: string = 'AISA';

	export let logoSrc: string = '{WEBUI_BASE_URL}/static/AISA_logo_v1_noborder.png';

	export let collapsed: boolean = false;
</script>

<a
    class="mx-1 my-1 flex w-full items-center justify-center rounded-lg px-1 py-1 hover:bg-gray-100 dark:hover:bg-gray-800"
	href={href}
	target="_blank"
	rel="noreferrer"
	aria-label={label}
>
	<img crossorigin="anonymous" src={logoSrc} alt={label} class="w-full h-auto object-contain"
 />
</a>
