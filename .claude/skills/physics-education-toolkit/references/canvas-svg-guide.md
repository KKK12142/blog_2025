# Canvas/SVG 2D 시뮬레이션 가이드

웹에 게시할 2D 물리 시뮬레이션 제작 가이드.
Astro/MDX 블로그에서 React 컴포넌트로 임포트하여 사용.

---

## 1. 기본 구조

### SVG 기반 (권장: 간단한 시뮬레이션)
```jsx
import { useState, useEffect, useRef } from 'react'

export default function PhysicsSimulation() {
  const [time, setTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const animationRef = useRef(null)
  
  // 물리 파라미터 (조절 가능)
  const [params, setParams] = useState({
    angle: 30,        // 빗면 각도 (도)
    friction: 0,      // 마찰 계수
    mass: 1,          // 질량 (kg)
    g: 10,            // 중력가속도
  })
  
  // 물리 계산
  const angleRad = (params.angle * Math.PI) / 180
  const a = params.g * (Math.sin(angleRad) - params.friction * Math.cos(angleRad))
  
  // 위치 계산
  const getPosition = (t) => {
    const s = 0.5 * a * t * t  // 이동 거리
    return {
      x: 50 + s * Math.cos(angleRad) * 10,  // 스케일 조정
      y: 50 + s * Math.sin(angleRad) * 10,
      v: a * t,
      s: s,
    }
  }
  
  const pos = getPosition(time)
  
  // 애니메이션 루프
  useEffect(() => {
    if (isPlaying) {
      const startTime = performance.now() - time * 1000
      
      const animate = (currentTime) => {
        const elapsed = (currentTime - startTime) / 1000
        setTime(elapsed)
        animationRef.current = requestAnimationFrame(animate)
      }
      
      animationRef.current = requestAnimationFrame(animate)
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isPlaying])
  
  // 리셋 함수 (필수!)
  const handleReset = () => {
    setIsPlaying(false)
    setTime(0)
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
  }
  
  return (
    <div className="simulation-container">
      {/* SVG 시뮬레이션 영역 */}
      <svg viewBox="0 0 400 300" className="simulation-svg">
        {/* 빗면 */}
        <polygon 
          points={`0,300 ${300*Math.cos(angleRad)},${300-300*Math.sin(angleRad)} ${300*Math.cos(angleRad)},300`}
          fill="#3498db"
        />
        
        {/* 물체 */}
        <g transform={`translate(${pos.x}, ${pos.y}) rotate(${params.angle})`}>
          <rect 
            x="-15" y="-15" 
            width="30" height="30" 
            fill="#e74c3c"
            stroke="white"
            strokeWidth="2"
          />
          <text x="0" y="5" textAnchor="middle" fill="white" fontSize="14">A</text>
        </g>
      </svg>
      
      {/* 컨트롤 패널 */}
      <ControlPanel 
        params={params}
        setParams={setParams}
        isPlaying={isPlaying}
        setIsPlaying={setIsPlaying}
        onReset={handleReset}
        disabled={isPlaying}  // 재생 중 파라미터 변경 방지
      />
      
      {/* 상태 표시 */}
      <StatusDisplay time={time} position={pos} acceleration={a} />
    </div>
  )
}
```

### Canvas 기반 (권장: 복잡한 시뮬레이션, 많은 물체)
```jsx
import { useRef, useEffect, useState, useCallback } from 'react'

export default function CanvasSimulation() {
  const canvasRef = useRef(null)
  const animationRef = useRef(null)
  const [time, setTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  
  const [params, setParams] = useState({
    angle: 30,
    initialVelocity: 0,
    g: 10,
  })
  
  // 물리 계산 함수
  const physics = useCallback((t) => {
    const angleRad = (params.angle * Math.PI) / 180
    const a = params.g * Math.sin(angleRad)
    const v = params.initialVelocity + a * t
    const s = params.initialVelocity * t + 0.5 * a * t * t
    
    return { a, v, s, angleRad }
  }, [params])
  
  // Canvas 렌더링
  const render = useCallback((ctx, t) => {
    const { a, v, s, angleRad } = physics(t)
    const width = ctx.canvas.width
    const height = ctx.canvas.height
    
    // 클리어
    ctx.clearRect(0, 0, width, height)
    
    // 배경
    ctx.fillStyle = '#f8f9fa'
    ctx.fillRect(0, 0, width, height)
    
    // 빗면
    ctx.beginPath()
    ctx.moveTo(50, height - 50)
    const slopeEndX = 50 + 300 * Math.cos(angleRad)
    const slopeEndY = height - 50 - 300 * Math.sin(angleRad)
    ctx.lineTo(slopeEndX, slopeEndY)
    ctx.lineTo(slopeEndX, height - 50)
    ctx.closePath()
    ctx.fillStyle = '#3498db'
    ctx.fill()
    
    // 물체 위치
    const scale = 50  // 픽셀/m
    const objX = 80 + s * scale * Math.cos(angleRad)
    const objY = height - 80 - s * scale * Math.sin(angleRad)
    
    // 물체
    ctx.save()
    ctx.translate(objX, objY)
    ctx.rotate(angleRad)
    ctx.fillStyle = '#e74c3c'
    ctx.fillRect(-15, -15, 30, 30)
    ctx.strokeStyle = 'white'
    ctx.lineWidth = 2
    ctx.strokeRect(-15, -15, 30, 30)
    
    // 라벨
    ctx.fillStyle = 'white'
    ctx.font = 'bold 14px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('A', 0, 0)
    ctx.restore()
    
    // 정보 표시
    ctx.fillStyle = '#2c3e50'
    ctx.font = '12px monospace'
    ctx.textAlign = 'left'
    ctx.fillText(`t = ${t.toFixed(2)} s`, 10, 20)
    ctx.fillText(`v = ${v.toFixed(2)} m/s`, 10, 35)
    ctx.fillText(`s = ${s.toFixed(2)} m`, 10, 50)
    ctx.fillText(`a = ${a.toFixed(2)} m/s²`, 10, 65)
  }, [physics])
  
  // 애니메이션 루프
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    
    if (isPlaying) {
      let startTime = performance.now() - time * 1000
      
      const animate = (currentTime) => {
        const elapsed = (currentTime - startTime) / 1000
        setTime(elapsed)
        render(ctx, elapsed)
        animationRef.current = requestAnimationFrame(animate)
      }
      
      animationRef.current = requestAnimationFrame(animate)
    } else {
      render(ctx, time)
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isPlaying, render, time])
  
  // 리셋 (필수!)
  const handleReset = () => {
    setIsPlaying(false)
    setTime(0)
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
    // 초기 상태 렌더링
    const ctx = canvasRef.current.getContext('2d')
    render(ctx, 0)
  }
  
  return (
    <div className="simulation-container">
      <canvas 
        ref={canvasRef} 
        width={500} 
        height={350}
        style={{ border: '1px solid #ddd', borderRadius: '8px' }}
      />
      
      <ControlPanel 
        params={params}
        setParams={setParams}
        isPlaying={isPlaying}
        setIsPlaying={setIsPlaying}
        onReset={handleReset}
        disabled={isPlaying}
      />
    </div>
  )
}
```

---

## 2. 컨트롤 패널

### 파라미터 조절 UI
```jsx
function ControlPanel({ params, setParams, isPlaying, setIsPlaying, onReset, disabled }) {
  const handleParamChange = (key, value) => {
    // 재생 중이면 자동 리셋
    if (isPlaying) {
      setIsPlaying(false)
    }
    setParams(prev => ({ ...prev, [key]: value }))
  }
  
  return (
    <div className="control-panel">
      {/* 재생 컨트롤 */}
      <div className="playback-controls">
        <button 
          onClick={() => setIsPlaying(!isPlaying)}
          className={`btn ${isPlaying ? 'btn-pause' : 'btn-play'}`}
        >
          {isPlaying ? '⏸ 정지' : '▶ 재생'}
        </button>
        
        <button 
          onClick={onReset}
          className="btn btn-reset"
        >
          ↺ 리셋
        </button>
      </div>
      
      {/* 파라미터 슬라이더 */}
      <div className="param-group">
        <label>
          빗면 각도: {params.angle}°
          <input
            type="range"
            min="10"
            max="60"
            step="1"
            value={params.angle}
            onChange={(e) => handleParamChange('angle', Number(e.target.value))}
            disabled={disabled}
          />
        </label>
        
        <label>
          마찰 계수: {params.friction?.toFixed(2) ?? 0}
          <input
            type="range"
            min="0"
            max="0.5"
            step="0.01"
            value={params.friction ?? 0}
            onChange={(e) => handleParamChange('friction', Number(e.target.value))}
            disabled={disabled}
          />
        </label>
        
        <label>
          질량: {params.mass} kg
          <input
            type="range"
            min="0.5"
            max="5"
            step="0.5"
            value={params.mass}
            onChange={(e) => handleParamChange('mass', Number(e.target.value))}
            disabled={disabled}
          />
        </label>
        
        <label>
          초기 속력: {params.initialVelocity ?? 0} m/s
          <input
            type="range"
            min="0"
            max="10"
            step="0.5"
            value={params.initialVelocity ?? 0}
            onChange={(e) => handleParamChange('initialVelocity', Number(e.target.value))}
            disabled={disabled}
          />
        </label>
      </div>
    </div>
  )
}
```

### 스타일 (Tailwind 또는 CSS)
```css
.simulation-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.control-panel {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.playback-controls {
  display: flex;
  gap: 0.5rem;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-play {
  background: #27ae60;
  color: white;
}

.btn-pause {
  background: #f39c12;
  color: white;
}

.btn-reset {
  background: #e74c3c;
  color: white;
}

.btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.param-group {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.param-group label {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.875rem;
  color: #495057;
}

.param-group input[type="range"] {
  width: 100%;
  accent-color: #3498db;
}
```

---

## 3. 상태 표시 컴포넌트

```jsx
function StatusDisplay({ time, position, acceleration }) {
  return (
    <div className="status-display">
      <div className="status-item">
        <span className="status-label">시간</span>
        <span className="status-value">{time.toFixed(2)} s</span>
      </div>
      <div className="status-item">
        <span className="status-label">변위</span>
        <span className="status-value">{position.s.toFixed(2)} m</span>
      </div>
      <div className="status-item">
        <span className="status-label">속력</span>
        <span className="status-value">{position.v.toFixed(2)} m/s</span>
      </div>
      <div className="status-item">
        <span className="status-label">가속도</span>
        <span className="status-value">{acceleration.toFixed(2)} m/s²</span>
      </div>
    </div>
  )
}
```

```css
.status-display {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  padding: 0.75rem;
  background: #2c3e50;
  border-radius: 8px;
  font-family: monospace;
}

.status-item {
  display: flex;
  flex-direction: column;
  min-width: 80px;
}

.status-label {
  font-size: 0.75rem;
  color: #95a5a6;
}

.status-value {
  font-size: 1rem;
  color: #ecf0f1;
  font-weight: 600;
}
```

---

## 4. 벡터 표시

### 힘 벡터 (SVG)
```jsx
function ForceVector({ x, y, fx, fy, color = '#4ade80', label, scale = 10 }) {
  const endX = x + fx * scale
  const endY = y - fy * scale  // SVG는 y가 아래로 증가
  
  const angle = Math.atan2(-fy, fx)
  const headLength = 10
  
  return (
    <g className="force-vector">
      {/* 화살표 몸통 */}
      <line 
        x1={x} y1={y} 
        x2={endX} y2={endY}
        stroke={color}
        strokeWidth="3"
        markerEnd="url(#arrowhead)"
      />
      
      {/* 화살표 머리 */}
      <polygon
        points={`
          ${endX},${endY}
          ${endX - headLength * Math.cos(angle - Math.PI/6)},${endY + headLength * Math.sin(angle - Math.PI/6)}
          ${endX - headLength * Math.cos(angle + Math.PI/6)},${endY + headLength * Math.sin(angle + Math.PI/6)}
        `}
        fill={color}
      />
      
      {/* 라벨 */}
      {label && (
        <text
          x={endX + 10}
          y={endY}
          fill={color}
          fontSize="14"
          fontWeight="bold"
        >
          {label}
        </text>
      )}
    </g>
  )
}
```

### 속도 벡터 표시
```jsx
function VelocityVector({ x, y, vx, vy, scale = 5 }) {
  return (
    <ForceVector 
      x={x} y={y} 
      fx={vx} fy={vy}
      color="#60a5fa"
      label={`v = ${Math.sqrt(vx*vx + vy*vy).toFixed(1)} m/s`}
      scale={scale}
    />
  )
}
```

---

## 5. 궤적 표시

```jsx
function Trajectory({ points, color = '#9b59b6', showDots = true }) {
  if (points.length < 2) return null
  
  const pathD = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ')
  
  return (
    <g className="trajectory">
      {/* 궤적 선 */}
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeDasharray="5,3"
        opacity="0.7"
      />
      
      {/* 점 (선택적) */}
      {showDots && points.filter((_, i) => i % 10 === 0).map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r="3"
          fill={color}
        />
      ))}
    </g>
  )
}

// 사용
const [trajectory, setTrajectory] = useState([])

// 애니메이션 루프에서
setTrajectory(prev => [...prev.slice(-100), { x: pos.x, y: pos.y }])

// 렌더링
<Trajectory points={trajectory} />
```

---

## 6. 다중 물체 시스템

### 도르래 연결 시스템
```jsx
function PulleySystem() {
  const [time, setTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  
  const [params, setParams] = useState({
    massA: 3,
    massB: 2,
    angleA: 30,
    angleB: 45,
    g: 10,
  })
  
  // 물리 계산
  const physics = useMemo(() => {
    const { massA, massB, angleA, angleB, g } = params
    const radA = (angleA * Math.PI) / 180
    const radB = (angleB * Math.PI) / 180
    
    // 가속도 계산
    const a = (massB * Math.sin(radB) - massA * Math.sin(radA)) * g / (massA + massB)
    
    return { a, radA, radB }
  }, [params])
  
  const getPositions = (t) => {
    const s = 0.5 * physics.a * t * t
    const v = physics.a * t
    
    return {
      A: {
        x: 100 - s * Math.cos(physics.radA) * 30,
        y: 200 - s * Math.sin(physics.radA) * 30,
        s, v,
      },
      B: {
        x: 300 + s * Math.cos(physics.radB) * 30,
        y: 200 - s * Math.sin(physics.radB) * 30,
        s, v,
      }
    }
  }
  
  const positions = getPositions(time)
  
  // 리셋 (필수!)
  const handleReset = () => {
    setIsPlaying(false)
    setTime(0)
  }
  
  return (
    <div className="simulation-container">
      <svg viewBox="0 0 400 300">
        {/* 왼쪽 빗면 */}
        <polygon points="0,250 150,250 150,150" fill="#3498db" />
        
        {/* 오른쪽 빗면 */}
        <polygon points="400,250 250,250 250,120" fill="#27ae60" />
        
        {/* 도르래 */}
        <circle cx="200" cy="80" r="20" fill="#ecf0f1" stroke="#2c3e50" strokeWidth="3" />
        <circle cx="200" cy="80" r="3" fill="#2c3e50" />
        
        {/* 실 */}
        <line x1={positions.A.x} y1={positions.A.y} x2="185" y2="85" 
              stroke="#2c3e50" strokeWidth="2" />
        <line x1="215" y1="85" x2={positions.B.x} y2={positions.B.y}
              stroke="#2c3e50" strokeWidth="2" />
        
        {/* 물체 A */}
        <g transform={`translate(${positions.A.x}, ${positions.A.y}) rotate(-${params.angleA})`}>
          <rect x="-15" y="-15" width="30" height="30" fill="#e74c3c" stroke="white" strokeWidth="2" />
          <text x="0" y="5" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">A</text>
        </g>
        
        {/* 물체 B */}
        <g transform={`translate(${positions.B.x}, ${positions.B.y}) rotate(${params.angleB})`}>
          <rect x="-12" y="-12" width="24" height="24" fill="#9b59b6" stroke="white" strokeWidth="2" />
          <text x="0" y="4" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">B</text>
        </g>
      </svg>
      
      <ControlPanel 
        params={params}
        setParams={setParams}
        isPlaying={isPlaying}
        setIsPlaying={setIsPlaying}
        onReset={handleReset}
        disabled={isPlaying}
      />
    </div>
  )
}
```

---

## 7. MDX 임포트

### Astro 설정 (astro.config.mjs)
```js
import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import mdx from '@astrojs/mdx'

export default defineConfig({
  integrations: [react(), mdx()],
})
```

### MDX 파일에서 사용
```mdx
---
title: 빗면 운동 시뮬레이션
---

import InclinedPlaneSimulation from '@/components/physics/InclinedPlaneSimulation'
import { Callout } from '@/components/ui/Callout'

# 빗면에서의 등가속도 운동

아래 시뮬레이션에서 각도와 마찰 계수를 조절해보세요.

<InclinedPlaneSimulation client:load />

<Callout type="info">
각도를 높이면 가속도가 커집니다: $a = g\sin\theta$
</Callout>

## 이론

마찰이 없는 빗면에서 가속도는 다음과 같습니다:

$$
a = g \sin\theta
$$

마찰이 있는 경우:

$$
a = g(\sin\theta - \mu\cos\theta)
$$
```

### client:load 디렉티브
```mdx
{/* 페이지 로드 시 즉시 하이드레이션 */}
<Simulation client:load />

{/* 뷰포트에 들어올 때 하이드레이션 (성능 최적화) */}
<Simulation client:visible />

{/* 브라우저가 idle 상태일 때 */}
<Simulation client:idle />
```

---

## 8. 반응형 처리

```jsx
function ResponsiveSimulation() {
  const containerRef = useRef(null)
  const [dimensions, setDimensions] = useState({ width: 400, height: 300 })
  
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth
        setDimensions({
          width,
          height: width * 0.75,  // 4:3 비율 유지
        })
      }
    }
    
    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])
  
  return (
    <div ref={containerRef} style={{ width: '100%' }}>
      <svg 
        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
        style={{ width: '100%', height: 'auto' }}
      >
        {/* ... */}
      </svg>
    </div>
  )
}
```

---

## 9. 필수 요소 체크리스트

### 모든 시뮬레이션에 필수:
- [ ] **리셋 버튼** - 초기 상태로 복원
- [ ] **재생/정지 버튼** - 애니메이션 제어
- [ ] **상태 표시** - 현재 시간, 물리량
- [ ] **파라미터 조절** - 재생 전 변경 가능

### 권장:
- [ ] 궤적 표시 토글
- [ ] 벡터 표시 토글
- [ ] 속도 조절 (0.5x, 1x, 2x)
- [ ] 특정 시점 일시정지

---

## 10. 성능 최적화

### requestAnimationFrame 정리
```jsx
useEffect(() => {
  let animationId
  
  if (isPlaying) {
    const animate = () => {
      // 업데이트
      animationId = requestAnimationFrame(animate)
    }
    animationId = requestAnimationFrame(animate)
  }
  
  return () => {
    if (animationId) {
      cancelAnimationFrame(animationId)
    }
  }
}, [isPlaying])
```

### 불필요한 리렌더 방지
```jsx
// 물리 계산 메모이제이션
const physics = useMemo(() => calculatePhysics(params), [params])

// 콜백 메모이제이션
const handleReset = useCallback(() => {
  setTime(0)
  setIsPlaying(false)
}, [])
```

### Canvas vs SVG 선택
```
물체 1~5개, 간단한 도형 → SVG
물체 10개 이상, 복잡한 렌더링 → Canvas
파티클 효과, 연속 궤적 → Canvas
```
