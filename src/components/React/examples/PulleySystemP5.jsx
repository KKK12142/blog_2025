import { useRef, useEffect, useState } from 'react'

export default function PulleySystemP5() {
  const canvasRef = useRef(null)
  const [time, setTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [mode, setMode] = useState('connected')
  const animationRef = useRef(null)
  const lastTimeRef = useRef(0)
  const p5Ref = useRef(null)

  // 물리 상수
  const g = 10
  const m = 1
  const sinTheta = 2 / 5
  const cosTheta = Math.sqrt(1 - sinTheta * sinTheta)
  const theta = Math.asin(sinTheta)

  // 질량
  const massA = 5 * m
  const massD = m
  const massC = (30 * m) / 11
  const massB = massC

  // 가속도 계산
  const totalMassConnected = massA + massB + massC + massD
  const netForceConnected = massA * g - (massB + massC) * g * sinTheta - massD * g
  const aConnected = netForceConnected / totalMassConnected

  const aB_disconnected = g * sinTheta
  const totalMassACD = massA + massC + massD
  const netForceACD = massA * g - massC * g * sinTheta - massD * g
  const aC_disconnected = netForceACD / totalMassACD

  const aSystem = mode === 'connected' ? aConnected : aC_disconnected
  const Tp = mode === 'connected' ? massB * (g * sinTheta + aConnected) : 0

  // p5.js 초기화
  useEffect(() => {
    let p5Instance = null

    const initP5 = async () => {
      const p5Module = await import('p5')
      const p5 = p5Module.default

      const sketch = (p) => {
        const width = 600
        const height = 450
        const scale = 50

        // 기하학적 설정
        const groundY = 380
        const slopeStartX = 150
        const slopeLength = 200
        const slopeEndX = slopeStartX + slopeLength * cosTheta
        const slopeEndY = groundY - slopeLength * sinTheta

        // 도르래 위치
        const pulleyLeftX = 80
        const pulleyLeftY = 100
        const pulleyRightX = slopeEndX + 30
        const pulleyRightY = slopeEndY - 30
        const pulleyR = 15

        // 물체 크기
        const boxSize = 35

        p.setup = () => {
          p.createCanvas(width, height)
          p.textFont('sans-serif')
        }

        p.draw = () => {
          p.background(250)

          // 현재 시간과 변위 가져오기
          const currentTime = p5Ref.current?.time || 0
          const currentMode = p5Ref.current?.mode || 'connected'
          const currentASystem = currentMode === 'connected' ? aConnected : aC_disconnected

          const sSystem = 0.5 * currentASystem * currentTime * currentTime
          const maxS = 2.5
          const clampedS = Math.max(-maxS, Math.min(maxS, sSystem))
          const sPixel = clampedS * scale

          const sB_only = 0.5 * aB_disconnected * currentTime * currentTime
          const sB_pixel = Math.min(sB_only * scale, slopeLength - 60)

          // ===== 배경 구조물 =====

          // 바닥
          p.fill(139, 69, 19)
          p.noStroke()
          p.rect(0, groundY, width, 70)

          // 왼쪽 지지대 (벽)
          p.fill(100)
          p.rect(pulleyLeftX - 25, pulleyLeftY - 20, 15, groundY - pulleyLeftY + 30)

          // 빗면 (삼각형)
          p.fill(93, 173, 226)
          p.stroke(41, 128, 185)
          p.strokeWeight(2)
          p.triangle(
            slopeStartX, groundY,
            slopeEndX, groundY,
            slopeEndX, slopeEndY
          )

          // 빗면 표면 선
          p.stroke(41, 128, 185)
          p.strokeWeight(3)
          p.line(slopeStartX, groundY, slopeEndX, slopeEndY)

          // 오른쪽 도르래 지지대
          p.stroke(80)
          p.strokeWeight(6)
          p.line(slopeEndX, slopeEndY, pulleyRightX, pulleyRightY)

          // ===== 물체 위치 계산 =====

          // A 위치 (왼쪽 도르래에서 수직으로 매달림)
          const ropeALen = 120
          const objAx = pulleyLeftX
          const objAy = pulleyLeftY + ropeALen + sPixel

          // C 위치 (빗면 위)
          const cInitDist = 100
          const objCx_init = slopeStartX + cInitDist * cosTheta
          const objCy_init = groundY - cInitDist * sinTheta - boxSize / 2
          const objCx = objCx_init + sPixel * cosTheta
          const objCy = objCy_init - sPixel * sinTheta

          // B 위치 (C 뒤쪽)
          const gapBC = 55
          const objBx_init = objCx_init - gapBC * cosTheta
          const objBy_init = objCy_init + gapBC * sinTheta
          let objBx, objBy
          if (currentMode === 'connected') {
            objBx = objBx_init + sPixel * cosTheta
            objBy = objBy_init - sPixel * sinTheta
          } else {
            objBx = objBx_init + sB_pixel * cosTheta
            objBy = objBy_init + sB_pixel * sinTheta
          }

          // D 위치 (오른쪽 도르래에서 수직으로 매달림)
          const ropeDLen = 100
          const objDx = pulleyRightX
          const objDy = pulleyRightY + ropeDLen - sPixel

          // ===== 줄 그리기 =====
          p.stroke(50)
          p.strokeWeight(2)
          p.noFill()

          // A에서 왼쪽 도르래까지 (수직)
          p.line(objAx, objAy - boxSize / 2, objAx, pulleyLeftY + pulleyR)

          // 왼쪽 도르래에서 빗면 위 도르래까지 (수평 + 빗면 따라)
          p.line(pulleyLeftX + pulleyR, pulleyLeftY, slopeStartX, pulleyLeftY)
          p.line(slopeStartX, pulleyLeftY, pulleyRightX - pulleyR * 0.7, pulleyRightY - pulleyR * 0.7)

          // 오른쪽 도르래에서 C까지
          const ropeToC_x = objCx + (boxSize / 2) * cosTheta * 0.3
          const ropeToC_y = objCy - boxSize / 2
          p.line(
            pulleyRightX - pulleyR * Math.sin(theta),
            pulleyRightY + pulleyR * Math.cos(theta),
            ropeToC_x,
            ropeToC_y
          )

          // C에서 D까지 (도르래 통해)
          p.line(objCx + boxSize / 2, objCy, pulleyRightX + pulleyR, pulleyRightY)
          p.line(pulleyRightX + pulleyR, pulleyRightY, objDx, objDy - boxSize / 2)

          // p 줄 (B-C 연결)
          if (currentMode === 'connected') {
            p.stroke(231, 76, 60)
            p.strokeWeight(3)
            p.drawingContext.setLineDash([8, 5])
            p.line(
              objBx + (boxSize / 2) * cosTheta,
              objBy - (boxSize / 2) * sinTheta,
              objCx - (boxSize / 2) * cosTheta,
              objCy + (boxSize / 2) * sinTheta
            )
            p.drawingContext.setLineDash([])

            // p 라벨
            p.fill(231, 76, 60)
            p.noStroke()
            p.textSize(16)
            p.textAlign(p.CENTER)
            p.text('p', (objBx + objCx) / 2, (objBy + objCy) / 2 - 15)
          }

          // ===== 도르래 그리기 =====
          // 왼쪽 도르래
          p.fill(220)
          p.stroke(50)
          p.strokeWeight(3)
          p.circle(pulleyLeftX, pulleyLeftY, pulleyR * 2)
          p.fill(50)
          p.noStroke()
          p.circle(pulleyLeftX, pulleyLeftY, 6)

          // 오른쪽 도르래
          p.fill(220)
          p.stroke(50)
          p.strokeWeight(3)
          p.circle(pulleyRightX, pulleyRightY, pulleyR * 2)
          p.fill(50)
          p.noStroke()
          p.circle(pulleyRightX, pulleyRightY, 6)

          // ===== 물체 그리기 =====

          // 물체 A (빨간색)
          p.fill(231, 76, 60)
          p.stroke(192, 57, 43)
          p.strokeWeight(2)
          p.rectMode(p.CENTER)
          p.rect(objAx, objAy, boxSize, boxSize, 4)
          p.fill(255)
          p.noStroke()
          p.textSize(16)
          p.textAlign(p.CENTER, p.CENTER)
          p.text('A', objAx, objAy)
          p.textSize(11)
          p.text('5m', objAx, objAy + boxSize / 2 + 12)

          // 물체 B (초록색)
          p.push()
          p.translate(objBx, objBy)
          p.rotate(-theta)
          p.fill(39, 174, 96)
          p.stroke(30, 132, 73)
          p.strokeWeight(2)
          p.rect(0, 0, boxSize, boxSize, 4)
          p.fill(255)
          p.noStroke()
          p.textSize(16)
          p.rotate(theta)
          p.text('B', 0, 0)
          p.pop()

          // 물체 C (보라색)
          p.push()
          p.translate(objCx, objCy)
          p.rotate(-theta)
          p.fill(155, 89, 182)
          p.stroke(125, 60, 152)
          p.strokeWeight(2)
          p.rect(0, 0, boxSize, boxSize, 4)
          p.fill(255)
          p.noStroke()
          p.textSize(16)
          p.rotate(theta)
          p.text('C', 0, 0)
          p.pop()

          // 물체 D (주황색)
          p.fill(243, 156, 18)
          p.stroke(214, 137, 16)
          p.strokeWeight(2)
          p.rect(objDx, objDy, boxSize, boxSize, 4)
          p.fill(255)
          p.noStroke()
          p.textSize(16)
          p.text('D', objDx, objDy)
          p.textSize(11)
          p.text('m', objDx, objDy + boxSize / 2 + 12)

          // ===== 각도 표시 =====
          p.noFill()
          p.stroke(231, 76, 60)
          p.strokeWeight(2)
          p.arc(slopeStartX, groundY, 50, 50, -theta, 0)
          p.fill(231, 76, 60)
          p.noStroke()
          p.textSize(14)
          p.text('θ', slopeStartX + 35, groundY - 12)

          // ===== 정보 패널 =====
          p.rectMode(p.CORNER)
          p.fill(255, 255, 255, 240)
          p.stroke(200)
          p.strokeWeight(1)
          p.rect(10, 10, 170, 100, 5)

          p.fill(50)
          p.noStroke()
          p.textAlign(p.LEFT)
          p.textSize(13)
          p.textStyle(p.BOLD)
          p.text(currentMode === 'connected' ? '(가) p 연결' : '(나) p 끊김', 20, 30)
          p.textStyle(p.NORMAL)
          p.textSize(12)
          p.text(`t = ${currentTime.toFixed(2)} s`, 20, 48)
          p.text(`s = ${Math.abs(clampedS).toFixed(3)} m`, 20, 64)
          p.fill(41, 128, 185)
          p.text(`a = ${currentASystem.toFixed(3)} m/s²`, 20, 80)
          p.fill(39, 174, 96)
          p.text(`v = ${(Math.abs(currentASystem) * currentTime).toFixed(3)} m/s`, 20, 96)

          // sinθ 표시
          p.fill(100)
          p.textAlign(p.RIGHT)
          p.text(`sinθ = 2/5`, width - 20, 25)

          // 운동 방향 화살표
          if (Math.abs(currentASystem) > 0.01) {
            p.fill(currentASystem > 0 ? '#27ae60' : '#e74c3c')
            p.textSize(20)
            p.textAlign(p.CENTER)
            // A 방향
            p.text(currentASystem > 0 ? '↓' : '↑', objAx + 30, objAy)
            // D 방향
            p.text(currentASystem > 0 ? '↑' : '↓', objDx + 30, objDy)
          }
        }
      }

      p5Instance = new p5(sketch, canvasRef.current)
      p5Ref.current = { p5: p5Instance, time: 0, mode: 'connected' }
    }

    initP5()

    return () => {
      if (p5Instance) {
        p5Instance.remove()
      }
    }
  }, [])

  // 시간과 모드 업데이트
  useEffect(() => {
    if (p5Ref.current) {
      p5Ref.current.time = time
      p5Ref.current.mode = mode
    }
  }, [time, mode])

  // 애니메이션
  useEffect(() => {
    if (isPlaying) {
      lastTimeRef.current = performance.now()

      const animate = (currentTime) => {
        const delta = (currentTime - lastTimeRef.current) / 1000
        lastTimeRef.current = currentTime

        setTime(t => {
          const newT = t + delta * 0.7
          const currentA = mode === 'connected' ? aConnected : aC_disconnected
          const newS = 0.5 * Math.abs(currentA) * newT * newT
          if (newS > 2.5) {
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
  }, [isPlaying, mode, aConnected, aC_disconnected])

  const handleReset = () => {
    setTime(0)
    setIsPlaying(false)
  }

  const toggleMode = () => {
    handleReset()
    setMode(prev => prev === 'connected' ? 'disconnected' : 'connected')
  }

  return (
    <div style={{
      fontFamily: 'system-ui, sans-serif',
      maxWidth: '650px',
      margin: '0 auto',
      padding: '16px',
    }}>
      <h3 style={{ margin: '0 0 12px 0', color: '#2c3e50' }}>
        빗면-도르래 연결 시스템 (p5.js)
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
      </div>

      {/* p5.js 캔버스 */}
      <div
        ref={canvasRef}
        style={{
          border: '1px solid #ddd',
          borderRadius: '8px',
          overflow: 'hidden',
        }}
      />

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
              • a = <strong>{aConnected.toFixed(3)} m/s²</strong><br/>
              • 장력 p = <strong>{Tp.toFixed(2)} N</strong>
            </div>
          </>
        ) : (
          <>
            <strong>(나) p 끊어진 상태</strong>
            <div style={{ marginTop: '6px' }}>
              • B: a<sub>B</sub> = g sinθ = <strong style={{color: '#27AE60'}}>2g/5 = {aB_disconnected.toFixed(1)} m/s²</strong><br/>
              • A-C-D: a<sub>C</sub> = <strong style={{color: '#9B59B6'}}>g/3 = {aC_disconnected.toFixed(3)} m/s²</strong>
            </div>
          </>
        )}
      </div>

      {/* 질량 */}
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
