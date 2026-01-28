<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	onMount(() => {
		// Redirect to today's diary
		const today = new Date().toISOString().split('T')[0];
		goto(`/diary/${today}`);
	});
</script>

<div class="flex items-center justify-center min-h-screen">
	<p class="text-muted-foreground">Loading...</p>
</div>
