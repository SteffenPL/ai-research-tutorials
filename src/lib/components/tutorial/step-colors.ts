import type { Step, StepType } from '$lib/data/tutorials';
import type { DisplayMode } from '$lib/trace/types';

export type StepCategory = 'primary' | 'supporting' | 'structural';

export interface StepTypeStyle {
	accent: string;
	icon: string;
	label: string;
	category: StepCategory;
	defaultMode: DisplayMode;
}

export const stepTypeColors: Record<StepType, StepTypeStyle> = {
	// Primary — the conversation itself (default: full)
	assistant:   { accent: 'var(--teal)',             icon: '○',  label: 'assistant',   category: 'primary',    defaultMode: 'full' },
	question:    { accent: 'var(--orange-300)',       icon: '?',  label: 'question',    category: 'primary',    defaultMode: 'full' },
	output:      { accent: 'var(--text-tertiary)',    icon: '$',  label: 'output',      category: 'primary',    defaultMode: 'full' },
	// Supporting — tool machinery (default: compact)
	tool_call:   { accent: 'var(--peach)',            icon: '⚡', label: 'tool_call',   category: 'supporting', defaultMode: 'compact' },
	tool_result: { accent: 'var(--border-subtle)',    icon: '←',  label: 'tool_result', category: 'supporting', defaultMode: 'compact' },
	thinking:    { accent: 'var(--mauve)',            icon: '✧',  label: 'thinking',    category: 'supporting', defaultMode: 'compact' },
	status:      { accent: 'var(--text-tertiary)',    icon: '•',  label: 'status',      category: 'supporting', defaultMode: 'compact' },
	permission:  { accent: 'var(--orange-300)',       icon: '⚿',  label: 'permission',  category: 'supporting', defaultMode: 'compact' },
	// Structural — visual structure and data (default: normal)
	window:      { accent: 'var(--green)',            icon: '↗',  label: 'window',      category: 'structural', defaultMode: 'normal' },
	table:       { accent: 'var(--text-tertiary)',    icon: '☷',  label: 'table',       category: 'structural', defaultMode: 'normal' },
	divider:     { accent: 'var(--text-tertiary)',    icon: '—',  label: 'divider',     category: 'structural', defaultMode: 'normal' },
};

export function getStepStyle(type: StepType | string): StepTypeStyle {
	return stepTypeColors[type as StepType] ?? stepTypeColors.status;
}

export function getDefaultMode(type: StepType | string): DisplayMode {
	return (stepTypeColors[type as StepType] ?? stepTypeColors.status).defaultMode;
}

export function getCategory(type: StepType | string): StepCategory {
	return (stepTypeColors[type as StepType] ?? stepTypeColors.status).category;
}

export const categoryLabels: Record<StepCategory, string> = {
	primary: 'Primary',
	supporting: 'Tools',
	structural: 'Windows',
};

export function compactSummary(step: Step): string {
	switch (step.type) {
		case 'assistant': return stripHtml(step.html).slice(0, 80);
		case 'thinking': return 'Thinking' + (step.duration ? ` (${step.duration})` : '');
		case 'tool_call': return `${step.toolName}${toolCallHint(step.code)}`;
		case 'tool_result': return toolResultHint(step.text);
		case 'permission': return `${step.tool} — ${step.granted ? 'allowed' : 'denied'}`;
		case 'question': return stripHtml(step.html).slice(0, 60);
		case 'output': return step.text.split('\n')[0].slice(0, 60);
		case 'window': return step.windowTitle;
		case 'table': return `Table: ${step.columns.join(', ')}`;
		case 'status': return step.text;
		case 'divider': return step.label;
		default: return '';
	}
}

function toolCallHint(code: string): string {
	try {
		const obj = JSON.parse(code.trim());
		if (typeof obj !== 'object' || obj === null) return '';
		const keys = Object.keys(obj);
		if (keys.length === 0) return '';
		const v = obj[keys[0]];
		if (typeof v === 'string') {
			const short = v.replace(/\n/g, ' ').slice(0, 30);
			return ` · ${short}${v.length > 30 ? '…' : ''}`;
		}
		return ` · ${keys[0]}`;
	} catch { return ''; }
}

function toolResultHint(text: string): string {
	try {
		const obj = JSON.parse(text.trim());
		if (typeof obj !== 'object' || obj === null) return text.slice(0, 60);
		const keys = Object.keys(obj);
		const hints: string[] = [];
		for (const k of keys) {
			const v = obj[k];
			if (v === null || v === '' || (Array.isArray(v) && v.length === 0)) continue;
			if (typeof v === 'string') hints.push(`${k}: ${v.slice(0, 20)}`);
			else if (typeof v === 'number' || typeof v === 'boolean') hints.push(`${k}: ${v}`);
			if (hints.length >= 3) break;
		}
		return hints.join(', ') || text.slice(0, 60);
	} catch { return text.slice(0, 60); }
}

function stripHtml(html: string): string {
	return html.replace(/<[^>]*>/g, '').trim();
}
