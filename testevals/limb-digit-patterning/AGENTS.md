# Limb Digit Patterning Agent Notes

## Codex Subagent Logs

Codex subagent runs produce their own JSONL session logs under:

```text
~/.codex/sessions/YYYY/MM/DD/rollout-<timestamp>-<subagent-id>.jsonl
```

The parent Codex session log records the `spawn_agent` call, the exact prompt, the subagent nickname/id, and the `wait_agent` result. The subagent log itself contains the useful working transcript: prompt, assistant messages, tool calls, command outputs, and final answer.

For tutorial capture, prefer importing the subagent rollout log when the subagent did the actual work. Import the parent orchestration log only when the tutorial should teach orchestration itself.

Known test run:

```text
Subagent id: 019dd283-5c43-7b52-9b08-970011439859
Nickname: Singer
Log: ~/.codex/sessions/2026/04/28/rollout-2026-04-28T14-15-17-019dd283-5c43-7b52-9b08-970011439859.jsonl
```
