# 다이어그램 유형별 구현 가이드

## 1. 힘 다이어그램 (Free Body Diagram)

### 필수 요소
- 물체 (사각형 또는 원)
- 힘 벡터 (화살표, 크기 비례)
- 힘 레이블 (F, N, mg, f 등)
- 좌표축 (필요시)

### 구현 예시
```python
# 힘 벡터 그리기
ax.annotate('', xy=(end_x, end_y), xytext=(start_x, start_y),
            arrowprops=dict(arrowstyle='->', color=COLORS['force'], lw=3))
ax.text(label_x, label_y, 'F', color=COLORS['force'], fontsize=14)
```

### 체크리스트
- [ ] 모든 힘이 물체 중심에서 출발
- [ ] 힘의 방향이 물리적으로 올바름
- [ ] 크기가 상대적으로 정확함
- [ ] 레이블이 명확함

---

## 2. 토크/돌림힘 다이어그램

### 필수 요소
- 회전축 (pivot point)
- 모멘트 암 (r)
- 힘 벡터 (F)
- 회전 방향 표시 (곡선 화살표)

### 구현 예시
```python
from matplotlib.patches import Arc

# 회전축
pivot = plt.Circle((x, y), 0.3, color='#f97316', zorder=5)
ax.add_patch(pivot)

# 돌림힘 방향 (호)
arc = Arc((x, y), width, height, angle=0, theta1=0, theta2=120, 
          color=COLORS['torque'], lw=3)
ax.add_patch(arc)
```

---

## 3. 전기 회로도

### 기본 기호
| 요소 | 기호 | 구현 |
|------|------|------|
| 저항 | 지그재그 | polyline |
| 커패시터 | 평행선 | 두 개의 수직선 |
| 인덕터 | 코일 | sine wave |
| 전원 | 긴/짧은 선 | 두 개의 수직선 |
| 접지 | 삼각형 | 3개의 수평선 |

### 구현 팁
- SVG 또는 Path 사용 권장
- 격자 기반 배치로 정렬
- 연결선은 직각으로

---

## 4. 벡터장 시각화

### 전기장/자기장
```python
import numpy as np

# 격자 생성
X, Y = np.meshgrid(np.linspace(-2, 2, 10), np.linspace(-2, 2, 10))

# 점전하 전기장
r = np.sqrt(X**2 + Y**2)
Ex = X / r**3
Ey = Y / r**3

# 벡터장 그리기
ax.quiver(X, Y, Ex, Ey, color=COLORS['force'])
```

---

## 5. 운동 궤적

### 포물선 운동
```python
t = np.linspace(0, t_total, 100)
x = v0 * np.cos(theta) * t
y = v0 * np.sin(theta) * t - 0.5 * g * t**2

ax.plot(x, y, '-', color=COLORS['velocity'], lw=2)
```

### 원운동
```python
theta = np.linspace(0, 2*np.pi, 100)
x = r * np.cos(theta)
y = r * np.sin(theta)
```

---

## 6. 에너지 다이어그램

### 포텐셜 에너지 곡선
- x축: 위치
- y축: 에너지
- 안정/불안정 평형점 표시
- 총 에너지 수평선

### 에너지 준위 (양자역학)
- 수평선으로 에너지 준위 표시
- 전이 화살표 (수직)
- 에너지 값 레이블

---

## 7. 분자 구조 (화학)

### 2D 구조식
- 원: 원자
- 선: 단일 결합
- 이중선: 이중 결합
- 삼중선: 삼중 결합

### 3D 분자 모델
- Three.js 또는 R3F 사용
- 원자: Sphere
- 결합: Cylinder
- 회전 인터랙션 추가

---

## 8. 파동 시각화

### 정현파
```python
x = np.linspace(0, 4*np.pi, 200)
y = A * np.sin(k*x - omega*t)
```

### 정상파
```python
y = 2 * A * np.sin(k*x) * np.cos(omega*t)
```

### 파동 중첩
- 개별 파동 + 합성파 동시 표시
- 서로 다른 색상으로 구분
