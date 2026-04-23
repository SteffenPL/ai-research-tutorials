# Step Display Categories: Three Modes with Type-Based Defaults

**Date:** 2026-04-23
**Status:** Ready for implementation
**Builds on:** `shared-step-rendering-requirements.md` (compact chips, tool folding, step-colors)

## Problem

Step display modes (`compact`, `normal`, `full`) exist but lack a principled default system. Currently every step defaults to `full` unless the curator manually toggles each one. In a typical trace with 50+ steps, most tool calls, results, and thinking blocks are noise — the reader cares about what Claude said and the visual results, not every `ToolSearch` invocation.

## The Category System

Every step type belongs to one of three categories, each with a default display mode:

### Primary (default: full)

The conversation itself — what the user asked and what Claude answered.

| Step type | Rationale |
|-----------|-----------|
| `assistant` | Claude's message — the core content |
| `question` | Claude asks, user answers — dialogue flow |
| `output` | Terminal output — what the user saw |

**Full mode**: complete content, no truncation.

### Supporting (default: compact)

Tool machinery — important for the full log but noise in the curated tutorial.

| Step type | Rationale |
|-----------|-----------|
| `tool_call` | Supporting action, not the story |
| `tool_result` | Return value, usually JSON noise |
| `thinking` | Reasoning, already collapsible |
| `status` | Runtime badge, minor detail |
| `permission` | Permission dialog, minor detail |

**Compact mode**: rendered as type-colored chips via `CompactChipFlow`.

### Structural (default: normal)

Visual structure and data — worth showing but may need folding.

| Step type | Rationale |
|-----------|-----------|
| `window` | Desktop content marker — click to maximize |
| `table` | Data table — shows inline |
| `divider` | Section separator — always small |

**Normal mode**: visible content with folding for long blocks.

## Three Display Modes

| Mode | Rendering | When to use |
|------|-----------|-------------|
| **compact** | Type-colored chip/badge in `CompactChipFlow` | Machinery steps you want to acknowledge but not show |
| **normal** | Content shown but long blocks folded at 5 lines | Structural content, or tool steps the curator wants visible |
| **full** | Everything expanded, no truncation | Primary conversation content |

## Curator Override

The category sets the **default** `displayMode` at trace creation time. Curators can override any step to any mode:

- Promote a tool_call to `normal` or `full` when it's pedagogically important
- Demote an assistant message to `compact` when it's just "Let me check..."
- The override is stored in `TraceStep.displayMode` as today

## Trace Editor Integration

The trace editor (`UnifiedTracePanel.svelte`) should label step categories visually:

- Step toolbar or chip shows the category: **Primary**, **Supporting**, **Structural**
- When a step's displayMode differs from its category default, show a visual indicator (e.g., the mode icon gets an accent color)
- The `displayMode` cycle button (`▪`/`▣`) cycles through all three modes: `compact` → `normal` → `full` → `compact`

## When Defaults Apply

**At trace creation time** — when `sessionViewToTraceState()` creates a new trace, each step's `displayMode` is pre-set based on its type's category default. The curator sees sensible defaults but can change any step.

Existing traces keep their current `displayMode` values — no migration.

## Scope

### In scope
- Category → default mode mapping in `step-colors.ts` (single source of truth)
- `sessionViewToTraceState()` uses category defaults when creating new traces
- Trace editor shows category labels on steps
- `displayMode` cycle goes through all three modes
- `StepRenderer` handles `normal` mode distinctly from `full` (folding for tool_call code, tool_result JSON, etc.)

### Not in scope
- Changing the tutorial viewer layout
- Migrating existing traces to new defaults
- Adding new step types

## Success Criteria

- New traces created from sessions have tool_call/tool_result/thinking/status/permission defaulting to compact chips
- Assistant/question/output steps default to full content
- Window/table/divider steps default to normal (visible, foldable)
- Curator can override any step to any mode
- Trace editor visually distinguishes the three categories
