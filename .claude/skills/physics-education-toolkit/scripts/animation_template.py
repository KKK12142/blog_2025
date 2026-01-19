"""
Physics Education Toolkit - 애니메이션 템플릿

사용법:
    from animation_template import PhysicsAnimation, Segment, Point
    
    ani = PhysicsAnimation()
    ani.add_slope(...)
    ani.add_object(...)
    ani.add_segment(...)
    ani.run()
"""

import numpy as np
import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.patches import Polygon, Circle, Rectangle
import matplotlib.animation as animation
from dataclasses import dataclass, field
from typing import List, Tuple, Optional, Dict, Callable
import matplotlib.font_manager as fm

# 스타일 설정 임포트 시도
try:
    from style_config import (
        setup_korean_font, get_font_prop, COLORS,
        get_object_size, get_rotated_rect_vertices,
        offset_normal, get_pulley_tangent,
        create_figure_layout, setup_diagram_axes, setup_graph_axes
    )
except ImportError:
    # 독립 실행 시 기본값 사용
    COLORS = {
        'slope_left': '#3498db',
        'slope_right': '#27ae60',
        'floor': '#7f8c8d',
        'object_A': '#e74c3c',
        'object_B': '#9b59b6',
        'object_C': '#f39c12',
        'rope': '#2c3e50',
        'pulley_fill': '#ecf0f1',
        'pulley_edge': '#2c3e50',
        'event_line': '#e74c3c',
        'current_point': '#e74c3c',
    }


# ============================================
# 데이터 클래스
# ============================================

@dataclass
class Point:
    """점 정의"""
    name: str
    x: float
    y: float
    label_offset: Tuple[float, float] = (-15, -15)
    show_label: bool = True


@dataclass
class Segment:
    """운동 구간 정의"""
    name: str
    motion_type: str  # 'acc', 'const_v', 'dec', 'shm', 'circular'
    a: float = 0  # 가속도
    v0: float = 0  # 초기 속력
    v_end: float = None  # 최종 속력
    length: float = None  # 구간 길이
    duration: float = None  # 구간 시간
    end_condition: str = None  # 'position', 'velocity', 'time'
    label: str = ''
    color: str = None
    
    # 계산되는 값
    t_start: float = field(default=0, init=False)
    t_end: float = field(default=0, init=False)
    s_start: float = field(default=0, init=False)
    s_end: float = field(default=0, init=False)


@dataclass
class PhysicsObject:
    """물체 정의"""
    name: str
    mass: float
    color: str
    size: float = None
    initial_pos: Tuple[float, float] = (0, 0)
    path_type: str = 'slope'  # 'slope', 'floor', 'vertical', 'free'
    path_angle: float = 0
    segments: List[Segment] = field(default_factory=list)
    
    # 시각화 요소 (런타임에 생성)
    patch: object = field(default=None, init=False)
    label: object = field(default=None, init=False)


@dataclass
class Pulley:
    """도르래 정의"""
    x: float
    y: float
    radius: float = 0.15
    
    # 시각화 요소
    patch: object = field(default=None, init=False)


@dataclass
class Rope:
    """실 정의"""
    obj1_name: str
    obj2_name: str  # 또는 'pulley'
    attachment1: str = 'center'  # 'center', 'top', 'bottom', 'left', 'right'
    attachment2: str = 'center'
    cut_time: float = None  # 실이 끊어지는 시간
    
    # 시각화 요소
    line: object = field(default=None, init=False)


# ============================================
# 메인 클래스
# ============================================

class PhysicsAnimation:
    """물리 시뮬레이션 애니메이션 클래스"""
    
    def __init__(self, figsize=(14, 10), include_graph=True, title='물리 시뮬레이션'):
        """
        Parameters:
            figsize: Figure 크기
            include_graph: v-t 그래프 포함 여부
            title: 제목
        """
        self.figsize = figsize
        self.include_graph = include_graph
        self.title = title
        
        # 데이터 저장
        self.points: List[Point] = []
        self.objects: Dict[str, PhysicsObject] = {}
        self.segments: List[Segment] = []
        self.pulleys: List[Pulley] = []
        self.ropes: List[Rope] = []
        self.slopes: List[dict] = []
        
        # 시간 관련
        self.dt = 0.02
        self.t_total = 0
        self.pause_events: List[dict] = []
        
        # 폰트 설정
        self._setup_font()
        
        # Figure (나중에 생성)
        self.fig = None
        self.ax_diagram = None
        self.ax_graph = None
        
        # 그래프 데이터
        self.times = []
        self.velocities = {}  # {obj_name: [v1, v2, ...]}
        
    def _setup_font(self):
        """한글 폰트 설정"""
        try:
            font_path = '/usr/share/fonts/truetype/nanum/NanumGothic.ttf'
            self.font_prop = fm.FontProperties(fname=font_path)
            plt.rcParams['font.family'] = 'NanumGothic'
            plt.rcParams['axes.unicode_minus'] = False
        except:
            self.font_prop = None
    
    # ============================================
    # 요소 추가 메서드
    # ============================================
    
    def add_slope(self, start: Tuple[float, float], end: Tuple[float, float], 
                  color: str = None, width: float = 6, label: str = None):
        """빗면 추가"""
        if color is None:
            color = COLORS['slope_left'] if len(self.slopes) == 0 else COLORS['slope_right']
        
        self.slopes.append({
            'start': start,
            'end': end,
            'color': color,
            'width': width,
            'label': label,
        })
        
        return self
    
    def add_floor(self, y: float, x_range: Tuple[float, float], 
                  color: str = None, width: float = 6):
        """수평면 추가"""
        if color is None:
            color = COLORS['floor']
        
        self.slopes.append({
            'start': (x_range[0], y),
            'end': (x_range[1], y),
            'color': color,
            'width': width,
            'label': None,
            'is_floor': True,
        })
        
        return self
    
    def add_point(self, name: str, x: float, y: float, 
                  label_offset: Tuple[float, float] = (-15, -15)):
        """점 추가"""
        self.points.append(Point(name, x, y, label_offset))
        return self
    
    def add_object(self, name: str, mass: float, color: str = None,
                   initial_pos: Tuple[float, float] = (0, 0),
                   path_type: str = 'slope', path_angle: float = 0):
        """물체 추가"""
        if color is None:
            color = list(COLORS.values())[3 + len(self.objects)]  # object_A, B, C...
        
        # 크기 계산
        size = 0.25 * (mass) ** 0.3
        size = max(0.15, min(0.5, size))
        
        obj = PhysicsObject(
            name=name,
            mass=mass,
            color=color,
            size=size,
            initial_pos=initial_pos,
            path_type=path_type,
            path_angle=path_angle,
        )
        
        self.objects[name] = obj
        self.velocities[name] = []
        
        return self
    
    def add_pulley(self, x: float, y: float, radius: float = 0.15):
        """도르래 추가"""
        self.pulleys.append(Pulley(x, y, radius))
        return self
    
    def add_rope(self, obj1: str, obj2: str, 
                 attachment1: str = 'center', attachment2: str = 'center',
                 cut_time: float = None):
        """실 추가"""
        self.ropes.append(Rope(obj1, obj2, attachment1, attachment2, cut_time))
        return self
    
    def add_segment(self, obj_name: str, segment: Segment):
        """운동 구간 추가"""
        if obj_name not in self.objects:
            raise ValueError(f"Object '{obj_name}' not found")
        
        self.objects[obj_name].segments.append(segment)
        return self
    
    def add_pause(self, time: float, duration: float = 0.5, label: str = ''):
        """일시정지 이벤트 추가"""
        self.pause_events.append({
            'time': time,
            'duration': duration,
            'label': label,
        })
        return self
    
    # ============================================
    # 계산 메서드
    # ============================================
    
    def calculate_kinematics(self):
        """모든 물체의 운동학 계산"""
        for obj in self.objects.values():
            self._calculate_object_kinematics(obj)
        
        # 전체 시간 계산
        max_t = 0
        for obj in self.objects.values():
            if obj.segments:
                max_t = max(max_t, obj.segments[-1].t_end)
        
        self.t_total = max_t
    
    def _calculate_object_kinematics(self, obj: PhysicsObject):
        """개별 물체의 운동학 계산"""
        for i, seg in enumerate(obj.segments):
            if i == 0:
                seg.t_start = 0
                seg.s_start = 0
                if seg.v0 is None:
                    seg.v0 = 0
            else:
                prev = obj.segments[i-1]
                seg.t_start = prev.t_end
                seg.s_start = prev.s_end
                seg.v0 = prev.v_end if prev.v_end is not None else prev.v0
            
            # 구간 끝 계산
            if seg.motion_type == 'acc' or seg.motion_type == 'dec':
                a = seg.a if seg.motion_type == 'acc' else -abs(seg.a)
                
                if seg.length is not None:
                    seg.s_end = seg.s_start + seg.length
                    v_sq = seg.v0**2 + 2*a*seg.length
                    seg.v_end = np.sqrt(max(0, v_sq)) if v_sq >= 0 else 0
                    if seg.v_end != seg.v0:
                        seg.t_end = seg.t_start + (seg.v_end - seg.v0) / a
                    else:
                        seg.t_end = seg.t_start
                        
                elif seg.v_end is not None:
                    if a != 0:
                        seg.t_end = seg.t_start + (seg.v_end - seg.v0) / a
                        seg.s_end = seg.s_start + seg.v0*(seg.t_end-seg.t_start) + 0.5*a*(seg.t_end-seg.t_start)**2
                    else:
                        seg.t_end = seg.t_start
                        seg.s_end = seg.s_start
                        
                elif seg.end_condition == 'v=0':
                    seg.v_end = 0
                    seg.t_end = seg.t_start + seg.v0 / abs(a)
                    seg.s_end = seg.s_start + seg.v0**2 / (2*abs(a))
                    
            elif seg.motion_type == 'const_v':
                seg.v_end = seg.v0
                
                if seg.length is not None:
                    seg.s_end = seg.s_start + seg.length
                    seg.t_end = seg.t_start + seg.length / seg.v0 if seg.v0 != 0 else seg.t_start
                    
                elif seg.duration is not None:
                    seg.t_end = seg.t_start + seg.duration
                    seg.s_end = seg.s_start + seg.v0 * seg.duration
    
    def get_object_state(self, obj_name: str, t: float) -> Tuple[float, float, float, str]:
        """
        시간 t에서 물체의 상태 반환
        
        Returns:
            (x, y, v, segment_label)
        """
        obj = self.objects[obj_name]
        
        # 현재 구간 찾기
        current_seg = None
        for seg in obj.segments:
            if seg.t_start <= t <= seg.t_end:
                current_seg = seg
                break
        
        if current_seg is None:
            if obj.segments:
                current_seg = obj.segments[-1]
                t = current_seg.t_end
            else:
                return obj.initial_pos[0], obj.initial_pos[1], 0, ''
        
        # 이동 거리 계산
        dt = t - current_seg.t_start
        
        if current_seg.motion_type in ['acc', 'dec']:
            a = current_seg.a if current_seg.motion_type == 'acc' else -abs(current_seg.a)
            s = current_seg.s_start + current_seg.v0 * dt + 0.5 * a * dt**2
            v = current_seg.v0 + a * dt
        else:  # const_v
            s = current_seg.s_start + current_seg.v0 * dt
            v = current_seg.v0
        
        # 좌표 변환
        x0, y0 = obj.initial_pos
        theta = obj.path_angle
        
        if obj.path_type == 'slope':
            # 빗면 따라 이동
            x = x0 + s * np.cos(theta)
            y = y0 - s * np.sin(theta)  # 내려가는 경우
        elif obj.path_type == 'floor':
            x = x0 + s
            y = y0
        elif obj.path_type == 'vertical':
            x = x0
            y = y0 - s
        else:
            x, y = x0, y0
        
        return x, y, abs(v), current_seg.label
    
    # ============================================
    # 시각화 메서드
    # ============================================
    
    def _create_figure(self):
        """Figure 생성"""
        self.fig = plt.figure(figsize=self.figsize)
        
        if self.include_graph:
            self.ax_diagram = self.fig.add_axes([0.08, 0.35, 0.84, 0.58])
            self.ax_graph = self.fig.add_axes([0.08, 0.08, 0.84, 0.22])
        else:
            self.ax_diagram = self.fig.add_axes([0.08, 0.08, 0.84, 0.85])
            self.ax_graph = None
    
    def _draw_static_elements(self):
        """정적 요소 그리기"""
        ax = self.ax_diagram
        
        # 빗면/바닥
        for slope in self.slopes:
            ax.plot([slope['start'][0], slope['end'][0]],
                   [slope['start'][1], slope['end'][1]],
                   color=slope['color'], linewidth=slope['width'],
                   solid_capstyle='round', zorder=1)
        
        # 점
        for point in self.points:
            ax.plot(point.x, point.y, 'ko', markersize=8, zorder=5)
            if point.show_label:
                ax.annotate(point.name, (point.x, point.y),
                           xytext=point.label_offset, textcoords='offset points',
                           fontsize=12, fontweight='bold',
                           fontproperties=self.font_prop)
        
        # 도르래
        for pulley in self.pulleys:
            circle = Circle((pulley.x, pulley.y), pulley.radius,
                           facecolor=COLORS['pulley_fill'],
                           edgecolor=COLORS['pulley_edge'],
                           linewidth=3, zorder=6)
            ax.add_patch(circle)
            ax.plot(pulley.x, pulley.y, 'ko', markersize=4, zorder=7)
            pulley.patch = circle
        
        # 제목
        ax.set_title(self.title, fontsize=14, fontweight='bold',
                    fontproperties=self.font_prop)
        ax.set_aspect('equal')
        ax.grid(True, alpha=0.3)
    
    def _create_dynamic_elements(self):
        """동적 요소 생성"""
        ax = self.ax_diagram
        
        # 물체
        for obj in self.objects.values():
            x, y = obj.initial_pos
            size = obj.size
            theta = obj.path_angle
            
            # 법선 방향 offset
            x_center = x - (size/2) * np.sin(theta)
            y_center = y + (size/2) * np.cos(theta)
            
            # 회전된 사각형
            corners = np.array([
                [-size/2, -size/2],
                [size/2, -size/2],
                [size/2, size/2],
                [-size/2, size/2]
            ])
            cos_a, sin_a = np.cos(theta), np.sin(theta)
            rotation = np.array([[cos_a, -sin_a], [sin_a, cos_a]])
            rotated = corners @ rotation.T + np.array([x_center, y_center])
            
            poly = Polygon(rotated, facecolor=obj.color,
                          edgecolor='white', linewidth=2, zorder=10)
            ax.add_patch(poly)
            obj.patch = poly
            
            # 라벨
            label = ax.text(x_center, y_center, obj.name,
                           ha='center', va='center',
                           fontsize=11, fontweight='bold', color='white',
                           fontproperties=self.font_prop, zorder=11)
            obj.label = label
        
        # 실
        for rope in self.ropes:
            line, = ax.plot([], [], color=COLORS['rope'],
                           linewidth=2.5, solid_capstyle='round', zorder=4)
            rope.line = line
    
    def _setup_graph(self):
        """그래프 설정"""
        if self.ax_graph is None:
            return
        
        ax = self.ax_graph
        
        ax.set_xlim(0, self.t_total * 1.1)
        ax.set_xlabel('시간 (s)', fontsize=12, fontproperties=self.font_prop)
        ax.set_ylabel('속력 (m/s)', fontsize=12, fontproperties=self.font_prop)
        ax.set_title('속력-시간 그래프', fontsize=12, fontweight='bold',
                    fontproperties=self.font_prop)
        ax.grid(True, alpha=0.3)
        
        # 각 물체의 v-t 라인
        self.vt_lines = {}
        for obj_name, obj in self.objects.items():
            line, = ax.plot([], [], color=obj.color, linewidth=2,
                           label=f'{obj_name} ({obj.mass}m)')
            self.vt_lines[obj_name] = line
        
        # 현재 시점 표시
        self.current_points = {}
        for obj_name, obj in self.objects.items():
            point, = ax.plot([], [], 'o', color=obj.color, markersize=8)
            self.current_points[obj_name] = point
        
        ax.legend(loc='upper left', fontsize=9, prop=self.font_prop)
    
    def _update_frame(self, frame):
        """프레임 업데이트"""
        t = frame * self.dt
        if t > self.t_total:
            t = self.t_total
        
        updated = []
        
        # 물체 위치 업데이트
        for obj_name, obj in self.objects.items():
            x, y, v, seg_label = self.get_object_state(obj_name, t)
            size = obj.size
            theta = obj.path_angle
            
            # 법선 방향 offset
            x_center = x - (size/2) * np.sin(theta)
            y_center = y + (size/2) * np.cos(theta)
            
            # 회전된 사각형 업데이트
            corners = np.array([
                [-size/2, -size/2],
                [size/2, -size/2],
                [size/2, size/2],
                [-size/2, size/2]
            ])
            cos_a, sin_a = np.cos(theta), np.sin(theta)
            rotation = np.array([[cos_a, -sin_a], [sin_a, cos_a]])
            rotated = corners @ rotation.T + np.array([x_center, y_center])
            
            obj.patch.set_xy(rotated)
            obj.label.set_position((x_center, y_center))
            
            updated.extend([obj.patch, obj.label])
            
            # 그래프 데이터
            if t not in [self.times[-1] if self.times else -1]:
                self.velocities[obj_name].append(v)
        
        # 시간 기록
        if not self.times or t > self.times[-1]:
            self.times.append(t)
        
        # 그래프 업데이트
        if self.ax_graph:
            for obj_name in self.objects:
                self.vt_lines[obj_name].set_data(self.times, self.velocities[obj_name])
                if self.velocities[obj_name]:
                    self.current_points[obj_name].set_data([t], [self.velocities[obj_name][-1]])
                updated.extend([self.vt_lines[obj_name], self.current_points[obj_name]])
        
        return updated
    
    def _init_animation(self):
        """애니메이션 초기화"""
        self.times.clear()
        for obj_name in self.objects:
            self.velocities[obj_name].clear()
        
        return []
    
    # ============================================
    # 실행 메서드
    # ============================================
    
    def run(self, save_path: str = None, fps: int = 50, dpi: int = 120):
        """
        애니메이션 실행
        
        Parameters:
            save_path: 저장 경로 (None이면 저장 안 함)
            fps: 프레임 레이트
            dpi: 해상도
        """
        # 운동학 계산
        self.calculate_kinematics()
        
        # Figure 생성
        self._create_figure()
        
        # 요소 그리기
        self._draw_static_elements()
        self._create_dynamic_elements()
        self._setup_graph()
        
        # 애니메이션 생성
        n_frames = int(self.t_total / self.dt) + 10
        
        ani = animation.FuncAnimation(
            self.fig, self._update_frame, init_func=self._init_animation,
            frames=n_frames, interval=self.dt*1000, blit=True
        )
        
        # 저장
        if save_path:
            print(f"저장 중: {save_path}")
            if save_path.endswith('.gif'):
                ani.save(save_path, writer='pillow', fps=fps, dpi=dpi)
            elif save_path.endswith('.mp4'):
                ani.save(save_path, writer='ffmpeg', fps=fps, dpi=dpi)
            print(f"완료: {save_path}")
        
        plt.show()
        
        return ani


# ============================================
# 사용 예시
# ============================================

def example_inclined_plane():
    """빗면 운동 예시"""
    ani = PhysicsAnimation(title='빗면 운동 시뮬레이션')
    
    # 빗면 추가
    theta = np.radians(30)
    ani.add_slope((0, 2), (3, 0.5), color=COLORS['slope_left'])
    ani.add_floor(0, (-0.5, 4))
    
    # 점 추가
    ani.add_point('A', 0, 2)
    ani.add_point('B', 3, 0.5)
    
    # 물체 추가
    ani.add_object('M', mass=2, color=COLORS['object_A'],
                   initial_pos=(0.3, 1.85), path_type='slope', path_angle=theta)
    
    # 운동 구간 추가
    ani.add_segment('M', Segment(
        name='가속',
        motion_type='acc',
        a=5,  # g*sin(30°)
        v0=0,
        length=2.5,
        label='가속'
    ))
    
    # 실행
    ani.run(save_path='/home/claude/test_animation.gif')


if __name__ == '__main__':
    example_inclined_plane()
