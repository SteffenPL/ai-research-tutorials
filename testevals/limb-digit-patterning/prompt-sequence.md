# Prompt Sequence: Limb Digit Patterning With AI Agents

These prompts are drafts for a real captured agent session. The goal is to get a clean build-up:

1. paper/model extraction,
2. runnable simulation,
3. parameter tuning toward five digit rays.

Keep the session authentic. If the agent makes a useful mistake, the tutorial can show one short correction, but avoid long debugging detours.

## Setup Prompt

Use this before the main modeling work if the workspace is empty.

```text
We are starting a small mathematical-modeling project for developmental biology.

Create a project guidance file named AGENTS.md for this folder. The project goal is to build a simplified tutorial-quality model of limb digit patterning inspired by James Sharpe's work, especially the Bmp-Sox9-Wnt/Turing-network framing.

Important constraints:
- This is an educational simplified model, not a reproduction of the Science 2014 simulation.
- Prefer a short authentic path from setup to visible result.
- Use Python, numpy, and matplotlib unless there is a strong reason not to.
- Avoid complex PDE frameworks.
- The visible output should be finger-like digit rays elongated along the proximal-distal axis, not isolated spots.
- Put generated code and outputs in a workspace folder.

Also create a short MODEL.md scaffold with sections for biological anchor, simplified equations, assumptions, and planned outputs.
```

## Tutorial 1 Prompt: Paper To Model

Use this when the agent has web access. If not, paste paper references manually.

```text
Find and read enough about the limb digit patterning work by James Sharpe and colleagues to draft a concise model brief.

Anchor papers:
- Raspopovic, Marcon, Russo, Sharpe. "Digit patterning is controlled by a Bmp-Sox9-Wnt Turing network modulated by morphogen gradients." Science, 2014.
- Onimaru, Marcon, Musy, Tanaka, Sharpe. "The fin-to-limb transition as the re-organization of a Turing pattern." Nature Communications, 2016.

Write MODEL.md for a simplified tutorial model. It should explain:
- what biological process we are modeling,
- what Sox9 marks in the digit-patterning story,
- what a Turing or activator-inhibitor mechanism contributes,
- why we are using a rectangular tissue domain,
- why the output should be digit rays/fingers, not just dots,
- what simplifications make this tutorial-sized.

Do not implement code yet. Keep the document concise and honest about what is simplified.
```

## Tutorial 2 Prompt: Build The Simulator

This is the main build prompt. It intentionally gives constraints, not exact code.

```text
Now build the first runnable simulation from MODEL.md.

Create a small Python project in workspace/ that simulates a 2D activator-inhibitor reaction-diffusion model on a rectangular domain.

Biological interpretation:
- activator u = Sox9-like digit-promoting readout,
- inhibitor v = longer-range inhibitory field,
- high-u vertical rays = simplified digit condensations.

Requirements:
- Use numpy and matplotlib.
- Use a simple finite-difference method.
- Use no-flux boundaries if practical.
- Include a proximal-distal bias or anisotropic diffusion so the final pattern looks like finger-like rays along the y-axis, not isolated dots.
- Save outputs/final_pattern.png.
- The default run should produce around five digit rays.
- Add a README.md with exact run commands.
- Keep the code readable enough for a tutorial.

Do not use a realistic limb mesh, experimental data, FEniCS, COMSOL, or a large framework. This is a minimal educational model.

Run the simulation and inspect the generated image. If the result is only spots/noise, revise the model until it visibly forms elongated digit rays.
```

## Tutorial 2 Correction Prompt: If It Makes Spots

Use this if the first simulation produces speckled dots, blobs, or patterning everywhere.

```text
The output is not yet right for the tutorial. It reads as spots/noise, but the target visual is finger-like digit rays elongated along the proximal-distal axis.

Please revise the model or readout so that:
- pattern positions are selected along the anterior-posterior axis,
- high-u regions extend along the proximal-distal axis,
- the final image looks like simplified fingers/rays,
- the model remains honest and tutorial-sized.

Good options include anisotropic diffusion, a proximal-distal competence gradient, or a simple post-simulation Sox9-like readout derived from the activator field. Explain whichever choice you make in MODEL.md.

Rerun the simulation and report where the new image was saved.
```

## Tutorial 3 Prompt: Parameter Tuning

Use after the simulator has a good default image.

```text
Add a simple parameter-tuning step.

Goal: demonstrate inverse modeling by tuning the toy reaction-diffusion model toward a target of five Sox9-like digit rays.

Create src/tune.py that:
- runs a small grid search or random search over a few meaningful parameters,
- scores each result by counting digit rays in the distal/anterior-posterior profile,
- rewards outputs close to target_count = 5,
- saves outputs/tuning_best.png,
- saves outputs/tuning_summary.json with the best parameters and metrics.

Keep the search small enough to run in a few minutes or less. This is not a rigorous statistical fit; it is a tutorial demonstration of parameter search.

Run the tuner, inspect the best image, and briefly summarize which parameters mattered.
```

## Tutorial 3 Correction Prompt: If The Tuner Is Too Slow

```text
The tuner is too slow for a tutorial. Please reduce the search while keeping the teaching point.

Use a small set of candidate values for only 2-3 parameters. Prefer parameters learners can interpret, such as domain width, activator diffusion, inhibitor diffusion, or proximal-distal elongation. The full tuning run should complete quickly and still save a best image plus a JSON summary.
```

## One-Shot Prompt

Use this only if we want a single compact session rather than a three-part series.

```text
Build a small tutorial-quality mathematical modeling project for developmental biology.

The biological anchor is limb digit patterning inspired by James Sharpe's Bmp-Sox9-Wnt/Turing-network work. We are not reproducing the full paper model. We are building a simplified educational reaction-diffusion model that creates visible Sox9-like digit rays.

Create the project in workspace/.

Deliverables:
- MODEL.md explaining the biological anchor, equations, parameters, and simplifications.
- README.md with exact run commands.
- Python simulation code using numpy and matplotlib.
- outputs/final_pattern.png showing around five finger-like digit rays elongated along the proximal-distal axis.
- A simple tuning script that searches parameters toward target_count = 5 and saves outputs/tuning_best.png and outputs/tuning_summary.json.

Constraints:
- No realistic limb mesh.
- No experimental data.
- No complex PDE frameworks.
- The visual target is fingers/rays, not dots.
- Keep runtime reasonable and code tutorial-friendly.

Run the simulator and tuner before you finish. If the image does not look like elongated digit rays, revise before reporting success.
```

## Capture Notes

For the final public tutorial, likely keep only:

- the initial modeling prompt,
- the correction if the agent produces spots,
- the final successful simulation output,
- the tuning prompt and result.

Hide package-install chatter, long tuning logs, raw JSON, and numerical detours unless they teach a modeling decision.
