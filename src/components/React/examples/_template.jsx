import React from 'react';
import P5Canvas from '../P5Canvas';

/**
 * 템플릿 - 이 파일을 복사해서 새로운 시뮬레이션 만들기
 *
 * 1. 이 파일을 복사 (예: MySimulation.jsx)
 * 2. createSketch 함수 내부만 수정
 * 3. export 이름 변경
 * 4. index.js에 export 추가
 */

const createSketch = (p) => {
  // ============================================
  // 여기부터 수정 시작
  // ============================================

  // 변수 선언
  let x = 0;
  let y = 0;
  let speedX = 2;
  let speedY = 2;

  return {
    setup: () => {
      p.background(220);

      // 초기 설정
      x = p.width / 2;
      y = p.height / 2;
    },

    draw: () => {
      p.background(220, 20); // 트레일 효과

      // 물체 그리기
      p.fill(100, 150, 255);
      p.noStroke();
      p.circle(x, y, 30);

      // 물체 이동
      x += speedX;
      y += speedY;

      // 벽 충돌
      if (x > p.width - 15 || x < 15) speedX *= -1;
      if (y > p.height - 15 || y < 15) speedY *= -1;
    },

    reset: () => {
      x = p.width / 2;
      y = p.height / 2;
      speedX = 2;
      speedY = 2;
    },

    // 마우스 이벤트 (필요시)
    mousePressed: () => {
      console.log('Clicked at:', p.mouseX, p.mouseY);
    },

    mouseDragged: () => {
      // 드래그 로직
    },

    mouseReleased: () => {
      // 릴리즈 로직
    }
  };

  // ============================================
  // 수정 끝
  // ============================================
};

const MySimulation = ({ width, height }) => {
  return (
    <P5Canvas
      sketch={createSketch}
      width={width || 600}
      height={height || 400}
      title="나의 시뮬레이션"
      githubUrl="https://github.com/rottenapplea/physics_blog_2025/blob/main/src/components/React/examples/MySimulation.jsx"
    />
  );
};

export default MySimulation;
