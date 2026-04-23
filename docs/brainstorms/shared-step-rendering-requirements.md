# Shared Step Rendering: Compact Chips, Tool Folding, and Component Unification

**Date:** 2026-04-23
**Status:** Ready for planning

## Problem

Step rendering is split across three views (tutorial viewer, trace editor, log viewer) with duplicated logic and inconsistent behavior:

1. **Compact mode** renders as colorful interactive chips in the trace editor (`UnifiedTracePanel.svelte`) but as muted gray one-liners in the tutorial viewer (`StepRenderer.svelte`). The trace editor has its own `compactChipIcon()`, `compactChipText()`, and `groupSteps()` — all duplicated from StepRenderer's `compactIcon()` and `compactSummary()`.

2. **Tool calls** in the tutorial viewer always render at full length with no way to fold long code blocks. Multi-line ImageJ macros dominate the timeline.

3. **No shared color vocabulary** — step types have ad-hoc colors scattered across CSS. The tutorial viewer is visually monotone where it could be more expressive.

## Goals

- Compact steps render as **type-colored, expandable chips** in both the tutorial viewer and trace editor
- Long tool calls **auto-fold** to tool name + first ~2 lines, with a "show more" toggle
- A **single source of truth** for step type → color, icon, and label
- Trace editor reuses the same rendering components, adding edit affordances on top
- Tutorial viewer becomes more colorful and scannable

## Non-goals

- Refactoring the log viewer (`/log/[slug]`) — it uses a different data model (`DisplayNode` vs `Step`) and can be addressed later
- Changing the overall tutorial viewer layout or scroll-driven timeline
- Adding new step types

## Decisions

### 1. Compact chips: expandable + type-colored

Compact steps render as pill-shaped chips in a flex-wrap flow. Each step type gets a distinct accent color. Clicking a chip expands it inline to show the full step content (radio-select: one expanded at a time). This matches the trace editor behavior and brings it to the tutorial viewer.

### 2. Tool call folding: auto-fold long code

Tool calls with code longer than ~5 lines auto-fold to show the tool name + first 2 lines + a "▾ show N more lines" toggle. Short tool calls render fully. Users can click to expand.

### 3. Shared step-colors.ts

A single `src/lib/components/tutorial/step-colors.ts` file maps step type → accent color (CSS var), icon character, and label. All views import from this source of truth.

Color assignments:
| Type | Accent | Icon |
|------|--------|------|
| tool_call | `var(--peach)` | ⚡ |
| tool_result | `var(--border-subtle)` | ← |
| thinking | `var(--mauve)` | ✧ |
| assistant | `var(--teal)` | ○ |
| window | `var(--green)` | ↗ |
| permission | `var(--orange-300)` | ⚿ |
| question | `var(--orange-300)` | ? |
| output | `var(--text-tertiary)` | $ |
| status | `var(--text-tertiary)` | • |
| table | `var(--text-tertiary)` | ☷ |
| divider | `var(--text-tertiary)` | — |

### 4. CompactChipFlow component

A new shared `CompactChipFlow.svelte` component handles:
- Receives an array of compact steps
- Renders them as type-colored chips in a flex-wrap layout
- Manages expand-on-click state (radio-select)
- Renders the expanded step using StepRenderer (with `compact: false`)

### 5. Shared groupSteps utility

The `groupSteps()` function (currently in `UnifiedTracePanel.svelte`) moves to a shared utility (e.g. `src/lib/components/tutorial/group-steps.ts`). Both `TerminalTranscript.svelte` and `UnifiedTracePanel.svelte` import it to group consecutive compact steps before rendering.

## Architecture

```
src/lib/components/tutorial/
  step-colors.ts          NEW — type → color/icon/label map
  group-steps.ts          NEW — groupSteps() utility
  CompactChipFlow.svelte  NEW — chip flow + expand logic
  StepRenderer.svelte     MODIFIED — remove inline compact rendering,
                                     add auto-fold for tool_call code

src/lib/curate/components/
  UnifiedTracePanel.svelte  MODIFIED — use CompactChipFlow,
                                       remove duplicated chip logic,
                                       wrap with edit toolbar
  step-helpers.ts           MODIFIED — remove duplicated icon/label functions,
                                       import from step-colors.ts
```

### TerminalTranscript integration

```svelte
{#each groupedSteps as group}
  {#if group.kind === 'compact'}
    <CompactChipFlow steps={group.steps} onFocusWindow={...} />
  {:else}
    <StepRenderer step={group.step} ... />
  {/if}
{/each}
```

### Trace editor integration

```svelte
{#each groupedSteps as group}
  {#if group.kind === 'compact'}
    <CompactChipFlow steps={group.steps} onFocusWindow={noopFocus}>
      {#snippet toolbar(step)}
        <!-- edit toolbar rendered per-chip -->
      {/snippet}
    </CompactChipFlow>
  {:else}
    <!-- existing full/excluded rendering with toolbar -->
  {/if}
{/each}
```

## Scope boundaries

### In scope
- CompactChipFlow shared component
- step-colors.ts shared utility
- group-steps.ts shared utility
- Auto-fold for tool_call code blocks in StepRenderer
- Type-colored chip styling (accent border/background per step type)
- Removing duplicated icon/label/grouping logic from UnifiedTracePanel

### Deferred for later
- Log viewer refactoring (different data model)
- Per-step color customization in the trace editor
- Animated chip transitions

## Success criteria

- Compact steps in the Nuclei Segmentation tutorial render as colored chips, not gray one-liners
- Long tool calls (like the 10-approach macro) fold to 2 lines with a toggle
- Trace editor compact chips look and behave identically to tutorial viewer chips
- No duplicated icon/color/label logic between files
