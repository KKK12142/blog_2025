# 물리 시뮬레이션 예시

## 1. 포물선 운동 (공기저항 포함)

```javascript
const sketch = (p) => {
  let ball;
  let graph_v, graph_y;
  let airSlider;
  let launched = false;
  let dragStart = null;
  
  const dt = 0.016;
  const g = 9.8;
  const scale = 50;  // 픽셀/미터

  p.setup = () => {
    p.createCanvas(800, 500);
    
    ball = new Particle(p, 80, p.height - 80, { mass: 1, radius: 12 });
    
    graph_v = new Graph(p, { x: 600, y: 30, w: 180, h: 120, type: 'v-t', label: '속력-시간' });
    graph_y = new Graph(p, { x: 600, y: 180, w: 180, h: 120, type: 'y-t', label: '높이-시간', color: [100, 100, 255] });
    
    // 슬라이더
    p.createSpan('공기저항: ').position(20, p.height + 10);
    airSlider = p.createSlider(0, 0.5, 0.1, 0.01);
    airSlider.position(100, p.height + 10);
  };

  p.draw = () => {
    p.background(250);
    
    let airResistance = airSlider.value();
    
    if (launched) {
      // 힘 적용
      ball.applyForce(Forces.gravity(p, ball, g * scale));
      ball.applyForce(Forces.dragQuadratic(p, ball, airResistance));
      
      ball.update(dt);
      
      // 바닥 충돌
      if (ball.pos.y > p.height - 30) {
        ball.pos.y = p.height - 30;
        ball.vel.y *= -0.6;
        ball.vel.x *= 0.8;
      }
      
      graph_v.record(ball);
      graph_y.record({ ...ball, pos: { x: ball.pos.x, y: (p.height - 30 - ball.pos.y) / scale }, vel: ball.vel, t: ball.t, mass: ball.mass });
    }
    
    // 드래그 표시
    if (dragStart) {
      p.stroke(150);
      p.strokeWeight(2);
      p.line(dragStart.x, dragStart.y, p.mouseX, p.mouseY);
      
      let power = p.dist(dragStart.x, dragStart.y, p.mouseX, p.mouseY);
      p.fill(0);
      p.noStroke();
      p.text(`발사 세기: ${(power * 0.5).toFixed(1)} m/s`, 20, 30);
    }
    
    // 바닥
    p.stroke(100);
    p.strokeWeight(1);
    p.line(0, p.height - 30, p.width, p.height - 30);
    
    ball.display();
    graph_v.display();
    graph_y.display();
    
    // UI
    p.fill(0);
    p.noStroke();
    p.text(`공기저항 계수: ${airResistance.toFixed(2)}`, 20, 50);
    p.text('공을 드래그하여 발사 (r: 리셋)', 20, 70);
  };

  p.mousePressed = () => {
    let d = p.dist(p.mouseX, p.mouseY, ball.pos.x, ball.pos.y);
    if (d < 30 && !launched) {
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

  p.keyPressed = () => {
    if (p.key === 'r') {
      ball.pos.set(80, p.height - 80);
      ball.vel.set(0, 0);
      ball.t = 0;
      ball.history = { t: [], x: [], y: [], vx: [], vy: [], E: [] };
      graph_v.clear();
      graph_y.clear();
      launched = false;
    }
  };
};
```

## 2. 단진동 (용수철)

```javascript
const sketch = (p) => {
  let ball;
  let anchor;
  let graph_x, graph_v, graph_E;
  let kSlider;
  
  const dt = 0.016;
  const restLength = 100;

  p.setup = () => {
    p.createCanvas(900, 500);
    
    anchor = p.createVector(200, p.height / 2);
    ball = new Particle(p, 350, p.height / 2, { mass: 1, radius: 15 });
    
    graph_x = new Graph(p, { x: 450, y: 30, w: 200, h: 130, type: 'custom', label: 'x-t (변위)', color: [100, 150, 255] });
    graph_v = new Graph(p, { x: 450, y: 180, w: 200, h: 130, type: 'custom', label: 'v-t (속도)', color: [255, 100, 100] });
    graph_E = new Graph(p, { x: 680, y: 30, w: 200, h: 130, type: 'custom', label: 'E-t (에너지)', color: [100, 200, 100] });
    
    p.createSpan('용수철 상수 k: ').position(20, p.height + 10);
    kSlider = p.createSlider(10, 200, 50, 1);
    kSlider.position(130, p.height + 10);
  };

  p.draw = () => {
    p.background(250);
    
    let k = kSlider.value();
    
    // 용수철 힘: F = -kx
    let springForce = Forces.spring(p, ball, anchor, k, restLength);
    ball.applyForce(springForce);
    
    ball.update(dt);
    
    // 변위 (평형점에서의 거리)
    let displacement = ball.pos.x - (anchor.x + restLength);
    
    // 에너지
    let KE = 0.5 * ball.mass * ball.vel.magSq();
    let PE = 0.5 * k * displacement * displacement;
    let totalE = KE + PE;
    
    // 그래프 기록
    graph_x.data.push(displacement);
    graph_v.data.push(ball.vel.x);
    graph_E.data.push(totalE);
    
    if (graph_x.data.length > 500) {
      graph_x.data.shift();
      graph_v.data.shift();
      graph_E.data.shift();
    }
    
    // 용수철 그리기
    drawSpring(p, anchor.x, anchor.y, ball.pos.x - ball.radius, ball.pos.y, 10);
    
    // 앵커
    p.fill(100);
    p.rect(anchor.x - 10, anchor.y - 30, 10, 60);
    
    // 평형점 표시
    p.stroke(200);
    p.strokeWeight(1);
    p.line(anchor.x + restLength, anchor.y - 50, anchor.x + restLength, anchor.y + 50);
    p.fill(150);
    p.noStroke();
    p.text('평형점', anchor.x + restLength - 15, anchor.y + 70);
    
    ball.display();
    
    graph_x.display();
    graph_v.display();
    graph_E.display();
    
    // 에너지 바
    drawEnergyBar(p, 20, 400, 150, 20, KE, PE);
    
    // 정보
    p.fill(0);
    p.noStroke();
    p.text(`k = ${k} N/m`, 20, 30);
    p.text(`변위: ${displacement.toFixed(1)} px`, 20, 50);
    p.text(`속도: ${ball.vel.x.toFixed(1)} px/s`, 20, 70);
    p.text(`주기 T = 2π√(m/k) = ${(2 * Math.PI * Math.sqrt(ball.mass / k)).toFixed(2)} s`, 20, 90);
    p.text('드래그하여 당기기 (r: 리셋)', 20, 120);
  };

  // 드래그 로직
  let dragger = new Dragger(p);
  
  p.mousePressed = () => {
    dragger.particles = [ball];
    dragger.mousePressed();
  };
  
  p.mouseDragged = () => dragger.mouseDragged();
  p.mouseReleased = () => dragger.mouseReleased();

  p.keyPressed = () => {
    if (p.key === 'r') {
      ball.pos.set(350, p.height / 2);
      ball.vel.set(0, 0);
      graph_x.clear();
      graph_v.clear();
      graph_E.clear();
    }
  };
};

// 용수철 그리기 헬퍼
function drawSpring(p, x1, y1, x2, y2, coils) {
  let len = p.dist(x1, y1, x2, y2);
  let angle = p.atan2(y2 - y1, x2 - x1);
  
  p.push();
  p.translate(x1, y1);
  p.rotate(angle);
  
  p.stroke(80);
  p.strokeWeight(2);
  p.noFill();
  
  p.beginShape();
  p.vertex(0, 0);
  for (let i = 0; i < coils; i++) {
    let x = p.map(i + 0.25, 0, coils, 10, len - 10);
    let y = (i % 2 === 0) ? 10 : -10;
    p.vertex(x, y);
  }
  p.vertex(len, 0);
  p.endShape();
  
  p.pop();
}

// 에너지 바 헬퍼
function drawEnergyBar(p, x, y, w, h, KE, PE) {
  let total = KE + PE;
  if (total === 0) return;
  
  let keWidth = (KE / total) * w;
  
  p.noStroke();
  p.fill(255, 100, 100);
  p.rect(x, y, keWidth, h);
  
  p.fill(100, 100, 255);
  p.rect(x + keWidth, y, w - keWidth, h);
  
  p.fill(0);
  p.textSize(10);
  p.text('KE', x + 5, y + 14);
  p.text('PE', x + w - 25, y + 14);
}
```

## 3. 단진자

```javascript
const sketch = (p) => {
  let angle, angleVel, angleAcc;
  let length = 200;
  let origin;
  let graph_theta, graph_omega, graph_E;
  let gSlider, dampSlider;
  
  const dt = 0.016;
  const mass = 1;

  p.setup = () => {
    p.createCanvas(900, 550);
    origin = p.createVector(250, 50);
    
    angle = p.PI / 4;  // 초기 각도
    angleVel = 0;
    angleAcc = 0;
    
    graph_theta = new Graph(p, { x: 500, y: 30, w: 180, h: 130, type: 'custom', label: 'θ-t', color: [100, 150, 255] });
    graph_omega = new Graph(p, { x: 500, y: 180, w: 180, h: 130, type: 'custom', label: 'ω-t', color: [255, 100, 100] });
    graph_E = new Graph(p, { x: 700, y: 30, w: 180, h: 130, type: 'custom', label: 'E-t', color: [100, 200, 100] });
    
    p.createSpan('중력가속도 g: ').position(20, p.height + 10);
    gSlider = p.createSlider(1, 20, 9.8, 0.1);
    gSlider.position(120, p.height + 10);
    
    p.createSpan('감쇠 계수: ').position(250, p.height + 10);
    dampSlider = p.createSlider(0, 0.5, 0, 0.01);
    dampSlider.position(340, p.height + 10);
  };

  p.draw = () => {
    p.background(250);
    
    let g = gSlider.value();
    let damping = dampSlider.value();
    
    // 운동 방정식: θ'' = -(g/L)sin(θ) - b*θ'
    angleAcc = (-g / length) * p.sin(angle) - damping * angleVel;
    
    // Velocity Verlet for angular motion
    angle += angleVel * dt + 0.5 * angleAcc * dt * dt;
    let newAngleAcc = (-g / length) * p.sin(angle) - damping * angleVel;
    angleVel += 0.5 * (angleAcc + newAngleAcc) * dt;
    
    // 위치 계산
    let bobX = origin.x + length * p.sin(angle);
    let bobY = origin.y + length * p.cos(angle);
    
    // 에너지
    let h = length * (1 - p.cos(angle));
    let v = length * angleVel;
    let KE = 0.5 * mass * v * v;
    let PE = mass * g * h;
    
    // 그래프 기록
    graph_theta.data.push(angle);
    graph_omega.data.push(angleVel);
    graph_E.data.push(KE + PE);
    
    if (graph_theta.data.length > 500) {
      graph_theta.data.shift();
      graph_omega.data.shift();
      graph_E.data.shift();
    }
    
    // 그리기
    p.stroke(100);
    p.strokeWeight(3);
    p.line(origin.x, origin.y, bobX, bobY);
    
    p.fill(200, 100, 100);
    p.noStroke();
    p.ellipse(bobX, bobY, 40, 40);
    
    // 피벗
    p.fill(50);
    p.rect(origin.x - 5, origin.y - 5, 10, 10);
    
    // 기준선
    p.stroke(200);
    p.strokeWeight(1);
    p.line(origin.x, origin.y, origin.x, origin.y + length + 50);
    
    graph_theta.display();
    graph_omega.display();
    graph_E.display();
    
    // 에너지 바
    drawEnergyBar(p, 50, 450, 150, 20, KE, PE);
    
    // 정보
    p.fill(0);
    p.noStroke();
    p.text(`g = ${g.toFixed(1)} m/s²`, 20, 30);
    p.text(`감쇠 = ${damping.toFixed(2)}`, 20, 50);
    p.text(`θ = ${(angle * 180 / p.PI).toFixed(1)}°`, 20, 70);
    p.text(`ω = ${angleVel.toFixed(2)} rad/s`, 20, 90);
    p.text(`주기 T ≈ 2π√(L/g) = ${(2 * Math.PI * Math.sqrt(length / g)).toFixed(2)} s`, 20, 110);
    p.text('추를 드래그하여 각도 설정 (r: 리셋)', 20, 140);
  };

  // 드래그로 각도 설정
  let dragging = false;
  
  p.mousePressed = () => {
    let bobX = origin.x + length * p.sin(angle);
    let bobY = origin.y + length * p.cos(angle);
    if (p.dist(p.mouseX, p.mouseY, bobX, bobY) < 30) {
      dragging = true;
    }
  };
  
  p.mouseDragged = () => {
    if (dragging) {
      angle = p.atan2(p.mouseX - origin.x, p.mouseY - origin.y);
      angleVel = 0;
    }
  };
  
  p.mouseReleased = () => {
    dragging = false;
  };

  p.keyPressed = () => {
    if (p.key === 'r') {
      angle = p.PI / 4;
      angleVel = 0;
      graph_theta.clear();
      graph_omega.clear();
      graph_E.clear();
    }
  };
};
```

## 4. 행성 운동 (만유인력)

```javascript
const sketch = (p) => {
  let sun, planet;
  let graph_E;
  let trail = [];
  
  const dt = 0.5;
  const G = 100;

  p.setup = () => {
    p.createCanvas(800, 600);
    
    sun = new Particle(p, p.width / 2, p.height / 2, { mass: 1000, radius: 30, color: [255, 200, 50] });
    planet = new Particle(p, p.width / 2 + 150, p.height / 2, { mass: 10, radius: 10, color: [100, 150, 255] });
    
    // 초기 속도 (원운동 조건 근사)
    let r = 150;
    let v = Math.sqrt(G * sun.mass / r);
    planet.vel.set(0, -v * 0.8);  // 타원 궤도
    
    graph_E = new Graph(p, { x: 600, y: 30, w: 180, h: 130, type: 'custom', label: '역학적 에너지', color: [100, 200, 100] });
  };

  p.draw = () => {
    p.background(20);
    
    // 만유인력
    let gravForce = Forces.gravitational(p, planet, sun, G);
    planet.applyForce(gravForce);
    
    planet.update(dt);
    
    // 궤적 저장
    trail.push({ x: planet.pos.x, y: planet.pos.y });
    if (trail.length > 1000) trail.shift();
    
    // 에너지 계산
    let r = p.dist(planet.pos.x, planet.pos.y, sun.pos.x, sun.pos.y);
    let KE = 0.5 * planet.mass * planet.vel.magSq();
    let PE = -G * sun.mass * planet.mass / r;
    
    graph_E.data.push(KE + PE);
    if (graph_E.data.length > 500) graph_E.data.shift();
    
    // 궤적 그리기
    p.noFill();
    p.stroke(100, 150, 255, 100);
    p.beginShape();
    for (let pt of trail) {
      p.vertex(pt.x, pt.y);
    }
    p.endShape();
    
    // 태양
    p.fill(...sun.color);
    p.noStroke();
    p.ellipse(sun.pos.x, sun.pos.y, sun.radius * 2);
    
    // 행성
    p.fill(...planet.color);
    p.ellipse(planet.pos.x, planet.pos.y, planet.radius * 2);
    
    graph_E.display();
    
    // 정보
    p.fill(255);
    p.text(`거리: ${r.toFixed(0)} px`, 20, 30);
    p.text(`속력: ${planet.vel.mag().toFixed(1)} px/s`, 20, 50);
    p.text(`KE: ${KE.toFixed(0)}`, 20, 70);
    p.text(`PE: ${PE.toFixed(0)}`, 20, 90);
    p.text(`E: ${(KE + PE).toFixed(0)} (보존됨)`, 20, 110);
  };

  p.keyPressed = () => {
    if (p.key === 'r') {
      planet.pos.set(p.width / 2 + 150, p.height / 2);
      let r = 150;
      let v = Math.sqrt(G * sun.mass / r);
      planet.vel.set(0, -v * 0.8);
      trail = [];
      graph_E.clear();
    }
  };
};
```

## 5. 경사면 운동

```javascript
const sketch = (p) => {
  let ball;
  let graph_v, graph_E;
  let angleSlider, frictionSlider;
  
  const dt = 0.016;
  const g = 9.8;
  const scale = 50;

  p.setup = () => {
    p.createCanvas(800, 500);
    
    resetBall();
    
    graph_v = new Graph(p, { x: 580, y: 30, w: 200, h: 130, type: 'v-t', label: '속력-시간' });
    graph_E = new Graph(p, { x: 580, y: 180, w: 200, h: 130, type: 'custom', label: '에너지', color: [100, 200, 100] });
    
    p.createSpan('경사각 θ: ').position(20, p.height + 10);
    angleSlider = p.createSlider(10, 60, 30, 1);
    angleSlider.position(100, p.height + 10);
    
    p.createSpan('마찰계수 μ: ').position(220, p.height + 10);
    frictionSlider = p.createSlider(0, 0.5, 0.1, 0.01);
    frictionSlider.position(310, p.height + 10);
  };

  function resetBall() {
    ball = new Particle(p, 100, 100, { mass: 1, radius: 15 });
  }

  p.draw = () => {
    p.background(250);
    
    let theta = angleSlider.value() * p.PI / 180;
    let mu = frictionSlider.value();
    
    // 경사면 그리기
    let inclineLength = 400;
    let x1 = 50, y1 = 400;
    let x2 = x1 + inclineLength * p.cos(theta);
    let y2 = y1 - inclineLength * p.sin(theta);
    
    p.fill(200, 180, 150);
    p.noStroke();
    p.triangle(x1, y1, x2, y2, x2, y1);
    
    p.stroke(100);
    p.strokeWeight(2);
    p.line(x1, y1, x2, y2);
    
    // 힘 계산 (경사면 좌표계)
    // 경사면 방향: 아래로 양수
    let gParallel = g * p.sin(theta) * scale;  // mg sin(θ)
    let gPerpendicular = g * p.cos(theta) * scale;  // mg cos(θ)
    let friction = mu * gPerpendicular;  // μN = μmg cos(θ)
    
    // 순 가속도 (경사면 아래 방향)
    let netForce = gParallel - friction;
    if (netForce < 0) netForce = 0;  // 정지 마찰
    
    // 힘을 x, y 성분으로 변환
    let fx = netForce * p.cos(theta);
    let fy = netForce * p.sin(theta);
    ball.applyForce(p.createVector(fx, fy));
    
    ball.update(dt);
    
    // 경사면 위 위치 제한
    let ballOnIncline = constrainToIncline(ball, x1, y1, x2, y2);
    
    // 에너지
    let height = (y1 - ball.pos.y) / scale;
    let KE = 0.5 * ball.mass * ball.vel.magSq() / (scale * scale);
    let PE = ball.mass * g * height;
    
    graph_v.record(ball);
    graph_E.data.push(KE + PE);
    if (graph_E.data.length > 500) graph_E.data.shift();
    
    ball.display();
    
    // 힘 벡터 표시
    drawForceArrow(p, ball.pos.x, ball.pos.y, 0, 30, [255, 0, 0], 'mg');
    drawForceArrow(p, ball.pos.x, ball.pos.y, 30 * p.cos(theta), 30 * p.sin(theta), [0, 0, 255], 'mgsinθ');
    
    graph_v.display();
    graph_E.display();
    
    // 정보
    p.fill(0);
    p.noStroke();
    p.text(`θ = ${angleSlider.value()}°`, 20, 30);
    p.text(`μ = ${mu.toFixed(2)}`, 20, 50);
    p.text(`gsinθ = ${(g * p.sin(theta)).toFixed(2)} m/s²`, 20, 70);
    p.text(`μgcosθ = ${(mu * g * p.cos(theta)).toFixed(2)} m/s²`, 20, 90);
    p.text(`순가속도 = ${(g * (p.sin(theta) - mu * p.cos(theta))).toFixed(2)} m/s²`, 20, 110);
  };

  function constrainToIncline(ball, x1, y1, x2, y2) {
    // 경사면 위로 제한 (간단한 구현)
    let t = (ball.pos.x - x1) / (x2 - x1);
    t = p.constrain(t, 0, 1);
    let inclineY = y1 - t * (y1 - y2);
    
    if (ball.pos.y > inclineY - ball.radius) {
      ball.pos.y = inclineY - ball.radius;
    }
  }

  function drawForceArrow(p, x, y, dx, dy, color, label) {
    p.stroke(...color);
    p.strokeWeight(2);
    p.line(x, y, x + dx, y + dy);
    p.fill(...color);
    p.noStroke();
    p.text(label, x + dx + 5, y + dy);
  }

  p.keyPressed = () => {
    if (p.key === 'r') {
      resetBall();
      graph_v.clear();
      graph_E.clear();
    }
  };
};
```
