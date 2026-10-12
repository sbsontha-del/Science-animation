// Hierarchical Brackets Manager for Mind Map Canvas
import { store } from '../state/store.js';

export class BracketManager {
  constructor(canvasEl, viewport, onSelectBracket) {
    this.canvasEl = canvasEl;
    this.viewport = viewport;
    this.onSelectBracket = onSelectBracket;

    this.draggingBracket = null;
    this.dragOffset = { x: 0, y: 0 };
    this.dragMoved = false;

    this.setupDrag();
  }

  setupDrag() {
    window.addEventListener('mousemove', (e) => {
      if (!this.draggingBracket) return;
      this.dragMoved = true;
      const pt = this.viewport.screenToCanvas(e.clientX, e.clientY);
      this.draggingBracket.x = Math.round(pt.x - this.dragOffset.x);
      this.draggingBracket.y = Math.round(pt.y - this.dragOffset.y);

      const el = this.canvasEl.querySelector(`[data-bracket-id="${this.draggingBracket.id}"]`);
      if (el) {
        el.style.left = `${this.draggingBracket.x}px`;
        el.style.top = `${this.draggingBracket.y}px`;
      }
    });

    window.addEventListener('mouseup', () => {
      if (this.draggingBracket) {
        if (this.dragMoved) {
          store.saveSnapshot();
          store.notify('bracketMoved');
        }
        this.draggingBracket = null;
      }
    });
  }

  addBracket(type = 'right') {
    store.saveSnapshot();
    const id = 'bracket_' + Date.now();
    const bracket = {
      id,
      type, // 'right' | 'left' | 'top' | 'bottom'
      x: 700,
      y: 400,
      sx: 1,
      sy: 1,
      rotation: 0,
      color: '#475467'
    };
    store.state.canvas.brackets.push(bracket);
    store.state.selected = { type: 'bracket', id };
    store.notify('bracketAdded');
    this.render();
  }

  flip(bracketId, axis = 'h') {
    const b = store.state.canvas.brackets.find(x => x.id === bracketId);
    if (b) {
      store.saveSnapshot();
      if (axis === 'h') b.sx = -(b.sx || 1);
      else b.sy = -(b.sy || 1);
      store.notify('bracketFlipped');
      this.render();
    }
  }

  rotate(bracketId, delta = 45) {
    const b = store.state.canvas.brackets.find(x => x.id === bracketId);
    if (b) {
      store.saveSnapshot();
      b.rotation = ((b.rotation || 0) + delta) % 360;
      store.notify('bracketRotated');
      this.render();
    }
  }

  deleteBracket(bracketId) {
    store.saveSnapshot();
    store.state.canvas.brackets = store.state.canvas.brackets.filter(b => b.id !== bracketId);
    if (store.state.selected?.id === bracketId) {
      store.state.selected = { type: null, id: null };
    }
    store.notify('bracketDeleted');
    this.render();
  }

  render() {
    this.canvasEl.querySelectorAll('.canvas-bracket').forEach(el => el.remove());

    const { brackets } = store.state.canvas;
    const selectedId = store.state.selected?.id;

    brackets.forEach(b => {
      const el = document.createElement('div');
      el.className = `canvas-bracket ${selectedId === b.id ? 'is-selected' : ''}`;
      el.dataset.bracketId = b.id;
      el.style.left = `${b.x}px`;
      el.style.top = `${b.y}px`;
      el.style.transform = `scale(${b.sx || 1}, ${b.sy || 1}) rotate(${b.rotation || 0}deg)`;
      el.style.color = b.color || '#475467';

      const symbol = b.type === 'right' ? '}' :
                     b.type === 'left' ? '{' :
                     b.type === 'top' ? '⏞' : '⏟';
      el.textContent = symbol;

      el.addEventListener('mousedown', (e) => {
        if (e.button !== 0) return;
        this.draggingBracket = b;
        this.dragMoved = false;
        const pt = this.viewport.screenToCanvas(e.clientX, e.clientY);
        this.dragOffset = { x: pt.x - b.x, y: pt.y - b.y };
      });

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this.dragMoved) return;
        this.onSelectBracket(b, e.clientX, e.clientY);
      });

      // Double-click to cycle scaling size
      el.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        store.saveSnapshot();
        const currentScale = Math.abs(b.sx || 1);
        const nextScale = currentScale >= 2.5 ? 1 : currentScale + 0.5;
        b.sx = (b.sx < 0 ? -1 : 1) * nextScale;
        b.sy = (b.sy < 0 ? -1 : 1) * nextScale;
        store.notify('bracketResized');
        this.render();
      });

      this.canvasEl.appendChild(el);
    });
  }
}
