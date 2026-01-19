// src/components/simulations/FreebodyDiagram.jsx
// 자유물체도 시뮬레이션
//
// MDX에서 사용:
// import FBD from '@/components/simulations/FreebodyDiagram'
// <FBD client:only="react" />

import { useControls, folder } from 'leva'
import { PhysicsCanvas2D } from '../PhysicsCanvas'
import { Arrow } from '../Arrow'
import { Axis, Grid2D } from '../Axis'
import { Ground, PhysicsBox, AngleArc, RightAngle } from '../Shapes'
import { InfoPanel } from '../InfoPanel'
import { Text } from '@react-three/drei'

function Scene() {
  const { mass, friction, angle, showComponents } = useControls({
    '물체': folder({
      mass: { value: 5, min: 1, max: 20, step: 0.5, label: '질량 m (kg)' },
    }),
    '경사면': folder({
      angle: { value: 30, min: 0, max: 60, step: 1, label: '경사각 θ (°)' },
      friction: { value: 0.3, min: 0, max: 1, step: 0.05, label: '마찰계수 μ' },
    }),
    '표시': folder({
      showComponents: { value: true, label: '성분 표시' }
    })
  })

  const g = 9.8
  const thetaRad = (angle * Math.PI) / 180
  
  // 힘 계산
  const W = mass * g
  const Wx = W * Math.sin(thetaRad)  // 경사면 방향
  const Wy = W * Math.cos(thetaRad)  // 경사면 수직
  const N = Wy  // 수직항력
  const f = friction * N  // 마찰력
  const Fnet = Wx - f  // 알짜힘

  // 스케일 (시각화용)
  const scale = 0.03

  
  // 경사면 위치
  const groundWidth = 8
  const groundStart = [-4, -1, 0]
  const groundEnd = [-4 + groundWidth * Math.cos(thetaRad), -1 + groundWidth * Math.sin(thetaRad), 0]

  // 물체 위치 (경사면 중간)
  const objX = groundWidth / 2 * Math.cos(thetaRad) - 4 - 0.2 * Math.cos(thetaRad)
  const objY = groundWidth / 2 * Math.sin(thetaRad) - 1 + 0.2 * Math.sin(thetaRad)

  return (
    <>
      <Grid2D size={10} divisions={10} />
      <axesHelper args={[5]} />
      {/* 경사면 */}
      <Ground 
        start={groundStart} 
        end={groundEnd} 
        hatchCount={15}
      />
      
      {/* 물체 (점으로 표현) */}
      <mesh position={[objX, objY, 0]}>
        <circleGeometry args={[0.2, 32]} />
        <meshBasicMaterial color="#64748b" />
        <axesHelper args={[5]} /> 
      </mesh>
      <Text position={[objX, objY, 0]} fontSize={0.15} color="white">
        m
      </Text>

      {/* 중력 W (아래로) */}
      <Arrow 
        from={[objX, objY, 0]} 
        to={[objX, objY - W * scale, 0]} 
        color="#2563eb"
        label="W"
        labelOffset={[0, 0, 0]}
      />

      {/* 수직항력 N */}
      <Arrow 
        from={[objX, objY, 0]} 
        to={[
          objX - N * scale * Math.sin(thetaRad),
          objY + N * scale * Math.cos(thetaRad),
          0
        ]} 
        color="#dc2626"
        label="N"
      />

      {/* 마찰력 f (경사면 위 방향) */}
      {friction > 0 && (
        <Arrow 
          from={[objX, objY, 0]} 
          to={[
            objX - f * scale * Math.cos(thetaRad),
            objY - f * scale * Math.sin(thetaRad),
            0
          ]} 
          color="#ea580c"
          label="f"
        />
      )}

      {/* 성분 표시 */}
      {showComponents && (
        <>
          {/* Wx (경사면 아래 방향) */}
          <Arrow 
            from={[objX, objY, 0]} 
            to={[
              objX + Wx * scale * Math.cos(thetaRad),
              objY + Wx * scale * Math.sin(thetaRad),
              0
            ]} 
            color="#16a34a"
            label="Wx"
          />
          {/* Wy (경사면 누르는 방향) */}
          <Arrow 
            from={[objX, objY, 0]} 
            to={[
              objX + Wy * scale * Math.sin(thetaRad),
              objY - Wy * scale * Math.cos(thetaRad),
              0
            ]} 
            color="#7c3aed"
            label="Wy"
          />
        </>
      )}

      {/* 각도 표시 */}
      <AngleArc 
        center={[-4, -1, 0]} 
        startAngle={0} 
        endAngle={angle} 
        radius={1}
        label={`${angle}°`}
      />

      {/* 정보 패널 */}
      {/* <InfoPanel position={[4, 3, 0]} title="🎯 자유물체도" width="220px">
        <div style={{ fontSize: '13px', lineHeight: '1.7' }}>
          <p>m = {mass} kg, θ = {angle}°, μ = {friction}</p>
          <hr style={{ margin: '8px 0' }} />
          <p><span style={{color:'#2563eb'}}>■</span> W = mg = <b>{W.toFixed(1)}</b> N</p>
          <p><span style={{color:'#dc2626'}}>■</span> N = <b>{N.toFixed(1)}</b> N</p>
          <p><span style={{color:'#ea580c'}}>■</span> f = μN = <b>{f.toFixed(1)}</b> N</p>
          {showComponents && (
            <>
              <hr style={{ margin: '8px 0' }} />
              <p><span style={{color:'#16a34a'}}>■</span> Wx = mg sin θ = <b>{Wx.toFixed(1)}</b> N</p>
              <p><span style={{color:'#7c3aed'}}>■</span> Wy = mg cos θ = <b>{Wy.toFixed(1)}</b> N</p>
            </>
          )}
          <hr style={{ margin: '8px 0' }} />
          <p style={{
            padding: '6px',
            background: Fnet > 0.1 ? '#fef2f2' : Fnet < -0.1 ? '#f0fdf4' : '#fffbeb',
            borderRadius: '4px'
          }}>
            Fnet = Wx - f = <b>{Fnet.toFixed(1)}</b> N<br/>
            <small>
              {Fnet > 0.1 ? '→ 미끄러져 내려감' : 
               Fnet < -0.1 ? '→ 올라감 (외력 필요)' : 
               '→ 평형 상태'}
            </small>
          </p>
        </div>
      </InfoPanel> */}
    </>
  )
}

export default function FreebodyDiagram() {
  return (
    <PhysicsCanvas2D height="550px" zoom={35}>
      <Scene />
    </PhysicsCanvas2D>
  )
}
