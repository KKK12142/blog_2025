// src/components/physics3d/InfoPanel.jsx
// 시뮬레이션 정보 표시 패널
//
// 사용 예시:
// <InfoPanel position={[3, 2, 0]} title="힘의 합성">
//   <p>F₁ = {f1} N</p>
// </InfoPanel>

import { Html } from '@react-three/drei'

export function InfoPanel({
  position = [3, 2, 0],
  title = '',
  children,
  width = '200px',
  accentColor = '#16a34a'
}) {
  return (
    <Html position={position} center>
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        padding: '16px',
        borderRadius: '10px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        minWidth: width,
        border: `2px solid ${accentColor}`,
        backdropFilter: 'blur(10px)'
      }}>
        {title && (
          <h3 style={{
            margin: '0 0 12px 0',
            paddingBottom: '8px',
            borderBottom: `2px solid ${accentColor}`,
            color: accentColor,
            fontSize: '16px',
            fontWeight: 'bold'
          }}>
            {title}
          </h3>
        )}
        <div style={{ fontSize: '14px', color: '#444' }}>
          {children}
        </div>
      </div>
    </Html>
  )
}

// 간단한 값 표시용
export function ValueDisplay({
  position = [0, 0, 0],
  label = '',
  value = 0,
  unit = '',
  color = '#333',
  fontSize = 0.25
}) {
  return (
    <Html position={position} center>
      <div style={{
        background: 'rgba(255,255,255,0.9)',
        padding: '4px 8px',
        borderRadius: '4px',
        fontFamily: 'system-ui',
        fontSize: '12px',
        color,
        whiteSpace: 'nowrap',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        {label && <span style={{ color: '#666' }}>{label} = </span>}
        <strong>{typeof value === 'number' ? value.toFixed(2) : value}</strong>
        {unit && <span style={{ color: '#888' }}> {unit}</span>}
      </div>
    </Html>
  )
}

// 수식 표시 (KaTeX 스타일 - 실제로는 CSS로 흉내)
export function Formula({
  position = [0, 0, 0],
  children,
  background = '#fffbeb',
  borderColor = '#fbbf24'
}) {
  return (
    <Html position={position} center>
      <div style={{
        background,
        padding: '8px 16px',
        borderRadius: '6px',
        border: `1px solid ${borderColor}`,
        fontFamily: 'serif',
        fontSize: '18px',
        fontStyle: 'italic'
      }}>
        {children}
      </div>
    </Html>
  )
}
