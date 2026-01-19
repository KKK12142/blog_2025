import { useState, useEffect, useRef } from 'react'

export default function PulleySystemSimulation() {
  const [time, setTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [mode, setMode] = useState('connected') // 'connected' or 'disconnected'
  const animationRef = useRef(null)
  const lastTimeRef = useRef(0)

  // 물리 상수
  const g = 10
  const m = 1 // 기준 질량 (kg)

  // 빗면 각도: sinθ = 2/5 (문제 조건에서 a_B = g sinθ = 2g/5)
  const sinTheta = 2 / 5
  const cosTheta = Math.sqrt(1 - sinTheta * sinTheta) // √21/5
  const theta = Math.asin(sinTheta)

  // 질량들
  const massA = 5 * m
  const massD = m
  // M_C 계산: a_C = g/3 조건에서 유도
  // 5mg - T_A = 5m(g/3) → T_A = 10mg/3
  // T_D - mg = m(g/3) → T_D = 4mg/3
  // T_A - T_D - M_C·g·sinθ = M_C(g/3)
  // 10mg/3 - 4mg/3 = M_C·g(2/5 + 1/3) = M_C·g(11/15)
  // 2mg = M_C·g(11/15) → M_C = 30m/11
  const massC = (30 * m) / 11
  const massB = massC // B와 C 같은 질량으로 가정

  // ========== 가속도 계산 ==========

  // (가) 연결 상태: A, B, C, D 모두 연결
  // A 아래로, B+C 빗면 위로, D 위로 → 같은 가속도 크기
  // 양의 방향: A 아래, C 빗면 위, D 위
  // 힘의 합 = 전체 질량 × 가속도
  // m_A·g - (m_B + m_C)·g·sinθ - m_D·g = (m_A + m_B + m_C + m_D)·a
  const totalMassConnected = massA + massB + massC + massD
  const netForceConnected = massA * g - (massB + massC) * g * sinTheta - massD * g
  const aConnected = netForceConnected / totalMassConnected

  // (나) p 끊어진 후
  // B: 빗면에서 자유롭게 미끄러짐 (아래로)
  const aB_disconnected = g * sinTheta // = 2g/5 = 4 m/s² (빗면 아래 방향이 양)

  // A-C-D 시스템: A 아래로, C 빗면 위로, D 위로
  // m_A·g - m_C·g·sinθ - m_D·g = (m_A + m_C + m_D)·a
  const totalMassACD = massA + massC + massD
  const netForceACD = massA * g - massC * g * sinTheta - massD * g
  const aC_disconnected = netForceACD / totalMassACD // = g/3

  // 현재 가속도
  const aSystem = mode === 'connected' ? aConnected : aC_disconnected
  const aB = mode === 'connected' ? aConnected : aB_disconnected

  // ========== 장력 p 계산 (연결 상태) ==========
  // B에 대해: T_p - m_B·g·sinθ = m_B·a (빗면 위 방향이 양)
  // T_p = m_B·(g·sinθ + a)
  const Tp = mode === 'connected' ? massB * (g * sinTheta + aConnected) : 0

  // ========== 변위 계산 ==========
  // s = (1/2)·a·t²
  const sSystem = 0.5 * Math.abs(aSystem) * time * time * Math.sign(aSystem)
  const sB_only = 0.5 * aB_disconnected * time * time // B만 미끄러질 때 (항상 양: 아래로)

  // ========== SVG 설정 ==========
  const width = 600
  const height = 420
  const scale = 50 // 1m = 50px

  // 빗면 기하학
  const slopeLength = 180
  const groundY = 350
  const slopeStartX = 120
  const slopeEndX = slopeStartX + slopeLength * cosTheta
  const slopeEndY = groundY - slopeLength * sinTheta

  // 도르래 (빗면 꼭대기)
  const pulleyX = slopeEndX
  const pulleyY = slopeEndY - 20
  const pulleyR = 12

  // 물체 크기
  const boxSize = 30

  // 최대 이동거리 (m)
  const maxDisplacement = 2.5

  // ========== 물체 위치 계산 ==========

  // 변위를 픽셀로 변환 (최대값 제한)
  const clampedS = Math.max(-maxDisplacement, Math.min(maxDisplacement, sSystem))
  const sPixel = clampedS * scale

  // 물체 A 초기 위치 (왼쪽에 매달림)
  const ropeALength = 80
  const objA_initX = slopeStartX - 40
  const objA_initY = pulleyY + ropeALength
  // A는 시스템 가속도 방향으로 이동 (a > 0 이면 아래로)
  const objAx = objA_initX
  const objAy = objA_initY + sPixel // 양의 s = 아래로

  // 물체 C 초기 위치 (빗면 위, 중간쯤)
  const objC_initDist = 80 // 빗면 시작점에서 거리 (px)
  const objC_initX = slopeStartX + objC_initDist * cosTheta
  const objC_initY = groundY - objC_initDist * sinTheta - boxSize / 2
  // C는 시스템 가속도 방향으로 이동 (a > 0 이면 빗면 위로)
  const objCx = objC_initX + sPixel * cosTheta
  const objCy = objC_initY - sPixel * sinTheta

  // 물체 B 위치 (C 뒤쪽, 빗면 아래쪽에)
  const gapBC = 50 // B와 C 사이 간격 (px)
  const objB_initX = objC_initX - gapBC * cosTheta
  const objB_initY = objC_initY + gapBC * sinTheta

  let objBx, objBy
  if (mode === 'connected') {
    // 연결: B는 C와 함께 움직임
    objBx = objB_initX + sPixel * cosTheta
    objBy = objB_initY - sPixel * sinTheta
  } else {
    // 분리: B는 독립적으로 빗면 아래로 미끄러짐
    const sB_pixel = Math.min(sB_only * scale, slopeLength - 50)
    objBx = objB_initX + sB_pixel * cosTheta  // 빗면 아래 방향
    objBy = objB_initY + sB_pixel * sinTheta  // 빗면 아래 방향
  }

  // 물체 D 위치 (오른쪽에 매달림)
  const ropeDLength = 70
  const objD_initX = slopeEndX + 50
  const objD_initY = pulleyY + ropeDLength
  // D는 시스템 가속도 방향으로 이동 (a > 0 이면 위로)
  const objDx = objD_initX
  const objDy = objD_initY - sPixel // 양의 s = 위로

  // ========== 애니메이션 ==========
  useEffect(() => {
    if (isPlaying) {
      lastTimeRef.current = performance.now()

      const animate = (currentTime) => {
        const delta = (currentTime - lastTimeRef.current) / 1000
        lastTimeRef.current = currentTime

        setTime(t => {
          const newT = t + delta * 0.8 // 속도 조절
          const newS = 0.5 * Math.abs(aSystem) * newT * newT
          if (newS > maxDisplacement) {
            setIsPlaying(false)
            return t
          }
          return newT
        })

        animationRef.current = requestAnimationFrame(animate)
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isPlaying, aSystem])

  const handleReset = () => {
    setTime(0)
    setIsPlaying(false)
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
  }

  const toggleMode = () => {
    handleReset()
    setMode(prev => prev === 'connected' ? 'disconnected' : 'connected')
  }

  // 속도
  const vSystem = Math.abs(aSystem) * time
  const vB = mode === 'connected' ? vSystem : aB_disconnected * time

  // 줄 경로 계산
  const ropeToC_x = objCx + (boxSize / 2) * cosTheta
  const ropeToC_y = objCy - (boxSize / 2) * sinTheta

  return (
    <div style={{
      fontFamily: 'system-ui, sans-serif',
      maxWidth: '650px',
      margin: '0 auto',
      padding: '16px',
    }}>
      <h3 style={{ margin: '0 0 12px 0', color: '#2c3e50' }}>
        빗면-도르래 연결 시스템
      </h3>

      {/* 컨트롤 */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        padding: '12px',
        background: '#f8f9fa',
        borderRadius: '8px',
        marginBottom: '12px',
        alignItems: 'center',
      }}>
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          style={{
            padding: '8px 16px',
            fontSize: '14px',
            background: isPlaying ? '#f39c12' : '#27ae60',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          {isPlaying ? '⏸ 정지' : '▶ 재생'}
        </button>

        <button
          onClick={handleReset}
          style={{
            padding: '8px 16px',
            fontSize: '14px',
            background: '#e74c3c',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          ↺ 리셋
        </button>

        <button
          onClick={toggleMode}
          disabled={isPlaying}
          style={{
            padding: '8px 16px',
            fontSize: '14px',
            background: mode === 'connected' ? '#3498db' : '#9b59b6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: isPlaying ? 'not-allowed' : 'pointer',
            opacity: isPlaying ? 0.6 : 1,
          }}
        >
          {mode === 'connected' ? '(가) p 연결' : '(나) p 끊김'}
        </button>

        <span style={{ marginLeft: 'auto', fontSize: '13px', color: '#666' }}>
          sinθ = 2/5, θ ≈ {(theta * 180 / Math.PI).toFixed(1)}°
        </span>
      </div>

      {/* SVG */}
      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{
          width: '100%',
          background: '#fafafa',
          border: '1px solid #ddd',
          borderRadius: '8px',
        }}
      >
        {/* 바닥 */}
        <rect x="0" y={groundY} width={width} height="10" fill="#8B4513" />

        {/* 왼쪽 벽 (A 지지용) */}
        <rect x={objA_initX - 15} y={pulleyY - 30} width="10" height={groundY - pulleyY + 40} fill="#666" />

        {/* 왼쪽 도르래 */}
        <circle cx={objA_initX} cy={pulleyY} r={pulleyR} fill="#ddd" stroke="#333" strokeWidth="2" />
        <circle cx={objA_initX} cy={pulleyY} r="3" fill="#333" />

        {/* 빗면 */}
        <polygon
          points={`${slopeStartX},${groundY} ${slopeEndX},${groundY} ${slopeEndX},${slopeEndY}`}
          fill="#5DADE2"
          stroke="#2980B9"
          strokeWidth="2"
        />

        {/* 오른쪽 도르래 지지대 */}
        <line x1={slopeEndX} y1={slopeEndY} x2={pulleyX} y2={pulleyY} stroke="#666" strokeWidth="4" />

        {/* 오른쪽 도르래 */}
        <circle cx={pulleyX} cy={pulleyY} r={pulleyR} fill="#ddd" stroke="#333" strokeWidth="2" />
        <circle cx={pulleyX} cy={pulleyY} r="3" fill="#333" />

        {/* ===== 줄 ===== */}
        {/* A에서 왼쪽 도르래까지 */}
        <line x1={objAx} y1={objAy - boxSize/2} x2={objAx} y2={pulleyY} stroke="#333" strokeWidth="2" />

        {/* 왼쪽 도르래에서 오른쪽 도르래까지 (빗면 위) */}
        <line x1={objA_initX + pulleyR} y1={pulleyY} x2={pulleyX - pulleyR} y2={pulleyY} stroke="#333" strokeWidth="2" />

        {/* 오른쪽 도르래에서 C까지 */}
        <line
          x1={pulleyX - pulleyR * Math.sin(theta)}
          y1={pulleyY + pulleyR * Math.cos(theta)}
          x2={ropeToC_x}
          y2={ropeToC_y}
          stroke="#333" strokeWidth="2"
        />

        {/* C에서 D까지 (오른쪽 도르래 통해) */}
        <line x1={objCx + boxSize/2} y1={objCy} x2={pulleyX + pulleyR} y2={pulleyY} stroke="#333" strokeWidth="2" />
        <line x1={pulleyX + pulleyR + 10} y1={pulleyY} x2={objDx} y2={objDy - boxSize/2} stroke="#333" strokeWidth="2" />

        {/* p 줄 (B-C 연결, 연결 상태일 때만) */}
        {mode === 'connected' && (
          <line
            x1={objBx + (boxSize/2) * cosTheta}
            y1={objBy - (boxSize/2) * sinTheta}
            x2={objCx - (boxSize/2) * cosTheta}
            y2={objCy + (boxSize/2) * sinTheta}
            stroke="#E74C3C"
            strokeWidth="3"
            strokeDasharray="6,4"
          />
        )}

        {/* ===== 물체들 ===== */}

        {/* 물체 A */}
        <g>
          <rect
            x={objAx - boxSize/2} y={objAy - boxSize/2}
            width={boxSize} height={boxSize}
            fill="#E74C3C" stroke="#C0392B" strokeWidth="2" rx="3"
          />
          <text x={objAx} y={objAy + 4} textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">A</text>
        </g>

        {/* 물체 B */}
        <g transform={`translate(${objBx}, ${objBy}) rotate(${-theta * 180 / Math.PI})`}>
          <rect
            x={-boxSize/2} y={-boxSize/2}
            width={boxSize} height={boxSize}
            fill="#27AE60" stroke="#1E8449" strokeWidth="2" rx="3"
          />
          <text x="0" y="4" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">B</text>
        </g>

        {/* 물체 C */}
        <g transform={`translate(${objCx}, ${objCy}) rotate(${-theta * 180 / Math.PI})`}>
          <rect
            x={-boxSize/2} y={-boxSize/2}
            width={boxSize} height={boxSize}
            fill="#9B59B6" stroke="#7D3C98" strokeWidth="2" rx="3"
          />
          <text x="0" y="4" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">C</text>
        </g>

        {/* 물체 D */}
        <g>
          <rect
            x={objDx - boxSize/2} y={objDy - boxSize/2}
            width={boxSize} height={boxSize}
            fill="#F39C12" stroke="#D68910" strokeWidth="2" rx="3"
          />
          <text x={objDx} y={objDy + 4} textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">D</text>
        </g>

        {/* p 라벨 */}
        {mode === 'connected' && (
          <text
            x={(objBx + objCx) / 2 - 10}
            y={(objBy + objCy) / 2 - 12}
            fontSize="14" fill="#E74C3C" fontWeight="bold"
          >
            p
          </text>
        )}

        {/* 각도 표시 */}
        <path
          d={`M ${slopeStartX + 30} ${groundY} A 30 30 0 0 0 ${slopeStartX + 30 * cosTheta} ${groundY - 30 * sinTheta}`}
          fill="none" stroke="#E74C3C" strokeWidth="2"
        />
        <text x={slopeStartX + 38} y={groundY - 8} fill="#E74C3C" fontSize="12">θ</text>

        {/* 정보 패널 */}
        <rect x="10" y="10" width="160" height="95" fill="rgba(255,255,255,0.95)" rx="5" stroke="#ccc" />
        <text x="20" y="28" fontSize="12" fill="#333" fontWeight="bold">
          {mode === 'connected' ? '(가) p 연결 상태' : '(나) p 끊어진 상태'}
        </text>
        <text x="20" y="46" fontSize="11" fill="#555">t = {time.toFixed(2)} s</text>
        <text x="20" y="62" fontSize="11" fill="#555">s = {Math.abs(clampedS).toFixed(3)} m</text>
        <text x="20" y="78" fontSize="11" fill="#2980B9">a = {aSystem.toFixed(3)} m/s²</text>
        <text x="20" y="94" fontSize="11" fill="#27AE60">v = {vSystem.toFixed(3)} m/s</text>

        {/* 운동 방향 화살표 */}
        {aSystem !== 0 && (
          <g>
            {/* A 방향 */}
            <text x={objAx + 20} y={objAy} fontSize="16" fill="#E74C3C">
              {aSystem > 0 ? '↓' : '↑'}
            </text>
            {/* D 방향 */}
            <text x={objDx + 20} y={objDy} fontSize="16" fill="#F39C12">
              {aSystem > 0 ? '↑' : '↓'}
            </text>
          </g>
        )}
      </svg>

      {/* 물리 정보 */}
      <div style={{
        marginTop: '12px',
        padding: '12px',
        background: mode === 'connected' ? '#EBF5FB' : '#F5EEF8',
        borderRadius: '8px',
        fontSize: '13px',
        lineHeight: '1.6',
      }}>
        {mode === 'connected' ? (
          <>
            <strong>(가) p 연결 상태</strong>
            <div style={{ marginTop: '6px' }}>
              • A, B, C, D 모두 같은 가속도로 운동<br/>
              • a = (m<sub>A</sub>g - (m<sub>B</sub>+m<sub>C</sub>)g sinθ - m<sub>D</sub>g) / (m<sub>A</sub>+m<sub>B</sub>+m<sub>C</sub>+m<sub>D</sub>)<br/>
              • a = <strong>{aConnected.toFixed(3)} m/s²</strong><br/>
              • 장력 p = m<sub>B</sub>(g sinθ + a) = <strong>{Tp.toFixed(2)} N</strong>
            </div>
          </>
        ) : (
          <>
            <strong>(나) p 끊어진 상태</strong>
            <div style={{ marginTop: '6px' }}>
              • B: 빗면에서 독립적으로 미끄러짐<br/>
              &nbsp;&nbsp;a<sub>B</sub> = g sinθ = <strong style={{color: '#27AE60'}}>2g/5 = {aB_disconnected.toFixed(1)} m/s²</strong><br/>
              • A-C-D: 함께 운동<br/>
              &nbsp;&nbsp;a<sub>C</sub> = <strong style={{color: '#9B59B6'}}>g/3 = {aC_disconnected.toFixed(3)} m/s²</strong>
            </div>
          </>
        )}
      </div>

      {/* 질량 테이블 */}
      <div style={{
        marginTop: '8px',
        padding: '10px',
        background: '#F8F9FA',
        borderRadius: '8px',
        fontSize: '12px',
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '8px',
        textAlign: 'center',
      }}>
        <div><span style={{ color: '#E74C3C', fontWeight: 'bold' }}>A</span><br/>5m</div>
        <div><span style={{ color: '#27AE60', fontWeight: 'bold' }}>B</span><br/>30m/11</div>
        <div><span style={{ color: '#9B59B6', fontWeight: 'bold' }}>C</span><br/>30m/11</div>
        <div><span style={{ color: '#F39C12', fontWeight: 'bold' }}>D</span><br/>m</div>
      </div>
    </div>
  )
}
