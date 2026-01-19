import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Grid, Text, Line } from '@react-three/drei'
import { useControls, folder, button } from 'leva'
import { useRef, useState, useMemo } from 'react'

// 물리 상수
const g = 10

function InclinedPlaneSimulation3D() {
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

export default function TestThree() {
  return (
    <InclinedPlaneSimulation3D />
  )
}