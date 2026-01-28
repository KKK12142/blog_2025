# Mechanics Animations

## Force and Equilibrium

```python
class Equilibrium(Scene):
    """[12물리01-01] Force equilibrium"""
    def construct(self):
        box = Square(side_length=1, fill_color=BLUE, fill_opacity=0.5)
        f1 = Arrow(box.get_center(), box.get_center() + RIGHT * 2, color=RED, buff=0)
        f2 = Arrow(box.get_center(), box.get_center() + LEFT * 2, color=RED, buff=0)
        eq = MathTex(r"\sum \vec{F} = 0").to_corner(UR)
        
        self.play(Create(box))
        self.play(Create(f1), Create(f2))
        self.play(Write(eq))
        self.wait()
```

## Newton's Second Law

```python
class NewtonSecondLaw(Scene):
    """[12물리01-02] F = ma with motion"""
    def construct(self):
        box = Square(fill_color=BLUE, fill_opacity=0.5).shift(LEFT * 4)
        force = Arrow(box.get_left() + LEFT, box.get_left(), color=RED, buff=0)
        equation = MathTex(r"\vec{F} = m\vec{a}").to_corner(UR)
        
        self.play(Create(box), Create(force), Write(equation))
        self.play(
            box.animate.shift(RIGHT * 6),
            force.animate.shift(RIGHT * 6),
            run_time=2,
            rate_func=rate_functions.ease_in_quad
        )
        self.wait()
```

## Momentum Conservation

```python
class MomentumConservation(Scene):
    """[12물리01-03] Collision"""
    def construct(self):
        ball1 = Circle(radius=0.4, fill_color=RED, fill_opacity=0.8).shift(LEFT * 4)
        ball2 = Circle(radius=0.5, fill_color=BLUE, fill_opacity=0.8).shift(RIGHT)
        
        v1 = Arrow(ball1.get_right(), ball1.get_right() + RIGHT * 2, color=GREEN, buff=0)
        eq = MathTex(r"m_1 v_1 + m_2 v_2 = m_1 v_1' + m_2 v_2'").to_corner(DR)
        
        self.play(Create(ball1), Create(ball2), Create(v1))
        self.play(ball1.animate.shift(RIGHT * 3), v1.animate.shift(RIGHT * 3), run_time=1)
        self.play(Write(eq))
        self.wait()
```

## Energy Conservation

```python
class EnergyConservation(Scene):
    """[12물리01-04] Mechanical energy"""
    def construct(self):
        incline = Polygon(ORIGIN, RIGHT * 5, RIGHT * 5 + UP * 2.5,
                          fill_color=GRAY, fill_opacity=0.5).shift(LEFT * 2 + DOWN)
        ball = Circle(radius=0.25, fill_color=RED, fill_opacity=0.8)
        ball.move_to(incline.get_corner(UR) + UP * 0.3 + LEFT * 0.3)
        
        equation = MathTex(r"E = KE + PE = const").to_corner(UR)
        
        self.play(Create(incline), Create(ball), Write(equation))
        self.play(ball.animate.move_to(incline.get_corner(DR) + UP * 0.3), run_time=2)
        self.wait()
```
