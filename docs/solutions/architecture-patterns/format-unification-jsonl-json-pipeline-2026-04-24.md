---
title: Format Unification — JSONL + JSON Pipeline with formatVersion
date: 2026-04-24
category: architecture-patterns
module: tutorial-data-pipeline
problem_type: architecture_pattern
component: tooling
severity: medium
applies_when:
  - Adding new data layers or file formats to the pipeline
  - Migrating data from one format to another
  - Deciding where to place version metadata in line-oriented files
tags:
  - data-format
  - migration
  - versioning
  - composition
  - tutorial-loader
  - jsonl
  - vite-glob
---

# Format Unification — JSONL + JSON Pipeline with formatVersion

## Context

The tutorial pipeline originally used three serialization formats across four data layers: JSONL for session logs, JSON for traces and compositions, and YAML for the final tutorial files (meta.yaml + round-NN.yaml). The YAML layer existed because tutorials were initially hand-authored before the compose UI existed. Once the compose tool could produce compositions referencing traces, the YAML export step became redundant — an extra transformation that added complexity without value.

Additionally, no data layer carried a version field, making it impossible to detect format changes or write safe migration logic.

## Guidance

**Two-format split: JSONL for event streams, JSON for documents.**

JSONL (one JSON object per line) fits append-only event streams where each line is independent — session logs grow line by line during import. JSON fits structured documents with cross-references — traces, compositions — where you need the whole object to make sense of it.

**Compositions replace tutorials directly.** The composition (`composition.json`) is the canonical tutorial format. The build-time loader resolves trace references and hand-authored blocks into a `Tutorial` object using `resolveComposition()`. No intermediate YAML export step.

**`formatVersion` on all layers, optional with validation.**

- **Sessions (JSONL)**: First-line header event `{"type":"header","formatVersion":"1.0.0","importDate":"..."}` — keeps the file self-contained without a sidecar.
- **Traces (JSON)**: `formatVersion` field on `TraceState`.
- **Compositions (JSON)**: `formatVersion` field on `TutorialComposition`.

Making `formatVersion` optional (TypeScript `?`) avoids breaking existing code that constructs these types. Loaders validate on read with `console.warn` for missing or unknown versions — graceful degradation, not hard failures.

**`fullBlocks` as a parallel field.** Rather than overloading `blocks` with a mode flag, a separate `fullBlocks?: CompositionBlock[]` mirrors the existing `rounds`/`fullRounds` split on the `Tutorial` type. The resolver processes both in one call.

## Why This Matters

- **Fewer moving parts**: One loader path instead of three YAML globs + a JSON composition path. Fewer parsers, fewer asset-rewriting code paths to maintain.
- **Safe future migrations**: `formatVersion` lets loaders detect old-format files and apply migration logic or warn, instead of silently misinterpreting data.
- **Domain type isolation**: The `Tutorial` type consumed by `TutorialViewer` is unchanged — the viewer doesn't know whether data came from YAML or JSON. Format changes happen below the viewer layer.

## When to Apply

- When adding a new data layer to the pipeline, choose JSONL for append-only streams and JSON for structured documents.
- When versioning a line-oriented format, use a first-line header event with the same discriminator pattern as the rest of the file (e.g., `"type": "header"` in the `SessionEvent` union).
- When making `formatVersion` required would break many call sites, use optional + warn-on-read instead.

## Examples

**Before (three formats):**
```
Sessions (JSONL) → Traces (JSON) → Compositions (JSON) → Export → Tutorials (YAML)
```

**After (two formats):**
```
Sessions (JSONL) → Traces (JSON) → Compositions (JSON) → resolved at build time
```

**Session header event:**
```json
{"type":"header","formatVersion":"1.0.0","importDate":"2026-04-24T10:00:00Z","sourceSessionId":"abc123"}
```

**Version validation pattern:**
```typescript
function checkVersion(label: string, version: string | undefined) {
  if (!version) {
    console.warn(`${label} is missing formatVersion`);
  } else if (!version.startsWith('1.')) {
    console.warn(`${label} has unknown formatVersion "${version}"`);
  }
}
```

## Related

- `src/lib/data/tutorial-loader.ts` — composition-based loader
- `src/lib/compose/resolve.ts` — `resolveComposition()` with `fullBlocks` support
- `src/lib/compose/types.ts` — `FORMAT_VERSION` constant, `TutorialComposition` type
- `docs/solutions/design-patterns/wysiwyg-trace-editing-via-component-reuse-2026-04-23.md` — related pipeline architecture
