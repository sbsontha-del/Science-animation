// Standalone Primary Science Magnet Lab Controller
// Curriculum Aligned to Chapter 6: Properties of Magnets (Activities 6.1 - 6.4)

class MagnetSimulation {
  constructor(containerId, appInstance) {
    this.container = document.getElementById(containerId);
    this.canvas = document.getElementById('workspace-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.app = appInstance;
    
    this.objects = [];
    this.selectedObjects = [];
    this.draggedObject = null;
    this.dragStartOffset = { x: 0, y: 0 };
    
    // Physics constants
    this.attractThreshold = 120;
    this.repelThreshold = 100;
    this.materialAttractThreshold = 100;
    this.snapDistance = 35;
    
    // State variables
    this.showFieldLines = false;
    this.showRuler = false;
    this.isMuted = false;
    this.activeInvestigation = 'gi1';
    this.unlockedActivities = { gi1: true, gi2: false, gi3: false, gi4: false, gi5: false, gi6: false, free: false };
    this.barrierType = 'none';
    this.history = [];
    this.maxHistory = 20;

    // Tested materials record table state
    this.testedMaterials = {};
    
    // Audio synthesis
    this.audioCtx = null;
    
    // 7 challenge achievements flags
    this.completedChallenges = [false, false, false, false, false, false, false];
    
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
    
    this.initEvents();
    this.render();
  }

  resizeCanvas() {
    if (!this.canvas || !this.container) return;
    const rect = this.container.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
  }

  // --- AUDIO SYNTHESIS ---
  initAudio() {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  playSound(type) {
    if (this.isMuted) return;
    try {
      this.initAudio();
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      if (type === 'attract') {
        // High click sound
        const oscClick = this.audioCtx.createOscillator();
        const gainClick = this.audioCtx.createGain();
        oscClick.type = 'sine';
        oscClick.frequency.setValueAtTime(2200, this.audioCtx.currentTime);
        gainClick.gain.setValueAtTime(0.12, this.audioCtx.currentTime);
        gainClick.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.02);
        oscClick.connect(gainClick);
        gainClick.connect(this.audioCtx.destination);
        oscClick.start();
        oscClick.stop(this.audioCtx.currentTime + 0.02);

        // Clink resonance
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(180, this.audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(750, this.audioCtx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.12, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.1);
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start();
        osc.stop(this.audioCtx.currentTime + 0.1);
      } else if (type === 'repel') {
        // Deep sliding rumble
        const oscSlide = this.audioCtx.createOscillator();
        const gainSlide = this.audioCtx.createGain();
        oscSlide.type = 'sawtooth';
        oscSlide.frequency.setValueAtTime(260, this.audioCtx.currentTime);
        oscSlide.frequency.linearRampToValueAtTime(80, this.audioCtx.currentTime + 0.22);
        gainSlide.gain.setValueAtTime(0.06, this.audioCtx.currentTime);
        gainSlide.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.22);
        oscSlide.connect(gainSlide);
        gainSlide.connect(this.audioCtx.destination);
        oscSlide.start();
        oscSlide.stop(this.audioCtx.currentTime + 0.22);

        // Low force hum
        osc.type = 'sine';
        osc.frequency.setValueAtTime(90, this.audioCtx.currentTime);
        gain.gain.setValueAtTime(0.12, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.22);
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start();
        osc.stop(this.audioCtx.currentTime + 0.22);
      } else if (type === 'click') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(950, this.audioCtx.currentTime);
        gain.gain.setValueAtTime(0.03, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.04);
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start();
        osc.stop(this.audioCtx.currentTime + 0.04);
      } else if (type === 'success') {
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        notes.forEach((freq, i) => {
          const o = this.audioCtx.createOscillator();
          const g = this.audioCtx.createGain();
          o.type = 'triangle';
          o.frequency.setValueAtTime(freq, this.audioCtx.currentTime + i * 0.08);
          g.gain.setValueAtTime(0.06, this.audioCtx.currentTime + i * 0.08);
          g.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + i * 0.08 + 0.22);
          o.connect(g);
          g.connect(this.audioCtx.destination);
          o.start(this.audioCtx.currentTime + i * 0.08);
          o.stop(this.audioCtx.currentTime + i * 0.08 + 0.22);
        });
      }
    } catch (e) {
      console.warn("Sound failed", e);
    }
  }

  // --- STATE HISTORY CONTROL ---
  saveHistory() {
    const stateStr = JSON.stringify(this.objects.map(o => ({
      id: o.id,
      type: o.type,
      subType: o.subType,
      x: o.x,
      y: o.y,
      angle: o.angle,
      name: o.name,
      isMagnetic: o.isMagnetic,
      velY: o.velY || 0,
      springAngle: o.springAngle || 0,
      velAngle: o.velAngle || 0
    })));
    
    if (this.history.length === 0 || this.history[this.history.length - 1] !== stateStr) {
      this.history.push(stateStr);
      if (this.history.length > this.maxHistory) {
        this.history.shift();
      }
    }
    
    const undoBtn = document.getElementById('control-undo-btn');
    if (undoBtn) undoBtn.disabled = this.history.length <= 1;
  }

  undo() {
    this.playSound('click');
    if (this.history.length > 1) {
      this.history.pop();
      const prevState = JSON.parse(this.history[this.history.length - 1]);
      
      const domObjects = this.container.querySelectorAll('.workspace-element');
      domObjects.forEach(el => el.remove());
      
      this.objects = [];
      this.selectedObjects = [];
      this.hideInspector();
      
      prevState.forEach(o => {
        const added = this.addObject(o.type, o.subType, o.x, o.y, o.angle, false);
        if (added) {
          added.id = o.id;
          if (added.element) added.element.id = o.id;
          added.velY = o.velY || 0;
          added.springAngle = o.springAngle || 0;
          added.velAngle = o.velAngle || 0;
        }
      });
      
      const undoBtn = document.getElementById('control-undo-btn');
      if (undoBtn) undoBtn.disabled = this.history.length <= 1;
    }
  }

  // --- OBJECT LIFECYCLE ---
  addObject(type, subType, x, y, angle = 0, triggerHistory = true) {
    const id = 'obj_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    
    let width = 120;
    let height = 40;
    let name = '';
    let isMagnetic = false;
    let emoji = '';
    
    if (type === 'magnet') {
      if (subType === 'bar') {
        width = 140;
        height = 40;
        name = 'Bar Magnet';
      } else if (subType === 'button') {
        width = 70;
        height = 70;
        name = 'Button Magnet';
      } else if (subType === 'ring') {
        width = 120;
        height = 32;
        name = 'Ring Magnet';
      } else if (subType === 'rod') {
        width = 120;
        height = 36;
        name = 'Rod Magnet';
      } else if (subType === 'ushaped') {
        width = 100;
        height = 90;
        name = 'U-shaped Magnet';
      }
    } else if (type === 'material') {
      width = 50;
      height = 50;
      const matInfo = this.getMaterialInfo(subType);
      name = matInfo.name;
      isMagnetic = matInfo.isMagnetic;
      emoji = matInfo.emoji;
    } else if (type === 'mystery') {
      width = 130;
      height = 40;
      isMagnetic = (subType === 'mystery_a' || subType === 'mystery_c');
      if (subType === 'mystery_a') {
        name = 'Mystery Object A';
      } else if (subType === 'mystery_b') {
        name = 'Mystery Object B';
      } else {
        name = 'Mystery Object C';
      }
    }
    
    const rect = this.container.getBoundingClientRect();
    if (x === undefined || y === undefined) {
      x = rect.width / 2 + (Math.random() - 0.5) * 60;
      y = rect.height / 2 + (Math.random() - 0.5) * 60;
      
      // Floating ring stand constraint spawning
      if (this.activeInvestigation === 'gi4' && subType === 'ring') {
        x = rect.width / 2;
        const count = this.objects.filter(o => o.subType === 'ring').length;
        if (count >= 4) {
          alert('Maximum 4 ring magnets on the stand!');
          return;
        }
        y = rect.height - 80 - count * 50;
      }
      
      // Hanging stand constraint spawning
      if (this.activeInvestigation === 'gi6' && subType === 'bar') {
        x = rect.width / 2;
        y = 168; // Anchored directly below hook
        angle = 90; // Face horizontal
      }
    }
    
    const obj = {
      id,
      type,
      subType,
      x,
      y,
      angle,
      width,
      height,
      name,
      isMagnetic,
      emoji,
      element: null,
      velY: 0,
      springAngle: angle,
      velAngle: 0
    };
    
    this.createDOMElement(obj);
    this.objects.push(obj);
    
    if (triggerHistory) {
      this.saveHistory();
    }
    
    // Log tested material inside table state
    if (type === 'material' && !this.testedMaterials[subType]) {
      this.testedMaterials[subType] = {
        name: name,
        prediction: '',
        observation: '',
        conclusion: '',
        isMagnetic: isMagnetic,
        emoji: emoji
      };
      this.updateRecordTable();
    }
    
    this.selectObject(obj);
    this.playSound('click');
    return obj;
  }

  getMaterialInfo(subType) {
    const materials = {
      iron_nail: { name: 'Iron Nail', isMagnetic: true, emoji: '📌' },
      steel_paperclip: { name: 'Steel Paper Clip', isMagnetic: true, emoji: '📎' },
      steel_screw: { name: 'Steel Screw', isMagnetic: true, emoji: '🔩' },
      steel_washer: { name: 'Steel Washer', isMagnetic: true, emoji: '⭕' },
      steel_safety_pin: { name: 'Steel Safety Pin', isMagnetic: true, emoji: '🧷' },
      steel_can: { name: 'Steel Can', isMagnetic: true, emoji: '🥫' },
      wooden_stick: { name: 'Wooden Block', isMagnetic: false, emoji: '🥢' },
      plastic_spoon: { name: 'Plastic Spoon', isMagnetic: false, emoji: '🥄' },
      rubber_eraser: { name: 'Rubber Eraser', isMagnetic: false, emoji: '🧼' },
      aluminium_foil: { name: 'Aluminium Strip', isMagnetic: false, emoji: '🪞' },
      copper_coin: { name: 'Copper Coin', isMagnetic: false, emoji: '🪙' },
      glass_marble: { name: 'Glass Marble', isMagnetic: false, emoji: '🔮' },
      paper: { name: 'Paper Sheet', isMagnetic: false, emoji: '📄' },
      fabric: { name: 'Fabric Strip', isMagnetic: false, emoji: '👕' },
      ceramic_tile: { name: 'Ceramic Tile', isMagnetic: false, emoji: '🧱' }
    };
    return materials[subType] || { name: 'Unknown Block', isMagnetic: false, emoji: '📦' };
  }

  createDOMElement(obj) {
    const el = document.createElement('div');
    el.id = obj.id;
    el.className = `workspace-element element-${obj.type} type-${obj.subType}`;
    el.style.width = `${obj.width}px`;
    el.style.height = `${obj.height}px`;
    el.style.left = `${obj.x - obj.width / 2}px`;
    el.style.top = `${obj.y - obj.height / 2}px`;
    el.style.transform = `rotate(${obj.angle}deg)`;
    
    if (obj.type === 'magnet') {
      if (obj.subType === 'bar') {
        el.innerHTML = `
          <div class="bar-magnet-inner">
            <div class="pole-n">N</div>
            <div class="pole-s">S</div>
          </div>
        `;
      } else if (obj.subType === 'button') {
        el.innerHTML = `
          <div class="button-magnet-inner">
            <div class="pole-n">N</div>
            <div class="pole-s">S</div>
          </div>
        `;
      } else if (obj.subType === 'ring') {
        el.innerHTML = `
          <div class="ring-magnet-inner">
            <div class="pole-n">N</div>
            <div class="ring-hole"></div>
            <div class="pole-s">S</div>
            <div class="ring-rod-overlay"></div>
          </div>
        `;
      } else if (obj.subType === 'rod') {
        el.innerHTML = `
          <div class="rod-magnet-inner">
            <div class="pole-n">N</div>
            <div class="pole-s">S</div>
          </div>
        `;
      } else if (obj.subType === 'ushaped') {
        el.innerHTML = `
          <svg viewBox="0 0 100 90" class="ushaped-svg">
            <path d="M 15 10 L 15 70 L 85 70 L 85 10 L 60 10 L 60 45 L 40 45 L 40 10 Z" fill="#94a3b8" />
            <path d="M 15 10 L 15 45 L 40 45 L 40 10 Z" fill="#f43f5e" />
            <path d="M 85 10 L 85 45 L 60 45 L 60 10 Z" fill="#3b82f6" />
          </svg>
          <div class="ushaped-labels">
            <span style="left: 21px; top: 12px;">N</span>
            <span style="right: 21px; top: 12px;">S</span>
          </div>
        `;
      }
    } else if (obj.type === 'mystery') {
      const casingLabel = obj.subType === 'mystery_a' ? 'A' : (obj.subType === 'mystery_b' ? 'B' : 'C');
      el.innerHTML = `
        <div class="bar-magnet-inner" style="background:#e2e8f0; border:2px solid #cbd5e1; justify-content:center; align-items:center; font-weight:800; font-size:1.3rem; color:#475569;">
          Object ${casingLabel}
        </div>
      `;
    } else {
      el.innerHTML = `
        <div class="material-inner">
          <div class="material-emoji">${obj.emoji}</div>
          <div class="material-lbl">${obj.name}</div>
        </div>
      `;
    }
    
    this.container.appendChild(el);
    obj.element = el;
    
    el.addEventListener('pointerdown', (e) => this.onPointerDown(e, obj));
  }

  // --- DRAG CONTROLS ---
  onPointerDown(e, obj) {
    e.preventDefault();
    e.stopPropagation();
    
    this.initAudio();
    
    // String suspended swing displacement
    if (this.activeInvestigation === 'gi6' && obj.subType === 'bar') {
      obj.isSwinging = true;
    }
    
    if (e.shiftKey) {
      if (this.selectedObjects.includes(obj)) {
        this.deselectObject(obj);
      } else {
        this.selectObject(obj, true);
      }
      return;
    }
    
    if (!this.selectedObjects.includes(obj)) {
      this.selectObject(obj, false);
    }
    
    this.draggedObject = obj;
    
    const rect = this.container.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    this.dragStartOffset = {
      x: mouseX - obj.x,
      y: mouseY - obj.y
    };
    
    this.selectedObjects.forEach(o => {
      o.dragStartPos = { x: o.x, y: o.y };
    });
    
    document.addEventListener('pointermove', this.onPointerMoveBound);
    document.addEventListener('pointerup', this.onPointerUpBound);
  }

  onPointerMove(e) {
    if (!this.draggedObject) return;
    
    const rect = this.container.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    let newX = mouseX - this.dragStartOffset.x;
    let newY = mouseY - this.dragStartOffset.y;
    
    // Bounds check
    newX = Math.max(this.draggedObject.width / 2, Math.min(rect.width - this.draggedObject.width / 2, newX));
    newY = Math.max(this.draggedObject.height / 2, Math.min(rect.height - this.draggedObject.height / 2, newY));
    
    // Constrained Workbench Physics
    if (this.activeInvestigation === 'gi4' && this.draggedObject.subType === 'ring') {
      // Locked horizontally to stand center
      newX = rect.width / 2;
      newY = Math.max(80, Math.min(rect.height - 40, newY));
    }
    
    if (this.activeInvestigation === 'gi6' && this.draggedObject.subType === 'bar') {
      // Locked horizontally/vertically to hanging swing radius
      newX = rect.width / 2 + Math.max(-50, Math.min(50, newX - rect.width/2));
      newY = 168; // Anchored
      
      // Calculate drag rotation deflection angle
      const dx = mouseX - rect.width / 2;
      const angleDeg = 90 + (dx * 0.4);
      this.draggedObject.angle = angleDeg;
      this.draggedObject.springAngle = angleDeg;
    }
    
    const dx = newX - this.draggedObject.x;
    const dy = newY - this.draggedObject.y;
    
    this.selectedObjects.forEach(o => {
      if (o === this.draggedObject) {
        o.x = newX;
        o.y = newY;
      } else {
        // Multi-select relative dragging
        if (this.activeInvestigation !== 'gi4' && this.activeInvestigation !== 'gi6') {
          o.x = Math.max(o.width / 2, Math.min(rect.width - o.width / 2, o.dragStartPos.x + dx));
          o.y = Math.max(o.height / 2, Math.min(rect.height - o.height / 2, o.dragStartPos.y + dy));
        }
      }
      this.updateDOMPosition(o);
    });
    
    this.solvePhysics(true);
    this.updateInspectorPosition();
  }

  onPointerUp(e) {
    document.removeEventListener('pointermove', this.onPointerMoveBound);
    document.removeEventListener('pointerup', this.onPointerUpBound);
    
    if (this.draggedObject) {
      if (this.activeInvestigation === 'gi6' && this.draggedObject.subType === 'bar') {
        this.draggedObject.isSwinging = false;
      }
      this.saveHistory();
      this.solvePhysics(false);
      this.draggedObject = null;
    }
  }

  updateDOMPosition(obj) {
    if (!obj.element) return;
    obj.element.style.left = `${obj.x - obj.width / 2}px`;
    obj.element.style.top = `${obj.y - obj.height / 2}px`;
    if (obj.subType === 'ring') {
      // Rings are flat ovals — never visually rotate them (it tilts the oval)
      // Flipped state is shown via CSS class toggling pole colors and updating labels
      obj.element.style.transform = '';
      const poleN = obj.element.querySelector('.pole-n');
      const poleS = obj.element.querySelector('.pole-s');
      if (obj.angle === 180) {
        obj.element.classList.add('ring-flipped');
        if (poleN) poleN.textContent = 'S';
        if (poleS) poleS.textContent = 'N';
      } else {
        obj.element.classList.remove('ring-flipped');
        if (poleN) poleN.textContent = 'N';
        if (poleS) poleS.textContent = 'S';
      }
    } else {
      obj.element.style.transform = `rotate(${obj.angle}deg)`;
    }
  }

  selectObject(obj, append = false) {
    if (!append) {
      this.selectedObjects.forEach(o => {
        if (o.element) o.element.classList.remove('selected');
      });
      this.selectedObjects = [obj];
    } else {
      if (!this.selectedObjects.includes(obj)) {
        this.selectedObjects.push(obj);
      }
    }
    
    if (obj.element) obj.element.classList.add('selected');
    
    this.showInspector();
    this.updateInspectorPosition();
    this.updateObjectTesterPanel(obj);
  }

  deselectObject(obj) {
    this.selectedObjects = this.selectedObjects.filter(o => o !== obj);
    if (obj.element) obj.element.classList.remove('selected');
    
    if (this.selectedObjects.length === 0) {
      this.hideInspector();
      this.resetObjectTesterPanel();
    } else {
      this.updateInspectorPosition();
      this.updateObjectTesterPanel(this.selectedObjects[0]);
    }
  }

  deselectAll() {
    this.selectedObjects.forEach(o => {
      if (o.element) o.element.classList.remove('selected');
    });
    this.selectedObjects = [];
    this.hideInspector();
    this.resetObjectTesterPanel();
  }

  // --- FLOATING INSPECTOR CONTROL ---
  showInspector() {
    // Disable rotation / duplication in constrained setups
    const rotateLeft = document.getElementById('inspect-rotate-left');
    const rotateRight = document.getElementById('inspect-rotate-right');
    const copyBtn = document.getElementById('inspect-copy');
    const flipBtn = document.getElementById('inspect-flip-ring');

    if (this.activeInvestigation === 'gi4' || this.activeInvestigation === 'gi6') {
      if (rotateLeft) rotateLeft.classList.add('hidden');
      if (rotateRight) rotateRight.classList.add('hidden');
      if (copyBtn) copyBtn.classList.add('hidden');
    } else {
      if (rotateLeft) rotateLeft.classList.remove('hidden');
      if (rotateRight) rotateRight.classList.remove('hidden');
      if (copyBtn) copyBtn.classList.remove('hidden');
    }

    // Show Flip button only for ring magnets in gi4
    if (flipBtn) {
      const isRingInGi4 = this.activeInvestigation === 'gi4' &&
        this.selectedObjects.length === 1 &&
        this.selectedObjects[0].subType === 'ring';
      if (isRingInGi4) {
        flipBtn.classList.remove('hidden');
      } else {
        flipBtn.classList.add('hidden');
      }
    }

    const inspector = document.getElementById('workspace-inspector');
    if (inspector) inspector.classList.remove('hidden');
  }

  hideInspector() {
    const inspector = document.getElementById('workspace-inspector');
    if (inspector) inspector.classList.add('hidden');
  }

  updateInspectorPosition() {
    const inspector = document.getElementById('workspace-inspector');
    if (!inspector || this.selectedObjects.length === 0) return;
    
    const primary = this.selectedObjects[0];
    const inspectorName = document.getElementById('inspector-name');
    if (inspectorName) {
      if (this.selectedObjects.length > 1) {
        inspectorName.textContent = `Selected: ${this.selectedObjects.length} items`;
      } else {
        inspectorName.textContent = `Selected: ${primary.name}`;
      }
    }
    
    let avgX = 0;
    let avgY = 0;
    this.selectedObjects.forEach(o => {
      avgX += o.x;
      avgY += o.y;
    });
    avgX /= this.selectedObjects.length;
    avgY /= this.selectedObjects.length;
    
    let maxH = 0;
    this.selectedObjects.forEach(o => {
      if (o.height > maxH) maxH = o.height;
    });
    
    inspector.style.left = `${avgX}px`;
    inspector.style.top = `${avgY + maxH / 2 + 15}px`;
  }

  // --- POLES POSITION CALCULATOR ---
  getPoles(obj) {
    const rad = (obj.angle * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    
    if (obj.type !== 'magnet') return null;
    
    if (obj.subType === 'bar' || obj.subType === 'rod') {
      const len = obj.width / 2 - 12;
      return {
        N: { x: obj.x - len * cos, y: obj.y - len * sin },
        S: { x: obj.x + len * cos, y: obj.y + len * sin }
      };
    } else if (obj.subType === 'button' || obj.subType === 'ring') {
      // Button / Ring have flat faces, mapped horizontally in 2D
      const r = obj.width / 2 - 6;
      return {
        N: { x: obj.x - r * cos, y: obj.y - r * sin },
        S: { x: obj.x + r * cos, y: obj.y + r * sin }
      };
    } else if (obj.subType === 'ushaped') {
      // Parallel legs tips
      const tipLen = obj.width / 4;
      const separation = obj.height / 2 - 12;
      const nLocalX = -tipLen;
      const nLocalY = -separation;
      const sLocalX = tipLen;
      const sLocalY = -separation;
      
      return {
        N: {
          x: obj.x + nLocalX * cos - nLocalY * sin,
          y: obj.y + nLocalX * sin + nLocalY * cos
        },
        S: {
          x: obj.x + sLocalX * cos - sLocalY * sin,
          y: obj.y + sLocalX * sin + sLocalY * cos
        }
      };
    }
    return null;
  }

  getDist(p1, p2) {
    if (!p1 || !p2) return Infinity;
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  updateGI2SidebarBadge(subType, status) {
    const btn = document.querySelector(`#gi2-materials-selector button[data-sub="${subType}"]`);
    if (!btn) return;
    const badge = btn.querySelector('.gi2-status-badge');
    if (!badge) return;
    
    if (status === 'Attracted') {
      badge.textContent = "🧲 Attracted";
      badge.className = "gi2-status-badge font-bold uppercase text-[9px] bg-emerald-100 text-emerald-700 py-0.5 px-1.5 rounded-full border border-emerald-200";
    } else if (status === 'Not attracted') {
      badge.textContent = "❌ No Reaction";
      badge.className = "gi2-status-badge font-bold uppercase text-[9px] bg-slate-100 text-slate-500 py-0.5 px-1.5 rounded-full border border-slate-200";
    } else if (status === 'Testing') {
      badge.textContent = "Testing";
      badge.className = "gi2-status-badge font-bold uppercase text-[9px] bg-violet-100 text-violet-700 py-0.5 px-1.5 rounded-full border border-violet-200";
    } else {
      badge.textContent = "Select";
      badge.className = "gi2-status-badge text-slate-400 font-semibold uppercase text-[9px] bg-slate-50 py-0.5 px-1.5 rounded border border-slate-100";
    }
  }

  // --- DYNAMIC PHYSICS SOLVER ---
  solvePhysics(isDragging) {
    try {
      let alertText = "";
      let alertVisible = false;
      
      const magnets = this.objects.filter(o => o.type === 'magnet');
      
      // 1. Stand Floating Constraint Solver (Experiment 4)
      if (this.activeInvestigation === 'gi4') {
        this.solveFloatingRings(isDragging);
        return;
      }
      
      // Magnet vs Mystery casings (Experiment 5)
      if (this.activeInvestigation === 'gi5') {
        this.solveMysteryCasings(isDragging);
        return;
      }

      // Magnet to Magnet Interactions
      for (let i = 0; i < magnets.length; i++) {
        for (let j = i + 1; j < magnets.length; j++) {
          const magA = magnets[i];
          const magB = magnets[j];
          
          if (magA === this.draggedObject && this.selectedObjects.includes(magB)) continue;
          if (magB === this.draggedObject && this.selectedObjects.includes(magA)) continue;
          
          const polesA = this.getPoles(magA);
          const polesB = this.getPoles(magB);
          if (!polesA || !polesB) continue;
          
          const d_NN = this.getDist(polesA.N, polesB.N);
          const d_SS = this.getDist(polesA.S, polesB.S);
          const d_NS = this.getDist(polesA.N, polesB.S);
          const d_SN = this.getDist(polesA.S, polesB.N);
          
          const minDist = Math.min(d_NN, d_SS, d_NS, d_SN);
          
          // Hysteresis clearance resets
          if (minDist > this.snapDistance + 10) {
            if (magA.lockedTo === magB.id) magA.lockedTo = null;
            if (magB.lockedTo === magA.id) magB.lockedTo = null;
          }
          if (minDist > this.repelThreshold + 10) {
            if (magA.repelledBy === magB.id) magA.repelledBy = null;
            if (magB.repelledBy === magA.id) magB.repelledBy = null;
          }
          
          if (minDist === d_NS || minDist === d_SN) {
            if (minDist < this.attractThreshold) {
              const isNS = minDist === d_NS;
              const poleA = isNS ? polesA.N : polesA.S;
              const poleB = isNS ? polesB.S : polesB.N;
              
              alertText = "Unlike poles attract.";
              alertVisible = true;
              
              if (minDist < this.snapDistance) {
                if (!isDragging) {
                  // Snapping lock - make poles touch exactly and play sound once
                  const wasLocked = magA.lockedTo === magB.id || magB.lockedTo === magA.id;
                  if (!wasLocked) {
                    this.playSound('attract');
                    magA.lockedTo = magB.id;
                    magB.lockedTo = magA.id;
                    this.triggerChallengeUnlock(1, "Unlike Poles Attract");
                  }
                  
                  // Offset vectors from centers
                  const offsetAN = { x: polesA.N.x - magA.x, y: polesA.N.y - magA.y };
                  const offsetAS = { x: polesA.S.x - magA.x, y: polesA.S.y - magA.y };
                  const offsetBN = { x: polesB.N.x - magB.x, y: polesB.N.y - magB.y };
                  const offsetBS = { x: polesB.S.x - magB.x, y: polesB.S.y - magB.y };
                  
                  if (isNS) {
                    // A's N-pole snaps to B's S-pole
                    if (magA === this.draggedObject) {
                      magB.x = polesA.N.x - offsetBS.x;
                      magB.y = polesA.N.y - offsetBS.y;
                    } else {
                      magA.x = polesB.S.x - offsetAN.x;
                      magA.y = polesB.S.y - offsetAN.y;
                    }
                  } else {
                    // A's S-pole snaps to B's N-pole
                    if (magA === this.draggedObject) {
                      magB.x = polesA.S.x - offsetBN.x;
                      magB.y = polesA.S.y - offsetBN.y;
                    } else {
                      magA.x = polesB.N.x - offsetAS.x;
                      magA.y = polesB.N.y - offsetAS.y;
                    }
                  }
                  
                  if (magB !== this.draggedObject) {
                    magB.angle = (magA.angle + (isNS ? 0 : 180)) % 360;
                  }
                  this.updateDOMPosition(magA);
                  this.updateDOMPosition(magB);
                } else {
                  // Dragging close but not snapped yet - pull them together strongly
                  const dx = poleB.x - poleA.x;
                  const dy = poleB.y - poleA.y;
                  const moveFactor = 0.25;
                  
                  if (magA !== this.draggedObject) {
                    magA.x += dx * moveFactor;
                    magA.y += dy * moveFactor;
                    this.updateDOMPosition(magA);
                  }
                  if (magB !== this.draggedObject) {
                    magB.x -= dx * moveFactor;
                    magB.y -= dy * moveFactor;
                    this.updateDOMPosition(magB);
                  }
                }
              } else {
                // Normal distance attraction movement
                const dx = poleB.x - poleA.x;
                const dy = poleB.y - poleA.y;
                const moveFactor = 0.12;
                
                if (magA !== this.draggedObject) {
                  magA.x += dx * moveFactor;
                  magA.y += dy * moveFactor;
                  this.updateDOMPosition(magA);
                }
                if (magB !== this.draggedObject) {
                  magB.x -= dx * moveFactor;
                  magB.y -= dy * moveFactor;
                  this.updateDOMPosition(magB);
                }
                
                if (magB !== this.draggedObject) {
                  magB.angle = (magA.angle + (isNS ? 0 : 180)) % 360;
                  this.updateDOMPosition(magB);
                }
              }
            }
          } else {
          if (minDist < this.repelThreshold) {
            const isNN = minDist === d_NN;
            const poleA = isNN ? polesA.N : polesA.S;
            const poleB = isNN ? polesB.N : polesB.S;
            
            alertText = "Like poles repel.";
            alertVisible = true;
            
            const wasRepelled = magA.repelledBy === magB.id || magB.repelledBy === magA.id;
            if (!wasRepelled) {
              this.playSound('repel');
              magA.repelledBy = magB.id;
              magB.repelledBy = magA.id;
              this.triggerChallengeUnlock(0, "Like Poles Repel");
            }
            
            const dx = poleB.x - poleA.x;
            const dy = poleB.y - poleA.y;
            const distTotal = Math.sqrt(dx*dx + dy*dy) || 1;
            const pushFactor = (this.repelThreshold - minDist) * 0.45;
            
            if (magA !== this.draggedObject) {
              magA.x -= (dx / distTotal) * pushFactor;
              magA.y -= (dy / distTotal) * pushFactor;
              this.updateDOMPosition(magA);
            }
            if (magB !== this.draggedObject) {
              magB.x += (dx / distTotal) * pushFactor;
              magB.y += (dy / distTotal) * pushFactor;
              this.updateDOMPosition(magB);
            }
          }
        }
      }
    }
    
    // Magnet vs Materials
    const materials = this.objects.filter(o => o.type === 'material');
    materials.forEach(mat => {
      let nearestDist = Infinity;
      let nearestPole = null;
      
      magnets.forEach(mag => {
        const poles = this.getPoles(mag);
        if (!poles) return;
        
        const dN = this.getDist({ x: mat.x, y: mat.y }, poles.N);
        const dS = this.getDist({ x: mat.x, y: mat.y }, poles.S);
        
        if (dN < nearestDist) { nearestDist = dN; nearestPole = poles.N; }
        if (dS < nearestDist) { nearestDist = dS; nearestPole = poles.S; }
      });
      
      if (nearestDist < this.materialAttractThreshold) {
        if (mat.isMagnetic) {
          if (!isDragging && mat !== this.draggedObject) {
            const dx = nearestPole.x - mat.x;
            const dy = nearestPole.y - mat.y;
            
            mat.x += dx * 0.15;
            mat.y += dy * 0.15;
            this.updateDOMPosition(mat);
            
            if (nearestDist < this.snapDistance) {
              this.playSound('attract');
              this.logObservation(mat.subType, true);
              this.updateGI2SidebarBadge(mat.subType, 'Attracted');
            }
          }
        } else {
          // Non-magnetic material brought close to the magnet - record as tested!
          this.logObservation(mat.subType, false);
          this.updateGI2SidebarBadge(mat.subType, 'Not attracted');
        }
      }
      
      if (this.selectedObjects.includes(mat)) {
        this.updateObjectTesterPanel(mat, nearestDist < this.materialAttractThreshold);
      }
    });
    
    // Ruler snapping logic (Experiment 3 / GI3)
    if (this.activeInvestigation === 'gi3' && this.showRuler) {
      const magnet = magnets[0];
      const paperclip = materials.find(m => m.subType === 'steel_paperclip');
      
      if (magnet && magnet !== this.draggedObject) {
        const rect = this.container.getBoundingClientRect();
        magnet.x = rect.width * 0.15;
        magnet.y = rect.height * 0.5;
        magnet.angle = 180;
        this.updateDOMPosition(magnet);
      }
      
      if (paperclip && !isDragging && paperclip !== this.draggedObject) {
        if (magnet) {
          const poles = this.getPoles(magnet);
          if (poles) {
            const magnetNPoleX = poles.N.x;
            const distPx = paperclip.x - magnetNPoleX;
            const cm = Math.round(distPx / 40);
            
            if (cm >= 1 && cm <= 10) {
              if (cm <= 4) {
                paperclip.x = magnetNPoleX + 20;
                paperclip.y = poles.N.y;
                this.updateDOMPosition(paperclip);
                this.playSound('attract');
                this.logRulerTrial(cm, true);
              } else {
                this.logRulerTrial(cm, false);
              }
            }
          }
        }
      }
    }
    
    const alertBar = document.getElementById('workspace-alert-bar');
    if (alertBar) {
      if (alertVisible && alertText) {
        alertBar.textContent = alertText;
        alertBar.classList.remove('hidden');
      } else {
        alertBar.classList.add('hidden');
      }
    }
    } catch (err) {
      console.error("solvePhysics error:", err);
      const alertBar = document.getElementById('workspace-alert-bar');
      if (alertBar) {
        alertBar.textContent = "⚠️ Physics Error: " + err.message;
        alertBar.classList.remove('hidden');
      }
    }
  }

  // --- FLOATING ROD PHYSICS ENGINE (EX 4) ---
  solveFloatingRings(isDragging) {
    const rings = this.objects.filter(o => o.subType === 'ring');
    if (rings.length < 1) return;
    
    const rect = this.container.getBoundingClientRect();
    const rodCenterX = rect.width / 2;
    
    // Toggle threaded status based on horizontal proximity to stand rod
    rings.forEach(r => {
      if (Math.abs(r.x - rodCenterX) < 60) {
        r.element.classList.add('threaded-on-rod');
      } else {
        r.element.classList.remove('threaded-on-rod');
      }
    });

    // Sort rings by Y position: highest Y = bottom of stack
    rings.sort((a, b) => b.y - a.y);

    // Constrain bottom ring (index 0) to stand base
    const rodBaseY = rect.height - 70;
    if (rings[0] !== this.draggedObject) {
      rings[0].x = rect.width / 2;
      rings[0].y = rodBaseY;
      this.updateDOMPosition(rings[0]);
    }

    // Stack each subsequent ring above the one below it
    for (let i = 1; i < rings.length; i++) {
      if (rings[i] !== this.draggedObject && !isDragging) {
        rings[i].x = rect.width / 2;
        const below = rings[i - 1];

        // N = left, S = right in side-view.
        // Pole faces: angle 0 = N-left/S-right; angle 180 = flipped.
        // Adjacent faces (bottom of upper vs top of lower) are the TOP/BOTTOM of the flat disc.
        // Same angle = same pole faces = repels; opposite angle = attracts.
        const repels = (Math.abs((rings[i].angle || 0) - (below.angle || 0)) % 360 < 90);

        if (repels) {
          // Float above with gap
          const targetY = below.y - below.height - 28;
          const dy = targetY - rings[i].y;
          rings[i].velY = (rings[i].velY || 0) * 0.75 + dy * 0.08;
        } else {
          // Attracted — sit close
          const targetY = below.y - below.height + 2;
          const dy = targetY - rings[i].y;
          rings[i].velY = (rings[i].velY || 0) * 0.7 + dy * 0.2;
        }
        rings[i].y += rings[i].velY || 0;
        this.updateDOMPosition(rings[i]);
      }
    }
  }

  // --- MYSTERY CASINGS ENGINE (EX 5) ---
  solveMysteryCasings(isDragging) {
    const magnet = this.objects.find(o => o.type === 'magnet');
    const mysteries = this.objects.filter(o => o.type === 'mystery');
    
    mysteries.forEach(myst => {
      if (!magnet || myst === this.draggedObject || isDragging) return;
      
      const poles = this.getPoles(magnet);
      if (!poles) return;
      
      const dN = this.getDist({ x: myst.x, y: myst.y }, poles.N);
      const dS = this.getDist({ x: myst.x, y: myst.y }, poles.S);
      const nearestDist = Math.min(dN, dS);
      const nearestPole = dN < dS ? poles.N : poles.S;
      const isNPole = dN < dS;
      
      if (nearestDist < this.materialAttractThreshold) {
        if (myst.subType === 'mystery_a') {
          // Object A: Iron (Attracted to both poles)
          myst.x += (nearestPole.x - myst.x) * 0.15;
          myst.y += (nearestPole.y - myst.y) * 0.15;
          this.updateDOMPosition(myst);
          if (nearestDist < this.snapDistance) {
            this.playSound('attract');
            this.updateMysteryObservation(myst.subType, 'both');
          }
        } else if (myst.subType === 'mystery_b') {
          // Object B: Plastic (Not attracted to either)
          this.updateMysteryObservation(myst.subType, 'none');
        } else if (myst.subType === 'mystery_c') {
          // Object C: Magnet (Attracts to one pole, repels the other)
          // Let's assume C N-pole is on the left, so it attracts S-pole and repels N-pole
          if (!isNPole) {
            // S Pole of Bar Magnet -> Attracts N of Object C
            myst.x += (poles.S.x - myst.x) * 0.15;
            myst.y += (poles.S.y - myst.y) * 0.15;
            this.updateDOMPosition(myst);
            if (nearestDist < this.snapDistance) {
              this.playSound('attract');
              this.updateMysteryObservation(myst.subType, 'one');
            }
          } else {
            // N Pole of Bar Magnet -> Repels N of Object C
            const dx = myst.x - poles.N.x;
            const dy = myst.y - poles.N.y;
            const dist = Math.sqrt(dx*dx + dy*dy) || 1;
            const force = (this.repelThreshold - nearestDist) * 0.25;
            myst.x += (dx / dist) * force;
            myst.y += (dy / dist) * force;
            this.updateDOMPosition(myst);
            this.playSound('repel');
            this.updateMysteryObservation(myst.subType, 'one');
          }
        }
      }
    });
  }

  updateMysteryObservation(subType, type) {
    const labelMapping = { mystery_a: 'A', mystery_b: 'B', mystery_c: 'C' };
    const label = labelMapping[subType];
    const row = document.querySelector(`#journal-mystery-workspace tr[data-obj="${label}"]`);
    if (!row) return;
    
    const tickCol = row.querySelector(`.mystery-tick[data-col="${type}"]`);
    if (tickCol && !tickCol.checked) {
      tickCol.checked = true;
    }
  }

  // --- CURRICULUM OBSERVATIONS ---
  logObservation(subType, attracted) {
    if (this.testedMaterials[subType]) {
      this.testedMaterials[subType].observation = attracted ? 'Attracted' : 'Not attracted';
      this.updateRecordTable();
      this.checkGI2Completion();
    }
  }

  checkGI2Completion() {
    if (this.activeInvestigation !== 'gi2') return;
    const requiredSubs = ['iron_nail', 'wooden_stick', 'aluminium_foil', 'plastic_spoon', 'steel_washer', 'rubber_eraser', 'fabric'];
    const allTested = requiredSubs.every(sub => {
      const record = this.testedMaterials[sub];
      return record && record.observation && record.observation !== '';
    });
    if (allTested && !this.isActivityUnlocked('gi3')) {
      this.triggerModuleCompletion('gi2');
    }
  }

  logRulerTrial(cm, attracted) {
    const tableBody = document.getElementById('gi3-ruler-results-body');
    if (!tableBody) return;
    
    let row = tableBody.querySelector(`tr[data-cm="${cm}"]`);
    if (!row) {
      row = document.createElement('tr');
      row.dataset.cm = cm;
      row.setAttribute('data-cm', cm);
      row.innerHTML = `
        <td class="text-center font-bold text-xs p-1">${cm} cm</td>
        <td class="text-center text-xs p-1 result-cell">—</td>
      `;
      tableBody.appendChild(row);
      
      const rows = Array.from(tableBody.querySelectorAll('tr'));
      rows.sort((a, b) => parseInt(a.dataset.cm) - parseInt(b.dataset.cm));
      tableBody.innerHTML = "";
      rows.forEach(r => tableBody.appendChild(r));
    }
    
    const cell = row.querySelector('.result-cell');
    const statusText = attracted ? '✅ Yes! Snapped to magnet' : '❌ No (Stayed in place)';
    if (cell.textContent !== statusText) {
      cell.textContent = statusText;
      cell.className = attracted ? 'text-center text-xs p-1 result-cell font-bold text-emerald-600' : 'text-center text-xs p-1 result-cell text-slate-500';
    }
    
    if (attracted && cm === 4) {
      this.triggerChallengeUnlock(4, "Ruler Snap Master");
    }
  }

  // --- CANVAS FIELD RENDERERS ---
  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Solve physics continuously every frame!
    this.solvePhysics(this.draggedObject !== null);
    
    // Suspended & Floating Springs Solver (Experiment 6)
    if (this.activeInvestigation === 'gi6') {
      this.solveAlignmentOscillation();
    }
    
    if (this.showFieldLines) {
      const allMagnets = this.objects.filter(o => o.type === 'magnet');
      allMagnets.forEach(mag => this.drawFieldLines(mag));
    }
    
    requestAnimationFrame(() => this.render());
  }

  // --- SUSPENDED & FLOATING ROTATION SPRING (EX 6) ---
  solveAlignmentOscillation() {
    const standEl = document.getElementById('workspace-suspended-stand');
    const basinEl = document.getElementById('workspace-basin');
    
    const isHanging = standEl && !standEl.classList.contains('hidden');
    const isBasin = basinEl && !basinEl.classList.contains('hidden');
    
    const bar = this.objects.find(o => o.subType === 'bar');
    if (!bar) return;
    
    const rect = this.container.getBoundingClientRect();
    
    if (isHanging) {
      // Anchored to suspended string hook
      bar.x = rect.width / 2;
      bar.y = 168;
      this.updateDOMPosition(bar);
      
      // Draw string deflection line inside canvas
      this.ctx.save();
      this.ctx.strokeStyle = '#64748b';
      this.ctx.lineWidth = 3;
      this.ctx.beginPath();
      this.ctx.moveTo(rect.width / 2, 28);
      this.ctx.lineTo(bar.x, bar.y - 12);
      this.ctx.stroke();
      this.ctx.restore();
      
      // Smoothly oscillate angle back to point North (angle = 270 / horizontal alignment = 0)
      if (bar !== this.draggedObject) {
        const targetAngle = 0; // Point North-South horizontally
        const diff = targetAngle - bar.angle;
        
        bar.velAngle = bar.velAngle * 0.92 + diff * 0.015;
        bar.angle += bar.velAngle;
        this.updateDOMPosition(bar);
      }
    }
    
    if (isBasin) {
      // Constrained to floating boat
      const boat = document.getElementById('foam-boat');
      if (boat) {
        // Center of boat inside basin water
        const bX = rect.width * 0.48;
        const bY = rect.height - 85;
        
        boat.style.left = `${bX - 30}px`;
        boat.style.top = `${bY - 30}px`;
        boat.style.transform = `rotate(${bar.angle}deg)`;
        
        if (bar !== this.draggedObject) {
          bar.x = bX;
          bar.y = bY;
          
          const targetAngle = 0; // Horizontal N-S alignment
          const diff = targetAngle - bar.angle;
          
          bar.velAngle = bar.velAngle * 0.9 + diff * 0.012;
          bar.angle += bar.velAngle;
          this.updateDOMPosition(bar);
        }
      }
    }
  }

  drawFieldLines(mag) {
    const poles = this.getPoles(mag);
    if (!poles) return;

    const ctx = this.ctx;
    ctx.save();
    ctx.shadowBlur = 6;
    ctx.shadowColor = 'rgba(245, 158, 11, 0.35)';
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.60)';
    ctx.lineWidth = 1.8;
    ctx.setLineDash([5, 5]);

    const n = poles.N;
    const s = poles.S;
    const dx = s.x - n.x;
    const dy = s.y - n.y;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;

    if (mag.subType === 'ushaped') {
      // U-shaped: draw tight arc-field between the two tips (they are close together)
      const curves = [20, 40, 70, 110];
      curves.forEach(h => {
        this.drawFieldLineCurve(ctx, n, s, len, h, 1);
        this.drawFieldLineCurve(ctx, n, s, len, h, -1);
      });
    } else if (mag.subType === 'button' || mag.subType === 'ring') {
      // Compact radial field for circular magnets
      const curves = [25, 55, 95, 145];
      curves.forEach(h => {
        this.drawFieldLineCurve(ctx, n, s, len, h, 1);
        this.drawFieldLineCurve(ctx, n, s, len, h, -1);
      });
    } else {
      // Bar / Rod — standard field
      const curves = [40, 80, 130, 190];
      curves.forEach(h => {
        this.drawFieldLineCurve(ctx, n, s, len, h, 1);
        this.drawFieldLineCurve(ctx, n, s, len, h, -1);
      });
    }

    ctx.restore();
  }

  drawFieldLineCurve(ctx, n, s, len, height, side) {
    const midX = (n.x + s.x) / 2;
    const midY = (n.y + s.y) / 2;
    const nx = -(s.y - n.y) / len;
    const ny = (s.x - n.x) / len;
    const cpX = midX + nx * height * side;
    const cpY = midY + ny * height * side;
    
    ctx.beginPath();
    ctx.moveTo(n.x, n.y);
    ctx.quadraticCurveTo(cpX, cpY, s.x, s.y);
    ctx.stroke();
    
    const t = 0.5;
    const ax = (1-t)*(1-t)*n.x + 2*(1-t)*t*cpX + t*t*s.x;
    const ay = (1-t)*(1-t)*n.y + 2*(1-t)*t*cpY + t*t*s.y;
    
    const tx = 2*(1-t)*(cpX - n.x) + 2*t*(s.x - cpX);
    const ty = 2*(1-t)*(cpY - n.y) + 2*t*(s.y - cpY);
    
    ctx.save();
    ctx.translate(ax, ay);
    ctx.rotate(Math.atan2(ty, tx));
    ctx.beginPath();
    ctx.moveTo(-5, -4);
    ctx.lineTo(5, 0);
    ctx.lineTo(-5, 4);
    ctx.fillStyle = 'rgba(245, 158, 11, 0.8)';
    ctx.fill();
    ctx.restore();
  }

  // --- OBJECT TESTER PANEL ---
  updateObjectTesterPanel(obj, isCloseToMagnet = false) {
    const matName = document.getElementById('testing-material-name');
    const stateText = document.getElementById('testing-state-text');
    const checkBtn = document.getElementById('test-check-obs-btn');
    const revealBtn = document.getElementById('test-reveal-concl-btn');
    
    if (!matName || !stateText || !checkBtn || !revealBtn) return;
    
    if (obj.type === 'material') {
      matName.textContent = `${obj.emoji} ${obj.name}`;
      
      const testState = this.testedMaterials[obj.subType];
      if (testState) {
        if (testState.observation) {
          stateText.innerHTML = `Observation: <strong class="${obj.isMagnetic ? 'text-emerald-600' : 'text-slate-600'}">${testState.observation} to the magnet</strong>`;
          checkBtn.disabled = true;
          revealBtn.disabled = false;
        } else {
          stateText.textContent = isCloseToMagnet ? "Ready to observe! Click 'Check Observation'" : "Bring this material close to a magnet to test it.";
          checkBtn.disabled = !isCloseToMagnet;
          revealBtn.disabled = true;
        }
        
        if (testState.conclusion) {
          stateText.innerHTML += `<br>Conclusion: <strong class="text-indigo-600">${testState.conclusion}</strong>`;
          revealBtn.disabled = true;
        }
      }
    } else if (obj.type === 'mystery') {
      matName.textContent = obj.name;
      stateText.textContent = "Test this mystery casing near a Bar Magnet N or S pole to identify it!";
      checkBtn.disabled = true;
      revealBtn.disabled = true;
    } else {
      matName.textContent = obj.name;
      stateText.textContent = "This is a magnet! Move it near other magnets or test materials.";
      checkBtn.disabled = true;
      revealBtn.disabled = true;
    }
  }

  resetObjectTesterPanel() {
    const matName = document.getElementById('testing-material-name');
    const stateText = document.getElementById('testing-state-text');
    const checkBtn = document.getElementById('test-check-obs-btn');
    const revealBtn = document.getElementById('test-reveal-concl-btn');
    
    if (matName) matName.textContent = "No object selected";
    if (stateText) stateText.textContent = "Waiting for test...";
    if (checkBtn) checkBtn.disabled = true;
    if (revealBtn) revealBtn.disabled = true;
  }

  checkObservationClick() {
    this.playSound('click');
    if (this.selectedObjects.length > 0 && this.selectedObjects[0].type === 'material') {
      const mat = this.selectedObjects[0];
      this.logObservation(mat.subType, mat.isMagnetic);
      this.updateObjectTesterPanel(mat);
    }
  }

  revealConclusionClick() {
    this.playSound('click');
    if (this.selectedObjects.length > 0 && this.selectedObjects[0].type === 'material') {
      const mat = this.selectedObjects[0];
      const conclusionText = mat.isMagnetic ? 'Magnetic' : 'Non-magnetic';
      
      if (this.testedMaterials[mat.subType]) {
        this.testedMaterials[mat.subType].conclusion = conclusionText;
        this.updateRecordTable();
        this.updateObjectTesterPanel(mat);
        this.checkTestedCountsChallenges();
      }
    }
  }

  checkTestedCountsChallenges() {
    const tested = Object.values(this.testedMaterials);
    const completedMags = tested.filter(t => t.conclusion === 'Magnetic' && t.isMagnetic);
    const completedNonMags = tested.filter(t => t.conclusion === 'Non-magnetic' && !t.isMagnetic);
    
    if (completedMags.length >= 3) {
      this.triggerChallengeUnlock(2, "Metal Attracter");
    }
    if (completedNonMags.length >= 3) {
      this.triggerChallengeUnlock(3, "Shield Explorer");
    }
  }

  // --- DATA OBSERVATIONS RECORD TABLE ---
  updateRecordTable() {
    const tbody = document.getElementById('magnet-table-body');
    if (!tbody) return;
    
    const keys = Object.keys(this.testedMaterials);
    if (keys.length === 0) {
      tbody.innerHTML = `
        <tr class="empty-row-placeholder">
          <td colspan="4" class="text-center text-xs text-slate-400 italic p-6">No materials tested yet. Go to the Workbench and test materials from the drawer!</td>
        </tr>
      `;
      return;
    }
    
    tbody.innerHTML = "";
    keys.forEach(key => {
      const item = this.testedMaterials[key];
      const row = document.createElement('tr');
      row.dataset.key = key;
      row.setAttribute('data-key', key);
      
      row.innerHTML = `
        <td class="font-bold text-xs text-slate-700">${item.emoji} ${item.name}</td>
        <td>
          <select class="pred-select journal-input text-[11px] p-1 w-full" style="padding: 4px;">
            <option value="" ${item.prediction === '' ? 'selected' : ''}>Predict...</option>
            <option value="magnetic" ${item.prediction === 'magnetic' ? 'selected' : ''}>Magnetic</option>
            <option value="non-magnetic" ${item.prediction === 'non-magnetic' ? 'selected' : ''}>Non-magnetic</option>
          </select>
        </td>
        <td>
          <select class="obs-select journal-input text-[11px] p-1 w-full" style="padding: 4px;">
            <option value="" ${item.observation === '' ? 'selected' : ''}>Observe...</option>
            <option value="Attracted" ${item.observation === 'Attracted' ? 'selected' : ''}>Attracted</option>
            <option value="Not attracted" ${item.observation === 'Not attracted' ? 'selected' : ''}>Not attracted</option>
          </select>
        </td>
        <td>
          <select class="concl-select journal-input text-[11px] p-1 w-full" style="padding: 4px;">
            <option value="" ${item.conclusion === '' ? 'selected' : ''}>Conclude...</option>
            <option value="Magnetic" ${item.conclusion === 'Magnetic' ? 'selected' : ''}>Magnetic</option>
            <option value="Non-magnetic" ${item.conclusion === 'Non-magnetic' ? 'selected' : ''}>Non-magnetic</option>
          </select>
        </td>
      `;
      
      row.querySelectorAll('select').forEach(sel => {
        sel.addEventListener('change', () => {
          if (sel.classList.contains('pred-select')) item.prediction = sel.value;
          if (sel.classList.contains('obs-select')) item.observation = sel.value;
          if (sel.classList.contains('concl-select')) {
            item.conclusion = sel.value;
            this.checkTestedCountsChallenges();
          }
        });
      });
      
      tbody.appendChild(row);
    });
  }

  checkTableWork() {
    this.playSound('click');
    const tbody = document.getElementById('magnet-table-body');
    if (!tbody) return;
    
    let allCorrect = true;
    let anyRows = false;
    
    const rows = tbody.querySelectorAll('tr[data-key]');
    rows.forEach(row => {
      anyRows = true;
      const key = row.dataset.key;
      const item = this.testedMaterials[key];
      
      const obsSel = row.querySelector('.obs-select');
      const conclSel = row.querySelector('.concl-select');
      
      const expectedObs = item.isMagnetic ? 'Attracted' : 'Not attracted';
      if (obsSel.value === expectedObs) {
        obsSel.style.border = '2px solid #10b981';
      } else {
        obsSel.style.border = '2px solid #f43f5e';
        allCorrect = false;
      }
      
      const expectedConcl = item.isMagnetic ? 'Magnetic' : 'Non-magnetic';
      if (conclSel.value === expectedConcl) {
        conclSel.style.border = '2px solid #10b981';
      } else {
        conclSel.style.border = '2px solid #f43f5e';
        allCorrect = false;
      }
    });
    
    if (!anyRows) {
      alert("Test some materials on the Workbench first!");
      return;
    }
    
    if (allCorrect) {
      this.playSound('success');
      this.triggerModuleCompletion('gi2');
    } else {
      alert("❌ Some entries need correction. Check the red outlines and try again!");
    }
  }

  isActivityUnlocked(giId) {
    return !!this.unlockedActivities[giId];
  }

  unlockActivity(giId) {
    this.unlockedActivities[giId] = true;
    this.updateInvestigationDropdown();
    if (this.app) this.app.saveStateToStorage();
  }

  unlockAllActivities() {
    Object.keys(this.unlockedActivities).forEach(k => {
      this.unlockedActivities[k] = true;
    });
    this.updateInvestigationDropdown();
    if (this.app) this.app.saveStateToStorage();
  }

  triggerModuleCompletion(completedGiId) {
    const flow = {
      gi1: { next: 'gi2', passcode: 'PULL-61B', expName: 'Experiment 1: Push & Pull', nextName: 'Experiment 2' },
      gi2: { next: 'gi3', passcode: 'POLE-62A', expName: 'Experiment 2: Material Classification', nextName: 'Experiment 3' },
      gi3: { next: 'gi4', passcode: 'RING-63B', expName: 'Experiment 3: Strongest Pull at Poles', nextName: 'Experiment 4' },
      gi4: { next: 'gi5', passcode: 'CASE-63C', expName: 'Experiment 4: Floating Ring Magnets', nextName: 'Experiment 5' },
      gi5: { next: 'gi6', passcode: 'ALIGN-64', expName: 'Experiment 5: Mystery Casings Test', nextName: 'Experiment 6' },
      gi6: { next: 'free', passcode: 'SPROUT-FREE', expName: 'Experiment 6: Hanging & Floating Alignment', nextName: 'Experiment 7: Free Play' }
    };
    
    const info = flow[completedGiId];
    if (!info) return;
    
    // Auto-unlock next module for the pupil
    this.unlockActivity(info.next);
    
    // Show completion celebration modal
    if (this.app) {
      this.app.showCompletionModal(info.expName, info.next, info.passcode, info.nextName);
    }
  }

  updateInvestigationDropdown() {
    const select = document.getElementById('guided-investigation-select');
    if (!select) return;
    const names = {
      gi1: "Experiment 1: Activity 6.1 (A) - Push & Pull",
      gi2: "Experiment 2: Activity 6.1 (B) - Material Classification",
      gi3: "Experiment 3: Activity 6.2 - Strongest Pull at Poles",
      gi4: "Experiment 4: Activity 6.3 (B) - Floating Ring Magnets",
      gi5: "Experiment 5: Activity 6.3 (C) - Mystery Casings Test",
      gi6: "Experiment 6: Activity 6.4 - Hanging & Floating Alignment",
      free: "Experiment 7: Free Play & Graphing"
    };
    Array.from(select.options).forEach(opt => {
      const key = opt.value;
      const name = names[key] || opt.textContent;
      const unlocked = this.isActivityUnlocked(key);
      opt.textContent = unlocked ? name : `🔒 ${name}`;
    });
  }

  // --- GUIDED WORKBOOKS SWAPPER ---
  setGuidedInvestigation(giId) {
    this.activeInvestigation = giId;
    this.deselectAll();
    this.clearWorkspace(false);
    
    const instructions = document.getElementById('guided-instructions');
    if (!instructions) return;
    
    // Toggles static overlay blocks
    this.showRuler = false;
    const rulerEl = document.getElementById('workspace-ruler');
    if (rulerEl) rulerEl.classList.add('hidden');
    
    const rulerBtn = document.getElementById('control-ruler-btn');
    if (rulerBtn) {
      rulerBtn.textContent = "📏 Show Ruler";
      rulerBtn.style.background = "";
      rulerBtn.style.color = "";
    }
    
    const standEl = document.getElementById('workspace-ring-stand');
    const suspendEl = document.getElementById('workspace-suspended-stand');
    const basinEl = document.getElementById('workspace-basin');
    
    if (standEl) standEl.classList.add('hidden');
    if (suspendEl) suspendEl.classList.add('hidden');
    if (basinEl) basinEl.classList.add('hidden');
    
    this.barrierType = 'none';

    // Show/Hide relevant journal workspaces
    const graphWorkspace = document.getElementById('journal-graph-workspace');
    const graphInstruct = document.getElementById('journal-graph-instructions');
    const classWorkspace = document.getElementById('journal-classification-workspace');
    const mysteryWorkspace = document.getElementById('journal-mystery-workspace');
    const tablePanel = document.getElementById('journal-record-table-panel');
    const worksheetTitle = document.getElementById('journal-worksheet-title');
    
    if (graphWorkspace) graphWorkspace.classList.add('hidden');
    if (graphInstruct) graphInstruct.classList.add('hidden');
    if (classWorkspace) classWorkspace.classList.add('hidden');
    if (mysteryWorkspace) mysteryWorkspace.classList.add('hidden');
    if (tablePanel) tablePanel.classList.remove('hidden');

    switch (giId) {
      case 'free':
        worksheetTitle.textContent = "📊 Graph My Experiment";
        if (graphWorkspace) graphWorkspace.classList.remove('hidden');
        this.renderGIFree(instructions);
        break;
      case 'gi1':
        worksheetTitle.textContent = "📔 Activity 6.1 (A) Record";
        if (graphInstruct) graphInstruct.classList.remove('hidden');
        this.renderGI1(instructions);
        break;
      case 'gi2':
        worksheetTitle.textContent = "🌿 Materials Sorter Map";
        if (tablePanel) tablePanel.classList.add('hidden'); // Hide simple table for tree sorter
        if (classWorkspace) classWorkspace.classList.remove('hidden');
        this.renderGI2(instructions);
        break;
      case 'gi3':
        worksheetTitle.textContent = "📏 Activity 6.2 Record";
        if (graphInstruct) graphInstruct.classList.remove('hidden');
        this.renderGI3(instructions);
        break;
      case 'gi4':
        worksheetTitle.textContent = "🧬 Activity 6.3 (B) Record";
        if (graphInstruct) graphInstruct.classList.remove('hidden');
        if (standEl) standEl.classList.remove('hidden');
        this.renderGI4(instructions);
        break;
      case 'gi5':
        worksheetTitle.textContent = "🕵️ Casing Observation Grid";
        if (tablePanel) tablePanel.classList.add('hidden'); // Hide normal materials grid
        if (mysteryWorkspace) mysteryWorkspace.classList.remove('hidden');
        this.renderGI5(instructions);
        break;
      case 'gi6':
        worksheetTitle.textContent = "🧭 Activity 6.4 Record";
        if (graphInstruct) graphInstruct.classList.remove('hidden');
        this.renderGI6(instructions);
        break;
    }
    this.saveHistory();
  }

  // --- RENDER WORKBOOK CODES ---
  renderGIFree(container) {
    container.innerHTML = `
      <div class="guided-header text-amber-500 font-bold text-xs uppercase mb-1">Experiment 7: Free Play</div>
      <p class="text-slate-600 text-xs mb-3">Design your own experiment. Go to the <strong>My Journal</strong> tab at the top to configure variables and plot data!</p>
      <div class="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-xs text-indigo-900 leading-normal">
        💡 <strong>Junior Tip:</strong> Place two or more magnets on the board together. Then go to My Journal to log results!
      </div>
    `;
    this.setupFreePlayWorksheet();
  }

  setupFreePlayWorksheet() {
    const journalGraphWorkspace = document.getElementById('journal-graph-workspace');
    if (!journalGraphWorkspace) return;
    
    journalGraphWorkspace.innerHTML = `
      <div class="flex flex-col gap-3">
        <div>
          <label class="text-[10px] font-bold text-slate-500 block mb-0.5">Changed Variable:</label>
          <select id="free-changed-var" class="journal-input text-[11px] p-1.5 w-full" style="padding:4px 8px;">
            <option value="distance">Distance from magnet</option>
            <option value="magnets_num">Number of magnets</option>
            <option value="materials_type">Type of material</option>
          </select>
        </div>
        <div>
          <label class="text-[10px] font-bold text-slate-500 block mb-0.5">Measured Variable:</label>
          <select id="free-measured-var" class="journal-input text-[11px] p-1.5 w-full" style="padding:4px 8px;">
            <option value="is_attracted">Whether the object is attracted</option>
            <option value="max_dist">Maximum distance of attraction (cm)</option>
            <option value="clips_num">Number of paper clips attracted</option>
          </select>
        </div>
        
        <div class="bg-indigo-50 border border-indigo-100 p-2.5 rounded-lg text-xs text-indigo-900" id="free-aim-display">
          <strong>Generated Aim:</strong> Loading aim...
        </div>
        
        <div class="border-t pt-3" id="free-trials-container">
          <span class="text-[10px] font-bold text-slate-500 block mb-2">Record Trial Measurements:</span>
          <div class="grid grid-cols-3 gap-2 mb-2 text-center" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px;">
            <input type="number" id="trial-1-val" class="journal-input text-[11px] p-1 text-center" placeholder="Trial 1" style="padding:4px;">
            <input type="number" id="trial-2-val" class="journal-input text-[11px] p-1 text-center" placeholder="Trial 2" style="padding:4px;">
            <input type="number" id="trial-3-val" class="journal-input text-[11px] p-1 text-center" placeholder="Trial 3" style="padding:4px;">
          </div>
          <div class="text-[11px] mb-3 text-slate-600">Average: <strong id="trials-avg-readout">—</strong></div>
          
          <button class="btn btn-primary text-xs py-1.5 w-full" id="plot-free-graph-btn" style="box-shadow:none;">Generate Graph 📊</button>
        </div>
        
        <div class="free-chart-slot mt-2 hidden" id="free-chart-container" style="height: 120px; border: 1px solid #ddd; border-radius: 8px; overflow:hidden;">
          <canvas id="free-graph-canvas" style="width:100%; height:100%; display:block;"></canvas>
        </div>
      </div>
    `;
    
    const changedVar = journalGraphWorkspace.querySelector('#free-changed-var');
    const measuredVar = journalGraphWorkspace.querySelector('#free-measured-var');
    const aimDisplay = journalGraphWorkspace.querySelector('#free-aim-display');
    
    const updateAim = () => {
      const chText = changedVar.options[changedVar.selectedIndex].text.toLowerCase();
      const meText = measuredVar.options[measuredVar.selectedIndex].text.toLowerCase();
      aimDisplay.innerHTML = `<strong>Generated Aim:</strong><br>To find out how the <strong>${chText}</strong> affects the <strong>${meText}</strong>.`;
    };
    
    changedVar.addEventListener('change', updateAim);
    measuredVar.addEventListener('change', updateAim);
    updateAim();
    
    const t1 = journalGraphWorkspace.querySelector('#trial-1-val');
    const t2 = journalGraphWorkspace.querySelector('#trial-2-val');
    const t3 = journalGraphWorkspace.querySelector('#trial-3-val');
    const avgReadout = journalGraphWorkspace.querySelector('#trials-avg-readout');
    
    const calcAvg = () => {
      const v1 = parseFloat(t1.value);
      const v2 = parseFloat(t2.value);
      const v3 = parseFloat(t3.value);
      
      const vals = [v1, v2, v3].filter(v => !isNaN(v));
      if (vals.length > 0) {
        const sum = vals.reduce((a, b) => a + b, 0);
        const avg = (sum / vals.length).toFixed(1);
        avgReadout.textContent = avg;
      } else {
        avgReadout.textContent = "—";
      }
    };
    
    [t1, t2, t3].forEach(t => t.addEventListener('input', calcAvg));
    
    const plotBtn = journalGraphWorkspace.querySelector('#plot-free-graph-btn');
    plotBtn.addEventListener('click', () => {
      this.playSound('click');
      const chartContainer = journalGraphWorkspace.querySelector('#free-chart-container');
      chartContainer.classList.remove('hidden');
      this.drawFreeGraph();
    });
  }

  renderGI1(container) {
    container.innerHTML = `
      <div class="guided-header text-indigo-600 font-bold text-xs uppercase mb-1">Experiment 1: Activity 6.1 (A)</div>
      <p class="text-slate-600 text-xs mb-3 font-semibold">Aim: Observe push and pull between pairs of magnets.</p>
      <p class="text-slate-500 text-[11px] mb-3">Try spawning different magnets (Bar, Button, Ring, Rod, U-shaped) and move like and unlike poles close. Notice the force arrow overlays!</p>
      
      <div class="scaffold-sentence-form border-t pt-3 flex flex-col gap-2">
        <span class="text-[10px] font-bold text-slate-500 block">Let's Conclude (Workbook page 109):</span>
        <div class="text-xs text-slate-700 leading-relaxed font-semibold">
          a. When two sides of the magnets of the <strong>same colour</strong> face each other, they
          <select id="gi1-unlike-ans" class="journal-input text-[11px] p-1 inline-block" style="width: auto; padding:2px;">
            <option value="">choose...</option>
            <option value="repel">push/repel</option>
            <option value="attract">pull/attract</option>
          </select> each other.
        </div>
        <div class="text-xs text-slate-700 leading-relaxed font-semibold">
          b. When two sides of the magnets of <strong>different colours</strong> face each other, they
          <select id="gi1-like-ans" class="journal-input text-[11px] p-1 inline-block" style="width: auto; padding:2px;">
            <option value="">choose...</option>
            <option value="repel">push/repel</option>
            <option value="attract">pull/attract</option>
          </select> each other.
        </div>
        <button class="btn btn-primary text-xs py-1.5 mt-2" id="gi1-submit-btn" style="box-shadow:none;">Check Answers</button>
      </div>
    `;
    
    const rect = this.container.getBoundingClientRect();
    this.addObject('magnet', 'bar', rect.width * 0.3, rect.height * 0.5);
    this.addObject('magnet', 'bar', rect.width * 0.7, rect.height * 0.5);
    
    container.querySelector('#gi1-submit-btn').addEventListener('click', () => {
      this.playSound('click');
      const unlikeVal = container.querySelector('#gi1-unlike-ans').value;
      const likeVal = container.querySelector('#gi1-like-ans').value;
      
      if (unlikeVal === 'repel' && likeVal === 'attract') {
        this.playSound('success');
        this.triggerModuleCompletion('gi1');
      } else {
        alert("❌ Double check which colours push and pull. (Red+Red pushes, Red+Blue pulls). Try again!");
      }
    });
  }

  renderGI2(container) {
    this.gi2TestingSub = 'iron_nail';
    
    const getBadgeHTML = (sub) => {
      const record = this.testedMaterials[sub];
      if (record && record.observation === 'Attracted') {
        return `<span class="gi2-status-badge font-bold uppercase text-[9px] bg-emerald-100 text-emerald-700 py-0.5 px-1.5 rounded-full border border-emerald-200">🧲 Attracted</span>`;
      }
      if (record && record.observation === 'Not attracted') {
        return `<span class="gi2-status-badge font-bold uppercase text-[9px] bg-slate-100 text-slate-500 py-0.5 px-1.5 rounded-full border border-slate-200">❌ No Reaction</span>`;
      }
      if (sub === this.gi2TestingSub) {
        return `<span class="gi2-status-badge font-bold uppercase text-[9px] bg-violet-100 text-violet-700 py-0.5 px-1.5 rounded-full border border-violet-200">Testing</span>`;
      }
      return `<span class="gi2-status-badge text-slate-400 font-semibold uppercase text-[9px] bg-slate-50 py-0.5 px-1.5 rounded border border-slate-100">Select</span>`;
    };

    container.innerHTML = `
      <div class="guided-header text-indigo-600 font-bold text-xs uppercase mb-1">Experiment 2: Activity 6.1 (B)</div>
      <p class="text-slate-600 text-xs mb-2 font-semibold">Aim: Classify objects as magnetic/non-magnetic, and metals/non-metals.</p>
      <p class="text-slate-500 text-[11px] mb-3">Click on a material below to place it on the workbench. Test them one-by-one, then classify them in the <strong>My Journal</strong> tab!</p>
      
      <!-- Material Selection Queue -->
      <div class="flex flex-col gap-2 mb-3" id="gi2-materials-selector">
        <button class="btn btn-secondary text-left w-full flex items-center justify-between text-xs py-2 px-3" data-sub="iron_nail">
          <span>📌 A: Iron Nail</span>
          ${getBadgeHTML('iron_nail')}
        </button>
        <button class="btn btn-secondary text-left w-full flex items-center justify-between text-xs py-2 px-3" data-sub="wooden_stick">
          <span>🥢 B: Wood Block</span>
          ${getBadgeHTML('wooden_stick')}
        </button>
        <button class="btn btn-secondary text-left w-full flex items-center justify-between text-xs py-2 px-3" data-sub="aluminium_foil">
          <span>🪞 C: Aluminium Strip</span>
          ${getBadgeHTML('aluminium_foil')}
        </button>
        <button class="btn btn-secondary text-left w-full flex items-center justify-between text-xs py-2 px-3" data-sub="plastic_spoon">
          <span>🥄 D: Plastic Spoon</span>
          ${getBadgeHTML('plastic_spoon')}
        </button>
        <button class="btn btn-secondary text-left w-full flex items-center justify-between text-xs py-2 px-3" data-sub="steel_washer">
          <span>🔩 E: Steel Washer</span>
          ${getBadgeHTML('steel_washer')}
        </button>
        <button class="btn btn-secondary text-left w-full flex items-center justify-between text-xs py-2 px-3" data-sub="rubber_eraser">
          <span>🧼 F: Rubber Eraser</span>
          ${getBadgeHTML('rubber_eraser')}
        </button>
        <button class="btn btn-secondary text-left w-full flex items-center justify-between text-xs py-2 px-3" data-sub="fabric">
          <span>👕 G: Fabric Strip</span>
          ${getBadgeHTML('fabric')}
        </button>
      </div>
      
      <div class="p-2.5 bg-purple-50 border border-purple-100 rounded-xl text-[11px] text-purple-900 leading-normal">
        ⚠️ <strong>Curriculum Check:</strong> Look closely at Object C (Aluminium). Is it a metal? Yes! Is it magnetic? Test and observe!
      </div>
    `;

    // Setup selection behavior
    const btns = container.querySelectorAll('#gi2-materials-selector button');
    
    const updateAllBadges = () => {
      btns.forEach(b => {
        b.classList.remove('active-material-btn');
        const sub = b.dataset.sub;
        const record = this.testedMaterials[sub];
        const badge = b.querySelector('.gi2-status-badge');
        if (badge) {
          if (sub === this.gi2TestingSub) {
            badge.textContent = "Testing";
            badge.className = "gi2-status-badge font-bold uppercase text-[9px] bg-violet-100 text-violet-700 py-0.5 px-1.5 rounded-full border border-violet-200";
            b.classList.add('active-material-btn');
          } else if (record && record.observation === 'Attracted') {
            badge.textContent = "🧲 Attracted";
            badge.className = "gi2-status-badge font-bold uppercase text-[9px] bg-emerald-100 text-emerald-700 py-0.5 px-1.5 rounded-full border border-emerald-200";
          } else if (record && record.observation === 'Not attracted') {
            badge.textContent = "❌ No Reaction";
            badge.className = "gi2-status-badge font-bold uppercase text-[9px] bg-slate-100 text-slate-500 py-0.5 px-1.5 rounded-full border border-slate-200";
          } else {
            badge.textContent = "Select";
            badge.className = "gi2-status-badge text-slate-400 font-semibold uppercase text-[9px] bg-slate-50 py-0.5 px-1.5 rounded border border-slate-100";
          }
        }
      });
    };

    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.gi2TestingSub = btn.dataset.sub;
        updateAllBadges();
        
        // Remove existing materials from the workbench
        this.objects = this.objects.filter(o => {
          if (o.type === 'material') {
            if (o.element) o.element.remove();
            return false;
          }
          return true;
        });
        
        // Spawn ONLY the selected material
        const subType = btn.dataset.sub;
        const rect = this.container.getBoundingClientRect();
        this.addObject('material', subType, rect.width * 0.7, rect.height * 0.5);
        this.deselectAll();
      });
    });
    
    // Initial spawn: Magnet + First material (Iron Nail)
    const rect = this.container.getBoundingClientRect();
    this.addObject('magnet', 'bar', rect.width * 0.25, rect.height * 0.5);
    this.addObject('material', 'iron_nail', rect.width * 0.7, rect.height * 0.5);
    
    // Set initial button badge states
    updateAllBadges();
    
    this.setupClassificationPills();
  }

  setupClassificationPills() {
    const listMagnetic = document.querySelector('#dropzone-class-magnetic .drop-pill-list');
    const listNonMagnetic = document.querySelector('#dropzone-class-nonmagnetic .drop-pill-list');
    const listMetal = document.querySelector('#dropzone-class-metal .drop-pill-list');
    const listNonMetal = document.querySelector('#dropzone-class-nonmetal .drop-pill-list');
    
    if (!listMagnetic || !listNonMagnetic || !listMetal || !listNonMetal) return;
    
    // Clear list boxes
    listMagnetic.innerHTML = "";
    listNonMagnetic.innerHTML = "";
    listMetal.innerHTML = "";
    listNonMetal.innerHTML = "";
    
    // Re-create pills
    const pills = [
      { subType: 'iron_nail', label: '📌 A: Iron Nail', isMagnetic: true, isMetal: true },
      { subType: 'wooden_stick', label: '🥢 B: Wood Block', isMagnetic: false, isMetal: false },
      { subType: 'aluminium_foil', label: '🪞 C: Aluminium Strip', isMagnetic: false, isMetal: true },
      { subType: 'plastic_spoon', label: '🥄 D: Plastic Spoon', isMagnetic: false, isMetal: false },
      { subType: 'steel_washer', label: '⭕ E: Steel Washer', isMagnetic: true, isMetal: true },
      { subType: 'rubber_eraser', label: '🧼 F: Rubber Eraser', isMagnetic: false, isMetal: false },
      { subType: 'fabric', label: '👕 G: Fabric Strip', isMagnetic: false, isMetal: false }
    ];
    
    // Create classification pills inside Journal container
    const classificationWorkspace = document.getElementById('journal-classification-workspace');
    let pillsPool = classificationWorkspace.querySelector('.pills-pool');
    if (!pillsPool) {
      pillsPool = document.createElement('div');
      pillsPool.className = 'pills-pool flex flex-wrap gap-2 border-t pt-3 mt-3';
      classificationWorkspace.appendChild(pillsPool);
    }
    pillsPool.innerHTML = "";
    
    pills.forEach(p => {
      const pillEl = document.createElement('div');
      pillEl.className = 'classification-pill';
      pillEl.textContent = p.label;
      pillEl.draggable = true;
      pillEl.dataset.subType = p.subType;
      pillEl.dataset.isMagnetic = p.isMagnetic;
      pillEl.dataset.isMetal = p.isMetal;
      
      pillEl.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', p.subType);
      });
      pillsPool.appendChild(pillEl);
    });
    
    // Add dragover/drop event listeners to dropzones
    const dropzones = document.querySelectorAll('.target-classification-dropzone');
    dropzones.forEach(zone => {
      zone.addEventListener('dragover', (e) => {
        e.preventDefault();
      });
      zone.addEventListener('drop', (e) => {
        e.preventDefault();
        const subType = e.dataTransfer.getData('text/plain');
        const pill = pillsPool.querySelector(`[data-sub-type="${subType}"]`) || document.querySelector(`.classification-pill[data-sub-type="${subType}"]`);
        
        if (pill) {
          const list = zone.querySelector('.drop-pill-list');
          list.appendChild(pill);
          pill.classList.add('placed');
          this.playSound('click');
        }
      });
    });
    
    // Verify placements
    const checkBtn = document.getElementById('class-check-btn');
    checkBtn.onclick = () => {
      this.playSound('click');
      let allCorrect = true;
      
      const magZoneItems = Array.from(listMagnetic.children);
      const nonMagZoneItems = Array.from(listNonMagnetic.children);
      const metalZoneItems = Array.from(listMetal.children);
      const nonMetalZoneItems = Array.from(listNonMetal.children);
      
      // Verify Magnetic Zone
      magZoneItems.forEach(i => {
        if (i.dataset.isMagnetic !== 'true') { allCorrect = false; i.style.borderColor = '#f43f5e'; }
        else i.style.borderColor = '#10b981';
      });
      nonMagZoneItems.forEach(i => {
        if (i.dataset.isMagnetic === 'true') { allCorrect = false; i.style.borderColor = '#f43f5e'; }
        else i.style.borderColor = '#10b981';
      });
      
      // Verify Metal Zone
      metalZoneItems.forEach(i => {
        if (i.dataset.isMetal !== 'true') { allCorrect = false; i.style.borderColor = '#f43f5e'; }
        else i.style.borderColor = '#10b981';
      });
      nonMetalZoneItems.forEach(i => {
        if (i.dataset.isMetal === 'true') { allCorrect = false; i.style.borderColor = '#f43f5e'; }
        else i.style.borderColor = '#10b981';
      });
      
      const totalPlaced = magZoneItems.length + nonMagZoneItems.length + metalZoneItems.length + nonMetalZoneItems.length;
      if (totalPlaced < 14) {
        alert("Please classify all objects in both grids first!");
        return;
      }
      
      if (allCorrect) {
        this.playSound('success');
        alert("🎉 Congratulations! You verified that Iron and Steel are magnetic metals, while Wood, Plastic, Rubber, and Fabric are non-metals. Most importantly: Aluminium is a metal but is non-magnetic!");
      } else {
        alert("❌ Some objects are misplaced. Red outlined items need adjustment. Hint: Aluminium is a non-magnetic metal!");
      }
    };
  }

  renderGI3(container) {
    container.innerHTML = `
      <div class="guided-header text-indigo-600 font-bold text-xs uppercase mb-1">Experiment 3: Activity 6.2</div>
      <p class="text-slate-600 text-xs mb-3 font-semibold">Aim: Observe the parts of the magnet with the strongest pull.</p>
      <p class="text-slate-500 text-[11px] mb-3">Drag the magnet over the scatter pile of paper clips. Note where the paper clips gather and snap!</p>
      
      <div class="scaffold-sentence-form border-t pt-3 flex flex-col gap-2">
        <span class="text-[10px] font-bold text-slate-500 block">Workbook page 116 Conclusion:</span>
        <div class="text-xs text-slate-700 leading-relaxed font-semibold">
          A magnet has the
          <input type="text" id="gi3-poles-ans" class="journal-input text-[11px] p-1 inline-block text-center" placeholder="e.g. strongest" style="width: 80px; padding:2px;">
          pull or attraction at the two poles.
        </div>
        <button class="btn btn-primary text-xs py-1.5 mt-2" id="gi3-submit-btn" style="box-shadow:none;">Check Answer</button>
      </div>
    `;
    
    const rect = this.container.getBoundingClientRect();
    this.addObject('magnet', 'bar', rect.width * 0.5, rect.height * 0.3);
    
    // Spawn 15 paper clips clustered randomly in the center bottom
    for (let i = 0; i < 15; i++) {
      const cx = rect.width * 0.3 + Math.random() * (rect.width * 0.4);
      const cy = rect.height * 0.65 + (Math.random() - 0.5) * 50;
      this.addObject('material', 'steel_paperclip', cx, cy);
    }
    
    container.querySelector('#gi3-submit-btn').addEventListener('click', () => {
      this.playSound('click');
      const ans = container.querySelector('#gi3-poles-ans').value.trim().toLowerCase();
      if (ans === 'strongest' || ans === 'strong' || ans === 'greatest' || ans === 'max') {
        this.playSound('success');
        this.triggerModuleCompletion('gi3');
      } else {
        alert("❌ Think: Do clips attract more at the middle of a magnet or at the ends (poles)?");
      }
    });
  }

  renderGI4(container) {
    container.innerHTML = `
      <div class="guided-header text-indigo-600 font-bold text-xs uppercase mb-1">Experiment 4: Activity 6.3 (B)</div>
      <p class="text-slate-600 text-xs mb-3 font-semibold">Aim: Observe attraction and repulsion of ring magnets on stand.</p>
      <p class="text-slate-500 text-[11px] mb-3">Spawn Ring Magnets. Use rotation (inspect or Shift+click) to invert their poles. Put both on the rod and watch them snap or float!</p>
      
      <div class="scaffold-sentence-form border-t pt-3 flex flex-col gap-2">
        <span class="text-[10px] font-bold text-slate-500 block">Explanation (Workbook page 121):</span>
        <div class="text-xs text-slate-700 leading-relaxed font-semibold">
          If the top ring magnet floats in the air, it is because
          <select id="gi4-rod-ans" class="journal-input text-[11px] p-1.5 w-full mt-1">
            <option value="">choose explanation...</option>
            <option value="like">like poles face each other, pushing them apart</option>
            <option value="unlike">unlike poles face each other, pulling them together</option>
          </select>
        </div>
        <button class="btn btn-primary text-xs py-1.5 mt-2" id="gi4-submit-btn" style="box-shadow:none;">Check Explanation</button>
      </div>
    `;
    
    const rect = this.container.getBoundingClientRect();
    
    // Bottom Ring
    const r1 = this.addObject('magnet', 'ring', rect.width / 2, rect.height - 70, 0);
    // Top Ring
    const r2 = this.addObject('magnet', 'ring', rect.width / 2, rect.height - 220, 0);
    
    this.selectObject(r2);
    
    container.querySelector('#gi4-submit-btn').addEventListener('click', () => {
      this.playSound('click');
      const ans = container.querySelector('#gi4-rod-ans').value;
      if (ans === 'like') {
        this.playSound('success');
        this.triggerModuleCompletion('gi4');
      } else {
        alert("❌ If they pull together, they snap and touch. Floating is a result of repulsion!");
      }
    });
  }

  renderGI5(container) {
    container.innerHTML = `
      <div class="guided-header text-indigo-600 font-bold text-xs uppercase mb-1">Experiment 5: Activity 6.3 (C)</div>
      <p class="text-slate-600 text-xs mb-3 font-semibold">Aim: Test objects inside Casings to identify them.</p>
      <p class="text-slate-500 text-[11px] mb-3">Test Objects A, B, and C with the Bar Magnet. Enter ticks and identify them in the <strong>My Journal</strong> tab!</p>
      
      <div class="p-3 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-900 leading-normal">
        🔑 <strong>Diagnostic Hint:</strong> Only magnets can experience repulsion! If a casing is pushed away, it must be a magnet.
      </div>
    `;
    
    const rect = this.container.getBoundingClientRect();
    this.addObject('magnet', 'bar', rect.width * 0.15, rect.height * 0.5);
    
    // Spawn 3 mystery casings A, B, C
    this.addObject('mystery', 'mystery_a', rect.width * 0.5, rect.height * 0.35); // Magnetic (Iron)
    this.addObject('mystery', 'mystery_b', rect.width * 0.5, rect.height * 0.65); // Non-magnetic (Plastic)
    this.addObject('mystery', 'mystery_c', rect.width * 0.8, rect.height * 0.5);  // Magnet
    
    this.setupMysteryChecksheet();
  }

  setupMysteryChecksheet() {
    const checkBtn = document.getElementById('mystery-check-btn');
    if (!checkBtn) return;
    
    checkBtn.onclick = () => {
      this.playSound('click');
      const ansA = document.getElementById('myst-id-a').value;
      const ansB = document.getElementById('myst-id-b').value;
      const ansC = document.getElementById('myst-id-c').value;
      
      if (ansA === 'magnetic' && ansB === 'non_magnetic' && ansC === 'magnet') {
        this.playSound('success');
        this.triggerModuleCompletion('gi5');
      } else {
        alert("❌ Incorrect identification. Re-test the casing bars with the Bar Magnet and check your observations table!");
      }
    };
  }

  renderGI6(container) {
    container.innerHTML = `
      <div class="guided-header text-indigo-600 font-bold text-xs uppercase mb-1">Experiment 6: Activity 6.4</div>
      <p class="text-slate-600 text-xs mb-3 font-semibold">Aim: Investigate the resting position of a suspended magnet.</p>
      
      <div class="mb-3">
        <label class="text-[10px] font-bold text-slate-500 block mb-1">Select Alignment Method:</label>
        <div class="grid grid-cols-2 gap-2" style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
          <button class="btn btn-secondary text-xs py-1" id="gi6-method-hang">🧵 Hanging Stand</button>
          <button class="btn btn-secondary text-xs py-1" id="gi6-method-basin">💧 Basin Float</button>
        </div>
      </div>

      <div class="scaffold-sentence-form border-t pt-3 flex flex-col gap-2">
        <span class="text-[10px] font-bold text-slate-500 block">Workbook page 127 Conclusion:</span>
        <div class="text-xs text-slate-700 leading-relaxed font-semibold">
          A freely suspended magnet always points in the
          <input type="text" id="gi6-direction-ans" class="journal-input text-[11px] p-1 inline-block text-center" placeholder="e.g. north-south" style="width: 90px; padding:2px;">
          direction.
        </div>
        <button class="btn btn-primary text-xs py-1.5 mt-2" id="gi6-submit-btn" style="box-shadow:none;">Check Answer</button>
      </div>
    `;
    
    const rect = this.container.getBoundingClientRect();
    
    const setHangingMode = () => {
      this.playSound('click');
      document.getElementById('workspace-suspended-stand').classList.remove('hidden');
      document.getElementById('workspace-basin').classList.add('hidden');
      this.clearWorkspace(false);
      this.addObject('magnet', 'bar', rect.width / 2, 168, 90);
    };
    
    const setBasinMode = () => {
      this.playSound('click');
      document.getElementById('workspace-basin').classList.remove('hidden');
      document.getElementById('workspace-suspended-stand').classList.add('hidden');
      this.clearWorkspace(false);
      this.addObject('magnet', 'bar', rect.width * 0.48, rect.height - 85, 90);
    };
    
    container.querySelector('#gi6-method-hang').onclick = setHangingMode;
    container.querySelector('#gi6-method-basin').onclick = setBasinMode;
    
    // Default mode
    setHangingMode();
    
    container.querySelector('#gi6-submit-btn').addEventListener('click', () => {
      this.playSound('click');
      const ans = container.querySelector('#gi6-direction-ans').value.trim().toLowerCase();
      if (ans === 'north-south' || ans === 'n-s' || ans === 'north south' || ans === 'ns') {
        this.playSound('success');
        this.triggerModuleCompletion('gi6');
      } else {
        alert("❌ Think: In what geographic direction does a compass or hanging magnet rest?");
      }
    });
  }

  // --- BADGE CELEBRATION MODAL ---
  triggerChallengeUnlock(idx, badgeName) {
    if (this.completedChallenges[idx]) return;
    
    this.completedChallenges[idx] = true;
    this.playSound('success');
    
    const nameEl = document.getElementById('unlocked-badge-name');
    if (nameEl) nameEl.textContent = `${badgeName} Badge Unlocked! 🌟`;
    
    const overlay = document.getElementById('badge-glow-overlay');
    if (overlay) overlay.classList.remove('hidden');
    
    this.updateChallengeCards();
    this.app.saveStateToStorage();
  }

  updateChallengeCards() {
    const cards = document.querySelectorAll('.challenge-badge-card');
    cards.forEach((card, idx) => {
      const slot = card.querySelector('.badge-icon-slot');
      if (this.completedChallenges[idx]) {
        card.classList.add('unlocked');
        if (slot) {
          const icons = ['🔥', '💫', '📌', '🛡️', '📏', '📄', '🧲'];
          slot.textContent = icons[idx] || '🌟';
        }
      } else {
        card.classList.remove('unlocked');
        if (slot) slot.textContent = '🔒';
      }
    });
  }

  // --- TEACHER OVERRIDES MODE ---
  toggleTeacherMode(active) {
    this.playSound('click');
    
    if (active) {
      const keys = Object.keys(this.testedMaterials);
      keys.forEach((key) => {
        const item = this.testedMaterials[key];
        const row = document.querySelector(`tr[data-key="${key}"]`);
        if (row) {
          const pred = row.querySelector('.pred-select');
          const obs = row.querySelector('.obs-select');
          const concl = row.querySelector('.concl-select');
          
          pred.value = item.isMagnetic ? 'magnetic' : 'non-magnetic';
          obs.value = item.isMagnetic ? 'Attracted' : 'Not attracted';
          concl.value = item.isMagnetic ? 'Magnetic' : 'Non-magnetic';
          
          item.prediction = pred.value;
          item.observation = obs.value;
          item.conclusion = concl.value;
          
          pred.style.border = '2px dashed #8b5cf6';
          obs.style.border = '2px dashed #8b5cf6';
          concl.style.border = '2px dashed #8b5cf6';
        }
      });
      
      const unlikeAns = document.getElementById('gi1-unlike-ans');
      const likeAns = document.getElementById('gi1-like-ans');
      if (unlikeAns) unlikeAns.value = 'repel';
      if (likeAns) likeAns.value = 'attract';
      
      const classCheck = document.getElementById('class-check-btn');
      if (classCheck) {
        // Move all pills to correct zones for classification check
        const pills = document.querySelectorAll('.classification-pill');
        const listMagnetic = document.querySelector('#dropzone-class-magnetic .drop-pill-list');
        const listNonMagnetic = document.querySelector('#dropzone-class-nonmagnetic .drop-pill-list');
        const listMetal = document.querySelector('#dropzone-class-metal .drop-pill-list');
        const listNonMetal = document.querySelector('#dropzone-class-nonmetal .drop-pill-list');
        
        if (listMagnetic && listNonMagnetic && listMetal && listNonMetal) {
          pills.forEach(p => {
            const isMag = p.dataset.isMagnetic === 'true';
            const isMet = p.dataset.isMetal === 'true';
            
            if (isMag) listMagnetic.appendChild(p);
            else listNonMagnetic.appendChild(p);
            
            if (isMet) listMetal.appendChild(p);
            else listNonMetal.appendChild(p);
            
            p.classList.add('placed');
          });
        }
      }
      
      const polesAns = document.getElementById('gi3-poles-ans');
      if (polesAns) polesAns.value = 'strongest';
      
      const rodAns = document.getElementById('gi4-rod-ans');
      if (rodAns) rodAns.value = 'like';
      
      // Auto-populate Mystery Casings Checks
      const checkA = document.querySelector('tr[data-obj="A"] input[data-col="both"]');
      const checkB = document.querySelector('tr[data-obj="B"] input[data-col="none"]');
      const checkC = document.querySelector('tr[data-obj="C"] input[data-col="one"]');
      if (checkA) checkA.checked = true;
      if (checkB) checkB.checked = true;
      if (checkC) checkC.checked = true;
      
      const mystA = document.getElementById('myst-id-a');
      const mystB = document.getElementById('myst-id-b');
      const mystC = document.getElementById('myst-id-c');
      if (mystA) mystA.value = 'magnetic';
      if (mystB) mystB.value = 'non_magnetic';
      if (mystC) mystC.value = 'magnet';

      const dirAns = document.getElementById('gi6-direction-ans');
      if (dirAns) dirAns.value = 'north-south';
    } else {
      const predInputs = document.querySelectorAll('.pred-select');
      const obsInputs = document.querySelectorAll('.obs-select');
      const conclInputs = document.querySelectorAll('.concl-select');
      predInputs.forEach(i => i.style.border = '');
      obsInputs.forEach(i => i.style.border = '');
      conclInputs.forEach(i => i.style.border = '');
    }
  }

  // --- ACTIONS ---
  clearWorkspace(triggerHistory = true) {
    this.selectedObjects = [];
    this.hideInspector();
    this.resetObjectTesterPanel();
    
    const domObjects = this.container.querySelectorAll('.workspace-element');
    domObjects.forEach(el => el.remove());
    
    this.objects = [];
    
    if (triggerHistory) {
      this.saveHistory();
    }
  }

  resetWorkspace() {
    this.clearWorkspace(false);
    this.testedMaterials = {};
    this.updateRecordTable();
    this.setGuidedInvestigation(this.activeInvestigation);
  }

  initEvents() {
    this.onPointerMoveBound = (e) => this.onPointerMove(e);
    this.onPointerUpBound = (e) => this.onPointerUp(e);
    
    this.container.addEventListener('pointerdown', (e) => {
      if (e.target === this.container || e.target === this.canvas) {
        this.deselectAll();
      }
    });
    
    document.getElementById('inspect-rotate-left').addEventListener('click', () => {
      this.playSound('click');
      this.selectedObjects.forEach(o => {
        o.angle = (o.angle - 15) % 360;
        this.updateDOMPosition(o);
      });
      this.solvePhysics(false);
      this.saveHistory();
    });
    
    document.getElementById('inspect-rotate-right').addEventListener('click', () => {
      this.playSound('click');
      this.selectedObjects.forEach(o => {
        o.angle = (o.angle + 15) % 360;
        this.updateDOMPosition(o);
      });
      this.solvePhysics(false);
      this.saveHistory();
    });
    
    document.getElementById('inspect-copy').addEventListener('click', () => {
      this.playSound('click');
      if (this.selectedObjects.length > 0) {
        const primary = this.selectedObjects[0];
        const rect = this.container.getBoundingClientRect();
        
        const offset = 40;
        const newX = Math.min(rect.width - 50, primary.x + offset);
        const newY = Math.min(rect.height - 50, primary.y + offset);
        
        const newObj = this.addObject(primary.type, primary.subType, newX, newY, primary.angle);
        this.selectObject(newObj);
        
        if (this.objects.filter(o => o.type === 'magnet').length >= 2) {
          this.triggerChallengeUnlock(6, "Dual Magnet Expert");
        }
      }
    });
    
    const flipRingBtn = document.getElementById('inspect-flip-ring');
    if (flipRingBtn) {
      flipRingBtn.addEventListener('click', () => {
        this.playSound('click');
        this.selectedObjects.forEach(o => {
          if (o.subType === 'ring') {
            o.angle = (o.angle === 0) ? 180 : 0;
            this.updateDOMPosition(o);
          }
        });
        this.solveFloatingRings(false);
        this.saveHistory();
      });
    }

    document.getElementById('inspect-delete').addEventListener('click', () => {
      this.playSound('click');
      this.selectedObjects.forEach(o => {
        if (o.element) o.element.remove();
        this.objects = this.objects.filter(obj => obj.id !== o.id);
      });
      this.deselectAll();
      this.saveHistory();
    });
  }
}

// Global App router
class SproutMagnetApp {
  constructor() {
    this.playerName = "Guest Scientist";
    this.playerAvatar = "bear";
    this.magnetSim = null;
    this.initWelcomeEvents();
  }

  initWelcomeEvents() {
    const loginForm = document.getElementById('login-form');
    const nameInput = document.getElementById('pupil-name-input');
    const welcomeScreen = document.getElementById('welcome-screen');
    const gameHeader = document.getElementById('game-header');
    
    const avatarOptions = document.querySelectorAll('.avatar-option-card');
    avatarOptions.forEach(opt => {
      opt.addEventListener('click', () => {
        avatarOptions.forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
        this.playerAvatar = opt.dataset.avatar;
      });
    });

    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.playerName = nameInput.value.trim() || "Guest Scientist";
        
        welcomeScreen.classList.add('hidden');
        gameHeader.classList.remove('hidden');
        
        this.saveStateToStorage();
        this.updateHUDReadout();
        this.switchTab('lobby-view');
      });
    }
    
    document.querySelectorAll('.hud-tabs .tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tabId = btn.dataset.tab;
        this.switchTab(tabId);
      });
    });
    
    document.querySelectorAll('.lobby-link-card').forEach(card => {
      card.addEventListener('click', () => {
        const tabId = card.dataset.target;
        this.switchTab(tabId);
      });
    });
    
    const toggleMagnets = document.getElementById('toggle-magnets-drawer');
    const toggleMaterials = document.getElementById('toggle-materials-drawer');
    const magnetsDrawer = document.getElementById('magnets-drawer-pane');
    const materialsDrawer = document.getElementById('materials-drawer-pane');
    
    if (toggleMagnets && toggleMaterials && magnetsDrawer && materialsDrawer) {
      toggleMagnets.addEventListener('click', () => {
        this.playSound('click');
        toggleMagnets.classList.add('active-drawer');
        toggleMaterials.classList.remove('active-drawer');
        magnetsDrawer.classList.remove('hidden');
        materialsDrawer.classList.add('hidden');
      });
      
      toggleMaterials.addEventListener('click', () => {
        this.playSound('click');
        toggleMaterials.classList.add('active-drawer');
        toggleMagnets.classList.remove('active-drawer');
        materialsDrawer.classList.remove('hidden');
        magnetsDrawer.classList.add('hidden');
      });
    }

    const closeCeleb = document.getElementById('close-celebration-btn');
    if (closeCeleb) {
      closeCeleb.addEventListener('click', () => {
        this.playSound('click');
        document.getElementById('badge-glow-overlay').classList.add('hidden');
      });
    }
    
    this.loadStateFromStorage();
  }

  saveStateToStorage() {
    try {
      const data = {
        playerName: this.playerName,
        playerAvatar: this.playerAvatar,
        completedChallenges: this.magnetSim ? this.magnetSim.completedChallenges : [false, false, false, false, false, false, false],
        unlockedActivities: this.magnetSim ? this.magnetSim.unlockedActivities : { gi1: true, gi2: false, gi3: false, gi4: false, gi5: false, gi6: false, free: false }
      };
      localStorage.setItem("sprout_magnet_lab_state", JSON.stringify(data));
    } catch (e) {
      console.warn("localStorage write failed", e);
    }
  }

  loadStateFromStorage() {
    try {
      const saved = localStorage.getItem("sprout_magnet_lab_state");
      if (saved) {
        const data = JSON.parse(saved);
        this.playerName = data.playerName || "Guest Scientist";
        this.playerAvatar = data.playerAvatar || "bear";
        
        const nameInput = document.getElementById('pupil-name-input');
        if (nameInput) nameInput.value = this.playerName;
        
        const avatarOptions = document.querySelectorAll('.avatar-option-card');
        avatarOptions.forEach(opt => {
          if (opt.dataset.avatar === this.playerAvatar) {
            opt.classList.add('selected');
          } else {
            opt.classList.remove('selected');
          }
        });
        
        if (this.magnetSim) {
          this.magnetSim.completedChallenges = data.completedChallenges || [false, false, false, false, false, false, false];
          if (data.unlockedActivities) {
            this.magnetSim.unlockedActivities = Object.assign({ gi1: true }, data.unlockedActivities);
            this.magnetSim.updateInvestigationDropdown();
          }
          this.magnetSim.updateChallengeCards();
        }
      }
    } catch (e) {
      console.warn("Storage load failed", e);
    }
  }

  updateHUDReadout() {
    const readoutName = document.getElementById('player-name-readout');
    const readoutAvatar = document.getElementById('player-avatar-readout');
    const lobbyName = document.getElementById('lobby-player-name');
    const lobbyHelperEmoji = document.getElementById('lobby-helper-emoji');
    const lobbyHelperName = document.getElementById('lobby-helper-name');
    const lobbySpeech = document.getElementById('lobby-speech-bubble');
    
    if (readoutName) readoutName.textContent = this.playerName;
    if (lobbyName) lobbyName.textContent = this.playerName;
    
    const avatarsInfo = {
      bear: { emoji: '🐻', name: 'Professor Sprout', greeting: 'Hi there, Scientist! Let\'s go to the **Virtual Workbench** to start sliding, snapping, and pulling magnets together!' },
      fox: { emoji: '🦊', name: 'Sparky Fox', greeting: 'Hey! I\'m Sparky. Let\'s explore which metals are magnetic and draw conclusions in our **Lab Journal**!' },
      owl: { emoji: '🦉', name: 'Hoot Owl', greeting: 'Greetings, Scientist. Let\'s research the invisible magnetic field lines on the **Virtual Workbench**!' },
      frog: { emoji: '🐸', name: 'Hopper Frog', greeting: 'Ribbit! Hopper here! Let\'s test if magnetic force can jump through paper or water on the **Virtual Workbench**!' }
    };
    
    const chosen = avatarsInfo[this.playerAvatar] || avatarsInfo.bear;
    if (readoutAvatar) readoutAvatar.textContent = chosen.emoji;
    if (lobbyHelperEmoji) lobbyHelperEmoji.textContent = chosen.emoji;
    if (lobbyHelperName) lobbyHelperName.textContent = chosen.name;
    if (lobbySpeech) lobbySpeech.innerHTML = chosen.greeting;
  }

  switchTab(tabId) {
    this.playSound('click');
    
    document.getElementById('lobby-view').classList.add('hidden');
    document.getElementById('workbench-view').classList.add('hidden');
    document.getElementById('journal-view').classList.add('hidden');
    document.getElementById('badge-view').classList.add('hidden');
    
    const targetScreen = document.getElementById(tabId);
    if (targetScreen) targetScreen.classList.remove('hidden');
    
    document.querySelectorAll('.hud-tabs .tab-btn').forEach(btn => {
      if (btn.dataset.tab === tabId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
    
    if (tabId === 'workbench-view') {
      this.initSimulator();
    }
  }

  initSimulator() {
    if (!this.magnetSim) {
      this.magnetSim = new MagnetSimulation("magnet-workspace", this);
      this.bindMagnetLabEvents();
      this.loadStateFromStorage();
      this.magnetSim.setGuidedInvestigation('gi1');
      this.magnetSim.updateInvestigationDropdown();
    } else {
      setTimeout(() => this.magnetSim.resizeCanvas(), 50);
    }
  }

  bindMagnetLabEvents() {
    // Spawn buttons
    document.querySelectorAll('.magnet-spawn-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (this.magnetSim) {
          const type = btn.dataset.type;
          this.magnetSim.addObject('magnet', type);
        }
      });
    });

    document.querySelectorAll('.material-spawn-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (this.magnetSim) {
          const type = btn.dataset.type;
          this.magnetSim.addObject('material', type);
        }
      });
    });

    // Control buttons
    document.getElementById('control-clear-btn').addEventListener('click', () => {
      if (this.magnetSim) {
        this.magnetSim.playSound('click');
        this.magnetSim.clearWorkspace();
      }
    });

    document.getElementById('control-reset-btn').addEventListener('click', () => {
      if (this.magnetSim) {
        this.magnetSim.playSound('click');
        this.magnetSim.resetWorkspace();
      }
    });

    document.getElementById('control-undo-btn').addEventListener('click', () => {
      if (this.magnetSim) {
        this.magnetSim.undo();
      }
    });

    const fieldBtn = document.getElementById('control-field-btn');
    fieldBtn.addEventListener('click', () => {
      if (this.magnetSim) {
        this.magnetSim.playSound('click');
        this.magnetSim.showFieldLines = !this.magnetSim.showFieldLines;
        fieldBtn.textContent = this.magnetSim.showFieldLines ? "🧬 Hide Magnetic Field" : "🧬 Show Magnetic Field";
        fieldBtn.style.background = this.magnetSim.showFieldLines ? "var(--accent-amber)" : "";
        fieldBtn.style.color = this.magnetSim.showFieldLines ? "white" : "";
      }
    });

    const rulerBtn = document.getElementById('control-ruler-btn');
    rulerBtn.addEventListener('click', () => {
      if (this.magnetSim) {
        this.magnetSim.playSound('click');
        this.magnetSim.showRuler = !this.magnetSim.showRuler;
        const rulerEl = document.getElementById('workspace-ruler');
        if (rulerEl) {
          if (this.magnetSim.showRuler) rulerEl.classList.remove('hidden');
          else rulerEl.classList.add('hidden');
        }
        rulerBtn.textContent = this.magnetSim.showRuler ? "📏 Hide Ruler" : "📏 Show Ruler";
        rulerBtn.style.background = this.magnetSim.showRuler ? "var(--accent-amber)" : "";
        rulerBtn.style.color = this.magnetSim.showRuler ? "white" : "";
        this.magnetSim.solvePhysics(false);
      }
    });

    const muteBtn = document.getElementById('mute-sound-btn');
    muteBtn.addEventListener('click', () => {
      if (this.magnetSim) {
        this.magnetSim.isMuted = !this.magnetSim.isMuted;
        muteBtn.textContent = this.magnetSim.isMuted ? "🔇 Sound: OFF" : "🔊 Sound: ON";
        this.magnetSim.playSound('click');
      }
    });

    document.getElementById('help-sprout-btn').addEventListener('click', () => {
      if (this.magnetSim) {
        this.magnetSim.playSound('click');
        const hints = {
          free: "Place two magnets together. Opposite poles pull, like poles push!",
          gi1: "Test all 5 magnet shapes. Watch how same colours push apart and opposite colours snap together!",
          gi2: "Nails and washers are magnetic metals. Aluminium foil is a metal too, but is non-magnetic!",
          gi3: "Drag the magnet over the paper clips. The clips will attract and cluster mostly at the poles!",
          gi4: "If ring magnets float on the rod, they repel because their like-poles face each other!",
          gi5: "Casing A attracts both poles (Iron). B doesn't react (Plastic). C repels one pole (Magnet!).",
          gi6: "Drag or rotate the suspended magnet or water float, and watch them automatically swing to point North-South."
        };
        alert("🐻 Scientist Partner says:\n\n" + (hints[this.magnetSim.activeInvestigation] || hints.free));
      }
    });

    // Teacher mode & Dashboard — password protected
    this.teacherModeActive = false;
    const teacherBtn       = document.getElementById('teacher-mode-btn');
    const teacherModal     = document.getElementById('teacher-pw-modal');
    const teacherLoginBox  = document.getElementById('teacher-login-box');
    const teacherManageBox = document.getElementById('teacher-manage-box');
    const teacherInput     = document.getElementById('teacher-pw-input');
    const teacherError     = document.getElementById('teacher-pw-error');
    const teacherCancel    = document.getElementById('teacher-pw-cancel');
    const teacherSubmit    = document.getElementById('teacher-pw-submit');
    const teacherDoneBtn   = document.getElementById('teacher-dashboard-done-btn');
    const teacherEnableAll = document.getElementById('teacher-enable-all-btn');
    const teacherDisableAll= document.getElementById('teacher-disable-all-btn');

    const updateManageCheckboxes = () => {
      if (!this.magnetSim) return;
      document.querySelectorAll('.teacher-module-toggle').forEach(chk => {
        const gi = chk.dataset.gi;
        chk.checked = !!this.magnetSim.unlockedActivities[gi];
      });
    };

    const openTeacherModal = () => {
      if (this.teacherModeActive) {
        // Show management dashboard directly
        updateManageCheckboxes();
        if (teacherLoginBox) teacherLoginBox.style.display = 'none';
        if (teacherManageBox) teacherManageBox.style.display = 'block';
        if (teacherModal) teacherModal.style.display = 'flex';
        return;
      }
      if (teacherLoginBox) teacherLoginBox.style.display = 'block';
      if (teacherManageBox) teacherManageBox.style.display = 'none';
      if (teacherInput) teacherInput.value = '';
      if (teacherError) teacherError.style.display = 'none';
      if (teacherModal) teacherModal.style.display = 'flex';
      setTimeout(() => { if (teacherInput) teacherInput.focus(); }, 50);
    };

    const closeTeacherModal = () => {
      if (teacherModal) teacherModal.style.display = 'none';
    };

    const submitTeacherPassword = () => {
      if (teacherInput.value === 'admin') {
        this.teacherModeActive = true;
        teacherBtn.textContent = '🔓 Teacher: ON';
        teacherBtn.style.background = '#059669';
        if (this.magnetSim) this.magnetSim.toggleTeacherMode(true);
        
        // Show management dashboard
        updateManageCheckboxes();
        if (teacherLoginBox) teacherLoginBox.style.display = 'none';
        if (teacherManageBox) teacherManageBox.style.display = 'block';
      } else {
        if (teacherError) teacherError.style.display = 'block';
        teacherInput.value = '';
        teacherInput.focus();
      }
    };

    if (teacherBtn)    teacherBtn.addEventListener('click', openTeacherModal);
    if (teacherCancel) teacherCancel.addEventListener('click', closeTeacherModal);
    if (teacherSubmit) teacherSubmit.addEventListener('click', submitTeacherPassword);
    if (teacherDoneBtn) teacherDoneBtn.addEventListener('click', closeTeacherModal);

    if (teacherInput)  teacherInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') submitTeacherPassword();
      if (e.key === 'Escape') closeTeacherModal();
    });

    document.querySelectorAll('.teacher-module-toggle').forEach(chk => {
      chk.addEventListener('change', () => {
        const gi = chk.dataset.gi;
        if (this.magnetSim) {
          this.magnetSim.unlockedActivities[gi] = chk.checked;
          this.magnetSim.updateInvestigationDropdown();
          this.saveStateToStorage();
        }
      });
    });

    if (teacherEnableAll) {
      teacherEnableAll.addEventListener('click', () => {
        if (this.magnetSim) {
          this.magnetSim.unlockAllActivities();
          updateManageCheckboxes();
          this.saveStateToStorage();
        }
      });
    }

    if (teacherDisableAll) {
      teacherDisableAll.addEventListener('click', () => {
        if (this.magnetSim) {
          Object.keys(this.magnetSim.unlockedActivities).forEach(k => {
            this.magnetSim.unlockedActivities[k] = (k === 'gi1');
          });
          this.magnetSim.updateInvestigationDropdown();
          updateManageCheckboxes();
          this.saveStateToStorage();
        }
      });
    }

    // Close modal if backdrop clicked
    if (teacherModal) teacherModal.addEventListener('click', (e) => {
      if (e.target === teacherModal) closeTeacherModal();
    });

    // Activity unlock password modal
    const actModal  = document.getElementById('activity-pw-modal');
    const actInput  = document.getElementById('activity-pw-input');
    const actError  = document.getElementById('activity-pw-error');
    const actCancel = document.getElementById('activity-pw-cancel');
    const actSubmit = document.getElementById('activity-pw-submit');
    const actTitle  = document.getElementById('activity-pw-title');
    const actDesc   = document.getElementById('activity-pw-desc');
    let pendingUnlockKey = null;

    const openActivityUnlockModal = (key) => {
      pendingUnlockKey = key;
      const names = {
        gi1: "Experiment 1",
        gi2: "Experiment 2",
        gi3: "Experiment 3",
        gi4: "Experiment 4",
        gi5: "Experiment 5",
        gi6: "Experiment 6",
        free: "Free Play & Graphing"
      };
      const expName = names[key] || "Experiment";
      if (actTitle) actTitle.textContent = `🔒 ${expName} Locked`;
      if (actDesc) actDesc.textContent = `Enter teacher password to unlock ${expName} for pupils:`;
      if (actInput) actInput.value = '';
      if (actError) actError.style.display = 'none';
      if (actModal) actModal.style.display = 'flex';
      setTimeout(() => { if (actInput) actInput.focus(); }, 50);
    };

    const closeActivityUnlockModal = () => {
      if (actModal) actModal.style.display = 'none';
      pendingUnlockKey = null;
    };

    const submitActivityUnlockPassword = () => {
      if (!actInput || !pendingUnlockKey) return;
      const code = actInput.value.trim().toUpperCase();
      const MODULE_PASSCODES = {
        gi1: ["PUSH"],
        gi2: ["CLASS", "PULL-61B", "PULL61B"],
        gi3: ["POLES", "POLE-62A", "POLE62A"],
        gi4: ["RINGS", "RING-63B", "RING63B"],
        gi5: ["MYSTERY", "CASE-63C", "CASE63C"],
        gi6: ["ALIGN", "ALIGN-64", "ALIGN64"],
        free: ["GRAPH", "SPROUT-FREE", "SPROUTFREE", "FREE"]
      };
      const validCodes = MODULE_PASSCODES[pendingUnlockKey] || [];
      const isValid = (code === 'ADMIN') || validCodes.includes(code);

      if (isValid) {
        const key = pendingUnlockKey;
        closeActivityUnlockModal();
        if (this.magnetSim && key) {
          this.magnetSim.unlockActivity(key);
          const select = document.getElementById('guided-investigation-select');
          if (select) select.value = key;
          this.magnetSim.setGuidedInvestigation(key);
          this.magnetSim.playSound('success');
        }
      } else {
        if (actError) actError.style.display = 'block';
        actInput.value = '';
        actInput.focus();
      }
    };

    if (actCancel) actCancel.addEventListener('click', closeActivityUnlockModal);
    if (actSubmit) actSubmit.addEventListener('click', submitActivityUnlockPassword);
    if (actInput)  actInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') submitActivityUnlockPassword();
      if (e.key === 'Escape') closeActivityUnlockModal();
    });
    if (actModal)  actModal.addEventListener('click', (e) => {
      if (e.target === actModal) closeActivityUnlockModal();
    });

    document.getElementById('test-check-obs-btn').addEventListener('click', () => {
      if (this.magnetSim) {
        this.magnetSim.checkObservationClick();
      }
    });

    document.getElementById('test-reveal-concl-btn').addEventListener('click', () => {
      if (this.magnetSim) {
        this.magnetSim.revealConclusionClick();
      }
    });

    document.getElementById('table-check-btn').addEventListener('click', () => {
      if (this.magnetSim) {
        this.magnetSim.checkTableWork();
      }
    });

    document.getElementById('guided-investigation-select').addEventListener('change', (e) => {
      if (!this.magnetSim) return;
      const targetKey = e.target.value;
      const currentKey = this.magnetSim.activeInvestigation;
      if (this.magnetSim.isActivityUnlocked(targetKey)) {
        this.magnetSim.playSound('click');
        this.magnetSim.setGuidedInvestigation(targetKey);
      } else {
        // Revert select dropdown to currently active investigation
        e.target.value = currentKey;
        // Prompt for teacher password to unlock
        openActivityUnlockModal(targetKey);
      }
    });
  }

  playSound(type) {
    if (this.magnetSim) {
      this.magnetSim.playSound(type);
    } else {
      try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.setValueAtTime(700, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.05);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.05);
      } catch (e) {}
    }
  }

  showCompletionModal(expName, nextKey, passcode, nextName) {
    const modal = document.getElementById('completion-passcode-modal');
    const title = document.getElementById('completion-title');
    const desc  = document.getElementById('completion-desc');
    const label = document.getElementById('completion-passcode-label');
    const code  = document.getElementById('completion-passcode-code');
    const goNextBtn = document.getElementById('completion-go-next-btn');
    const closeBtn  = document.getElementById('completion-close-btn');

    if (!modal) return;
    if (title) title.textContent = "🎉 Module Completed!";
    if (desc)  desc.textContent = `Awesome job, Scientist! You completed ${expName}.`;
    if (label) label.textContent = `🔑 Passcode for ${nextName}:`;
    if (code)  code.textContent = passcode;

    modal.style.display = 'flex';
    this.playSound('success');

    if (goNextBtn) {
      goNextBtn.onclick = () => {
        modal.style.display = 'none';
        if (this.magnetSim && nextKey) {
          const select = document.getElementById('guided-investigation-select');
          if (select) select.value = nextKey;
          this.magnetSim.setGuidedInvestigation(nextKey);
        }
      };
    }

    if (closeBtn) {
      closeBtn.onclick = () => {
        modal.style.display = 'none';
      };
    }
  }
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', () => {
    window.app = new SproutMagnetApp();
  });
} else {
  window.app = new SproutMagnetApp();
}
