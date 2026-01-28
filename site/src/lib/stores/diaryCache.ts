import { writable, get } from 'svelte/store';
import type { Diary } from '$lib/api/client';

interface CacheEntry {
	content: string;
	localUpdatedAt: number;  // Local modification timestamp
	serverUpdatedAt: string | null;  // Server updated timestamp
	isDirty: boolean;  // Has unsaved changes
}

interface DiaryCache {
	[date: string]: CacheEntry;
}

interface SyncState {
	isSyncing: boolean;
	currentDate: string | null;
	status: 'idle' | 'saving' | 'saved' | 'error';
	message: string;
}

// Cache store
export const diaryCache = writable<DiaryCache>({});

// Global sync state
export const syncState = writable<SyncState>({
	isSyncing: false,
	currentDate: null,
	status: 'idle',
	message: ''
});

// Sync timer
let syncTimer: ReturnType<typeof setTimeout> | null = null;
const SYNC_INTERVAL = 3000; // 3 seconds

/**
 * Get cached content for a date
 */
export function getCachedContent(date: string): CacheEntry | null {
	const cache = get(diaryCache);
	return cache[date] || null;
}

/**
 * Update local cache with edited content
 */
export function updateLocalCache(date: string, content: string) {
	diaryCache.update(cache => {
		const existing = cache[date];
		return {
			...cache,
			[date]: {
				content,
				localUpdatedAt: Date.now(),
				serverUpdatedAt: existing?.serverUpdatedAt || null,
				isDirty: true
			}
		};
	});

	// Schedule sync
	scheduleSyncToServer();
}

/**
 * Update cache from server data
 */
export function updateFromServer(date: string, diary: Diary | null) {
	const cache = get(diaryCache);
	const existing = cache[date];

	const serverContent = diary?.content || '';
	const serverUpdated = diary?.updated || null;

	// If local cache exists and is dirty, compare timestamps
	if (existing && existing.isDirty) {
		// Server data is newer - this shouldn't normally happen
		// but if it does, we keep local changes and mark for sync
		return;
	}

	// Update cache with server data
	diaryCache.update(c => ({
		...c,
		[date]: {
			content: serverContent,
			localUpdatedAt: Date.now(),
			serverUpdatedAt: serverUpdated,
			isDirty: false
		}
	}));
}

/**
 * Get content to display (prefers local dirty cache)
 */
export function getDisplayContent(date: string): string {
	const cache = get(diaryCache);
	const entry = cache[date];
	return entry?.content || '';
}

/**
 * Check if date has dirty cache
 */
export function hasDirtyCache(date: string): boolean {
	const cache = get(diaryCache);
	return cache[date]?.isDirty || false;
}

/**
 * Get all dirty entries
 */
export function getDirtyEntries(): { date: string; content: string }[] {
	const cache = get(diaryCache);
	return Object.entries(cache)
		.filter(([_, entry]) => entry.isDirty)
		.map(([date, entry]) => ({ date, content: entry.content }));
}

/**
 * Mark entry as synced
 */
export function markAsSynced(date: string, serverUpdatedAt: string) {
	diaryCache.update(cache => {
		if (!cache[date]) return cache;
		return {
			...cache,
			[date]: {
				...cache[date],
				serverUpdatedAt,
				isDirty: false
			}
		};
	});
}

/**
 * Schedule sync to server
 */
function scheduleSyncToServer() {
	if (syncTimer) {
		clearTimeout(syncTimer);
	}

	syncTimer = setTimeout(() => {
		syncDirtyEntries();
	}, SYNC_INTERVAL);
}

/**
 * Sync all dirty entries to server
 */
async function syncDirtyEntries() {
	const dirtyEntries = getDirtyEntries();

	if (dirtyEntries.length === 0) {
		syncState.set({
			isSyncing: false,
			currentDate: null,
			status: 'idle',
			message: ''
		});
		return;
	}

	syncState.set({
		isSyncing: true,
		currentDate: dirtyEntries[0].date,
		status: 'saving',
		message: 'Saving...'
	});

	// Import saveDiary dynamically to avoid circular dependency
	const { saveDiary } = await import('$lib/api/diaries');

	for (const entry of dirtyEntries) {
		try {
			const success = await saveDiary({
				date: entry.date,
				content: entry.content
			});

			if (success) {
				markAsSynced(entry.date, new Date().toISOString());
			}
		} catch (error) {
			console.error(`Failed to sync diary for ${entry.date}:`, error);
			syncState.set({
				isSyncing: false,
				currentDate: entry.date,
				status: 'error',
				message: 'Failed to save'
			});
			return;
		}
	}

	syncState.set({
		isSyncing: false,
		currentDate: null,
		status: 'saved',
		message: 'Saved'
	});

	// Clear saved message after 2 seconds
	setTimeout(() => {
		syncState.update(s => {
			if (s.status === 'saved') {
				return { ...s, status: 'idle', message: '' };
			}
			return s;
		});
	}, 2000);
}

/**
 * Force sync immediately
 */
export async function forceSyncNow(): Promise<boolean> {
	if (syncTimer) {
		clearTimeout(syncTimer);
		syncTimer = null;
	}

	const dirtyEntries = getDirtyEntries();
	if (dirtyEntries.length === 0) return true;

	syncState.set({
		isSyncing: true,
		currentDate: dirtyEntries[0].date,
		status: 'saving',
		message: 'Saving...'
	});

	const { saveDiary } = await import('$lib/api/diaries');

	for (const entry of dirtyEntries) {
		try {
			const success = await saveDiary({
				date: entry.date,
				content: entry.content
			});

			if (success) {
				markAsSynced(entry.date, new Date().toISOString());
			} else {
				syncState.set({
					isSyncing: false,
					currentDate: entry.date,
					status: 'error',
					message: 'Failed to save'
				});
				return false;
			}
		} catch (error) {
			console.error(`Failed to sync diary for ${entry.date}:`, error);
			syncState.set({
				isSyncing: false,
				currentDate: entry.date,
				status: 'error',
				message: 'Failed to save'
			});
			return false;
		}
	}

	syncState.set({
		isSyncing: false,
		currentDate: null,
		status: 'saved',
		message: 'Saved'
	});

	setTimeout(() => {
		syncState.update(s => {
			if (s.status === 'saved') {
				return { ...s, status: 'idle', message: '' };
			}
			return s;
		});
	}, 2000);

	return true;
}

/**
 * Clear cache for a specific date
 */
export function clearCache(date: string) {
	diaryCache.update(cache => {
		const { [date]: _, ...rest } = cache;
		return rest;
	});
}

/**
 * Clear all cache
 */
export function clearAllCache() {
	diaryCache.set({});
}
