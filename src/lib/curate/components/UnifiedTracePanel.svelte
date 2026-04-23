<script lang="ts">
	import type { Step, WindowContentData } from '$lib/data/tutorials';
	import type { SessionView } from '$lib/session/viewmodel';
	import type { TraceState, TraceStep, TraceRound } from '$lib/trace/types';
	import { stepLabel, stepIcon, stepPreview, displayModeIcon, includedCount, totalCount } from './step-helpers';

	let {
		curation,
		view,
		editingStep,
		showInsertMenu = $bindable(),
		onToggleRound,
		onToggleStep,
		onMoveStep,
		onRemoveStep,
		onRemoveRound,
		onCycleDisplayMode,
		onAddRound,
		onInsertStep,
		onInsertWindowStep,
		onInsertOutputStep,
		onInsertStatusStep,
		onInsertAssistantStep,
		onInsertDividerStep,
		onToggleHidden,
		onEditStep,
		onResetStep,
		onResetRound
	}: {
		curation: TraceState;
		view: SessionView | null;
		editingStep: { roundId: string; stepId: string } | null;
		showInsertMenu: { roundId: string; afterStepId: string | null } | null;
		onToggleRound: (roundId: string) => void;
		onToggleStep: (roundId: string, stepId: string) => void;
		onMoveStep: (roundId: string, stepId: string, direction: -1 | 1) => void;
		onRemoveStep: (roundId: string, stepId: string) => void;
		onRemoveRound: (roundId: string) => void;
		onCycleDisplayMode: (step: TraceStep) => void;
		onAddRound: (kind: 'claude' | 'terminal') => void;
		onInsertStep: (roundId: string, afterStepId: string | null, step: Step) => void;
		onInsertWindowStep: (roundId: string, afterStepId: string | null, kind: WindowContentData['kind']) => void;
		onInsertOutputStep: (roundId: string, afterStepId: string | null) => void;
		onInsertStatusStep: (roundId: string, afterStepId: string | null) => void;
		onInsertAssistantStep: (roundId: string, afterStepId: string | null) => void;
		onInsertDividerStep: (roundId: string, afterStepId: string | null) => void;
		onToggleHidden: (step: TraceStep) => void;
		onEditStep: (roundId: string, stepId: string) => void;
		onResetStep: (roundId: string, stepId: string) => void;
		onResetRound: (roundId: string) => void;
	} = $props();

	let showExcluded = $state(true);

	function toggleInsertMenu(roundId: string, afterStepId: string | null) {
		showInsertMenu =
			showInsertMenu?.roundId === roundId && showInsertMenu?.afterStepId === afterStepId
				? null
				: { roundId, afterStepId };
	}
</script>

{#snippet insertMenu(roundId: string, afterStepId: string | null)}
	<div class="insert-menu">
		<button onclick={() => onInsertAssistantStep(roundId, afterStepId)}>Assistant</button>
		<button onclick={() => onInsertStep(roundId, afterStepId, { type: 'tool_call', toolName: '', code: '' })}>Tool Call</button>
		<button onclick={() => onInsertStep(roundId, afterStepId, { type: 'tool_result', text: '' })}>Tool Result</button>
		<button onclick={() => onInsertOutputStep(roundId, afterStepId)}>Output</button>
		<button onclick={() => onInsertStatusStep(roundId, afterStepId)}>Status</button>
		<button onclick={() => onInsertDividerStep(roundId, afterStepId)}>Divider</button>
		<span class="insert-sep">Windows:</span>
		<button onclick={() => onInsertWindowStep(roundId, afterStepId, 'fiji-image')}>Fiji Image</button>
		<button onclick={() => onInsertWindowStep(roundId, afterStepId, 'image')}>Image</button>
		<button onclick={() => onInsertWindowStep(roundId, afterStepId, 'video')}>Video</button>
		<button onclick={() => onInsertWindowStep(roundId, afterStepId, 'source')}>Source</button>
		<button onclick={() => onInsertWindowStep(roundId, afterStepId, 'markdown')}>Markdown</button>
	</div>
{/snippet}

<section class="panel">
	<div class="panel-header">
		<h2>Trace</h2>
		<div class="panel-header-actions">
			<label class="toggle-excluded">
				<input type="checkbox" bind:checked={showExcluded} />
				<span>Show excluded</span>
			</label>
			<span class="panel-meta">{curation.rounds.length} rounds</span>
		</div>
	</div>

	{#each curation.rounds as round (round.id)}
		{#if round.included === false}
			{#if showExcluded}
				<div class="trace-round round-excluded">
					<div class="round-header">
						<span class="kind-badge" class:terminal={round.kind === 'terminal'}>{round.kind}</span>
						<span class="round-prompt-preview">{round.prompt.slice(0, 60)}{round.prompt.length > 60 ? '...' : ''}</span>
						{#if round.sourceRoundIndex !== undefined}
							<span class="source-indicator">R{round.sourceRoundIndex + 1}</span>
						{/if}
						<span class="round-count">{totalCount(round)} steps</span>
						<button class="btn-icon btn-include" title="Include round" onclick={() => onToggleRound(round.id)}>+</button>
					</div>
				</div>
			{/if}
		{:else}
		<div class="trace-round">
			<div class="round-header">
				<span class="kind-badge" class:terminal={round.kind === 'terminal'}>
					{round.kind}
				</span>
				<input
					class="prompt-input"
					type="text"
					bind:value={round.prompt}
					placeholder="Round prompt..."
				/>
				{#if round.sourceRoundIndex !== undefined}
					<span class="source-indicator">R{round.sourceRoundIndex + 1}</span>
				{/if}
				<span class="round-count">{includedCount(round)}/{totalCount(round)}</span>
				<div class="round-actions">
					{#if view && round.sourceRoundIndex !== undefined}
						<button class="btn-icon" title="Reset round to source" onclick={() => onResetRound(round.id)}>&#x21BA;</button>
					{/if}
					<button class="btn-icon" title="Hide round" onclick={() => onToggleRound(round.id)}>&#x2298;</button>
					<button class="btn-icon danger" title="Remove round" onclick={() => onRemoveRound(round.id)}>&#x2715;</button>
				</div>
			</div>

			<!-- Insert at top of round -->
			<button class="insert-btn" onclick={() => toggleInsertMenu(round.id, null)}>+ Insert</button>
			{#if showInsertMenu?.roundId === round.id && showInsertMenu?.afterStepId === null}
				{@render insertMenu(round.id, null)}
			{/if}

			{#each round.steps as step (step.id)}
				{#if step.included || step.inserted}
					<!-- ═══ INCLUDED STEP ═══ -->
					{#if step.displayMode === 'compact'}
						<div class="step step-compact" class:editing={editingStep?.stepId === step.id} class:step-hidden={step.hidden}>
							<span class="step-icon">{stepIcon(step)}</span>
							<span class="step-type">{stepLabel(step)}</span>
							<button class="btn-mode" title="Compact — click for full" onclick={() => onCycleDisplayMode(step)}>{displayModeIcon(step.displayMode)}</button>
							<button class="btn-hidden" class:active={step.hidden} title={step.hidden ? 'Hidden — click to show' : 'Visible — click to hide'} onclick={() => onToggleHidden(step)}>{step.hidden ? '◌' : '●'}</button>
							{#if step.comment}<span class="has-comment">&#128172;</span>{/if}
							<div class="step-actions">
								<button class="btn-icon" title="Move up" onclick={() => onMoveStep(round.id, step.id, -1)}>&#x25B2;</button>
								<button class="btn-icon" title="Move down" onclick={() => onMoveStep(round.id, step.id, 1)}>&#x25BC;</button>
								<button class="btn-icon" title="Edit" onclick={() => onEditStep(round.id, step.id)}>&#9998;</button>
								{#if step.sourceRef}
									<button class="btn-icon btn-reset" title="Reset to source" onclick={() => onResetStep(round.id, step.id)}>&#x21BA;</button>
								{/if}
								{#if step.inserted}
									<button class="btn-icon danger" title="Remove" onclick={() => onRemoveStep(round.id, step.id)}>&#x2715;</button>
								{:else}
									<button class="btn-icon" title="Exclude" onclick={() => onToggleStep(round.id, step.id)}>&#x2298;</button>
								{/if}
							</div>
						</div>
					{:else}
						<div class="step step-full" class:editing={editingStep?.stepId === step.id} class:step-hidden={step.hidden}>
							<div class="step-header">
								<span class="step-type-badge">{stepLabel(step)}</span>
								<button class="btn-mode" title="Full — click for compact" onclick={() => onCycleDisplayMode(step)}>{displayModeIcon(step.displayMode)}</button>
								<button class="btn-hidden" class:active={step.hidden} title={step.hidden ? 'Hidden — click to show' : 'Visible — click to hide'} onclick={() => onToggleHidden(step)}>{step.hidden ? '◌' : '●'}</button>
								{#if step.comment}<span class="has-comment">&#128172;</span>{/if}
								<div class="step-actions">
									<button class="btn-icon" title="Move up" onclick={() => onMoveStep(round.id, step.id, -1)}>&#x25B2;</button>
									<button class="btn-icon" title="Move down" onclick={() => onMoveStep(round.id, step.id, 1)}>&#x25BC;</button>
									<button class="btn-icon" title="Edit" onclick={() => onEditStep(round.id, step.id)}>&#9998;</button>
									{#if step.sourceRef}
										<button class="btn-icon btn-reset" title="Reset to source" onclick={() => onResetStep(round.id, step.id)}>&#x21BA;</button>
									{/if}
									{#if step.inserted}
										<button class="btn-icon danger" title="Remove" onclick={() => onRemoveStep(round.id, step.id)}>&#x2715;</button>
									{:else}
										<button class="btn-icon" title="Exclude" onclick={() => onToggleStep(round.id, step.id)}>&#x2298;</button>
									{/if}
								</div>
							</div>
							<div class="step-preview">{stepPreview(step)}</div>
						</div>
					{/if}
				{:else if showExcluded}
					<!-- ═══ EXCLUDED STEP (grayed, collapsed) ═══ -->
					<div class="step step-excluded">
						<span class="step-icon">{stepIcon(step)}</span>
						<span class="step-type">{stepLabel(step)}</span>
						<span class="step-preview-short">{stepPreview(step).slice(0, 40)}</span>
						<button class="btn-icon btn-include" title="Include" onclick={() => onToggleStep(round.id, step.id)}>+</button>
					</div>
				{/if}

				<!-- Insert after this step -->
				{#if step.included || step.inserted}
					<button class="insert-btn" onclick={() => toggleInsertMenu(round.id, step.id)}>+ Insert</button>
					{#if showInsertMenu?.roundId === round.id && showInsertMenu?.afterStepId === step.id}
						{@render insertMenu(round.id, step.id)}
					{/if}
				{/if}
			{/each}
		</div>
		{/if}
	{/each}

	<div class="add-round-actions">
		<button class="btn" onclick={() => onAddRound('claude')}>+ Claude Round</button>
		<button class="btn" onclick={() => onAddRound('terminal')}>+ Terminal Round</button>
	</div>
</section>

<style>
	.panel {
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 10px;
		background: rgba(28, 16, 26, 0.9);
		backdrop-filter: blur(12px);
	}
	.panel-header {
		position: sticky;
		top: 0;
		z-index: 2;
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		padding: 0.85rem 1.1rem;
		background: rgba(28, 16, 26, 0.95);
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	}
	.panel-header h2 {
		font-size: 1rem;
		color: var(--orange-300);
		margin: 0;
		font-weight: 600;
	}
	.panel-header-actions {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}
	.panel-meta {
		font-family: var(--font-mono);
		font-size: 0.75rem;
		color: var(--text-secondary);
	}
	.toggle-excluded {
		display: flex;
		align-items: center;
		gap: 0.35rem;
		cursor: pointer;
	}
	.toggle-excluded input {
		accent-color: var(--accent);
	}
	.toggle-excluded span {
		font-family: var(--font-mono);
		font-size: 0.72rem;
		color: var(--text-secondary);
	}

	/* ─── Round ──────────────────────────── */
	.trace-round {
		margin: 0.75rem 0.9rem;
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 8px;
		background: rgba(255, 255, 255, 0.03);
		padding: 0.6rem;
	}
	.round-header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 0.4rem;
	}
	.kind-badge {
		font-family: var(--font-mono);
		font-size: 0.7rem;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		padding: 0.2rem 0.5rem;
		border-radius: 4px;
		background: var(--accent-soft);
		color: var(--orange-300);
		flex-shrink: 0;
		font-weight: 600;
	}
	.kind-badge.terminal {
		background: rgba(112, 200, 184, 0.18);
		color: var(--teal);
	}
	.prompt-input {
		flex: 1;
		padding: 0.4rem 0.6rem;
		background: rgba(0, 0, 0, 0.35);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 5px;
		color: var(--text-primary);
		font-family: var(--font-mono);
		font-size: 0.82rem;
	}
	.prompt-input:focus {
		outline: none;
		border-color: var(--orange-400);
	}
	.source-indicator {
		font-family: var(--font-mono);
		font-size: 0.7rem;
		color: var(--text-secondary);
		background: rgba(255, 255, 255, 0.07);
		padding: 0.15rem 0.4rem;
		border-radius: 4px;
		flex-shrink: 0;
	}
	.round-count {
		font-family: var(--font-mono);
		font-size: 0.7rem;
		color: var(--text-secondary);
		flex-shrink: 0;
	}
	.round-actions {
		display: flex;
		gap: 0.2rem;
		flex-shrink: 0;
	}

	/* ─── Excluded round ─────────────────── */
	.round-excluded {
		opacity: 0.4;
		background: transparent;
		border-style: dashed;
		padding: 0.35rem 0.6rem;
		transition: opacity 0.15s;
	}
	.round-excluded:hover {
		opacity: 0.65;
	}
	.round-excluded .round-header {
		margin-bottom: 0;
	}
	.round-prompt-preview {
		font-family: var(--font-mono);
		font-size: 0.78rem;
		color: var(--text-secondary);
		flex: 1;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	/* ─── Steps (shared) ──────────────────── */
	.step {
		border-radius: 5px;
		font-family: var(--font-mono);
		font-size: 0.78rem;
	}
	.step-icon {
		font-size: 0.85rem;
		width: 1.4rem;
		text-align: center;
		flex-shrink: 0;
	}
	.step-type {
		font-size: 0.7rem;
		color: var(--text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.04em;
		min-width: 5.5rem;
		flex-shrink: 0;
	}
	.step-type-badge {
		font-size: 0.7rem;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--text-secondary);
		background: rgba(255, 255, 255, 0.07);
		padding: 0.15rem 0.45rem;
		border-radius: 4px;
	}
	.step-actions {
		margin-left: auto;
		display: flex;
		gap: 0.2rem;
		flex-shrink: 0;
	}
	.has-comment {
		font-size: 0.8rem;
	}
	.step-preview {
		color: var(--text-secondary);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		margin-top: 0.25rem;
		padding-left: 0.4rem;
		font-size: 0.78rem;
	}
	.step-preview-short {
		color: var(--text-secondary);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		flex: 1;
		font-size: 0.72rem;
		opacity: 0.7;
	}

	/* ─── Included compact step ─────────── */
	.step-compact {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0.3rem 0.6rem;
		background: rgba(255, 255, 255, 0.04);
		border: 1px solid rgba(255, 255, 255, 0.07);
	}

	/* ─── Included full step ────────────── */
	.step-full {
		padding: 0.4rem 0.6rem;
		background: rgba(255, 255, 255, 0.04);
		border: 1px solid rgba(255, 255, 255, 0.07);
	}
	.step-header {
		display: flex;
		align-items: center;
		gap: 0.45rem;
	}

	/* ─── Excluded step ─────────────────── */
	.step-excluded {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0.2rem 0.6rem;
		opacity: 0.4;
		border: 1px solid transparent;
		transition: opacity 0.15s;
	}
	.step-excluded:hover {
		opacity: 0.65;
		background: rgba(255, 255, 255, 0.02);
	}
	.btn-include {
		color: var(--teal) !important;
		font-weight: 600;
		font-size: 0.85rem !important;
	}

	/* ─── Editing highlight ──────────────── */
	.step.editing {
		border-color: var(--orange-500);
		box-shadow: 0 0 0 1px rgba(233, 84, 32, 0.3);
	}

	/* ─── Reset button ───────────────────── */
	.btn-reset {
		color: var(--text-secondary) !important;
	}
	.btn-reset:hover {
		color: var(--orange-300) !important;
	}

	/* ─── Hidden state ───────────────────── */
	.step-hidden {
		opacity: 0.5;
		border-style: dashed;
	}
	.btn-hidden {
		background: none;
		border: 1px solid rgba(255, 255, 255, 0.12);
		border-radius: 3px;
		color: var(--text-tertiary);
		font-size: 0.7rem;
		cursor: pointer;
		padding: 0.12rem 0.35rem;
		line-height: 1;
		flex-shrink: 0;
		transition: all 0.12s;
	}
	.btn-hidden:hover {
		color: var(--mauve);
		border-color: var(--mauve);
	}
	.btn-hidden.active {
		color: var(--mauve);
		background: rgba(180, 140, 200, 0.15);
		border-color: var(--mauve);
	}

	/* ─── Display mode toggle ────────────── */
	.btn-mode {
		background: none;
		border: 1px solid rgba(255, 255, 255, 0.12);
		border-radius: 3px;
		color: var(--text-secondary);
		font-size: 0.75rem;
		cursor: pointer;
		padding: 0.12rem 0.35rem;
		line-height: 1;
		flex-shrink: 0;
		transition: all 0.12s;
	}
	.btn-mode:hover {
		color: var(--orange-300);
		border-color: var(--orange-400);
	}

	/* ─── Insert button & menu ────────────── */
	.insert-btn {
		display: block;
		width: 100%;
		padding: 0.2rem;
		background: transparent;
		border: 1px dashed transparent;
		border-radius: 4px;
		color: var(--text-tertiary);
		font-family: var(--font-mono);
		font-size: 0.7rem;
		cursor: pointer;
		text-align: center;
		transition: all 0.15s;
	}
	.insert-btn:hover {
		border-color: var(--orange-400);
		color: var(--orange-300);
		background: rgba(233, 84, 32, 0.06);
	}
	.insert-menu {
		display: flex;
		flex-wrap: wrap;
		gap: 0.3rem;
		padding: 0.5rem;
		background: rgba(0, 0, 0, 0.45);
		border: 1px solid rgba(255, 255, 255, 0.12);
		border-radius: 6px;
		margin: 0.25rem 0;
	}
	.insert-menu button {
		padding: 0.25rem 0.6rem;
		background: rgba(255, 255, 255, 0.07);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 4px;
		color: var(--text-primary);
		font-family: var(--font-mono);
		font-size: 0.75rem;
		cursor: pointer;
	}
	.insert-menu button:hover {
		background: var(--accent-soft);
		color: var(--orange-300);
		border-color: var(--orange-500);
	}
	.insert-sep {
		font-family: var(--font-mono);
		font-size: 0.7rem;
		color: var(--text-secondary);
		align-self: center;
		margin: 0 0.25rem;
	}

	.add-round-actions {
		display: flex;
		gap: 0.6rem;
		padding: 1rem;
		justify-content: center;
	}

	/* ─── Buttons ─────────────────────────────── */
	.btn {
		padding: 0.4rem 0.85rem;
		background: rgba(255, 255, 255, 0.08);
		border: 1px solid rgba(255, 255, 255, 0.12);
		border-radius: 6px;
		color: var(--text-primary);
		font-family: var(--font-mono);
		font-size: 0.82rem;
		cursor: pointer;
		text-decoration: none;
		transition: background 0.15s, border-color 0.15s;
	}
	.btn:hover {
		background: rgba(255, 255, 255, 0.12);
		border-color: var(--orange-400);
	}
	.btn-icon {
		background: none;
		border: none;
		color: var(--text-secondary);
		cursor: pointer;
		font-size: 0.82rem;
		padding: 0.2rem 0.35rem;
		border-radius: 4px;
	}
	.btn-icon:hover {
		color: var(--text-primary);
		background: rgba(255, 255, 255, 0.08);
	}
	.btn-icon.danger:hover {
		color: var(--red);
	}
</style>
