# Physics Simulations with p5.js

이 폴더는 Nature of Code 패턴을 따르는 p5.js 물리학 시뮬레이션 컴포넌트들을 포함합니다.

## 구조

```
React/
├── P5Canvas.jsx          # p5.js wrapper 컴포넌트
├── examples/             # 예제 시뮬레이션들
│   └── BouncingBall.jsx  # 튀어오르는 공 예제
└── README.md
```

## P5Canvas 사용법

`P5Canvas`는 p5.js 스케치를 Astro 블로그에 통합하기 위한 wrapper 컴포넌트입니다.

### 기본 사용법

```jsx
import P5Canvas from '@components/React/P5Canvas';

const createSketch = (p) => {
  let x = 0;

  return {
    setup: () => {
      p.background(220);
    },

    draw: () => {
      p.background(220);
      p.circle(x, p.height / 2, 50);
      x = (x + 1) % p.width;
    },

    reset: () => {
      x = 0;
    }
  };
};

const MySimulation = () => {
  return (
    <P5Canvas
      sketch={createSketch}
      width={600}
      height={400}
      title="나의 시뮬레이션"
      githubUrl="https://github.com/..."
    />
  );
};
```

### Props

- `sketch` (Function, required): p5 인스턴스를 받아 `{setup, draw, reset}` 객체를 반환하는 함수
- `width` (Number, optional): 캔버스 너비. 지정하지 않으면 부모 요소의 전체 너비 사용
- `height` (Number, optional): 캔버스 높이. 지정하지 않으면 부모 요소의 전체 높이 사용 (최소 400px)
- `title` (String, optional): 시뮬레이션 제목
- `githubUrl` (String, optional): GitHub 코드 링크

**반응형 캔버스**: width나 height를 지정하지 않으면 캔버스가 자동으로 부모 요소의 크기에 맞춰지고, 윈도우 리사이즈 시에도 자동으로 조정됩니다.

### Nature of Code 패턴

시뮬레이션 작성 시 다음 패턴을 따르세요:

1. **클래스 기반 객체**: 물리적 객체는 클래스로 정의
2. **벡터 사용**: p5.Vector를 사용하여 위치, 속도, 가속도 표현
3. **힘의 적용**: `applyForce()` 메서드로 힘을 가속도에 추가
4. **업데이트 로직**: 가속도 → 속도 → 위치 순서로 업데이트

```jsx
class Particle {
  constructor(p, x, y) {
    this.p = p;
    this.position = p.createVector(x, y);
    this.velocity = p.createVector(0, 0);
    this.acceleration = p.createVector(0, 0);
  }

  applyForce(force) {
    this.acceleration.add(force);
  }

  update() {
    this.velocity.add(this.acceleration);
    this.position.add(this.velocity);
    this.acceleration.mult(0); // Reset
  }

  display() {
    this.p.circle(this.position.x, this.position.y, 10);
  }
}
```

## Astro에서 사용하기

MDX 파일에서 컴포넌트를 import하여 사용:

```mdx
---
title: "물리 시뮬레이션"
---

import BouncingBall from '@components/React/examples/BouncingBall.jsx';

# 중력 시뮬레이션

<BouncingBall client:load />
```

`client:load` 디렉티브는 페이지 로드 시 즉시 컴포넌트를 hydrate합니다.

## 컨트롤

모든 시뮬레이션은 다음 컨트롤을 포함합니다:

- **리셋**: 시뮬레이션을 초기 상태로 되돌립니다
- **일시정지/재시작**: 시뮬레이션을 멈추거나 다시 시작합니다
- **코드 보기**: GitHub에서 소스 코드를 확인합니다 (githubUrl이 제공된 경우)

## 스타일링

컴포넌트는 블로그의 디자인 시스템을 따릅니다:

- 다크 모드 자동 지원
- Tailwind CSS 클래스 사용
- 블로그 테마 색상 변수 사용 (`var(--card-bg)`, `var(--btn-regular-bg)` 등)
- 반응형 디자인

## 참고 자료

- [Nature of Code](https://natureofcode.com/) - Daniel Shiffman
- [p5.js Reference](https://p5js.org/reference/)
- [The Coding Train](https://thecodingtrain.com/)
