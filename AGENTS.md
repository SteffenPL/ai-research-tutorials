# AI Research Tutorials — Agent Notes

Build concise, real tutorials for AI-assisted research workflows.

## Core rule

A tutorial is not a transcript. Keep the shortest authentic path from setup → action → visible result.

## Tutorial style

- Prefer 2–5 strong rounds for setup/basic workflows.
- Hide noisy verification, raw JSON, retries, thinking text, and long terminal output.
- Keep meaningful final assistant answers and visible results.
- Use short comments only when they teach; link out instead of explaining everything inline.
- Make install tutorials practical and truthful: requirements → command/action → proof it worked.

## Data flow

- Canonical tutorial content lives in `src/tutorials/<slug>/composition.json`.
- Traces live in `src/traces/<slug>/trace.json` and are referenced by compositions.
- Assets live in `static/assets/` or `static/tutorials/<slug>/assets/`; generated thumbnails live under `_thumbs/`.
- Register tutorials in `src/lib/data/tutorials.ts`.

## Development

- Main viewer: `src/lib/components/tutorial/TutorialViewer.svelte`.
- Desktop/media windows: `src/lib/components/tutorial/DesktopStack.svelte`.
- Window renderers: `src/lib/components/windows/`.
- Dev tools: `/edit`, `/curate/<slug>`, `/compose/<slug>`, `/preview/<slug>`.

## Quality bar

Before pushing, run:

```sh
npm run check
npm run build
npm run test:e2e -- --project=chromium
```

Keep Svelte warnings at zero. For media/window regressions, add or update Playwright coverage first.
