// src/components/physics3d/Axis.jsx
// 좌표축과 그리드 컴포넌트
//
// 사용 예시:
// <Axis size={5} />
// <Grid2D size={10} divisions={10} />

import { Text, Line, Grid } from '@react-three/drei'
import * as THREE from 'three'

// 2D/3D 좌표축
export function Axis({ 
  size = 5, 
  showLabels = true,
  showArrows = true,
  xColor = '#666',
  yColor = '#666',
  zColor = '#666',
  is2D = false  // true면 z축 숨김
}) {
  return (
    <group>
      {/* X축 */}
      <Line
        points={[[-size, 0, 0], [size, 0, 0]]}
        color={xColor}
        lineWidth={1}
      />
      {showArrows && (
        <mesh position={[size, 0, 0]} rotation={[0, 0, -Math.PI/2]}>
          <coneGeometry args={[0.05, 0.15, 8]} />
          <meshBasicMaterial color={xColor} />
        </mesh>
      )}
      {showLabels && (
        <Text position={[size + 0.3, 0, 0]} fontSize={0.2} color={xColor}>
          x
        </Text>
      )}

      {/* Y축 */}
      <Line
        points={[[0, -size, 0], [0, size, 0]]}
        color={yColor}
        lineWidth={1}
      />
      {showArrows && (
        <mesh position={[0, size, 0]}>
          <coneGeometry args={[0.05, 0.15, 8]} />
          <meshBasicMaterial color={yColor} />
        </mesh>
      )}
      {showLabels && (
        <Text position={[0, size + 0.3, 0]} fontSize={0.2} color={yColor}>
          y
        </Text>
      )}

      {/* Z축 (3D 전용) */}
      {!is2D && (
        <>
          <Line
            points={[[0, 0, -size], [0, 0, size]]}
            color={zColor}
            lineWidth={1}
          />
          {showArrows && (
            <mesh position={[0, 0, size]} rotation={[Math.PI/2, 0, 0]}>
              <coneGeometry args={[0.05, 0.15, 8]} />
              <meshBasicMaterial color={zColor} />
            </mesh>
          )}
          {showLabels && (
            <Text position={[0, 0, size + 0.3]} fontSize={0.2} color={zColor}>
              z
            </Text>
          )}
        </>
      )}
    </group>
  )
}

// 2D 그리드 (XY 평면)
export function Grid2D({
  size = 10,
  divisions = 10,
  color1 = '#e5e5e5',
  color2 = '#cccccc',
  opacity = 0.5
}) {
  return (
    <Grid
      args={[size, size]}
      cellSize={size / divisions}
      cellThickness={0.5}
      cellColor={color1}
      sectionSize={size / (divisions / 5)}
      sectionThickness={1}
      sectionColor={color2}
      fadeDistance={50}
      infiniteGrid={false}
      position={[0, 0, -0.01]} // 약간 뒤로 (z-fighting 방지)
    />
  )
}

// 눈금 표시가 있는 축
export function ScaledAxis({
  size = 5,
  tickInterval = 1,
  showNumbers = true,
  color = '#888'
}) {
  const ticks = []
  for (let i = -size; i <= size; i += tickInterval) {
    if (i === 0) continue
    ticks.push(i)
  }

  return (
    <group>
      {/* X축 눈금 */}
      {ticks.map(t => (
        <group key={`x-${t}`}>
          <Line points={[[t, -0.1, 0], [t, 0.1, 0]]} color={color} lineWidth={1} />
          {showNumbers && (
            <Text position={[t, -0.3, 0]} fontSize={0.15} color={color}>
              {t}
            </Text>
          )}
        </group>
      ))}
      
      {/* Y축 눈금 */}
      {ticks.map(t => (
        <group key={`y-${t}`}>
          <Line points={[[-0.1, t, 0], [0.1, t, 0]]} color={color} lineWidth={1} />
          {showNumbers && (
            <Text position={[-0.3, t, 0]} fontSize={0.15} color={color}>
              {t}
            </Text>
          )}
        </group>
      ))}
    </group>
  )
}
