# Model Brief: Minimal Digit-Like Reaction-Diffusion System

## Biological Interpretation

This model is inspired by developmental limb digit patterning, especially the idea that repeated digit condensations can arise from a self-organizing Turing-like mechanism.

The full biological story in Raspopovic et al. involves a Bmp-Sox9-Wnt network modulated by morphogen gradients. For this experiment, we simplify that into a generic activator-inhibitor system:

- `u`: a Sox9-like activator/readout. High `u` marks digit-like condensations.
- `v`: a longer-range inhibitor. It prevents high-`u` domains from forming everywhere.

The teaching point is the mechanism, not molecular fidelity: local activation combined with longer-range inhibition can produce repeated spatial patterns, and anisotropic proximal-distal spread can turn those domains into finger-like digit rays.

## Domain

Use a rectangular 2D domain:

```text
x: anterior-posterior direction
y: proximal-distal direction
```

This deliberately avoids the geometry complexity of a real limb bud. A later extension could mask the rectangle into a limb-bud shape or apply a proximal-distal gradient.

For tutorial quality, the default output should read as fingers/rays, not just isolated peaks. A simple way to achieve this is anisotropic diffusion or an explicit proximal-distal competence field that elongates high-`u` domains along `y`.

## Example Model

One suitable choice is the Schnakenberg reaction-diffusion system:

```text
du/dt = Du * Laplacian(u) + a - u + u^2 * v
dv/dt = Dv * Laplacian(v) + b - u^2 * v
```

Typical Turing behavior requires:

```text
Dv > Du
```

The inhibitor diffuses farther than the activator, so high-`u` regions can reinforce themselves locally while suppressing nearby rays.

## Alternative Model

A Gray-Scott-style system is also acceptable:

```text
du/dt = Du * Laplacian(u) - u * v^2 + F * (1 - u)
dv/dt = Dv * Laplacian(v) + u * v^2 - (F + k) * v
```

If this is used, the agent should explain how the chosen species maps onto the Sox9-like readout.

## Boundary Conditions

Use no-flux boundaries if practical, because a tissue edge should not leak morphogen by default. Periodic boundaries are acceptable for a first smoke test, but should be clearly labeled as a numerical simplification.

## Initial Conditions

Use a near-homogeneous state plus small random perturbations, or seed a small central/edge perturbation. The model should not hard-code five digits. The point is that patterning should emerge from the dynamics and parameters.

## Output

At minimum, produce:

- `outputs/final_pattern.png`: heatmap of final `u`, with elongated high-`u` digit rays
- optional `outputs/pattern_evolution.gif`: evolution of `u`
- optional `outputs/fit_best.png`: best pattern found by parameter search

High `u` should be colored brightly and described as digit-like Sox9 expression. The desired visual is a set of proximal-distal rays/fingers.

## Simple Pattern Score

For the fitting stage, a simple score is enough. Possible strategies:

- threshold final `u`, project onto the anterior-posterior axis, count rays
- sample a distal band and count local maxima
- use connected components on a thresholded high-`u` mask

The score should reward:

- target count, e.g. five high-`u` rays
- separation between rays
- nonblank, nonuniform pattern

It is okay if the score is rough. The educational goal is to demonstrate parameter tuning, not publish a robust image-analysis metric.
