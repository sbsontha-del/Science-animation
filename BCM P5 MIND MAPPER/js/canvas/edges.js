// Connector Lines & Edges Manager for Mind Map Canvas
import { store } from '../state/store.js';

export class EdgeManager {
  constructor(svgLayer, nodeManager, freehandManager, onSelectEdge) {
    this.svgLayer = svgLayer;
    this.nodeManager = nodeManager;
    this.freehandManager = freehandManager;
    this.onSelectEdge = onSelectEdge;
  }

  getEntityCenter(id) {
    const node = store.state.canvas.nodes.find(n => n.id === id);
    if (node) {
      return this.nodeManager.getNodeCenter(id);
    }
    const ink = store.state.canvas.inkObjects.find(i => i.id === id);
    if (ink && this.freehandManager) {
      const center = this.freehandManager.getInkCenter(ink);
      const dims = this.freehandManager.getInkDimensions(ink);
      return {
        x: center.x + (ink.tx || 0),
        y: center.y + (ink.ty || 0),
        width: dims.width,
        height: dims.height
      };
    }
    return null;
  }

  // Calculate intersection between line (centerA -> centerB) and entity bounding box
  getNodeIntersection(centerA, centerB, nodeBox) {
    const dx = centerB.x - centerA.x;
    const dy = centerB.y - centerA.y;
    if (dx === 0 && dy === 0) return centerB;

    const halfW = nodeBox.width / 2;
    const halfH = nodeBox.height / 2;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    let scale = 1;
    if (absDx * halfH > absDy * halfW) {
      scale = halfW / absDx;
    } else {
      scale = halfH / absDy;
    }

    return {
      x: nodeBox.x - dx * scale,
      y: nodeBox.y - dy * scale
    };
  }

  render() {
    this.svgLayer.innerHTML = `
      <defs>
        <marker id="arrowHead" markerWidth="14" markerHeight="14" refX="12" refY="7" orient="auto" markerUnits="userSpaceOnUse">
          <path d="M2,2 L12,7 L2,12 Z" fill="#64748b" />
        </marker>
        <marker id="arrowHeadSelected" markerWidth="14" markerHeight="14" refX="12" refY="7" orient="auto" markerUnits="userSpaceOnUse">
          <path d="M2,2 L12,7 L2,12 Z" fill="#4f46e5" />
        </marker>
        <marker id="arrowStart" markerWidth="14" markerHeight="14" refX="2" refY="7" orient="auto" markerUnits="userSpaceOnUse">
          <path d="M12,2 L2,7 L12,12 Z" fill="#64748b" />
        </marker>
        <marker id="arrowStartSelected" markerWidth="14" markerHeight="14" refX="2" refY="7" orient="auto" markerUnits="userSpaceOnUse">
          <path d="M12,2 L2,7 L12,12 Z" fill="#4f46e5" />
        </marker>
      </defs>
    `;

    const { edges } = store.state.canvas;
    const selectedId = store.state.selected?.id;

    edges.forEach((edge, idx) => {
      const boxA = this.getEntityCenter(edge.a);
      const boxB = this.getEntityCenter(edge.b);
      if (!boxA || !boxB) return;

      const pA = this.getNodeIntersection(boxB, boxA, boxA);
      const pB = this.getNodeIntersection(boxA, boxB, boxB);

      const isSelected = selectedId === edge.id || selectedId === `edge_${idx}`;
      const color = isSelected ? '#4f46e5' : (edge.color || '#64748b');
      const strokeWidth = isSelected ? 3 : 2;
      const type = edge.type || 'curved';

      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('class', `canvas-edge-group ${isSelected ? 'is-selected' : ''}`);
      g.dataset.edgeId = edge.id || `edge_${idx}`;

      let pathEl;
      let midX = (pA.x + pB.x) / 2;
      let midY = (pA.y + pB.y) / 2;

      if (type === 'curved') {
        pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const dx = pB.x - pA.x;
        const dy = pB.y - pA.y;
        const cx1 = pA.x + dx * 0.25;
        const cy1 = pA.y + dy * 0.1;
        const cx2 = pA.x + dx * 0.75;
        const cy2 = pB.y - dy * 0.1;
        pathEl.setAttribute('d', `M${pA.x},${pA.y} C${cx1},${cy1} ${cx2},${cy2} ${pB.x},${pB.y}`);
        midX = (pA.x + 3 * cx1 + 3 * cx2 + pB.x) / 8;
        midY = (pA.y + 3 * cy1 + 3 * cy2 + pB.y) / 8;
      } else if (type === 'elbow') {
        pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
        const mx = (pA.x + pB.x) / 2;
        pathEl.setAttribute('points', `${pA.x},${pA.y} ${mx},${pA.y} ${mx},${pB.y} ${pB.x},${pB.y}`);
        midX = mx;
        midY = (pA.y + pB.y) / 2;
      } else {
        pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        pathEl.setAttribute('x1', pA.x);
        pathEl.setAttribute('y1', pA.y);
        pathEl.setAttribute('x2', pB.x);
        pathEl.setAttribute('y2', pB.y);
      }

      pathEl.setAttribute('fill', 'none');
      pathEl.setAttribute('stroke', color);
      pathEl.setAttribute('stroke-width', strokeWidth);
      pathEl.setAttribute('stroke-linecap', 'round');
      pathEl.setAttribute('stroke-linejoin', 'round');

      // Set markers on the visible line only
      const markerSuffix = isSelected ? 'Selected' : '';
      if (type === 'arrow' || type === 'curved' || type === 'elbow') {
        pathEl.setAttribute('marker-end', `url(#arrowHead${markerSuffix})`);
      }
      if (type === 'double') {
        pathEl.setAttribute('marker-start', `url(#arrowStart${markerSuffix})`);
        pathEl.setAttribute('marker-end', `url(#arrowHead${markerSuffix})`);
      }

      // Invisible wider hit zone for easy clicking (WITHOUT any markers!)
      const hitArea = pathEl.cloneNode(false);
      hitArea.removeAttribute('marker-start');
      hitArea.removeAttribute('marker-end');
      hitArea.setAttribute('fill', 'none');
      hitArea.setAttribute('stroke', 'transparent');
      hitArea.setAttribute('stroke-width', '18');
      hitArea.style.cursor = 'pointer';
      hitArea.onclick = (e) => {
        e.stopPropagation();
        this.onSelectEdge(edge, idx, e.clientX, e.clientY);
      };

      g.appendChild(hitArea);
      g.appendChild(pathEl);

      // Edge Label
      if (edge.label) {
        const textBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        const textEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        textEl.setAttribute('x', midX);
        textEl.setAttribute('y', midY);
        textEl.setAttribute('text-anchor', 'middle');
        textEl.setAttribute('dominant-baseline', 'middle');
        textEl.setAttribute('class', 'edge-label-text');
        textEl.textContent = edge.label;

        // Approximate text dimensions
        const textWidth = Math.max(30, edge.label.length * 8 + 14);
        const textHeight = 20;
        textBg.setAttribute('x', midX - textWidth / 2);
        textBg.setAttribute('y', midY - textHeight / 2);
        textBg.setAttribute('width', textWidth);
        textBg.setAttribute('height', textHeight);
        textBg.setAttribute('rx', '6');
        textBg.setAttribute('class', 'edge-label-bg');

        g.appendChild(textBg);
        g.appendChild(textEl);
      }

      this.svgLayer.appendChild(g);
    });
  }
}
