# Prompt Sequence: Limb Digit Patterning With AI Agents

These are short prompts for a real captured agent session. The point is to let the agent make modeling choices, then steer with brief follow-ups when the result drifts away from the tutorial goal.

## Prompt 1: Project Setup

```text
Let's make a tiny mathematical-modeling project about developmental limb digit patterning, inspired by James Sharpe's Turing-network work. Start by creating a concise AGENTS.md and MODEL.md that explain the project goal, the simplified biological story, and what a visible result should look like.
```

## Prompt 2: Paper Framing

```text
Use the Raspopovic/Sharpe digit-patterning paper as the biological anchor and turn the idea into a tutorial-sized model brief. Keep it honest: we want a simplified model that teaches the workflow, not a reproduction of the full Bmp-Sox9-Wnt paper model.
```

## Prompt 3: First Simulation

```text
Build the first runnable Python simulation from the model brief. Aim for a simple 2D reaction-diffusion toy model whose output looks like Sox9-like digit rays on a rectangular tissue field, and save a visible image.
```

## Follow-Up: If It Makes Dots

```text
This is close, but the visual target should be finger-like rays elongated along the proximal-distal axis, not isolated dots or speckles. Please revise the model or readout so the pattern reads more like simplified digits while staying tutorial-sized.
```

## Follow-Up: If It Overbuilds

```text
This is getting too elaborate for the tutorial. Please simplify toward the shortest honest model that creates a visible digit-ray pattern, and move any advanced biological realism into a "future work" note.
```

## Prompt 4: Parameter Tuning

```text
Now add a small parameter-tuning step. Give the agent a target like five digit rays, search a few interpretable parameters, and save the best image plus a short summary of what changed.
```

## Follow-Up: If Tuning Is Slow

```text
The tuning run is too slow for a tutorial. Reduce it to a small, legible search over just a few parameters while preserving the idea of fitting toward a target pattern.
```

## Prompt 5: Tutorial Reflection

```text
Write a short final note explaining what we built, what the parameters mean, and how this differs from the real Sharpe limb-patterning model. Keep the tone suitable for a computational biology learner.
```

## One-Shot Variant

```text
Build a tiny tutorial-quality project about limb digit patterning with AI-assisted mathematical modeling. Use a simplified reaction-diffusion model inspired by Sharpe's digit-patterning work, produce a visible five-ish digit-ray pattern, and add a small parameter-tuning step.
```

## Capture Notes

Likely keep 3-5 rounds in the final tutorial:

- model framing,
- first simulation,
- correction toward finger-like rays if needed,
- parameter tuning,
- final explanation.

Hide package chatter, raw JSON, long numerical logs, and retries unless they teach a modeling decision.
