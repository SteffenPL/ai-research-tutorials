<script lang="ts">
	import { themeStore } from '$lib/stores/theme.svelte';
	import { browser } from '$app/environment';

	// Short prompts that fall as vertical character streams
	const prompts = [
		'segment the cells',
		'open cells.tif',
		'apply blur sigma=2',
		'run thresholding',
		'import napari',
		'pip install napari',
		'adjust contrast',
		'plot histogram',
		'read sequences',
		'conda activate',
		'from Bio import SeqIO',
		'viewer.add_labels()',
		'screenshot("out.png")',
		'np.median(image)',
		'fit gaussian',
		'find outliers',
		'export to CSV',
		'細胞を分割する',
		'画像を開く',
		'ぼかしを適用',
		'解析を実行',
		'データを読む',
		'結果を保存',
		'コントラスト調整',
		'ヒストグラム表示',
	];

	interface Column {
		x: number;
		y: number;
		speed: number;
		opacity: number;
		chars: string[];
		trailLength: number;
	}

	const digits = '0123456789';

	function randomDigit(): string {
		return digits[Math.floor(Math.random() * digits.length)];
	}

	let canvas = $state<HTMLCanvasElement>(null!);

	function setup(canvas: HTMLCanvasElement) {
		const ctx = canvas.getContext('2d')!;
		let animId: number;
		let columns: Column[] = [];

		const FONT_SIZE = 14;
		const CHAR_HEIGHT = FONT_SIZE + 2;

		function makeColumn(x: number, startY: number): Column {
			const prompt = prompts[Math.floor(Math.random() * prompts.length)];
			const chars = prompt.split('');
			return {
				x,
				y: startY,
				speed: 0.3 + Math.random() * 1.0,
				opacity: 0.12 + Math.random() * 0.40,
				chars,
				trailLength: chars.length,
			};
		}

		function initColumns() {
			const dpr = window.devicePixelRatio || 1;
			const numCols = Math.floor(canvas.width / dpr / FONT_SIZE);
			columns = [];

			for (let i = 0; i < numCols; i++) {
				if (Math.random() > 0.30) continue;
				const x = i * FONT_SIZE;
				const startY = -Math.random() * canvas.height;
				columns.push(makeColumn(x, startY));
			}
		}

		function resize() {
			const dpr = window.devicePixelRatio || 1;
			const rect = canvas.getBoundingClientRect();
			canvas.width = rect.width * dpr;
			canvas.height = rect.height * dpr;
			ctx.scale(dpr, dpr);
			initColumns();
		}

		function getColor(): [number, number, number] {
			return themeStore.current === 'dark'
				? [0, 168, 232]
				: [0, 119, 190];
		}

		function draw() {
			const rect = canvas.getBoundingClientRect();
			const w = rect.width;
			const h = rect.height;

			ctx.clearRect(0, 0, w, h);

			const [r, g, b] = getColor();
			ctx.font = `${FONT_SIZE}px 'JetBrains Mono', 'Noto Sans JP', monospace`;
			ctx.textBaseline = 'top';

			for (const col of columns) {
				col.y += col.speed;

				// chars[0] at top (col.y), chars[1] below, etc.
				for (let i = 0; i < col.trailLength; i++) {
					const charY = col.y + i * CHAR_HEIGHT;

					if (charY < -CHAR_HEIGHT || charY > h) continue;

					// From mid-screen down, randomly replace characters with digits
					const yNorm = charY / h; // 0=top, 1=bottom
					if (yNorm > 0.5) {
						const replaceChance = (yNorm - 0.5) * 2; // 0 at middle, 1 at bottom
						if (Math.random() < replaceChance * replaceChance * 0.15) {
							col.chars[i] = randomDigit();
						}
					}

					// Bottom char (last) is brightest, fades toward top
					const distFromBottom = col.trailLength - 1 - i;
					let fade: number;
					if (distFromBottom === 0) {
						fade = 1.0;
					} else {
						fade = 1.0 - distFromBottom / col.trailLength;
						fade = fade * fade;
					}

					const alpha = col.opacity * fade;
					if (alpha < 0.01) continue;

					ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
					ctx.fillText(col.chars[i], col.x, charY);
				}

				// Reset when the first (topmost) character has scrolled off the bottom
				if (col.y > h) {
					const prompt = prompts[Math.floor(Math.random() * prompts.length)];
					col.chars = prompt.split('');
					col.trailLength = col.chars.length;
					col.y = -(col.trailLength * CHAR_HEIGHT) - Math.random() * h * 0.5;
					col.speed = 0.3 + Math.random() * 1.0;
				}
			}

			animId = requestAnimationFrame(draw);
		}

		resize();
		draw();

		const resizeObserver = new ResizeObserver(resize);
		resizeObserver.observe(canvas.parentElement!);

		const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
		if (motionQuery.matches) {
			cancelAnimationFrame(animId);
		}

		return {
			destroy() {
				cancelAnimationFrame(animId);
				resizeObserver.disconnect();
			}
		};
	}
</script>

{#if browser}
	<canvas
		bind:this={canvas}
		use:setup
		class="matrix-rain"
		aria-hidden="true"
	></canvas>
{/if}

<style>
	.matrix-rain {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
		z-index: 0;
	}
</style>
