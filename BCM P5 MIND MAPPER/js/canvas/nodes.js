// Node Renderer & Interaction Manager for Mind Map Canvas
import { store } from '../state/store.js';
import { modal } from '../components/modal.js';

export class NodeManager {
  constructor(canvasEl, viewport, onSelectNode, onLinkNode) {
    this.canvasEl = canvasEl;
    this.viewport = viewport;
    this.onSelectNode = onSelectNode;
    this.onLinkNode = onLinkNode;

    this.draggingNode = null;
    this.dragOffset = { x: 0, y: 0 };
    this.dragMoved = false;

    this.setupGlobalDrag();
  }

  setupGlobalDrag() {
    window.addEventListener('mousemove', (e) => this.handleDragMove(e));
    window.addEventListener('mouseup', () => this.handleDragEnd());

    window.addEventListener('touchmove', (e) => {
      if (this.draggingNode && e.touches.length === 1) {
        this.handleDragMove(e.touches[0]);
      }
    }, { passive: true });

    window.addEventListener('touchend', () => this.handleDragEnd());
  }

  handleDragStart(node, clientX, clientY) {
    this.draggingNode = node;
    this.dragMoved = false;
    const pt = this.viewport.screenToCanvas(clientX, clientY);
    this.dragOffset = {
      x: pt.x - node.x,
      y: pt.y - node.y
    };
  }

  handleDragMove(e) {
    if (!this.draggingNode) return;
    this.dragMoved = true;
    const pt = this.viewport.screenToCanvas(e.clientX, e.clientY);
    this.draggingNode.x = Math.round(pt.x - this.dragOffset.x);
    this.draggingNode.y = Math.round(pt.y - this.dragOffset.y);

    const el = this.canvasEl.querySelector(`[data-node-id="${this.draggingNode.id}"]`);
    if (el) {
      el.style.left = `${this.draggingNode.x}px`;
      el.style.top = `${this.draggingNode.y}px`;
    }
    // Notify edge renderer to follow node movements smoothly
    if (this.onNodeMove) this.onNodeMove(this.draggingNode);
  }

  handleDragEnd() {
    if (this.draggingNode) {
      if (this.dragMoved) {
        store.saveSnapshot();
        store.notify('nodeMoved');
      }
      this.draggingNode = null;
    }
  }

  async editNode(node) {
    const newText = await modal.prompt(
      'Edit Mind Map Node',
      'Update the text label for this idea:',
      node.text,
      'Enter concept name...'
    );
    if (newText && newText.trim()) {
      store.saveSnapshot();
      node.text = newText.trim();
      store.notify('nodeEdited');
      this.render();
    }
  }

  deleteNode(nodeId) {
    store.saveSnapshot();
    store.state.canvas.nodes = store.state.canvas.nodes.filter(n => n.id !== nodeId);
    store.state.canvas.edges = store.state.canvas.edges.filter(e => e.a !== nodeId && e.b !== nodeId);
    if (store.state.selected.id === nodeId) {
      store.state.selected = { type: null, id: null };
    }
    store.notify('nodeDeleted');
    this.render();
  }

  render() {
    // Clean old node elements
    this.canvasEl.querySelectorAll('.canvas-node').forEach(el => el.remove());

    const { nodes } = store.state.canvas;
    const selectedId = store.state.selected?.id;

    const isLinking = store.state.activeTool === 'link';
    const linkStartId = store.state.linkStart;

    nodes.forEach(node => {
      const el = document.createElement('div');
      const isSelected = selectedId === node.id;
      const isSource = isLinking && linkStartId === node.id;
      const isTarget = isLinking && linkStartId && linkStartId !== node.id;

      el.className = `canvas-node shape-${node.shape || 'rounded'} kind-${node.kind || 'idea'} ${isSelected ? 'is-selected' : ''} ${isSource ? 'is-connect-source' : ''} ${isTarget ? 'is-connect-target' : ''}`;
      el.dataset.nodeId = node.id;
      el.style.left = `${node.x}px`;
      el.style.top = `${node.y}px`;
      el.style.backgroundColor = node.color || '#e0f2fe';
      if (node.borderColor) el.style.borderColor = node.borderColor;

      const label = document.createElement('span');
      label.className = 'node-label';
      label.textContent = node.text;
      el.appendChild(label);

      // Connect quick handle button on node
      const connectBtn = document.createElement('button');
      connectBtn.className = 'node-connect-btn';
      connectBtn.innerHTML = '🔗';
      connectBtn.title = 'Connect this node to another';
      connectBtn.onclick = (e) => {
        e.stopPropagation();
        this.onLinkNode(node);
      };
      el.appendChild(connectBtn);

      // Delete quick button on selected node
      const delBtn = document.createElement('button');
      delBtn.className = 'node-delete-btn';
      delBtn.innerHTML = '&times;';
      delBtn.title = 'Delete Node';
      delBtn.onclick = (e) => {
        e.stopPropagation();
        this.deleteNode(node.id);
      };
      el.appendChild(delBtn);

      // Mouse drag start
      el.addEventListener('mousedown', (e) => {
        if (e.target === delBtn || e.target === connectBtn || e.button !== 0) return;
        this.handleDragStart(node, e.clientX, e.clientY);
      });

      // Touch drag start
      el.addEventListener('touchstart', (e) => {
        if (e.target === delBtn || e.target === connectBtn) return;
        if (e.touches.length === 1) {
          const t = e.touches[0];
          this.handleDragStart(node, t.clientX, t.clientY);
        }
      }, { passive: true });

      // Click to select or connect
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this.dragMoved) return;

        if (store.state.activeTool === 'link') {
          this.onLinkNode(node);
        } else {
          this.onSelectNode(node, e.clientX, e.clientY);
        }
      });

      // Double click to edit label
      el.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        this.editNode(node);
      });

      this.canvasEl.appendChild(el);
    });
  }

  getNodeCenter(nodeId) {
    const node = store.state.canvas.nodes.find(n => n.id === nodeId);
    if (!node) return { x: 0, y: 0, width: 140, height: 48 };

    const el = this.canvasEl.querySelector(`[data-node-id="${nodeId}"]`);
    const w = el ? el.offsetWidth : 140;
    const h = el ? el.offsetHeight : 48;
    return {
      x: node.x + w / 2,
      y: node.y + h / 2,
      left: node.x,
      top: node.y,
      width: w,
      height: h
    };
  }
}
