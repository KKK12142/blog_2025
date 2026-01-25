/**
 * Particle - 물리 시뮬레이션의 핵심 입자 클래스
 * Velocity Verlet 적분을 사용하여 에너지 보존
 */
class Particle {
  /**
   * @param {p5} p - p5 인스턴스
   * @param {number} x - 초기 x 좌표
   * @param {number} y - 초기 y 좌표
   * @param {Object} options - 옵션
   * @param {number} options.mass - 질량 (기본: 1)
   * @param {number} options.radius - 반지름 (기본: 10)
   * @param {number[]} options.color - RGB 색상 (기본: [100, 150, 255])
   */
  constructor(p, x, y, options = {}) {
    this.p = p;
    this.pos = p.createVector(x, y);
    this.vel = p.createVector(0, 0);
    this.acc = p.createVector(0, 0);
    this.prevAcc = p.createVector(0, 0);
    
    this.mass = options.mass || 1;
    this.radius = options.radius || 10;
    this.color = options.color || [100, 150, 255];
    
    // 시간 및 기록
    this.t = 0;
    this.history = {
      t: [],
      x: [],
      y: [],
      vx: [],
      vy: [],
      E: []
    };
  }

  /**
   * 힘 적용 (F = ma)
   * @param {p5.Vector} force - 적용할 힘 벡터
   */
  applyForce(force) {
    const f = p5.Vector.div(force, this.mass);
    this.acc.add(f);
  }

  /**
   * Velocity Verlet 적분으로 위치/속도 업데이트
   * @param {number} dt - 시간 간격
   */
  update(dt) {
    // 1. 위치 업데이트: x = x + v*dt + 0.5*a*dt^2
    const velTerm = p5.Vector.mult(this.vel, dt);
    const accTerm = p5.Vector.mult(this.acc, 0.5 * dt * dt);
    this.pos.add(velTerm).add(accTerm);

    // 2. 속도 업데이트: v = v + 0.5*(a_old + a_new)*dt
    const avgAcc = p5.Vector.add(this.prevAcc, this.acc);
    avgAcc.mult(0.5 * dt);
    this.vel.add(avgAcc);

    // 3. 기록
    this.record(dt);

    // 4. 다음 프레임 준비
    this.prevAcc = this.acc.copy();
    this.acc.set(0, 0);
  }

  /**
   * Symplectic Euler 적분 (간단한 버전)
   * @param {number} dt - 시간 간격
   */
  updateSymplectic(dt) {
    this.vel.add(p5.Vector.mult(this.acc, dt));
    this.pos.add(p5.Vector.mult(this.vel, dt));
    
    this.record(dt);
    this.acc.set(0, 0);
  }

  /**
   * 물리량 기록 (그래프용)
   * @param {number} dt - 시간 간격
   */
  record(dt) {
    this.t += dt;
    this.history.t.push(this.t);
    this.history.x.push(this.pos.x);
    this.history.y.push(this.pos.y);
    this.history.vx.push(this.vel.x);
    this.history.vy.push(this.vel.y);
    
    // 운동에너지
    const KE = 0.5 * this.mass * this.vel.magSq();
    this.history.E.push(KE);
  }

  /**
   * 입자 그리기
   */
  display() {
    this.p.fill(...this.color);
    this.p.noStroke();
    this.p.ellipse(this.pos.x, this.pos.y, this.radius * 2);
  }

  /**
   * 속도 벡터 표시
   * @param {number} scale - 벡터 스케일
   * @param {number[]} color - RGB 색상
   */
  displayVelocity(scale = 1, color = [255, 0, 0]) {
    const p = this.p;
    p.stroke(...color);
    p.strokeWeight(2);
    p.line(
      this.pos.x, this.pos.y,
      this.pos.x + this.vel.x * scale,
      this.pos.y + this.vel.y * scale
    );
    p.strokeWeight(1);
  }

  /**
   * 상태 초기화
   * @param {number} x - x 좌표
   * @param {number} y - y 좌표
   */
  reset(x, y) {
    this.pos.set(x, y);
    this.vel.set(0, 0);
    this.acc.set(0, 0);
    this.prevAcc.set(0, 0);
    this.t = 0;
    this.history = { t: [], x: [], y: [], vx: [], vy: [], E: [] };
  }

  /**
   * 운동에너지 계산
   * @returns {number}
   */
  kineticEnergy() {
    return 0.5 * this.mass * this.vel.magSq();
  }

  /**
   * 속력 반환
   * @returns {number}
   */
  speed() {
    return this.vel.mag();
  }
}

// ES Module export (Astro/Vite용)
// export { Particle };

// 전역 변수 (일반 p5.js 스케치용)
if (typeof window !== 'undefined') {
  window.Particle = Particle;
}
