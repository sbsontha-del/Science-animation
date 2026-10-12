// Export Manager: High-Res PNG, Standalone SVG & Print Sheets
import { store } from '../state/store.js';

export class ExportManager {
  static exportPNG() {
    const { nodes, edges, brackets, inkObjects } = store.state.canvas;
    if (nodes.length === 0 && inkObjects.length === 0) {
      alert('Mind map is currently empty. Add ideas or build your map first!');
      return;
    }

    // Determine bounding box of all elements
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    nodes.forEach(n => {
      minX = Math.min(minX, n.x);
      minY = Math.min(minY, n.y);
      maxX = Math.max(maxX, n.x + 220);
      maxY = Math.max(maxY, n.y + 100);
    });

    brackets.forEach(b => {
      minX = Math.min(minX, b.x);
      minY = Math.min(minY, b.y);
      maxX = Math.max(maxX, b.x + 60);
      maxY = Math.max(maxY, b.y + 100);
    });

    inkObjects.forEach(o => {
      const tx = o.tx || 0;
      const ty = o.ty || 0;
      if (o.kind === 'rect' || o.kind === 'textbox') {
        minX = Math.min(minX, o.x + tx);
        minY = Math.min(minY, o.y + ty);
        maxX = Math.max(maxX, o.x + tx + o.w);
        maxY = Math.max(maxY, o.y + ty + o.h);
      } else if (o.kind === 'ellipse') {
        minX = Math.min(minX, o.cx + tx - o.rx);
        minY = Math.min(minY, o.cy + ty - o.ry);
        maxX = Math.max(maxX, o.cx + tx + o.rx);
        maxY = Math.max(maxY, o.cy + ty + o.ry);
      }
    });

    const padding = 60;
    minX = Math.max(0, minX - padding);
    minY = Math.max(0, minY - padding);
    const width = Math.max(800, (maxX - minX) + padding * 2);
    const height = Math.max(600, (maxY - minY) + padding * 2);

    // Create high-res canvas (2x retina)
    const scale = 2;
    const canvas = document.createElement('canvas');
    canvas.width = width * scale;
    canvas.height = height * scale;
    const ctx = canvas.getContext('2d');
    ctx.scale(scale, scale);

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Optional header banner
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(`P5 Science: ${store.state.concept}`, padding, 40);

    ctx.fillStyle = '#64748b';
    ctx.font = '13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(`Theme: ${store.state.topic} • BCM Science Mind Mapper`, padding, 60);

    // Render Edges
    edges.forEach(ed => {
      const nodeA = nodes.find(n => n.id === ed.a);
      const nodeB = nodes.find(n => n.id === ed.b);
      if (!nodeA || !nodeB) return;

      const ax = (nodeA.x + 80) - minX;
      const ay = (nodeA.y + 24) - minY;
      const bx = (nodeB.x + 80) - minX;
      const by = (nodeB.y + 24) - minY;

      ctx.beginPath();
      ctx.strokeStyle = ed.color || '#94a3b8';
      ctx.lineWidth = 2;

      if (ed.type === 'curved' || !ed.type) {
        const dx = bx - ax;
        const dy = by - ay;
        ctx.moveTo(ax, ay);
        ctx.bezierCurveTo(ax + dx * 0.25, ay + dy * 0.1, ax + dx * 0.75, by - dy * 0.1, bx, by);
      } else {
        ctx.moveTo(ax, ay);
        ctx.lineTo(bx, by);
      }
      ctx.stroke();

      // Label
      if (ed.label) {
        const mx = (ax + bx) / 2;
        const my = (ay + by) / 2;
        ctx.font = '12px -apple-system, BlinkMacSystemFont, sans-serif';
        const tw = ctx.measureText(ed.label).width;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(mx - tw / 2 - 6, my - 9, tw + 12, 18);
        ctx.fillStyle = '#334155';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(ed.label, mx, my);
      }
    });

    // Render Nodes
    nodes.forEach(n => {
      const nx = n.x - minX;
      const ny = n.y - minY;
      const nw = 160;
      const nh = 46;
      const radius = n.shape === 'pill' ? 22 : 10;

      ctx.save();
      ctx.beginPath();
      ctx.roundRect(nx, ny, nw, nh, radius);
      ctx.fillStyle = n.color || '#f1f5f9';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = n.borderColor || '#cbd5e1';
      ctx.stroke();

      ctx.fillStyle = '#0f172a';
      ctx.font = n.kind === 'central' ? 'bold 15px -apple-system, sans-serif' : '14px -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(n.text, nx + nw / 2, ny + nh / 2);
      ctx.restore();
    });

    // Render Brackets
    brackets.forEach(b => {
      const bx = b.x - minX;
      const by = b.y - minY;
      ctx.save();
      ctx.fillStyle = b.color || '#475467';
      ctx.font = '54px Georgia, serif';
      ctx.textAlign = 'center';
      const char = b.type === 'right' ? '}' : b.type === 'left' ? '{' : b.type === 'top' ? '⏞' : '⏟';
      ctx.fillText(char, bx + 20, by + 40);
      ctx.restore();
    });

    // Render Shapes & Text Boxes
    inkObjects.forEach(o => {
      const tx = o.tx || 0;
      const ty = o.ty || 0;
      ctx.save();
      ctx.strokeStyle = o.stroke || '#0284c7';
      ctx.fillStyle = o.fill || 'transparent';
      ctx.lineWidth = o.strokeWidth || 2;

      if (o.kind === 'rect' || o.kind === 'textbox') {
        const ox = (o.x + tx) - minX;
        const oy = (o.y + ty) - minY;
        ctx.beginPath();
        ctx.roundRect(ox, oy, o.w, o.h, o.kind === 'textbox' ? 8 : 6);
        if (o.fill && o.fill !== 'none') ctx.fill();
        ctx.stroke();

        if (o.text) {
          ctx.fillStyle = '#0f172a';
          ctx.font = o.kind === 'textbox' ? '600 13px -apple-system, sans-serif' : 'bold 14px -apple-system, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(o.text, ox + o.w / 2, oy + o.h / 2);
        }
      } else if (o.kind === 'ellipse') {
        const cx = (o.cx + tx) - minX;
        const cy = (o.cy + ty) - minY;
        ctx.beginPath();
        ctx.ellipse(cx, cy, o.rx, o.ry, 0, 0, Math.PI * 2);
        if (o.fill && o.fill !== 'none') ctx.fill();
        ctx.stroke();

        if (o.text) {
          ctx.fillStyle = '#0f172a';
          ctx.font = 'bold 14px -apple-system, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(o.text, cx, cy);
        }
      }
      ctx.restore();
    });

    // Trigger download
    const link = document.createElement('a');
    link.download = `P5_Science_${store.state.concept.replace(/\s+/g, '_')}_MindMap.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  static printView() {
    window.print();
  }
}
