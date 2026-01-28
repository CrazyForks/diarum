<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import Calendar from '$lib/components/calendar/Calendar.svelte';
	import { getDatesWithDiaries } from '$lib/api/diaries';
	import { isAuthenticated } from '$lib/api/client';
	import { getMonthRange } from '$lib/utils/date';

	let currentYear = new Date().getFullYear();
	let currentMonth = new Date().getMonth() + 1;
	let datesWithDiaries: string[] = [];
	let loading = true;

	async function loadDatesWithDiaries() {
		loading = true;
		const range = getMonthRange(currentYear, currentMonth);
		datesWithDiaries = await getDatesWithDiaries(range.start, range.end);
		loading = false;
	}

	onMount(() => {
		// Check authentication
		if (!$isAuthenticated) {
			goto('/login');
			return;
		}

		loadDatesWithDiaries();
	});

	// Reload when month/year changes
	$: {
		if (currentYear && currentMonth) {
			loadDatesWithDiaries();
		}
	}
</script>

<svelte:head>
	<title>Calendar - Diaria</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
	<!-- Header -->
	<header class="bg-white border-b border-gray-200">
		<div class="max-w-6xl mx-auto px-4 py-4">
			<div class="flex items-center justify-between">
				<h1 class="text-2xl font-bold text-gray-900">Diaria</h1>

				<div class="flex items-center gap-3">
					<a
						href="/search"
						class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
						title="Search"
					>
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
							/>
						</svg>
					</a>

					<a
						href="/diary/{new Date().toISOString().split('T')[0]}"
						class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
					>
						Today's Diary
					</a>
				</div>
			</div>
		</div>
	</header>

	<!-- Calendar -->
	<main class="max-w-6xl mx-auto px-4 py-8">
		<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
			{#if loading}
				<div class="flex items-center justify-center py-20">
					<div class="text-gray-500">Loading calendar...</div>
				</div>
			{:else}
				<Calendar bind:currentYear bind:currentMonth {datesWithDiaries} />
			{/if}
		</div>

		<!-- Stats -->
		<div class="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
			<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
				<div class="text-sm text-gray-600">Entries this month</div>
				<div class="text-2xl font-bold text-gray-900 mt-1">
					{datesWithDiaries.length}
				</div>
			</div>

			<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
				<div class="text-sm text-gray-600">Current streak</div>
				<div class="text-2xl font-bold text-gray-900 mt-1">-</div>
				<div class="text-xs text-gray-500 mt-1">Coming soon</div>
			</div>

			<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
				<div class="text-sm text-gray-600">Total entries</div>
				<div class="text-2xl font-bold text-gray-900 mt-1">-</div>
				<div class="text-xs text-gray-500 mt-1">Coming soon</div>
			</div>
		</div>
	</main>
</div>
