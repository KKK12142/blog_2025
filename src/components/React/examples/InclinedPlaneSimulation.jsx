import { useState, useEffect, useRef } from 'react'

export default function AtwoodMachineSimulation() {
  // 상태
  const [time, setTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const animationRef = useRef(null)
  const lastTimeRef = useRef(0)
  
  // 파라미터
  const [params, setParams] = useState({
    massA: 2,
    massB: 1,
    angle: 30,
    g: 10,
  })
  
  // 물리 계산
  const angleRad = (params.angle * Math.PI) / 180
  const g = params.g
  const mA = params.massA
  const mB = params.massB
  
  // 가속도: a = g(mB - mA*sinθ) / (mA + mB)
  const a = (g * (mB - mA * Math.sin(angleRad))) / (mA + mB)
  
  // 운동학
  const s = 0.5 * a * time * time  // A의 이동거리 (양수: 위로)
  const v = a * time  // 속도
  
  // 스케일 (1m = 40px)
  const scale = 40
  
  // SVG 크기
  const width = 500
  const height = 400
  
  // 빗면 설정
  const slopeLength = 200  // px
  const slopeStartX = 50
  const slopeStartY = 320
  const slopeEndX = slopeStartX + slopeLength * Math.cos(angleRad)
  const slopeEndY = slopeStartY - slopeLength * Math.sin(angleRad)
  
  // 도르래 위치
  const pulleyX = slopeEndX + 20
  const pulleyY = slopeEndY - 20
  const pulleyR = 15
  
  // 물체 A 위치 (빗면 위)
  const objSize = 30
  const maxS = 4  // 최대 이동거리 (m)
  const sPixel = Math.min(Math.max(s * scale, -slopeLength + objSize), slopeLength - objSize)
  const objAx = slopeStartX + 60 + sPixel * Math.cos(angleRad)
  const objAy = slopeStartY - 60 * Math.tan(angleRad) - sPixel * Math.sin(angleRad)
  
  // 물체 B 위치 (수직)
  const ropeLength = 120  // 초기 로프 길이 (px)
  const objBx = pulleyX + pulleyR + 10
  const objBy = pulleyY + ropeLength - sPixel
  
  // 애니메이션
  useEffect(() => {
    if (isPlaying) {
      lastTimeRef.current = performance.now()
      
      const animate = (currentTime) => {
        const delta = (currentTime - lastTimeRef.current) / 1000
        lastTimeRef.current = currentTime
        
        setTime(t => {
          const newT = t + delta
          // 경계 체크
          const newS = 0.5 * a * newT * newT
          if (Math.abs(newS) > maxS) {
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
  }, [isPlaying, a])
  
  // 리셋 (필수!)
  const handleReset = () => {
    setTime(0)
    setIsPlaying(false)
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
  }
  
  // 파라미터 변경 시 리셋
  const handleParamChange = (key, value) => {
    handleReset()
    setParams(prev => ({ ...prev, [key]: value }))
  }
  
  // 장력 계산
  const T = mA * (g * Math.sin(angleRad) + a)
  
  return (
    <div style={{ 
      fontFamily: 'system-ui, sans-serif',
      maxWidth: '550px',
      margin: '0 auto',
      padding: '16px',
    }}>
      <h3 style={{ margin: '0 0 12px 0', color: '#2c3e50' }}>
        빗면-도르래 시스템 시뮬레이션
      </h3>
      
      {/* 컨트롤 패널 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '12px',
        padding: '12px',
        background: '#f8f9fa',
        borderRadius: '8px',
        marginBottom: '12px',
      }}>
        {/* 버튼 */}
        <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '8px' }}>
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
        </div>
        
        {/* 슬라이더 */}
        <div>
          <label style={{ fontSize: '12px', color: '#666' }}>
            물체 A 질량: {params.massA} kg
          </label>
          <input
            type="range"
            min={0.5} max={5} step={0.1}
            value={params.massA}
            onChange={(e) => handleParamChange('massA', parseFloat(e.target.value))}
            disabled={isPlaying}
            style={{ width: '100%' }}
          />
        </div>
        
        <div>
          <label style={{ fontSize: '12px', color: '#666' }}>
            물체 B 질량: {params.massB} kg
          </label>
          <input
            type="range"
            min={0.5} max={5} step={0.1}
            value={params.massB}
            onChange={(e) => handleParamChange('massB', parseFloat(e.target.value))}
            disabled={isPlaying}
            style={{ width: '100%' }}
          />
        </div>
        
        <div>
          <label style={{ fontSize: '12px', color: '#666' }}>
            빗면 각도: {params.angle}°
          </label>
          <input
            type="range"
            min={10} max={60} step={1}
            value={params.angle}
            onChange={(e) => handleParamChange('angle', parseFloat(e.target.value))}
            disabled={isPlaying}
            style={{ width: '100%' }}
          />
        </div>
        
        <div>
          <label style={{ fontSize: '12px', color: '#666' }}>
            중력가속도: {params.g} m/s²
          </label>
          <input
            type="range"
            min={1} max={20} step={0.5}
            value={params.g}
            onChange={(e) => handleParamChange('g', parseFloat(e.target.value))}
            disabled={isPlaying}
            style={{ width: '100%' }}
          />
        </div>
      </div>
      
      {/* SVG 시뮬레이션 */}
      <svg 
        viewBox={`0 0 ${width} ${height}`}
        style={{ 
          width: '100%', 
          background: 'white',
          border: '1px solid #ddd',
          borderRadius: '8px',
        }}
      >
        {/* 배경 그리드 */}
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f0f0f0" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        
        {/* 바닥 */}
        <line 
          x1="30" y1={slopeStartY + 5} 
          x2={width - 30} y2={slopeStartY + 5}
          stroke="#7f8c8d" strokeWidth="4"
        />
        
        {/* 빗면 */}
        <polygon
          points={`
            ${slopeStartX},${slopeStartY}
            ${slopeEndX},${slopeStartY}
            ${slopeEndX},${slopeEndY}
          `}
          fill="#3498db"
          opacity="0.8"
        />
        <line 
          x1={slopeStartX} y1={slopeStartY}
          x2={slopeEndX} y2={slopeEndY}
          stroke="#2980b9" strokeWidth="3"
        />
        
        {/* 수직 벽 */}
        <line 
          x1={slopeEndX} y1={slopeEndY}
          x2={slopeEndX} y2={slopeStartY}
          stroke="#2980b9" strokeWidth="3"
        />
        
        {/* 도르래 지지대 */}
        <line 
          x1={slopeEndX} y1={slopeEndY - 10}
          x2={pulleyX} y2={pulleyY}
          stroke="#2c3e50" strokeWidth="4"
        />
        
        {/* 도르래 */}
        <circle 
          cx={pulleyX} cy={pulleyY} r={pulleyR}
          fill="#ecf0f1" stroke="#2c3e50" strokeWidth="3"
        />
        <circle cx={pulleyX} cy={pulleyY} r="4" fill="#2c3e50" />
        
        {/* 실 - A에서 도르래 */}
        <line 
          x1={objAx} y1={objAy - objSize/2 * Math.cos(angleRad)}
          x2={pulleyX - pulleyR * Math.cos(angleRad)} 
          y2={pulleyY - pulleyR * Math.sin(angleRad)}
          stroke="#2c3e50" strokeWidth="2"
        />
        
        {/* 실 - 도르래에서 B */}
        <line 
          x1={pulleyX + pulleyR} y1={pulleyY}
          x2={objBx} y2={objBy - objSize/2}
          stroke="#2c3e50" strokeWidth="2"
        />
        
        {/* 물체 A */}
        <g transform={`translate(${objAx}, ${objAy}) rotate(${-params.angle})`}>
          <rect 
            x={-objSize/2} y={-objSize/2}
            width={objSize} height={objSize}
            fill="#e74c3c" stroke="white" strokeWidth="2" rx="3"
          />
          <text 
            x="0" y="0" 
            textAnchor="middle" dominantBaseline="central"
            fill="white" fontSize="14" fontWeight="bold"
          >
            A
          </text>
        </g>
        
        {/* 물체 B */}
        <g>
          <rect 
            x={objBx - objSize/2} y={objBy - objSize/2}
            width={objSize} height={objSize}
            fill="#9b59b6" stroke="white" strokeWidth="2" rx="3"
          />
          <text 
            x={objBx} y={objBy} 
            textAnchor="middle" dominantBaseline="central"
            fill="white" fontSize="14" fontWeight="bold"
          >
            B
          </text>
        </g>
        
        {/* 각도 표시 */}
        <path
          d={`M ${slopeStartX + 40} ${slopeStartY} 
              A 40 40 0 0 0 ${slopeStartX + 40 * Math.cos(angleRad)} ${slopeStartY - 40 * Math.sin(angleRad)}`}
          fill="none" stroke="#e74c3c" strokeWidth="2"
        />
        <text 
          x={slopeStartX + 50} y={slopeStartY - 15}
          fill="#e74c3c" fontSize="14"
        >
          θ
        </text>
        
        {/* 정보 표시 */}
        <rect x="10" y="10" width="140" height="100" fill="rgba(255,255,255,0.9)" rx="5" />
        <text x="20" y="30" fontSize="12" fill="#333">t = {time.toFixed(2)} s</text>
        <text x="20" y="48" fontSize="12" fill="#333">s = {Math.abs(s).toFixed(3)} m</text>
        <text x="20" y="66" fontSize="12" fill="#3498db">v = {Math.abs(v).toFixed(3)} m/s</text>
        <text x="20" y="84" fontSize="12" fill="#27ae60">a = {a.toFixed(3)} m/s²</text>
        <text x="20" y="102" fontSize="12" fill="#9b59b6">T = {T.toFixed(2)} N</text>
        
        {/* 운동 방향 표시 */}
        {Math.abs(a) > 0.01 && (
          <>
            <text x={width - 120} y="30" fontSize="11" fill="#666">
              {a > 0 ? 'A↗ 위로, B↓ 아래로' : 'A↙ 아래로, B↑ 위로'}
            </text>
          </>
        )}
        {Math.abs(a) <= 0.01 && (
          <text x={width - 100} y="30" fontSize="11" fill="#e74c3c">
            ⚖️ 평형 상태!
          </text>
        )}
      </svg>
      
      {/* 물리 정보 */}
      <div style={{
        marginTop: '12px',
        padding: '12px',
        background: '#f0f0f0',
        borderRadius: '8px',
        fontSize: '13px',
      }}>
        <div style={{ marginBottom: '8px' }}>
          <strong>가속도 공식:</strong> a = g(m<sub>B</sub> - m<sub>A</sub>sinθ) / (m<sub>A</sub> + m<sub>B</sub>)
        </div>
        <div style={{ color: '#666' }}>
          = {params.g} × ({params.massB} - {params.massA} × sin{params.angle}°) / ({params.massA} + {params.massB})
          = <strong style={{ color: a >= 0 ? '#27ae60' : '#e74c3c' }}>{a.toFixed(3)} m/s²</strong>
        </div>
        {Math.abs(s) >= 2 && (
          <div style={{ marginTop: '8px', padding: '8px', background: '#d4edda', borderRadius: '4px' }}>
            ✅ <strong>s = 2m일 때 속력:</strong> v = {Math.abs(Math.sqrt(2 * Math.abs(a) * 2)).toFixed(3)} m/s
          </div>
        )}
      </div>
    </div>
  )
}