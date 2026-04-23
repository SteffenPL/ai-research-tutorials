/**
 * Converts DisplayNode[] (raw session model) to Step[] (tutorial model)
 * so the log view can reuse StepRenderer + CompactChipFlow.
 *
 * compact/hidden flags are set based on:
 *   - step-colors defaults (supporting types → compact)
 *   - detail level (0–3 controls visibility via hidden flag)
 *   - hide toggles (thinking, tool results)
 */

import type { DisplayNode, SubagentView, ToolInvocationResult } from './viewmodel';
import type {
	Step,
	AssistantStep,
	ThinkingStep,
	ToolCallStep,
	ToolResultStep,
	StatusStep,
	DividerStep
} from '$lib/data/tutorials';
import type { DetailLevel } from './settings.svelte';

function escapeHtml(text: string): string {
	return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function formatHtml(text: string): string {
	let result = escapeHtml(text);
	result = result.replace(/`([^`\n]+)`/g, (_, code: string) => {
		const isDecorative = /^[★─]+|[─]+$/.test(code.trim());
		const cls = isDecorative ? 'decorative-rule' : 'inline-code';
		return `<code class="${cls}">${code}</code>`;
	});
	result = result.replace(/\n\n+/g, '</p><p>').replace(/\n/g, '<br>');
	return `<p>${result}</p>`;
}

function prettyToolName(name: string): string {
	const m = name.match(/^mcp__([^_]+)-mcp__(.+)$/) ?? name.match(/^mcp__(.+?)__(.+)$/);
	return m ? `${m[1]} · ${m[2]}` : name;
}

function primaryInputText(name: string, input: Record<string, unknown>): string {
	if (name === 'Bash' && typeof input.command === 'string') return input.command;
	if (name === 'Read' && typeof input.file_path === 'string') return input.file_path;
	if (name === 'Edit' && typeof input.file_path === 'string') return input.file_path;
	if (name === 'Write' && typeof input.file_path === 'string') return input.file_path;
	if (name.endsWith('run_ij_macro') && typeof input.macro === 'string') return input.macro;
	if (name.endsWith('run_script') && typeof input.script === 'string') return input.script;
	return JSON.stringify(input, null, 2);
}

function toolResultText(result: ToolInvocationResult | undefined): string {
	if (!result) return '';
	if (typeof result.content === 'string') return result.content;
	return result.content
		.filter((b) => b.type === 'text')
		.map((b) => (b as { text: string }).text)
		.join('\n');
}

export interface ConvertOptions {
	detailLevel: DetailLevel;
	hideThinking: boolean;
	hideToolResults: boolean;
}

export function displayNodesToSteps(nodes: DisplayNode[], opts: ConvertOptions): Step[] {
	const steps: Step[] = [];
	for (const node of nodes) {
		steps.push(...nodeToSteps(node, opts));
	}
	return steps;
}

function nodeToSteps(node: DisplayNode, opts: ConvertOptions): Step[] {
	const { detailLevel, hideThinking, hideToolResults } = opts;

	switch (node.kind) {
		case 'assistant-text': {
			const isFinal = !!node.isFinal;
			const hidden = !isFinal && detailLevel < 1;
			const step: AssistantStep = {
				type: 'assistant',
				html: formatHtml(node.text),
				...(isFinal ? { final: true } : {}),
				...(hidden ? { hidden: true } : {})
			};
			return [step];
		}

		case 'thinking': {
			const hidden = detailLevel < 1 || hideThinking;
			const hasText = node.text.length > 0;
			const step: ThinkingStep = {
				type: 'thinking',
				text: hasText ? node.text : '(extended thinking — content not stored)',
				compact: true,
				...(hidden ? { hidden: true } : {})
			};
			return [step];
		}

		case 'tool-invocation': {
			const steps: Step[] = [];
			const toolHidden = detailLevel < 2;
			const isCompact = detailLevel < 3;

			const callStep: ToolCallStep = {
				type: 'tool_call',
				toolName: prettyToolName(node.name),
				code: primaryInputText(node.name, node.input),
				...(isCompact ? { compact: true } : {}),
				...(toolHidden ? { hidden: true } : {})
			};
			steps.push(callStep);

			if (node.result) {
				const text = toolResultText(node.result);
				if (text.length > 0) {
					const resultHidden = toolHidden || hideToolResults;
					const resultStep: ToolResultStep = {
						type: 'tool_result',
						text,
						...(isCompact ? { compact: true } : {}),
						...(resultHidden ? { hidden: true } : {})
					};
					steps.push(resultStep);
				}
				if (node.result.isError) {
					const errorText = text.length > 0 ? '' : toolResultText(node.result);
					if (text.length === 0 && errorText.length > 0) {
						steps.push({
							type: 'tool_result',
							text: errorText,
							compact: isCompact,
							...(toolHidden ? { hidden: true } : {})
						} as ToolResultStep);
					}
				}
			}

			if (node.subagent && detailLevel >= 3) {
				steps.push({
					type: 'divider',
					label: `↳ subagent · ${node.subagent.agentType}`
				} as DividerStep);
				steps.push(...displayNodesToSteps(node.subagent.nodes, opts));
			}

			return steps;
		}

		case 'user-text': {
			if (detailLevel < 1) return [];
			return [
				{
					type: 'assistant',
					html: formatHtml(node.text)
				} as AssistantStep
			];
		}

		case 'compact': {
			return [
				{
					type: 'status',
					text: `context compacted${node.trigger ? ` (${node.trigger})` : ''}${node.preTokens ? ` · ${node.preTokens.toLocaleString()} tokens` : ''}`,
					variant: 'info' as const,
					compact: true
				} as StatusStep
			];
		}

		default:
			return [];
	}
}

/* ─── Step grouping (mirrors TerminalTranscript.groupSteps) ───────────── */

export type StepGroup =
	| { kind: 'step'; step: Step; index: number }
	| { kind: 'compact'; steps: Step[]; index: number }
	| { kind: 'hidden'; steps: Step[]; count: number; index: number };

export function groupSteps(steps: Step[]): StepGroup[] {
	const groups: StepGroup[] = [];
	let hiddenRun: Step[] = [];
	let compactRun: Step[] = [];
	let idx = 0;

	function flushCompact() {
		if (compactRun.length > 0) {
			groups.push({ kind: 'compact', steps: compactRun, index: idx++ });
			compactRun = [];
		}
	}

	function flushHidden() {
		if (hiddenRun.length > 0) {
			groups.push({
				kind: 'hidden',
				steps: hiddenRun,
				count: hiddenRun.length,
				index: idx++
			});
			hiddenRun = [];
		}
	}

	for (const step of steps) {
		if (step.hidden) {
			flushCompact();
			hiddenRun.push(step);
		} else if (step.compact) {
			flushHidden();
			compactRun.push(step);
		} else {
			flushHidden();
			flushCompact();
			groups.push({ kind: 'step', step, index: idx++ });
		}
	}
	flushHidden();
	flushCompact();
	return groups;
}
