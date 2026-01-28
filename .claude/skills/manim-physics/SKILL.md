---
name: manim-physics
description: Create physics education animations using Manim for Korean 2022 curriculum. Use when making animations for mechanics, electromagnetism, optics, or modern physics concepts like Newton laws, energy, electric fields, circuits, wave interference, and atomic models.
---

# Manim Physics Education

Create educational physics animations using Manim, aligned with Korean 2022 Revised Physics Curriculum.

## Quick start

```python
from manim import *

class NewtonSecondLaw(Scene):
    def construct(self):
        box = Square(fill_color=BLUE, fill_opacity=0.5)
        force = Arrow(LEFT * 2, LEFT * 0.5, color=RED)
        equation = MathTex(r"F = ma").to_corner(UR)
        
        self.play(Create(box), Create(force), Write(equation))
        self.play(box.animate.shift(RIGHT * 3), run_time=2)
        self.wait()
```

Render command:

```bash
manim -pql script.py NewtonSecondLaw
```

## Instructions

1. Identify the physics topic from curriculum areas
2. Choose appropriate visualizations (vectors, graphs, fields)
3. Follow color conventions for consistency
4. Structure animations step-by-step
5. Add curriculum standard code in docstring

## Color conventions

- RED: forces
- BLUE: velocity
- ORANGE: acceleration
- GREEN: energy, displacement
- YELLOW: electric field, light
- PURPLE: magnetic field

## Examples

### Force equilibrium

```python
class ForceEquilibrium(Scene):
    """[12물리01-01] Force equilibrium"""
    def construct(self):
        box = Square(side_length=1, fill_color=BLUE, fill_opacity=0.5)
        f1 = Arrow(box.get_center(), box.get_center() + RIGHT * 2, color=RED)
        f2 = Arrow(box.get_center(), box.get_center() + LEFT * 2, color=RED)
        eq = MathTex(r"\sum F = 0").to_corner(UR)
        
        self.play(Create(box), Create(f1), Create(f2), Write(eq))
        self.wait()
```

### Electric field

```python
class ElectricField(Scene):
    """[12물리02-01] Electric field of point charge"""
    def construct(self):
        charge = Dot(color=RED, radius=0.2)
        plus = MathTex("+").move_to(charge)
        
        lines = VGroup(*[
            Arrow(charge.get_center() + d * 0.3, charge.get_center() + d * 2, 
                  color=YELLOW, buff=0)
            for d in [UP, DOWN, LEFT, RIGHT, UR, UL, DR, DL]
        ])
        
        eq = MathTex(r"E = k\frac{q}{r^2}").to_corner(UR)
        
        self.play(Create(charge), Write(plus))
        self.play(Create(lines))
        self.play(Write(eq))
        self.wait()
```

## Best practices

- Use `self.wait()` between animation steps
- Keep total duration under 30 seconds
- Include equations alongside visualizations
- Group related objects with `VGroup`

## Requirements

```bash
pip install manim
```

## Advanced usage

For detailed examples by topic, see:

- [references/mechanics.md](references/mechanics.md)
- [references/electromagnetism.md](references/electromagnetism.md)
- [references/optics.md](references/optics.md)
