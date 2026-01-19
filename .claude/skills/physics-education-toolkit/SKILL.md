---
name: physics-education-toolkit
description: "물리 교육용 시각화 및 시뮬레이션 통합 툴킷. 사용 시점: (1) 물리 문제를 분석하고 애니메이션으로 시각화할 때, (2) 역학 문제(빗면, 충돌, 진동, 원운동, 포물선, 연결체)를 시뮬레이션할 때, (3) v-t, s-t, a-t 그래프와 동기화된 운동 시뮬레이션 제작, (4) 힘 다이어그램, 회로도, 벡터장 등 정적 다이어그램 생성, (5) 수능/물리학 문제를 교육용 GIF/MP4로 변환할 때"
---

# Physics Education Toolkit

물리 교육 콘텐츠 제작을 위한 통합 시각화 스킬.

## 핵심 워크플로우

```
ANALYZE → ASK → SOLVE → MAP → ANIMATE
조건분석   질문   방정식   좌표매핑  애니메이션
```

---

## Phase 0: ASK (사전 질문)

문제 분석 후 사용자에게 확인할 사항:

### 필수 질문
```
📊 그래프 유형은 무엇이 필요한가요?
   □ v-t (속력-시간)
   □ s-t (변위-시간)  
   □ a-t (가속도-시간)
   □ 다중 그래프 (예: v-t + s-t 병렬)
   □ 기타 (에너지-시간, 위상 다이어그램 등)

🖼️ 출력 형식은 무엇인가요?
   □ GIF/MP4 (matplotlib) - 간단한 공유용
   □ Canvas/SVG + Plotly (웹 블로그용) - 권장
   □ R3F (3D 시점 회전 필요시만)

🎮 파라미터 조절이 필요한가요?
   □ 예 (각도, 질량, 마찰계수 등 슬라이더)
   □ 아니오 (고정값)
```

### 질문 시점
- 문제 분석(Phase 1) 완료 직후
- 복잡한 문제의 경우 반드시 확인
- 간단한 문제는 기본값(v-t, GIF) 사용 가능

---

## Phase 1: ANALYZE (조건 분석)

문제에서 추출할 것:

```python
given = {
    'explicit': [],      # 명시적: 숫자, 기호 (a=3m/s², h=2m)
    'implicit': [],      # 암묵적: 등속→a=0, 정지→v=0, 마찰구간 등속→μmgcosθ=mgsinθ
    'constraints': [],   # 구속: 실 연결, 같은 빗면, 접촉 유지
    'events': [],        # 이벤트: 실 끊어짐, 충돌, 분리 시점
}
segments = []            # 운동 구간 분리 (가속도/조건이 바뀌는 지점마다)
```

**핵심**: 암묵적 조건과 이벤트를 놓치면 풀이 실패.

---

## Phase 2: SOLVE (방정식 풀이)

### 등가속도 운동
```python
v = v0 + a*t
s = v0*t + 0.5*a*t**2
v**2 = v0**2 + 2*a*s
```

### 빗면
```python
a = g*sin(θ)                    # 마찰 없음
a = g*(sin(θ) - μ*cos(θ))       # 마찰 있음
# 역산: sin(θ) = a/g → θ = arcsin(a/g)
```

### 검증 체크리스트
- [ ] 단위 일치
- [ ] v ≥ 0 (속력은 양수)
- [ ] 차원 분석
- [ ] 에너지 보존/손실 확인

상세 공식: `references/physics-formulas.md`

---

## Phase 3: MAP (좌표 매핑)

### 기준점 설정
```python
y_ref, x_ref = 0, 0  # 수평면 = y=0, 시작점 = x=0
```

### 가속도 → 각도 변환
```python
# 가속도 비율 유지하면서 합리적 절대값 가정
a = g / 6  # 예시
sin_theta = 3*a / g  # = 0.5 → θ = 30°
delta_x = delta_y / np.tan(theta)
```

**자유도 처리**: 주어지지 않은 값은 물리적 비율을 유지하면서 시각적으로 보기 좋게 설정.

---

## Phase 4: ANIMATE (애니메이션)

### 레이아웃 옵션

#### 단일 그래프
```python
fig = plt.figure(figsize=(14, 10))
ax_diagram = fig.add_axes([0.08, 0.35, 0.84, 0.58])  # 다이어그램
ax_graph = fig.add_axes([0.08, 0.08, 0.84, 0.22])    # 그래프 1개
```

#### 다중 그래프 (2열)
```python
fig = plt.figure(figsize=(14, 12))
ax_diagram = fig.add_axes([0.08, 0.45, 0.84, 0.48])  # 다이어그램
ax_vt = fig.add_axes([0.08, 0.08, 0.40, 0.30])       # v-t 그래프
ax_st = fig.add_axes([0.52, 0.08, 0.40, 0.30])       # s-t 그래프
```

#### 다중 그래프 (3열)
```python
fig = plt.figure(figsize=(16, 12))
ax_diagram = fig.add_axes([0.05, 0.45, 0.90, 0.48])
ax_st = fig.add_axes([0.05, 0.08, 0.28, 0.30])       # s-t
ax_vt = fig.add_axes([0.36, 0.08, 0.28, 0.30])       # v-t
ax_at = fig.add_axes([0.67, 0.08, 0.28, 0.30])       # a-t
```

### 그래프 유형

| 그래프 | 용도 | 특징 |
|--------|------|------|
| **s-t** | 변위-시간 | 등속→직선, 등가속→포물선 |
| **v-t** | 속력-시간 | 기울기=가속도, 면적=변위 |
| **a-t** | 가속도-시간 | 구간별 상수, 계단형 |
| **E-t** | 에너지-시간 | KE, PE, 총에너지 |
| **위상** | x-v 다이어그램 | 단진동→타원 |

### 그래프 동기화
```python
# 모든 그래프에 현재 시점 표시
for ax, data in [(ax_vt, v_data), (ax_st, s_data), (ax_at, a_data)]:
    ax.plot(times[:frame], data[:frame], color=color, lw=2)
    ax.plot(times[frame], data[frame], 'ro', markersize=8)  # 현재점
    ax.axvline(t, color='red', alpha=0.3, linestyle='--')   # 수직선
```

### 한글 폰트 설정 (필수)
```python
import matplotlib.pyplot as plt
import matplotlib.font_manager as fm

# 폰트 설정
font_path = '/usr/share/fonts/truetype/nanum/NanumGothic.ttf'
font_prop = fm.FontProperties(fname=font_path)
plt.rcParams['font.family'] = 'NanumGothic'
plt.rcParams['axes.unicode_minus'] = False

# 개별 텍스트에 적용
ax.set_title('제목', fontproperties=font_prop)
ax.set_xlabel('시간 (s)', fontproperties=font_prop)
```

### 기본 애니메이션 구조
```python
def animate(frame):
    t = frame * dt
    x, y = get_position(t)
    v = get_velocity(t)
    
    # 물체 업데이트
    object_patch.set_xy((x - size/2, y))
    
    # 그래프 업데이트
    times.append(t)
    velocities.append(v)
    vt_line.set_data(times, velocities)
    current_point.set_data([t], [v])  # 현재 위치 표시
    
    return object_patch, vt_line, current_point

ani = animation.FuncAnimation(fig, animate, frames=n_frames, interval=20)
ani.save('output.gif', writer='pillow', fps=50, dpi=120)
```

---

## 시각화 규칙

상세 가이드: `references/style-guide.md`

### 물체 배치
- 물체의 **밑면 중심**이 표면(빗면/수평면) 위에 위치
- 법선 방향 offset = `물체높이 / 2`
- 물체는 빗면 각도만큼 기울임 (Polygon 사용)

### 도르래 규칙
- 도르래 중심 높이 = 빗면 꼭대기 + `물체높이/2` + `도르래반지름`
- 실은 **물체 중심**에서 출발
- 실은 빗면과 **평행**하게 도르래에 **접선**으로 연결

### 실 연결
- 같은 빗면의 물체 연결: 빗면 방향 모서리에서 출발
- 도르래로 연결: 물체 중심에서 출발

### Legend/정보 배치
- 상태 정보: `ax.text(0.02, 0.95, ..., transform=ax.transAxes)`
- Legend: 그래프 외부 또는 빈 공간에 배치
- 물체 이동 범위와 겹치지 않도록 주의

---

## 애니메이션 제어

### 속도 조절
```python
speed_factor = 1.0  # 0.5 = 느리게, 2.0 = 빠르게
interval = 20 / speed_factor  # ms
```

### 특정 시점 일시정지
```python
pause_events = [
    {'time': t_collision, 'duration': 0.5, 'label': '충돌'},
]

def animate(frame):
    t = calculate_time_with_pauses(frame, pause_events)
    # ...
```

### 구간 표시 (v-t 그래프)
```python
ax.axvspan(t_start, t_end, alpha=0.15, color='blue', label='가속 구간')
ax.axvline(t_event, color='red', linestyle='--', label='충돌')
```

---

## 출력 형식

| 형식 | 용도 | 설정 |
|------|------|------|
| **GIF** | 간단한 공유 | `writer='pillow', fps=50, dpi=120` |
| **MP4** | 고품질 영상 | `writer='ffmpeg', fps=60, dpi=150` |
| **PNG** | 정적 다이어그램 | `dpi=150, bbox_inches='tight'` |
| **Canvas/SVG** | 웹 게시, 2D 시뮬레이션 | React 컴포넌트 |
| **R3F** | 3D 시각화 필요시만 | Three.js + React |

### 출력 형식 선택 기준
```
정적 다이어그램 → PNG/SVG
간단한 애니메이션, 빠른 공유 → GIF
고품질 영상, 프레젠테이션 → MP4
웹 블로그, 인터랙티브 2D → Canvas/SVG + Plotly
3D 시점 회전 필요 → R3F (드문 경우)
```

---

## 웹 시뮬레이션 (Canvas/SVG)

2D 물리 시뮬레이션의 기본 출력 형식. 상세 가이드: `references/canvas-svg-guide.md`

### 필수 요소 (모든 시뮬레이션)
```jsx
// 1. 리셋 버튼 (필수!)
<button onClick={handleReset}>↺ 리셋</button>

// 2. 재생/정지 버튼
<button onClick={() => setIsPlaying(!isPlaying)}>
  {isPlaying ? '⏸ 정지' : '▶ 재생'}
</button>

// 3. 파라미터 조절 (재생 전 변경 가능)
<input
  type="range"
  value={params.angle}
  onChange={e => setParams({...params, angle: +e.target.value})}
  disabled={isPlaying}  // 재생 중 비활성화
/>

// 4. 상태 표시
<div>t = {time.toFixed(2)} s, v = {velocity.toFixed(2)} m/s</div>
```

### 리셋 함수 구현
```jsx
const handleReset = () => {
  setIsPlaying(false)
  setTime(0)
  setHistory([])  // 궤적/그래프 데이터 초기화
  if (animationRef.current) {
    cancelAnimationFrame(animationRef.current)
  }
}
```

---

## Plotly 그래프

운동 정보 시각화 + 드롭다운 필터. 상세 가이드: `references/plotly-guide.md`

### 기본 사용
```jsx
import Plot from 'react-plotly.js'

<Plot
  data={[
    { x: times, y: velocities, name: '속력' },
    { x: times, y: positions, name: '변위', visible: 'legendonly' },
  ]}
  layout={{
    updatemenus: [{  // 드롭다운 필터
      type: 'dropdown',
      buttons: [
        { label: '속력만', args: [{ visible: [true, false] }] },
        { label: '변위만', args: [{ visible: [false, true] }] },
        { label: '전체', args: [{ visible: [true, true] }] },
      ],
    }],
  }}
/>
```

### 리셋 시 그래프 초기화
```jsx
const handleReset = () => {
  setTime(0)
  setIsPlaying(false)
  setGraphData({ times: [], s: [], v: [], a: [] })  // 그래프 데이터도 초기화
}
```

---

## R3F 시뮬레이션 (3D 전용)

**3D 시점 변경이 필요한 경우에만 사용.** 상세 가이드: `references/r3f-guide.md`

### 사용 시점
- 원운동을 여러 각도에서 관찰
- 3D 벡터장 시각화
- 복잡한 3D 구조물

### 대부분의 역학 문제는 Canvas/SVG로 충분
```
빗면 운동 → Canvas/SVG ✓
충돌 문제 → Canvas/SVG ✓
도르래 시스템 → Canvas/SVG ✓
포물선 운동 → Canvas/SVG ✓
```

---

## 운동 유형별 참조

상세 구현: `references/motion-types.md`

| 유형 | 핵심 공식 | 주의점 |
|------|----------|--------|
| 빗면 | a=gsinθ | 마찰구간 등속 조건 |
| 충돌 | 운동량 보존 | 탄성/비탄성 구분 |
| 원운동 | a=v²/r | 구심력 방향 |
| 진동 | x=Acos(ωt+φ) | 위상 연속성 |
| 포물선 | x,y 분리 | 착지 조건 |
| 연결체 | 구속조건 | 가속도 동일 |

---

## 다이어그램 유형

상세 가이드: `references/diagram-types.md`

- 힘 다이어그램 (자유물체도)
- 토크/돌림힘 다이어그램
- 전기 회로도
- 벡터장 (전기장, 자기장)
- 에너지 다이어그램
- 파동 시각화

---

## 체크리스트

### 사전 질문 (ASK)
- [ ] 필요한 그래프 유형 확인 (v-t, s-t, a-t, 다중)
- [ ] 출력 형식 확인 (GIF/MP4, Canvas/SVG, R3F)
- [ ] 파라미터 조절 필요 여부 확인

### 분석 (ANALYZE)
- [ ] 암묵적 조건 모두 추출
- [ ] 운동 구간 정확히 분리

### 풀이 (SOLVE)
- [ ] 단위 일관성 확인
- [ ] 물리적 타당성 (음수 속력 없음)
- [ ] 차원 분석 완료

### 매핑 (MAP)
- [ ] 기준점 명확히 설정
- [ ] 가속도→각도 변환 시 가정 명시

### matplotlib 시각화
- [ ] 한글 폰트 적용
- [ ] 물체가 표면 위에 올바르게 배치
- [ ] 실/도르래 접선 연결
- [ ] Legend와 애니메이션 겹침 없음
- [ ] 다중 그래프 동기화 확인

### 웹 시뮬레이션 (Canvas/SVG) - 필수!
- [ ] **리셋 버튼** 구현 (⚠️ 모든 시뮬레이션 필수)
- [ ] 재생/정지 버튼 구현
- [ ] 파라미터 슬라이더 (재생 중 비활성화)
- [ ] 상태 표시 (시간, 속력, 변위 등)
- [ ] 리셋 시 그래프 데이터도 초기화

### Plotly 그래프
- [ ] 드롭다운 필터 (물리량 선택)
- [ ] 현재 시점 마커 (애니메이션 동기화)
- [ ] 구간 배경색 / 이벤트 수직선
- [ ] 리셋 시 그래프 초기화

### R3F (3D 필요시에만)
- [ ] OrbitControls 추가
- [ ] 조명/그림자 설정
- [ ] **리셋 버튼** 구현
