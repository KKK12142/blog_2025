"""
Physics Education Toolkit - 스타일 설정

사용법:
    from style_config import setup_korean_font, COLORS, get_object_size

    setup_korean_font()
    color = COLORS['object_A']
    size = get_object_size(mass=3, m_ref=1)
"""

import matplotlib.pyplot as plt
import matplotlib.font_manager as fm
import numpy as np

# ============================================
# 한글 폰트 설정
# ============================================

def setup_korean_font():
    """한글 폰트 전역 설정"""
    font_path = '/usr/share/fonts/truetype/nanum/NanumGothic.ttf'
    
    # 폰트 등록
    fm.fontManager.addfont(font_path)
    
    # 전역 설정
    plt.rcParams['font.family'] = 'NanumGothic'
    plt.rcParams['axes.unicode_minus'] = False
    
    return fm.FontProperties(fname=font_path)

def get_font_prop():
    """개별 텍스트용 폰트 속성 반환"""
    font_path = '/usr/share/fonts/truetype/nanum/NanumGothic.ttf'
    return fm.FontProperties(fname=font_path)


# ============================================
# 색상 팔레트
# ============================================

COLORS = {
    # ===== 표면/배경 =====
    'slope_left': '#3498db',      # 왼쪽 빗면 (파란색)
    'slope_right': '#27ae60',     # 오른쪽 빗면 (초록색)
    'floor': '#7f8c8d',           # 수평면 (회색)
    'background': '#ffffff',      # 배경 (흰색)
    
    # ===== 물체 =====
    'object_A': '#e74c3c',        # 물체 A (빨간색)
    'object_B': '#9b59b6',        # 물체 B (보라색)
    'object_C': '#f39c12',        # 물체 C (주황색)
    'object_D': '#1abc9c',        # 물체 D (청록색)
    'object_E': '#3498db',        # 물체 E (파란색)
    
    # ===== 연결 요소 =====
    'rope': '#2c3e50',            # 실 (진한 회색)
    'pulley_fill': '#ecf0f1',     # 도르래 내부
    'pulley_edge': '#2c3e50',     # 도르래 테두리
    'spring': '#e67e22',          # 용수철 (주황색)
    
    # ===== 벡터/물리량 =====
    'force': '#4ade80',           # 힘 (녹색)
    'velocity': '#60a5fa',        # 속도 (파란색)
    'acceleration': '#f87171',    # 가속도 (빨간색)
    'torque': '#c084fc',          # 토크 (보라색)
    'momentum': '#fbbf24',        # 운동량 (노란색)
    
    # ===== 전자기 =====
    'positive': '#ef4444',        # 양전하 (빨간색)
    'negative': '#3b82f6',        # 음전하 (파란색)
    'electric_field': '#22c55e',  # 전기장 (녹색)
    'magnetic_field': '#a855f7',  # 자기장 (보라색)
    
    # ===== 그래프 구간 =====
    'phase_1': '#3498db22',       # 구간 1 (투명 파랑)
    'phase_2': '#27ae6022',       # 구간 2 (투명 초록)
    'phase_3': '#e74c3c22',       # 구간 3 (투명 빨강)
    'phase_4': '#f39c1222',       # 구간 4 (투명 주황)
    
    # ===== 강조/이벤트 =====
    'highlight': '#fbbf24',       # 강조 (노란색)
    'event_line': '#e74c3c',      # 이벤트 선 (빨간색)
    'current_point': '#e74c3c',   # 현재 시점 (빨간색)
    'grid': '#cccccc',            # 격자 (연한 회색)
}

def get_object_color(index):
    """물체 인덱스에 따른 색상 반환"""
    colors = [
        COLORS['object_A'],
        COLORS['object_B'],
        COLORS['object_C'],
        COLORS['object_D'],
        COLORS['object_E'],
    ]
    return colors[index % len(colors)]

def get_phase_color(index):
    """구간 인덱스에 따른 배경색 반환"""
    colors = [
        COLORS['phase_1'],
        COLORS['phase_2'],
        COLORS['phase_3'],
        COLORS['phase_4'],
    ]
    return colors[index % len(colors)]


# ============================================
# 크기 설정
# ============================================

# 기준 크기
BASE_OBJECT_SIZE = 0.25
MIN_OBJECT_SIZE = 0.15
MAX_OBJECT_SIZE = 0.50

PULLEY_RADIUS = 0.15
ROPE_WIDTH = 2.5
SLOPE_WIDTH = 6

def get_object_size(mass, m_ref=1, base_size=None):
    """
    질량에 비례한 물체 크기 계산
    
    Parameters:
        mass: 물체 질량
        m_ref: 기준 질량 (기본 1)
        base_size: 기준 크기 (None이면 BASE_OBJECT_SIZE 사용)
    
    Returns:
        size: 물체 한 변의 길이
    """
    if base_size is None:
        base_size = BASE_OBJECT_SIZE
    
    # 비선형 비례 (^0.3으로 크기 차이 완화)
    size = base_size * (mass / m_ref) ** 0.3
    
    # 최소/최대 제한
    return max(MIN_OBJECT_SIZE, min(MAX_OBJECT_SIZE, size))


# ============================================
# 레이아웃 설정
# ============================================

def create_figure_layout(include_graph=True):
    """
    표준 Figure 레이아웃 생성
    
    Returns:
        fig, ax_diagram, ax_graph (또는 ax_diagram만)
    """
    fig = plt.figure(figsize=(14, 10))
    
    if include_graph:
        # 다이어그램 + 그래프
        ax_diagram = fig.add_axes([0.08, 0.35, 0.84, 0.58])
        ax_graph = fig.add_axes([0.08, 0.08, 0.84, 0.22])
        return fig, ax_diagram, ax_graph
    else:
        # 다이어그램만
        ax_diagram = fig.add_axes([0.08, 0.08, 0.84, 0.85])
        return fig, ax_diagram


def setup_diagram_axes(ax, title='', xlim=None, ylim=None, font_prop=None):
    """다이어그램 축 설정"""
    ax.set_aspect('equal')
    ax.grid(True, alpha=0.3, color=COLORS['grid'])
    
    if title:
        ax.set_title(title, fontsize=14, fontweight='bold',
                    fontproperties=font_prop)
    
    if xlim:
        ax.set_xlim(xlim)
    if ylim:
        ax.set_ylim(ylim)


def setup_graph_axes(ax, xlabel='시간 (s)', ylabel='속력 (m/s)', 
                     title='', xlim=None, ylim=None, font_prop=None):
    """그래프 축 설정"""
    ax.set_xlabel(xlabel, fontsize=12, fontproperties=font_prop)
    ax.set_ylabel(ylabel, fontsize=12, fontproperties=font_prop)
    ax.grid(True, alpha=0.3)
    
    if title:
        ax.set_title(title, fontsize=12, fontweight='bold',
                    fontproperties=font_prop)
    
    if xlim:
        ax.set_xlim(xlim)
    if ylim:
        ax.set_ylim(ylim)


# ============================================
# 도형 유틸리티
# ============================================

def get_rotated_rect_vertices(cx, cy, w, h, angle):
    """
    회전된 사각형의 꼭짓점 좌표 계산
    
    Parameters:
        cx, cy: 중심 좌표
        w, h: 너비, 높이
        angle: 회전 각도 (라디안)
    
    Returns:
        vertices: (4, 2) 배열
    """
    corners = np.array([
        [-w/2, -h/2],
        [w/2, -h/2],
        [w/2, h/2],
        [-w/2, h/2]
    ])
    
    cos_a = np.cos(angle)
    sin_a = np.sin(angle)
    rotation = np.array([[cos_a, -sin_a], [sin_a, cos_a]])
    
    rotated = corners @ rotation.T
    return rotated + np.array([cx, cy])


def offset_normal(x, y, h, theta, direction='left_up'):
    """
    빗면의 법선 방향으로 offset
    
    Parameters:
        x, y: 빗면 위 점
        h: offset 거리
        theta: 빗면 각도
        direction: 
            'left_up' - 왼쪽 올라가는 빗면의 위쪽
            'right_down' - 오른쪽 내려가는 빗면의 위쪽
    
    Returns:
        (x_new, y_new)
    """
    if direction == 'left_up':
        # 왼쪽에서 오른쪽으로 올라가는 빗면
        nx = -np.sin(theta)
        ny = np.cos(theta)
    elif direction == 'right_down':
        # 왼쪽에서 오른쪽으로 내려가는 빗면
        nx = np.sin(theta)
        ny = np.cos(theta)
    else:
        raise ValueError(f"Unknown direction: {direction}")
    
    return x + nx * h, y + ny * h


def get_pulley_tangent(pulley_x, pulley_y, pulley_r, theta, side='left'):
    """
    도르래의 접선점 계산
    
    Parameters:
        pulley_x, pulley_y: 도르래 중심
        pulley_r: 도르래 반지름
        theta: 빗면 각도
        side: 'left' 또는 'right'
    
    Returns:
        (tangent_x, tangent_y)
    """
    if side == 'left':
        tangent_x = pulley_x - pulley_r * np.sin(theta)
        tangent_y = pulley_y + pulley_r * np.cos(theta)
    else:  # right
        tangent_x = pulley_x + pulley_r * np.sin(theta)
        tangent_y = pulley_y + pulley_r * np.cos(theta)
    
    return tangent_x, tangent_y


# ============================================
# 애니메이션 설정
# ============================================

# 기본 애니메이션 파라미터
DEFAULT_FPS = 50
DEFAULT_DPI = 120
DEFAULT_INTERVAL = 20  # ms

def get_animation_params(speed_factor=1.0, quality='normal'):
    """
    애니메이션 파라미터 반환
    
    Parameters:
        speed_factor: 속도 배율 (0.5 = 느리게, 2.0 = 빠르게)
        quality: 'draft', 'normal', 'high'
    
    Returns:
        dict with fps, dpi, interval
    """
    dpi_map = {
        'draft': 80,
        'normal': 120,
        'high': 150,
    }
    
    return {
        'fps': int(DEFAULT_FPS * speed_factor),
        'dpi': dpi_map.get(quality, DEFAULT_DPI),
        'interval': DEFAULT_INTERVAL / speed_factor,
    }


# ============================================
# 사용 예시
# ============================================

if __name__ == '__main__':
    # 폰트 설정
    font_prop = setup_korean_font()
    
    # Figure 생성
    fig, ax_diagram, ax_graph = create_figure_layout()
    
    # 축 설정
    setup_diagram_axes(ax_diagram, title='물리 시뮬레이션', font_prop=font_prop)
    setup_graph_axes(ax_graph, font_prop=font_prop)
    
    # 물체 크기
    size_m = get_object_size(1)
    size_3m = get_object_size(3)
    print(f"m 크기: {size_m:.3f}, 3m 크기: {size_3m:.3f}")
    
    # 회전된 사각형
    verts = get_rotated_rect_vertices(0, 0, 0.3, 0.3, np.radians(30))
    print(f"회전된 사각형 꼭짓점:\n{verts}")
    
    plt.show()
