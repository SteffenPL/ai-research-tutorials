---
title: WYSIWYG trace editing via component reuse
date: 2026-04-23
category: design-patterns
module: curate-compose-pipeline
problem_type: design_pattern
component: tooling
severity: medium
applies_when:
  - Building an editor for content that has a separate viewer/renderer
  - Curating or editing structured step-based content that must preview accurately
  - Adding display flags (compact, hidden) that affect both editing and viewing
tags:
  - svelte
  - component-reuse
  - wysiwyg
  - trace-editing
  - step-renderer
  - curate
  - composition-pipeline
---

# WYSIWYG trace editing via component reuse

## Context

The tutorial site has a multi-stage pipeline: session logs are curated into traces, traces are composed into tutorials, and tutorials are rendered in a virtual desktop viewer. The curate page (`/curate/<slug>`) originally used a custom compact list view (`UnifiedTracePanel`) that looked nothing like the final tutorial output — users had to preview in a separate tab to see what their edits would produce. Adding `compact` and `hidden` flags to steps widened the gap further, since those flags affected rendering but were invisible in the editor.

## Guidance

Reuse the same rendering components in both the editor and the viewer. Convert the editor's internal data type to the viewer's input type at render time, then wrap each rendered step in an editor container that adds edit affordances.

The pattern has three layers:

1. **Type conversion at render time**: `traceStepToTutorialStep(traceStep)` converts the mutable `TraceStep` (editor state) into an immutable `Step` (viewer input) for each step on every render. This is cheap — it's a property mapping, not a deep copy.

2. **Shared renderer**: `StepRenderer.svelte` renders the `Step` identically in both the curate panel and the tutorial viewer. One component, one set of styles, zero drift.

3. **Editor wrapper with floating toolbar**: Each step in the curate view is wrapped in a `.step-wrap` div that adds a `position: absolute` toolbar (visible on hover). The toolbar provides edit, compact toggle, hidden toggle, move, and exclude controls without interfering with the visual preview.

For the step editor modal, the same pattern applies at larger scale — the left pane mutates the `TraceStep`, a `$derived` reactive expression converts it to a `Step`, and the right pane renders it through `StepRenderer` with `{#key previewTick}` to force re-mount on nested mutations.

## Why This Matters

Without component reuse, the editor and viewer will inevitably diverge. Every new step type, display flag, or styling change requires updates in two places. The WYSIWYG approach means:

- New step types render correctly in the editor for free
- Display flags like `compact` and `hidden` are immediately visible while editing
- Style changes propagate to both views automatically
- The curate panel uses the terminal-dark background (`#241a20`) and real prompt styling, so the editing context matches the output context

## When to Apply

- When building an editor for content that has a distinct viewer/renderer
- When the data model has a clean conversion between editor state and viewer input
- When display flags or rendering modes need to be visible during editing
- When the viewer component is pure/presentational (no internal state that conflicts with editor use)

## Examples

**Converting TraceStep to Step for preview:**

```typescript
// In UnifiedTracePanel.svelte
function toPreviewStep(traceStep: TraceStep): Step | null {
    return traceStepToTutorialStep(traceStep);
}
```

**Wrapping rendered steps with edit controls:**

```svelte
<div class="step-wrap" class:step-hidden={step.hidden}>
    <!-- Toolbar: hidden by default, visible on hover -->
    <div class="step-toolbar">
        <button onclick={() => onCycleDisplayMode(step)}>
            {displayModeIcon(step.displayMode)}
        </button>
        <button onclick={() => onToggleHidden(step)}>
            {step.hidden ? '◌' : '●'}
        </button>
        <!-- ... more controls -->
    </div>
    <!-- Real rendering -->
    <div class="step-render">
        <StepRenderer step={previewStep} onFocusWindow={noopFocus} />
    </div>
</div>
```

**Live preview in modal via reactive conversion:**

```svelte
<script>
    let previewTick = $state(0);
    function bumpPreview() { previewTick++; }

    let previewStep = $derived.by(() => {
        void previewTick;
        return traceStepToTutorialStep(editStep);
    });
</script>

<!-- Right pane updates live as left pane fields change -->
{#key previewTick}
    <StepRenderer step={previewStep} />
{/key}
```

**Hidden step grouping (structural concern lives above StepRenderer):**

The `hidden` flag grouping (collapsing consecutive hidden steps into "N steps hidden") lives in `TerminalTranscript.svelte`, not `StepRenderer`, because it's a structural concern — merging steps across the loop — rather than a per-step visual concern. `compact` rendering lives inside `StepRenderer` because it changes how a single step looks.

## Related

- `src/lib/components/tutorial/StepRenderer.svelte` — shared step renderer
- `src/lib/curate/components/UnifiedTracePanel.svelte` — WYSIWYG curate panel
- `src/lib/curate/components/StepEditorModal.svelte` — full-screen editor with live preview
- `src/lib/trace/convert.ts` — `traceStepToTutorialStep()` conversion
- `docs/brainstorms/edit-pipeline-redesign-requirements.md` — original requirements
