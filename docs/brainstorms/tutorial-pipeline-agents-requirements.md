---
date: 2026-04-24
topic: tutorial-pipeline-agents
---

# Tutorial Pipeline Agents

## Problem Frame

Creating tutorials for the AI research tutorials site is a multi-step manual process: generating a Claude Code session, importing it, curating a trace, writing editorial comments, and translating to Japanese. Each step requires domain knowledge (prompt design, editorial judgment, academic Japanese) and awareness of the file conventions across three data layers. Automating this with specialized Claude Code subagents would let a single orchestrator command produce a published tutorial end-to-end, while each agent remains independently usable for partial workflows.

---

## Actors

- A1. **Session Creator agent**: Designs prompts and runs real Claude Code CLI sessions to generate authentic JSONL session logs for tutorial content.
- A2. **Tutorial Producer agent**: Imports a session, curates a trace, and writes the composition — making all editorial and scope decisions (what to include, how to comment, whether to split into multiple tutorials).
- A3. **Translator agent**: Adds context-appropriate Japanese translations to tutorial content (titles, comments, descriptions, welcome text).
- A4. **Tutorial Orchestrator agent**: Coordinates the full pipeline from topic description to published tutorial by chaining A1 → A2 → A3 via convention-based file paths.
- A5. **Human author**: May invoke any agent individually or use the orchestrator. Reviews output at any stage.

---

## Key Flows

- F1. **Full pipeline (orchestrated)**
  - **Trigger:** Human provides a topic description and learning goals to the orchestrator
  - **Actors:** A4 (orchestrator), A1, A2, A3
  - **Steps:**
    1. Orchestrator determines slug, topic framing, and target audience
    2. Orchestrator invokes session-creator with topic + prompt guidance → session written to `src/sessions/<slug>/`
    3. Orchestrator invokes tutorial-producer with session path → trace at `src/traces/<slug>/trace.json`, composition at `src/tutorials/<slug>/composition.json`
    4. Orchestrator invokes translator with composition path → composition updated with `ja` fields
    5. Orchestrator verifies output (type-check, dev server preview)
  - **Outcome:** A complete, bilingual tutorial ready for deployment
  - **Covered by:** R1, R8, R9, R10, R11, R12

- F2. **Standalone session creation**
  - **Trigger:** Human wants to generate a showcase session for a specific topic
  - **Actors:** A1
  - **Steps:**
    1. Agent receives topic, learning goals, and optional constraints (model, MCP tools)
    2. Agent designs a prompt sequence that teaches the topic progressively
    3. Agent runs `claude` CLI (or Claude Code subprocess) with designed prompts
    4. Agent locates the resulting JSONL and imports it to `src/sessions/<slug>/`
  - **Outcome:** An imported, ready-to-curate session JSONL
  - **Covered by:** R1, R2, R3

- F3. **Standalone tutorial production**
  - **Trigger:** Human has an existing session and wants a curated tutorial
  - **Actors:** A2
  - **Steps:**
    1. Agent inspects session structure (rounds, steps, types)
    2. Agent makes editorial decisions: which rounds matter, what to comment, whether to split
    3. Agent creates trace and composition with comments focused on prompt design and outcomes
    4. Agent adds links to relevant external resources
  - **Outcome:** A composition.json ready for translation and deployment
  - **Covered by:** R4, R5, R6, R7

---

## Requirements

**Session creation (A1)**

- R1. The session-creator agent must run real Claude Code CLI sessions and produce authentic JSONL session logs, not synthetic data.
- R2. The agent must design prompt sequences that progressively teach a topic — selecting appropriate models, MCP tools, and follow-up prompts to showcase capabilities.
- R3. After running a session, the agent must import the resulting JSONL to `src/sessions/<slug>/` using the existing import script (`scripts/import-session.ts`) or equivalent logic, and report the output path.

**Tutorial production (A2)**

- R4. The tutorial-producer agent must handle the full import → trace → composition pipeline for a given session, outputting to the canonical paths (`src/traces/<slug>/trace.json` and `src/tutorials/<slug>/composition.json`).
- R5. Editorial focus: the agent must prioritize key learning points, prompt design rationale, and outcome commentary over intermediate steps. Intermediate steps should only be included when they illustrate something the learner needs to see. The learner's time is the primary constraint.
- R6. The agent must include links to relevant external resources (documentation, papers, tool references) in tutorial comments where they help the learner go deeper.
- R7. The agent has scope authority: it may decide to split a long session into multiple tutorials or recommend combining short sessions, and should act on those decisions.

**Translation (A3)**

- R8. The translator agent must add Japanese (`ja`) fields to all translatable content in a composition: `meta.title`, `welcome.heading`, `welcome.description`, `welcome.learnings`, and all step `comment` fields.
- R9. Translations must be context-appropriate for an academic/research audience — using natural Japanese phrasing rather than literal translation, with appropriate technical terminology.

**Orchestration (A4)**

- R10. The orchestrator must chain session-creator → tutorial-producer → translator using convention-based file paths (slug-derived), passing no artifacts other than the slug between stages.
- R11. The orchestrator must verify the final output compiles (`npx svelte-check`) and is previewable before declaring success.
- R12. Each agent must be independently invocable — the orchestrator is a convenience, not a requirement.

**Agent file format**

- R13. All agents must be `.md` files in `.claude/agents/` following the existing frontmatter format (name, description with examples, model, memory fields) as established by `fiji-processing.md`.
- R14. Each agent's instructions must reference the relevant pipeline documentation (`scripts/TUTORIAL-WORKFLOW.md`, `CLAUDE.md` pipeline sections) so agents operate with current knowledge of data formats and conventions.

---

## Acceptance Examples

- AE1. **Covers R1, R3, R10.** Given topic "cell segmentation with Fiji", the session-creator runs a real `claude` CLI session using the Fiji MCP, produces a JSONL log, and imports it to `src/sessions/cell-segmentation/`. The orchestrator finds the session at that path without any explicit file path being passed.

- AE2. **Covers R5, R6.** Given a 15-round session with debugging detours in rounds 8-11, the tutorial-producer includes rounds 1-7 and 12-15, marks rounds 8-11 as hidden, and adds comments like "Notice how the prompt specifies the exact measurement criteria — this avoids ambiguous results" with a link to the relevant Fiji documentation.

- AE3. **Covers R7.** Given a 25-round session covering both image preprocessing and statistical analysis, the tutorial-producer splits it into two compositions: `preprocessing-pipeline` and `statistical-analysis`, each with its own welcome text and focused learning goals.

- AE4. **Covers R8, R9.** Given a comment "This prompt uses specific column names to avoid ambiguity in the CSV parser", the translator produces `ja: "このプロンプトではCSVパーサーの曖昧さを避けるため、具体的なカラム名を指定しています"` — natural academic Japanese, not literal word-by-word translation.

---

## Success Criteria

- A single orchestrator invocation with a topic description produces a complete, bilingual tutorial that appears correctly on the site.
- Each agent is useful independently — a human can invoke just the translator or just the tutorial-producer without the orchestrator.
- Tutorial quality: produced tutorials focus on prompt design insights and outcomes, not mechanical step-by-step narration. A reader should learn *how to prompt effectively*, not just *what happened*.
- Translation quality: Japanese content reads naturally to a native-speaking researcher, not like machine translation.

---

## Scope Boundaries

- No changes to the existing data pipeline (session → trace → composition types, asset rewriting, format versioning) — agents consume the pipeline as-is
- No web UI for agent management — agents are invoked via Claude Code CLI
- No automatic deployment — the orchestrator verifies but does not run `deploy.sh`
- No agent memory/learning across sessions (beyond what Claude Code's built-in project memory provides)
- No multi-language beyond EN/JA (future expansion possible but not in scope)

---

## Key Decisions

- **Combined tutorial-producer over separate trace-curator + tutorial-writer**: Reduces handoff complexity and lets the editorial agent see the raw session while making trace decisions. One agent understands both "what to include" and "how to present it."
- **Real Claude Code sessions over synthetic**: Authenticity matters for a site that showcases real AI workflows. Non-determinism is acceptable — the tutorial-producer curates the result regardless.
- **Convention-based file paths over manifests**: The repo already has strict directory conventions. Adding a manifest artifact would be redundant coordination overhead.
- **Writer has scope authority**: The tutorial-producer can split/combine sessions because it has the editorial context to make that judgment. The orchestrator shouldn't need to pre-determine scope.

---

## Dependencies / Assumptions

- The `claude` CLI is available on the machine where session-creator runs, with appropriate API keys configured
- MCP tools (e.g., Fiji MCP) are available when generating sessions that use them
- The existing `scripts/import-session.ts` and tutorial pipeline scripts work correctly (they are production-ready per repo status)
- The composition.json format is stable (format unification plan is active but compositions are already canonical)

---

## Outstanding Questions

### Deferred to Planning

- [Affects R1][Technical] How does the session-creator locate the JSONL after running `claude` CLI? Options: parse `~/.claude/projects/` for most recent session, use CLI flags, or wrap the invocation to capture the path.
- [Affects R2][Needs research] What model selection heuristics should the session-creator use? (e.g., Opus for complex reasoning showcases, Sonnet for speed-focused demos)
- [Affects R7][Technical] When the tutorial-producer splits a session, how does it handle shared assets (images referenced by both resulting tutorials)?
- [Affects R14][Technical] Should agents embed key pipeline knowledge directly, or use a shared reference file that all agents include?

---

## Next Steps

-> `/ce-plan` for structured implementation planning (all blocking questions resolved — remaining questions are technical and belong in planning)
