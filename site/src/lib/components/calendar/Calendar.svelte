<script lang="ts">
	import { goto } from '$app/navigation';
	import { formatDate, getCalendarDays, getToday } from '$lib/utils/date';

	export let currentYear: number;
	export let currentMonth: number; // 1-12
	export let datesWithDiaries: string[] = [];

	const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
	const monthNames = [
		'January',
		'February',
		'March',
		'April',
		'May',
		'June',
		'July',
		'August',
		'September',
		'October',
		'November',
		'December'
	];

	$: calendarDays = getCalendarDays(currentYear, currentMonth);
	$: todayStr = getToday();

	function isCurrentMonth(date: Date): boolean {
		return date.getMonth() === currentMonth - 1;
	}

	function isToday(date: Date): boolean {
		return formatDate(date) === todayStr;
	}

	function hasDiary(date: Date): boolean {
		return datesWithDiaries.includes(formatDate(date));
	}

	function handleDateClick(date: Date) {
		goto(`/diary/${formatDate(date)}`);
	}

	function goToPreviousMonth() {
		if (currentMonth === 1) {
			currentMonth = 12;
			currentYear--;
		} else {
			currentMonth--;
		}
	}

	function goToNextMonth() {
		if (currentMonth === 12) {
			currentMonth = 1;
			currentYear++;
		} else {
			currentMonth++;
		}
	}

	function goToToday() {
		const today = new Date();
		currentYear = today.getFullYear();
		currentMonth = today.getMonth() + 1;
	}
</script>

<div class="calendar">
	<!-- Calendar Header -->
	<div class="calendar-header">
		<button on:click={goToPreviousMonth} class="nav-button" title="Previous month">
			<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
			</svg>
		</button>

		<div class="month-year">
			<h2 class="text-xl font-semibold">
				{monthNames[currentMonth - 1]}
				{currentYear}
			</h2>
			<button on:click={goToToday} class="today-button"> Today </button>
		</div>

		<button on:click={goToNextMonth} class="nav-button" title="Next month">
			<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
			</svg>
		</button>
	</div>

	<!-- Week Days -->
	<div class="weekdays">
		{#each weekDays as day}
			<div class="weekday">{day}</div>
		{/each}
	</div>

	<!-- Calendar Days -->
	<div class="days">
		{#each calendarDays as date}
			<button
				on:click={() => handleDateClick(date)}
				class="day
					{isCurrentMonth(date) ? 'current-month' : 'other-month'}
					{isToday(date) ? 'today' : ''}
					{hasDiary(date) ? 'has-diary' : ''}"
			>
				<span class="day-number">{date.getDate()}</span>
				{#if hasDiary(date)}
					<span class="diary-indicator"></span>
				{/if}
			</button>
		{/each}
	</div>
</div>

<style>
	.calendar {
		width: 100%;
		max-width: 800px;
		margin: 0 auto;
	}

	.calendar-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 1.5rem;
		padding: 0 0.5rem;
	}

	.nav-button {
		padding: 0.5rem;
		border-radius: 0.5rem;
		transition: background-color 0.2s;
	}

	.nav-button:hover {
		background-color: #f3f4f6;
	}

	.month-year {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.today-button {
		padding: 0.375rem 0.75rem;
		font-size: 0.875rem;
		background-color: #3b82f6;
		color: white;
		border-radius: 0.375rem;
		transition: background-color 0.2s;
	}

	.today-button:hover {
		background-color: #2563eb;
	}

	.weekdays {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
		gap: 0.5rem;
		margin-bottom: 0.5rem;
	}

	.weekday {
		text-align: center;
		font-weight: 600;
		color: #6b7280;
		padding: 0.5rem;
		font-size: 0.875rem;
	}

	.days {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
		gap: 0.5rem;
	}

	.day {
		position: relative;
		aspect-ratio: 1;
		border-radius: 0.5rem;
		transition: all 0.2s;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		border: 2px solid transparent;
	}

	.day:hover {
		background-color: #f3f4f6;
	}

	.day.current-month {
		color: #1f2937;
	}

	.day.other-month {
		color: #d1d5db;
	}

	.day.today {
		background-color: #dbeafe;
		border-color: #3b82f6;
		font-weight: 600;
	}

	.day.has-diary {
		background-color: #fef3c7;
	}

	.day.has-diary:hover {
		background-color: #fde68a;
	}

	.day.today.has-diary {
		background-color: #bfdbfe;
	}

	.day-number {
		font-size: 0.875rem;
	}

	.diary-indicator {
		position: absolute;
		bottom: 0.25rem;
		width: 4px;
		height: 4px;
		background-color: #f59e0b;
		border-radius: 50%;
	}

	@media (max-width: 640px) {
		.weekday {
			font-size: 0.75rem;
			padding: 0.25rem;
		}

		.day-number {
			font-size: 0.75rem;
		}

		.days {
			gap: 0.25rem;
		}
	}
</style>
