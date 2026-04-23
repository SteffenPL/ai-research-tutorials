# Edit Pipeline Redesign

**Date**: 2026-04-23
**Status**: Ready for planning
**Scope**: Standard

## Problem

The editing pipeline (curate → compose → view) has several UX friction points: the trace curation view looks nothing like the final tutorial output, step editing is cramped in a bottom drawer, tutorial metadata is overly complex, and the TutorialViewer ignores `compact` and `hide` flags on steps.

## Goals

1. Make trace curation feel like editing the real tutorial — same rendering, inline controls
2. Replace the cramped bottom EditDrawer with a full-screen modal (data left, live preview right)
3. Simplify tutorial metadata to essentials: title, markdown description, requirements, author, thumbnail (with asset picker)
4. Support `compact` and `hide` flags in TutorialViewer rendering

## Non-goals

- Bilingual (JA) editing UI — keep EN-only editor, JA fields where they exist
- Mobile editing experience — desktop-first for dev tools
- Session log viewer redesign — only the curate/compose/view pipeline
- Paste/import for session-less traces — use existing step insertion menu

---

## Feature 1: Trace Curation UX Overhaul

### Current state
- `UnifiedTracePanel` renders a custom compact list with tiny action buttons (move, edit, reset, exclude)
- Steps look nothing like the terminal session or final tutorial
- Compact toggle buried inside EditDrawer, not discoverable
- Creating a trace requires an imported session as source

### Requirements

**R1.1** Reuse TutorialViewer's step rendering components in the curate panel. Each step renders with the real terminal styling (same fonts, colors, bars). Wrap each step in a curate container that adds:
- Floating toolbar on hover: edit (opens modal), compact toggle, hide toggle, drag handle for reorder
- Visual indicators for step state: excluded (dimmed/strikethrough), compact (badge), hidden (badge), has comment (icon)

**R1.2** Excluded steps collapse to a single-line placeholder row showing step type and a re-include button.

**R1.3** The curate page supports creating a **blank trace** (no underlying session). From the `/edit` dashboard, a "New Trace" button creates an empty trace with a user-provided slug. The curate page for a blank trace starts empty with only the insert-step menu available.

**R1.4** Insert-step menu remains between steps (same as current). New steps are always "inserted" type (no `sourceRef`).

### Affected files
- `src/lib/curate/components/UnifiedTracePanel.svelte` — major rewrite
- `src/routes/edit/+page.svelte` — add "New Trace" button
- `src/routes/api/traces/[slug]/+server.ts` — support creating empty trace

---

## Feature 2: Full-Screen Step Editor Modal

### Current state
- `EditDrawer` is a slide-up panel taking 45vh at the bottom
- Not enough space for complex steps (windows, long text)
- No preview of how the step will actually render

### Requirements

**R2.1** Replace EditDrawer with a full-screen modal dialog:
- **Left panel**: all edit fields (type, display mode, comment, content fields, file upload)
- **Right panel**: live preview using the same TutorialViewer step component
- Preview updates in real-time as fields change

**R2.2** Modal opens via the edit button on the step toolbar (from Feature 1) or by clicking a step.

**R2.3** Modal has Save and Cancel buttons. Save updates the trace state; Cancel discards changes.

**R2.4** Keep keyboard shortcut: Escape closes modal (with unsaved changes warning if dirty).

### Affected files
- `src/lib/curate/components/EditDrawer.svelte` — replace with `StepEditorModal.svelte`
- `src/routes/curate/[slug]/+page.svelte` — swap drawer for modal

---

## Feature 3: Simplified Tutorial Metadata

### Current state
- Compose page has structured welcome section (heading, description, learnings array)
- Thumbnail is a bare text input — no preview, no asset picker
- Metadata form has many fields, some rarely used

### Requirements

**R3.1** Simplify the metadata form on the compose page to:
- **Title** (EN, optional JA)
- **Description** (markdown textarea — replaces structured welcome heading + description + learnings)
- **Requirements / Prerequisites** (markdown textarea or list)
- **Author** (text field)
- **Tags** (tag input, keep current)
- **Thumbnail** — integrated asset picker: shows current thumbnail preview, click to open asset selection dialog (browse existing assets or upload new one)

**R3.2** Update `TutorialComposition` type in `src/lib/compose/types.ts` to reflect the new metadata shape. The `welcome` section in the composition becomes a single markdown `description` field plus a `requirements` field.

**R3.3** The thumbnail asset picker reuses `AssetUploadDialog` or a new inline picker that shows a grid of available assets (shared + per-tutorial) with upload capability.

### Affected files
- `src/routes/compose/[slug]/+page.svelte` — metadata form redesign
- `src/lib/compose/types.ts` — update TutorialComposition type
- `src/lib/compose/resolve.ts` — update resolution to new metadata shape

---

## Feature 4: TutorialViewer `compact` and `hide` Support

### Current state
- `StepBase` already defines `compact?: boolean` but TutorialViewer doesn't render it differently
- No `hide` flag exists in the Step type or viewer

### Requirements

**R4.1** Add `hidden?: boolean` to `StepBase` in `src/lib/data/tutorials.ts`.

**R4.2** In TutorialViewer, steps with `compact: true` render as a single-line summary:
- Show step type icon + truncated content (first ~80 chars or tool name)
- Styled consistently with the compact indicators in the curate view
- Clickable to expand inline (optional, if feasible without breaking scroll timeline)

**R4.3** In TutorialViewer, steps with `hidden: true` render as a collapsed placeholder:
- A thin clickable bar: e.g. "3 steps hidden" (consecutive hidden steps grouped)
- Clicking expands to show the hidden steps inline
- In full-log mode, hidden steps show normally (no collapse)

**R4.4** Update `traceStepToTutorialStep()` in `src/lib/trace/convert.ts` to export `hidden: true` when a trace step is marked hidden (new `hidden` field on `TraceStep`).

### Affected files
- `src/lib/data/tutorials.ts` — add `hidden` to StepBase
- `src/lib/trace/types.ts` — add `hidden` to TraceStep
- `src/lib/trace/convert.ts` — export hidden flag
- `src/lib/components/tutorial/TutorialViewer.svelte` — render compact and hidden steps
- `src/lib/curate/components/UnifiedTracePanel.svelte` — hide toggle in toolbar

---

## Implementation Order

1. **Feature 4** (compact + hide in viewer) — smallest, unblocks visual verification of other features
2. **Feature 2** (step editor modal) — standalone, improves editing immediately
3. **Feature 1** (trace curation UX) — depends on reusable step components, biggest change
4. **Feature 3** (metadata simplification) — independent, can be done in parallel with 1

## Open Questions

None — all key decisions resolved during brainstorm.
