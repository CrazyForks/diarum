import { pb } from './client';

export interface LoginCredentials {
	usernameOrEmail: string;
	password: string;
}

export interface RegisterData {
	username: string;
	email: string;
	password: string;
	passwordConfirm: string;
}

/**
 * Login with username/email and password
 */
export async function login(credentials: LoginCredentials) {
	try {
		const authData = await pb.collection('users').authWithPassword(
			credentials.usernameOrEmail,
			credentials.password
		);
		return { success: true, data: authData };
	} catch (error: any) {
		return {
			success: false,
			error: error.message || 'Login failed'
		};
	}
}

/**
 * Register a new user
 */
export async function register(data: RegisterData) {
	try {
		const record = await pb.collection('users').create(data);
		// Auto-login after registration
		await login({
			usernameOrEmail: data.username,
			password: data.password
		});
		return { success: true, data: record };
	} catch (error: any) {
		return {
			success: false,
			error: error.message || 'Registration failed'
		};
	}
}

/**
 * Logout current user
 */
export function logout() {
	pb.authStore.clear();
}

/**
 * Check if user is authenticated
 */
export function isLoggedIn(): boolean {
	return pb.authStore.isValid;
}

/**
 * Get current user
 */
export function getCurrentUser() {
	return pb.authStore.model;
}
