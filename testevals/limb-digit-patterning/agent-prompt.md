# Draft Agent Prompt

You are helping build the first working experiment for a tutorial series on AI-assisted mathematical modeling in developmental biology.

The biological anchor is limb digit patterning, inspired by:

- Raspopovic J, Marcon L, Russo L, Sharpe J. "Digit patterning is controlled by a Bmp-Sox9-Wnt Turing network modulated by morphogen gradients." Science, 2014. https://doi.org/10.1126/science.1252960
- Onimaru K, Marcon L, Musy M, Tanaka M, Sharpe J. "The fin-to-limb transition as the re-organization of a Turing pattern." Nature Communications, 2016. https://doi.org/10.1038/ncomms11582

Build a simplified educational model, not a reproduction of the full Sharpe simulation.

## Task

Create a small Python project in:

```text
testevals/limb-digit-patterning/workspace/
```

The project should simulate a 2D activator-inhibitor reaction-diffusion system on a rectangular domain and produce digit-like repeated high-activator regions.

Interpretation:

- activator `u` = Sox9-like digit-promoting field
- inhibitor `v` = longer-range inhibitory field
- high `u` = digit-like condensation

## Requirements

1. Use a simple finite-difference simulation with `numpy` and `matplotlib`.
2. Keep the code readable and tutorial-friendly.
3. Save at least one generated image to `outputs/final_pattern.png`.
4. Add `MODEL.md` explaining:
   - equations used
   - parameter meanings
   - biological interpretation
   - simplifications relative to the Sharpe/Raspopovic paper
5. Add a simple parameter-tuning script that tries to produce a target number of high-activator domains, preferably five.
6. Keep runtime reasonable on a laptop.

## Constraints

- No submodule.
- No external biological data.
- No complex PDE frameworks.
- No realistic limb geometry for this first version.
- Do not claim the output reproduces the Science 2014 model.

## Suggested Shape

Files may look like:

```text
workspace/
  README.md
  MODEL.md
  pyproject.toml
  src/
    simulate.py
    tune.py
  outputs/
```

A successful run should leave visible proof in `outputs/`.
