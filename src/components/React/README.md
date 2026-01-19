# Physics3D 컴포넌트 라이브러리

물리 교육용 Three.js (React Three Fiber) 컴포넌트 모음

## 📦 설치

```bash
npm install three @react-three/fiber @react-three/drei leva
```

## 📁 파일 구조

```
src/components/
├── physics3d/
│   ├── index.js          # 모든 컴포넌트 export
│   ├── Arrow.jsx         # 벡터 화살표
│   ├── Axis.jsx          # 좌표축, 그리드
│   ├── PhysicsCanvas.jsx # 2D/3D 캔버스 래퍼
│   ├── Shapes.jsx        # 점선, 각도호, 바닥 등
│   ├── InfoPanel.jsx     # 정보 패널
│   └── examples/
│       ├── ForceAddition.jsx    # 힘의 합성
│       └── FreebodyDiagram.jsx  # 자유물체도
```

## 🚀 빠른 시작

### MDX에서 사용

```mdx
---
title: 힘의 합성
---

import ForceAddition from '@/components/physics3d/examples/ForceAddition'

<ForceAddition client:only="react" />
```

> ⚠️ **중요**: Astro에서 `client:only="react"` 필수!

### 2D 시뮬레이션 기본 템플릿

```jsx
import { PhysicsCanvas2D } from '@/components/physics3d'
import { Arrow, Axis, Grid2D, InfoPanel } from '@/components/physics3d'

export default function MySimulation() {
  return (
    <PhysicsCanvas2D height="500px" zoom={50}>
      <Grid2D />
      <Axis is2D />
      
      <Arrow from={[0,0,0]} to={[2,1,0]} color="red" label="F" />
      
      <InfoPanel position={[3, 2, 0]} title="결과">
        <p>값: 123</p>
      </InfoPanel>
    </PhysicsCanvas2D>
  )
}
```

### 3D 시뮬레이션 기본 템플릿

```jsx
import { PhysicsCanvas3D } from '@/components/physics3d'
import { Arrow, Axis } from '@/components/physics3d'

export default function My3DSimulation() {
  return (
    <PhysicsCanvas3D height="500px" cameraPosition={[5, 4, 5]}>
      <Axis />
      
      <Arrow from={[0,0,0]} to={[2,0,0]} color="blue" label="r" />
      <Arrow from={[2,0,0]} to={[2,2,0]} color="red" label="F" />
      
      {/* 3D 물체 */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="orange" />
      </mesh>
    </PhysicsCanvas3D>
  )
}
```

## 📚 컴포넌트 API

### Arrow

```jsx
<Arrow 
  from={[0, 0, 0]}      // 시작점
  to={[2, 1, 0]}        // 끝점
  color="#dc2626"       // 색상
  label="F₁"            // 라벨
  labelOffset={[0.2, 0.2, 0]}  // 라벨 오프셋
  headLength={0.2}      // 화살표 머리 길이
  headWidth={0.1}       // 화살표 머리 너비
/>
```

### PhysicsCanvas2D

```jsx
<PhysicsCanvas2D 
  height="500px"        // 높이
  zoom={50}             // 줌 레벨 (클수록 확대)
  showControls={true}   // OrbitControls 표시
  background="#fafafa"  // 배경색
/>
```

### PhysicsCanvas3D

```jsx
<PhysicsCanvas3D 
  height="500px"
  cameraPosition={[5, 4, 5]}  // 카메라 위치
  fov={50}                     // 시야각
/>
```

### Shapes

```jsx
// 점선
<DashedLine from={[0,0,0]} to={[2,2,0]} color="gray" />

// 각도 호
<AngleArc 
  center={[0, 0, 0]} 
  startAngle={0} 
  endAngle={45}   // 도 단위
  radius={0.5}
  label="θ"
/>

// 직각 표시
<RightAngle position={[1, 0, 0]} size={0.2} rotation={0} />

// 바닥 (빗금 포함)
<Ground start={[-3, 0, 0]} end={[3, 0, 0]} />

// 스프링
<Spring from={[0, 0, 0]} to={[2, 0, 0]} coils={8} />
```

### InfoPanel

```jsx
<InfoPanel 
  position={[3, 2, 0]} 
  title="계산 결과"
  accentColor="#16a34a"
>
  <p>F = 10 N</p>
  <p>a = 2 m/s²</p>
</InfoPanel>
```

## 🎮 Leva 컨트롤 사용

```jsx
import { useControls } from 'leva'

function Scene() {
  const { force, angle } = useControls({
    force: { value: 10, min: 0, max: 50, label: '힘 (N)' },
    angle: { value: 30, min: 0, max: 90, label: '각도 (°)' }
  })
  
  return (
    <Arrow 
      from={[0, 0, 0]} 
      to={[force * Math.cos(angle * Math.PI / 180), force * Math.sin(angle * Math.PI / 180), 0]} 
    />
  )
}
```

## 🎯 물리 시뮬레이션 예제 목록

- [x] 힘의 합성 (ForceAddition)
- [x] 자유물체도 (FreebodyDiagram)
- [ ] 돌림힘 (Torque)
- [ ] 시소 평형 (Seesaw)
- [ ] 경사면 운동 (InclinePlane)
- [ ] 도르래 시스템 (Pulley)
- [ ] 용수철 진동 (SpringOscillation)
- [ ] 포물선 운동 (Projectile)

## 💡 팁

### 성능 최적화

```jsx
// 복잡한 계산은 useMemo로 캐싱
const vectors = useMemo(() => {
  return calculateVectors(force, angle)
}, [force, angle])
```

### 애니메이션

```jsx
import { useFrame } from '@react-three/fiber'

function AnimatedObject() {
  const ref = useRef()
  
  useFrame((state, delta) => {
    ref.current.rotation.z += delta * 0.5
  })
  
  return <mesh ref={ref}>...</mesh>
}
```

### 반응형

```jsx
// 화면 크기에 맞게 자동 조절
<div style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
  <PhysicsCanvas2D height="400px" />
</div>
```
