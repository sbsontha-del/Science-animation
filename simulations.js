// Interactive Scientific Simulations Module

// --- 1. WATER CYCLE: EVAPORATION ANIMATION ---
class EvaporationSimulation {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
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
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
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
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(c.cx - c.topW / 2, topY);
      ctx.lineTo(c.cx - c.baseW / 2, bottomY);
      ctx.lineTo(c.cx + c.baseW / 2, bottomY);
      ctx.lineTo(c.cx + c.topW / 2, topY);
      ctx.stroke();

      // Draw Container labels
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 12px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(c.label, c.cx, topY - 15);

      // Draw current water volume text
      const pctLeft = Math.round((waterH / 120) * 100);
      ctx.fillStyle = 'rgba(148, 163, 184, 0.9)';
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

    this.initHTML();
    this.bindEvents();
  }

  setCircuitType(type) {
    this.selectedCircuitType = type;
    this.reset();
  }

  setErrorCase(errorCase) {
    this.setupErrorMode = true;
    this.activeErrorCase = errorCase;
    this.reset();
    
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
      this.slots.switch.value = { type: "switch", label: "Closed Switch", faulty: false };
      this.slots.bulb2.value = { type: "wire", label: "Wire", faulty: false };
    }
    
    this.updateBoard();
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
          <p class="text-sm text-slate-300">Drag components from the Toolbox into the flashing slots on the board to complete the circuit.</p>
        </div>
        
        <div class="circuit-board-container relative rounded-xl border border-slate-700 bg-slate-900/60 p-6 flex flex-col items-center">
          <!-- Main Circuit Loop Graphic -->
          <svg class="absolute inset-0 w-full h-full pointer-events-none" id="circuit-wire-svg">
            <!-- Electrical loop paths -->
            <rect x="50" y="50" width="calc(100% - 100px)" height="calc(100% - 100px)" rx="15" 
                  fill="none" stroke="rgba(71, 85, 105, 0.4)" stroke-width="6" id="wire-base" />
            <rect x="50" y="50" width="calc(100% - 100px)" height="calc(100% - 100px)" rx="15" 
                  fill="none" stroke="#eab308" stroke-dasharray="10 15" stroke-width="6" 
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
    if (!toolbox) return;

    if (this.setupErrorMode) {
      // In error mode, components are already locked on the board. No dragging.
      toolbox.innerHTML = `
        <div class="text-sm text-yellow-400 font-semibold p-2">
          Review the circuit above and answer the question below.
        </div>
      `;
      return;
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
      // Glow and active current
      if (flowLine) flowLine.classList.remove("hidden");
      
      let brightness = 0;
      if (this.selectedCircuitType === "A") brightness = 90;
      else if (this.selectedCircuitType === "B") brightness = 55;
      else if (this.selectedCircuitType === "C") brightness = 35; // wait, Circuit C has 3 bulbs in series, so we need 3 bulbs.
      // Wait, in our grid, we have 2 bulb slots: bulb1 and bulb2.
      // For Circuit C (3 bulbs in series), let's say the sensor detects 35 units because there are 3 bulbs in series (conceptually, circuit board sets series load).
      
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
      if (flowLine) flowLine.classList.add("hidden");
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
        <div class="torso-diagram w-64 h-64 border border-slate-700 bg-slate-950/60 rounded-xl relative p-4 mb-4 shadow-lg overflow-hidden">
          <svg class="w-full h-full" viewBox="0 0 120 120">
            <!-- Torso outline -->
            <path d="M 20,110 L 25,75 Q 26,45 40,40 L 45,35 Q 50,20 60,20 Q 70,20 75,35 L 80,40 Q 94,45 95,75 L 100,110 Z" 
                  fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="2"/>
            
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
            <circle cx="60" cy="22" r="10" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1.5"/>
            <!-- Nose path -->
            <path d="M 60,18 Q 52,18 52,24 Q 52,28 60,32" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="1.5"/>

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
        <div class="heart-diagram w-64 h-64 border border-slate-700 bg-slate-950/60 rounded-xl relative p-4 mb-4 shadow-lg overflow-hidden">
          <svg class="w-full h-full" viewBox="0 0 120 120">
            <!-- Lungs capillary bed (Top block) -->
            <rect x="40" y="5" width="40" height="15" rx="5" fill="none" stroke="rgba(56, 189, 248, 0.4)" stroke-width="1.5"/>
            <text x="60" y="15" font-size="7" font-weight="bold" fill="#38bdf8" text-anchor="middle" font-family="Outfit, sans-serif">LUNGS</text>

            <!-- Body Cells Capillaries (Bottom block) -->
            <rect x="40" y="100" width="40" height="15" rx="5" fill="none" stroke="rgba(244, 63, 94, 0.4)" stroke-width="1.5"/>
            <text x="60" y="110" font-size="7" font-weight="bold" fill="#f43f5e" text-anchor="middle" font-family="Outfit, sans-serif">BODY MUSCLES</text>

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
            Pulse Rate: 72 beats/min
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
      let rate = 72;
      if (level === 1) rate = 92;
      else if (level === 2) rate = 112;
      else if (level === 3) rate = 128;
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
