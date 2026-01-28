<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import MarkdownEditor from '$lib/components/editor/MarkdownEditor.svelte';
	import { getDiaryByDate, saveDiary } from '$lib/api/diaries';
	import { isAuthenticated } from '$lib/api/client';
	import {
		formatDisplayDate,
		getDayOfWeek,
		getPreviousDay,
		getNextDay,
		getToday,
		isToday
	} from '$lib/utils/date';

	let date = $page.params.date;
	let content = '';
	let loading = true;
	let saving = false;
	let saveStatus = '';
	let saveTimer: NodeJS.Timeout;

	// Navigation
	function goToPreviousDay() {
		goto(`/diary/${getPreviousDay(date)}`);
	}

	function goToNextDay() {
		goto(`/diary/${getNextDay(date)}`);
	}

	function goToToday() {
		goto(`/diary/${getToday()}`);
	}

	function goToCalendar() {
		goto('/diary');
	}

	// Load diary content
	async function loadDiary() {
		loading = true;
		const diary = await getDiaryByDate(date);
		content = diary?.content || '';
		loading = false;
	}

	// Auto-save with debounce
	function handleContentChange(newContent: string) {
		content = newContent;
		saveStatus = 'Saving...';
		saving = true;

		clearTimeout(saveTimer);
		saveTimer = setTimeout(async () => {
			const success = await saveDiary({
				date,
				content
			});

			if (success) {
				saveStatus = 'Saved';
				setTimeout(() => {
					saveStatus = '';
				}, 2000);
			} else {
				saveStatus = 'Failed to save';
			}
			saving = false;
		}, 2000);
	}

	// Manual save
	async function handleManualSave() {
		saving = true;
		saveStatus = 'Saving...';

		const success = await saveDiary({
			date,
			content
		});

		if (success) {
			saveStatus = 'Saved';
			setTimeout(() => {
				saveStatus = '';
			}, 2000);
		} else {
			saveStatus = 'Failed to save';
		}
		saving = false;
	}

	// Keyboard shortcuts
	function handleKeyboard(event: KeyboardEvent) {
		if ((event.ctrlKey || event.metaKey) && event.key === 's') {
			event.preventDefault();
			handleManualSave();
		}
	}

	onMount(() => {
		// Check authentication
		if (!$isAuthenticated) {
			goto('/login');
			return;
		}

		loadDiary();
		window.addEventListener('keydown', handleKeyboard);

		return () => {
			window.removeEventListener('keydown', handleKeyboard);
			clearTimeout(saveTimer);
		};
	});

	// Reload when date changes
	$: if (date !== $page.params.date) {
		date = $page.params.date;
		loadDiary();
	}
</script>

<svelte:head>
	<title>{formatDisplayDate(date)} - Diaria</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
	<!-- Header -->
	<header class="bg-white border-b border-gray-200 sticky top-0 z-10">
		<div class="max-w-4xl mx-auto px-4 py-4">
			<div class="flex items-center justify-between">
				<!-- Navigation -->
				<div class="flex items-center gap-2">
					<button
						on:click={goToPreviousDay}
						class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
						title="Previous day"
					>
						<svg
							class="w-5 h-5"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M15 19l-7-7 7-7"
							/>
						</svg>
					</button>

					<button
						on:click={goToNextDay}
						class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
						title="Next day"
					>
						<svg
							class="w-5 h-5"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M9 5l7 7-7 7"
							/>
						</svg>
					</button>

					<button
						on:click={goToCalendar}
						class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
						title="Calendar"
					>
						<svg
							class="w-5 h-5"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
							/>
						</svg>
					</button>
				</div>

				<!-- Date Display -->
				<div class="flex-1 text-center">
					<h1 class="text-xl font-semibold text-gray-900">
						{formatDisplayDate(date)}
					</h1>
					<p class="text-sm text-gray-500">
						{getDayOfWeek(date)}
						{#if isToday(date)}
							<span class="text-blue-600 font-medium">• Today</span>
						{/if}
					</p>
				</div>

				<!-- Actions -->
				<div class="flex items-center gap-3">
					{#if saveStatus}
						<span
							class="text-sm {saveStatus === 'Saved'
								? 'text-green-600'
								: saveStatus === 'Saving...'
									? 'text-gray-500'
									: 'text-red-600'}"
						>
							{saveStatus}
						</span>
					{/if}

					{#if !isToday(date)}
						<button
							on:click={goToToday}
							class="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
						>
							Today
						</button>
					{/if}
				</div>
			</div>
		</div>
	</header>

	<!-- Editor -->
	<main class="max-w-4xl mx-auto px-4 py-8">
		{#if loading}
			<div class="flex items-center justify-center py-20">
				<div class="text-gray-500">Loading...</div>
			</div>
		{:else}
			<div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
				<MarkdownEditor
					{content}
					onChange={handleContentChange}
					placeholder="What's on your mind today?"
				/>
			</div>
		{/if}
	</main>

	<!-- Footer hint -->
	<footer class="max-w-4xl mx-auto px-4 py-4 text-center text-sm text-gray-500">
		Press <kbd class="px-2 py-1 bg-gray-100 rounded">Ctrl+S</kbd> or
		<kbd class="px-2 py-1 bg-gray-100 rounded">⌘S</kbd> to save manually
	</footer>
</div>

<style>
	kbd {
		font-family: monospace;
		font-size: 0.875em;
	}
</style>
