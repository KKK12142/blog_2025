# Plotly 인터랙티브 그래프 가이드

물리 시뮬레이션의 운동 정보를 인터랙티브 그래프로 시각화.
드롭다운 필터, 범례 토글, 확대/축소 등 내장 기능 활용.

---

## 1. 설치 및 기본 사용

### 설치
```bash
npm install react-plotly.js plotly.js
```

### 기본 구조
```jsx
import Plot from 'react-plotly.js'

function BasicGraph({ times, velocities }) {
  return (
    <Plot
      data={[
        {
          x: times,
          y: velocities,
          type: 'scatter',
          mode: 'lines',
          name: '속력',
          line: { color: '#3498db', width: 2 },
        }
      ]}
      layout={{
        title: 'v-t 그래프',
        xaxis: { title: '시간 (s)' },
        yaxis: { title: '속력 (m/s)' },
        autosize: true,
      }}
      config={{
        responsive: true,
        displayModeBar: true,
      }}
      style={{ width: '100%', height: '300px' }}
    />
  )
}
```

---

## 2. 다중 데이터 그래프

### 같은 축에 여러 데이터
```jsx
function MultiDataGraph({ data }) {
  // data = { times, objects: [{ name, positions, velocities, accelerations, color }] }
  
  const traces = data.objects.flatMap(obj => [
    {
      x: data.times,
      y: obj.velocities,
      type: 'scatter',
      mode: 'lines',
      name: `${obj.name} 속력`,
      line: { color: obj.color, width: 2 },
    },
  ])
  
  return (
    <Plot
      data={traces}
      layout={{
        title: '속력-시간 그래프',
        xaxis: { title: '시간 (s)' },
        yaxis: { title: '속력 (m/s)' },
        legend: { orientation: 'h', y: -0.2 },
      }}
    />
  )
}
```

### 다중 Y축 (위치 + 속력)
```jsx
function DualAxisGraph({ times, positions, velocities }) {
  return (
    <Plot
      data={[
        {
          x: times,
          y: positions,
          type: 'scatter',
          mode: 'lines',
          name: '변위 (m)',
          line: { color: '#e74c3c', width: 2 },
          yaxis: 'y1',
        },
        {
          x: times,
          y: velocities,
          type: 'scatter',
          mode: 'lines',
          name: '속력 (m/s)',
          line: { color: '#3498db', width: 2 },
          yaxis: 'y2',
        }
      ]}
      layout={{
        title: '운동 정보',
        xaxis: { title: '시간 (s)' },
        yaxis: {
          title: '변위 (m)',
          titlefont: { color: '#e74c3c' },
          tickfont: { color: '#e74c3c' },
          side: 'left',
        },
        yaxis2: {
          title: '속력 (m/s)',
          titlefont: { color: '#3498db' },
          tickfont: { color: '#3498db' },
          overlaying: 'y',
          side: 'right',
        },
        legend: { x: 0.5, y: 1.1, orientation: 'h', xanchor: 'center' },
      }}
    />
  )
}
```

---

## 3. 드롭다운 필터

### 그래프 유형 선택
```jsx
function FilterableGraph({ data }) {
  // data = { times, positions, velocities, accelerations, forces }
  
  return (
    <Plot
      data={[
        {
          x: data.times,
          y: data.positions,
          name: '변위 (m)',
          visible: true,  // 기본 표시
        },
        {
          x: data.times,
          y: data.velocities,
          name: '속력 (m/s)',
          visible: 'legendonly',  // 범례에만 (클릭하면 표시)
        },
        {
          x: data.times,
          y: data.accelerations,
          name: '가속도 (m/s²)',
          visible: 'legendonly',
        },
        {
          x: data.times,
          y: data.forces,
          name: '힘 (N)',
          visible: 'legendonly',
        },
      ]}
      layout={{
        title: '운동 정보',
        xaxis: { title: '시간 (s)' },
        yaxis: { title: '값' },
        
        // 드롭다운 메뉴
        updatemenus: [{
          type: 'dropdown',
          direction: 'down',
          x: 0.1,
          y: 1.15,
          showactive: true,
          buttons: [
            {
              label: '변위만',
              method: 'update',
              args: [
                { visible: [true, false, false, false] },
                { yaxis: { title: '변위 (m)' } }
              ],
            },
            {
              label: '속력만',
              method: 'update',
              args: [
                { visible: [false, true, false, false] },
                { yaxis: { title: '속력 (m/s)' } }
              ],
            },
            {
              label: '가속도만',
              method: 'update',
              args: [
                { visible: [false, false, true, false] },
                { yaxis: { title: '가속도 (m/s²)' } }
              ],
            },
            {
              label: '힘만',
              method: 'update',
              args: [
                { visible: [false, false, false, true] },
                { yaxis: { title: '힘 (N)' } }
              ],
            },
            {
              label: '전체 보기',
              method: 'update',
              args: [
                { visible: [true, true, true, true] },
                { yaxis: { title: '값' } }
              ],
            },
          ],
        }],
      }}
    />
  )
}
```

### 물체 선택 드롭다운
```jsx
function ObjectSelector({ objects, times }) {
  // objects = [{ name, color, data: { s, v, a, F } }]
  
  const traces = objects.flatMap((obj, i) => [
    {
      x: times,
      y: obj.data.v,
      name: `${obj.name} 속력`,
      line: { color: obj.color },
      visible: i === 0,  // 첫 번째 물체만 기본 표시
    },
  ])
  
  const buttons = objects.map((obj, i) => ({
    label: obj.name,
    method: 'update',
    args: [
      { visible: objects.map((_, j) => j === i) },
    ],
  }))
  
  buttons.push({
    label: '전체',
    method: 'update',
    args: [{ visible: objects.map(() => true) }],
  })
  
  return (
    <Plot
      data={traces}
      layout={{
        updatemenus: [{
          type: 'dropdown',
          buttons,
          x: 0.1,
          y: 1.15,
        }],
      }}
    />
  )
}
```

---

## 4. 실시간 업데이트 (애니메이션 동기화)

### 현재 시점 표시
```jsx
function SyncedGraph({ times, data, currentTime }) {
  // 현재 시점까지의 데이터만 표시
  const currentIndex = times.findIndex(t => t > currentTime)
  const displayTimes = times.slice(0, currentIndex)
  const displayData = data.slice(0, currentIndex)
  
  return (
    <Plot
      data={[
        {
          x: displayTimes,
          y: displayData,
          type: 'scatter',
          mode: 'lines',
          name: '속력',
          line: { color: '#3498db', width: 2 },
        },
        // 현재 위치 마커
        {
          x: [currentTime],
          y: [data[currentIndex - 1] || 0],
          type: 'scatter',
          mode: 'markers',
          name: '현재',
          marker: { color: '#e74c3c', size: 12 },
        },
      ]}
      layout={{
        xaxis: { range: [0, Math.max(...times) * 1.1] },
        yaxis: { range: [0, Math.max(...data) * 1.1] },
        // 현재 시점 수직선
        shapes: [{
          type: 'line',
          x0: currentTime,
          x1: currentTime,
          y0: 0,
          y1: Math.max(...data) * 1.1,
          line: { color: '#e74c3c', dash: 'dash', width: 1 },
        }],
      }}
      config={{ staticPlot: false }}  // 인터랙션 유지
    />
  )
}
```

### useEffect로 업데이트
```jsx
function AnimatedGraph({ times, allData, currentTime }) {
  const [displayData, setDisplayData] = useState([])
  
  useEffect(() => {
    const index = times.findIndex(t => t > currentTime)
    setDisplayData(allData.slice(0, index))
  }, [currentTime, times, allData])
  
  return <Plot data={[{ x: times.slice(0, displayData.length), y: displayData }]} />
}
```

---

## 5. 구간 표시

### 배경색으로 구간 표시
```jsx
function SegmentedGraph({ times, velocities, segments }) {
  // segments = [{ start, end, label, color }]
  
  const shapes = segments.map(seg => ({
    type: 'rect',
    xref: 'x',
    yref: 'paper',
    x0: seg.start,
    x1: seg.end,
    y0: 0,
    y1: 1,
    fillcolor: seg.color,
    opacity: 0.2,
    line: { width: 0 },
  }))
  
  const annotations = segments.map(seg => ({
    x: (seg.start + seg.end) / 2,
    y: 1.05,
    xref: 'x',
    yref: 'paper',
    text: seg.label,
    showarrow: false,
    font: { size: 12 },
  }))
  
  return (
    <Plot
      data={[
        {
          x: times,
          y: velocities,
          type: 'scatter',
          mode: 'lines',
          line: { color: '#3498db', width: 2 },
        },
      ]}
      layout={{
        shapes,
        annotations,
      }}
    />
  )
}

// 사용 예
<SegmentedGraph
  times={[0, 1, 2, 3, 4, 5]}
  velocities={[0, 3, 6, 6, 6, 4]}
  segments={[
    { start: 0, end: 2, label: '가속', color: '#3498db' },
    { start: 2, end: 4, label: '등속', color: '#27ae60' },
    { start: 4, end: 5, label: '감속', color: '#e74c3c' },
  ]}
/>
```

### 이벤트 수직선
```jsx
function EventMarkers({ times, data, events }) {
  // events = [{ time, label, color }]
  
  const shapes = events.map(evt => ({
    type: 'line',
    x0: evt.time,
    x1: evt.time,
    y0: 0,
    y1: 1,
    yref: 'paper',
    line: { color: evt.color, dash: 'dash', width: 2 },
  }))
  
  const annotations = events.map(evt => ({
    x: evt.time,
    y: 1.02,
    yref: 'paper',
    text: evt.label,
    showarrow: true,
    arrowhead: 2,
    ax: 0,
    ay: -30,
    font: { color: evt.color },
  }))
  
  return (
    <Plot
      data={[{ x: times, y: data }]}
      layout={{ shapes, annotations }}
    />
  )
}
```

---

## 6. 에너지 그래프

### 운동/위치/역학적 에너지
```jsx
function EnergyGraph({ times, kineticEnergy, potentialEnergy }) {
  const totalEnergy = kineticEnergy.map((ke, i) => ke + potentialEnergy[i])
  
  return (
    <Plot
      data={[
        {
          x: times,
          y: kineticEnergy,
          type: 'scatter',
          mode: 'lines',
          name: '운동에너지',
          line: { color: '#e74c3c', width: 2 },
          fill: 'tozeroy',
          fillcolor: 'rgba(231, 76, 60, 0.3)',
        },
        {
          x: times,
          y: potentialEnergy,
          type: 'scatter',
          mode: 'lines',
          name: '위치에너지',
          line: { color: '#3498db', width: 2 },
          fill: 'tozeroy',
          fillcolor: 'rgba(52, 152, 219, 0.3)',
        },
        {
          x: times,
          y: totalEnergy,
          type: 'scatter',
          mode: 'lines',
          name: '역학적에너지',
          line: { color: '#2c3e50', width: 3, dash: 'dash' },
        },
      ]}
      layout={{
        title: '에너지-시간 그래프',
        xaxis: { title: '시간 (s)' },
        yaxis: { title: '에너지 (J)' },
        legend: { orientation: 'h', y: -0.2 },
      }}
    />
  )
}
```

---

## 7. 위상 다이어그램 (x-v)

```jsx
function PhaseSpace({ positions, velocities, objectName = 'A' }) {
  return (
    <Plot
      data={[
        {
          x: positions,
          y: velocities,
          type: 'scatter',
          mode: 'lines',
          name: objectName,
          line: { color: '#9b59b6', width: 2 },
        },
        // 시작점
        {
          x: [positions[0]],
          y: [velocities[0]],
          type: 'scatter',
          mode: 'markers',
          name: '시작',
          marker: { color: '#27ae60', size: 12, symbol: 'circle' },
        },
        // 끝점
        {
          x: [positions[positions.length - 1]],
          y: [velocities[velocities.length - 1]],
          type: 'scatter',
          mode: 'markers',
          name: '끝',
          marker: { color: '#e74c3c', size: 12, symbol: 'square' },
        },
      ]}
      layout={{
        title: '위상 다이어그램',
        xaxis: { title: '위치 x (m)', zeroline: true },
        yaxis: { title: '속도 v (m/s)', zeroline: true },
      }}
    />
  )
}
```

---

## 8. 통합 대시보드

### 시뮬레이션 + Plotly 그래프
```jsx
import { useState, useEffect } from 'react'
import Plot from 'react-plotly.js'

export default function PhysicsDashboard() {
  const [time, setTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [history, setHistory] = useState({ times: [], s: [], v: [], a: [], E: [] })
  
  const [params, setParams] = useState({
    angle: 30,
    mass: 1,
    g: 10,
  })
  
  // 물리 계산
  const angleRad = (params.angle * Math.PI) / 180
  const a = params.g * Math.sin(angleRad)
  
  const getCurrentState = (t) => ({
    s: 0.5 * a * t * t,
    v: a * t,
    a: a,
    KE: 0.5 * params.mass * (a * t) ** 2,
    PE: params.mass * params.g * (5 - 0.5 * a * t * t * Math.sin(angleRad)),
  })
  
  // 애니메이션
  useEffect(() => {
    let animationId
    let lastTime = performance.now()
    
    if (isPlaying) {
      const animate = (currentTime) => {
        const delta = (currentTime - lastTime) / 1000
        lastTime = currentTime
        
        setTime(prev => {
          const newTime = prev + delta
          const state = getCurrentState(newTime)
          
          setHistory(h => ({
            times: [...h.times, newTime],
            s: [...h.s, state.s],
            v: [...h.v, state.v],
            a: [...h.a, state.a],
            E: [...h.E, state.KE + state.PE],
          }))
          
          return newTime
        })
        
        animationId = requestAnimationFrame(animate)
      }
      
      animationId = requestAnimationFrame(animate)
    }
    
    return () => cancelAnimationFrame(animationId)
  }, [isPlaying])
  
  // 리셋 (필수!)
  const handleReset = () => {
    setIsPlaying(false)
    setTime(0)
    setHistory({ times: [], s: [], v: [], a: [], E: [] })
  }
  
  const state = getCurrentState(time)
  
  return (
    <div className="dashboard">
      {/* 시뮬레이션 영역 */}
      <div className="simulation-area">
        <svg viewBox="0 0 400 300">
          {/* 빗면, 물체 등 */}
        </svg>
        
        {/* 컨트롤 */}
        <div className="controls">
          <button onClick={() => setIsPlaying(!isPlaying)}>
            {isPlaying ? '⏸ 정지' : '▶ 재생'}
          </button>
          <button onClick={handleReset}>↺ 리셋</button>
          
          <label>
            각도: {params.angle}°
            <input
              type="range"
              min="10" max="60"
              value={params.angle}
              onChange={e => {
                handleReset()  // 파라미터 변경 시 리셋
                setParams(p => ({ ...p, angle: +e.target.value }))
              }}
            />
          </label>
        </div>
      </div>
      
      {/* Plotly 그래프 영역 */}
      <div className="graph-area">
        <Plot
          data={[
            { x: history.times, y: history.s, name: '변위', visible: 'legendonly' },
            { x: history.times, y: history.v, name: '속력', visible: true },
            { x: history.times, y: history.a, name: '가속도', visible: 'legendonly' },
          ]}
          layout={{
            title: '운동 그래프',
            height: 300,
            xaxis: { title: '시간 (s)' },
            yaxis: { title: '값' },
            updatemenus: [{
              type: 'dropdown',
              buttons: [
                { label: '속력', method: 'update', args: [{ visible: [false, true, false] }] },
                { label: '변위', method: 'update', args: [{ visible: [true, false, false] }] },
                { label: '가속도', method: 'update', args: [{ visible: [false, false, true] }] },
                { label: '전체', method: 'update', args: [{ visible: [true, true, true] }] },
              ],
            }],
          }}
          config={{ responsive: true }}
          style={{ width: '100%' }}
        />
      </div>
    </div>
  )
}
```

---

## 9. 스타일 커스터마이징

### 한글 폰트
```jsx
<Plot
  layout={{
    font: { family: 'Nanum Gothic, sans-serif' },
    title: { text: '속력-시간 그래프', font: { size: 16 } },
    xaxis: { title: { text: '시간 (s)', font: { size: 14 } } },
    yaxis: { title: { text: '속력 (m/s)', font: { size: 14 } } },
  }}
/>
```

### 색상 테마
```jsx
const COLORS = {
  position: '#e74c3c',
  velocity: '#3498db',
  acceleration: '#27ae60',
  force: '#f39c12',
  energy: '#9b59b6',
  background: '#f8f9fa',
  grid: '#ecf0f1',
}

<Plot
  layout={{
    plot_bgcolor: COLORS.background,
    paper_bgcolor: 'white',
    xaxis: { gridcolor: COLORS.grid },
    yaxis: { gridcolor: COLORS.grid },
  }}
/>
```

### 다크 모드
```jsx
const darkLayout = {
  plot_bgcolor: '#1a1a2e',
  paper_bgcolor: '#16213e',
  font: { color: '#e8e8e8' },
  xaxis: { gridcolor: '#2d2d44', zerolinecolor: '#4a4a6a' },
  yaxis: { gridcolor: '#2d2d44', zerolinecolor: '#4a4a6a' },
}
```

---

## 10. 필수 요소 체크리스트

### 그래프 기능
- [ ] 드롭다운 필터 (표시할 물리량 선택)
- [ ] 범례 클릭 토글
- [ ] 확대/축소 (기본 제공)
- [ ] 현재 시점 마커 (애니메이션 동기화)

### 시뮬레이션 연동
- [ ] 실시간 데이터 업데이트
- [ ] 리셋 시 그래프도 초기화
- [ ] 파라미터 변경 시 그래프 초기화

### 표시 옵션
- [ ] 구간 배경색
- [ ] 이벤트 수직선 (충돌, 전환점)
- [ ] 단위 표시
