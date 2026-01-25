---
name: p5-physics-simulation
description: p5.js 기반 물리학 교육용 시뮬레이션 제작. Nature of Code 패턴 + Verlet 적분 + 실시간 그래프. 포물선 운동, 단진동, 진자, 용수철, 충돌 시뮬레이션을 만들거나 Astro 블로그에 임베딩할 때 사용.
---

# p5.js Physics Simulation

Nature of Code 패턴을 기반으로 물리학 교육용 시뮬레이션을 제작합니다.

## 핵심 원칙

1. **물리 공식이 코드에 보여야 함** - 블랙박스 물리엔진 사용 금지
2. **Verlet 적분** - 에너지 보존을 위해 Symplectic Euler 또는 Velocity Verlet 사용
3. **실시간 그래프** - v-t, s-t, E-t 그래프로 물리량 시각화
4. **인터랙션** - 드래그, 슬라이더로 파라미터 조절

## Quick Start

```javascript
import p5 from 'p5';

const sketch = (p) => {
  let ball;
  let graph;
  const dt = 0.016;
  const g = 9.8;
  const airResistance = 0.1;

  p.setup = () => {
    p.createCanvas(800, 500);
    ball = new Particle(p, 100, 100, { mass: 1 });
    graph = new Graph(p, { x: 600, y: 50, w: 180, h: 150, type: 'v-t' });
  };

  p.draw = () => {
    p.background(250);

    // 힘 적용 - 공식이 그대로 보임!
    ball.applyForce(Forces.gravity(p, ball, g));
    ball.applyForce(Forces.drag(p, ball, airResistance));

    ball.update(dt);
    ball.display();

    graph.record(ball);
    graph.display();
  };
};

new p5(sketch);
```

## 핵심 클래스

### 1. Particle (입자)

```javascript
class Particle {
  constructor(p, x, y, options = {}) {
    this.p = p;
    this.pos = p.createVector(x, y);
    this.vel = p.createVector(0, 0);
    this.acc = p.createVector(0, 0);
    this.mass = options.mass || 1;
    this.radius = options.radius || 10;
    this.color = options.color || [100, 150, 255];
    
    // 이전 가속도 (Verlet용)
    this.prevAcc = p.createVector(0, 0);
    
    // 기록 (그래프용)
    this.history = { t: [], x: [], y: [], vx: [], vy: [], E: [] };
    this.t = 0;
  }

  applyForce(force) {
    // F = ma → a = F/m
    let f = p5.Vector.div(force, this.mass);
    this.acc.add(f);
  }

  // Velocity Verlet 적분
  update(dt) {
    // 1. 위치 업데이트
    let velTerm = p5.Vector.mult(this.vel, dt);
    let accTerm = p5.Vector.mult(this.acc, 0.5 * dt * dt);
    this.pos.add(velTerm).add(accTerm);

    // 2. 속도 업데이트 (평균 가속도)
    let avgAcc = p5.Vector.add(this.prevAcc, this.acc);
    avgAcc.mult(0.5 * dt);
    this.vel.add(avgAcc);

    // 3. 기록
    this.record(dt);

    // 4. 다음 프레임 준비
    this.prevAcc = this.acc.copy();
    this.acc.set(0, 0);
  }

  record(dt) {
    this.t += dt;
    this.history.t.push(this.t);
    this.history.x.push(this.pos.x);
    this.history.y.push(this.pos.y);
    this.history.vx.push(this.vel.x);
    this.history.vy.push(this.vel.y);
    
    // 운동에너지
    let KE = 0.5 * this.mass * this.vel.magSq();
    this.history.E.push(KE);
  }

  display() {
    this.p.fill(...this.color);
    this.p.noStroke();
    this.p.ellipse(this.pos.x, this.pos.y, this.radius * 2);
  }
}
```

### 2. Forces (힘 함수들)

```javascript
const Forces = {
  // 중력: F = mg
  gravity(p, particle, g = 9.8) {
    return p.createVector(0, particle.mass * g);
  },

  // 선형 공기저항: F = -bv
  drag(p, particle, b) {
    let force = particle.vel.copy();
    force.mult(-b);
    return force;
  },

  // 이차 공기저항: F = -c|v|v
  dragQuadratic(p, particle, c) {
    let speed = particle.vel.mag();
    let force = particle.vel.copy();
    force.normalize();
    force.mult(-c * speed * speed);
    return force;
  },

  // 용수철: F = -k(x - x₀)
  spring(p, particle, anchor, k, restLength = 0) {
    let force = p5.Vector.sub(anchor, particle.pos);
    let stretch = force.mag() - restLength;
    force.normalize();
    force.mult(k * stretch);
    return force;
  },

  // 마찰력: F = -μN (운동 방향 반대)
  friction(p, particle, mu, normalForce) {
    if (particle.vel.mag() < 0.01) return p.createVector(0, 0);
    let force = particle.vel.copy();
    force.normalize();
    force.mult(-mu * normalForce);
    return force;
  },

  // 만유인력: F = GMm/r²
  gravitational(p, particle1, particle2, G = 1) {
    let force = p5.Vector.sub(particle2.pos, particle1.pos);
    let distance = p.constrain(force.mag(), 5, 500);
    force.normalize();
    let strength = (G * particle1.mass * particle2.mass) / (distance * distance);
    force.mult(strength);
    return force;
  }
};
```

### 3. Graph (그래프)

```javascript
class Graph {
  constructor(p, options = {}) {
    this.p = p;
    this.x = options.x || 0;
    this.y = options.y || 0;
    this.w = options.w || 200;
    this.h = options.h || 150;
    this.type = options.type || 'v-t';  // 'v-t', 's-t', 'E-t', 'phase'
    this.maxPoints = options.maxPoints || 500;
    this.data = [];
    this.timeData = [];
    this.color = options.color || [255, 100, 100];
    this.label = options.label || this.type;
  }

  record(particle) {
    let value;
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
      case 's-t':
      case 'x-t':
        value = particle.pos.x;
        break;
      case 'y-t':
        value = particle.pos.y;
        break;
      case 'E-t':
        value = 0.5 * particle.mass * particle.vel.magSq();
        break;
    }
    
    this.data.push(value);
    this.timeData.push(particle.t);
    
    if (this.data.length > this.maxPoints) {
      this.data.shift();
      this.timeData.shift();
    }
  }

  display() {
    const p = this.p;
    
    // 배경
    p.fill(255);
    p.stroke(200);
    p.rect(this.x, this.y, this.w, this.h);

    // 라벨
    p.fill(0);
    p.noStroke();
    p.textSize(12);
    p.text(this.label, this.x + 5, this.y - 5);

    if (this.data.length < 2) return;

    // 데이터 범위
    let minVal = Math.min(...this.data);
    let maxVal = Math.max(...this.data);
    if (maxVal - minVal < 0.1) {
      minVal -= 0.5;
      maxVal += 0.5;
    }

    // 축
    p.stroke(150);
    p.line(this.x + 30, this.y + this.h - 20, this.x + this.w - 10, this.y + this.h - 20);
    p.line(this.x + 30, this.y + 10, this.x + 30, this.y + this.h - 20);

    // 데이터 플롯
    p.stroke(...this.color);
    p.strokeWeight(1.5);
    p.noFill();
    p.beginShape();
    for (let i = 0; i < this.data.length; i++) {
      let px = p.map(i, 0, this.data.length - 1, this.x + 35, this.x + this.w - 15);
      let py = p.map(this.data[i], minVal, maxVal, this.y + this.h - 25, this.y + 15);
      p.vertex(px, py);
    }
    p.endShape();
    p.strokeWeight(1);

    // Y축 라벨
    p.fill(0);
    p.noStroke();
    p.textSize(10);
    p.text(maxVal.toFixed(1), this.x + 2, this.y + 20);
    p.text(minVal.toFixed(1), this.x + 2, this.y + this.h - 25);
  }

  clear() {
    this.data = [];
    this.timeData = [];
  }
}
```

### 4. Dragger (드래그 인터랙션)

```javascript
class Dragger {
  constructor(p) {
    this.p = p;
    this.dragging = null;
    this.offset = null;
  }

  register(particles) {
    this.particles = Array.isArray(particles) ? particles : [particles];
  }

  mousePressed() {
    for (let particle of this.particles) {
      let d = this.p.dist(this.p.mouseX, this.p.mouseY, particle.pos.x, particle.pos.y);
      if (d < particle.radius + 10) {
        this.dragging = particle;
        this.offset = p5.Vector.sub(particle.pos, this.p.createVector(this.p.mouseX, this.p.mouseY));
        break;
      }
    }
  }

  mouseDragged() {
    if (this.dragging) {
      this.dragging.pos.x = this.p.mouseX + this.offset.x;
      this.dragging.pos.y = this.p.mouseY + this.offset.y;
      this.dragging.vel.set(0, 0);
    }
  }

  mouseReleased() {
    this.dragging = null;
  }
}
```

## 적분 방법 선택

| 방법 | 사용 시점 | 에너지 보존 |
|------|----------|-------------|
| Symplectic Euler | 간단한 시뮬레이션, 비보존계 | 보통 |
| Velocity Verlet | 단진동, 진자, 행성 운동 | 우수 |

```javascript
// Symplectic Euler (간단)
update_symplectic(dt) {
  this.vel.add(p5.Vector.mult(this.acc, dt));
  this.pos.add(p5.Vector.mult(this.vel, dt));
  this.acc.set(0, 0);
}

// Velocity Verlet (정확)
update_verlet(dt) {
  // 위 Particle 클래스 참조
}
```

## 작업 흐름

### Step 1: 요구사항 파악

- 어떤 운동인가? (포물선, 단진동, 진자, 충돌...)
- 어떤 힘이 작용하나? (중력, 공기저항, 용수철력...)
- 어떤 그래프가 필요한가? (v-t, s-t, E-t...)
- 조절할 파라미터는? (질량, 저항 계수, 초기 속도...)

### Step 2: 코드 작성

1. Particle 생성
2. Forces 적용 (draw 루프에서)
3. Graph 연결
4. UI 추가 (슬라이더, 버튼)

### Step 3: Astro 임베딩

[references/astro-integration.md](references/astro-integration.md) 참조

## 예시

전체 예시는 [references/examples.md](references/examples.md) 참조.

## 체크리스트

- [ ] 물리 공식이 코드에 명시적으로 보임
- [ ] Verlet 적분 사용 (에너지 보존 필요시)
- [ ] 그래프가 물리량 변화를 보여줌
- [ ] 드래그/슬라이더로 인터랙션 가능
- [ ] 파라미터 조절 시 즉시 반영
