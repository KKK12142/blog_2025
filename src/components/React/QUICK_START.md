# p5.js 시뮬레이션 빠르게 만들기

React를 몰라도 p5.js만 알면 시뮬레이션을 만들 수 있습니다!

## 🚀 3단계로 만들기

### 1단계: 템플릿 복사

```bash
cp src/components/React/examples/_template.jsx src/components/React/examples/MySimulation.jsx
```

### 2단계: sketch 함수만 수정

`MySimulation.jsx` 파일을 열어서 `createSketch` 함수 안쪽만 수정하세요.

**수정할 부분:**
```javascript
const createSketch = (p) => {
  // 👉 여기부터 수정
  let myVariable;

  return {
    setup: () => {
      // 초기 설정
    },

    draw: () => {
      // 매 프레임 실행
    },

    reset: () => {
      // 리셋 버튼 클릭 시
    }
  };
  // 👉 여기까지 수정
};
```

**수정하지 않을 부분:**
- `import` 문
- `const createSketch = (p) => {` 선언부
- `const MySimulation = ...` 컴포넌트 선언
- `export default MySimulation`

### 3단계: export 추가

`src/components/React/index.js`에 추가:
```javascript
export { default as MySimulation } from './examples/MySimulation';
```

## 📝 p5.js 기본 문법

### 변수 선언
```javascript
const createSketch = (p) => {
  let x, y;  // 여기서 선언
  let speed = 5;

  return {
    setup: () => {
      x = p.width / 2;
      y = p.height / 2;
    }
  };
};
```

### 그리기 함수

```javascript
// 배경
p.background(220);

// 원
p.circle(x, y, 크기);

// 사각형
p.rect(x, y, 너비, 높이);

// 선
p.line(x1, y1, x2, y2);

// 색상
p.fill(r, g, b);        // 채우기
p.stroke(r, g, b);      // 선 색
p.noStroke();           // 선 없음
p.noFill();             // 채우기 없음

// 텍스트
p.textSize(크기);
p.text('내용', x, y);
```

### 마우스/키보드

```javascript
return {
  mousePressed: () => {
    console.log(p.mouseX, p.mouseY);
  },

  mouseDragged: () => {
    // 드래그 중
  },

  mouseReleased: () => {
    // 릴리즈
  }
};
```

## 🎯 실전 예제

### 예제 1: 클릭한 곳에 원 그리기

```javascript
const createSketch = (p) => {
  let circles = [];

  return {
    setup: () => {
      p.background(220);
    },

    draw: () => {
      p.background(220);

      // 모든 원 그리기
      circles.forEach(c => {
        p.fill(100, 150, 255);
        p.circle(c.x, c.y, 30);
      });
    },

    mousePressed: () => {
      // 클릭한 위치에 원 추가
      circles.push({ x: p.mouseX, y: p.mouseY });
    },

    reset: () => {
      circles = [];
    }
  };
};
```

### 예제 2: 드래그로 선 그리기

```javascript
const createSketch = (p) => {
  let lines = [];
  let currentLine = null;

  return {
    setup: () => {
      p.background(220);
    },

    draw: () => {
      p.background(220);

      // 저장된 선들
      p.stroke(0);
      p.strokeWeight(2);
      lines.forEach(line => {
        line.forEach((point, i) => {
          if (i > 0) {
            p.line(line[i-1].x, line[i-1].y, point.x, point.y);
          }
        });
      });

      // 현재 그리는 선
      if (currentLine) {
        currentLine.forEach((point, i) => {
          if (i > 0) {
            p.line(currentLine[i-1].x, currentLine[i-1].y, point.x, point.y);
          }
        });
      }
    },

    mousePressed: () => {
      currentLine = [{ x: p.mouseX, y: p.mouseY }];
    },

    mouseDragged: () => {
      if (currentLine) {
        currentLine.push({ x: p.mouseX, y: p.mouseY });
      }
    },

    mouseReleased: () => {
      if (currentLine) {
        lines.push(currentLine);
        currentLine = null;
      }
    },

    reset: () => {
      lines = [];
      currentLine = null;
    }
  };
};
```

### 예제 3: 중력 시뮬레이션

```javascript
const createSketch = (p) => {
  let ball;

  return {
    setup: () => {
      ball = {
        x: p.width / 2,
        y: 100,
        vx: 0,
        vy: 0,
        radius: 20
      };
    },

    draw: () => {
      p.background(220);

      // 중력
      ball.vy += 0.5;

      // 이동
      ball.x += ball.vx;
      ball.y += ball.vy;

      // 바닥 충돌
      if (ball.y + ball.radius > p.height) {
        ball.y = p.height - ball.radius;
        ball.vy *= -0.8; // 반발
      }

      // 그리기
      p.fill(100, 150, 255);
      p.circle(ball.x, ball.y, ball.radius * 2);
    },

    mousePressed: () => {
      // 클릭하면 공 위치로 이동
      ball.x = p.mouseX;
      ball.y = p.mouseY;
      ball.vx = 0;
      ball.vy = 0;
    },

    reset: () => {
      ball.x = p.width / 2;
      ball.y = 100;
      ball.vx = 0;
      ball.vy = 0;
    }
  };
};
```

## 🎨 Nature of Code 패턴 (고급)

물리 시뮬레이션을 만들 때:

```javascript
class Particle {
  constructor(p, x, y) {
    this.p = p;
    this.pos = p.createVector(x, y);
    this.vel = p.createVector(0, 0);
    this.acc = p.createVector(0, 0);
  }

  applyForce(force) {
    this.acc.add(force);
  }

  update() {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.acc.mult(0); // 리셋
  }

  display() {
    this.p.circle(this.pos.x, this.pos.y, 20);
  }
}

const createSketch = (p) => {
  let particle;

  return {
    setup: () => {
      particle = new Particle(p, p.width/2, p.height/2);
    },

    draw: () => {
      p.background(220, 20);

      let gravity = p.createVector(0, 0.5);
      particle.applyForce(gravity);

      particle.update();
      particle.display();
    }
  };
};
```

## 📦 MDX에서 사용하기

```mdx
---
title: 나의 시뮬레이션
---

import MySimulation from '@components/React/examples/MySimulation.jsx';

# 제목

<MySimulation client:only="react" />
```

## 🔧 디버깅

### 콘솔 로그 사용
```javascript
draw: () => {
  console.log('x:', x, 'y:', y);
}
```

### 브라우저 개발자 도구
- F12 또는 Cmd+Option+I
- Console 탭에서 에러 확인

## 💡 팁

1. **처음엔 간단하게**: 복잡한 것부터 시작하지 말고 원 하나 그리기부터
2. **작은 단계로**: 코드 한 줄 추가할 때마다 테스트
3. **기존 예제 참고**: BouncingBall.jsx, TorqueSimulation.jsx 보면서 패턴 익히기
4. **p5.js 문서**: https://p5js.org/reference/

## ❓ 자주 묻는 질문

**Q: React를 정말 몰라도 되나요?**
A: 네! `createSketch` 함수 내부만 순수 p5.js 코드로 작성하면 됩니다.

**Q: 에러가 나면?**
A: 브라우저 콘솔(F12)을 열어서 에러 메시지를 확인하세요.

**Q: 예제를 수정하고 싶어요**
A: 기존 예제를 복사해서 이름만 바꾸고 수정하세요.

**Q: 더 복잡한 시뮬레이션은?**
A: `/p5-physics-simulation` 스킬을 사용하거나 Nature of Code 패턴을 참고하세요.
