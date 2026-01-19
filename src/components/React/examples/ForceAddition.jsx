
import { useControls } from 'leva'
import { PhysicsCanvas2D } from '../PhysicsCanvas'
import { Arrow } from '../Arrow'
import { Axis, Grid2D, ScaledAxis } from '../Axis'
import { DashedLine } from '../Shapes'
import { InfoPanel } from '../InfoPanel'

function Scene() {
  // 컨트롤 패널
  const { F1x, F1y, F2x, F2y, showGrid } = useControls('힘 조절', {
    F1x: { value: 3, min: -5, max: 5, step: 0.1, label: 'F₁ x' },
    F1y: { value: 0, min: -5, max: 5, step: 0.1, label: 'F₁ y' },
    F2x: { value: 0, min: -5, max: 5, step: 0.1, label: 'F₂ x' },
    F2y: { value: 2, min: -5, max: 5, step: 0.1, label: 'F₂ y' },
    showGrid: { value: true, label: '격자 표시' }
  })

  // 합력 계산
  const Fnet = { x: F1x + F2x, y: F1y + F2y }
  const FnetMag = Math.sqrt(Fnet.x ** 2 + Fnet.y ** 2)
  const FnetAngle = Math.atan2(Fnet.y, Fnet.x) * (180 / Math.PI)

  return (
    <>
      {/* 격자와 축 */}
      {showGrid && <Grid2D size={12} divisions={12} />}
      <Axis size={5} is2D={true} />
      <ScaledAxis size={5} tickInterval={1} />

      {/* 원점 물체 */}
      <mesh position={[0, 0, 0]}>
        <circleGeometry args={[0.15, 32]} />
        <meshBasicMaterial color="#555" />
      </mesh>

      {/* F1 벡터 (파란색) */}
      <Arrow 
        from={[0, 0, 0]} 
        to={[F1x, F1y, 0]} 
        color="#2563eb"
        label="F_1"
      />

      {/* F2 벡터 (빨간색) */}
      <Arrow 
        from={[0, 0, 0]} 
        to={[F2x, F2y, 0]} 
        color="#dc2626"
        label="F₂"
      />

      {/* 합력 Fnet (초록색) */}
      <Arrow 
        from={[0, 0, 0]} 
        to={[Fnet.x, Fnet.y, 0]} 
        color="#16a34a"
        label="Fnet"
        headLength={0.25}
        headWidth={0.12}
      />

      {/* 평행사변형 점선 */}
      <DashedLine from={[F1x, F1y, 0]} to={[Fnet.x, Fnet.y, 0]} />
      <DashedLine from={[F2x, F2y, 0]} to={[Fnet.x, Fnet.y, 0]} />

      {/* 정보 패널 */}s
      <InfoPanel position={[4.5, 3, 0]} title="📐 힘의 합성" accentColor="#16a34a">
        <div style={{ lineHeight: '1.8' }}>
          <p><span style={{color: '#2563eb', fontWeight: 'bold'}}>F₁</span> = ({F1x.toFixed(1)}, {F1y.toFixed(1)}) N</p>
          <p><span style={{color: '#dc2626', fontWeight: 'bold'}}>F₂</span> = ({F2x.toFixed(1)}, {F2y.toFixed(1)}) N</p>
          <hr style={{ margin: '8px 0', borderColor: '#eee' }} />
          <p><span style={{color: '#16a34a', fontWeight: 'bold'}}>Fnet</span> = ({Fnet.x.toFixed(1)}, {Fnet.y.toFixed(1)}) N</p>
          <p style={{ 
            marginTop: '8px', 
            padding: '8px', 
            background: '#f0fdf4', 
            borderRadius: '4px' 
          }}>
            |Fnet| = <strong>{FnetMag.toFixed(2)}</strong> N<br/>
            θ = <strong>{FnetAngle.toFixed(1)}</strong>°
          </p>
        </div>
      </InfoPanel>
    </>
  )
}

export default function ForceAddition() {
  return (
    <PhysicsCanvas2D height="550px" zoom={40}>
      <Scene />
    </PhysicsCanvas2D>
  )
}
