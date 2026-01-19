# React Three Fiber (R3F) 3D 시뮬레이션 가이드

**3D 시각화가 필요한 경우에만 사용.**
대부분의 2D 역학 문제는 Canvas/SVG가 더 적합합니다.

## 언제 R3F를 사용하나?

| 사용 O | 사용 X |
|--------|--------|
| 3D 시점 회전 필요 (원운동 등) | 단순 빗면 운동 |
| 3D 벡터장 시각화 | 1D/2D 충돌 |
| 복잡한 3D 구조물 | 그래프 중심 시뮬레이션 |
| VR/AR 확장 예정 | 일반적인 역학 문제 |

**2D 시뮬레이션은 `canvas-svg-guide.md` 참고.**

---

## 1. 기본 설정

### 필수 패키지
```bash
npm install three @react-three/fiber @react-three/drei leva
```

### 기본 씬 구조
```jsx
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Grid, Text } from '@react-three/drei'
import { useControls } from 'leva'

export default function PhysicsSimulation() {
  return (
    <div style={{ width: '100%', height: '600px' }}>
      <Canvas
        camera={{ position: [8, 6, 8], fov: 50 }}
        shadows
      >
        {/* 조명 */}
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize={[2048, 2048]}
        />
        
        {/* 바닥 그리드 */}
        <Grid
          args={[20, 20]}
          cellSize={1}
          cellThickness={0.5}
          cellColor="#6e6e6e"
          sectionSize={5}
          fadeDistance={30}
        />
        
        {/* 물리 요소들 */}
        <Scene />
        
        {/* 카메라 컨트롤 */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
        />
      </Canvas>
    </div>
  )
}
```

---

## 2. Leva 컨트롤 패널

### 기본 사용
```jsx
import { useControls, folder, button } from 'leva'

function SimulationControls() {
  const {
    isPlaying,
    speed,
    showTrajectory,
    angle,
  } = useControls({
    // 재생 컨트롤
    Playback: folder({
      isPlaying: { value: false, label: '재생' },
      speed: { value: 1, min: 0.1, max: 3, step: 0.1, label: '속도' },
      reset: button(() => resetSimulation(), { label: '초기화' }),
    }),
    
    // 물리 파라미터
    Physics: folder({
      angle: { value: 30, min: 0, max: 60, step: 1, label: '빗면 각도 (°)' },
      friction: { value: 0.1, min: 0, max: 1, step: 0.01, label: '마찰 계수' },
      mass: { value: 1, min: 0.1, max: 5, step: 0.1, label: '질량 (kg)' },
    }),
    
    // 시각화 옵션
    Display: folder({
      showTrajectory: { value: true, label: '궤적 표시' },
      showVectors: { value: true, label: '벡터 표시' },
      showGraph: { value: true, label: '그래프 표시' },
    }),
  })
  
  return { isPlaying, speed, showTrajectory, angle }
}
```

### 컨트롤 유형
```jsx
// 슬라이더
mass: { value: 1, min: 0, max: 10, step: 0.1 }

// 체크박스
showGrid: true

// 색상 선택
objectColor: '#e74c3c'

// 선택 (드롭다운)
graphType: { value: 'v-t', options: ['v-t', 's-t', 'a-t'] }

// 버튼
reset: button(() => handleReset())

// 폴더 (그룹)
Physics: folder({ ... }, { collapsed: false })
```

---

## 3. 물체 컴포넌트

### 박스 (물체)
```jsx
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'

function PhysicsBox({ position, size = 0.5, color = '#e74c3c', label = 'A' }) {
  const meshRef = useRef()
  
  return (
    <group position={position}>
      {/* 박스 메시 */}
      <mesh ref={meshRef} castShadow>
        <boxGeometry args={[size, size, size]} />
        <meshStandardMaterial color={color} />
      </mesh>
      
      {/* 라벨 */}
      <Text
        position={[0, size/2 + 0.3, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>
    </group>
  )
}
```

### 움직이는 물체
```jsx
function MovingObject({ getPosition, size = 0.5, color = '#e74c3c' }) {
  const meshRef = useRef()
  const [time, setTime] = useState(0)
  const [isPlaying] = useControls(() => ({ isPlaying: false }))
  
  useFrame((state, delta) => {
    if (isPlaying) {
      setTime(prev => prev + delta)
      const pos = getPosition(time)
      meshRef.current.position.set(pos.x, pos.y, pos.z)
    }
  })
  
  return (
    <mesh ref={meshRef} castShadow>
      <boxGeometry args={[size, size, size]} />
      <meshStandardMaterial color={color} />
    </mesh>
  )
}
```

---

## 4. 빗면 구현

### 빗면 메시
```jsx
function InclinedPlane({ 
  length = 5, 
  width = 2, 
  angle = Math.PI / 6,  // 30도
  color = '#3498db',
  position = [0, 0, 0]
}) {
  const height = length * Math.sin(angle)
  const baseLength = length * Math.cos(angle)
  
  return (
    <group position={position}>
      {/* 빗면 */}
      <mesh
        rotation={[0, 0, -angle]}
        position={[baseLength/2, height/2, 0]}
        receiveShadow
      >
        <boxGeometry args={[length, 0.1, width]} />
        <meshStandardMaterial color={color} />
      </mesh>
      
      {/* 지지대 (삼각형) */}
      <mesh position={[baseLength/2, 0, 0]}>
        <extrudeGeometry args={[
          createTriangleShape(baseLength, height),
          { depth: width, bevelEnabled: false }
        ]} />
        <meshStandardMaterial color={color} opacity={0.3} transparent />
      </mesh>
    </group>
  )
}

// 삼각형 Shape 생성
function createTriangleShape(base, height) {
  const shape = new THREE.Shape()
  shape.moveTo(-base/2, 0)
  shape.lineTo(base/2, 0)
  shape.lineTo(base/2, 0)
  shape.lineTo(-base/2, height)
  shape.lineTo(-base/2, 0)
  return shape
}
```

### 양쪽 빗면 (도르래 시스템)
```jsx
function DualInclinedPlane({ angleLeft, angleRight, pulleyHeight }) {
  return (
    <group>
      {/* 왼쪽 빗면 */}
      <InclinedPlane
        angle={angleLeft}
        position={[-3, 0, 0]}
        color="#3498db"
      />
      
      {/* 오른쪽 빗면 */}
      <InclinedPlane
        angle={angleRight}
        position={[3, 0, 0]}
        rotation={[0, Math.PI, 0]}
        color="#27ae60"
      />
      
      {/* 도르래 */}
      <Pulley position={[0, pulleyHeight, 0]} />
    </group>
  )
}
```

---

## 5. 도르래 및 실

### 도르래
```jsx
function Pulley({ position, radius = 0.3 }) {
  return (
    <group position={position}>
      {/* 도르래 원판 */}
      <mesh rotation={[Math.PI/2, 0, 0]}>
        <cylinderGeometry args={[radius, radius, 0.1, 32]} />
        <meshStandardMaterial color="#ecf0f1" />
      </mesh>
      
      {/* 테두리 */}
      <mesh rotation={[Math.PI/2, 0, 0]}>
        <torusGeometry args={[radius, 0.02, 16, 32]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>
      
      {/* 중심축 */}
      <mesh>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>
    </group>
  )
}
```

### 실 (Line)
```jsx
import { Line } from '@react-three/drei'

function Rope({ points, color = '#2c3e50', lineWidth = 3 }) {
  return (
    <Line
      points={points}  // [[x1,y1,z1], [x2,y2,z2], ...]
      color={color}
      lineWidth={lineWidth}
    />
  )
}

// 사용 예: 물체 → 도르래 → 물체
function ConnectedRope({ objAPos, objBPos, pulleyPos, pulleyRadius }) {
  // 접선점 계산
  const tangentA = calculateTangent(pulleyPos, pulleyRadius, objAPos)
  const tangentB = calculateTangent(pulleyPos, pulleyRadius, objBPos)
  
  // 도르래 위 호 (근사)
  const arcPoints = generateArcPoints(pulleyPos, pulleyRadius, tangentA, tangentB)
  
  const points = [
    objAPos,
    tangentA,
    ...arcPoints,
    tangentB,
    objBPos,
  ]
  
  return <Rope points={points} />
}
```

---

## 6. 궤적 표시

### 실시간 궤적
```jsx
import { Line } from '@react-three/drei'
import { useState, useRef } from 'react'
import { useFrame } from '@react-three/fiber'

function Trajectory({ color = '#9b59b6', maxPoints = 500 }) {
  const [points, setPoints] = useState([])
  const objectRef = useRef()
  
  useFrame(() => {
    if (objectRef.current) {
      const pos = objectRef.current.position.toArray()
      setPoints(prev => {
        const newPoints = [...prev, pos]
        // 최대 점 개수 제한
        if (newPoints.length > maxPoints) {
          newPoints.shift()
        }
        return newPoints
      })
    }
  })
  
  return points.length > 1 ? (
    <Line
      points={points}
      color={color}
      lineWidth={2}
      transparent
      opacity={0.7}
    />
  ) : null
}
```

### 예측 궤적 (포물선 등)
```jsx
function PredictedTrajectory({ v0, angle, g = 10, numPoints = 50 }) {
  const points = useMemo(() => {
    const pts = []
    const vx = v0 * Math.cos(angle)
    const vy = v0 * Math.sin(angle)
    const tTotal = 2 * vy / g
    
    for (let i = 0; i <= numPoints; i++) {
      const t = (i / numPoints) * tTotal
      const x = vx * t
      const y = vy * t - 0.5 * g * t * t
      pts.push([x, y, 0])
    }
    return pts
  }, [v0, angle, g])
  
  return (
    <Line
      points={points}
      color="#3498db"
      lineWidth={2}
      dashed
      dashSize={0.1}
      gapSize={0.05}
    />
  )
}
```

---

## 7. 벡터 표시

### 화살표 (Arrow)
```jsx
import { Line, Cone } from '@react-three/drei'

function Arrow({ 
  start, 
  end, 
  color = '#4ade80', 
  headLength = 0.2,
  headRadius = 0.08 
}) {
  const direction = [
    end[0] - start[0],
    end[1] - start[1],
    end[2] - start[2],
  ]
  const length = Math.sqrt(direction.reduce((a, b) => a + b*b, 0))
  
  // 정규화
  const dir = direction.map(d => d / length)
  
  // 화살표 머리 위치
  const headStart = [
    end[0] - dir[0] * headLength,
    end[1] - dir[1] * headLength,
    end[2] - dir[2] * headLength,
  ]
  
  // 회전 계산
  const quaternion = new THREE.Quaternion()
  quaternion.setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    new THREE.Vector3(...dir)
  )
  
  return (
    <group>
      {/* 몸통 */}
      <Line
        points={[start, headStart]}
        color={color}
        lineWidth={3}
      />
      
      {/* 머리 */}
      <mesh position={headStart} quaternion={quaternion}>
        <coneGeometry args={[headRadius, headLength, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  )
}
```

### 힘 벡터
```jsx
function ForceVector({ position, force, scale = 0.5, color = '#4ade80', label }) {
  const end = [
    position[0] + force[0] * scale,
    position[1] + force[1] * scale,
    position[2] + force[2] * scale,
  ]
  
  return (
    <group>
      <Arrow start={position} end={end} color={color} />
      {label && (
        <Text
          position={end}
          fontSize={0.2}
          color={color}
        >
          {label}
        </Text>
      )}
    </group>
  )
}
```

---

## 8. 2D 그래프 오버레이

### HTML 오버레이로 그래프
```jsx
import { Html } from '@react-three/drei'

function GraphOverlay({ data, type = 'v-t', position = 'bottom-right' }) {
  const style = {
    position: 'absolute',
    [position.includes('bottom') ? 'bottom' : 'top']: '20px',
    [position.includes('right') ? 'right' : 'left']: '20px',
    width: '300px',
    height: '200px',
    background: 'rgba(255,255,255,0.9)',
    borderRadius: '8px',
    padding: '10px',
  }
  
  return (
    <Html fullscreen>
      <div style={style}>
        <canvas ref={canvasRef} width={280} height={180} />
      </div>
    </Html>
  )
}
```

### 3D 공간 내 그래프 (평면에 텍스처)
```jsx
function Graph3D({ data, position, size = [3, 2] }) {
  const canvasRef = useRef()
  const textureRef = useRef()
  
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    
    // 그래프 그리기
    drawGraph(ctx, data)
    
    // 텍스처 업데이트
    textureRef.current.needsUpdate = true
  }, [data])
  
  return (
    <>
      <canvas ref={canvasRef} width={512} height={256} style={{ display: 'none' }} />
      <mesh position={position}>
        <planeGeometry args={size} />
        <meshBasicMaterial>
          <canvasTexture ref={textureRef} attach="map" image={canvasRef.current} />
        </meshBasicMaterial>
      </mesh>
    </>
  )
}
```

---

## 9. 애니메이션 제어

### useFrame 훅
```jsx
function AnimatedObject() {
  const meshRef = useRef()
  const timeRef = useRef(0)
  const { isPlaying, speed } = useControls({
    isPlaying: false,
    speed: { value: 1, min: 0.1, max: 3 }
  })
  
  useFrame((state, delta) => {
    if (isPlaying) {
      timeRef.current += delta * speed
      
      // 운동 방정식
      const t = timeRef.current
      const x = v0 * t + 0.5 * a * t * t
      const y = calculateY(x)
      
      meshRef.current.position.set(x, y, 0)
    }
  })
  
  return <mesh ref={meshRef}>...</mesh>
}
```

### 상태 관리 (Zustand 권장)
```jsx
import { create } from 'zustand'

const useSimulationStore = create((set, get) => ({
  // 상태
  time: 0,
  isPlaying: false,
  objects: [],
  
  // 액션
  play: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),
  reset: () => set({ time: 0, isPlaying: false }),
  tick: (delta) => set(state => ({ time: state.time + delta })),
  
  // 물리 계산
  getObjectPosition: (id, time) => {
    const obj = get().objects.find(o => o.id === id)
    return calculatePosition(obj, time)
  },
}))
```

---

## 10. 완성 예시: 빗면 시뮬레이션

```jsx
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Grid, Text, Line } from '@react-three/drei'
import { useControls, folder, button } from 'leva'
import { useRef, useState, useMemo } from 'react'

// 물리 상수
const g = 10

export default function InclinedPlaneSimulation() {
  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <Canvas camera={{ position: [8, 6, 8], fov: 50 }} shadows>
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
        <Grid args={[20, 20]} cellSize={1} />
        
        <Scene />
        
        <OrbitControls />
      </Canvas>
    </div>
  )
}

function Scene() {
  // 컨트롤 패널
  const { isPlaying, speed, angle, friction, showTrajectory } = useControls({
    Playback: folder({
      isPlaying: { value: false, label: '▶ 재생' },
      speed: { value: 1, min: 0.1, max: 3, label: '속도' },
    }),
    Physics: folder({
      angle: { value: 30, min: 10, max: 60, label: '각도 (°)' },
      friction: { value: 0, min: 0, max: 0.5, label: '마찰 계수' },
    }),
    Display: folder({
      showTrajectory: { value: true, label: '궤적 표시' },
    }),
  })
  
  const angleRad = (angle * Math.PI) / 180
  const a = g * (Math.sin(angleRad) - friction * Math.cos(angleRad))
  
  // 빗면 치수
  const slopeLength = 5
  const slopeWidth = 2
  const slopeHeight = slopeLength * Math.sin(angleRad)
  const slopeBase = slopeLength * Math.cos(angleRad)
  
  return (
    <>
      {/* 빗면 */}
      <mesh
        rotation={[0, 0, -angleRad]}
        position={[slopeBase/2, slopeHeight/2, 0]}
        receiveShadow
      >
        <boxGeometry args={[slopeLength, 0.1, slopeWidth]} />
        <meshStandardMaterial color="#3498db" />
      </mesh>
      
      {/* 바닥 */}
      <mesh position={[slopeBase + 2, -0.05, 0]} receiveShadow>
        <boxGeometry args={[4, 0.1, slopeWidth]} />
        <meshStandardMaterial color="#7f8c8d" />
      </mesh>
      
      {/* 물체 */}
      <SlidingObject
        isPlaying={isPlaying}
        speed={speed}
        acceleration={a}
        slopeAngle={angleRad}
        startPosition={[0.3, slopeHeight - 0.1, 0]}
        showTrajectory={showTrajectory}
      />
      
      {/* 정보 표시 */}
      <Text position={[-2, 4, 0]} fontSize={0.3} color="black">
        {`a = ${a.toFixed(2)} m/s²`}
      </Text>
    </>
  )
}

function SlidingObject({ isPlaying, speed, acceleration, slopeAngle, startPosition, showTrajectory }) {
  const meshRef = useRef()
  const [time, setTime] = useState(0)
  const [trajectory, setTrajectory] = useState([])
  
  useFrame((state, delta) => {
    if (isPlaying && meshRef.current) {
      const newTime = time + delta * speed
      setTime(newTime)
      
      // 빗면 따라 이동
      const s = 0.5 * acceleration * newTime * newTime
      const x = startPosition[0] + s * Math.cos(slopeAngle)
      const y = startPosition[1] - s * Math.sin(slopeAngle)
      
      meshRef.current.position.set(x, Math.max(y, 0.25), 0)
      
      // 궤적 기록
      if (showTrajectory) {
        setTrajectory(prev => [...prev.slice(-200), [x, Math.max(y, 0.25), 0]])
      }
    }
  })
  
  return (
    <>
      <mesh ref={meshRef} position={startPosition} castShadow rotation={[0, 0, -slopeAngle]}>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial color="#e74c3c" />
      </mesh>
      
      {showTrajectory && trajectory.length > 1 && (
        <Line points={trajectory} color="#9b59b6" lineWidth={2} />
      )}
    </>
  )
}
```

---

## 11. MDX 블로그 임베드

```mdx
---
title: 빗면 운동 시뮬레이션
---

import InclinedPlaneSimulation from '@/components/physics/InclinedPlaneSimulation'

# 빗면 운동

아래 시뮬레이션에서 각도와 마찰 계수를 조절해보세요.

<InclinedPlaneSimulation />

## 이론

빗면에서의 가속도는 다음과 같습니다:

$$a = g(\sin\theta - \mu\cos\theta)$$
```
