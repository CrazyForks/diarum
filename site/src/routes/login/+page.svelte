<script lang="ts">
	import { goto } from '$app/navigation';
	import { login, register, type LoginCredentials, type RegisterData } from '$lib/api/auth';
	import { onMount } from 'svelte';
	import { isAuthenticated } from '$lib/api/client';

	let activeTab: 'login' | 'register' = 'login';
	let loading = false;
	let error = '';

	// Login form
	let loginForm: LoginCredentials = {
		usernameOrEmail: '',
		password: ''
	};

	// Register form
	let registerForm: RegisterData = {
		username: '',
		email: '',
		password: '',
		passwordConfirm: ''
	};

	onMount(() => {
		// Redirect if already logged in
		if ($isAuthenticated) {
			const today = new Date().toISOString().split('T')[0];
			goto(`/diary/${today}`);
		}
	});

	async function handleLogin() {
		loading = true;
		error = '';

		const result = await login(loginForm);

		if (result.success) {
			const today = new Date().toISOString().split('T')[0];
			goto(`/diary/${today}`);
		} else {
			error = result.error || 'Login failed';
		}

		loading = false;
	}

	async function handleRegister() {
		loading = true;
		error = '';

		if (registerForm.password !== registerForm.passwordConfirm) {
			error = 'Passwords do not match';
			loading = false;
			return;
		}

		const result = await register(registerForm);

		if (result.success) {
			const today = new Date().toISOString().split('T')[0];
			goto(`/diary/${today}`);
		} else {
			error = result.error || 'Registration failed';
		}

		loading = false;
	}
</script>

<div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
	<div class="w-full max-w-md">
		<div class="text-center mb-8">
			<h1 class="text-4xl font-bold text-gray-900 mb-2">Diaria</h1>
			<p class="text-gray-600">Your personal diary</p>
		</div>

		<div class="bg-white rounded-lg shadow-lg p-8">
			<!-- Tabs -->
			<div class="flex border-b border-gray-200 mb-6">
				<button
					class="flex-1 py-2 px-4 text-center font-medium transition-colors {activeTab === 'login'
						? 'text-primary border-b-2 border-primary'
						: 'text-gray-500 hover:text-gray-700'}"
					on:click={() => {
						activeTab = 'login';
						error = '';
					}}
				>
					Login
				</button>
				<button
					class="flex-1 py-2 px-4 text-center font-medium transition-colors {activeTab === 'register'
						? 'text-primary border-b-2 border-primary'
						: 'text-gray-500 hover:text-gray-700'}"
					on:click={() => {
						activeTab = 'register';
						error = '';
					}}
				>
					Register
				</button>
			</div>

			{#if error}
				<div class="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
					{error}
				</div>
			{/if}

			{#if activeTab === 'login'}
				<form on:submit|preventDefault={handleLogin} class="space-y-4">
					<div>
						<label for="usernameOrEmail" class="block text-sm font-medium text-gray-700 mb-1">
							Username or Email
						</label>
						<input
							id="usernameOrEmail"
							type="text"
							bind:value={loginForm.usernameOrEmail}
							required
							class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
							placeholder="Enter your username or email"
						/>
					</div>

					<div>
						<label for="password" class="block text-sm font-medium text-gray-700 mb-1">
							Password
						</label>
						<input
							id="password"
							type="password"
							bind:value={loginForm.password}
							required
							class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
							placeholder="Enter your password"
						/>
					</div>

					<button
						type="submit"
						disabled={loading}
						class="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
					>
						{loading ? 'Logging in...' : 'Login'}
					</button>
				</form>
			{:else}
				<form on:submit|preventDefault={handleRegister} class="space-y-4">
					<div>
						<label for="username" class="block text-sm font-medium text-gray-700 mb-1">
							Username
						</label>
						<input
							id="username"
							type="text"
							bind:value={registerForm.username}
							required
							minlength="3"
							class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
							placeholder="Choose a username"
						/>
					</div>

					<div>
						<label for="email" class="block text-sm font-medium text-gray-700 mb-1">
							Email
						</label>
						<input
							id="email"
							type="email"
							bind:value={registerForm.email}
							required
							class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
							placeholder="Enter your email"
						/>
					</div>

					<div>
						<label for="registerPassword" class="block text-sm font-medium text-gray-700 mb-1">
							Password
						</label>
						<input
							id="registerPassword"
							type="password"
							bind:value={registerForm.password}
							required
							minlength="8"
							class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
							placeholder="Choose a password (min 8 chars)"
						/>
					</div>

					<div>
						<label for="passwordConfirm" class="block text-sm font-medium text-gray-700 mb-1">
							Confirm Password
						</label>
						<input
							id="passwordConfirm"
							type="password"
							bind:value={registerForm.passwordConfirm}
							required
							class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
							placeholder="Confirm your password"
						/>
					</div>

					<button
						type="submit"
						disabled={loading}
						class="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
					>
						{loading ? 'Creating account...' : 'Create Account'}
					</button>
				</form>
			{/if}
		</div>

		<p class="text-center text-sm text-gray-600 mt-6">
			A simple, private diary application
		</p>
	</div>
</div>
