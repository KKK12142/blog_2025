# 시각화 스타일 가이드

물리 시뮬레이션의 일관된 시각화를 위한 규칙.

---

## 1. 레이아웃

### Figure 구조 - 단일 그래프
```python
fig = plt.figure(figsize=(14, 10))

# 다이어그램 영역 (중앙 상단, 58%)
ax_diagram = fig.add_axes([0.08, 0.35, 0.84, 0.58])

# 그래프 영역 (하단, 22%)
ax_graph = fig.add_axes([0.08, 0.08, 0.84, 0.22])
```

### Figure 구조 - 다중 그래프 (2열)
```python
fig = plt.figure(figsize=(14, 12))

# 다이어그램 (상단, 48%)
ax_diagram = fig.add_axes([0.08, 0.45, 0.84, 0.48])

# 그래프 2개 (하단 병렬)
ax_graph1 = fig.add_axes([0.08, 0.08, 0.40, 0.30])   # 왼쪽 (예: v-t)
ax_graph2 = fig.add_axes([0.52, 0.08, 0.40, 0.30])   # 오른쪽 (예: s-t)
```

### Figure 구조 - 다중 그래프 (3열)
```python
fig = plt.figure(figsize=(16, 12))

# 다이어그램 (상단)
ax_diagram = fig.add_axes([0.05, 0.45, 0.90, 0.48])

# 그래프 3개 (하단 병렬)
ax_st = fig.add_axes([0.05, 0.08, 0.28, 0.30])   # s-t
ax_vt = fig.add_axes([0.36, 0.08, 0.28, 0.30])   # v-t
ax_at = fig.add_axes([0.67, 0.08, 0.28, 0.30])   # a-t
```

### 레이아웃 선택 기준
```
단순 등가속도 운동 → 단일 그래프 (v-t)
다중 물체/구간 비교 → 다중 그래프 (v-t + s-t)
완전 분석 (수능형) → 3열 그래프 (s-t, v-t, a-t)
```

### 레이아웃 원칙
```
┌────────────────────────────────────────┐
│       ┌────────────────────┐           │
│       │                    │           │
│       │   다이어그램       │           │
│       │   (48~58%)         │           │
│       │                    │           │
│       └────────────────────┘           │
│       ┌──────────┐ ┌──────────┐        │
│       │  그래프1 │ │  그래프2 │        │
│       │  (22~30%)│ │  (22~30%)│        │
│       └──────────┘ └──────────┘        │
└────────────────────────────────────────┘
```

---

## 2. 그래프 유형별 설정

### s-t 그래프 (변위-시간)
```python
ax_st.set_xlabel('시간 (s)', fontproperties=font_prop)
ax_st.set_ylabel('변위 (m)', fontproperties=font_prop)
ax_st.set_title('s-t 그래프', fontproperties=font_prop)

# 특징: 등속→직선, 등가속→포물선
# 기울기 = 속도
```

### v-t 그래프 (속력-시간)
```python
ax_vt.set_xlabel('시간 (s)', fontproperties=font_prop)
ax_vt.set_ylabel('속력 (m/s)', fontproperties=font_prop)
ax_vt.set_title('v-t 그래프', fontproperties=font_prop)

# 특징: 등가속→직선
# 기울기 = 가속도, 면적 = 변위
```

### a-t 그래프 (가속도-시간)
```python
ax_at.set_xlabel('시간 (s)', fontproperties=font_prop)
ax_at.set_ylabel('가속도 (m/s²)', fontproperties=font_prop)
ax_at.set_title('a-t 그래프', fontproperties=font_prop)

# 특징: 구간별 상수 → 계단형
ax_at.step(times, accelerations, where='post', color=color)
```

### E-t 그래프 (에너지-시간)
```python
ax_E.set_xlabel('시간 (s)', fontproperties=font_prop)
ax_E.set_ylabel('에너지 (J)', fontproperties=font_prop)
ax_E.set_title('에너지 그래프', fontproperties=font_prop)

# 운동에너지, 위치에너지, 총에너지 동시 표시
ax_E.plot(t, KE, label='운동에너지', color='#e74c3c')
ax_E.plot(t, PE, label='위치에너지', color='#3498db')
ax_E.plot(t, KE + PE, label='역학적에너지', color='#2c3e50', linestyle='--')
ax_E.legend(prop=font_prop)
```

### 위상 다이어그램 (x-v)
```python
ax_phase.set_xlabel('위치 x (m)', fontproperties=font_prop)
ax_phase.set_ylabel('속도 v (m/s)', fontproperties=font_prop)
ax_phase.set_title('위상 다이어그램', fontproperties=font_prop)
ax_phase.set_aspect('equal')

# 단진동 → 타원
theta = np.linspace(0, 2*np.pi, 100)
x = A * np.cos(theta)
v = -A * omega * np.sin(theta)
ax_phase.plot(x, v, color='#9b59b6')
```

---

## 3. 다중 그래프 동기화

### 현재 시점 표시
```python
def update_all_graphs(t, data):
    # 모든 그래프에 동일 시점 표시
    for ax, ylabel, values in [
        (ax_st, '변위', s_data),
        (ax_vt, '속력', v_data),
        (ax_at, '가속도', a_data)
    ]:
        # 데이터 라인
        ax.plot(times[:frame], values[:frame], color=color, lw=2)
        
        # 현재 점 (빨간색)
        ax.plot(times[frame], values[frame], 'ro', markersize=8)
        
        # 수직 점선 (현재 시간)
        ax.axvline(t, color='red', alpha=0.3, linestyle='--')
```

### x축 동기화
```python
# 모든 그래프의 x축 범위 동일하게
x_max = t_total * 1.1
for ax in [ax_st, ax_vt, ax_at]:
    ax.set_xlim(0, x_max)
```

### 다이어그램 설정
```python
ax_diagram.set_aspect('equal')
ax_diagram.grid(True, alpha=0.3)
ax_diagram.set_title('제목', fontsize=14, fontweight='bold', fontproperties=font_prop)
```

---

## 2. 한글 폰트

### 전역 설정
```python
import matplotlib.pyplot as plt
import matplotlib.font_manager as fm

# 폰트 경로
font_path = '/usr/share/fonts/truetype/nanum/NanumGothic.ttf'
font_prop = fm.FontProperties(fname=font_path)

# 전역 설정
plt.rcParams['font.family'] = 'NanumGothic'
plt.rcParams['axes.unicode_minus'] = False

# 폰트 캐시 갱신 (필요시)
fm._load_fontmanager(try_read_cache=False)
```

### 개별 텍스트 적용
```python
ax.set_title('운동 시뮬레이션', fontproperties=font_prop, fontsize=14)
ax.set_xlabel('시간 (s)', fontproperties=font_prop, fontsize=12)
ax.set_ylabel('속력 (m/s)', fontproperties=font_prop, fontsize=12)
ax.text(x, y, '물체 A', fontproperties=font_prop, fontsize=10)
ax.legend(prop=font_prop)
```

### 수식은 LaTeX 유지
```python
ax.text(x, y, r'$v = v_0 + at$', fontsize=12)  # 수식
ax.text(x, y, '가속도', fontproperties=font_prop)  # 한글
```

---

## 3. 색상 팔레트

### 표준 색상
```python
COLORS = {
    # ===== 표면/배경 =====
    'slope_left': '#3498db',      # 왼쪽 빗면 (파란색)
    'slope_right': '#27ae60',     # 오른쪽 빗면 (초록색)
    'floor': '#7f8c8d',           # 수평면 (회색)
    'background': '#ffffff',      # 배경 (흰색, 밝은 테마)
    
    # ===== 물체 =====
    'object_A': '#e74c3c',        # 물체 A (빨간색)
    'object_B': '#9b59b6',        # 물체 B (보라색)
    'object_C': '#f39c12',        # 물체 C (주황색)
    'object_D': '#1abc9c',        # 물체 D (청록색)
    
    # ===== 연결 요소 =====
    'rope': '#2c3e50',            # 실 (진한 회색)
    'pulley_fill': '#ecf0f1',     # 도르래 내부 (밝은 회색)
    'pulley_edge': '#2c3e50',     # 도르래 테두리
    
    # ===== 벡터/물리량 =====
    'force': '#4ade80',           # 힘 (녹색)
    'velocity': '#60a5fa',        # 속도 (파란색)
    'acceleration': '#f87171',    # 가속도 (빨간색)
    'torque': '#c084fc',          # 토크 (보라색)
    
    # ===== 그래프 구간 =====
    'phase_acc': '#3498db22',     # 가속 구간 (투명 파랑)
    'phase_const': '#27ae6022',   # 등속 구간 (투명 초록)
    'phase_dec': '#e74c3c22',     # 감속 구간 (투명 빨강)
    
    # ===== 강조/이벤트 =====
    'highlight': '#fbbf24',       # 강조 (노란색)
    'event_line': '#e74c3c',      # 이벤트 선 (빨간색)
    'current_point': '#e74c3c',   # 현재 시점 (빨간색)
}
```

### 물체 색상 선택 규칙
```python
def get_object_color(index):
    """물체 인덱스에 따른 색상 반환"""
    colors = ['#e74c3c', '#9b59b6', '#f39c12', '#1abc9c', '#3498db']
    return colors[index % len(colors)]
```

---

## 4. 물체 표현

### 크기 규칙
```python
# 기준 크기 (단위 질량 m에 대해)
base_size = 0.25

# 질량 비례 크기 (약간의 비선형)
def get_object_size(mass, m_ref=1):
    size = base_size * (mass / m_ref) ** 0.3
    return max(0.15, min(0.5, size))  # 최소 0.15, 최대 0.5

# 예시
# m → 0.25
# 2m → 0.31
# 3m → 0.35
```

### 물체 회전 (빗면)
```python
from matplotlib.patches import Polygon
import numpy as np

def get_rotated_rect(cx, cy, w, h, angle):
    """회전된 사각형 꼭짓점 반환"""
    corners = np.array([
        [-w/2, -h/2],
        [w/2, -h/2],
        [w/2, h/2],
        [-w/2, h/2]
    ])
    cos_a, sin_a = np.cos(angle), np.sin(angle)
    rotation = np.array([[cos_a, -sin_a], [sin_a, cos_a]])
    rotated = corners @ rotation.T
    return rotated + np.array([cx, cy])

# 사용
verts = get_rotated_rect(x, y, size, size, theta)
poly = Polygon(verts, facecolor=color, edgecolor='white', linewidth=2)
ax.add_patch(poly)
```

### 라벨 규칙
```python
# 물체 내부: 흰색 볼드
label = ax.text(x, y, 'A', ha='center', va='center',
                fontsize=11, fontweight='bold', color='white',
                fontproperties=font_prop, zorder=11)

# 질량 표시: 물체 외부 (위 또는 아래)
mass_label = ax.text(x, y + size/2 + 0.1, '3m',
                     ha='center', fontsize=9, color=color,
                     fontproperties=font_prop)
```

---

## 5. 표면 위 물체 배치

### 핵심 원칙
> 물체의 **밑면 중심**이 표면 위 경로를 따라 이동

### 빗면 위 배치
```python
def offset_normal(x, y, h, theta, direction='up'):
    """
    빗면의 법선 방향으로 h만큼 offset
    
    direction:
      'up' - 빗면 위쪽 (물체 배치용)
      'down' - 빗면 아래쪽
    """
    if direction == 'up':
        # 왼쪽 올라가는 빗면: 법선이 왼쪽 위
        nx = -np.sin(theta)
        ny = np.cos(theta)
    else:
        nx = np.sin(theta)
        ny = -np.cos(theta)
    
    return x + nx * h, y + ny * h

# 사용: 물체 중심 = 빗면 위 점 + 법선방향 * (물체높이/2)
x_base, y_base = get_pos_on_slope(s)  # 빗면 위 점
x_center, y_center = offset_normal(x_base, y_base, size/2, theta)
```

### 수평면 위 배치
```python
# 수평면 (y = y_floor)
x_center = x_base
y_center = y_floor + size/2  # 단순히 위로 offset
```

### 시각적 확인
```python
# 디버그: 빗면 위 경로 표시
ax.plot([x_start, x_end], [y_start, y_end], 'r--', alpha=0.3, label='물체 경로')
```

---

## 6. 도르래 및 실 규칙

### 도르래 위치
```python
# 도르래 반지름
pulley_r = 0.15

# 도르래 중심 높이: 빗면 끝점 + 물체 중심 높이 + 여유
# 이렇게 해야 물체에서 나온 실이 빗면과 평행하게 도르래에 접함
pulley_x = x_slope_top
pulley_y = y_slope_top + object_size/2 + pulley_r + 0.05
```

### 도르래 그리기
```python
from matplotlib.patches import Circle

# 도르래 원
pulley = Circle((pulley_x, pulley_y), pulley_r,
                facecolor=COLORS['pulley_fill'],
                edgecolor=COLORS['pulley_edge'],
                linewidth=3, zorder=6)
ax.add_patch(pulley)

# 도르래 중심점
ax.plot(pulley_x, pulley_y, 'ko', markersize=4, zorder=7)
```

### 실의 도르래 접선점
```python
def get_pulley_tangent(pulley_x, pulley_y, pulley_r, theta, side='left'):
    """
    도르래에서 실이 나오는 접선점 계산
    
    side:
      'left' - 왼쪽 빗면으로 가는 실
      'right' - 오른쪽 빗면으로 가는 실
    """
    if side == 'left':
        # 왼쪽 빗면 각도 theta_A에 대한 접선점
        # 실이 빗면과 평행하게 나가려면, 접선이 빗면 방향이어야 함
        tangent_x = pulley_x - pulley_r * np.sin(theta)
        tangent_y = pulley_y + pulley_r * np.cos(theta)  # 위쪽
    else:
        tangent_x = pulley_x + pulley_r * np.sin(theta)
        tangent_y = pulley_y + pulley_r * np.cos(theta)  # 위쪽
    
    return tangent_x, tangent_y
```

### 실 연결 규칙

#### 물체 → 도르래
```python
# 물체 중심에서 출발
rope_start_x = object_center_x
rope_start_y = object_center_y

# 도르래 접선점으로 연결
tangent_x, tangent_y = get_pulley_tangent(...)

rope, = ax.plot([rope_start_x, tangent_x], [rope_start_y, tangent_y],
                color=COLORS['rope'], linewidth=2.5, zorder=4)
```

#### 같은 빗면의 물체끼리
```python
# 빗면 방향 모서리에서 연결
# 물체 B의 아래쪽 모서리 → 물체 C의 위쪽 모서리
rope_B_x = obj_B_x + (size_B/2) * np.cos(theta)
rope_B_y = obj_B_y - (size_B/2) * np.sin(theta)

rope_C_x = obj_C_x - (size_C/2) * np.cos(theta)
rope_C_y = obj_C_y + (size_C/2) * np.sin(theta)

rope_BC, = ax.plot([rope_B_x, rope_C_x], [rope_B_y, rope_C_y],
                   color=COLORS['rope'], linewidth=2.5, zorder=4)
```

### 실 끊어짐 표현
```python
if t > t_cut:
    rope_BC.set_data([], [])  # 실 제거
```

---

## 7. 정보 표시

### 상태 텍스트 (겹침 방지)
```python
# 항상 axes 좌표 사용 (0~1)
# 왼쪽 상단에 고정
info_text = ax.text(0.02, 0.95, '',
                    transform=ax.transAxes,
                    fontsize=11,
                    fontproperties=font_prop,
                    verticalalignment='top',
                    family='monospace',
                    bbox=dict(boxstyle='round', facecolor='wheat', alpha=0.9),
                    zorder=100)

# 업데이트
info_text.set_text(f't = {t:.2f} s\n'
                   f'구간: {phase}\n'
                   f'v_A = {v_A:.2f} m/s')
```

### Legend 배치
```python
# 방법 1: 그래프 외부
ax.legend(loc='upper left', bbox_to_anchor=(1.02, 1),
          prop=font_prop, fontsize=9)

# 방법 2: 빈 공간에
ax.legend(loc='upper right', prop=font_prop, fontsize=9)

# 방법 3: 그래프 아래
ax.legend(loc='upper center', bbox_to_anchor=(0.5, -0.15),
          ncol=3, prop=font_prop, fontsize=9)
```

### 그래프 동기화
```python
# 현재 시점 표시 (빨간 점)
current_point, = ax_graph.plot([], [], 'ro', markersize=8, zorder=10)

def animate(frame):
    # ...
    current_point.set_data([t], [v])  # 현재 위치
```

### 이벤트 표시
```python
# 충돌/전환 시점 세로선
ax_graph.axvline(t_collision, color='red', linestyle='--', alpha=0.7)
ax_graph.text(t_collision + 0.02, y_pos, '충돌',
              fontsize=9, color='red', fontproperties=font_prop)

# 구간 배경색
ax_graph.axvspan(0, t1, alpha=0.15, color='blue', label='가속')
ax_graph.axvspan(t1, t2, alpha=0.15, color='green', label='등속')
```

---

## 8. 애니메이션 제어

### 속도 조절
```python
speed_factor = 1.0  # 0.5x, 1x, 2x

dt = 0.02 / speed_factor
interval = 20 / speed_factor  # ms
fps = 50 * speed_factor
```

### 특정 시점 일시정지
```python
pause_events = [
    {'time': 1.0, 'frames': 25, 'label': '충돌'},  # 0.5초 정지
    {'time': 3.0, 'frames': 25, 'label': '실 끊어짐'},
]

def frame_to_time(frame):
    """프레임 → 실제 시간 변환 (일시정지 고려)"""
    t = 0
    f = 0
    for event in sorted(pause_events, key=lambda x: x['time']):
        frames_to_event = int(event['time'] / dt) - f
        if frame <= f + frames_to_event:
            return t + (frame - f) * dt
        f += frames_to_event
        if frame <= f + event['frames']:
            return event['time']  # 정지 중
        f += event['frames']
        t = event['time']
    return t + (frame - f) * dt
```

### 구간별 시간 확장
```python
# 빠른 구간은 늘리고, 느린 구간은 줄임
time_scale = {
    'phase1': 1.0,   # 기본
    'phase2': 0.5,   # 느리게 (중요한 구간)
    'phase3': 2.0,   # 빠르게
}
```

---

## 9. 출력 설정

### GIF (기본)
```python
ani.save('output.gif', writer='pillow', fps=50, dpi=120)
```

### MP4 (고품질)
```python
ani.save('output.mp4', writer='ffmpeg', fps=60, dpi=150,
         extra_args=['-vcodec', 'libx264', '-pix_fmt', 'yuv420p'])
```

### PNG (정적)
```python
fig.savefig('diagram.png', dpi=150, bbox_inches='tight',
            facecolor='white', edgecolor='none')
```

---

## 10. 완성 예시 코드 구조

```python
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.font_manager as fm
from matplotlib.patches import Polygon, Circle
import matplotlib.animation as animation

# === 폰트 설정 ===
font_path = '/usr/share/fonts/truetype/nanum/NanumGothic.ttf'
font_prop = fm.FontProperties(fname=font_path)
plt.rcParams['axes.unicode_minus'] = False

# === 색상 ===
COLORS = {...}

# === 물리량 계산 ===
# Phase 1 & 2 결과

# === 좌표 설정 ===
# Phase 3 결과

# === Figure 설정 ===
fig = plt.figure(figsize=(14, 10))
ax_diagram = fig.add_axes([0.08, 0.35, 0.84, 0.58])
ax_graph = fig.add_axes([0.08, 0.08, 0.84, 0.22])

# === 정적 요소 그리기 ===
# 빗면, 도르래, 점 표시 등

# === 동적 요소 생성 ===
# 물체 Polygon, 실, 라벨 등

# === 애니메이션 함수 ===
def animate(frame):
    t = frame * dt
    # 위치 계산
    # 물체 업데이트
    # 실 업데이트
    # 그래프 업데이트
    # 상태 텍스트 업데이트
    return ...

# === 실행 ===
ani = animation.FuncAnimation(fig, animate, init_func=init,
                              frames=n_frames, interval=20, blit=True)
ani.save('simulation.gif', writer='pillow', fps=50, dpi=120)
```
