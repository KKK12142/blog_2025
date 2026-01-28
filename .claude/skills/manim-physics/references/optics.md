# Optics and Modern Physics Animations

## Double Slit Interference

```python
class DoubleSlit(Scene):
    """[12물리03-01] Wave interference"""
    def construct(self):
        barrier = VGroup(
            Line(UP * 2, UP * 0.2),
            Line(DOWN * 0.2, DOWN * 2)
        ).shift(LEFT * 2)
        
        screen = Line(UP * 2, DOWN * 2).shift(RIGHT * 3)
        
        # Wave paths
        path1 = Line(LEFT * 2 + UP * 0.1, RIGHT * 3 + UP * 0.5, color=YELLOW)
        path2 = Line(LEFT * 2 + DOWN * 0.1, RIGHT * 3 + UP * 0.5, color=YELLOW)
        
        eq = MathTex(r"d\sin\theta = m\lambda").to_corner(UR)
        
        self.play(Create(barrier), Create(screen))
        self.play(Create(path1), Create(path2))
        self.play(Write(eq))
        self.wait()
```

## Snell's Law

```python
class SnellsLaw(Scene):
    """[12물리03-02] Refraction"""
    def construct(self):
        interface = Line(LEFT * 4, RIGHT * 4, color=WHITE)
        normal = DashedLine(UP * 2, DOWN * 2, color=GRAY)
        
        incident = Arrow(UP * 2 + LEFT * 1.5, ORIGIN, color=YELLOW, buff=0)
        refracted = Arrow(ORIGIN, DOWN * 2 + RIGHT * 0.8, color=YELLOW, buff=0)
        
        theta1 = Arc(radius=0.5, start_angle=PI/2, angle=-PI/6, color=RED)
        theta2 = Arc(radius=0.5, start_angle=-PI/2, angle=PI/8, color=BLUE)
        
        eq = MathTex(r"n_1 \sin\theta_1 = n_2 \sin\theta_2").to_corner(UR)
        
        self.play(Create(interface), Create(normal))
        self.play(Create(incident), Create(theta1))
        self.play(Create(refracted), Create(theta2))
        self.play(Write(eq))
        self.wait()
```

## Photoelectric Effect

```python
class PhotoelectricEffect(Scene):
    """[12물리03-03] Photoelectric effect"""
    def construct(self):
        plate = Rectangle(width=2, height=0.3, fill_color=GRAY, fill_opacity=0.8)
        
        photon = Arrow(UP * 2 + LEFT, plate.get_top(), color=YELLOW, buff=0)
        photon_label = MathTex(r"h\nu", color=YELLOW).next_to(photon, LEFT)
        
        electron = Dot(color=BLUE, radius=0.1).move_to(plate.get_top())
        electron_path = Arrow(plate.get_top(), plate.get_top() + UR * 1.5, 
                              color=BLUE, buff=0)
        
        eq = MathTex(r"h\nu = W + \frac{1}{2}mv^2").to_corner(UR)
        
        self.play(Create(plate))
        self.play(Create(photon), Write(photon_label))
        self.play(Create(electron), Create(electron_path))
        self.play(Write(eq))
        self.wait()
```

## Bohr Model

```python
class BohrModel(Scene):
    """[12물리03-05] Hydrogen atom"""
    def construct(self):
        nucleus = Dot(color=RED, radius=0.15)
        plus = MathTex("+", font_size=20).move_to(nucleus)
        
        orbits = VGroup(*[
            Circle(radius=r, color=GRAY, stroke_width=1)
            for r in [0.8, 1.4, 2.0]
        ])
        
        electron = Dot(color=BLUE, radius=0.1).move_to(RIGHT * 0.8)
        
        eq = MathTex(r"E_n = -\frac{13.6}{n^2} \text{ eV}").to_corner(UR)
        
        self.play(Create(nucleus), Write(plus))
        self.play(Create(orbits))
        self.play(Create(electron))
        self.play(Write(eq))
        
        # Electron transition
        self.play(electron.animate.move_to(RIGHT * 1.4), run_time=0.5)
        self.wait()
```

## Time Dilation

```python
class TimeDilation(Scene):
    """[12물리03-06] Special relativity"""
    def construct(self):
        # Rest frame clock
        clock1 = Circle(radius=0.8, color=WHITE).shift(LEFT * 3)
        hand1 = Arrow(clock1.get_center(), clock1.get_center() + UP * 0.6, 
                      color=RED, buff=0, stroke_width=3)
        label1 = Text("Rest", font_size=24).next_to(clock1, DOWN)
        
        # Moving frame clock
        clock2 = Circle(radius=0.8, color=WHITE).shift(RIGHT * 3)
        hand2 = Arrow(clock2.get_center(), clock2.get_center() + UP * 0.6,
                      color=BLUE, buff=0, stroke_width=3)
        label2 = Text("Moving", font_size=24).next_to(clock2, DOWN)
        
        eq = MathTex(r"\Delta t' = \gamma \Delta t").to_corner(UR)
        
        self.play(Create(clock1), Create(hand1), Write(label1))
        self.play(Create(clock2), Create(hand2), Write(label2))
        self.play(Write(eq))
        
        # Time passes differently
        self.play(
            Rotate(hand1, angle=-PI, about_point=clock1.get_center()),
            Rotate(hand2, angle=-PI/2, about_point=clock2.get_center()),
            run_time=3
        )
        self.wait()
```
