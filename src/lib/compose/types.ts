import type { SlideTimingDefaults, TutorialMeta } from '$lib/data/tutorials';

export const FORMAT_VERSION = '1.0.0';

export interface TutorialComposition {
	formatVersion?: string;
	slug: string;
	meta: TutorialMeta;
	description?: string;
	requirements?: string;
	welcome?: TutorialWelcome;
	briefing?: { en: string; ja?: string };
	slideTimings?: SlideTimingDefaults;
	blocks: CompositionBlock[];
	devOnly?: boolean;
}

export interface TutorialWelcome {
	heading?: { en: string; ja?: string };
	description?: { en: string; ja?: string };
	learnings?: Array<{ en: string; ja?: string }>;
}

export type CompositionBlock = TraceBlock;

export interface TraceBlock {
	kind: 'trace';
	sourceSlug: string;
	rounds?: number[];
}
