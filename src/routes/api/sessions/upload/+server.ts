import { json, error } from '@sveltejs/kit';
import { writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, join } from 'node:path';
import type { RequestHandler } from './$types';
import { SessionEvent } from '$lib/session/schema';

export const prerender = false;

function filterJsonl(raw: string): { filtered: string; kept: number; dropped: number } {
	const lines = raw.split('\n');
	const output: string[] = [];
	let kept = 0;
	let dropped = 0;
	for (const line of lines) {
		const trimmed = line.trim();
		if (!trimmed) continue;
		try {
			const obj = JSON.parse(trimmed);
			const result = SessionEvent.safeParse(obj);
			if (result.success) {
				output.push(JSON.stringify(result.data));
				kept++;
			} else {
				dropped++;
			}
		} catch {
			dropped++;
		}
	}
	return { filtered: output.join('\n') + '\n', kept, dropped };
}

export const POST: RequestHandler = async ({ request }) => {
	const formData = await request.formData();
	const file = formData.get('file') as File | null;
	const slug = formData.get('slug') as string | null;
	const parentSession = formData.get('parentSession') as string | null;

	if (!file || !slug) {
		error(400, 'Missing file or slug');
	}

	if (!file.name.endsWith('.jsonl')) {
		error(400, 'File must be a .jsonl file');
	}

	const raw = await file.text();
	const { filtered, kept, dropped } = filterJsonl(raw);

	const sessionId = file.name.replace(/\.jsonl$/, '');
	const outDir = parentSession
		? resolve('src/sessions', parentSession, sessionId, 'subagents')
		: resolve('src/sessions', slug);

	if (!existsSync(outDir)) {
		mkdirSync(outDir, { recursive: true });
	}

	const outFile = parentSession
		? join(outDir, file.name)
		: join(outDir, `${sessionId}.jsonl`);

	writeFileSync(outFile, filtered, 'utf-8');

	return json({
		ok: true,
		slug,
		sessionId,
		kept,
		dropped,
		parentSession: parentSession ?? null
	});
};
