/**
 * Forces - 물리학 힘 함수 모음
 * 모든 함수는 p5.Vector를 반환
 */
const Forces = {
  /**
   * 중력: F = mg
   * @param {p5} p - p5 인스턴스
   * @param {Particle} particle - 입자
   * @param {number} g - 중력가속도 (기본: 9.8)
   * @returns {p5.Vector}
   */
  gravity(p, particle, g = 9.8) {
    return p.createVector(0, particle.mass * g);
  },

  /**
   * 균일 중력장 (질량 무관)
   * @param {p5} p - p5 인스턴스
   * @param {number} gx - x 방향 중력가속도
   * @param {number} gy - y 방향 중력가속도
   * @returns {p5.Vector}
   */
  uniformGravity(p, gx, gy) {
    return p.createVector(gx, gy);
  },

  /**
   * 선형 공기저항: F = -bv
   * @param {p5} p - p5 인스턴스
   * @param {Particle} particle - 입자
   * @param {number} b - 저항 계수
   * @returns {p5.Vector}
   */
  drag(p, particle, b) {
    const force = particle.vel.copy();
    force.mult(-b);
    return force;
  },

  /**
   * 이차 공기저항: F = -c|v|v
   * @param {p5} p - p5 인스턴스
   * @param {Particle} particle - 입자
   * @param {number} c - 저항 계수
   * @returns {p5.Vector}
   */
  dragQuadratic(p, particle, c) {
    const speed = particle.vel.mag();
    if (speed < 0.001) return p.createVector(0, 0);
    
    const force = particle.vel.copy();
    force.normalize();
    force.mult(-c * speed * speed);
    return force;
  },

  /**
   * 용수철 힘 (훅의 법칙): F = -k(x - x₀)
   * @param {p5} p - p5 인스턴스
   * @param {Particle} particle - 입자
   * @param {p5.Vector} anchor - 고정점
   * @param {number} k - 용수철 상수
   * @param {number} restLength - 자연 길이 (기본: 0)
   * @returns {p5.Vector}
   */
  spring(p, particle, anchor, k, restLength = 0) {
    const force = p5.Vector.sub(anchor, particle.pos);
    const stretch = force.mag() - restLength;
    force.normalize();
    force.mult(k * stretch);
    return force;
  },

  /**
   * 두 입자 사이 용수철
   * @param {p5} p - p5 인스턴스
   * @param {Particle} p1 - 입자 1
   * @param {Particle} p2 - 입자 2
   * @param {number} k - 용수철 상수
   * @param {number} restLength - 자연 길이
   * @returns {p5.Vector} p1에 작용하는 힘
   */
  springBetween(p, p1, p2, k, restLength) {
    const force = p5.Vector.sub(p2.pos, p1.pos);
    const stretch = force.mag() - restLength;
    force.normalize();
    force.mult(k * stretch);
    return force;
  },

  /**
   * 운동 마찰력: F = -μN (운동 방향 반대)
   * @param {p5} p - p5 인스턴스
   * @param {Particle} particle - 입자
   * @param {number} mu - 마찰 계수
   * @param {number} normalForce - 수직항력 크기
   * @returns {p5.Vector}
   */
  friction(p, particle, mu, normalForce) {
    if (particle.vel.mag() < 0.01) return p.createVector(0, 0);
    
    const force = particle.vel.copy();
    force.normalize();
    force.mult(-mu * normalForce);
    return force;
  },

  /**
   * 정지 마찰력 체크
   * @param {number} appliedForce - 적용된 힘의 크기
   * @param {number} muStatic - 정지 마찰 계수
   * @param {number} normalForce - 수직항력 크기
   * @returns {boolean} 움직이는지 여부
   */
  checkStaticFriction(appliedForce, muStatic, normalForce) {
    return appliedForce > muStatic * normalForce;
  },

  /**
   * 만유인력: F = GMm/r²
   * @param {p5} p - p5 인스턴스
   * @param {Particle} p1 - 입자 1
   * @param {Particle} p2 - 입자 2
   * @param {number} G - 만유인력 상수 (기본: 1)
   * @returns {p5.Vector} p1에 작용하는 힘 (p2 방향)
   */
  gravitational(p, p1, p2, G = 1) {
    const force = p5.Vector.sub(p2.pos, p1.pos);
    const distance = p.constrain(force.mag(), 5, 1000);  // 발산 방지
    force.normalize();
    const strength = (G * p1.mass * p2.mass) / (distance * distance);
    force.mult(strength);
    return force;
  },

  /**
   * 전기력 (쿨롱 법칙): F = kq₁q₂/r²
   * @param {p5} p - p5 인스턴스
   * @param {Object} p1 - {pos, charge}
   * @param {Object} p2 - {pos, charge}
   * @param {number} k - 쿨롱 상수 (기본: 1)
   * @returns {p5.Vector} p1에 작용하는 힘
   */
  electrostatic(p, p1, p2, k = 1) {
    const force = p5.Vector.sub(p1.pos, p2.pos);  // 척력이 양수
    const distance = p.constrain(force.mag(), 5, 1000);
    force.normalize();
    const strength = (k * p1.charge * p2.charge) / (distance * distance);
    force.mult(strength);
    return force;
  },

  /**
   * 부력: F = ρVg (위쪽)
   * @param {p5} p - p5 인스턴스
   * @param {number} fluidDensity - 유체 밀도
   * @param {number} volume - 잠긴 부피
   * @param {number} g - 중력가속도
   * @returns {p5.Vector}
   */
  buoyancy(p, fluidDensity, volume, g = 9.8) {
    return p.createVector(0, -fluidDensity * volume * g);
  },

  /**
   * 경사면 힘 분해
   * @param {p5} p - p5 인스턴스
   * @param {Particle} particle - 입자
   * @param {number} angle - 경사각 (라디안)
   * @param {number} g - 중력가속도
   * @param {number} mu - 마찰 계수 (기본: 0)
   * @returns {Object} {parallel, normal, friction}
   */
  inclinePlane(p, particle, angle, g, mu = 0) {
    const mg = particle.mass * g;
    const parallel = mg * Math.sin(angle);   // 경사면 아래 방향
    const normal = mg * Math.cos(angle);     // 경사면 수직
    const friction = mu * normal;            // 마찰력 크기
    
    // 벡터로 변환 (경사면 좌표계 → 직교 좌표계)
    const netParallel = parallel - friction;
    
    return {
      parallel: parallel,
      normal: normal,
      friction: friction,
      netForce: p.createVector(
        netParallel * Math.cos(angle),
        netParallel * Math.sin(angle)
      )
    };
  },

  /**
   * 복원력 (단진동): F = -kx
   * @param {p5} p - p5 인스턴스
   * @param {number} displacement - 평형점에서 변위
   * @param {number} k - 복원력 상수
   * @param {number} angle - 힘 방향 (라디안, 기본: 0 = x축)
   * @returns {p5.Vector}
   */
  restoring(p, displacement, k, angle = 0) {
    const magnitude = -k * displacement;
    return p.createVector(
      magnitude * Math.cos(angle),
      magnitude * Math.sin(angle)
    );
  },

  /**
   * 감쇠력: F = -bv
   * @param {p5} p - p5 인스턴스
   * @param {Particle} particle - 입자
   * @param {number} b - 감쇠 계수
   * @returns {p5.Vector}
   */
  damping(p, particle, b) {
    return this.drag(p, particle, b);  // 선형 공기저항과 동일
  },

  /**
   * 로렌츠 힘 (자기장): F = qv × B
   * @param {p5} p - p5 인스턴스
   * @param {Particle} particle - 입자
   * @param {number} charge - 전하량
   * @param {number} B - 자기장 세기 (z 방향)
   * @returns {p5.Vector}
   */
  lorentz(p, particle, charge, B) {
    // 2D에서 B는 z 방향 → F = q(v × B) = qB(-vy, vx)
    return p.createVector(
      -charge * B * particle.vel.y,
       charge * B * particle.vel.x
    );
  }
};

// ES Module export
// export { Forces };

// 전역 변수
if (typeof window !== 'undefined') {
  window.Forces = Forces;
}
