<script lang="ts">
	import { themeStore } from '$lib/stores/theme.svelte';

	const theme = $derived(themeStore.theme);
	const hasGradient = $derived(!theme.startsWith('dark-matrix'));
</script>

<div class="wallpaper">
	{#if hasGradient}
		<div class="wallpaper-gradient wallpaper-gradient--{theme}"></div>
	{/if}
</div>

<style>
	.wallpaper {
		position: absolute;
		inset: 0;
		z-index: 0;
		overflow: hidden;
		background: var(--wallpaper-base);
	}

	.wallpaper-gradient {
		position: absolute;
		inset: 0;
		filter: blur(40px) saturate(1.5);
	}

	/* ─── Dark Aubergine — the original 8-layer mesh ─── */
	.wallpaper-gradient--dark-aubergine {
		background:
			radial-gradient(ellipse 75% 60% at 10% 90%, rgba(233, 84, 32, 0.52) 0%, transparent 70%),
			radial-gradient(ellipse 50% 45% at 35% 80%, rgba(245, 140, 55, 0.32) 0%, transparent 55%),
			radial-gradient(ellipse 50% 60% at 30% 55%, rgba(200, 60, 115, 0.24) 0%, transparent 65%),
			radial-gradient(ellipse 60% 50% at 88% 12%, rgba(210, 110, 170, 0.32) 0%, transparent 60%),
			radial-gradient(ellipse 80% 30% at 65% 70%, rgba(250, 160, 60, 0.26) 0%, transparent 60%),
			radial-gradient(ellipse 45% 55% at 80% 85%, rgba(150, 60, 140, 0.22) 0%, transparent 55%),
			radial-gradient(ellipse 55% 50% at 85% 10%, rgba(255, 130, 60, 0.50) 0%, transparent 60%),
			radial-gradient(ellipse 40% 35% at 95% 5%, rgba(255, 185, 110, 0.42) 0%, transparent 65%),
			radial-gradient(ellipse 90% 70% at 50% 50%, rgba(78, 22, 54, 0.45) 0%, transparent 70%),
			var(--wallpaper-gradient);
	}

	/* ─── Dark Ocean — blue/teal mesh on dark base ─── */
	.wallpaper-gradient--dark-ocean {
		background:
			radial-gradient(ellipse 75% 60% at 10% 90%, rgba(32, 120, 200, 0.48) 0%, transparent 70%),
			radial-gradient(ellipse 50% 45% at 35% 80%, rgba(55, 150, 220, 0.30) 0%, transparent 55%),
			radial-gradient(ellipse 50% 60% at 30% 55%, rgba(40, 100, 180, 0.22) 0%, transparent 65%),
			radial-gradient(ellipse 60% 50% at 88% 12%, rgba(80, 160, 210, 0.32) 0%, transparent 60%),
			radial-gradient(ellipse 80% 30% at 65% 70%, rgba(30, 140, 190, 0.24) 0%, transparent 60%),
			radial-gradient(ellipse 45% 55% at 80% 85%, rgba(40, 80, 160, 0.22) 0%, transparent 55%),
			radial-gradient(ellipse 55% 50% at 85% 10%, rgba(60, 180, 230, 0.44) 0%, transparent 60%),
			radial-gradient(ellipse 40% 35% at 95% 5%, rgba(120, 200, 240, 0.36) 0%, transparent 65%),
			radial-gradient(ellipse 90% 70% at 50% 50%, rgba(15, 30, 60, 0.50) 0%, transparent 70%),
			var(--wallpaper-gradient);
	}

	/* ─── Light Aubergine — soft warm mesh ─── */
	.wallpaper-gradient--light-aubergine {
		background:
			radial-gradient(ellipse 75% 60% at 10% 90%, rgba(200, 72, 16, 0.18) 0%, transparent 70%),
			radial-gradient(ellipse 50% 45% at 35% 80%, rgba(220, 120, 40, 0.12) 0%, transparent 55%),
			radial-gradient(ellipse 50% 60% at 30% 55%, rgba(160, 40, 80, 0.08) 0%, transparent 65%),
			radial-gradient(ellipse 60% 50% at 88% 12%, rgba(140, 80, 120, 0.12) 0%, transparent 60%),
			radial-gradient(ellipse 80% 30% at 65% 70%, rgba(200, 110, 40, 0.10) 0%, transparent 60%),
			radial-gradient(ellipse 55% 50% at 85% 10%, rgba(200, 80, 30, 0.14) 0%, transparent 60%),
			radial-gradient(ellipse 90% 70% at 50% 50%, rgba(80, 20, 50, 0.10) 0%, transparent 70%),
			var(--wallpaper-gradient);
	}

	/* ─── Light Sky — airy blue mesh ─── */
	.wallpaper-gradient--light-sky {
		background:
			radial-gradient(ellipse 75% 60% at 10% 90%, rgba(24, 104, 168, 0.16) 0%, transparent 70%),
			radial-gradient(ellipse 50% 45% at 35% 80%, rgba(40, 130, 200, 0.12) 0%, transparent 55%),
			radial-gradient(ellipse 50% 60% at 30% 55%, rgba(30, 90, 160, 0.08) 0%, transparent 65%),
			radial-gradient(ellipse 60% 50% at 88% 12%, rgba(60, 140, 200, 0.14) 0%, transparent 60%),
			radial-gradient(ellipse 80% 30% at 65% 70%, rgba(20, 120, 180, 0.10) 0%, transparent 60%),
			radial-gradient(ellipse 55% 50% at 85% 10%, rgba(50, 160, 220, 0.16) 0%, transparent 60%),
			radial-gradient(ellipse 90% 70% at 50% 50%, rgba(15, 40, 70, 0.10) 0%, transparent 70%),
			var(--wallpaper-gradient);
	}

	/* ─── Light Sunset — warm amber mesh ─── */
	.wallpaper-gradient--light-sunset {
		background:
			radial-gradient(ellipse 75% 60% at 10% 90%, rgba(200, 100, 20, 0.18) 0%, transparent 70%),
			radial-gradient(ellipse 50% 45% at 35% 80%, rgba(220, 140, 40, 0.14) 0%, transparent 55%),
			radial-gradient(ellipse 50% 60% at 30% 55%, rgba(180, 70, 20, 0.10) 0%, transparent 65%),
			radial-gradient(ellipse 60% 50% at 88% 12%, rgba(210, 120, 60, 0.14) 0%, transparent 60%),
			radial-gradient(ellipse 80% 30% at 65% 70%, rgba(180, 90, 20, 0.12) 0%, transparent 60%),
			radial-gradient(ellipse 55% 50% at 85% 10%, rgba(220, 160, 40, 0.18) 0%, transparent 60%),
			radial-gradient(ellipse 90% 70% at 50% 50%, rgba(60, 20, 8, 0.12) 0%, transparent 70%),
			var(--wallpaper-gradient);
	}

	/* Dark Matrix: no gradient, just solid --wallpaper-base */
</style>
