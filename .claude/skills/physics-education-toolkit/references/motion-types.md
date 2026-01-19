# 운동 유형별 상세 구현

## 1. 빗면 운동 (Inclined Plane)

### 기본 설정
```python
# 빗면 각도 계산 (가속도로부터)
theta = np.arcsin(a / g)

# 좌표 계산
x_end = x_start + (y_start - y_end) / np.tan(theta)
```

### 단일 빗면 운동
```python
def incline_position(t, a, v0, x0, y0, theta):
    """
    빗면을 따라 내려가는 운동
    
    Parameters:
        t: 시간
        a: 가속도 (빗면 방향)
        v0: 초기 속력
        x0, y0: 초기 위치
        theta: 빗면 각도
    """
    s = v0*t + 0.5*a*t**2  # 빗면 따라 이동 거리
    dx = s * np.cos(theta)
    dy = -s * np.sin(theta)  # 내려감
    return x0 + dx, y0 + dy
```

### 다중 구간 (마찰 포함)
```python
segments = [
    {'type': 'acc', 'a': 3*a, 'length': L1, 'label': '가속 구간'},
    {'type': 'const_v', 'length': L2, 'label': '등속 (마찰)'},
    {'type': 'dec', 'a': -2*a, 'end_condition': 'v=0', 'label': '감속'},
]

# 마찰 구간 등속 조건
# μ*cos(θ) = sin(θ) → μ = tan(θ)
```

### 물체 배치 (빗면 위)
```python
def get_object_on_slope(s, x_start, y_start, theta, size):
    """빗면 위 물체 중심 좌표"""
    # 빗면 위 점
    x_base = x_start + s * np.cos(theta)
    y_base = y_start - s * np.sin(theta)
    
    # 법선 방향으로 offset (물체가 빗면 위에 놓이도록)
    x_center = x_base - (size/2) * np.sin(theta)
    y_center = y_base + (size/2) * np.cos(theta)
    
    return x_center, y_center
```

---

## 2. 충돌 (Collision)

### 탄성 충돌 (1D)
```python
def elastic_collision_1d(m1, m2, v1, v2):
    """
    1차원 탄성 충돌 후 속도 계산
    
    운동량 보존: m1*v1 + m2*v2 = m1*v1' + m2*v2'
    에너지 보존: 0.5*m1*v1² + 0.5*m2*v2² = 0.5*m1*v1'² + 0.5*m2*v2'²
    """
    v1_after = ((m1 - m2)*v1 + 2*m2*v2) / (m1 + m2)
    v2_after = ((m2 - m1)*v2 + 2*m1*v1) / (m1 + m2)
    return v1_after, v2_after
```

### 비탄성 충돌
```python
def inelastic_collision(m1, m2, v1, v2, e=0):
    """
    비탄성 충돌 (반발계수 e)
    
    e = 0: 완전 비탄성 (붙음)
    0 < e < 1: 비탄성
    e = 1: 탄성
    """
    if e == 0:
        # 완전 비탄성
        v_after = (m1*v1 + m2*v2) / (m1 + m2)
        return v_after, v_after
    else:
        # 반발계수 사용
        # e = (v2' - v1') / (v1 - v2)
        # 운동량 보존과 연립
        v1_after = (m1*v1 + m2*v2 - m2*e*(v1 - v2)) / (m1 + m2)
        v2_after = (m1*v1 + m2*v2 + m1*e*(v1 - v2)) / (m1 + m2)
        return v1_after, v2_after
```

### 애니메이션 처리
```python
def get_collision_positions(t, t_collision, x1_0, x2_0, v1, v2, v1_after, v2_after):
    """충돌 전후 위치 계산"""
    if t < t_collision:
        x1 = x1_0 + v1 * t
        x2 = x2_0 + v2 * t
    else:
        dt = t - t_collision
        x1_at_collision = x1_0 + v1 * t_collision
        x2_at_collision = x2_0 + v2 * t_collision
        x1 = x1_at_collision + v1_after * dt
        x2 = x2_at_collision + v2_after * dt
    return x1, x2
```

### 충돌 시점 계산
```python
def find_collision_time(x1_0, x2_0, v1, v2, size1, size2):
    """두 물체가 충돌하는 시점"""
    # x1 + size1/2 = x2 - size2/2 일 때 (물체 1이 왼쪽)
    if v1 <= v2:
        return None  # 충돌 안 함
    
    d = (x2_0 - size2/2) - (x1_0 + size1/2)
    t_collision = d / (v1 - v2)
    return t_collision if t_collision > 0 else None
```

---

## 3. 원운동 (Circular Motion)

### 등속 원운동
```python
def uniform_circular(t, r, omega, cx, cy, phi=0):
    """
    등속 원운동
    
    Parameters:
        r: 반지름
        omega: 각속도 (rad/s)
        cx, cy: 원 중심
        phi: 초기 위상
    """
    theta = omega * t + phi
    x = cx + r * np.cos(theta)
    y = cy + r * np.sin(theta)
    
    # 속도 (접선 방향)
    vx = -r * omega * np.sin(theta)
    vy = r * omega * np.cos(theta)
    
    return x, y, vx, vy

# 관련 공식
omega = v / r              # 각속도
T = 2 * np.pi / omega      # 주기
a_c = v**2 / r             # 구심 가속도
```

### 연직면 원운동
```python
def vertical_circular_motion(t, r, v0, cx, cy):
    """
    연직면 원운동 (에너지 보존 이용)
    
    최저점에서 시작, 반시계 방향
    """
    g = 10
    
    # 에너지 보존: 0.5*v0² = 0.5*v² + g*h
    # h = r*(1 - cos(θ))
    
    # 수치 적분 필요 (각속도가 위치에 따라 변함)
    # 간단한 경우: 최저점 속력만 주어지면
    
    # 최고점 최소 속력
    v_min_top = np.sqrt(g * r)
    
    # 최저점에서 최고점까지 에너지 보존
    # v_bottom² = v_top² + 4*g*r
    
    # 장력
    # T_bottom = m*v²/r + m*g
    # T_top = m*v²/r - m*g
```

### 원운동 애니메이션
```python
# 궤적
theta_arr = np.linspace(0, 2*np.pi, 100)
x_circle = cx + r * np.cos(theta_arr)
y_circle = cy + r * np.sin(theta_arr)
ax.plot(x_circle, y_circle, 'b--', alpha=0.3)

# 물체 위치
x_obj, y_obj, _, _ = uniform_circular(t, r, omega, cx, cy)
```

---

## 4. 단진동 (Simple Harmonic Motion)

### 기본 공식
```python
def shm_position(t, A, omega, phi=0):
    """
    단진동 위치와 속도
    
    x = A*cos(ωt + φ)
    v = -A*ω*sin(ωt + φ)
    a = -A*ω²*cos(ωt + φ) = -ω²x
    """
    x = A * np.cos(omega * t + phi)
    v = -A * omega * np.sin(omega * t + phi)
    a = -omega**2 * x
    return x, v, a

# 용수철
omega = np.sqrt(k / m)
T = 2 * np.pi / omega

# 단진자 (소각 근사)
omega = np.sqrt(g / L)
```

### 에너지
```python
E_total = 0.5 * k * A**2  # 상수
E_kinetic = 0.5 * m * v**2
E_potential = 0.5 * k * x**2

# 임의 위치에서
v = omega * np.sqrt(A**2 - x**2)
```

### 감쇠 진동
```python
def damped_oscillation(t, A, omega_0, gamma, phi=0):
    """
    감쇠 진동 (부족 감쇠)
    
    x = A*exp(-γt)*cos(ω_d*t + φ)
    """
    omega_d = np.sqrt(omega_0**2 - gamma**2)
    x = A * np.exp(-gamma * t) * np.cos(omega_d * t + phi)
    return x
```

### 위상 다이어그램
```python
# x-v 그래프 (타원)
x_phase = A * np.cos(theta_arr)
v_phase = -A * omega * np.sin(theta_arr)
ax.plot(x_phase, v_phase, 'b-')
ax.set_xlabel('위치 x')
ax.set_ylabel('속도 v')
```

---

## 5. 포물선 운동 (Projectile Motion)

### 기본 분리
```python
def projectile_motion(t, v0, theta, x0=0, y0=0, g=10):
    """
    포물선 운동
    
    x방향: 등속
    y방향: 등가속도 (-g)
    """
    vx = v0 * np.cos(theta)
    vy0 = v0 * np.sin(theta)
    
    x = x0 + vx * t
    y = y0 + vy0 * t - 0.5 * g * t**2
    vy = vy0 - g * t
    
    return x, y, vx, vy
```

### 주요 값
```python
# 최고점
t_max = v0 * np.sin(theta) / g
y_max = y0 + (v0 * np.sin(theta))**2 / (2 * g)
x_at_max = x0 + v0 * np.cos(theta) * t_max

# 수평 도달 거리 (y0 = 0에서 출발, 지면 착지)
R = v0**2 * np.sin(2 * theta) / g

# 착지 시간 (y = y_land)
def time_to_land(v0, theta, y0, y_land, g=10):
    vy0 = v0 * np.sin(theta)
    # y = y0 + vy0*t - 0.5*g*t² = y_land
    # 0.5*g*t² - vy0*t + (y_land - y0) = 0
    a = 0.5 * g
    b = -vy0
    c = y_land - y0
    discriminant = b**2 - 4*a*c
    t = (-b + np.sqrt(discriminant)) / (2*a)
    return t
```

### 궤적 그리기
```python
t_land = time_to_land(v0, theta, y0, 0)
t_arr = np.linspace(0, t_land, 100)

x_traj = x0 + v0 * np.cos(theta) * t_arr
y_traj = y0 + v0 * np.sin(theta) * t_arr - 0.5 * g * t_arr**2

ax.plot(x_traj, y_traj, 'b--', alpha=0.5, label='궤적')
ax.axhline(0, color='gray', linewidth=2)  # 지면
```

### 속도 벡터 표시
```python
# 현재 속도 벡터
scale = 0.1
ax.arrow(x, y, vx*scale, vy*scale,
         head_width=0.1, head_length=0.05, fc='red', ec='red')
```

---

## 6. 연결된 물체 (Connected Objects)

### Atwood Machine (도르래)
```python
def atwood_machine(m1, m2, g=10):
    """
    Atwood 기계
    m1 > m2 가정 (m1이 내려감)
    """
    a = (m1 - m2) * g / (m1 + m2)
    T = 2 * m1 * m2 * g / (m1 + m2)
    return a, T

def atwood_positions(t, a, y1_0, y2_0):
    """시간 t에서 위치 (정지 출발)"""
    s = 0.5 * a * t**2
    y1 = y1_0 - s  # m1 내려감
    y2 = y2_0 + s  # m2 올라감
    return y1, y2
```

### 빗면 + 수직 연결
```python
def incline_vertical_system(m1, m2, theta, g=10):
    """
    m1: 빗면 위 (올라감/내려감)
    m2: 수직 (내려감)
    """
    # m2가 내려가고 m1이 올라가는 경우
    # m2*g - T = m2*a
    # T - m1*g*sin(θ) = m1*a
    
    a = (m2 - m1 * np.sin(theta)) * g / (m1 + m2)
    T = m1 * m2 * g * (1 + np.sin(theta)) / (m1 + m2)
    
    return a, T
```

### 양쪽 빗면 연결
```python
def two_inclines_system(m1, m2, theta1, theta2, g=10):
    """
    양쪽 빗면에 물체가 있고 도르래로 연결
    m1: 왼쪽 빗면 (각도 θ1)
    m2: 오른쪽 빗면 (각도 θ2)
    
    m2가 내려가고 m1이 올라가는 경우
    """
    a = (m2 * np.sin(theta2) - m1 * np.sin(theta1)) * g / (m1 + m2)
    return a
```

### 실의 구속조건
```python
# 실 길이 일정 → 가속도 크기 동일
# 방향은 다를 수 있음

# A가 s만큼 이동하면 B도 s만큼 이동 (같은 실)
def connected_positions(t, a, pos_A_start, pos_B_start, dir_A, dir_B):
    """
    dir_A, dir_B: 이동 방향 단위 벡터
    """
    s = 0.5 * a * t**2
    
    pos_A = pos_A_start + s * np.array(dir_A)
    pos_B = pos_B_start + s * np.array(dir_B)
    
    return pos_A, pos_B
```

### 도르래 시각화
```python
def draw_pulley_system(ax, pulley_pos, obj_A_pos, obj_B_pos, theta_A, theta_B, pulley_r):
    """도르래와 실 그리기"""
    px, py = pulley_pos
    
    # 도르래
    pulley = Circle((px, py), pulley_r,
                    facecolor='#ecf0f1', edgecolor='#2c3e50', linewidth=2)
    ax.add_patch(pulley)
    
    # A → 도르래 접선점
    tangent_A = (px - pulley_r * np.sin(theta_A),
                 py + pulley_r * np.cos(theta_A))
    
    # 도르래 → B 접선점
    tangent_B = (px + pulley_r * np.sin(theta_B),
                 py + pulley_r * np.cos(theta_B))
    
    # 실 그리기
    ax.plot([obj_A_pos[0], tangent_A[0]], [obj_A_pos[1], tangent_A[1]],
            color='#2c3e50', linewidth=2)
    ax.plot([tangent_B[0], obj_B_pos[0]], [tangent_B[1], obj_B_pos[1]],
            color='#2c3e50', linewidth=2)
```

---

## 공통 유틸리티

### 구간 전환 관리
```python
def calculate_segments(segments):
    """각 구간의 시간/거리/속도 계산"""
    for i, seg in enumerate(segments):
        if i == 0:
            seg['t_start'] = 0
            seg['v_start'] = seg.get('v0', 0)
            seg['s_start'] = 0
        else:
            prev = segments[i-1]
            seg['t_start'] = prev['t_end']
            seg['v_start'] = prev['v_end']
            seg['s_start'] = prev['s_end']
        
        # 구간 끝 계산
        if seg['type'] == 'acc':
            # 거리로 끝나는 경우
            if 'length' in seg:
                seg['s_end'] = seg['s_start'] + seg['length']
                seg['v_end'] = np.sqrt(seg['v_start']**2 + 2*seg['a']*seg['length'])
                seg['t_end'] = seg['t_start'] + (seg['v_end'] - seg['v_start']) / seg['a']
            # 속도로 끝나는 경우
            elif 'v_end' in seg:
                seg['t_end'] = seg['t_start'] + (seg['v_end'] - seg['v_start']) / seg['a']
                seg['s_end'] = seg['s_start'] + seg['v_start'] * (seg['t_end'] - seg['t_start']) + 0.5 * seg['a'] * (seg['t_end'] - seg['t_start'])**2
                
        elif seg['type'] == 'const_v':
            seg['v_end'] = seg['v_start']
            if 'length' in seg:
                seg['s_end'] = seg['s_start'] + seg['length']
                seg['t_end'] = seg['t_start'] + seg['length'] / seg['v_start']
            elif 'duration' in seg:
                seg['t_end'] = seg['t_start'] + seg['duration']
                seg['s_end'] = seg['s_start'] + seg['v_start'] * seg['duration']
                
        elif seg['type'] == 'dec':
            # 정지까지 감속
            if seg.get('end_condition') == 'v=0':
                seg['v_end'] = 0
                seg['t_end'] = seg['t_start'] + seg['v_start'] / abs(seg['a'])
                seg['s_end'] = seg['s_start'] + seg['v_start']**2 / (2*abs(seg['a']))
    
    return segments
```

### 시간에 따른 상태
```python
def get_state_at_time(t, segments):
    """시간 t에서의 위치, 속도, 현재 구간"""
    for seg in segments:
        if seg['t_start'] <= t <= seg['t_end']:
            dt = t - seg['t_start']
            
            if seg['type'] in ['acc', 'dec']:
                s = seg['s_start'] + seg['v_start']*dt + 0.5*seg['a']*dt**2
                v = seg['v_start'] + seg['a']*dt
            else:  # const_v
                s = seg['s_start'] + seg['v_start']*dt
                v = seg['v_start']
            
            return s, v, seg['label']
    
    # 마지막 구간 이후
    last = segments[-1]
    return last['s_end'], last['v_end'], last['label']
```

### 보간 함수
```python
def interpolate(p1, p2, ratio):
    """두 점 사이를 ratio (0~1)로 보간"""
    return (
        p1[0] + ratio * (p2[0] - p1[0]),
        p1[1] + ratio * (p2[1] - p1[1])
    )
```
