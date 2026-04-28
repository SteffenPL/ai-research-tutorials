# Experiment Spec: Simplified Limb Digit Patterning

## Goal

Build a small, runnable mathematical modeling project that demonstrates how a reaction-diffusion model can generate digit-like spatial patterns. The project should be suitable as the raw material for a later tutorial about using AI agents to move from a developmental biology paper to a working simulation and parameter-tuning workflow.

This is a simplified educational model, not a reproduction of Sharpe et al.'s full Bmp-Sox9-Wnt simulation.

## Target Audience

Biologists or computational biology learners who understand developmental patterning conceptually but may not be fluent in numerical PDE implementation.

## Scientific Framing

Digits arise from patterned condensations in the developing limb bud. Raspopovic et al. argue that digit specification can be understood through a Turing-like network involving Bmp, Sox9, and Wnt, modulated by morphogen gradients.

For the experiment, we represent this idea with a generic two-species activator-inhibitor system on a rectangular tissue field:

- activator `u`: a Sox9-like digit-promoting field
- inhibitor `v`: a longer-range inhibitory field
- high-`u` regions: digit-like condensations

The model should make the core principle visible: local activation plus longer-range inhibition can create repeated spatial domains.

## Deliverables

The first agent attempt should create a self-contained folder, recommended path:

```text
testevals/limb-digit-patterning/workspace/
```

Expected files:

- `pyproject.toml` or a minimal runnable Python setup
- `README.md` with run commands
- `MODEL.md` explaining the model and simplifications
- `src/` or equivalent with simulation code
- `outputs/` with at least one generated pattern image
- optional `outputs/fit_results.json` for parameter-search results

## Implementation Scope

Use Python. Prefer a lightweight stack:

- `numpy`
- `scipy` if useful
- `matplotlib`
- optionally `imageio` for GIFs, but static images are enough

Use `uv` if the environment supports it, but avoid fragile setup. A normal Python script is acceptable if it is reproducible.

The simulation can use finite differences on a rectangular grid:

- 2D rectangular domain
- no-flux or periodic boundary conditions
- explicit time stepping is acceptable if stability is handled conservatively
- random or weakly perturbed initial conditions

The model should aim for robust visible patterns rather than biological completeness.

## Suggested Model Choices

The agent may choose one of:

- Schnakenberg activator-inhibitor model
- Gray-Scott-style activator-inhibitor model
- Gierer-Meinhardt-style activator-inhibitor model

The chosen model must be explained in `MODEL.md`, including:

- equations
- parameter meanings
- why inhibitor diffusion should be larger than activator diffusion
- how high activator concentration is interpreted as a digit-like domain

## Parameter Fitting / Tuning

Include a simple second-stage task:

- define a target digit count, such as `target_count = 5`
- run a small grid search or random search over a few parameters
- score each simulation by counting high-activator peaks or stripes near the final time
- save the best parameter set and one best-pattern image

This does not need to be statistically rigorous. It should show the basic inverse-modeling idea: ask the agent to tune model parameters so a simulated tissue pattern matches an observed target.

## Acceptance Criteria

A first attempt is successful if:

- `python` or `uv run` command produces at least one nonblank pattern image
- the pattern has repeated digit-like high-activator domains
- `MODEL.md` clearly states that the model is educational and Sharpe-inspired, not a reproduction
- parameter search can run in a few minutes on a laptop
- the code is simple enough to explain in a 2-3 part tutorial series

## Non-Goals

- No realistic limb-bud mesh
- No direct reproduction of Science 2014 figures
- No experimental image fitting in the first attempt
- No submodule or external repo dependency
- No full Bmp/Sox9/Wnt regulatory network unless the minimal model is already working
- No complex PDE frameworks such as FEniCS or COMSOL

## Tutorial Hypothesis

If the experiment works, the later tutorial series can be:

1. **Read a developmental biology paper with an agent**: extract the patterning logic and write `MODEL.md`.
2. **Build a minimal simulator**: implement a rectangular-domain reaction-diffusion model and generate Sox9-like digit domains.
3. **Tune the model**: search for parameters that produce a requested digit count or match a simple target pattern.

The tutorial should preserve the shortest authentic path from setup to visible result.
