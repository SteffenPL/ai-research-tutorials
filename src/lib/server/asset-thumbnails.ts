import { mkdirSync } from 'node:fs';
import { basename, dirname, extname, join } from 'node:path';
import { spawn } from 'node:child_process';

const THUMB_DIR = '_thumbs';
const THUMB_SIZE = 512;
const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp']);
const VIDEO_EXTENSIONS = new Set(['.mp4', '.mov', '.webm']);

function run(command: string, args: string[]): Promise<void> {
	return new Promise((resolve, reject) => {
		const child = spawn(command, args, { stdio: 'ignore' });
		child.on('error', reject);
		child.on('close', (code) => {
			if (code === 0) resolve();
			else reject(new Error(`${command} exited with code ${code}`));
		});
	});
}

export function isThumbnailSource(filename: string): boolean {
	const ext = extname(filename).toLowerCase();
	return IMAGE_EXTENSIONS.has(ext) || VIDEO_EXTENSIONS.has(ext);
}

export function thumbnailFilename(filename: string): string {
	const ext = extname(filename);
	const stem = basename(filename, ext);
	return `${stem}.jpg`;
}

export function thumbnailPathFor(assetPath: string): string {
	return join(dirname(assetPath), THUMB_DIR, thumbnailFilename(assetPath));
}

export async function generateAssetThumbnail(assetPath: string): Promise<string | null> {
	if (!isThumbnailSource(assetPath)) return null;

	const thumbPath = thumbnailPathFor(assetPath);
	mkdirSync(dirname(thumbPath), { recursive: true });

	const ext = extname(assetPath).toLowerCase();
	const isVideo = VIDEO_EXTENSIONS.has(ext);
	const filters = `scale=${THUMB_SIZE}:${THUMB_SIZE}:force_original_aspect_ratio=increase,crop=${THUMB_SIZE}:${THUMB_SIZE}`;
	const args = [
		'-y',
		...(isVideo ? ['-ss', '0.8'] : []),
		'-i', assetPath,
		'-vf', filters,
		'-frames:v', '1',
		'-q:v', '3',
		thumbPath
	];

	try {
		await run('ffmpeg', args);
		return thumbPath;
	} catch {
		return null;
	}
}
