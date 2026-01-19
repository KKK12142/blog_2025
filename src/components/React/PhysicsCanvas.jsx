// src/components/physics3d/PhysicsCanvas.jsx
// 물리 시뮬레이션용 Canvas 래퍼
//
// 사용 예시:
// <PhysicsCanvas2D>{children}</PhysicsCanvas2D>
// <PhysicsCanvas3D>{children}</PhysicsCanvas3D>

import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'

// 2D 시뮬레이션용 (벡터, FBD, 그래프 등)
export function PhysicsCanvas2D({ 
  children, 
  height = '500px',
  zoom = 50,
  showControls = true,
  background = '#fafafa',
  style = {}
}) {
  return (
    <div style={{ 
      width: '100%', 
      height, 
      borderRadius: '8px',
      overflow: 'hidden',
      ...style 
    }}>
      <Canvas
        orthographic
        camera={{ 
          zoom, 
          position: [0, 0, 100],
          near: 0.1,
          far: 1000
        }}
        style={{ background }}
        dpr={[1, 2]}
      >
        {/* 기본 조명 (2D에서도 Material에 필요) */}
        <ambientLight intensity={0.8} />
        
        {children}
        
        {showControls && (
          <OrbitControls 
            enableRotate={false}  // 2D니까 회전 비활성화
            enablePan={true}
            enableZoom={true}
            minZoom={10}
            maxZoom={200}
          />
        )}
      </Canvas>
    </div>
  )
}

// 3D 시뮬레이션용 (돌림힘, 경사면, 3D 물체 등)
export function PhysicsCanvas3D({ 
  children, 
  height = '500px',
  cameraPosition = [5, 4, 5],
  fov = 50,
  showControls = true,
  background = 'linear-gradient(to bottom, #f0f9ff, #e0f2fe)',
  style = {}
}) {
  return (
    <div style={{ 
      width: '100%', 
      height, 
      borderRadius: '8px',
      overflow: 'hidden',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      ...style 
    }}>
      <Canvas
        camera={{ 
          position: cameraPosition, 
          fov,
          near: 0.1,
          far: 1000
        }}
        style={{ background }}
        dpr={[1, 2]}
        shadows
      >
        {/* 3D 조명 세트 */}
        <ambientLight intensity={0.5} />
        <directionalLight 
          position={[5, 10, 5]} 
          intensity={0.8}
          castShadow
        />
        <pointLight position={[-5, 5, -5]} intensity={0.3} />
        
        {children}
        
        {showControls && (
          <OrbitControls 
            enableDamping
            dampingFactor={0.05}
            minDistance={2}
            maxDistance={20}
            // 터치 지원 (태블릿용)
            touches={{
              ONE: 0, // ROTATE
              TWO: 2  // DOLLY_PAN
            }}
          />
        )}
      </Canvas>
    </div>
  )
}

// 반응형 높이 (선택적으로 사용)
export function ResponsiveCanvas({ children, aspectRatio = 16/9, ...props }) {
  return (
    <div style={{ 
      width: '100%', 
      paddingBottom: `${(1/aspectRatio) * 100}%`,
      position: 'relative'
    }}>
      <div style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0 
      }}>
        <PhysicsCanvas3D height="100%" {...props}>
          {children}
        </PhysicsCanvas3D>
      </div>
    </div>
  )
}
