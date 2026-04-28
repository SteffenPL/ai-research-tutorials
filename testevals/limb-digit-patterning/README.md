# Limb Digit Patterning Experiment

This folder defines a first working experiment for an AI-agent tutorial series on mathematical modeling in developmental biology.

The immediate goal is not to publish a polished tutorial. The immediate goal is to see whether an agent can take a simplified, Sharpe-inspired digit-patterning specification and produce a working simulation plus a small parameter-search workflow. Once that works, we can curate the actual tutorial from the successful path.

## Biological Anchor

The series is inspired by James Sharpe and colleagues' work on limb digit patterning:

- Raspopovic J, Marcon L, Russo L, Sharpe J. "Digit patterning is controlled by a Bmp-Sox9-Wnt Turing network modulated by morphogen gradients." Science, 2014. https://doi.org/10.1126/science.1252960
- Onimaru K, Marcon L, Musy M, Tanaka M, Sharpe J. "The fin-to-limb transition as the re-organization of a Turing pattern." Nature Communications, 2016. https://doi.org/10.1038/ncomms11582

The experiment intentionally simplifies the biological and numerical setting:

- rectangular 2D domain instead of a realistic limb-bud geometry
- two-species activator-inhibitor model instead of the full Bmp-Sox9-Wnt network
- visible high-activator regions interpreted as Sox9-like digit condensations
- synthetic target patterns for fitting rather than experimental image data

## Files

- `experiment-spec.md`: The working goal, constraints, deliverables, and acceptance criteria.
- `model-brief.md`: The simplified mathematical model and biological interpretation.
- `agent-prompt.md`: A draft prompt for the first attempt to get the model working with an AI coding agent.

## Success Shape

A successful first attempt produces a small Python project that can:

1. simulate activator-inhibitor pattern formation on a rectangular domain,
2. save visible images of digit-like fingers/rays,
3. run a small parameter search toward a target digit count, and
4. write a short `MODEL.md` explaining what was built and how it relates to the Sharpe digit-patterning paper.

If the first attempt is too broad, we should reduce scope before turning it into a tutorial.
