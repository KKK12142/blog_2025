import React from 'react';
import P5Canvas from '../P5Canvas';

/**
 * Torque Simulation - 돌림힘 시뮬레이션
 *
 * 물리 공식:
 * - τ = r × F (돌림힘 = 회전반경 × 힘)
 * - τ = I × α (돌림힘 = 관성모멘트 × 각가속도)
 * - α = τ / I
 * - ω = ω₀ + α × dt
 * - θ = θ₀ + ω × dt
 */

class RigidBody {
  constructor(p, x, y, width, height, mass) {
    this.p = p;
    this.center = p.createVector(x, y);
    this.width = width;
    this.height = height;
    this.mass = mass;

    // 회전 운동 변수
    this.angle = 0;
    this.angularVelocity = 0;
    this.angularAcceleration = 0;

    // 관성 모멘트 (직사각형 막대: I = (1/12) * m * L²)
    this.momentOfInertia = (1/12) * this.mass * (this.width * this.width);

    // 이전 각가속도 (Verlet용)
    this.prevAngularAcc = 0;

    // 기록 (그래프용)
    this.history = {
      t: [],
      alpha: [],  // 각가속도
      omega: [],  // 각속도
      theta: [],  // 각도
      torque: []  // 돌림힘
    };
    this.t = 0;

    // 감쇠 (공기저항)
    this.damping = 1;
  }

  applyTorque(torque) {
    // τ = I × α → α = τ / I
    this.angularAcceleration += torque / this.momentOfInertia;
  }

  // Velocity Verlet for rotational motion
  update(dt) {
    // 1. 각도 업데이트
    this.angle += this.angularVelocity * dt + 0.5 * this.angularAcceleration * dt * dt;

    // 2. 각속도 업데이트 (평균 각가속도)
    let avgAngularAcc = (this.prevAngularAcc + this.angularAcceleration) * 0.5;
    this.angularVelocity += avgAngularAcc * dt;

    // 감쇠 적용
    this.angularVelocity *= this.damping;

    // 3. 기록
    this.record(dt);

    // 4. 다음 프레임 준비
    this.prevAngularAcc = this.angularAcceleration;
    this.angularAcceleration = 0;
  }

  record(dt) {
    this.t += dt;
    if (this.history.t.length > 500) {
      this.history.t.shift();
      this.history.alpha.shift();
      this.history.omega.shift();
      this.history.theta.shift();
      this.history.torque.shift();
    }
    this.history.t.push(this.t);
    this.history.alpha.push(this.angularAcceleration);
    this.history.omega.push(this.angularVelocity);
    this.history.theta.push(this.angle);
    this.history.torque.push(this.angularAcceleration * this.momentOfInertia);
  }

  display() {
    const p = this.p;
    p.push();
    p.translate(this.center.x, this.center.y);
    p.rotate(this.angle);

    // 막대
    p.fill(100, 150, 255);
    p.stroke(255);
    p.strokeWeight(3);
    p.rectMode(p.CENTER);
    p.rect(0, 0, this.width, this.height);

    // 중심축
    p.fill(255, 100, 100);
    p.noStroke();
    p.circle(0, 0, 18);

    // 방향 표시 (화살표)
    p.stroke(255, 200, 0);
    p.strokeWeight(4);
    p.line(0, 0, this.width / 2 - 15, 0);
    p.fill(255, 200, 0);
    p.noStroke();
    p.triangle(
      this.width / 2, 0,
      this.width / 2 - 15, -8,
      this.width / 2 - 15, 8
    );

    p.pop();
  }

  // 로컬 좌표를 월드 좌표로 변환
  localToWorld(localPos) {
    const p = this.p;
    let rotated = p.createVector(
      localPos.x * Math.cos(this.angle) - localPos.y * Math.sin(this.angle),
      localPos.x * Math.sin(this.angle) + localPos.y * Math.cos(this.angle)
    );
    let result = p.createVector(
      this.center.x + rotated.x,
      this.center.y + rotated.y
    );
    return result;
  }

  // 월드 좌표를 로컬 좌표로 변환
  worldToLocal(worldPos) {
    const p = this.p;
    let relative = p.createVector(
      worldPos.x - this.center.x,
      worldPos.y - this.center.y
    );
    return p.createVector(
      relative.x * Math.cos(-this.angle) - relative.y * Math.sin(-this.angle),
      relative.x * Math.sin(-this.angle) + relative.y * Math.cos(-this.angle)
    );
  }

  // 마우스가 막대 위에 있는지 확인 (여유 공간 추가)
  contains(x, y) {
    let local = this.worldToLocal(this.p.createVector(x, y));
    let margin = 3; // 클릭 판정 여유 공간
    return Math.abs(local.x) < this.width / 2 + margin &&
           Math.abs(local.y) < this.height / 2 + margin;
  }
}

class Graph {
  constructor(p, x, y, w, h, label, color) {
    this.p = p;
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.label = label;
    this.color = color;
    this.data = [];
  }

  record(value) {
    this.data.push(value);
    if (this.data.length > 200) {
      this.data.shift();
    }
  }

  display() {
    const p = this.p;

    // 배경
    p.fill(255, 255, 255, 230);
    p.stroke(200);
    p.strokeWeight(1);
    p.rect(this.x, this.y, this.w, this.h);

    // 라벨
    p.fill(0);
    p.noStroke();
    p.textSize(14);
    p.textAlign(p.LEFT, p.BOTTOM);
    p.text(this.label, this.x + 5, this.y + 20);

    if (this.data.length < 2) return;

    // 데이터 범위
    let minVal = Math.min(...this.data, 0);
    let maxVal = Math.max(...this.data, 0);
    if (Math.abs(maxVal - minVal) < 0.1) {
      minVal -= 0.5;
      maxVal += 0.5;
    }

    // 0선
    let zeroY = p.map(0, minVal, maxVal, this.y + this.h - 20, this.y + 30);
    p.stroke(150, 150, 150, 100);
    p.strokeWeight(1);
    p.line(this.x + 50, zeroY, this.x + this.w - 10, zeroY);

    // 데이터 플롯
    p.stroke(...this.color);
    p.strokeWeight(2);
    p.noFill();
    p.beginShape();
    for (let i = 0; i < this.data.length; i++) {
      let px = p.map(i, 0, this.data.length - 1, this.x + 55, this.x + this.w - 10);
      let py = p.map(this.data[i], minVal, maxVal, this.y + this.h - 20, this.y + 30);
      p.vertex(px, py);
    }
    p.endShape();
    p.strokeWeight(1);

    // Y축 라벨
    p.fill(0);
    p.noStroke();
    p.textSize(11);
    p.textAlign(p.RIGHT, p.CENTER);
    p.text(maxVal.toFixed(2), this.x + 48, this.y + 30);
    p.text(minVal.toFixed(2), this.x + 48, this.y + this.h - 20);

    // 현재 값
    p.textAlign(p.LEFT, p.TOP);
    p.textSize(13);
    p.fill(...this.color);
    let currentVal = this.data[this.data.length - 1];
    p.text(currentVal.toFixed(3), this.x + this.w - 50, this.y + 5);
  }
}

const createSketch = (p) => {
  let rod;
  let graphs;
  let forcePoint = null;
  let forceVector = null;
  let dragging = false;
  let dragStart = null;

  const dt = 1/60;
  const forceScale = 0.3; // 힘 스케일 (시각화용)

  return {
    setup: () => {
      p.background(250);

      // 강체 막대 생성 (크기 증가)
      rod = new RigidBody(p, p.width / 2, p.height / 2, 300, 40, 5);

      // 그래프들 생성 (크기 증가, 왼쪽 여백 추가)
      graphs = {
        torque: new Graph(p, 60, 10, 220, 130, 'τ (N·m)', [255, 100, 100]),
        alpha: new Graph(p, 60, 150, 220, 130, 'α (rad/s²)', [100, 200, 100]),
        omega: new Graph(p, 60, 290, 220, 130, 'ω (rad/s)', [100, 150, 255])
      };
    },

    draw: () => {
      p.background(250);

      // 힘 적용
      if (forcePoint && forceVector) {
        // 월드 좌표에서의 힘 작용점
        let worldForcePoint = rod.localToWorld(forcePoint);

        // 회전축(중심)으로부터의 벡터
        let r = p.createVector(
          worldForcePoint.x - rod.center.x,
          worldForcePoint.y - rod.center.y
        );

        // 돌림힘: τ = r × F (2D에서는 스칼라)
        // τ = |r| × |F| × sin(θ) = r_x * F_y - r_y * F_x
        let torque = r.x * forceVector.y - r.y * forceVector.x;

        rod.applyTorque(torque);
      }

      // 업데이트
      rod.update(dt);
      rod.display();

      // 힘 벡터 표시
      if (forcePoint && forceVector) {
        let worldForcePoint = rod.localToWorld(forcePoint);

        // 힘 벡터
        p.push();
        p.stroke(255, 50, 50);
        p.strokeWeight(4);
        p.fill(255, 50, 50);
        let forceEnd = p.createVector(
          worldForcePoint.x + forceVector.x * forceScale,
          worldForcePoint.y + forceVector.y * forceScale
        );
        p.line(worldForcePoint.x, worldForcePoint.y, forceEnd.x, forceEnd.y);

        // 화살표
        let angle = forceVector.heading();
        p.push();
        p.translate(forceEnd.x, forceEnd.y);
        p.rotate(angle);
        p.triangle(0, 0, -15, -8, -15, 8);
        p.pop();

        // 작용점
        p.fill(255, 100, 100);
        p.noStroke();
        p.circle(worldForcePoint.x, worldForcePoint.y, 14);
        p.pop();

        // 회전 반경 표시
        p.push();
        p.stroke(0, 200, 255);  // 밝은 cyan
        p.strokeWeight(4);
        p.noFill();
        let r = p.createVector(
          worldForcePoint.x - rod.center.x,
          worldForcePoint.y - rod.center.y
        );

        // 유효 회전반경선
        p.line(rod.center.x, rod.center.y, worldForcePoint.x, worldForcePoint.y);

        // 회전반경 값 표시
        p.fill(0);
        p.noStroke();
        p.textSize(14);
        p.textAlign(p.CENTER, p.BOTTOM);
        p.text(`r = ${r.mag().toFixed(1)} px`,
          (rod.center.x + worldForcePoint.x) / 2,
          (rod.center.y + worldForcePoint.y) / 2 - 8);
        p.pop();
      }

      // 그래프 업데이트 및 표시
      graphs.torque.record(rod.history.torque[rod.history.torque.length - 1] || 0);
      graphs.alpha.record(rod.history.alpha[rod.history.alpha.length - 1] || 0);
      graphs.omega.record(rod.history.omega[rod.history.omega.length - 1] || 0);

      graphs.torque.display();
      graphs.alpha.display();
      graphs.omega.display();

      // 공식 표시
      p.fill(0);
      p.noStroke();
      p.textSize(16);
      p.textAlign(p.LEFT, p.TOP);
      p.text('τ = r × F', p.width - 180, 15);
      p.text('τ = I × α', p.width - 180, 40);
      p.text(`I = ${rod.momentOfInertia.toFixed(2)} kg·m²`, p.width - 180, 65);

      // 사용법 안내
      p.textSize(14);
      p.fill(100);
      p.textAlign(p.CENTER, p.BOTTOM);
      p.text('막대를 클릭하고 드래그하여 힘을 가하세요', p.width / 2, p.height - 15);
    },

    reset: () => {
      rod = new RigidBody(p, p.width / 2, p.height / 2, 300, 40, 5);
      forcePoint = null;
      forceVector = null;
      dragging = false;
      dragStart = null;
      if (graphs) {
        graphs.torque.data = [];
        graphs.alpha.data = [];
        graphs.omega.data = [];
      }
    },

    mousePressed: () => {
      console.log('Mouse pressed at:', p.mouseX, p.mouseY);
      if (rod && rod.contains(p.mouseX, p.mouseY)) {
        console.log('Clicked on rod!');
        dragging = true;
        dragStart = p.createVector(p.mouseX, p.mouseY);
        forcePoint = rod.worldToLocal(dragStart);
        forceVector = p.createVector(0, 0);
      } else {
        console.log('Not on rod');
      }
    },

    mouseDragged: () => {
      // 드래그 시작 감지 (mousePressed를 놓친 경우)
      if (!dragging && !dragStart && rod && rod.contains(p.mouseX, p.mouseY)) {
        console.log('Drag started (missed mousePressed)');
        dragging = true;
        dragStart = p.createVector(p.mouseX, p.mouseY);
        forcePoint = rod.worldToLocal(dragStart);
        forceVector = p.createVector(0, 0);
      }

      console.log('Mouse dragged:', dragging, 'dragStart:', dragStart);
      if (dragging && dragStart && forcePoint) {
        let current = p.createVector(p.mouseX, p.mouseY);
        forceVector = p.createVector(
          current.x - dragStart.x,
          current.y - dragStart.y
        );
        console.log('Force vector:', forceVector.x, forceVector.y);
      }
    },

    mouseReleased: () => {
      console.log('Mouse released');
      dragging = false;
      dragStart = null;
      setTimeout(() => {
        if (!dragging) {
          forcePoint = null;
          forceVector = null;
        }
      }, 100);
    }
  };
};

const TorqueSimulation = ({ width, height }) => {
  return (
    <P5Canvas
      sketch={createSketch}
      width={width || 900}
      height={height || 550}
      title="돌림힘 시뮬레이션"
      githubUrl="https://github.com/rottenapplea/physics_blog_2025/blob/main/src/components/React/examples/TorqueSimulation.jsx"
    />
  );
};

export default TorqueSimulation;
