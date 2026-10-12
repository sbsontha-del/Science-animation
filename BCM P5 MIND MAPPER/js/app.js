// Main Application Entry Point & Controller
import { CURRICULUM } from './data/curriculum.js';
import { store } from './state/store.js';
import { modal } from './components/modal.js';
import { WizardComponent } from './components/wizard.js';
import { BrainstormComponent } from './components/brainstorm.js';
import { ClusterComponent } from './components/cluster.js';
import { Viewport } from './canvas/viewport.js';
import { NodeManager } from './canvas/nodes.js';
import { EdgeManager } from './canvas/edges.js';
import { BracketManager } from './canvas/brackets.js';
import { FreehandManager } from './canvas/freehand.js';
import { ExportManager } from './canvas/export.js';

class MindMapperApp {
  constructor() {
    this.initCurriculumSelector();
    this.initWizardAndPanels();
    this.initCanvasWorkspace();
    this.initObjectPopup();
    this.initKeyboardShortcuts();
    this.initHeaderControls();

    // Re-render when state changes
    store.subscribe((state, event) => {
      this.updateUndoRedoButtons();
      if (['topicChanged', 'conceptChanged'].includes(event)) {
        this.renderCurriculumDetails();
      }
      if (['snapshotRestored', 'allDataCleared'].includes(event)) {
        this.syncDropdowns();
        this.renderCurriculumDetails();
      }
    });

    this.updateUndoRedoButtons();
    this.renderCurriculumDetails();
  }

  // --- 1. Curriculum & Success Criteria ---
  initCurriculumSelector() {
    this.topicSelect = document.getElementById('topicSelect');
    this.conceptSelect = document.getElementById('conceptSelect');
    this.criteriaList = document.getElementById('criteriaList');
    this.criteriaCountBadge = document.getElementById('criteriaCountBadge');

    // Populate topics
    this.topicSelect.innerHTML = '';
    Object.keys(CURRICULUM).forEach(topic => {
      const opt = document.createElement('option');
      opt.value = topic;
      opt.textContent = `${CURRICULUM[topic].theme}: ${topic}`;
      this.topicSelect.appendChild(opt);
    });

    this.topicSelect.value = store.state.topic;
    this.populateConcepts();
    this.conceptSelect.value = store.state.concept;

    this.topicSelect.addEventListener('change', () => {
      store.setTopic(this.topicSelect.value);
      this.populateConcepts();
      store.setConcept(this.conceptSelect.value);
    });

    this.conceptSelect.addEventListener('change', () => {
      store.setConcept(this.conceptSelect.value);
    });
  }

  syncDropdowns() {
    this.topicSelect.value = store.state.topic;
    this.populateConcepts();
    this.conceptSelect.value = store.state.concept;
  }

  populateConcepts() {
    const topic = this.topicSelect.value;
    const concepts = CURRICULUM[topic]?.concepts || {};
    this.conceptSelect.innerHTML = '';
    Object.keys(concepts).forEach(c => {
      const opt = document.createElement('option');
      opt.value = c;
      opt.textContent = c;
      this.conceptSelect.appendChild(opt);
    });
  }

  renderCurriculumDetails() {
    const { topic, concept } = store.state;
    const data = CURRICULUM[topic]?.concepts[concept];
    if (!data) return;

    // Render topic overview
    const overviewEl = document.getElementById('conceptOverview');
    if (overviewEl) {
      overviewEl.textContent = data.overview || '';
    }

    // Render Success Criteria Checkboxes
    if (this.criteriaList) {
      this.criteriaList.innerHTML = '';
      const criteria = data.successCriteria || [];
      let checkedCount = 0;

      criteria.forEach((text, idx) => {
        const isChecked = store.isCriterionChecked(idx);
        if (isChecked) checkedCount++;

        const label = document.createElement('label');
        label.className = `criterion-item ${isChecked ? 'is-checked' : ''}`;

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = isChecked;
        checkbox.addEventListener('change', (e) => {
          store.toggleCriterion(idx, e.target.checked);
          this.renderCurriculumDetails();
        });

        const span = document.createElement('span');
        span.className = 'criterion-text';
        span.textContent = text;

        label.appendChild(checkbox);
        label.appendChild(span);
        this.criteriaList.appendChild(label);
      });

      if (this.criteriaCountBadge) {
        this.criteriaCountBadge.textContent = `${checkedCount} / ${criteria.length} mastered`;
        this.criteriaCountBadge.className = `badge-pill ${checkedCount === criteria.length && criteria.length > 0 ? 'badge-success' : 'badge-neutral'}`;
      }
    }
  }

  // --- 2. Wizard & Flow Components ---
  initWizardAndPanels() {
    this.wizard = new WizardComponent();
    this.brainstorm = new BrainstormComponent();
    this.cluster = new ClusterComponent();
  }

  // --- 3. Canvas Workspace ---
  initCanvasWorkspace() {
    const container = document.getElementById('canvasWrap');
    const canvasEl = document.getElementById('mapCanvas');
    const svgLayer = document.getElementById('canvasEdgesLayer');
    const inkLayer = document.getElementById('canvasInkLayer');

    this.viewport = new Viewport(container, canvasEl);

    // Freehand & Smart Shape Manager
    this.freehandManager = new FreehandManager(
      inkLayer,
      this.viewport,
      (ink, clientX, clientY) => this.handleSelectInk(ink, clientX, clientY),
      (ink) => this.handleLinkEntity(ink, 'ink')
    );

    // Node Manager
    this.nodeManager = new NodeManager(
      canvasEl,
      this.viewport,
      (node, clientX, clientY) => this.handleSelectNode(node, clientX, clientY),
      (node) => this.handleLinkEntity(node, 'node')
    );

    // Edge Manager (supports both nodes & shapes)
    this.edgeManager = new EdgeManager(
      svgLayer,
      this.nodeManager,
      this.freehandManager,
      (edge, idx, clientX, clientY) => this.handleSelectEdge(edge, idx, clientX, clientY)
    );

    // Bracket Manager
    this.bracketManager = new BracketManager(
      canvasEl,
      this.viewport,
      (bracket, clientX, clientY) => this.handleSelectBracket(bracket, clientX, clientY)
    );

    // Wire node and shape movements to update edges immediately
    this.nodeManager.onNodeMove = () => {
      this.edgeManager.render();
    };
    this.freehandManager.onInkMove = () => {
      this.edgeManager.render();
    };

    // Canvas click to deselect
    canvasEl.addEventListener('click', () => {
      this.deselectAll();
    });

    // Toolbar controls
    this.initCanvasToolbar();

    // Render Initial Canvas State
    this.renderCanvas();

    store.subscribe((state, event) => {
      if ([
        'mindMapBuilt', 'nodeMoved', 'nodeEdited', 'nodeDeleted',
        'edgeAdded', 'edgeEdited', 'edgeDeleted', 'bracketAdded',
        'bracketMoved', 'bracketResized', 'bracketFlipped', 'bracketRotated', 'bracketDeleted',
        'inkAdded', 'inkMoved', 'inkFlipped', 'inkRotated', 'inkDeleted', 'snapshotRestored', 'allDataCleared'
      ].includes(event)) {
        this.renderCanvas();
      }
    });
  }

  renderCanvas() {
    this.nodeManager.render();
    this.edgeManager.render();
    this.bracketManager.render();
    this.freehandManager.render();
  }

  deselectAll() {
    store.state.selected = { type: null, id: null };
    store.state.linkStart = null;
    this.hideObjectPopup();
    this.renderCanvas();
  }

  // --- 4. Canvas Toolbar Controls ---
  initCanvasToolbar() {
    const addNodeBtn = document.getElementById('addNodeBtn');
    const freeDrawBtn = document.getElementById('freeDrawBtn');
    const smartDrawBtn = document.getElementById('smartDrawBtn');
    const shapeSelect = document.getElementById('shapeSelect');
    const linkModeBtn = document.getElementById('linkModeBtn');
    const connectorTypeSelect = document.getElementById('connectorTypeSelect');
    const addBracketBtn = document.getElementById('addBracketBtn');
    const bracketTypeSelect = document.getElementById('bracketTypeSelect');
    const undoBtn = document.getElementById('undoBtn');
    const redoBtn = document.getElementById('redoBtn');
    const zoomInBtn = document.getElementById('zoomInBtn');
    const zoomOutBtn = document.getElementById('zoomOutBtn');
    const resetViewBtn = document.getElementById('resetViewBtn');
    const exportPngBtn = document.getElementById('exportPngBtn');
    const printBtn = document.getElementById('printBtn');
    const linkVerbSelect = document.getElementById('linkVerbSelect');

    // Add node
    addNodeBtn.addEventListener('click', () => {
      store.saveSnapshot();
      const id = 'node_' + Date.now();
      const node = {
        id,
        text: 'New Idea',
        x: Math.round(-this.viewport.panX / this.viewport.scale + 300),
        y: Math.round(-this.viewport.panY / this.viewport.scale + 200),
        color: '#e0f2fe',
        borderColor: '#0284c7',
        kind: 'idea',
        shape: 'rounded'
      };
      store.state.canvas.nodes.push(node);
      store.state.selected = { type: 'node', id };
      store.notify('nodeAdded');
      this.renderCanvas();
    });

    // Free Draw
    freeDrawBtn.addEventListener('click', () => {
      const isFree = store.state.activeTool === 'free';
      this.setActiveTool(isFree ? 'pointer' : 'free');
    });

    // Smart Draw
    smartDrawBtn.addEventListener('click', () => {
      const isSmart = store.state.activeTool === 'smart';
      this.setActiveTool(isSmart ? 'pointer' : 'smart');
    });

    // Shape Select
    shapeSelect.addEventListener('change', () => {
      const val = shapeSelect.value;
      if (val) {
        this.freehandManager.setPendingShape(val);
        this.setActiveTool('shape');
        shapeSelect.value = '';
      }
    });

    // Link Mode
    linkModeBtn.addEventListener('click', () => {
      const isLink = store.state.activeTool === 'link';
      this.setActiveTool(isLink ? 'pointer' : 'link');
    });

    // Add Bracket
    addBracketBtn.addEventListener('click', () => {
      this.bracketManager.addBracket(bracketTypeSelect.value);
    });

    // Undo / Redo
    undoBtn.addEventListener('click', () => store.undo());
    redoBtn.addEventListener('click', () => store.redo());

    // Zoom & Pan
    zoomInBtn.addEventListener('click', () => this.viewport.zoomIn());
    zoomOutBtn.addEventListener('click', () => this.viewport.zoomOut());
    resetViewBtn.addEventListener('click', () => this.viewport.resetView());

    // Export & Print
    exportPngBtn.addEventListener('click', () => ExportManager.exportPNG());
    printBtn.addEventListener('click', () => ExportManager.printView());

    // Color Swatches
    document.querySelectorAll('.swatch-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const color = btn.dataset.color;
        const borderColor = btn.dataset.border;
        if (store.state.selected?.type === 'node') {
          const node = store.state.canvas.nodes.find(n => n.id === store.state.selected.id);
          if (node) {
            store.saveSnapshot();
            node.color = color;
            node.borderColor = borderColor;
            store.notify('nodeEdited');
            this.renderCanvas();
          }
        } else if (store.state.selected?.type === 'ink') {
          const ink = store.state.canvas.inkObjects.find(i => i.id === store.state.selected.id);
          if (ink) {
            store.saveSnapshot();
            ink.fill = color;
            ink.stroke = borderColor;
            store.notify('inkEdited');
            this.renderCanvas();
          }
        }
      });
    });

    // Link Verbs helper
    if (linkVerbSelect) {
      this.populateLinkVerbs();
      store.subscribe((state, event) => {
        if (['topicChanged', 'conceptChanged'].includes(event)) {
          this.populateLinkVerbs();
        }
      });
    }
  }

  populateLinkVerbs() {
    const linkVerbSelect = document.getElementById('linkVerbSelect');
    if (!linkVerbSelect) return;
    const { topic, concept } = store.state;
    const verbs = CURRICULUM[topic]?.concepts[concept]?.linkVerbs || [
      'leads to', 'transports', 'produces', 'causes', 'changes into', 'part of'
    ];
    linkVerbSelect.innerHTML = `<option value="">Choose linking verb...</option>`;
    verbs.forEach(v => {
      const opt = document.createElement('option');
      opt.value = v;
      opt.textContent = v;
      linkVerbSelect.appendChild(opt);
    });

    linkVerbSelect.onchange = () => {
      const verbInput = document.getElementById('linkVerbInput');
      if (verbInput && linkVerbSelect.value) {
        verbInput.value = linkVerbSelect.value;
      }
    };
  }

  setActiveTool(tool) {
    store.state.activeTool = tool;
    store.state.linkStart = null;

    const freeDrawBtn = document.getElementById('freeDrawBtn');
    const smartDrawBtn = document.getElementById('smartDrawBtn');
    const linkModeBtn = document.getElementById('linkModeBtn');
    const toolStatus = document.getElementById('canvasToolStatus');
    const inkLayer = document.getElementById('canvasInkLayer');
    const connectBanner = document.getElementById('canvasConnectBanner');
    const bannerText = document.getElementById('connectBannerText');

    freeDrawBtn.classList.toggle('btn-primary', tool === 'free');
    smartDrawBtn.classList.toggle('btn-primary', tool === 'smart');
    linkModeBtn.classList.toggle('btn-primary', tool === 'link');

    inkLayer.classList.toggle('is-drawing', ['free', 'smart', 'shape'].includes(tool));

    if (connectBanner) {
      if (tool === 'link') {
        connectBanner.classList.remove('hidden');
        if (bannerText) bannerText.innerHTML = 'Click the <b>1st idea</b>, then click the <b>2nd idea</b> to connect them.';
      } else {
        connectBanner.classList.add('hidden');
      }
    }

    if (tool === 'free') {
      toolStatus.innerHTML = '✏️ <b>Free Draw:</b> Sketch hand-drawn diagrams anywhere on canvas.';
    } else if (tool === 'smart') {
      toolStatus.innerHTML = '✨ <b>Smart Draw:</b> Draw a rough circle, box, triangle, or arrow. It snaps into a clean shape!';
    } else if (tool === 'shape') {
      if (this.freehandManager.pendingShape === 'textbox') {
        toolStatus.innerHTML = '🔤 <b>Text Box:</b> Click anywhere or drag on canvas to place a text box note.';
      } else {
        toolStatus.innerHTML = '▱ <b>Shape Tool:</b> Click anywhere or drag on canvas to place your shape.';
      }
    } else if (tool === 'link') {
      toolStatus.innerHTML = '🔗 <b>Connector Mode:</b> Click the 1st node, then click the 2nd node to connect them.';
    } else {
      toolStatus.innerHTML = '👆 <b>Select Mode:</b> Click any object to move, edit, or customize. Hold <kbd>Space</kbd> to pan.';
    }

    this.renderCanvas();
  }

  updateUndoRedoButtons() {
    const undoBtn = document.getElementById('undoBtn');
    const redoBtn = document.getElementById('redoBtn');
    if (undoBtn) undoBtn.disabled = !store.history.canUndo();
    if (redoBtn) redoBtn.disabled = !store.history.canRedo();
  }

  // --- 5. Selection & Floating Context Popup ---
  initObjectPopup() {
    this.popup = document.getElementById('canvasObjectPopup');
    this.popConnect = document.getElementById('popConnectBtn');
    this.popEdit = document.getElementById('popEditBtn');
    this.popFlipH = document.getElementById('popFlipHBtn');
    this.popFlipV = document.getElementById('popFlipVBtn');
    this.popRotate = document.getElementById('popRotateBtn');
    this.popReverse = document.getElementById('popReverseBtn');
    this.popDelete = document.getElementById('popDeleteBtn');

    if (this.popConnect) {
      this.popConnect.onclick = () => {
        if (store.state.selected?.type === 'node') {
          const node = store.state.canvas.nodes.find(n => n.id === store.state.selected.id);
          if (node) {
            this.hideObjectPopup();
            this.setActiveTool('link');
            this.handleLinkEntity(node, 'node');
          }
        } else if (store.state.selected?.type === 'ink') {
          const ink = store.state.canvas.inkObjects.find(i => i.id === store.state.selected.id);
          if (ink) {
            this.hideObjectPopup();
            this.setActiveTool('link');
            this.handleLinkEntity(ink, 'ink');
          }
        }
      };
    }

    const cancelConnectBtn = document.getElementById('cancelConnectBtn');
    if (cancelConnectBtn) {
      cancelConnectBtn.onclick = () => this.setActiveTool('pointer');
    }

    this.popDelete.onclick = () => this.handleDeleteSelected();
    this.popFlipH.onclick = () => this.handleFlipSelected('h');
    this.popFlipV.onclick = () => this.handleFlipSelected('v');
    if (this.popRotate) this.popRotate.onclick = () => this.handleRotateSelected();
    this.popReverse.onclick = () => this.handleReverseEdge();
    this.popEdit.onclick = () => this.handleEditSelected();
  }

  showPopup(type, clientX, clientY) {
    const wrap = document.getElementById('canvasWrap');
    const rect = wrap.getBoundingClientRect();
    const x = Math.max(12, Math.min(clientX - rect.left + 15, rect.width - 240));
    const y = Math.max(12, Math.min(clientY - rect.top - 45, rect.height - 60));

    this.popup.style.left = `${x}px`;
    this.popup.style.top = `${y}px`;

    if (this.popConnect) this.popConnect.classList.toggle('hidden', !['node', 'ink'].includes(type));
    this.popEdit.classList.toggle('hidden', !['node', 'edge', 'ink'].includes(type));
    this.popFlipH.classList.toggle('hidden', !['ink', 'bracket'].includes(type));
    this.popFlipV.classList.toggle('hidden', !['ink', 'bracket'].includes(type));
    if (this.popRotate) this.popRotate.classList.toggle('hidden', !['ink', 'bracket'].includes(type));
    this.popReverse.classList.toggle('hidden', type !== 'edge');

    this.popup.classList.remove('hidden');
  }

  hideObjectPopup() {
    if (this.popup) this.popup.classList.add('hidden');
  }

  handleSelectNode(node, clientX, clientY) {
    store.state.selected = { type: 'node', id: node.id };
    this.showPopup('node', clientX, clientY);
    this.renderCanvas();
  }

  handleSelectEdge(edge, idx, clientX, clientY) {
    store.state.selected = { type: 'edge', id: edge.id || `edge_${idx}` };
    this.showPopup('edge', clientX, clientY);
    this.renderCanvas();
  }

  handleSelectBracket(bracket, clientX, clientY) {
    store.state.selected = { type: 'bracket', id: bracket.id };
    this.showPopup('bracket', clientX, clientY);
    this.renderCanvas();
  }

  handleSelectInk(ink, clientX, clientY) {
    store.state.selected = { type: 'ink', id: ink.id };
    this.showPopup('ink', clientX, clientY);
    this.renderCanvas();
  }

  handleLinkEntity(entity, type = 'node') {
    const connectBanner = document.getElementById('canvasConnectBanner');
    const bannerText = document.getElementById('connectBannerText');
    const name = entity.text || (type === 'node' ? 'Idea Node' : (entity.kind || 'Shape'));

    if (!store.state.linkStart) {
      store.state.linkStart = entity.id;
      if (connectBanner) connectBanner.classList.remove('hidden');
      if (bannerText) {
        bannerText.innerHTML = `Starting from "<b>${name}</b>" ➔ Now click any idea or shape to connect!`;
      }
      const toolStatus = document.getElementById('canvasToolStatus');
      if (toolStatus) {
        toolStatus.innerHTML = `🔗 First element selected (<b>${name}</b>). Now click the destination node or shape...`;
      }
      this.renderCanvas();
    } else if (store.state.linkStart !== entity.id) {
      store.saveSnapshot();
      const verbInput = document.getElementById('linkVerbInput');
      const connectorTypeSelect = document.getElementById('connectorTypeSelect');
      const label = verbInput ? verbInput.value.trim() : '';
      const cType = connectorTypeSelect ? connectorTypeSelect.value : 'curved';

      store.state.canvas.edges.push({
        id: 'edge_' + Date.now(),
        a: store.state.linkStart,
        b: entity.id,
        label,
        type: cType,
        color: '#64748b'
      });

      store.state.linkStart = null;
      this.setActiveTool('pointer');
      store.notify('edgeAdded');
      this.renderCanvas();
    }
  }

  handleDeleteSelected() {
    const { type, id } = store.state.selected;
    if (type === 'node') {
      this.nodeManager.deleteNode(id);
    } else if (type === 'edge') {
      store.saveSnapshot();
      store.state.canvas.edges = store.state.canvas.edges.filter((e, idx) => e.id !== id && `edge_${idx}` !== id);
      store.notify('edgeDeleted');
    } else if (type === 'bracket') {
      this.bracketManager.deleteBracket(id);
    } else if (type === 'ink') {
      this.freehandManager.deleteInk(id);
    }
    this.deselectAll();
  }

  handleFlipSelected(axis) {
    const { type, id } = store.state.selected;
    if (type === 'bracket') {
      this.bracketManager.flip(id, axis);
    } else if (type === 'ink') {
      this.freehandManager.flip(id, axis);
    }
  }

  handleRotateSelected() {
    const { type, id } = store.state.selected;
    if (type === 'ink') {
      this.freehandManager.rotate(id, 45);
    } else if (type === 'bracket') {
      this.bracketManager.rotate(id, 45);
    }
  }

  handleReverseEdge() {
    const { type, id } = store.state.selected;
    if (type === 'edge') {
      const edge = store.state.canvas.edges.find((e, idx) => e.id === id || `edge_${idx}` === id);
      if (edge) {
        store.saveSnapshot();
        const temp = edge.a;
        edge.a = edge.b;
        edge.b = temp;
        store.notify('edgeEdited');
        this.renderCanvas();
      }
    }
  }

  async handleEditSelected() {
    const { type, id } = store.state.selected;
    if (type === 'node') {
      const node = store.state.canvas.nodes.find(n => n.id === id);
      if (node) this.nodeManager.editNode(node);
    } else if (type === 'edge') {
      const edge = store.state.canvas.edges.find((e, idx) => e.id === id || `edge_${idx}` === id);
      if (edge) {
        const newLabel = await modal.prompt(
          'Edit Connector Verb',
          'Describe the relationship between these two ideas (e.g. "loses heat to become", "transports"):',
          edge.label || '',
          'Enter verb phrase...'
        );
        if (newLabel !== null) {
          store.saveSnapshot();
          edge.label = newLabel.trim();
          store.notify('edgeEdited');
          this.renderCanvas();
        }
      }
    } else if (type === 'ink') {
      const ink = store.state.canvas.inkObjects.find(i => i.id === id);
      if (ink) this.freehandManager.onEditInkText(ink);
    }
  }

  // --- 6. Global Shortcuts & Header Controls ---
  initKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      // Ignore if typing in text inputs
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) store.redo();
        else store.undo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        store.redo();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (store.state.selected.id) {
          e.preventDefault();
          this.handleDeleteSelected();
        }
      } else if (e.key === 'Escape') {
        this.setActiveTool('pointer');
        this.deselectAll();
      }
    });
  }

  initHeaderControls() {
    const resetAllBtn = document.getElementById('resetAllProjectBtn');
    if (resetAllBtn) {
      resetAllBtn.addEventListener('click', async () => {
        const ok = await modal.confirm(
          'Start Fresh?',
          'Are you sure you want to clear your brainstorm, clusters, and mind map to start fresh on a new topic?'
        );
        if (ok) {
          store.clearAllData();
          this.wizard.goToStep(1);
        }
      });
    }
  }
}

// Instantiate on DOM load
window.addEventListener('DOMContentLoaded', () => {
  new MindMapperApp();
});
