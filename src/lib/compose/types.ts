import type { TutorialMeta } from '$lib/data/tutorials';

export const FORMAT_VERSION = '1.0.0';

export interface TutorialComposition {
	formatVersion?: string;
	slug: string;
	meta: TutorialMeta;
	description?: string;
	requirements?: string;
	blocks: CompositionBlock[];
	devOnly?: boolean;
}

export type CompositionBlock = TraceBlock;

export interface TraceBlock {
	kind: 'trace';
	sourceSlug: string;
	rounds?: number[];
}
