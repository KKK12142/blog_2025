// src/components/physics3d/Shapes.jsx
// 물리 다이어그램용 보조 도형들
//
// 사용 예시:
// <DashedLine from={[0,0,0]} to={[2,2,0]} />
// <AngleArc center={[0,0,0]} startAngle={0} endAngle={45} radius={0.5} />
// <RightAngle position={[1,0,0]} size={0.2} />

import { useMemo } from 'react'
import { Line, Text } from '@react-three/drei'
import * as THREE from 'three'

// 점선
export function DashedLine({
  from = [0, 0, 0],
  to = [1, 1, 0],
  color = '#888',
  dashSize = 0.1,
  gapSize = 0.05
}) {
  return (
    <Line
      points={[from, to]}
      color={color}
      lineWidth={1}
      dashed
      dashSize={dashSize}
      gapSize={gapSize}
    />
  )
}

// 각도 호 (θ 표시용)
export function AngleArc({
  center = [0, 0, 0],
  radius = 0.5,
  startAngle = 0,    // 도 단위
  endAngle = 90,     // 도 단위
  color = '#ea580c',
  showLabel = true,
  label = 'θ',
  segments = 32
}) {
  const points = useMemo(() => {
    const pts = []
    const startRad = THREE.MathUtils.degToRad(startAngle)
    const endRad = THREE.MathUtils.degToRad(endAngle)
    
    for (let i = 0; i <= segments; i++) {
      const angle = startRad + (endRad - startRad) * (i / segments)
      pts.push([
        center[0] + radius * Math.cos(angle),
        center[1] + radius * Math.sin(angle),
        center[2]
      ])
    }
    return pts
  }, [center, radius, startAngle, endAngle, segments])

  const midAngle = THREE.MathUtils.degToRad((startAngle + endAngle) / 2)
  const labelPos = [
    center[0] + (radius + 0.2) * Math.cos(midAngle),
    center[1] + (radius + 0.2) * Math.sin(midAngle),
    center[2]
  ]

  return (
    <group>
      <Line points={points} color={color} lineWidth={2} />
      {showLabel && (
        <Text position={labelPos} fontSize={0.2} color={color}>
          {label}
        </Text>
      )}
    </group>
  )
}

// 직각 표시 (ㄱ 모양)
export function RightAngle({
  position = [0, 0, 0],
  size = 0.2,
  rotation = 0,  // 도 단위
  color = '#ea580c'
}) {
  const rotRad = THREE.MathUtils.degToRad(rotation)
  
  const points = useMemo(() => {
    // 기본 직각 모양 (0도일 때)
    const base = [
      [size, 0],
      [size, size],
      [0, size]
    ]
    
    // 회전 적용
    return base.map(([x, y]) => [
      position[0] + x * Math.cos(rotRad) - y * Math.sin(rotRad),
      position[1] + x * Math.sin(rotRad) + y * Math.cos(rotRad),
      position[2]
    ])
  }, [position, size, rotRad])

  return <Line points={points} color={color} lineWidth={2} />
}

// 바닥/경사면 (빗금 포함)
export function Ground({
  start = [-3, 0, 0],
  end = [3, 0, 0],
  hatchCount = 10,
  hatchLength = 0.2,
  color = '#666'
}) {
  const length = Math.sqrt(
    Math.pow(end[0] - start[0], 2) + 
    Math.pow(end[1] - start[1], 2)
  )
  const angle = Math.atan2(end[1] - start[1], end[0] - start[0])
  
  const hatches = []
  for (let i = 0; i <= hatchCount; i++) {
    const t = i / hatchCount
    const x = start[0] + (end[0] - start[0]) * t
    const y = start[1] + (end[1] - start[1]) * t
    hatches.push([
      [x, y, 0],
      [
        x - hatchLength * Math.cos(angle + Math.PI/4),
        y - hatchLength * Math.sin(angle + Math.PI/4),
        0
      ]
    ])
  }

  return (
    <group>
      {/* 메인 라인 */}
      <Line points={[start, end]} color={color} lineWidth={2} />
      {/* 빗금 */}
      {hatches.map((pts, i) => (
        <Line key={i} points={pts} color={color} lineWidth={1} />
      ))}
    </group>
  )
}

// 스프링 모양 (탄성력용)
export function Spring({
  from = [0, 0, 0],
  to = [2, 0, 0],
  coils = 8,
  radius = 0.15,
  color = '#666'
}) {
  const points = useMemo(() => {
    const pts = []
    const dx = to[0] - from[0]
    const dy = to[1] - from[1]
    const dz = to[2] - from[2]
    const length = Math.sqrt(dx*dx + dy*dy + dz*dz)
    
    // 시작점
    pts.push(from)
    
    // 코일
    const coilLength = length * 0.8
    const startOffset = length * 0.1
    
    for (let i = 0; i <= coils * 20; i++) {
      const t = i / (coils * 20)
      const coilAngle = t * coils * Math.PI * 2
      const progress = startOffset + t * coilLength
      
      // 진행 방향으로 이동하면서 코일
      const baseX = from[0] + (dx / length) * progress
      const baseY = from[1] + (dy / length) * progress
      const baseZ = from[2] + (dz / length) * progress
      
      // 수직 방향 오프셋 (간단히 y방향 사용)
      const offsetY = Math.sin(coilAngle) * radius
      const offsetZ = Math.cos(coilAngle) * radius
      
      pts.push([baseX, baseY + offsetY, baseZ + offsetZ])
    }
    
    // 끝점
    pts.push(to)
    
    return pts
  }, [from, to, coils, radius])

  return <Line points={points} color={color} lineWidth={1.5} />
}

// 물체 (박스, 원 등)
export function PhysicsBox({
  position = [0, 0, 0],
  size = [1, 1, 0.2],
  color = '#94a3b8',
  label = 'm',
  showLabel = true
}) {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={size} />
        <meshStandardMaterial color={color} />
      </mesh>
      {showLabel && (
        <Text position={[0, 0, size[2]/2 + 0.01]} fontSize={0.3} color="#333">
          {label}
        </Text>
      )}
    </group>
  )
}

export function PhysicsCircle({
  position = [0, 0, 0],
  radius = 0.5,
  color = '#94a3b8',
  label = 'm',
  showLabel = true
}) {
  return (
    <group position={position}>
      <mesh>
        <circleGeometry args={[radius, 32]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {showLabel && (
        <Text position={[0, 0, 0.01]} fontSize={radius * 0.5} color="#333">
          {label}
        </Text>
      )}
    </group>
  )
}
