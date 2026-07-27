// Interactive Scientific Simulations Module

// --- 1. WATER CYCLE: EVAPORATION ANIMATION ---
class EvaporationSimulation {
  constructor(canvasId) {
    const container = document.getElementById(canvasId);
    if (!container) return;

    if (container.tagName.toLowerCase() !== 'canvas') {
      container.innerHTML = `<canvas id="${canvasId}-canvas" style="width:100%; height:100%; display:block;"></canvas>`;
      this.canvas = document.getElementById(`${canvasId}-canvas`);
    } else {
      this.canvas = container;
    }

    this.ctx = this.canvas.getContext('2d');
    this.isRunning = false;
    this.animationFrameId = null;
    this.particles = [];
    this.timeElapsed = 0;
    this.waterLevels = { narrow: 120, medium: 120, wide: 120 };
    this.targetWaterLevels = { narrow: 120, medium: 120, wide: 120 };
    this.lastTime = 0;

    // Responsive sizing
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    if (!this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width * window.devicePixelRatio;
    this.canvas.height = rect.height * window.devicePixelRatio;
    this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  }

  start(narrowRate, mediumRate, wideRate) {
    this.isRunning = true;
    this.timeElapsed = 0;
    this.particles = [];
    this.waterLevels = { narrow: 120, medium: 120, wide: 120 };
    // Targets: initial is 120px height of water.
    // Narrow evaporates 5% (drops 6px), Medium evaporates 10% (drops 12px), Wide evaporates 16% (drops 19.2px)
    this.targetWaterLevels = {
      narrow: 120 - 5 * 1.5,
      medium: 120 - 10 * 1.5,
      wide: 120 - 16 * 1.5
    };
    this.lastTime = performance.now();
    this.animate();
  }

  stop() {
    this.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  animate() {
    if (!this.isRunning) return;
    const now = performance.now();
    const dt = (now - this.lastTime) / 1000;
    this.lastTime = now;

    this.timeElapsed += dt;
    // Cap simulation at 8 seconds
    if (this.timeElapsed > 8) {
      this.timeElapsed = 8;
    }

    this.update(dt);
    this.draw();

    this.animationFrameId = requestAnimationFrame(() => this.animate());
  }

  update(dt) {
    const progress = Math.min(this.timeElapsed / 8, 1);
    
    // Smoothly decrease water levels
    this.waterLevels.narrow = 120 - (120 - this.targetWaterLevels.narrow) * progress;
    this.waterLevels.medium = 120 - (120 - this.targetWaterLevels.medium) * progress;
    this.waterLevels.wide = 120 - (120 - this.targetWaterLevels.wide) * progress;

    // Generate vapor particles
    // Generation rate based on surface area
    const w = this.canvas.width / window.devicePixelRatio;
    const h = this.canvas.height / window.devicePixelRatio;
    
    // Narrow Container (Center X = w * 0.2, Surface Width = 30)
    if (progress < 1 && Math.random() < 0.05) {
      this.particles.push(this.createParticle(w * 0.2 - 15 + Math.random() * 30, h - this.waterLevels.narrow));
    }
    // Medium Container (Center X = w * 0.5, Surface Width = 60)
    if (progress < 1 && Math.random() < 0.12) {
      this.particles.push(this.createParticle(w * 0.5 - 30 + Math.random() * 60, h - this.waterLevels.medium));
    }
    // Wide Container (Center X = w * 0.8, Surface Width = 110)
    if (progress < 1 && Math.random() < 0.25) {
      this.particles.push(this.createParticle(w * 0.8 - 55 + Math.random() * 110, h - this.waterLevels.wide));
    }

    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.y -= p.speedY * dt * 40;
      p.x += Math.sin(p.y * 0.05) * p.sway * dt * 15;
      p.opacity -= dt * 0.25;
      p.size += dt * 0.5;

      if (p.opacity <= 0 || p.y < 30) {
        this.particles.splice(i, 1);
      }
    }
  }

  createParticle(x, y) {
    return {
      x: x,
      y: y - 5,
      speedY: 0.8 + Math.random() * 0.8,
      sway: (Math.random() - 0.5) * 2,
      size: 2 + Math.random() * 3,
      opacity: 1.0
    };
  }

  draw() {
    const ctx = this.ctx;
    const w = this.canvas.width / window.devicePixelRatio;
    const h = this.canvas.height / window.devicePixelRatio;

    ctx.clearRect(0, 0, w, h);

    // Draw background grid lines or lab bench
    ctx.strokeStyle = 'rgba(15, 23, 42, 0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, h - 30);
    ctx.lineTo(w, h - 30);
    ctx.stroke();

    // Lab bench
    ctx.fillStyle = 'rgba(30, 41, 59, 0.8)';
    ctx.fillRect(0, h - 30, w, 30);

    // Container metrics (Centers: 20%, 50%, 80%)
    const containers = [
      { id: 'narrow', cx: w * 0.2, topW: 30, baseW: 30, height: 130, label: 'Narrow' },
      { id: 'medium', cx: w * 0.5, topW: 60, baseW: 60, height: 130, label: 'Medium' },
      { id: 'wide', cx: w * 0.8, topW: 110, baseW: 110, height: 130, label: 'Wide' }
    ];

    containers.forEach(c => {
      const waterH = this.waterLevels[c.id];
      const bottomY = h - 30;
      const topY = bottomY - c.height;

      // Draw Water first (inside boundaries)
      ctx.fillStyle = 'rgba(14, 165, 233, 0.45)'; // Sleek cyan water
      ctx.beginPath();
      ctx.moveTo(c.cx - c.baseW / 2 + 2, bottomY - 2);
      ctx.lineTo(c.cx + c.baseW / 2 - 2, bottomY - 2);
      ctx.lineTo(c.cx + c.topW / 2 - 2, bottomY - waterH);
      ctx.lineTo(c.cx - c.topW / 2 + 2, bottomY - waterH);
      ctx.closePath();
      ctx.fill();

      // Draw meniscus top line
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.8)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(c.cx - c.topW / 2 + 2, bottomY - waterH);
      ctx.lineTo(c.cx + c.topW / 2 - 2, bottomY - waterH);
      ctx.stroke();

      // Draw Glass Container Outline
      ctx.strokeStyle = 'rgba(15, 23, 42, 0.45)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(c.cx - c.topW / 2, topY);
      ctx.lineTo(c.cx - c.baseW / 2, bottomY);
      ctx.lineTo(c.cx + c.baseW / 2, bottomY);
      ctx.lineTo(c.cx + c.topW / 2, topY);
      ctx.stroke();

      // Draw Container labels
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 12px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(c.label, c.cx, topY - 15);

      // Draw current water volume text
      const pctLeft = Math.round((waterH / 120) * 100);
      ctx.fillStyle = '#334155';
      ctx.font = '10px Outfit, sans-serif';
      ctx.fillText(`${pctLeft} ml`, c.cx, bottomY - waterH - 6);
    });

    // Draw escaping particles
    this.particles.forEach(p => {
      ctx.fillStyle = `rgba(186, 230, 253, ${p.opacity})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
  }
}


// --- 2. ELECTRICAL SYSTEMS: CIRCUIT BUILDER ---
class CircuitBuilder {
  constructor(containerId, onCircuitChanged) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;
    this.onCircuitChanged = onCircuitChanged;

    this.slots = {
      power: { value: null, expected: "battery", rect: null },
      bulb1: { value: null, expected: "bulb", rect: null },
      switch: { value: null, expected: "switch", rect: null },
      bulb2: { value: null, expected: "wire_bulb", rect: null } // Can be bulb or wire
    };

    this.selectedCircuitType = "A"; // Default is A: 1 bulb
    this.setupErrorMode = false;
    this.activeErrorCase = null;
    this.resizeHandler = () => this.drawWires();

    this.initHTML();
    this.bindEvents();
  }

  setCircuitType(type) {
    this.selectedCircuitType = type;
    this.reset();
  }

  setErrorCase(errorCase) {
    this.reset();
    this.setupErrorMode = true;
    this.activeErrorCase = errorCase;
    
    // Pre-populate slots according to the error scenario, showing incorrect components
    if (errorCase === "open_switch") {
      this.slots.power.value = { type: "battery", label: "Battery", faulty: false };
      this.slots.bulb1.value = { type: "bulb", label: "Bulb", faulty: false };
      this.slots.switch.value = { type: "switch_open", label: "Open Switch", faulty: true };
      this.slots.bulb2.value = { type: "wire", label: "Wire", faulty: false };
    } else if (errorCase === "disconnected_wire") {
      this.slots.power.value = { type: "battery_disconnected", label: "Broken Connection", faulty: true };
      this.slots.bulb1.value = { type: "bulb", label: "Bulb", faulty: false };
      this.slots.switch.value = { type: "switch", label: "Closed Switch", faulty: false };
      this.slots.bulb2.value = { type: "wire", label: "Wire", faulty: false };
    } else if (errorCase === "battery_wrong_way") {
      this.slots.power.value = { type: "battery_reversed", label: "Reversed Battery", faulty: true };
      this.slots.bulb1.value = { type: "bulb", label: "Bulb", faulty: false };
      this.slots.switch.value = { type: "switch", label: "Closed Switch", faulty: false };
      this.slots.bulb2.value = { type: "wire", label: "Wire", faulty: false };
    } else if (errorCase === "terminal_mismatch") {
      this.slots.power.value = { type: "battery", label: "Battery", faulty: false };
      this.slots.bulb1.value = { type: "bulb_casing_only", label: "Incorrect Bulb Connection", faulty: true };
      this.slots.switch.value = { type: "switch_open", label: "Open Switch", faulty: true };
      this.slots.bulb2.value = { type: "wire", label: "Wire", faulty: false };
    }
    
    this.updateBoard();
    this.updateToolbox();
    this.checkCircuit();
  }

  reset() {
    this.setupErrorMode = false;
    this.activeErrorCase = null;
    this.slots.power.value = null;
    this.slots.bulb1.value = null;
    this.slots.switch.value = null;
    this.slots.bulb2.value = null;
    this.updateBoard();
    if (this.onCircuitChanged) this.onCircuitChanged(false, 0, null);
  }

  initHTML() {
    this.container.innerHTML = `
      <div class="circuit-builder-wrapper">
        <div class="circuit-instructions mb-4">
          <p class="text-sm text-slate-300" id="circuit-instruction-text">Drag components from the Toolbox into the flashing slots on the board to complete the circuit.</p>
        </div>
        
        <div class="circuit-board-container relative rounded-xl border border-slate-700 bg-slate-900/60 p-6 flex flex-col items-center">
          <!-- Main Circuit Loop Graphic -->
          <svg class="absolute inset-0 w-full h-full pointer-events-none" id="circuit-wire-svg">
            <path fill="none" stroke="rgba(71, 85, 105, 0.3)" stroke-width="6" id="wire-base" />
            <path fill="none" stroke="#eab308" stroke-dasharray="10 15" stroke-width="6" 
                  class="hidden" id="wire-current-flow" />
          </svg>

          <!-- Hotspots grid layout -->
          <div class="grid grid-cols-3 gap-12 w-full max-w-lg relative z-10 py-8">
            <!-- Top Slot: Switch -->
            <div class="col-start-2 flex flex-col items-center">
              <div class="circuit-slot border-2 border-dashed border-sky-400 bg-sky-950/30 w-28 h-20 rounded-lg flex items-center justify-center transition-all duration-300 cursor-pointer" 
                   data-slot="switch" id="slot-switch">
                <span class="text-xs text-sky-300 pointer-events-none">Closed Switch</span>
              </div>
            </div>
            
            <!-- Left Slot: Power (Battery) -->
            <div class="col-start-1 row-start-2 flex items-center justify-center">
              <div class="circuit-slot border-2 border-dashed border-sky-400 bg-sky-950/30 w-24 h-28 rounded-lg flex items-center justify-center transition-all duration-300 cursor-pointer" 
                   data-slot="power" id="slot-power">
                <span class="text-xs text-sky-300 pointer-events-none">Battery Pack</span>
              </div>
            </div>

            <!-- Light Sensor Digital Readout in center -->
            <div class="col-start-2 row-start-2 flex flex-col items-center justify-center">
              <div class="light-sensor bg-slate-950/90 border border-slate-700 rounded-lg p-3 text-center shadow-lg w-28">
                <div class="text-[9px] text-amber-500 font-bold uppercase tracking-wider">Digital Light Sensor</div>
                <div class="text-lg font-mono text-amber-400 mt-1" id="sensor-val">0.0 units</div>
              </div>
            </div>

            <!-- Right Slot: Bulb 1 -->
            <div class="col-start-3 row-start-2 flex items-center justify-center">
              <div class="circuit-slot border-2 border-dashed border-sky-400 bg-sky-950/30 w-24 h-28 rounded-lg flex items-center justify-center transition-all duration-300 cursor-pointer" 
                   data-slot="bulb1" id="slot-bulb1">
                <span class="text-xs text-sky-300 pointer-events-none">Bulb 1</span>
              </div>
            </div>

            <!-- Bottom Slot: Bulb 2 or Wire -->
            <div class="col-start-2 row-start-3 flex flex-col items-center">
              <div class="circuit-slot border-2 border-dashed border-sky-400 bg-sky-950/30 w-28 h-20 rounded-lg flex items-center justify-center transition-all duration-300 cursor-pointer" 
                   data-slot="bulb2" id="slot-bulb2">
                <span class="text-xs text-sky-300 pointer-events-none" id="slot-bulb2-label">Connecting Wire</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Tool Box containing draggables -->
        <div class="circuit-toolbox mt-6 border border-slate-700 bg-slate-900/40 rounded-xl p-4">
          <div class="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">Component Toolbox</div>
          <div class="flex flex-wrap gap-4 justify-center" id="toolbox-items">
            <!-- Will be dynamically populated depending on normal or error mode -->
          </div>
        </div>
      </div>
    `;
  }

  bindEvents() {
    this.updateToolbox();
    window.addEventListener('resize', this.resizeHandler);

    // Attach click events on slots for mobile fallback, or drag/drop events
    const slotElements = this.container.querySelectorAll(".circuit-slot");
    slotElements.forEach(slot => {
      slot.addEventListener('dragover', (e) => {
        e.preventDefault();
        slot.classList.add('bg-sky-500/20');
      });

      slot.addEventListener('dragleave', () => {
        slot.classList.remove('bg-sky-500/20');
      });

      slot.addEventListener('drop', (e) => {
        e.preventDefault();
        slot.classList.remove('bg-sky-500/20');
        const compType = e.dataTransfer.getData('text/plain');
        const compLabel = e.dataTransfer.getData('text/label');
        const compFaulty = e.dataTransfer.getData('text/faulty') === 'true';
        this.placeComponent(slot.dataset.slot, compType, compLabel, compFaulty);
      });

      // Click to remove
      slot.addEventListener('click', () => {
        const slotName = slot.dataset.slot;
        if (this.slots[slotName].value && !this.setupErrorMode) {
          this.slots[slotName].value = null;
          this.updateBoard();
          this.checkCircuit();
        }
      });
    });
  }

  updateToolbox() {
    const toolbox = this.container.querySelector("#toolbox-items");
    const toolboxContainer = this.container.querySelector(".circuit-toolbox");
    const instructionText = this.container.querySelector("#circuit-instruction-text");
    if (!toolbox) return;

    if (this.setupErrorMode) {
      if (toolboxContainer) toolboxContainer.classList.add("hidden");
      if (instructionText) {
        instructionText.innerHTML = `🕵️ <strong>Interactive Diagnostic:</strong> Examine the circuit setup below. Identify why the bulb fails to light up and answer the question below.`;
      }
      return;
    }

    if (toolboxContainer) toolboxContainer.classList.remove("hidden");
    if (instructionText) {
      instructionText.innerHTML = `Drag components from the Toolbox into the flashing slots on the board to complete the circuit.`;
    }

    // Normal mode toolbox components
    const components = [
      { type: "battery", label: "Fresh Battery Pack", icon: "🔋" },
      { type: "bulb", label: "Light Bulb", icon: "💡" },
      { type: "switch", label: "Closed Switch", icon: "🔌" }
    ];

    if (this.selectedCircuitType === "A") {
      components.push({ type: "wire", label: "Connecting Wire", icon: "➖" });
    } else {
      components.push({ type: "bulb", label: "Light Bulb 2", icon: "💡" });
    }

    toolbox.innerHTML = components.map(c => `
      <div class="toolbox-card bg-slate-800 border border-slate-700 rounded-lg p-3 flex flex-col items-center justify-center cursor-grab hover:bg-slate-700 active:cursor-grabbing select-none w-28 transition-all"
           draggable="true" data-type="${c.type}" data-label="${c.label}">
        <span class="text-3xl mb-1">${c.icon}</span>
        <span class="text-[10px] text-center text-slate-200 font-medium leading-tight">${c.label}</span>
      </div>
    `).join('');

    // Add drag handlers
    const cards = toolbox.querySelectorAll(".toolbox-card");
    cards.forEach(card => {
      card.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', card.dataset.type);
        e.dataTransfer.setData('text/label', card.dataset.label);
        e.dataTransfer.setData('text/faulty', 'false');
      });
    });
  }

  placeComponent(slotName, type, label, faulty) {
    if (this.setupErrorMode) return; // Locked in error mode

    // Validate slots
    if (slotName === "bulb2") {
      // Slot bulb2 can hold wire (for circuit A) or bulb (for circuit B and C)
      const allowed = this.selectedCircuitType === "A" ? ["wire"] : ["bulb"];
      if (!allowed.includes(type)) {
        alert(`For Circuit ${this.selectedCircuitType}, the bottom slot must be a ${this.selectedCircuitType === "A" ? 'wire' : 'bulb'}.`);
        return;
      }
    } else {
      // Strict matching
      if (this.slots[slotName].expected !== type) {
        alert(`You cannot put a ${label} in this slot.`);
        return;
      }
    }

    this.slots[slotName].value = { type, label, faulty };
    this.updateBoard();
    this.checkCircuit();
  }

  updateBoard() {
    // Set labels
    const slotBulb2Label = this.container.querySelector("#slot-bulb2-label");
    if (slotBulb2Label) {
      slotBulb2Label.textContent = this.selectedCircuitType === "A" ? "Connecting Wire" : "Bulb";
    }

    // Populate slots visually
    for (const [name, slot] of Object.entries(this.slots)) {
      const slotEl = this.container.querySelector(`#slot-${name}`);
      if (!slotEl) continue;

      if (slot.value) {
        slotEl.classList.remove('border-dashed', 'border-sky-400', 'bg-sky-950/30');
        slotEl.classList.add('border-solid', 'border-slate-600', 'bg-slate-800');

        let visualContent = "";
        const faultyStr = slot.value.faulty ? 'border-2 border-red-500' : '';
        
        switch (slot.value.type) {
          case "battery":
            visualContent = `<div class="flex flex-col items-center p-2 text-center ${faultyStr}">
              <span class="text-2xl">🔋</span>
              <span class="text-[10px] text-slate-300 font-semibold mt-1">BATTERY</span>
            </div>`;
            break;
          case "battery_reversed":
            visualContent = `<div class="flex flex-col items-center p-2 text-center border-2 border-yellow-500 rounded bg-red-950/20">
              <span class="text-2xl transform rotate-180 inline-block">🔋</span>
              <span class="text-[9px] text-red-300 font-semibold mt-1">REVERSED CELL</span>
            </div>`;
            break;
          case "battery_disconnected":
            visualContent = `<div class="flex flex-col items-center p-2 text-center border-2 border-red-500 rounded bg-red-950/20">
              <span class="text-2xl">🔌❌</span>
              <span class="text-[9px] text-red-300 font-semibold mt-1">BROKEN WIRE</span>
            </div>`;
            break;
          case "bulb":
            visualContent = `<div class="flex flex-col items-center p-2 text-center bulb-graphic ${name}">
              <span class="text-2xl bulb-icon transition-all duration-300">💡</span>
              <span class="text-[10px] text-slate-300 font-semibold mt-1">BULB</span>
            </div>`;
            break;
          case "bulb_casing_only":
            visualContent = `<div class="flex flex-col items-center p-2 text-center border-2 border-yellow-500 rounded bg-red-950/20">
              <span class="text-2xl opacity-60">💡❓</span>
              <span class="text-[9px] text-red-300 font-semibold mt-1">BAD TERMINALS</span>
            </div>`;
            break;
          case "switch":
            visualContent = `<div class="flex flex-col items-center p-2 text-center">
              <span class="text-xl">🔌</span>
              <span class="text-[10px] text-emerald-400 font-semibold">CLOSED</span>
            </div>`;
            break;
          case "switch_open":
            visualContent = `<div class="flex flex-col items-center p-2 text-center border-2 border-red-500 rounded">
              <span class="text-xl opacity-60">🔌🔓</span>
              <span class="text-[10px] text-red-400 font-semibold">OPEN SWITCH</span>
            </div>`;
            break;
          case "wire":
            visualContent = `<div class="flex flex-col items-center p-2 text-center">
              <span class="text-xl">➖</span>
              <span class="text-[10px] text-slate-400">WIRE</span>
            </div>`;
            break;
        }
        slotEl.innerHTML = visualContent;
      } else {
        slotEl.classList.add('border-dashed', 'border-sky-400', 'bg-sky-950/30');
        slotEl.classList.remove('border-solid', 'border-slate-600', 'bg-slate-800');
        
        let slotText = "";
        if (name === "power") slotText = "Battery";
        else if (name === "bulb1") slotText = "Light Bulb";
        else if (name === "switch") slotText = "Switch";
        else if (name === "bulb2") slotText = this.selectedCircuitType === "A" ? "Wire" : "Light Bulb 2";
        
        slotEl.innerHTML = `<span class="text-xs text-sky-400 pointer-events-none">${slotText}</span>`;
      }
    }
    setTimeout(() => this.drawWires(), 20);
  }

  checkCircuit() {
    let isComplete = true;
    let hasFault = false;

    // Check if all slots are filled (for circuit B/C, bulb2 must be bulb; for A, it must be wire)
    for (const [name, slot] of Object.entries(this.slots)) {
      if (!slot.value) {
        isComplete = false;
      } else if (slot.value.faulty) {
        hasFault = true;
      }
    }

    const flowLine = this.container.querySelector("#wire-current-flow");
    const sensorValEl = this.container.querySelector("#sensor-val");

    if (isComplete && !hasFault) {
      let brightness = 0;
      if (this.selectedCircuitType === "A") brightness = 90;
      else if (this.selectedCircuitType === "B") brightness = 55;
      else if (this.selectedCircuitType === "C") brightness = 35;

      // Glow and active current with PhET-style speed mapping
      if (flowLine) {
        flowLine.classList.remove("hidden");
        const duration = (120 - brightness) / 45; // ~0.66s for 1 bulb, ~1.44s for 2 bulbs, ~1.88s for 3 bulbs
        flowLine.style.animationDuration = `${duration}s`;
      }
      
      if (sensorValEl) sensorValEl.textContent = `${brightness}.0 units`;

      // Animate bulbs
      const bulbs = this.container.querySelectorAll(".bulb-graphic");
      bulbs.forEach(b => {
        b.classList.add("bulb-glowing");
        const icon = b.querySelector(".bulb-icon");
        if (icon) {
          icon.style.filter = `drop-shadow(0 0 ${brightness/3}px rgba(253, 224, 71, 0.9))`;
          icon.style.transform = "scale(1.25)";
        }
      });

      if (this.onCircuitChanged) this.onCircuitChanged(true, brightness, null);
    } else {
      if (flowLine) {
        flowLine.classList.add("hidden");
        flowLine.style.animationDuration = "";
      }
      if (sensorValEl) sensorValEl.textContent = "0.0 units";

      const bulbs = this.container.querySelectorAll(".bulb-graphic");
      bulbs.forEach(b => {
        b.classList.remove("bulb-glowing");
        const icon = b.querySelector(".bulb-icon");
        if (icon) {
          icon.style.filter = "none";
          icon.style.transform = "scale(1)";
        }
      });

      let faultReason = null;
      if (hasFault) {
        faultReason = this.activeErrorCase;
      }

      if (this.onCircuitChanged) this.onCircuitChanged(false, 0, faultReason);
    }
  }

  drawWires() {
    const board = this.container.querySelector(".circuit-board-container");
    const svg = this.container.querySelector("#circuit-wire-svg");
    const baseWire = this.container.querySelector("#wire-base");
    const flowWire = this.container.querySelector("#wire-current-flow");
    
    const slotSwitch = this.container.querySelector("#slot-switch");
    const slotPower = this.container.querySelector("#slot-power");
    const slotBulb1 = this.container.querySelector("#slot-bulb1");
    const slotBulb2 = this.container.querySelector("#slot-bulb2");
    
    if (!board || !svg || !slotSwitch || !slotPower || !slotBulb1 || !slotBulb2) return;
    
    const boardRect = board.getBoundingClientRect();
    
    const getCenter = (el) => {
      const rect = el.getBoundingClientRect();
      return {
        x: rect.left - boardRect.left + rect.width / 2,
        y: rect.top - boardRect.top + rect.height / 2
      };
    };
    
    const pSwitch = getCenter(slotSwitch);
    const pPower = getCenter(slotPower);
    const pBulb1 = getCenter(slotBulb1);
    const pBulb2 = getCenter(slotBulb2);
    
    const pathD = `M ${pPower.x} ${pPower.y} L ${pSwitch.x} ${pSwitch.y} L ${pBulb1.x} ${pBulb1.y} L ${pBulb2.x} ${pBulb2.y} Z`;
    
    if (baseWire) baseWire.setAttribute("d", pathD);
    if (flowWire) flowWire.setAttribute("d", pathD);
  }

  stop() {
    window.removeEventListener('resize', this.resizeHandler);
  }
}


// --- 3. REPRODUCTION: SEED GERMINATION TIME-LAPSE ---
class SeedGerminationSimulation {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;
    this.days = 0;
    this.initHTML();
  }

  initHTML() {
    this.container.innerHTML = `
      <div class="germination-container flex flex-col items-center p-4">
        <!-- Render Dish A and B side-by-side -->
        <div class="flex gap-12 justify-center w-full max-w-lg mb-6">
          
          <!-- Dish A: Moist Cotton -->
          <div class="flex flex-col items-center">
            <div class="petri-dish border-4 border-slate-600 bg-slate-900 rounded-full w-40 h-40 flex items-center justify-center relative p-2 shadow-inner">
              <!-- Cotton wool background -->
              <div class="cotton-wool absolute inset-3 rounded-full bg-white/10 border border-slate-700/50 backdrop-blur-[2px]"></div>
              
              <!-- Growth SVGs for 3 seeds -->
              <div class="absolute inset-0 flex items-center justify-center pointer-events-none" id="dish-a-seeds">
                <!-- Seeds go here -->
              </div>
            </div>
            <div class="text-sm font-semibold text-sky-400 mt-3">Dish A (Moist Cotton)</div>
            <div class="text-xs text-slate-400">Moisture: Present</div>
          </div>

          <!-- Dish B: Dry Cotton -->
          <div class="flex flex-col items-center">
            <div class="petri-dish border-4 border-slate-600 bg-slate-900 rounded-full w-40 h-40 flex items-center justify-center relative p-2 shadow-inner">
              <!-- Cotton wool background -->
              <div class="cotton-wool absolute inset-3 rounded-full bg-slate-100/5 border border-slate-800/30"></div>
              
              <!-- Dormant seeds -->
              <div class="absolute inset-0 flex items-center justify-center pointer-events-none" id="dish-b-seeds">
                <!-- Seeds go here -->
              </div>
            </div>
            <div class="text-sm font-semibold text-amber-500 mt-3">Dish B (Dry Cotton)</div>
            <div class="text-xs text-slate-400">Moisture: Absent</div>
          </div>

        </div>

        <!-- Slider Control -->
        <div class="slider-wrapper w-full max-w-md bg-slate-800/60 border border-slate-700 rounded-xl p-4">
          <div class="flex justify-between items-center mb-2">
            <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">Time-Lapse Control</span>
            <span class="text-sm font-mono text-emerald-400 font-bold" id="day-counter">Day 0</span>
          </div>
          <input type="range" min="0" max="5" value="0" step="1" 
                 class="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500" 
                 id="germination-day-slider" />
          <div class="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
            <span>Day 0</span>
            <span>Day 1</span>
            <span>Day 2</span>
            <span>Day 3</span>
            <span>Day 4</span>
            <span>Day 5</span>
          </div>
        </div>
      </div>
    `;

    const slider = this.container.querySelector("#germination-day-slider");
    slider.addEventListener('input', (e) => {
      this.updateDays(parseInt(e.target.value));
    });

    this.updateDays(0);
  }

  updateDays(days) {
    this.days = days;
    const counter = this.container.querySelector("#day-counter");
    if (counter) counter.textContent = `Day ${days}`;

    this.renderDishA();
    this.renderDishB();
  }

  renderDishB() {
    const el = this.container.querySelector("#dish-b-seeds");
    if (!el) return;

    // Dish B remains dry, seeds are dormant brown beans
    el.innerHTML = `
      <svg class="w-full h-full" viewBox="0 0 100 100">
        <!-- Seed 1 -->
        <ellipse cx="35" cy="45" rx="6" ry="4" transform="rotate(15, 35, 45)" fill="#78350f" stroke="#451a03" stroke-width="1"/>
        <!-- Seed 2 -->
        <ellipse cx="65" cy="55" rx="6" ry="4" transform="rotate(-30, 65, 55)" fill="#78350f" stroke="#451a03" stroke-width="1"/>
        <!-- Seed 3 -->
        <ellipse cx="50" cy="30" rx="6" ry="4" transform="rotate(45, 50, 30)" fill="#78350f" stroke="#451a03" stroke-width="1"/>
      </svg>
    `;
  }

  renderDishA() {
    const el = this.container.querySelector("#dish-a-seeds");
    if (!el) return;

    // Seeds in Dish A grow based on days (0-5)
    // We will render SVGs demonstrating germination steps:
    // Day 0: Brown kidney shape
    // Day 1: Swollen, lighter brown seed
    // Day 2: Seed coat split, tiny white root emerging
    // Day 3: Root grows longer and goes down
    // Day 4: Root branching, green shoot starts pushing up
    // Day 5: Root system grows, shoot grows tall and splits into two green leaves
    
    let seed1Markup = "";
    let seed2Markup = "";
    let seed3Markup = "";

    switch (this.days) {
      case 0:
        seed1Markup = `<ellipse cx="35" cy="45" rx="6" ry="4" transform="rotate(15, 35, 45)" fill="#78350f" stroke="#451a03" stroke-width="1"/>`;
        seed2Markup = `<ellipse cx="65" cy="55" rx="6" ry="4" transform="rotate(-30, 65, 55)" fill="#78350f" stroke="#451a03" stroke-width="1"/>`;
        seed3Markup = `<ellipse cx="50" cy="30" rx="6" ry="4" transform="rotate(45, 50, 30)" fill="#78350f" stroke="#451a03" stroke-width="1"/>`;
        break;
      case 1:
        // Swollen
        seed1Markup = `<ellipse cx="35" cy="45" rx="8" ry="5.5" transform="rotate(15, 35, 45)" fill="#92400e" stroke="#451a03" stroke-width="1"/>`;
        seed2Markup = `<ellipse cx="65" cy="55" rx="8" ry="5.5" transform="rotate(-30, 65, 55)" fill="#92400e" stroke="#451a03" stroke-width="1"/>`;
        seed3Markup = `<ellipse cx="50" cy="30" rx="8" ry="5.5" transform="rotate(45, 50, 30)" fill="#92400e" stroke="#451a03" stroke-width="1"/>`;
        break;
      case 2:
        // Split and small white root (radicle) emerging
        seed1Markup = `
          <ellipse cx="35" cy="45" rx="8.5" ry="6" transform="rotate(15, 35, 45)" fill="#b45309" stroke="#78350f" stroke-width="1"/>
          <path d="M 33,48 Q 30,53 26,52" fill="none" stroke="#f8fafc" stroke-width="2.5" stroke-linecap="round"/>
        `;
        seed2Markup = `
          <ellipse cx="65" cy="55" rx="8.5" ry="6" transform="rotate(-30, 65, 55)" fill="#b45309" stroke="#78350f" stroke-width="1"/>
          <path d="M 64,59 Q 63,65 67,69" fill="none" stroke="#f8fafc" stroke-width="2.5" stroke-linecap="round"/>
        `;
        seed3Markup = `
          <ellipse cx="50" cy="30" rx="8.5" ry="6" transform="rotate(45, 50, 30)" fill="#b45309" stroke="#78350f" stroke-width="1"/>
          <path d="M 47,33 Q 41,36 39,33" fill="none" stroke="#f8fafc" stroke-width="2.5" stroke-linecap="round"/>
        `;
        break;
      case 3:
        // Root grows longer
        seed1Markup = `
          <ellipse cx="35" cy="45" rx="9" ry="6" transform="rotate(15, 35, 45)" fill="#d97706" stroke="#78350f" stroke-width="1"/>
          <path d="M 33,48 Q 28,58 20,59" fill="none" stroke="#f8fafc" stroke-width="3" stroke-linecap="round"/>
        `;
        seed2Markup = `
          <ellipse cx="65" cy="55" rx="9" ry="6" transform="rotate(-30, 65, 55)" fill="#d97706" stroke="#78350f" stroke-width="1"/>
          <path d="M 64,59 Q 62,70 70,78" fill="none" stroke="#f8fafc" stroke-width="3" stroke-linecap="round"/>
        `;
        seed3Markup = `
          <ellipse cx="50" cy="30" rx="9" ry="6" transform="rotate(45, 50, 30)" fill="#d97706" stroke="#78350f" stroke-width="1"/>
          <path d="M 47,33 Q 39,40 32,36" fill="none" stroke="#f8fafc" stroke-width="3" stroke-linecap="round"/>
        `;
        break;
      case 4:
        // Shoot (plumule) emerges (green) and roots branch
        seed1Markup = `
          <!-- Roots -->
          <path d="M 33,48 Q 28,58 20,59" fill="none" stroke="#f1f5f9" stroke-width="3" stroke-linecap="round"/>
          <path d="M 23,56 Q 21,63 17,61" fill="none" stroke="#f1f5f9" stroke-width="1.5" stroke-linecap="round"/>
          <!-- Shoot -->
          <path d="M 35,42 Q 38,32 42,28" fill="none" stroke="#22c55e" stroke-width="3" stroke-linecap="round"/>
          <!-- Seed -->
          <ellipse cx="35" cy="45" rx="9" ry="6.5" transform="rotate(15, 35, 45)" fill="#d97706" stroke="#78350f" stroke-width="1"/>
        `;
        seed2Markup = `
          <!-- Roots -->
          <path d="M 64,59 Q 62,70 70,78" fill="none" stroke="#f1f5f9" stroke-width="3" stroke-linecap="round"/>
          <path d="M 65,68 Q 72,71 74,75" fill="none" stroke="#f1f5f9" stroke-width="1.5" stroke-linecap="round"/>
          <!-- Shoot -->
          <path d="M 65,51 Q 62,41 55,38" fill="none" stroke="#22c55e" stroke-width="3" stroke-linecap="round"/>
          <!-- Seed -->
          <ellipse cx="65" cy="55" rx="9" ry="6.5" transform="rotate(-30, 65, 55)" fill="#d97706" stroke="#78350f" stroke-width="1"/>
        `;
        seed3Markup = `
          <!-- Roots -->
          <path d="M 47,33 Q 39,40 32,36" fill="none" stroke="#f1f5f9" stroke-width="3" stroke-linecap="round"/>
          <!-- Shoot -->
          <path d="M 52,28 Q 58,22 66,22" fill="none" stroke="#22c55e" stroke-width="3" stroke-linecap="round"/>
          <!-- Seed -->
          <ellipse cx="50" cy="30" rx="9" ry="6.5" transform="rotate(45, 50, 30)" fill="#d97706" stroke="#78350f" stroke-width="1"/>
        `;
        break;
      case 5:
        // Fully germinated: tall shoot with green leaves, extensive white roots, wrinkled seed coat decaying
        seed1Markup = `
          <!-- Roots -->
          <path d="M 33,48 Q 28,58 20,59" fill="none" stroke="#e2e8f0" stroke-width="3.5" stroke-linecap="round"/>
          <path d="M 23,56 Q 21,65 15,64" fill="none" stroke="#e2e8f0" stroke-width="1.5" stroke-linecap="round"/>
          <path d="M 27,53 Q 27,61 31,63" fill="none" stroke="#e2e8f0" stroke-width="1.5" stroke-linecap="round"/>
          <!-- Shoot & Leaves -->
          <path d="M 35,42 Q 38,25 44,14" fill="none" stroke="#15803d" stroke-width="4" stroke-linecap="round"/>
          <path d="M 44,14 Q 40,8 35,10 Q 40,14 44,14" fill="#22c55e" stroke="#15803d" stroke-width="1"/>
          <path d="M 44,14 Q 49,9 52,13 Q 47,15 44,14" fill="#22c55e" stroke="#15803d" stroke-width="1"/>
          <!-- Decaying Seed Coat -->
          <ellipse cx="35" cy="45" rx="8" ry="5.5" transform="rotate(15, 35, 45)" fill="#78350f" stroke="#451a03" stroke-width="1" opacity="0.85"/>
        `;
        seed2Markup = `
          <!-- Roots -->
          <path d="M 64,59 Q 62,70 70,78" fill="none" stroke="#e2e8f0" stroke-width="3.5" stroke-linecap="round"/>
          <path d="M 65,68 Q 74,71 77,77" fill="none" stroke="#e2e8f0" stroke-width="1.5" stroke-linecap="round"/>
          <path d="M 63,63 Q 56,66 54,72" fill="none" stroke="#e2e8f0" stroke-width="1.5" stroke-linecap="round"/>
          <!-- Shoot & Leaves -->
          <path d="M 65,51 Q 62,34 52,24" fill="none" stroke="#15803d" stroke-width="4" stroke-linecap="round"/>
          <path d="M 52,24 Q 46,21 44,26 Q 49,26 52,24" fill="#22c55e" stroke="#15803d" stroke-width="1"/>
          <path d="M 52,24 Q 54,17 59,18 Q 56,23 52,24" fill="#22c55e" stroke="#15803d" stroke-width="1"/>
          <!-- Decaying Seed Coat -->
          <ellipse cx="65" cy="55" rx="8" ry="5.5" transform="rotate(-30, 65, 55)" fill="#78350f" stroke="#451a03" stroke-width="1" opacity="0.85"/>
        `;
        seed3Markup = `
          <!-- Roots -->
          <path d="M 47,33 Q 39,40 32,36" fill="none" stroke="#e2e8f0" stroke-width="3.5" stroke-linecap="round"/>
          <path d="M 42,35 Q 39,44 43,46" fill="none" stroke="#e2e8f0" stroke-width="1.5" stroke-linecap="round"/>
          <!-- Shoot & Leaves -->
          <path d="M 52,28 Q 59,16 70,16" fill="none" stroke="#15803d" stroke-width="4" stroke-linecap="round"/>
          <path d="M 70,16 Q 73,10 78,11 Q 74,15 70,16" fill="#22c55e" stroke="#15803d" stroke-width="1"/>
          <path d="M 70,16 Q 73,22 72,27 Q 69,21 70,16" fill="#22c55e" stroke="#15803d" stroke-width="1"/>
          <!-- Decaying Seed Coat -->
          <ellipse cx="50" cy="30" rx="8" ry="5.5" transform="rotate(45, 50, 30)" fill="#78350f" stroke="#451a03" stroke-width="1" opacity="0.85"/>
        `;
        break;
    }

    el.innerHTML = `
      <svg class="w-full h-full" viewBox="0 0 100 100">
        ${seed1Markup}
        ${seed2Markup}
        ${seed3Markup}
      </svg>
    `;
  }
}


// --- 4. RESPIRATORY SYSTEM: TORSO BREATHING ANIMATION ---
class RespiratorySimulation {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;
    this.exerciseLevel = 0; // 0, 1, 2, 3 min
    this.animationFrameId = null;
    this.particles = [];
    this.cycleTime = 0;
    this.lastTime = 0;

    this.initHTML();
    this.animate();
  }

  initHTML() {
    this.container.innerHTML = `
      <div class="respiratory-simulation flex flex-col items-center p-4">
        <!-- SVG diagram of respiratory system -->
        <div class="torso-diagram w-64 h-64 border border-slate-300 bg-white/90 rounded-xl relative p-4 mb-4 shadow-sm overflow-hidden">
          <svg class="w-full h-full" viewBox="0 0 120 120">
            <!-- Torso outline -->
            <path d="M 20,110 L 25,75 Q 26,45 40,40 L 45,35 Q 50,20 60,20 Q 70,20 75,35 L 80,40 Q 94,45 95,75 L 100,110 Z" 
                  fill="none" stroke="rgba(15, 23, 42, 0.35)" stroke-width="2"/>
            
            <!-- Windpipe (Trachea) -->
            <path d="M 60,33 L 60,65" fill="none" stroke="#fdba74" stroke-width="4" stroke-linecap="round"/>
            <path d="M 58,40 L 62,40 M 58,46 L 62,46 M 58,52 L 62,52 M 58,58 L 62,58" fill="none" stroke="#f97316" stroke-width="1"/>

            <!-- Lungs expansion background -->
            <g id="lungs-container">
              <!-- Left Lung -->
              <path id="left-lung" d="M 58,65 Q 40,65 35,80 Q 35,95 55,95 Q 58,95 58,80 Z" 
                    fill="rgba(244, 63, 94, 0.25)" stroke="#f43f5e" stroke-width="2" transform-origin="58 80"/>
              <!-- Right Lung -->
              <path id="right-lung" d="M 62,65 Q 80,65 85,80 Q 85,95 65,95 Q 62,95 62,80 Z" 
                    fill="rgba(244, 63, 94, 0.25)" stroke="#f43f5e" stroke-width="2" transform-origin="62 80"/>
            </g>

            <!-- Head & Nose cavity -->
            <circle cx="60" cy="22" r="10" fill="none" stroke="rgba(15, 23, 42, 0.25)" stroke-width="1.5"/>
            <!-- Nose path -->
            <path d="M 60,18 Q 52,18 52,24 Q 52,28 60,32" fill="none" stroke="rgba(15, 23, 42, 0.35)" stroke-width="1.5"/>

            <!-- Moving particles container -->
            <g id="resp-particles-group"></g>
          </svg>
        </div>

        <!-- Exercise Settings -->
        <div class="exercise-selector w-full max-w-sm bg-slate-800/60 border border-slate-700 rounded-xl p-4">
          <div class="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider text-center">Simulated Activity Level</div>
          <div class="grid grid-cols-4 gap-2">
            <button class="exercise-btn bg-slate-700 hover:bg-slate-600 text-white py-2 px-1 text-xs font-semibold rounded transition-all active-level" data-level="0">Resting</button>
            <button class="exercise-btn bg-slate-700 hover:bg-slate-600 text-white py-2 px-1 text-xs font-semibold rounded transition-all" data-level="1">1 Min</button>
            <button class="exercise-btn bg-slate-700 hover:bg-slate-600 text-white py-2 px-1 text-xs font-semibold rounded transition-all" data-level="2">2 Min</button>
            <button class="exercise-btn bg-slate-700 hover:bg-slate-600 text-white py-2 px-1 text-xs font-semibold rounded transition-all" data-level="3">3 Min</button>
          </div>
          <div class="text-center mt-3 text-xs font-mono text-cyan-400 font-semibold" id="resp-stats-readout">
            Breathing Rate: 16 breaths/min
          </div>
        </div>
      </div>
    `;

    const btns = this.container.querySelectorAll(".exercise-btn");
    btns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        btns.forEach(b => b.classList.remove('active-level', 'bg-sky-600'));
        btn.classList.add('active-level', 'bg-sky-600');
        this.setExerciseLevel(parseInt(btn.dataset.level));
      });
    });

    // Default style for active button
    btns[0].classList.add('bg-sky-600');
  }

  setExerciseLevel(level) {
    this.exerciseLevel = level;
    const readout = this.container.querySelector("#resp-stats-readout");
    if (readout) {
      let rate = 16;
      if (level === 1) rate = 24;
      else if (level === 2) rate = 31;
      else if (level === 3) rate = 38;
      readout.textContent = `Breathing Rate: ${rate} breaths/min`;
    }
  }

  stop() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  animate() {
    const now = performance.now();
    if (this.lastTime === 0) this.lastTime = now;
    const dt = (now - this.lastTime) / 1000;
    this.lastTime = now;

    this.cycleTime += dt;

    // Breathing speeds:
    // level 0: 4s cycle
    // level 1: 2.5s cycle
    // level 2: 1.8s cycle
    // level 3: 1.2s cycle
    let cycleDuration = 4.0;
    if (this.exerciseLevel === 1) cycleDuration = 2.5;
    else if (this.exerciseLevel === 2) cycleDuration = 1.8;
    else if (this.exerciseLevel === 3) cycleDuration = 1.2;

    const timeInCycle = this.cycleTime % cycleDuration;
    const halfCycle = cycleDuration / 2;
    const isInhaling = timeInCycle < halfCycle;

    // Breathing scale factor (sinusoidal)
    const phase = (timeInCycle / cycleDuration) * Math.PI * 2;
    // Lungs expand and contract (scale between 1.0 and 1.2)
    const expansion = 1.0 + (Math.sin(phase - Math.PI / 2) + 1) * 0.1;

    const leftLung = this.container.querySelector("#left-lung");
    const rightLung = this.container.querySelector("#right-lung");
    if (leftLung && rightLung) {
      leftLung.setAttribute('transform', `scale(${expansion})`);
      rightLung.setAttribute('transform', `scale(${expansion})`);
    }

    // Update and spawn particles
    this.updateParticles(dt, isInhaling, cycleDuration);

    this.animationFrameId = requestAnimationFrame(() => this.animate());
  }

  updateParticles(dt, isInhaling, cycleDuration) {
    const group = this.container.querySelector("#resp-particles-group");
    if (!group) return;

    // Particle spawn rate
    // Inhaling: spawn blue oxygen at nose, move down to lungs
    // Exhaling: spawn red carbon dioxide in lungs, move up to nose
    const spawnChance = this.exerciseLevel === 0 ? 0.08 : this.exerciseLevel === 1 ? 0.15 : this.exerciseLevel === 2 ? 0.25 : 0.4;
    
    if (Math.random() < spawnChance) {
      if (isInhaling) {
        // Spawn blue particle at nose (X=52, Y=24)
        this.particles.push({
          x: 52, y: 24,
          type: "oxygen",
          color: "#38bdf8", // blue
          progress: 0,
          speed: 0.6 + Math.random() * 0.4
        });
      } else {
        // Spawn red particle at lungs base (left lung X=45, Y=80 or right lung X=75, Y=80)
        const isLeft = Math.random() > 0.5;
        this.particles.push({
          x: isLeft ? 45 : 75,
          y: 80 + (Math.random() - 0.5) * 8,
          type: "co2",
          color: "#f87171", // red
          progress: 1, // goes backwards (1 to 0)
          speed: 0.6 + Math.random() * 0.4
        });
      }
    }

    // Path definitions:
    // P0: Nose (52, 24)
    // P1: Windpipe top (60, 33)
    // P2: Windpipe bottom (60, 65)
    // Left lung target (45, 80)
    // Right lung target (75, 80)
    
    let html = "";
    
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      
      if (p.type === "oxygen") {
        p.progress += dt * p.speed * (this.exerciseLevel + 1.2);
        if (p.progress >= 1) {
          this.particles.splice(i, 1);
          continue;
        }

        // Calculate position along path
        const pos = this.getPathPos(p.progress, p.x); // p.x is initial nose X
        p.currentX = pos.x;
        p.currentY = pos.y;
      } else {
        p.progress -= dt * p.speed * (this.exerciseLevel + 1.2);
        if (p.progress <= 0) {
          this.particles.splice(i, 1);
          continue;
        }

        const pos = this.getPathPos(p.progress, p.x); // p.x holds initial lung target X
        p.currentX = pos.x;
        p.currentY = pos.y;
      }

      html += `<circle cx="${p.currentX}" cy="${p.currentY}" r="1.5" fill="${p.color}" />`;
    }

    group.innerHTML = html;
  }

  getPathPos(t, startX) {
    // t goes from 0 (nose) to 1 (lungs)
    // Phase 1: nose to windpipe top (t: 0 -> 0.3)
    // Phase 2: windpipe top to windpipe bottom (t: 0.3 -> 0.7)
    // Phase 3: windpipe bottom to lungs (t: 0.7 -> 1.0)
    
    let x = 60;
    let y = 60;

    if (t < 0.3) {
      const nt = t / 0.3;
      // Nose (52,24) or (startX, 24) to Windpipe top (60,33)
      x = startX + (60 - startX) * nt;
      y = 24 + (33 - 24) * nt;
    } else if (t < 0.7) {
      const nt = (t - 0.3) / 0.4;
      // Windpipe (60,33) to (60,65)
      x = 60;
      y = 33 + (65 - 33) * nt;
    } else {
      const nt = (t - 0.7) / 0.3;
      // Windpipe base (60,65) to lungs target (startX is lung center X)
      x = 60 + (startX - 60) * nt;
      y = 65 + (80 - 65) * nt;
      // Add a bit of horizontal sway inside the lung
      x += Math.sin(t * 10) * 2;
    }

    return { x, y };
  }
}


// --- 5. HUMAN CIRCULATORY SYSTEM: BEATING HEART ---
class CirculatorySimulation {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;
    this.exerciseLevel = 0; // 0, 1, 2, 3 min
    this.animationFrameId = null;
    this.particles = [];
    this.beatTimer = 0;
    this.lastTime = 0;

    this.initHTML();
    this.animate();
  }

  initHTML() {
    this.container.innerHTML = `
      <div class="circulatory-simulation flex flex-col items-center p-4">
        <!-- SVG diagram of circulatory system -->
        <div class="heart-diagram w-64 h-64 border border-slate-300 bg-white/90 rounded-xl relative p-4 mb-4 shadow-sm overflow-hidden">
          <svg class="w-full h-full" viewBox="0 0 120 120">
            <!-- Lungs capillary bed (Top block) -->
            <rect x="40" y="5" width="40" height="15" rx="5" fill="none" stroke="rgba(2, 132, 199, 0.5)" stroke-width="1.5"/>
            <text x="60" y="15" font-size="7" font-weight="bold" fill="#0284c7" text-anchor="middle" font-family="Outfit, sans-serif">LUNGS</text>

            <!-- Body Cells Capillaries (Bottom block) -->
            <rect x="40" y="100" width="40" height="15" rx="5" fill="none" stroke="rgba(219, 39, 119, 0.5)" stroke-width="1.5"/>
            <text x="60" y="110" font-size="7" font-weight="bold" fill="#db2777" text-anchor="middle" font-family="Outfit, sans-serif">BODY MUSCLES</text>

            <!-- Left and Right loops pathways (Blood Vessels) -->
            <!-- Blue track (deoxygenated blood): Body -> Right Heart -> Lungs -->
            <path id="blue-track" d="M 50,100 L 30,100 Q 20,80 35,62 L 48,62 Q 52,62 52,48 L 30,48 Q 20,20 50,20" 
                  fill="none" stroke="#1d4ed8" stroke-width="3" stroke-linecap="round" opacity="0.4"/>

            <!-- Red track (oxygenated blood): Lungs -> Left Heart -> Body -->
            <path id="red-track" d="M 70,20 Q 100,20 90,48 L 68,48 Q 64,48 64,62 L 85,62 Q 100,80 90,100 L 70,100" 
                  fill="none" stroke="#b91c1c" stroke-width="3" stroke-linecap="round" opacity="0.4"/>

            <!-- Heart chamber outline (Central) -->
            <g id="heart-graphic" transform-origin="60 55">
              <!-- Right Side (Blueish-purple) -->
              <path d="M 60,40 C 48,40 44,52 60,68 C 60,68 60,40 60,40" fill="rgba(59, 130, 246, 0.8)" stroke="#2563eb" stroke-width="1"/>
              <!-- Left Side (Red) -->
              <path d="M 60,40 C 72,40 76,52 60,68 C 60,68 60,40 60,40" fill="rgba(239, 68, 68, 0.8)" stroke="#dc2626" stroke-width="1"/>
              <!-- Divider line -->
              <line x1="60" y1="40" x2="60" y2="67" stroke="#1e293b" stroke-width="1.5"/>
              <text x="60" y="56" font-size="8" font-weight="bold" fill="#ffffff" text-anchor="middle" font-family="Outfit, sans-serif">HEART</text>
            </g>

            <!-- Moving Blood Cells particles container -->
            <g id="blood-particles-group"></g>
          </svg>
        </div>

        <!-- Exercise Settings -->
        <div class="exercise-selector w-full max-w-sm bg-slate-800/60 border border-slate-700 rounded-xl p-4">
          <div class="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider text-center">Simulated Activity Level</div>
          <div class="grid grid-cols-4 gap-2">
            <button class="pulse-btn bg-slate-700 hover:bg-slate-600 text-white py-2 px-1 text-xs font-semibold rounded transition-all active-level" data-level="0">Resting</button>
            <button class="pulse-btn bg-slate-700 hover:bg-slate-600 text-white py-2 px-1 text-xs font-semibold rounded transition-all" data-level="1">1 Min</button>
            <button class="pulse-btn bg-slate-700 hover:bg-slate-600 text-white py-2 px-1 text-xs font-semibold rounded transition-all" data-level="2">2 Min</button>
            <button class="pulse-btn bg-slate-700 hover:bg-slate-600 text-white py-2 px-1 text-xs font-semibold rounded transition-all" data-level="3">3 Min</button>
          </div>
          <div class="text-center mt-3 text-xs font-mono text-rose-400 font-semibold" id="pulse-stats-readout">
            Pulse Rate: 75 beats/min
          </div>
        </div>
      </div>
    `;

    const btns = this.container.querySelectorAll(".pulse-btn");
    btns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        btns.forEach(b => b.classList.remove('active-level', 'bg-rose-600'));
        btn.classList.add('active-level', 'bg-rose-600');
        this.setExerciseLevel(parseInt(btn.dataset.level));
      });
    });

    // Default style for active button
    btns[0].classList.add('bg-rose-600');
    this.spawnInitialParticles();
  }

  setExerciseLevel(level) {
    this.exerciseLevel = level;
    const readout = this.container.querySelector("#pulse-stats-readout");
    if (readout) {
      let rate = 75;
      if (level === 1) rate = 95;
      else if (level === 2) rate = 120;
      else if (level === 3) rate = 140;
      readout.textContent = `Pulse Rate: ${rate} beats/min`;
    }
  }

  spawnInitialParticles() {
    this.particles = [];
    // Spawn 15 particles distributed along paths
    for (let i = 0; i < 8; i++) {
      this.particles.push({
        track: "blue",
        progress: i / 8,
        color: "#60a5fa"
      });
    }
    for (let i = 0; i < 8; i++) {
      this.particles.push({
        track: "red",
        progress: i / 8,
        color: "#ef4444"
      });
    }
  }

  stop() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  animate() {
    const now = performance.now();
    if (this.lastTime === 0) this.lastTime = now;
    const dt = (now - this.lastTime) / 1000;
    this.lastTime = now;

    // Heart beat frequency:
    // Level 0: 72 bpm -> 1.2 Hz -> 0.83s per beat
    // Level 1: 92 bpm -> 1.53 Hz -> 0.65s per beat
    // Level 2: 112 bpm -> 1.86 Hz -> 0.54s per beat
    // Level 3: 128 bpm -> 2.13 Hz -> 0.47s per beat
    let beatDuration = 0.83;
    if (this.exerciseLevel === 1) beatDuration = 0.65;
    else if (this.exerciseLevel === 2) beatDuration = 0.54;
    else if (this.exerciseLevel === 3) beatDuration = 0.47;

    this.beatTimer += dt;
    if (this.beatTimer >= beatDuration) {
      this.beatTimer -= beatDuration;
    }

    // Heart throbbing scale factor: sharp contraction followed by relaxation
    const beatProgress = this.beatTimer / beatDuration;
    let scale = 1.0;
    if (beatProgress < 0.25) {
      // Contraction: shrink
      scale = 0.85 + (beatProgress / 0.25) * 0.15;
    } else if (beatProgress < 0.5) {
      // Bounce: enlarge
      scale = 1.0 + (1.0 - (beatProgress - 0.25) / 0.25) * 0.15;
    } else {
      // Return to resting size
      scale = 1.0;
    }

    const heart = this.container.querySelector("#heart-graphic");
    if (heart) {
      heart.setAttribute('transform', `scale(${scale})`);
    }

    // Update blood cell particles
    this.updateBloodCells(dt);

    this.animationFrameId = requestAnimationFrame(() => this.animate());
  }

  updateBloodCells(dt) {
    const group = this.container.querySelector("#blood-particles-group");
    if (!group) return;

    // Particle flow speed
    // Higher exercise = faster flow
    const speed = 0.18 + this.exerciseLevel * 0.08;

    let html = "";
    
    this.particles.forEach(p => {
      p.progress += dt * speed;
      if (p.progress >= 1.0) {
        p.progress -= 1.0;
      }

      const pos = this.getTrackPos(p.track, p.progress);
      
      // Color coding: Blue track turns Red in lungs (progress near 1 for blue, 0 for red)
      // Red track turns Blue in body cells (progress near 1 for red, 0 for blue)
      let color = p.color;
      if (p.track === "blue") {
        if (p.progress > 0.8) color = "#ef4444"; // turns red as it enters lungs
        else color = "#3b82f6";
      } else {
        if (p.progress > 0.8) color = "#3b82f6"; // turns blue in muscles
        else color = "#ef4444";
      }

      html += `<circle cx="${pos.x}" cy="${pos.y}" r="2" fill="${color}" stroke="#0f172a" stroke-width="0.5" />`;
    });

    group.innerHTML = html;
  }

  getTrackPos(track, t) {
    // t goes from 0 to 1
    // SVG Paths matching coordinates:
    // Blue track (Body -> right heart -> Lungs):
    // starts body cells: (50, 100) -> left: (30,100) -> right heart entrance: (35, 62) -> (48, 62) -> through right heart -> (52, 48) -> (30, 48) -> Lungs: (50, 20)
    // Red track (Lungs -> left heart -> Body):
    // starts lungs: (70, 20) -> right outer: (90, 20) -> left heart entrance: (90, 48) -> (68, 48) -> through left heart -> (64, 62) -> (85, 62) -> Body cells: (70, 100)
    
    let x = 60;
    let y = 60;

    if (track === "blue") {
      // 3 segments
      if (t < 0.3) {
        // Body cells (50, 105) to right heart entrance (35, 62)
        const nt = t / 0.3;
        x = 50 - 20 * nt;
        y = 105 - 43 * nt;
      } else if (t < 0.7) {
        // Right heart pass: (35, 62) -> (48,62) -> (52,48) -> (35, 48)
        const nt = (t - 0.3) / 0.4;
        if (nt < 0.5) {
          const snt = nt / 0.5;
          x = 35 + 13 * snt;
          y = 62 - 14 * snt; // moves diagonal up inside heart
        } else {
          const snt = (nt - 0.5) / 0.5;
          x = 48 - 18 * snt;
          y = 48;
        }
      } else {
        // Heart exit to lungs (50, 12)
        const nt = (t - 0.7) / 0.3;
        x = 30 + 20 * nt;
        y = 48 - 36 * nt;
      }
    } else {
      // Red Track
      if (t < 0.3) {
        // Lungs (70, 12) to Left heart entrance (85, 48)
        const nt = t / 0.3;
        x = 70 + 15 * nt;
        y = 12 + 36 * nt;
      } else if (t < 0.7) {
        // Left heart pass: (85, 48) -> (68, 48) -> (64, 62) -> (85, 62)
        const nt = (t - 0.7) / 0.4; // wait, t between 0.3 and 0.7
        const subT = (t - 0.3) / 0.4;
        if (subT < 0.5) {
          const snt = subT / 0.5;
          x = 85 - 17 * snt;
          y = 48 + 14 * snt;
        } else {
          const snt = (subT - 0.5) / 0.5;
          x = 68 + 17 * snt;
          y = 62;
        }
      } else {
        // Heart exit to body cells (70, 105)
        const nt = (t - 0.7) / 0.3;
        x = 85 - 15 * nt;
        y = 62 + 43 * nt;
      }
    }

    return { x, y };
  }
}

// Expose classes globally
window.EvaporationSimulation = EvaporationSimulation;
window.CircuitBuilder = CircuitBuilder;
window.SeedGerminationSimulation = SeedGerminationSimulation;
window.RespiratorySimulation = RespiratorySimulation;
window.CirculatorySimulation = CirculatorySimulation;

// --- 5. ELECTRICITY: DETAILED DIAGNOSTIC & REPAIR SIMULATION ---
class ElectricityDiagnosticSimulation {
  constructor(containerId, onInspect, onCircuitRepaired) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;
    this.onInspect = onInspect;
    this.onCircuitRepaired = onCircuitRepaired;

    // Create permanent screens wrapper and top-right restart button overlay
    this.container.innerHTML = `
      <div id="sim-screens-container" style="width: 100%; height: 100%; position: relative;"></div>
      <button class="lab-restart-btn" id="lab-restart-btn" style="position: absolute; top: 12px; right: 12px; z-index: 200;">🔄 Restart Mission</button>
    `;
    this.screensContainer = this.container.querySelector("#sim-screens-container");
    this.restartBtn = this.container.querySelector("#lab-restart-btn");
    this.restartBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.confirmRestart();
    });

    this.currentScreen = 1; // 1 to 6
    this.switchClosed = false;
    this.wireConnected = false;
    this.diagnosticSolved = false;

    this.activeZoom = null;
    this.inspected = { battery: false, switch: false, bulb: false };

    this.particles = [
      { t: 0.0, track: "red" },
      { t: 0.4, track: "red" },
      { t: 0.8, track: "red" },
      { t: 0.1, track: "black" },
      { t: 0.6, track: "black" }
    ];
    this.isDragging = false;
    this.animationFrameId = null;
    this.animationPaused = false;

    this.mcqOptions = [
      "The battery is reversed.",
      "The switch is open, and a wire terminal is connected to the glass bulb instead of the metal casing.",
      "There is no electric current in batteries.",
      "Bulbs do not conduct electricity."
    ];

    this.initAudio();
    this.setScreen(1);
  }

  confirmRestart() {
    if (confirm("Restart this mission? Your current progress for this mission will be reset.")) {
      this.resetSimulation();
    }
  }

  resetSimulation() {
    this.currentScreen = 1;
    this.switchClosed = false;
    this.wireConnected = false;
    this.diagnosticSolved = false;
    this.activeZoom = null;
    this.inspected = { battery: false, switch: false, bulb: false };
    this.particles = [
      { t: 0.0, track: "red" },
      { t: 0.4, track: "red" },
      { t: 0.8, track: "red" },
      { t: 0.1, track: "black" },
      { t: 0.6, track: "black" }
    ];
    this.isDragging = false;
    this.animationPaused = false;

    // Reset Sprout's bubble & app solved state variables
    if (this.onInspect) {
      this.onInspect('reset');
    }

    // Go back to Screen 1
    this.setScreen(1);
  }

  initAudio() {
    this.audioCtx = null;
  }

  playClick() {
    try {
      if (!this.audioCtx) this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const ctx = this.audioCtx;
      if (ctx.state === 'suspended') ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch (e) {
      console.warn("Audio Click error:", e);
    }
  }

  playSuccess() {
    try {
      if (!this.audioCtx) this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const ctx = this.audioCtx;
      if (ctx.state === 'suspended') ctx.resume();
      const playNote = (freq, start, duration) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
        gain.gain.setValueAtTime(0.08, ctx.currentTime + start);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + start + duration);
        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime + start + duration);
      };
      playNote(523.25, 0, 0.08); // C5
      playNote(659.25, 0.08, 0.08); // E5
      playNote(783.99, 0.16, 0.12); // G5
      playNote(1046.50, 0.28, 0.35); // C6
    } catch (e) {
      console.warn("Audio Success error:", e);
    }
  }

  renderSVGMarkup() {
    return `
      <svg class="w-full h-full select-none" viewBox="0 0 400 240" id="lab-svg" style="transition: all 0.5s ease; border-radius: 1.5rem;" preserveAspectRatio="none">
        <!-- Laboratory Bench Background Grid -->
        <defs>
          <pattern id="bench-grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(148, 163, 184, 0.08)" stroke-width="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#bench-grid)" />
        <line x1="0" y1="210" x2="400" y2="210" stroke="rgba(148, 163, 184, 0.2)" stroke-width="2" />

        <!-- GLOW FILTER -->
        <defs>
          <filter id="yellow-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        <!-- Warning Glow surrounding Switch (Only show on screen 1/2/3 when switch open) -->
        <circle cx="200" cy="50" r="28" class="warning-glow ${(!this.switchClosed && this.currentScreen <= 3) ? '' : 'hidden'}" id="switch-warning-glow" />

        <!-- Warning Glow surrounding Bulb glass connection (Only show on screen 1/2/3 when wire disconnected) -->
        <circle cx="300" cy="95" r="16" class="warning-glow ${(!this.wireConnected && this.currentScreen <= 3) ? '' : 'hidden'}" id="bulb-warning-glow" />
        <circle cx="300" cy="95" r="8" class="warning-pulse-ring ${(!this.wireConnected && this.currentScreen <= 3) ? '' : 'hidden'}" id="bulb-warning-ring" />

        <!-- 1. BATTERY (Left) -->
        <g id="inspect-battery" class="battery-pulse cursor-pointer">
          <!-- Outline container -->
          <rect x="35" y="90" width="50" height="60" rx="6" fill="#1e293b" stroke="#0f172a" stroke-width="2" />
          <!-- Positive cap -->
          <rect x="52" y="84" width="16" height="7" rx="2" fill="#fbbf24" stroke="#d97706" stroke-width="1.5" />
          <!-- Labels -->
          <text x="60" y="115" fill="#ef4444" font-size="14" font-weight="bold" text-anchor="middle" font-family="monospace">+</text>
          <text x="60" y="142" fill="#3b82f6" font-size="16" font-weight="bold" text-anchor="middle" font-family="monospace">-</text>
          <!-- Outer wrapper decoration -->
          <rect x="38" y="120" width="44" height="2" fill="rgba(255,255,255,0.1)" />
        </g>

        <!-- 2. SWITCH (Top) -->
        <g id="inspect-switch" class="cursor-pointer">
          <!-- Brass terminal pads -->
          <circle cx="170" cy="50" r="5" fill="#d97706" stroke="#b45309" stroke-width="1" />
          <circle cx="230" cy="50" r="5" fill="#d97706" stroke="#b45309" stroke-width="1" />
          <!-- Lever line -->
          <line x1="170" y1="50" x2="${this.switchClosed ? 230 : 222}" y2="${this.switchClosed ? 50 : 28}" stroke="#94a3b8" stroke-width="4.5" stroke-linecap="round" id="switch-lever" style="transition: all 0.3s ease;" />
          <!-- Spark indicators inside the gap -->
          <path d="M 224 35 Q 227 42 230 48" class="spark-path ${this.switchClosed ? 'hidden' : ''}" id="switch-spark" />
        </g>

        <!-- 3. BULB (Right) -->
        <g id="inspect-bulb" class="cursor-pointer">
          <!-- Bulb Rays -->
          <g id="bulb-rays" class="${(this.switchClosed && this.wireConnected) ? '' : 'opacity-0'}" style="transition: opacity 0.5s ease;">
            <line x1="320" y1="65" x2="320" y2="50" stroke="#f59e0b" stroke-width="2.5" stroke-linecap="round" />
            <line x1="295" y1="75" x2="282" y2="65" stroke="#f59e0b" stroke-width="2.5" stroke-linecap="round" />
            <line x1="345" y1="75" x2="358" y2="65" stroke="#f59e0b" stroke-width="2.5" stroke-linecap="round" />
            <line x1="290" y1="90" x2="275" y2="90" stroke="#f59e0b" stroke-width="2.5" stroke-linecap="round" />
            <line x1="350" y1="90" x2="365" y2="90" stroke="#f59e0b" stroke-width="2.5" stroke-linecap="round" />
          </g>
          <!-- Glowing background aura -->
          <circle cx="320" cy="90" r="26" fill="${(this.switchClosed && this.wireConnected) ? 'rgba(253, 224, 71, 0.4)' : 'rgba(253, 224, 71, 0)'}" filter="${(this.switchClosed && this.wireConnected) ? 'url(#yellow-glow)' : ''}" id="bulb-glow-aura" style="transition: all 0.5s ease;" />
          <!-- Filament -->
          <path d="M 314 110 L 314 96 Q 320 85 320 90 Q 320 85 326 96 L 326 110" fill="none" stroke="${(this.switchClosed && this.wireConnected) ? '#fbbf24' : '#64748b'}" stroke-width="${(this.switchClosed && this.wireConnected) ? 3 : 1.5}" class="${(this.switchClosed && this.wireConnected) ? 'bulb-filament-glowing' : ''}" id="bulb-filament" style="transition: all 0.5s ease;" />
          <!-- Glass envelope -->
          <path d="M 305 110 C 290 95 295 70 320 70 C 345 70 350 95 335 110 Z" fill="${(this.switchClosed && this.wireConnected) ? 'rgba(253, 224, 71, 0.3)' : 'rgba(255,255,255,0.1)'}" stroke="${(this.switchClosed && this.wireConnected) ? '#f59e0b' : '#475569'}" stroke-width="2" class="${(this.switchClosed && this.wireConnected) ? 'bulb-glass-glowing' : ''}" id="bulb-glass" style="transition: all 0.5s ease;" />
          <!-- Metal screw casing -->
          <rect x="308" y="110" width="24" height="20" rx="2" fill="#94a3b8" stroke="#475569" stroke-width="1.5" />
          <line x1="308" y1="117" x2="332" y2="117" stroke="#475569" stroke-width="1" />
          <line x1="308" y1="124" x2="332" y2="124" stroke="#475569" stroke-width="1" />
          <!-- Metal bottom contact tip -->
          <path d="M 314 130 C 314 137 326 137 326 130 Z" fill="#475569" />
          <!-- Sparkle target green pulse -->
          <circle cx="320" cy="120" r="0" fill="none" class="hidden" id="wire-success-pulse" />
        </g>

        <!-- 4. WIRES -->
        <!-- Wire 1 (Battery + to Switch L) -->
        <!-- Red core (copper) -->
        <path d="M 60 84 Q 60 40 170 50" fill="none" stroke="#c06040" stroke-width="7" stroke-linecap="round" />
        <!-- Red insulation -->
        <path d="M 60 86 Q 60 43 166 50" fill="none" stroke="#ef4444" stroke-width="5.5" stroke-linecap="round" />

        <!-- Wire 2 (Switch R to Bulb) -->
        <!-- Blue core (copper) -->
        <path d="${this.wireConnected ? 'M 230 50 Q 280 65 308 120' : 'M 230 50 Q 280 40 298 92'}" fill="none" stroke="#c06040" stroke-width="7" stroke-linecap="round" id="wire2-core" />
        <!-- Blue insulation -->
        <path d="${this.wireConnected ? 'M 234 50 Q 280 67 305 116' : 'M 234 50 Q 280 43 294 88'}" fill="none" stroke="#3b82f6" stroke-width="5.5" stroke-linecap="round" id="wire2-sleeve" />

        <!-- Wire 3 (Battery - to Bulb Tip) -->
        <!-- Black core (copper) -->
        <path d="M 60 150 Q 120 220 320 133" fill="none" stroke="#c06040" stroke-width="7" stroke-linecap="round" />
        <!-- Black insulation -->
        <path d="M 62 147 Q 120 216 315 134" fill="none" stroke="#1e293b" stroke-width="5.5" stroke-linecap="round" />

        <!-- 5. GLOWING PARTICLES (Electrons) -->
        <g id="particles-container"></g>

        <!-- 6. DIGITAL LIGHT MULTITOOL SENSOR -->
        <g transform="translate(140, 160)">
          <!-- Yellow multimeter body -->
          <rect x="0" y="0" width="100" height="55" rx="6" fill="#f59e0b" stroke="#d97706" stroke-width="2" />
          <!-- LCD Screen window -->
          <rect x="8" y="8" width="84" height="24" rx="3" fill="#18181b" stroke="#3f3f46" stroke-width="1.5" />
          <!-- LCD Values text -->
          <text x="50" y="24" fill="#fcd34d" font-size="12" font-weight="bold" font-family="monospace" text-anchor="middle" id="lab-sensor-readout">${(this.switchClosed && this.wireConnected) ? '12.5' : '0.0'} units</text>
          <text x="50" y="44" fill="#ffffff" font-size="7" font-weight="bold" text-anchor="middle" font-family="Outfit, sans-serif" opacity="0.8">DIGITAL LIGHT SENSOR</text>
          <!-- Cord connector -->
          <path d="M 85 45 Q 110 50 140 10 L 160 5" fill="none" stroke="#3f3f46" stroke-width="2" />
          <!-- Multitool light probe -->
          <circle cx="290" cy="155" r="4" fill="#3f3f46" />
          <rect x="288" y="155" width="4" height="8" rx="1" fill="#71717a" />
        </g>

        <!-- Interactive click targets (Invisible overlays for clean hits) -->
        <rect x="30" y="80" width="60" height="80" fill="transparent" class="cursor-pointer" id="hit-battery" style="pointer-events:all;" />
        <circle cx="200" cy="50" r="35" fill="transparent" class="cursor-pointer" id="hit-switch" style="pointer-events:all;" />
        <rect x="290" y="65" width="70" height="80" fill="transparent" class="cursor-pointer" id="hit-bulb" style="pointer-events:all;" />

        <!-- Wire Tip drag handle target overlay (Active in Screen 3) -->
        <circle cx="${this.wireConnected ? 308 : 298}" cy="${this.wireConnected ? 120 : 92}" r="14" fill="rgba(59, 130, 246, 0.1)" stroke="rgba(59, 130, 246, 0.4)" stroke-width="1.5" class="drag-target-zone ${(this.currentScreen === 3 && !this.wireConnected) ? '' : 'hidden'}" id="wire-drag-handle" style="pointer-events:all;" />
      </svg>
    `;
  }

  setScreen(index) {
    this.currentScreen = index;
    this.stop(); // Stop loops

    if (index === 1) {
      // Screen 1: Observe Faulty Circuit
      this.switchClosed = false;
      this.wireConnected = false;
      this.diagnosticSolved = false;

      this.screensContainer.innerHTML = `
        <div class="laboratory-canvas border border-slate-300 relative bg-slate-50 flex items-center justify-center" style="box-sizing: border-box; padding: 24px;">
          <div class="lab-header-banner">Screen 1: Observe the faulty circuit</div>
          ${this.renderSVGMarkup()}
          <div class="lab-instruction-banner" id="screen1-banner">
            🔎 Click on the Battery, Switch, and Bulb contacts to inspect them.
          </div>
        </div>
      `;
      this.bindInspectEvents();
      this.startAnimation();

    } else if (index === 2) {
      // Screen 2: Diagnose the Fault (Split Layout)
      this.screensContainer.innerHTML = `
        <div class="laboratory-canvas border border-slate-300 relative bg-slate-50 flex items-center justify-center" style="box-sizing: border-box; padding: 12px;">
          <div class="lab-split-layout">
            <div class="lab-split-left">
              <div class="lab-header-banner" style="position: absolute; top: 0; left: 0; right: 0;">Screen 2: Diagnose the Fault</div>
              ${this.renderSVGMarkup()}
            </div>
            <div class="lab-split-right">
              <div>
                <h3 class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Diagnostic MCQ</h3>
                <p class="text-[9px] text-slate-600 mb-3 font-medium">Identify why the bulb does not light up:</p>
                <div style="display: flex; flex-direction: column; gap: 6px;" id="sim-mcq-wrapper">
                  ${this.mcqOptions.map((opt, idx) => `
                    <label style="display: flex; align-items: start; gap: 6px; font-size: 8.5px; color: #334155; font-weight: 600; cursor: pointer; line-height: 1.3;">
                      <input type="radio" name="lab_mcq" value="${idx}" style="margin-top: 1px;">
                      <span>${opt}</span>
                    </label>
                  `).join('')}
                </div>
              </div>
              <!-- Feedback box -->
              <div id="mcq-feedback-box" style="font-size: 8.5px; color: #475569; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 10px; min-height: 45px; display: flex; align-items: center; line-height: 1.35;">
                🐻 Sprout: Inspect components on the left, then select the correct diagnosis!
              </div>
              <button id="mcq-submit-btn" class="modal-btn" style="background: var(--accent-purple); box-shadow: 0 4px 10px rgba(139, 92, 246, 0.2); width: 100%; border-radius: 8px; font-size: 9px; padding: 6px 0;">
                Submit Diagnosis ➡️
              </button>
            </div>
          </div>
        </div>
      `;
      this.bindInspectEvents();
      this.bindMCQEvents();
      this.startAnimation();

    } else if (index === 3) {
      // Screen 3: Repair Circuit
      this.screensContainer.innerHTML = `
        <div class="laboratory-canvas border border-slate-300 relative bg-slate-50 flex items-center justify-center" style="box-sizing: border-box; padding: 24px;">
          <div class="lab-header-banner">Screen 3: Repair the Circuit</div>
          ${this.renderSVGMarkup()}
          <div class="lab-instruction-banner" style="border-color: #10b981;">
            🔧 <strong>Action Required:</strong> Click the open switch lever and drag the blue wire onto the metal casing.
          </div>
          <div class="repair-hud-label">🔧 Repair Mode Active</div>
        </div>
      `;
      this.bindRepairEvents();
      this.startAnimation();

    } else if (index === 4) {
      // Screen 4: Watch Repaired Circuit Running
      this.switchClosed = true;
      this.wireConnected = true;
      this.animationPaused = false;

      this.screensContainer.innerHTML = `
        <div class="laboratory-canvas border border-slate-300 relative bg-slate-50 flex items-center justify-center" style="box-sizing: border-box; padding: 24px;">
          <div class="lab-header-banner">Screen 4: Repaired Circuit Working</div>
          ${this.renderSVGMarkup()}

          <!-- Centered success modal + dim backdrop overlay -->
          <div class="lab-modal-backdrop hidden" id="success-backdrop">
            <div class="lab-success-modal">
              <div class="modal-title">🎉 Circuit Repaired!</div>
              <div class="modal-mentor-feedback">🐻 Sprout: Outstanding job, Investigator! The switch is closed and the wire is snapped to the casing. Electric current flows!</div>
              <div class="modal-scientific-explanation">
                <strong>Scientific Concept:</strong> Closing the switch removes the gap. Snapping the wire to the metal casing connects to a conductor. The circuit is complete!
              </div>
              <button class="modal-btn" id="success-continue-btn">Continue to Lesson ➡️</button>
            </div>
          </div>
        </div>
      `;
      this.startAnimation();

      // Ramps sensor value and triggers Success modal after 2.5 seconds
      setTimeout(() => {
        // Dim background and pause animation loop
        const backdrop = this.container.querySelector("#success-backdrop");
        if (backdrop) {
          backdrop.classList.remove("hidden");
          this.animationPaused = true; // pause electron dots animation
        }
        
        // Bind modal continue trigger
        const continueBtn = this.container.querySelector("#success-continue-btn");
        if (continueBtn) {
          continueBtn.addEventListener('click', () => {
            this.playClick();
            this.setScreen(5);
          });
        }
      }, 2500);

    } else if (index === 5) {
      // Screen 5: Learn Why It Works (Full workspace diagram)
      this.screensContainer.innerHTML = `
        <div class="explanation-workspace">
          <div class="explanation-title">💡 Learning: Bulb Conductors & Insulators</div>
          <div class="explanation-body">
            <!-- Left: Large bulb diagram -->
            <div class="explanation-svg-container">
              <svg viewBox="0 0 100 120" style="width: 80%; height: 80%;">
                <path d="M 50 15 C 32 15 28 35 50 55 C 72 35 68 15 50 15" fill="rgba(253, 224, 71, 0.15)" stroke="#475569" stroke-width="1.8" />
                <text x="50" y="30" font-size="6" font-weight="bold" fill="#ea580c" text-anchor="middle">Glass Bulb</text>
                <text x="50" y="36" font-size="5" fill="#ef4444" text-anchor="middle">(Non-Conductor)</text>

                <rect x="36" y="55" width="28" height="24" rx="2" fill="#cbd5e1" stroke="#475569" stroke-width="1.8" />
                <line x1="36" y1="63" x2="64" y2="63" stroke="#475569" stroke-width="1" />
                <line x1="36" y1="71" x2="64" y2="71" stroke="#475569" stroke-width="1" />
                <text x="50" y="65" font-size="5.5" font-weight="bold" fill="#0f172a" text-anchor="middle">Metal Casing</text>
                <text x="50" y="70" font-size="4.5" fill="#10b981" text-anchor="middle">(Conductor)</text>

                <path d="M 43 79 C 43 86 57 86 57 79 Z" fill="#64748b" stroke="#475569" stroke-width="1.2" />
                <text x="50" y="93" font-size="6" font-weight="bold" fill="#0f172a" text-anchor="middle">Metal Tip</text>
                <text x="50" y="98" font-size="5" fill="#10b981" text-anchor="middle">(Conductor)</text>

                <!-- Labeled dashed lines -->
                <path d="M 24 25 L 38 25" stroke="#ef4444" stroke-width="0.8" stroke-dasharray="2 2" />
                <path d="M 76 68 L 60 68" stroke="#10b981" stroke-width="0.8" stroke-dasharray="2 2" />
                <path d="M 24 88 L 44 88" stroke="#10b981" stroke-width="0.8" stroke-dasharray="2 2" />
              </svg>
            </div>
            <!-- Right: Explanations -->
            <div class="explanation-text-container">
              <div class="explanation-card card-nonconductor">
                <div class="explanation-card-header">🔴 Glass Bulb Envelope</div>
                <div class="explanation-card-text">Made of glass, which is a <strong>non-conductor</strong>. It blocks electricity and prevents current from escaping the loop.</div>
              </div>
              <div class="explanation-card card-conductor">
                <div class="explanation-card-header">🟢 Metal Screw Casing</div>
                <div class="explanation-card-text">Made of metal, which is a <strong>conductor</strong>. Connecting a wire here lets electric current flow cleanly.</div>
              </div>
              <div class="explanation-card card-conductor">
                <div class="explanation-card-header">🟢 Metal contact Tip</div>
                <div class="explanation-card-text">The bottom contact tip is made of metal (a <strong>conductor</strong>) to carry current back to the battery.</div>
              </div>
            </div>
          </div>
          <button class="explanation-next-btn" id="explanation-next-btn">Next Step ➡️</button>
        </div>
      `;

      const nextBtn = this.container.querySelector("#explanation-next-btn");
      if (nextBtn) {
        nextBtn.addEventListener('click', () => {
          this.playClick();
          this.setScreen(6);
        });
      }

    } else if (index === 6) {
      // Screen 6: Complete the Mission (Victory card)
      this.screensContainer.innerHTML = `
        <div class="victory-workspace">
          <div class="victory-icon">🏆</div>
          <h2 class="victory-title">Mission Accomplished!</h2>
          <p class="victory-subtitle">Fabulous diagnosis, Investigator! You diagnosed the faults, completed the repairs, and mastered electrical conductors.</p>
          <div style="display: flex; gap: 12px; margin-top: 16px; justify-content: center; width: 100%;">
            <button class="explanation-next-btn" id="victory-complete-btn" style="background: #16a34a; box-shadow: 0 4px 10px rgba(22, 163, 74, 0.3); margin: 0; padding: 10px 20px;">
              Finish Academy Mission 🚀
            </button>
            <button class="explanation-next-btn" id="victory-tryagain-btn" style="background: #ef4444; box-shadow: 0 4px 10px rgba(239, 68, 68, 0.3); margin: 0; padding: 10px 20px;">
              🔄 Try Again
            </button>
          </div>
        </div>
      `;

      const completeBtn = this.container.querySelector("#victory-complete-btn");
      if (completeBtn) {
        completeBtn.addEventListener('click', () => {
          this.playSuccess();
          if (this.onCircuitRepaired) this.onCircuitRepaired();
        });
      }

      const tryAgainBtn = this.container.querySelector("#victory-tryagain-btn");
      if (tryAgainBtn) {
        tryAgainBtn.addEventListener('click', () => {
          this.resetSimulation();
        });
      }
    }
  }

  bindInspectEvents() {
    const hitBattery = this.container.querySelector("#hit-battery");
    const hitSwitch = this.container.querySelector("#hit-switch");
    const hitBulb = this.container.querySelector("#hit-bulb");
    const elSvg = this.container.querySelector("#lab-svg");

    const toggleZoom = (type, x, y) => {
      if (this.activeZoom === type) {
        elSvg.style.setProperty('--zoom-x', '50%');
        elSvg.style.setProperty('--zoom-y', '50%');
        elSvg.classList.remove('lab-zoomed');
        this.activeZoom = null;
        if (this.onInspect) this.onInspect(null);
      } else {
        this.playClick();
        elSvg.style.setProperty('--zoom-x', x);
        elSvg.style.setProperty('--zoom-y', y);
        elSvg.classList.add('lab-zoomed');
        this.activeZoom = type;
        this.inspected[type] = true;
        if (this.onInspect) this.onInspect(type);

        // Screen 1 proceed logic: check if all 3 inspected
        if (this.currentScreen === 1) {
          if (this.inspected.battery && this.inspected.switch && this.inspected.bulb) {
            const banner = this.container.querySelector("#screen1-banner");
            if (banner) {
              banner.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                  <span>🎉 All parts inspected! Ready to diagnose?</span>
                  <button id="screen1-proceed-btn" class="modal-btn" style="background: #10b981; padding: 4px 12px; font-size: 8px; border-radius: 6px; box-shadow: none;">Proceed to Diagnose ➡️</button>
                </div>
              `;
              const proceedBtn = banner.querySelector("#screen1-proceed-btn");
              proceedBtn.addEventListener('click', () => {
                this.playClick();
                elSvg.classList.remove('lab-zoomed'); // reset zoom
                this.setScreen(2);
              });
            }
          }
        }
      }
    };

    hitBattery.addEventListener('click', () => toggleZoom("battery", "15%", "50%"));
    hitSwitch.addEventListener('click', () => toggleZoom("switch", "50%", "20%"));
    hitBulb.addEventListener('click', () => toggleZoom("bulb", "80%", "50%"));
  }

  bindMCQEvents() {
    const submitBtn = this.container.querySelector("#mcq-submit-btn");
    const feedbackBox = this.container.querySelector("#mcq-feedback-box");
    const radios = this.container.querySelectorAll("input[name='lab_mcq']");

    let selectedIdx = null;

    radios.forEach(radio => {
      radio.addEventListener('change', (e) => {
        selectedIdx = parseInt(e.target.value, 10);
      });
    });

    submitBtn.addEventListener('click', () => {
      this.playClick();

      if (this.diagnosticSolved) {
        // Go to Screen 3 (Repair)
        this.setScreen(3);
        return;
      }

      if (selectedIdx === null) {
        feedbackBox.innerHTML = `⚠️ Sprout: Please select a diagnosis option first!`;
        feedbackBox.style.color = "#ef4444";
        return;
      }

      if (selectedIdx === 1) {
        // Correct index
        this.diagnosticSolved = true;
        this.playSuccess();
        feedbackBox.innerHTML = `<strong>🎉 Correct Diagnosis!</strong><br>Excellent diagnosis! There are two faults: the open switch creates a gap, and the wire touching the glass cannot conduct electricity.`;
        feedbackBox.style.color = "#10b981";
        feedbackBox.style.borderColor = "#10b981";
        
        // Lock selections
        radios.forEach(r => r.disabled = true);
        
        // Change submit button to Proceed
        submitBtn.innerHTML = `Proceed to Repair 🔧`;
        submitBtn.style.background = "#10b981";
        submitBtn.style.boxShadow = "0 4px 10px rgba(16, 185, 129, 0.2)";
      } else {
        let text = "";
        if (selectedIdx === 0) {
          text = "<strong>Misconception:</strong> The direction of the battery does not prevent a simple bulb from lighting. Look for a gap or a poor connection.";
        } else if (selectedIdx === 2) {
          text = "<strong>Misconception:</strong> A battery supplies electrical energy that can produce an electric current when the circuit is complete.";
        } else if (selectedIdx === 3) {
          text = "<strong>Misconception:</strong> The metal parts of the bulb conduct electricity. The glass part does not.";
        }
        feedbackBox.innerHTML = `❌ ${text}`;
        feedbackBox.style.color = "#ef4444";
      }
    });
  }

  bindRepairEvents() {
    const hitSwitch = this.container.querySelector("#hit-switch");
    
    // Switch close trigger
    hitSwitch.addEventListener('click', () => {
      if (!this.switchClosed) {
        this.switchClosed = true;
        this.playClick();
        
        const lever = this.container.querySelector("#switch-lever");
        lever.setAttribute("x2", "230");
        lever.setAttribute("y2", "50");
        
        this.container.querySelector("#switch-spark").classList.add("hidden");
        this.container.querySelector("#switch-warning-glow").classList.add("hidden");

        this.checkCompleteRepair();
      }
    });

    // Wire dragging
    const handle = this.container.querySelector("#wire-drag-handle");
    const elSvg = this.container.querySelector("#lab-svg");

    const startDrag = (e) => {
      if (this.wireConnected) return;
      e.preventDefault();
      this.isDragging = true;
      this.playClick();
    };

    const onDrag = (e) => {
      if (!this.isDragging) return;
      if (e.cancelable) e.preventDefault(); // Prevent touch scroll interruptions on mobile

      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      const rect = elSvg.getBoundingClientRect();
      const x = Math.min(400, Math.max(0, ((clientX - rect.left) / rect.width) * 400));
      const y = Math.min(240, Math.max(0, ((clientY - rect.top) / rect.height) * 240));

      const core = this.container.querySelector("#wire2-core");
      const sleeve = this.container.querySelector("#wire2-sleeve");

      const ctrlX = 230 + (x - 230) * 0.7;
      const ctrlY = 50 + (y - 50) * 0.1;

      core.setAttribute("d", `M 230 50 Q ${ctrlX} ${ctrlY} ${x} ${y}`);
      sleeve.setAttribute("d", `M 234 50 Q ${ctrlX} ${ctrlY} ${x - (x-230)*0.02} ${y - (y-50)*0.02}`);

      handle.setAttribute("cx", x);
      handle.setAttribute("cy", y);
    };

    const stopDrag = () => {
      if (!this.isDragging) return;
      this.isDragging = false;

      const cx = parseFloat(handle.getAttribute("cx"));
      const cy = parseFloat(handle.getAttribute("cy"));

      const targetX = 308;
      const targetY = 120;
      const dist = Math.hypot(cx - targetX, cy - targetY);

      if (dist < 40) { // More forgiving snapping range for easier touch/click alignment
        // Snapped
        this.wireConnected = true;
        this.playSuccess();

        const core = this.container.querySelector("#wire2-core");
        const sleeve = this.container.querySelector("#wire2-sleeve");

        core.setAttribute("d", `M 230 50 Q 280 65 308 120`);
        sleeve.setAttribute("d", `M 234 50 Q 280 67 305 116`);

        handle.setAttribute("cx", "308");
        handle.setAttribute("cy", "120");
        handle.classList.add("hidden");

        this.container.querySelector("#bulb-warning-glow").classList.add("hidden");
        this.container.querySelector("#bulb-warning-ring").classList.add("hidden");

        this.checkCompleteRepair();
      } else {
        // Snap back
        this.playClick();
        const core = this.container.querySelector("#wire2-core");
        const sleeve = this.container.querySelector("#wire2-sleeve");

        core.setAttribute("d", `M 230 50 Q 280 40 298 92`);
        sleeve.setAttribute("d", `M 234 50 Q 280 43 294 88`);

        handle.setAttribute("cx", "298");
        handle.setAttribute("cy", "92");
      }
    };

    handle.addEventListener('mousedown', startDrag);
    handle.addEventListener('touchstart', startDrag, { passive: false });

    window.addEventListener('mousemove', onDrag);
    window.addEventListener('touchmove', onDrag, { passive: false });

    window.addEventListener('mouseup', stopDrag);
    window.addEventListener('touchend', stopDrag);
  }

  checkCompleteRepair() {
    if (this.switchClosed && this.wireConnected) {
      this.playSuccess();
      
      // Animate glowing elements
      this.container.querySelector("#bulb-rays").classList.remove("opacity-0");
      this.container.querySelector("#bulb-glow-aura").setAttribute("fill", "rgba(253, 224, 71, 0.4)");
      this.container.querySelector("#bulb-glow-aura").setAttribute("filter", "url(#yellow-glow)");
      this.container.querySelector("#bulb-filament").classList.add("bulb-filament-glowing");
      this.container.querySelector("#bulb-glass").classList.add("bulb-glass-glowing");

      // Ramps readout
      const readout = this.container.querySelector("#lab-sensor-readout");
      let count = 0.0;
      const interval = setInterval(() => {
        count += 0.5;
        if (count >= 12.5) {
          count = 12.5;
          clearInterval(interval);
        }
        if (readout) readout.textContent = `${count.toFixed(1)} units`;
      }, 35);

      // Auto transition to Screen 4
      setTimeout(() => {
        this.setScreen(4);
      }, 1500);
    }
  }

  startAnimation() {
    const renderParticles = () => {
      if (this.animationPaused) return; // pause loops

      const container = this.container.querySelector("#particles-container");
      if (!container) return;

      let html = "";
      
      const getS1 = (t) => {
        const x = 60 * (1-t)*(1-t) + 2*60*t*(1-t) + 170*t*t;
        const y = 84 * (1-t)*(1-t) + 2*40*t*(1-t) + 50*t*t;
        return { x, y };
      };

      const getS2 = (t) => {
        if (!this.wireConnected) {
          const x = 230 * (1-t)*(1-t) + 2*280*t*(1-t) + 298*t*t;
          const y = 50 * (1-t)*(1-t) + 2*40*t*(1-t) + 92*t*t;
          return { x, y };
        } else {
          const x = 230 * (1-t)*(1-t) + 2*280*t*(1-t) + 308*t*t;
          const y = 50 * (1-t)*(1-t) + 2*65*t*(1-t) + 120*t*t;
          return { x, y };
        }
      };

      const getS3 = (t) => {
        const x = 320 * (1-t)*(1-t) + 2*120*t*(1-t) + 60*t*t;
        const y = 133 * (1-t)*(1-t) + 2*220*t*(1-t) + 150*t*t;
        return { x, y };
      };

      this.particles.forEach(p => {
        p.t += 0.015;
        if (p.t > 1) p.t = 0;

        let pt = { x: 0, y: 0 };

        if (p.track === "red") {
          if (!this.switchClosed) {
            pt = getS1(Math.min(0.95, p.t));
          } else {
            if (p.t < 0.5) {
              pt = getS1(p.t * 2);
            } else {
              const nt = (p.t - 0.5) * 2;
              pt = getS2(this.wireConnected ? nt : Math.min(0.95, nt));
            }
          }
        } else if (p.track === "black") {
          if (this.switchClosed && this.wireConnected) {
            pt = getS3(p.t);
          } else {
            pt = getS3(1 - Math.min(0.85, p.t));
          }
        }

        html += `<circle cx="${pt.x}" cy="${pt.y}" r="3" fill="#67e8f9" filter="drop-shadow(0 0 3px #22d3ee)" />`;
      });

      container.innerHTML = html;
      this.animationFrameId = requestAnimationFrame(renderParticles);
    };

    renderParticles();
  }

  stop() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }
}

// Expose simulation globally
window.ElectricityDiagnosticSimulation = ElectricityDiagnosticSimulation;


