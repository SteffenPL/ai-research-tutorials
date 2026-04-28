import { expect, test, type Page } from '@playwright/test';

async function expectVideoContained(page: Page, selector = '.fiji-window.media-window[data-content-kind="video"]') {
	const mediaWindow = page.locator(selector).first();
	await expect(mediaWindow).toBeVisible();
	await page.waitForFunction((sel) => {
		const container = document.querySelector<HTMLElement>(`${sel} .zoom-container`);
		const video = document.querySelector<HTMLVideoElement>(`${sel} video`);
		if (!container || !video || video.videoWidth <= 0 || video.videoHeight <= 0) return false;
		const cr = container.getBoundingClientRect();
		const vr = video.getBoundingClientRect();
		return vr.width > 120 && vr.height > 80 && vr.width <= cr.width + 1 && vr.height <= cr.height + 1;
	}, selector);

	const metrics = await mediaWindow.evaluate((windowEl) => {
		const container = windowEl.querySelector<HTMLElement>('.zoom-container');
		const content = windowEl.querySelector<HTMLElement>('.zoom-content');
		const video = windowEl.querySelector<HTMLVideoElement>('video');
		if (!container || !content || !video) throw new Error('missing media elements');
		const rect = (el: Element) => {
			const r = el.getBoundingClientRect();
			return { x: r.x, y: r.y, width: r.width, height: r.height };
		};
		const cs = getComputedStyle(video);
		return {
			container: rect(container),
			content: rect(content),
			video: rect(video),
			objectFit: cs.objectFit,
			videoWidth: video.videoWidth,
			videoHeight: video.videoHeight
		};
	});

	expect(metrics.objectFit).toBe('contain');
	expect(metrics.video.width).toBeLessThanOrEqual(metrics.container.width + 1);
	expect(metrics.video.height).toBeLessThanOrEqual(metrics.container.height + 1);
	expect(metrics.video.width).toBeGreaterThan(120);
	expect(metrics.video.height).toBeGreaterThan(80);
	expect(Math.abs(metrics.video.x - metrics.container.x)).toBeLessThanOrEqual(1);
	expect(Math.abs(metrics.video.y - metrics.container.y)).toBeLessThanOrEqual(1);
}

test.describe('tutorial media windows', () => {
	test('can jump directly to a window by URL and fit its video', async ({ page }) => {
		await page.goto('/tutorials/install-openai-codex?window=1');
		await expectVideoContained(page);
	});

	test('keeps video fitted after hide/show and resize', async ({ page }) => {
		await page.goto('/tutorials/install-openai-codex?window=1');
		await expectVideoContained(page);

		await page.goto('/tutorials/install-openai-codex?step=0');
		await page.reload();
		await expect(page.locator('.fiji-window.media-window[data-content-kind="video"]')).toHaveCSS('opacity', '0');

		await page.goto('/tutorials/install-openai-codex?window=1');
		await page.reload();
		await page.setViewportSize({ width: 1000, height: 760 });
		await expectVideoContained(page);

		await page.setViewportSize({ width: 1280, height: 900 });
		await expectVideoContained(page);
	});
});
