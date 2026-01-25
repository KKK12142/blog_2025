/**
 * Graph - 실시간 물리량 그래프
 */
class Graph {
  /**
   * @param {p5} p - p5 인스턴스
   * @param {Object} options - 옵션
   * @param {number} options.x - x 위치
   * @param {number} options.y - y 위치
   * @param {number} options.w - 너비
   * @param {number} options.h - 높이
   * @param {string} options.type - 그래프 타입 ('v-t', 'x-t', 'y-t', 'E-t', 'vx-t', 'vy-t', 'phase', 'custom')
   * @param {string} options.label - 라벨
   * @param {number[]} options.color - RGB 색상
   * @param {number} options.maxPoints - 최대 데이터 포인트
   */
  constructor(p, options = {}) {
    this.p = p;
    this.x = options.x || 0;
    this.y = options.y || 0;
    this.w = options.w || 200;
    this.h = options.h || 150;
    this.type = options.type || 'v-t';
    this.label = options.label || this.type;
    this.color = options.color || [255, 100, 100];
    this.maxPoints = options.maxPoints || 500;
    
    this.data = [];
    this.data2 = [];  // phase space용
    this.timeData = [];
    
    // 축 범위 (자동/수동)
    this.autoScale = options.autoScale !== false;
    this.minY = options.minY || 0;
    this.maxY = options.maxY || 100;
    
    // 스타일
    this.bgColor = options.bgColor || [255, 255, 255];
    this.gridColor = options.gridColor || [230, 230, 230];
    this.axisColor = options.axisColor || [150, 150, 150];
    this.showGrid = options.showGrid !== false;
  }

  /**
   * 입자 데이터 자동 기록
   * @param {Particle} particle - 입자
   */
  record(particle) {
    let value, value2;
    
    switch (this.type) {
      case 'v-t':
        value = particle.vel.mag();
        break;
      case 'vx-t':
        value = particle.vel.x;
        break;
      case 'vy-t':
        value = particle.vel.y;
        break;
      case 's-t':
      case 'x-t':
        value = particle.pos.x;
        break;
      case 'y-t':
        value = particle.pos.y;
        break;
      case 'E-t':
      case 'KE-t':
        value = 0.5 * particle.mass * particle.vel.magSq();
        break;
      case 'phase':
        // 위상 공간 (x, vx) 또는 (y, vy)
        value = particle.pos.x;
        value2 = particle.vel.x;
        break;
      default:
        value = 0;
    }
    
    this.data.push(value);
    if (value2 !== undefined) this.data2.push(value2);
    this.timeData.push(particle.t);
    
    // 최대 포인트 제한
    if (this.data.length > this.maxPoints) {
      this.data.shift();
      if (this.data2.length > 0) this.data2.shift();
      this.timeData.shift();
    }
  }

  /**
   * 수동 데이터 추가
   * @param {number} value - 데이터 값
   * @param {number} value2 - 두 번째 값 (phase용)
   */
  addData(value, value2) {
    this.data.push(value);
    if (value2 !== undefined) this.data2.push(value2);
    
    if (this.data.length > this.maxPoints) {
      this.data.shift();
      if (this.data2.length > 0) this.data2.shift();
    }
  }

  /**
   * 그래프 그리기
   */
  display() {
    const p = this.p;
    
    // 배경
    p.fill(...this.bgColor);
    p.stroke(200);
    p.strokeWeight(1);
    p.rect(this.x, this.y, this.w, this.h);
    
    // 라벨
    p.fill(0);
    p.noStroke();
    p.textSize(12);
    p.textAlign(p.LEFT, p.BOTTOM);
    p.text(this.label, this.x + 5, this.y - 3);
    
    if (this.data.length < 2) return;
    
    if (this.type === 'phase') {
      this.displayPhase();
    } else {
      this.displayTimeSeries();
    }
  }

  /**
   * 시계열 그래프 그리기
   */
  displayTimeSeries() {
    const p = this.p;
    const margin = { left: 35, right: 10, top: 15, bottom: 25 };
    const plotX = this.x + margin.left;
    const plotY = this.y + margin.top;
    const plotW = this.w - margin.left - margin.right;
    const plotH = this.h - margin.top - margin.bottom;
    
    // 데이터 범위
    let minVal, maxVal;
    if (this.autoScale) {
      minVal = Math.min(...this.data);
      maxVal = Math.max(...this.data);
      if (maxVal - minVal < 0.1) {
        const mid = (minVal + maxVal) / 2;
        minVal = mid - 0.5;
        maxVal = mid + 0.5;
      }
    } else {
      minVal = this.minY;
      maxVal = this.maxY;
    }
    
    // 그리드
    if (this.showGrid) {
      p.stroke(...this.gridColor);
      p.strokeWeight(0.5);
      for (let i = 0; i <= 4; i++) {
        const gy = plotY + (plotH * i) / 4;
        p.line(plotX, gy, plotX + plotW, gy);
      }
    }
    
    // 축
    p.stroke(...this.axisColor);
    p.strokeWeight(1);
    p.line(plotX, plotY, plotX, plotY + plotH);  // Y축
    p.line(plotX, plotY + plotH, plotX + plotW, plotY + plotH);  // X축
    
    // Y축 라벨
    p.fill(100);
    p.noStroke();
    p.textSize(9);
    p.textAlign(p.RIGHT, p.CENTER);
    p.text(maxVal.toFixed(1), plotX - 3, plotY + 5);
    p.text(minVal.toFixed(1), plotX - 3, plotY + plotH - 5);
    
    // 데이터 플롯
    p.stroke(...this.color);
    p.strokeWeight(1.5);
    p.noFill();
    p.beginShape();
    for (let i = 0; i < this.data.length; i++) {
      const px = p.map(i, 0, this.data.length - 1, plotX + 5, plotX + plotW - 5);
      const py = p.map(this.data[i], minVal, maxVal, plotY + plotH - 5, plotY + 5);
      p.vertex(px, py);
    }
    p.endShape();
    p.strokeWeight(1);
    
    // 현재 값 표시
    if (this.data.length > 0) {
      const current = this.data[this.data.length - 1];
      p.fill(0);
      p.textAlign(p.RIGHT, p.TOP);
      p.textSize(10);
      p.text(`현재: ${current.toFixed(2)}`, this.x + this.w - 5, this.y + 5);
    }
  }

  /**
   * 위상 공간 그래프 그리기
   */
  displayPhase() {
    const p = this.p;
    const margin = { left: 35, right: 10, top: 15, bottom: 25 };
    const plotX = this.x + margin.left;
    const plotY = this.y + margin.top;
    const plotW = this.w - margin.left - margin.right;
    const plotH = this.h - margin.top - margin.bottom;
    
    if (this.data2.length < 2) return;
    
    // 범위
    const minX = Math.min(...this.data);
    const maxX = Math.max(...this.data);
    const minY = Math.min(...this.data2);
    const maxY = Math.max(...this.data2);
    
    // 축
    p.stroke(...this.axisColor);
    p.strokeWeight(1);
    const centerY = p.map(0, minY, maxY, plotY + plotH, plotY);
    const centerX = p.map(0, minX, maxX, plotX, plotX + plotW);
    
    if (centerY > plotY && centerY < plotY + plotH) {
      p.line(plotX, centerY, plotX + plotW, centerY);
    }
    if (centerX > plotX && centerX < plotX + plotW) {
      p.line(centerX, plotY, centerX, plotY + plotH);
    }
    
    // 궤적
    p.stroke(...this.color, 150);
    p.strokeWeight(1);
    p.noFill();
    p.beginShape();
    for (let i = 0; i < this.data.length; i++) {
      const px = p.map(this.data[i], minX, maxX, plotX + 5, plotX + plotW - 5);
      const py = p.map(this.data2[i], minY, maxY, plotY + plotH - 5, plotY + 5);
      p.vertex(px, py);
    }
    p.endShape();
    
    // 현재 위치
    if (this.data.length > 0) {
      const cx = p.map(this.data[this.data.length - 1], minX, maxX, plotX + 5, plotX + plotW - 5);
      const cy = p.map(this.data2[this.data2.length - 1], minY, maxY, plotY + plotH - 5, plotY + 5);
      p.fill(...this.color);
      p.noStroke();
      p.ellipse(cx, cy, 6, 6);
    }
    
    // 라벨
    p.fill(100);
    p.noStroke();
    p.textSize(9);
    p.textAlign(p.CENTER, p.TOP);
    p.text('x', plotX + plotW / 2, plotY + plotH + 3);
    p.textAlign(p.RIGHT, p.CENTER);
    p.text('v', plotX - 3, plotY + plotH / 2);
  }

  /**
   * 데이터 초기화
   */
  clear() {
    this.data = [];
    this.data2 = [];
    this.timeData = [];
  }

  /**
   * 축 범위 설정
   * @param {number} min - 최솟값
   * @param {number} max - 최댓값
   */
  setRange(min, max) {
    this.autoScale = false;
    this.minY = min;
    this.maxY = max;
  }

  /**
   * 자동 스케일링 활성화
   */
  enableAutoScale() {
    this.autoScale = true;
  }
}

/**
 * EnergyGraph - 에너지 바 + 그래프 통합
 */
class EnergyGraph {
  constructor(p, options = {}) {
    this.p = p;
    this.x = options.x || 0;
    this.y = options.y || 0;
    this.w = options.w || 200;
    this.h = options.h || 180;
    
    this.keHistory = [];
    this.peHistory = [];
    this.totalHistory = [];
    this.maxPoints = options.maxPoints || 300;
    
    this.keColor = options.keColor || [255, 100, 100];
    this.peColor = options.peColor || [100, 100, 255];
    this.totalColor = options.totalColor || [100, 200, 100];
  }

  record(KE, PE) {
    this.keHistory.push(KE);
    this.peHistory.push(PE);
    this.totalHistory.push(KE + PE);
    
    if (this.keHistory.length > this.maxPoints) {
      this.keHistory.shift();
      this.peHistory.shift();
      this.totalHistory.shift();
    }
  }

  display() {
    const p = this.p;
    
    // 배경
    p.fill(255);
    p.stroke(200);
    p.rect(this.x, this.y, this.w, this.h);
    
    // 라벨
    p.fill(0);
    p.noStroke();
    p.textSize(12);
    p.text('에너지', this.x + 5, this.y - 3);
    
    if (this.keHistory.length < 1) return;
    
    const current_KE = this.keHistory[this.keHistory.length - 1];
    const current_PE = this.peHistory[this.peHistory.length - 1];
    const current_total = this.totalHistory[this.totalHistory.length - 1];
    
    // 에너지 바
    const barY = this.y + 15;
    const barH = 25;
    const barW = this.w - 20;
    
    if (current_total > 0) {
      const keWidth = (current_KE / current_total) * barW;
      
      p.noStroke();
      p.fill(...this.keColor);
      p.rect(this.x + 10, barY, keWidth, barH);
      
      p.fill(...this.peColor);
      p.rect(this.x + 10 + keWidth, barY, barW - keWidth, barH);
      
      // 바 라벨
      p.fill(255);
      p.textSize(10);
      p.textAlign(p.CENTER, p.CENTER);
      if (keWidth > 30) p.text('KE', this.x + 10 + keWidth / 2, barY + barH / 2);
      if (barW - keWidth > 30) p.text('PE', this.x + 10 + keWidth + (barW - keWidth) / 2, barY + barH / 2);
    }
    
    // 값 표시
    p.fill(0);
    p.textSize(9);
    p.textAlign(p.LEFT, p.TOP);
    p.text(`KE: ${current_KE.toFixed(1)}`, this.x + 10, barY + barH + 5);
    p.text(`PE: ${current_PE.toFixed(1)}`, this.x + 70, barY + barH + 5);
    p.text(`E: ${current_total.toFixed(1)}`, this.x + 130, barY + barH + 5);
    
    // 그래프
    const graphY = barY + barH + 25;
    const graphH = this.h - (graphY - this.y) - 10;
    
    if (this.totalHistory.length < 2) return;
    
    const maxE = Math.max(...this.totalHistory) * 1.1;
    
    // 그리드
    p.stroke(230);
    p.line(this.x + 10, graphY + graphH / 2, this.x + this.w - 10, graphY + graphH / 2);
    
    // KE 선
    p.stroke(...this.keColor);
    p.noFill();
    p.beginShape();
    for (let i = 0; i < this.keHistory.length; i++) {
      const px = p.map(i, 0, this.keHistory.length - 1, this.x + 10, this.x + this.w - 10);
      const py = p.map(this.keHistory[i], 0, maxE, graphY + graphH, graphY);
      p.vertex(px, py);
    }
    p.endShape();
    
    // PE 선
    p.stroke(...this.peColor);
    p.beginShape();
    for (let i = 0; i < this.peHistory.length; i++) {
      const px = p.map(i, 0, this.peHistory.length - 1, this.x + 10, this.x + this.w - 10);
      const py = p.map(this.peHistory[i], 0, maxE, graphY + graphH, graphY);
      p.vertex(px, py);
    }
    p.endShape();
    
    // Total 선
    p.stroke(...this.totalColor);
    p.beginShape();
    for (let i = 0; i < this.totalHistory.length; i++) {
      const px = p.map(i, 0, this.totalHistory.length - 1, this.x + 10, this.x + this.w - 10);
      const py = p.map(this.totalHistory[i], 0, maxE, graphY + graphH, graphY);
      p.vertex(px, py);
    }
    p.endShape();
    
    // 범례
    p.textSize(8);
    p.fill(...this.keColor);
    p.text('● KE', this.x + 10, graphY - 3);
    p.fill(...this.peColor);
    p.text('● PE', this.x + 50, graphY - 3);
    p.fill(...this.totalColor);
    p.text('● E', this.x + 90, graphY - 3);
  }

  clear() {
    this.keHistory = [];
    this.peHistory = [];
    this.totalHistory = [];
  }
}

// Export
if (typeof window !== 'undefined') {
  window.Graph = Graph;
  window.EnergyGraph = EnergyGraph;
}
