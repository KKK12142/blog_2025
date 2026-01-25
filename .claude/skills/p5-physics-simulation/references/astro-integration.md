# Astro 블로그에 p5.js 시뮬레이션 임베딩

## 프로젝트 구조

```
src/
├── components/
│   └── simulations/
│       ├── core/              # 공통 물리 엔진
│       │   ├── Particle.ts
│       │   ├── Forces.ts
│       │   ├── Graph.ts
│       │   └── index.ts
│       ├── ProjectileMotion.astro
│       ├── SpringOscillation.astro
│       └── Pendulum.astro
├── pages/
│   └── physics/
│       └── projectile.mdx
└── styles/
    └── simulation.css
```

## Step 1: p5.js 설치

```bash
npm install p5
npm install -D @types/p5
```

## Step 2: 공통 물리 엔진 (TypeScript)

### core/Particle.ts

```typescript
import p5 from 'p5';

export interface ParticleOptions {
  mass?: number;
  radius?: number;
  color?: [number, number, number];
}

export class Particle {
  p: p5;
  pos: p5.Vector;
  vel: p5.Vector;
  acc: p5.Vector;
  prevAcc: p5.Vector;
  mass: number;
  radius: number;
  color: [number, number, number];
  t: number;
  history: {
    t: number[];
    x: number[];
    y: number[];
    vx: number[];
    vy: number[];
    E: number[];
  };

  constructor(p: p5, x: number, y: number, options: ParticleOptions = {}) {
    this.p = p;
    this.pos = p.createVector(x, y);
    this.vel = p.createVector(0, 0);
    this.acc = p.createVector(0, 0);
    this.prevAcc = p.createVector(0, 0);
    this.mass = options.mass || 1;
    this.radius = options.radius || 10;
    this.color = options.color || [100, 150, 255];
    this.t = 0;
    this.history = { t: [], x: [], y: [], vx: [], vy: [], E: [] };
  }

  applyForce(force: p5.Vector): void {
    const f = p5.Vector.div(force, this.mass);
    this.acc.add(f);
  }

  update(dt: number): void {
    // Velocity Verlet
    const velTerm = p5.Vector.mult(this.vel, dt);
    const accTerm = p5.Vector.mult(this.acc, 0.5 * dt * dt);
    this.pos.add(velTerm).add(accTerm);

    const avgAcc = p5.Vector.add(this.prevAcc, this.acc);
    avgAcc.mult(0.5 * dt);
    this.vel.add(avgAcc);

    this.record(dt);

    this.prevAcc = this.acc.copy();
    this.acc.set(0, 0);
  }

  record(dt: number): void {
    this.t += dt;
    this.history.t.push(this.t);
    this.history.x.push(this.pos.x);
    this.history.y.push(this.pos.y);
    this.history.vx.push(this.vel.x);
    this.history.vy.push(this.vel.y);
    this.history.E.push(0.5 * this.mass * this.vel.magSq());
  }

  display(): void {
    this.p.fill(...this.color);
    this.p.noStroke();
    this.p.ellipse(this.pos.x, this.pos.y, this.radius * 2);
  }

  reset(x: number, y: number): void {
    this.pos.set(x, y);
    this.vel.set(0, 0);
    this.acc.set(0, 0);
    this.t = 0;
    this.history = { t: [], x: [], y: [], vx: [], vy: [], E: [] };
  }
}
```

### core/Forces.ts

```typescript
import p5 from 'p5';
import { Particle } from './Particle';

export const Forces = {
  gravity(p: p5, particle: Particle, g: number = 9.8): p5.Vector {
    return p.createVector(0, particle.mass * g);
  },

  drag(p: p5, particle: Particle, b: number): p5.Vector {
    const force = particle.vel.copy();
    force.mult(-b);
    return force;
  },

  dragQuadratic(p: p5, particle: Particle, c: number): p5.Vector {
    const speed = particle.vel.mag();
    const force = particle.vel.copy();
    force.normalize();
    force.mult(-c * speed * speed);
    return force;
  },

  spring(p: p5, particle: Particle, anchor: p5.Vector, k: number, restLength: number = 0): p5.Vector {
    const force = p5.Vector.sub(anchor, particle.pos);
    const stretch = force.mag() - restLength;
    force.normalize();
    force.mult(k * stretch);
    return force;
  },

  friction(p: p5, particle: Particle, mu: number, normalForce: number): p5.Vector {
    if (particle.vel.mag() < 0.01) return p.createVector(0, 0);
    const force = particle.vel.copy();
    force.normalize();
    force.mult(-mu * normalForce);
    return force;
  }
};
```

### core/Graph.ts

```typescript
import p5 from 'p5';

export interface GraphOptions {
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  type?: string;
  label?: string;
  color?: [number, number, number];
  maxPoints?: number;
}

export class Graph {
  p: p5;
  x: number;
  y: number;
  w: number;
  h: number;
  type: string;
  label: string;
  color: [number, number, number];
  maxPoints: number;
  data: number[];

  constructor(p: p5, options: GraphOptions = {}) {
    this.p = p;
    this.x = options.x || 0;
    this.y = options.y || 0;
    this.w = options.w || 200;
    this.h = options.h || 150;
    this.type = options.type || 'v-t';
    this.label = options.label || this.type;
    this.color = options.color || [255, 100, 100];
    this.maxPoints = options.maxPoints || 500;
    this.data = [];
  }

  record(particle: any): void {
    let value: number;
    switch (this.type) {
      case 'v-t':
        value = particle.vel.mag();
        break;
      case 'vx-t':
        value = particle.vel.x;
        break;
      case 'vy-t':
        value = particle.vel.y;
        break;
      case 'x-t':
        value = particle.pos.x;
        break;
      case 'y-t':
        value = particle.pos.y;
        break;
      default:
        value = 0;
    }
    
    this.data.push(value);
    if (this.data.length > this.maxPoints) {
      this.data.shift();
    }
  }

  display(): void {
    const p = this.p;

    p.fill(255);
    p.stroke(200);
    p.rect(this.x, this.y, this.w, this.h);

    p.fill(0);
    p.noStroke();
    p.textSize(12);
    p.text(this.label, this.x + 5, this.y - 5);

    if (this.data.length < 2) return;

    let minVal = Math.min(...this.data);
    let maxVal = Math.max(...this.data);
    if (maxVal - minVal < 0.1) {
      minVal -= 0.5;
      maxVal += 0.5;
    }

    p.stroke(...this.color);
    p.strokeWeight(1.5);
    p.noFill();
    p.beginShape();
    for (let i = 0; i < this.data.length; i++) {
      const px = p.map(i, 0, this.data.length - 1, this.x + 10, this.x + this.w - 10);
      const py = p.map(this.data[i], minVal, maxVal, this.y + this.h - 10, this.y + 10);
      p.vertex(px, py);
    }
    p.endShape();
    p.strokeWeight(1);
  }

  clear(): void {
    this.data = [];
  }
}
```

### core/index.ts

```typescript
export { Particle, type ParticleOptions } from './Particle';
export { Forces } from './Forces';
export { Graph, type GraphOptions } from './Graph';
```

## Step 3: 시뮬레이션 컴포넌트

### ProjectileMotion.astro

```astro
---
interface Props {
  id?: string;
  width?: number;
  height?: number;
}

const { id = 'projectile-sim', width = 800, height = 500 } = Astro.props;
---

<div id={id} class="simulation-container" data-width={width} data-height={height}>
  <div class="controls">
    <label>
      공기저항: <span class="air-value">0.10</span>
      <input type="range" class="air-slider" min="0" max="0.5" step="0.01" value="0.1" />
    </label>
    <button class="reset-btn">리셋 (R)</button>
  </div>
  <div class="canvas-wrapper"></div>
  <p class="instructions">공을 드래그하여 발사하세요</p>
</div>

<style>
  .simulation-container {
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 16px;
    background: #fafafa;
    margin: 20px 0;
  }
  
  .controls {
    display: flex;
    gap: 20px;
    align-items: center;
    margin-bottom: 10px;
    flex-wrap: wrap;
  }
  
  .controls label {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .reset-btn {
    padding: 6px 12px;
    border-radius: 4px;
    border: 1px solid #ccc;
    background: white;
    cursor: pointer;
  }
  
  .reset-btn:hover {
    background: #f0f0f0;
  }
  
  .canvas-wrapper {
    display: flex;
    justify-content: center;
  }
  
  .instructions {
    text-align: center;
    color: #666;
    margin-top: 10px;
    font-size: 14px;
  }
</style>

<script>
  import p5 from 'p5';
  import { Particle, Forces, Graph } from './core';

  document.querySelectorAll('.simulation-container').forEach((container) => {
    const id = container.id;
    const canvasWrapper = container.querySelector('.canvas-wrapper') as HTMLElement;
    const airSlider = container.querySelector('.air-slider') as HTMLInputElement;
    const airValue = container.querySelector('.air-value') as HTMLSpanElement;
    const resetBtn = container.querySelector('.reset-btn') as HTMLButtonElement;

    const sketch = (p: p5) => {
      let ball: Particle;
      let graphV: Graph;
      let graphY: Graph;
      let launched = false;
      let dragStart: { x: number; y: number } | null = null;

      const dt = 0.016;
      const g = 9.8;
      const scale = 50;

      p.setup = () => {
        const canvas = p.createCanvas(800, 400);
        canvas.parent(canvasWrapper);

        ball = new Particle(p, 80, p.height - 60, { mass: 1, radius: 12 });
        graphV = new Graph(p, { x: 580, y: 30, w: 200, h: 120, type: 'v-t', label: '속력-시간' });
        graphY = new Graph(p, { x: 580, y: 170, w: 200, h: 120, type: 'y-t', label: '높이-시간', color: [100, 100, 255] });
      };

      p.draw = () => {
        p.background(250);
        
        const airResistance = parseFloat(airSlider.value);

        if (launched) {
          ball.applyForce(Forces.gravity(p, ball, g * scale));
          ball.applyForce(Forces.dragQuadratic(p, ball, airResistance));
          ball.update(dt);

          if (ball.pos.y > p.height - 30) {
            ball.pos.y = p.height - 30;
            ball.vel.y *= -0.6;
            ball.vel.x *= 0.8;
          }

          graphV.record(ball);
          graphY.record(ball);
        }

        // 드래그 화살표
        if (dragStart) {
          p.stroke(150);
          p.strokeWeight(2);
          p.line(dragStart.x, dragStart.y, p.mouseX, p.mouseY);
        }

        // 바닥
        p.stroke(100);
        p.strokeWeight(1);
        p.line(0, p.height - 30, 550, p.height - 30);

        ball.display();
        graphV.display();
        graphY.display();
      };

      p.mousePressed = () => {
        if (p.dist(p.mouseX, p.mouseY, ball.pos.x, ball.pos.y) < 30 && !launched) {
          dragStart = { x: p.mouseX, y: p.mouseY };
        }
      };

      p.mouseReleased = () => {
        if (dragStart) {
          ball.vel.x = (dragStart.x - p.mouseX) * 0.5;
          ball.vel.y = (dragStart.y - p.mouseY) * 0.5;
          launched = true;
          dragStart = null;
        }
      };

      // 리셋 함수
      (window as any)[`reset_${id}`] = () => {
        ball.reset(80, p.height - 60);
        graphV.clear();
        graphY.clear();
        launched = false;
      };
    };

    new p5(sketch);

    // 이벤트 리스너
    airSlider.addEventListener('input', () => {
      airValue.textContent = parseFloat(airSlider.value).toFixed(2);
    });

    resetBtn.addEventListener('click', () => {
      (window as any)[`reset_${id}`]?.();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'r' || e.key === 'R') {
        (window as any)[`reset_${id}`]?.();
      }
    });
  });
</script>
```

## Step 4: MDX에서 사용

```mdx
---
title: 포물선 운동 시뮬레이션
description: 공기저항이 있는 포물선 운동
---
import ProjectileMotion from '../../components/simulations/ProjectileMotion.astro';

# 포물선 운동

공기저항이 운동에 미치는 영향을 확인해보세요.

<ProjectileMotion />

## 물리학적 배경

공기저항력: $F_d = -cv^2$

운동 방정식:
$$
m\frac{dv}{dt} = mg - cv^2
$$
```

## Step 5: Astro 설정

```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

export default defineConfig({
  integrations: [mdx()],
  vite: {
    optimizeDeps: {
      include: ['p5']
    },
    ssr: {
      noExternal: ['p5']
    }
  }
});
```

## 팁

### 1. Client-only 렌더링

p5.js는 브라우저에서만 동작합니다. SSR 문제 시:

```astro
<script>
  // client:only로 동작
  if (typeof window !== 'undefined') {
    import('p5').then(({ default: p5 }) => {
      // 스케치 코드
    });
  }
</script>
```

### 2. 반응형 캔버스

```javascript
p.windowResized = () => {
  const container = document.getElementById('sim-container');
  p.resizeCanvas(container.clientWidth, 400);
};
```

### 3. 여러 시뮬레이션 독립 실행

각 컴포넌트에 고유 ID 부여:

```astro
<ProjectileMotion id="sim-1" />
<SpringOscillation id="sim-2" />
```
