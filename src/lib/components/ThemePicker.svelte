<script lang="ts">
	import { themeStore, THEMES, themesForMode, type ThemeMode } from '$lib/stores/theme.svelte';

	const currentMode = $derived(themeStore.mode);
	const options = $derived(themesForMode(currentMode));

	function toggleMode() {
		const newMode: ThemeMode = currentMode === 'dark' ? 'light' : 'dark';
		const sameColor = themeStore.theme.replace(/^(dark|light)-/, '');
		const match = THEMES.find(t => t.mode === newMode && t.id.endsWith(sameColor));
		const fallback = themesForMode(newMode)[0];
		themeStore.theme = (match ?? fallback).id;
	}
</script>

<div class="theme-picker">
	<!-- Dark/Light toggle pill -->
	<div class="mode-switch" role="group">
		<button
			class="mode-btn"
			class:active={currentMode === 'dark'}
			onclick={() => { if (currentMode !== 'dark') toggleMode(); }}
		>
			<span class="mode-icon">☾</span> Dark
		</button>
		<button
			class="mode-btn"
			class:active={currentMode === 'light'}
			onclick={() => { if (currentMode !== 'light') toggleMode(); }}
		>
			<span class="mode-icon">☀</span> Light
		</button>
	</div>

	<!-- Accent choices -->
	<div class="accent-row">
		{#each options as opt}
			<button
				class="accent-btn"
				class:active={themeStore.theme === opt.id}
				style="--swatch: {opt.swatch}"
				title={opt.label}
				onclick={() => (themeStore.theme = opt.id)}
			>
				<span class="accent-dot"></span>
				<span class="accent-label">{opt.label}</span>
			</button>
		{/each}
	</div>
</div>

<style>
	.theme-picker {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	/* ─── Dark / Light toggle ─── */
	.mode-switch {
		display: flex;
		background: var(--overlay-subtle);
		border-radius: 6px;
		padding: 2px;
		gap: 2px;
	}

	.mode-btn {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 4px;
		padding: 5px 8px;
		border: none;
		border-radius: 4px;
		background: transparent;
		color: var(--text-tertiary);
		font-family: var(--font-display);
		font-size: 11px;
		font-weight: 500;
		cursor: pointer;
		transition: background 0.15s, color 0.15s;
	}

	.mode-btn:hover {
		color: var(--text-secondary);
	}

	.mode-btn.active {
		background: var(--bg-hover);
		color: var(--text-primary);
	}

	.mode-icon {
		font-size: 12px;
		line-height: 1;
	}

	/* ─── Accent buttons ─── */
	.accent-row {
		display: flex;
		gap: 4px;
	}

	.accent-btn {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 5px;
		padding: 5px 6px;
		border: 1px solid var(--border-color);
		border-radius: 6px;
		background: transparent;
		color: var(--text-secondary);
		font-family: var(--font-display);
		font-size: 11px;
		cursor: pointer;
		transition: border-color 0.15s, background 0.15s;
	}

	.accent-btn:hover {
		background: var(--bg-hover);
	}

	.accent-btn.active {
		border-color: var(--accent);
		background: var(--accent-soft);
	}

	.accent-dot {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		background: var(--swatch);
		border: 1px solid var(--border-subtle);
		flex-shrink: 0;
	}
</style>
