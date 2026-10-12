// Freehand Drawing, Catmull-Rom Smoothing & Smart Shape Recognition
import { store } from '../state/store.js';

export class FreehandManager {
  constructor(svgLayer, viewport, onSelectInk, onLinkInk) {
    this.svgLayer = svgLayer;
    this.viewport = viewport;
    this.onSelectInk = onSelectInk;
    this.onLinkInk = onLinkInk;

    this.isDrawing = false;
    this.currentPoints = [];
    this.currentPathEl = null;
    this.shapeStart = null;
    this.pendingShape = null;

    this.draggingInk = null;
    this.dragOffset = { x: 0, y: 0 };
    this.dragMoved = false;
    this.onInkMove = null;

    this.setupListeners();
  }

  setupListeners() {
    this.svgLayer.addEventListener('pointerdown', (e) => this.handlePointerDown(e));
    window.addEventListener('pointermove', (e) => this.handlePointerMove(e));
    window.addEventListener('pointerup', (e) => this.handlePointerUp(e));
  }

  setPendingShape(shapeType) {
    this.pendingShape = shapeType;
  }

  handlePointerDown(e) {
    const mode = store.state.activeTool;
    if (!['free', 'smart', 'shape'].includes(mode)) return;

    e.preventDefault();
    this.isDrawing = true;
    const pt = this.viewport.screenToCanvas(e.clientX, e.clientY);
    this.currentPoints = [pt];
    this.shapeStart = { ...pt };

    this.currentPathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    this.currentPathEl.setAttribute('class', 'ink-active-preview');
    this.currentPathEl.setAttribute('fill', 'none');
    this.currentPathEl.setAttribute('stroke', '#475467');
    this.currentPathEl.setAttribute('stroke-width', '3.5');
    this.currentPathEl.setAttribute('stroke-linecap', 'round');
    this.currentPathEl.setAttribute('stroke-linejoin', 'round');
    this.svgLayer.appendChild(this.currentPathEl);
  }

  handlePointerMove(e) {
    if (this.draggingInk) {
      this.dragMoved = true;
      const pt = this.viewport.screenToCanvas(e.clientX, e.clientY);
      this.draggingInk.tx = Math.round(pt.x - this.dragOffset.x);
      this.draggingInk.ty = Math.round(pt.y - this.dragOffset.y);
      this.render();
      if (this.onInkMove) this.onInkMove(this.draggingInk);
      return;
    }

    if (!this.isDrawing || !this.currentPathEl) return;
    const pt = this.viewport.screenToCanvas(e.clientX, e.clientY);
    this.currentPoints.push(pt);

    const mode = store.state.activeTool;
    if (mode === 'shape' && this.pendingShape && this.shapeStart) {
      const d = this.getShapePreviewPath(this.pendingShape, this.shapeStart, pt);
      this.currentPathEl.setAttribute('d', d);
    } else {
      this.currentPathEl.setAttribute('d', this.pointsToSplinePath(this.currentPoints));
    }
  }

  handlePointerUp() {
    if (this.draggingInk) {
      if (this.dragMoved) {
        store.saveSnapshot();
        store.notify('inkMoved');
      }
      this.draggingInk = null;
      return;
    }

    if (!this.isDrawing) return;
    this.isDrawing = false;

    if (this.currentPathEl) {
      this.currentPathEl.remove();
      this.currentPathEl = null;
    }

    const pts = this.currentPoints.slice();
    this.currentPoints = [];

    const mode = store.state.activeTool;

    // If user clicked without dragging in shape mode, spawn a default-sized shape at click location
    if (pts.length < 2 && mode === 'shape' && this.pendingShape && this.shapeStart) {
      const defW = this.pendingShape === 'textbox' ? 160 : (this.pendingShape === 'square' ? 100 : 120);
      const defH = this.pendingShape === 'textbox' ? 56 : (this.pendingShape === 'square' ? 100 : 80);
      pts.push({ x: this.shapeStart.x + defW, y: this.shapeStart.y + defH });
    } else if (pts.length < 2) {
      return;
    }

    store.saveSnapshot();

    if (mode === 'free') {
      store.state.canvas.inkObjects.push({
        id: 'ink_' + Date.now(),
        kind: 'free',
        pts,
        tx: 0,
        ty: 0,
        sx: 1,
        sy: 1,
        stroke: '#334155',
        strokeWidth: 3.5
      });
    } else if (mode === 'smart') {
      const recognized = this.recognizeStroke(pts);
      recognized.id = 'ink_' + Date.now();
      store.state.canvas.inkObjects.push(recognized);
    } else if (mode === 'shape' && this.pendingShape && this.shapeStart) {
      const shapeObj = this.createShapeObject(this.pendingShape, this.shapeStart, pts[pts.length - 1]);
      if (shapeObj) {
        shapeObj.id = 'ink_' + Date.now();
        store.state.canvas.inkObjects.push(shapeObj);
        store.state.selected = { type: 'ink', id: shapeObj.id };
        if (shapeObj.kind === 'textbox') {
          setTimeout(() => this.onEditInkText(shapeObj), 60);
        }
      }
    }

    this.pendingShape = null;
    this.shapeStart = null;
    store.state.activeTool = 'pointer';
    store.notify('inkAdded');
    this.render();
  }

  // Catmull-Rom spline interpolation for smooth hand-drawn curves
  pointsToSplinePath(pts) {
    if (pts.length < 2) return '';
    if (pts.length === 2) return `M ${pts[0].x} ${pts[0].y} L ${pts[1].x} ${pts[1].y}`;

    let path = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = i > 0 ? pts[i - 1] : pts[i];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = i < pts.length - 2 ? pts[i + 2] : p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      path += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }
    return path;
  }

  // Geometric Recognition
  recognizeStroke(pts) {
    const b = this.getBounds(pts);
    const w = b.maxX - b.minX;
    const h = b.maxY - b.minY;
    const start = pts[0];
    const end = pts[pts.length - 1];
    const diag = Math.hypot(w, h) || 1;
    const directDist = Math.hypot(end.x - start.x, end.y - start.y);

    // 1. Closed or near-closed loop check (circle, rect, triangle)
    if (directDist < Math.max(45, diag * 0.45) && pts.length > 8 && w > 20 && h > 20) {
      const closed = pts.concat([pts[0]]);
      const simplified = this.simplify(closed, Math.max(6, diag * 0.06));
      if (simplified.length > 1 && Math.hypot(simplified[0].x - simplified[simplified.length - 1].x, simplified[0].y - simplified[simplified.length - 1].y) < 15) {
        simplified.pop();
      }

      // Check for Triangle (3 prominent corners)
      if (simplified.length === 3) {
        return {
          kind: 'polygon',
          points: simplified,
          tx: 0, ty: 0, sx: 1, sy: 1,
          stroke: '#334155', strokeWidth: 3
        };
      }

      // Check for Circle / Ellipse variance
      const cx = (b.minX + b.maxX) / 2;
      const cy = (b.minY + b.maxY) / 2;
      const rx = w / 2;
      const ry = h / 2;
      const variances = pts.map(p => Math.hypot((p.x - cx) / (rx || 1), (p.y - cy) / (ry || 1)));
      const mean = variances.reduce((a, v) => a + v, 0) / variances.length;
      const variance = variances.reduce((a, v) => a + (v - mean) ** 2, 0) / variances.length;

      if (variance < 0.14) {
        return {
          kind: 'ellipse',
          cx, cy, rx: Math.max(15, rx), ry: Math.max(15, ry),
          tx: 0, ty: 0, sx: 1, sy: 1,
          stroke: '#334155', strokeWidth: 3
        };
      }

      // Check for Rectangle / Square
      return {
        kind: 'rect',
        x: b.minX, y: b.minY, w: Math.max(25, w), h: Math.max(25, h),
        tx: 0, ty: 0, sx: 1, sy: 1,
        stroke: '#334155', strokeWidth: 3
      };
    }

    // 2. Straight line check
    let maxDev = 0;
    if (directDist > 25) {
      for (const p of pts) {
        const num = Math.abs((end.y - start.y) * p.x - (end.x - start.x) * p.y + end.x * start.y - end.y * start.x);
        maxDev = Math.max(maxDev, num / directDist);
      }
      if (maxDev < Math.max(14, directDist * 0.12)) {
        return {
          kind: 'line',
          x1: start.x, y1: start.y, x2: end.x, y2: end.y,
          tx: 0, ty: 0, sx: 1, sy: 1,
          stroke: '#334155', strokeWidth: 3
        };
      }
    }

    // 3. Arrow gesture check
    if (pts.length > 10 && directDist > 40) {
      return {
        kind: 'arrow',
        x1: start.x, y1: start.y, x2: end.x, y2: end.y,
        tx: 0, ty: 0, sx: 1, sy: 1,
        stroke: '#334155', strokeWidth: 3
      };
    }

    // Default to smoothed freehand
    return {
      kind: 'free',
      pts,
      tx: 0, ty: 0, sx: 1, sy: 1,
      stroke: '#334155', strokeWidth: 3.5
    };
  }

  simplify(pts, epsilon) {
    if (pts.length < 3) return pts.slice();
    const dline = (p, a, b) => {
      const dx = b.x - a.x, dy = b.y - a.y;
      if (!dx && !dy) return Math.hypot(p.x - a.x, p.y - a.y);
      return Math.abs(dy * p.x - dx * p.y + b.x * a.y - b.y * a.x) / Math.hypot(dx, dy);
    };
    let maxD = 0, idx = 0;
    for (let i = 1; i < pts.length - 1; i++) {
      const d = dline(pts[i], pts[0], pts[pts.length - 1]);
      if (d > maxD) { maxD = d; idx = i; }
    }
    if (maxD > epsilon) {
      const left = this.simplify(pts.slice(0, idx + 1), epsilon);
      const right = this.simplify(pts.slice(idx), epsilon);
      return left.slice(0, -1).concat(right);
    }
    return [pts[0], pts[pts.length - 1]];
  }

  getBounds(pts) {
    const xs = pts.map(p => p.x);
    const ys = pts.map(p => p.y);
    return {
      minX: Math.min(...xs), maxX: Math.max(...xs),
      minY: Math.min(...ys), maxY: Math.max(...ys)
    };
  }

  createShapeObject(kind, a, b) {
    let x1 = a.x, y1 = a.y, x2 = b.x, y2 = b.y;
    if (kind === 'square') {
      const side = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1));
      x2 = x1 + (x2 >= x1 ? side : -side);
      y2 = y1 + (y2 >= y1 ? side : -side);
    }
    const left = Math.min(x1, x2), top = Math.min(y1, y2);
    const w = Math.max(12, Math.abs(x2 - x1)), h = Math.max(12, Math.abs(y2 - y1));

    if (kind === 'rect' || kind === 'square') {
      return { kind: 'rect', x: left, y: top, w, h, tx: 0, ty: 0, sx: 1, sy: 1, stroke: '#334155', strokeWidth: 3 };
    }
    if (kind === 'textbox') {
      const tbW = Math.max(150, w);
      const tbH = Math.max(54, h);
      return {
        kind: 'textbox',
        x: left,
        y: top,
        w: tbW,
        h: tbH,
        text: 'Text Note',
        tx: 0,
        ty: 0,
        sx: 1,
        sy: 1,
        rotation: 0,
        fill: '#ffffff',
        stroke: '#0284c7',
        strokeWidth: 2,
        strokeDasharray: '4,3'
      };
    }
    if (kind === 'ellipse') {
      return { kind: 'ellipse', cx: (x1 + x2) / 2, cy: (y1 + y2) / 2, rx: w / 2, ry: h / 2, tx: 0, ty: 0, sx: 1, sy: 1, stroke: '#334155', strokeWidth: 3 };
    }
    if (kind === 'triangle') {
      return { kind: 'polygon', points: [{ x: (x1 + x2) / 2, y: top }, { x: left, y: top + h }, { x: left + w, y: top + h }], tx: 0, ty: 0, sx: 1, sy: 1, stroke: '#334155', strokeWidth: 3 };
    }
    if (kind === 'line' || kind === 'arrow') {
      return { kind, x1, y1, x2, y2, tx: 0, ty: 0, sx: 1, sy: 1, stroke: '#334155', strokeWidth: 3 };
    }
    return null;
  }

  getShapePreviewPath(kind, a, b) {
    const o = this.createShapeObject(kind, a, b);
    if (!o) return '';
    if (o.kind === 'rect' || o.kind === 'textbox') return `M${o.x},${o.y} L${o.x + o.w},${o.y} L${o.x + o.w},${o.y + o.h} L${o.x},${o.y + o.h} Z`;
    if (o.kind === 'ellipse') return `M${o.cx - o.rx},${o.cy} A${o.rx},${o.ry} 0 1 0 ${o.cx + o.rx},${o.cy} A${o.rx},${o.ry} 0 1 0 ${o.cx - o.rx},${o.cy}`;
    if (o.kind === 'polygon') return `M${o.points[0].x},${o.points[0].y} L${o.points[1].x},${o.points[1].y} L${o.points[2].x},${o.points[2].y} Z`;
    return `M${o.x1},${o.y1} L${o.x2},${o.y2}`;
  }

  getInkCenter(o) {
    if (o.kind === 'ellipse') return { x: o.cx, y: o.cy };
    if (o.kind === 'rect' || o.kind === 'textbox') return { x: o.x + o.w / 2, y: o.y + o.h / 2 };
    if (o.kind === 'polygon') {
      const b = this.getBounds(o.points);
      return { x: (b.minX + b.maxX) / 2, y: (b.minY + b.maxY) / 2 };
    }
    if (o.kind === 'line' || o.kind === 'arrow') return { x: (o.x1 + o.x2) / 2, y: (o.y1 + o.y2) / 2 };
    const b = this.getBounds(o.pts);
    return { x: (b.minX + b.maxX) / 2, y: (b.minY + b.maxY) / 2 };
  }

  flip(inkId, axis = 'h') {
    const o = store.state.canvas.inkObjects.find(x => x.id === inkId);
    if (o) {
      store.saveSnapshot();
      if (axis === 'h') o.sx = -(o.sx || 1);
      else o.sy = -(o.sy || 1);
      store.notify('inkFlipped');
      this.render();
      if (this.onInkMove) this.onInkMove(o);
    }
  }

  rotate(inkId, delta = 45) {
    const o = store.state.canvas.inkObjects.find(x => x.id === inkId);
    if (o) {
      store.saveSnapshot();
      o.rotation = ((o.rotation || 0) + delta) % 360;
      store.notify('inkRotated');
      this.render();
      if (this.onInkMove) this.onInkMove(o);
    }
  }

  getInkDimensions(o) {
    let w = 30, h = 30;
    if (o.kind === 'rect' || o.kind === 'textbox') {
      w = Math.max(30, o.w * Math.abs(o.sx || 1));
      h = Math.max(30, o.h * Math.abs(o.sy || 1));
    } else if (o.kind === 'ellipse') {
      w = Math.max(30, o.rx * 2 * Math.abs(o.sx || 1));
      h = Math.max(30, o.ry * 2 * Math.abs(o.sy || 1));
    } else if (o.kind === 'polygon') {
      const b = this.getBounds(o.points);
      w = Math.max(30, (b.maxX - b.minX) * Math.abs(o.sx || 1));
      h = Math.max(30, (b.maxY - b.minY) * Math.abs(o.sy || 1));
    } else if (o.kind === 'line' || o.kind === 'arrow') {
      w = Math.max(30, Math.abs(o.x2 - o.x1));
      h = Math.max(30, Math.abs(o.y2 - o.y1));
    } else {
      const b = this.getBounds(o.pts);
      w = Math.max(30, (b.maxX - b.minX) * Math.abs(o.sx || 1));
      h = Math.max(30, (b.maxY - b.minY) * Math.abs(o.sy || 1));
    }

    if (o.rotation) {
      const rad = (o.rotation * Math.PI) / 180;
      const cos = Math.abs(Math.cos(rad));
      const sin = Math.abs(Math.sin(rad));
      return {
        width: Math.round(w * cos + h * sin),
        height: Math.round(w * sin + h * cos)
      };
    }
    return { width: w, height: h };
  }

  deleteInk(inkId) {
    store.saveSnapshot();
    store.state.canvas.inkObjects = store.state.canvas.inkObjects.filter(x => x.id !== inkId);
    store.state.canvas.edges = store.state.canvas.edges.filter(e => e.a !== inkId && e.b !== inkId);
    if (store.state.selected?.id === inkId) {
      store.state.selected = { type: null, id: null };
    }
    store.notify('inkDeleted');
    this.render();
  }

  render() {
    this.svgLayer.querySelectorAll('.rendered-ink, .rendered-ink-group').forEach(el => el.remove());

    const { inkObjects } = store.state.canvas;
    const selectedId = store.state.selected?.id;
    const isLinking = store.state.activeTool === 'link';
    const linkStartId = store.state.linkStart;

    inkObjects.forEach(o => {
      o.tx = o.tx || 0;
      o.ty = o.ty || 0;
      o.sx = o.sx ?? 1;
      o.sy = o.sy ?? 1;
      o.rotation = o.rotation || 0;

      let el;
      if (o.kind === 'free') {
        el = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        el.setAttribute('d', this.pointsToSplinePath(o.pts));
      } else if (o.kind === 'line' || o.kind === 'arrow') {
        el = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        ['x1', 'y1', 'x2', 'y2'].forEach(k => el.setAttribute(k, o[k]));
        if (o.kind === 'arrow') el.setAttribute('marker-end', 'url(#arrowHead)');
      } else if (o.kind === 'ellipse') {
        el = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
        ['cx', 'cy', 'rx', 'ry'].forEach(k => el.setAttribute(k, o[k]));
      } else if (o.kind === 'rect' || o.kind === 'textbox') {
        el = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        el.setAttribute('x', o.x);
        el.setAttribute('y', o.y);
        el.setAttribute('width', o.w);
        el.setAttribute('height', o.h);
        el.setAttribute('rx', o.kind === 'textbox' ? '8' : '6');
        if (o.strokeDasharray) {
          el.setAttribute('stroke-dasharray', o.strokeDasharray);
        }
      } else if (o.kind === 'polygon') {
        el = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        el.setAttribute('points', o.points.map(p => `${p.x},${p.y}`).join(' '));
      }

      if (!el) return;

      const isSelected = selectedId === o.id;
      const isSource = isLinking && linkStartId === o.id;
      const isTarget = isLinking && linkStartId && linkStartId !== o.id;
      const center = this.getInkCenter(o);

      const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      group.setAttribute('class', `rendered-ink-group ${isSelected ? 'is-selected' : ''}`);

      el.setAttribute('class', `rendered-ink ${isSelected ? 'is-selected' : ''} ${isSource ? 'is-connect-source' : ''} ${isTarget ? 'is-connect-target' : ''}`);
      el.setAttribute('fill', o.fill || 'none');
      el.setAttribute('stroke', isSelected ? '#4f46e5' : (o.stroke || '#334155'));
      el.setAttribute('stroke-width', isSelected ? (o.strokeWidth || 3.5) + 1.5 : (o.strokeWidth || 3.5));
      el.setAttribute('stroke-linecap', 'round');
      el.setAttribute('stroke-linejoin', 'round');
      el.setAttribute('transform', `translate(${o.tx} ${o.ty}) translate(${center.x} ${center.y}) rotate(${o.rotation || 0}) scale(${o.sx} ${o.sy}) translate(${-center.x} ${-center.y})`);

      // Mouse drag to reposition ink object
      el.addEventListener('mousedown', (e) => {
        if (store.state.activeTool === 'link' || e.button !== 0) return;
        e.stopPropagation();
        this.draggingInk = o;
        this.dragMoved = false;
        const pt = this.viewport.screenToCanvas(e.clientX, e.clientY);
        this.dragOffset = { x: pt.x - o.tx, y: pt.y - o.ty };
      });

      // Click to select or connect
      el.addEventListener('click', (e) => {
        if (this.dragMoved) return;
        e.stopPropagation();
        if (store.state.activeTool === 'link') {
          if (this.onLinkInk) this.onLinkInk(o);
        } else {
          this.onSelectInk(o, e.clientX, e.clientY);
        }
      });

      // Double-click to add or edit text inside the shape
      el.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        this.onEditInkText(o);
      });

      group.appendChild(el);

      // Render text label if present with auto-wrapping
      if (o.text) {
        const textEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        const cx = center.x + (o.tx || 0);
        const cy = center.y + (o.ty || 0);
        textEl.setAttribute('x', cx);
        textEl.setAttribute('text-anchor', 'middle');
        textEl.setAttribute('class', 'ink-shape-label');
        textEl.setAttribute('fill', '#0f172a');
        textEl.setAttribute('font-size', '14');
        textEl.setAttribute('font-weight', o.kind === 'textbox' ? '600' : '700');
        textEl.style.pointerEvents = 'none';

        const maxLineWidth = Math.max(80, (o.w || 140) - 18);
        const rawLines = o.text.split('\n');
        const lines = [];

        rawLines.forEach(l => {
          const words = l.split(' ');
          let currentLine = '';
          words.forEach(w => {
            const testLine = currentLine ? `${currentLine} ${w}` : w;
            if (testLine.length * 8.5 > maxLineWidth && currentLine) {
              lines.push(currentLine);
              currentLine = w;
            } else {
              currentLine = testLine;
            }
          });
          if (currentLine) lines.push(currentLine);
        });

        const lineHeight = 18;
        const totalHeight = lines.length * lineHeight;
        const startY = cy - (totalHeight / 2) + (lineHeight / 2) + 2;

        lines.forEach((line, lineIdx) => {
          const tspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
          tspan.setAttribute('x', cx);
          tspan.setAttribute('y', startY + lineIdx * lineHeight);
          tspan.setAttribute('dominant-baseline', 'middle');
          tspan.textContent = line;
          textEl.appendChild(tspan);
        });

        group.appendChild(textEl);
      }

      this.svgLayer.appendChild(group);
    });
  }

  async onEditInkText(o) {
    const { modal } = await import('../components/modal.js');
    const title = o.kind === 'textbox' ? 'Edit Text Box' : 'Edit Shape Text';
    const desc = o.kind === 'textbox'
      ? 'Enter notes, explanations, or concepts for this text box:'
      : 'Add or update the text inside this shape:';
    const newText = await modal.prompt(
      title,
      desc,
      o.text || '',
      'Enter note...'
    );
    if (newText !== null) {
      store.saveSnapshot();
      o.text = newText.trim() || (o.kind === 'textbox' ? 'Text Note' : '');
      if (o.kind === 'textbox' && o.text.length > 25) {
        const estLines = Math.ceil(o.text.length / 18);
        o.h = Math.max(o.h, estLines * 20 + 24);
      }
      store.notify('inkEdited');
      this.render();
      if (this.onInkMove) this.onInkMove(o);
    }
  }
}
