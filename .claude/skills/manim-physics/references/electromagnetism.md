# Electromagnetism Animations

## Electric Field

```python
class PointChargeField(Scene):
    """[12물리02-01] Electric field of point charge"""
    def construct(self):
        charge = Dot(color=RED, radius=0.25)
        plus = MathTex("+").move_to(charge)
        
        lines = VGroup(*[
            Arrow(charge.get_center() + d * 0.35, charge.get_center() + d * 2.5,
                  color=YELLOW, buff=0, stroke_width=2)
            for d in [UP, DOWN, LEFT, RIGHT, 
                      UP+RIGHT, UP+LEFT, DOWN+RIGHT, DOWN+LEFT]
        ])
        
        eq = MathTex(r"E = k\frac{q}{r^2}").to_corner(UR)
        
        self.play(Create(charge), Write(plus))
        self.play(Create(lines), run_time=2)
        self.play(Write(eq))
        self.wait()
```

## Series Circuit

```python
class SeriesCircuit(Scene):
    """[12물리02-02] Resistors in series"""
    def construct(self):
        # Resistors as rectangles
        r1 = Rectangle(width=0.6, height=0.25).shift(LEFT * 1.5)
        r2 = Rectangle(width=0.6, height=0.25).shift(RIGHT * 0.5)
        
        r1_label = MathTex("R_1").next_to(r1, UP)
        r2_label = MathTex("R_2").next_to(r2, UP)
        
        # Wire connections
        wire = VGroup(
            Line(LEFT * 3, r1.get_left()),
            Line(r1.get_right(), r2.get_left()),
            Line(r2.get_right(), RIGHT * 3)
        )
        
        eq = MathTex(r"R_{total} = R_1 + R_2").to_corner(UR)
        
        self.play(Create(r1), Create(r2), Write(r1_label), Write(r2_label))
        self.play(Create(wire))
        self.play(Write(eq))
        self.wait()
```

## Magnetic Field

```python
class MagneticFieldWire(Scene):
    """[12물리02-05] Magnetic field around wire"""
    def construct(self):
        wire = Circle(radius=0.15, fill_color=ORANGE, fill_opacity=1)
        current = MathTex(r"\odot").scale(0.8)
        
        b_circles = VGroup(*[
            Circle(radius=r, color=PURPLE, stroke_width=2)
            for r in [0.5, 0.9, 1.3, 1.7]
        ])
        
        eq = MathTex(r"B = \frac{\mu_0 I}{2\pi r}").to_corner(UR)
        
        self.play(Create(wire), Write(current))
        self.play(Create(b_circles), run_time=2)
        self.play(Write(eq))
        self.wait()
```

## Electromagnetic Induction

```python
class FaradayInduction(Scene):
    """[12물리02-06] Faraday law"""
    def construct(self):
        coil = VGroup(*[
            Ellipse(width=1.5, height=0.5, color=ORANGE).shift(RIGHT * i * 0.2)
            for i in range(4)
        ]).shift(RIGHT)
        
        magnet = VGroup(
            Rectangle(width=0.6, height=1.2, fill_color=RED, fill_opacity=0.8),
            Text("N", font_size=20, color=WHITE)
        ).shift(LEFT * 3)
        
        eq = MathTex(r"\mathcal{E} = -\frac{d\Phi_B}{dt}").to_corner(UR)
        
        self.play(Create(coil), Create(magnet))
        self.play(magnet.animate.shift(RIGHT * 2), run_time=2)
        self.play(Write(eq))
        self.wait()
```
