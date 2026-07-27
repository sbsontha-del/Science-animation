// Multi-Topic Scientific Investigation Lab - Application Logic

class InvestigationApp {
  constructor() {
    this.state = {
      activeStage: "Stage 1", // Stage 1, Stage 2, Stage 3, Quiz, Rewards
      completedLabs: {}, // keys: water_cycle, electrical, reproduction, respiratory, circulatory
      attempts: {
        water_cycle: 0,
        electrical: 0,
        reproduction: 0,
        respiratory: 0,
        circulatory: 0
      },
      scores: {}, // MCQ and structured scores per lab
      hintsUsed: {
        water_cycle: 0,
        electrical: 0,
        reproduction: 0,
        respiratory: 0,
        circulatory: 0
      },
      
      // Stage 1 State
      stage1Step: 0,

      // Stage 2 State
      activeLabKey: null,
      activeWizardStep: 0,
      placedVariables: { changed: null, measured: null },
      simRunning: false,
      simCompleted: false,
      userCalculatedOutputs: [],
      dataChecked: false,
      mcqCleared: false,
      structuredCleared: false,
      activeSimInstance: null,

      // Stage 3 State
      activeStage3Scenario: null,
      stage3CalculatedOutputs: [],
      scrambledProcedure: [],

      // Quiz State
      quizIndex: 0,
      quizCorrectCount: 0,
      quizCompleted: false
    };

    this.loadStateFromStorage();
    this.initElements();
    this.bindEvents();
    
    // Start with the welcome screen
    this.showScreen("welcome-screen");
    this.updateHUD();
  }

  loadStateFromStorage() {
    try {
      const saved = localStorage.getItem("p5_science_lab_state");
      if (saved) {
        const parsed = JSON.parse(saved);
        this.state.completedLabs = parsed.completedLabs || {};
        this.state.attempts = parsed.attempts || this.state.attempts;
        this.state.scores = parsed.scores || {};
        this.state.hintsUsed = parsed.hintsUsed || this.state.hintsUsed;
        this.state.activeStage = parsed.activeStage || "Stage 1";
      }
    } catch (e) {
      console.error("Failed to load state from localStorage:", e);
    }
  }

  saveStateToStorage() {
    try {
      const data = {
        completedLabs: this.state.completedLabs,
        attempts: this.state.attempts,
        scores: this.state.scores,
        hintsUsed: this.state.hintsUsed,
        activeStage: this.state.activeStage
      };
      localStorage.setItem("p5_science_lab_state", JSON.stringify(data));
    } catch (e) {
      console.error("Failed to save state to localStorage:", e);
    }
  }

  initElements() {
    // Buttons
    this.elStartStage1 = document.getElementById("start-stage1-btn");
    this.elSkipStage1 = document.getElementById("skip-stage1-btn");
    this.elStage1Next = document.getElementById("stage1-next-btn");
    this.elStage1Prev = document.getElementById("stage1-prev-btn");
    this.elBackToStage1 = document.getElementById("back-to-stage1-btn");
    this.elStartStage3 = document.getElementById("start-stage3-btn");
    this.elExitToMap = document.getElementById("exit-to-map-btn");
    this.elExitStage3ToMap = document.getElementById("exit-stage3-to-map-btn");
    this.elExitQuizToMap = document.getElementById("exit-quiz-to-map-btn");
    
    // Stage 2 elements
    this.elWStepPrev = document.getElementById("wstep-prev-btn");
    this.elWStepNext = document.getElementById("wstep-next-btn");
    this.elRunSim = document.getElementById("run-simulation-btn");
    this.elVerifyData = document.getElementById("verify-data-btn");
    this.elVerifyStructured = document.getElementById("verify-structured-btn");
    this.elPracticeHintTrigger = document.getElementById("practice-hint-btn");
    
    // Stage 3 elements
    this.elSubmitStage3 = document.getElementById("submit-investigation-btn");
    
    // Quiz elements
    this.elQuizSubmit = document.getElementById("quiz-submit-btn");
    this.elQuizNext = document.getElementById("quiz-next-btn");
    this.elRestartApp = document.getElementById("restart-app-btn");
    this.hudLogo = document.getElementById("hud-logo-btn");
  }

  bindEvents() {
    this.elStartStage1.addEventListener("click", () => {
      this.state.activeStage = "Stage 1";
      this.showScreen("stage1-screen");
      this.initStage1();
    });

    this.elSkipStage1.addEventListener("click", () => {
      this.state.activeStage = "Stage 2";
      this.showScreen("map-screen");
      this.initMap();
    });

    this.elStage1Next.addEventListener("click", () => this.nextStage1Step());
    this.elStage1Prev.addEventListener("click", () => this.prevStage1Step());
    
    this.elBackToStage1.addEventListener("click", () => {
      this.state.activeStage = "Stage 1";
      this.showScreen("stage1-screen");
      this.initStage1();
    });

    this.elExitToMap.addEventListener("click", () => {
      this.stopActiveSims();
      this.showScreen("map-screen");
      this.initMap();
    });

    this.elExitStage3ToMap.addEventListener("click", () => {
      this.showScreen("map-screen");
      this.initMap();
    });

    this.elExitQuizToMap.addEventListener("click", () => {
      this.showScreen("map-screen");
      this.initMap();
    });

    // Stage 2 Wizard Nav
    this.elWStepPrev.addEventListener("click", () => this.navigateWizard(-1));
    this.elWStepNext.addEventListener("click", () => this.navigateWizard(1));
    
    this.elRunSim.addEventListener("click", () => this.runPracticeSimulation());
    this.elVerifyData.addEventListener("click", () => this.checkPracticeDataSheet());
    this.elVerifyStructured.addEventListener("click", () => this.checkPracticeStructuredQuestion());
    this.elPracticeHintTrigger.addEventListener("click", () => this.showPracticeHint());
    
    // Stage 3 Start & Submit
    this.elStartStage3.addEventListener("click", () => {
      if (this.canUnlockStage3()) {
        this.state.activeStage = "Stage 3";
        this.showScreen("stage3-screen");
        this.initStage3();
      }
    });
    this.elSubmitStage3.addEventListener("click", () => this.submitStage3Journal());

    // Quiz triggers
    this.elQuizSubmit.addEventListener("click", () => this.submitQuizAnswer());
    this.elQuizNext.addEventListener("click", () => this.nextQuizQuestion());
    this.elRestartApp.addEventListener("click", () => this.resetAppAcademy());
    
    this.hudLogo.addEventListener("click", () => {
      this.stopActiveSims();
      this.showScreen("welcome-screen");
    });
  }

  showScreen(screenId) {
    const screens = [
      "welcome-screen", "stage1-screen", "map-screen", 
      "stage2-screen", "stage3-screen", "quiz-screen", "rewards-screen"
    ];
    
    screens.forEach(s => {
      const el = document.getElementById(s);
      if (el) {
        if (s === screenId) el.classList.remove("hidden");
        else el.classList.add("hidden");
      }
    });

    this.updateHUD();
  }

  updateHUD() {
    document.getElementById("active-stage-label").textContent = this.state.activeStage;
    
    const keys = Object.keys(PracticeLabs);
    let completedCount = 0;
    keys.forEach(k => {
      if (this.state.completedLabs[k]) completedCount++;
    });
    
    document.getElementById("completed-labs-count").textContent = `${completedCount}/${keys.length}`;
    
    const badgeHud = document.getElementById("badge-status-hud");
    if (this.canUnlockStage3()) {
      badgeHud.textContent = "Unlocked 🏅";
      badgeHud.style.color = "#fbbf24";
    } else {
      badgeHud.textContent = "Locked 🔒";
      badgeHud.style.color = "#64748b";
    }
  }

  canUnlockStage3() {
    const keys = Object.keys(PracticeLabs);
    let completedCount = 0;
    keys.forEach(k => {
      if (this.state.completedLabs[k] && this.state.completedLabs[k].mastered) {
        completedCount++;
      }
    });
    return completedCount >= 4;
  }

  stopActiveSims() {
    if (this.state.activeSimInstance) {
      if (typeof this.state.activeSimInstance.stop === "function") {
        this.state.activeSimInstance.stop();
      }
      this.state.activeSimInstance = null;
    }
  }


  // ==========================================
  // STAGE 1: I LEARN (MODELLED LAB)
  // ==========================================
  
  initStage1() {
    this.state.stage1Step = 0;
    this.updateStage1View();
  }

  updateStage1View() {
    const step = this.state.stage1Step;
    const speechEl = document.getElementById("stage1-sprout-speech");
    const titleEl = document.getElementById("stage1-notebook-title");
    const bodyEl = document.getElementById("stage1-notebook-body");
    
    this.elStage1Prev.disabled = step === 0;
    if (step === 6) {
      this.elStage1Next.textContent = "Finish Stage 1 🗺️";
    } else {
      this.elStage1Next.textContent = "Next Step ➡️";
    }

    // Reset plant absorption visualization
    const plantSvg = document.getElementById("stage1-plant-svg");
    const waterLayers = plantSvg.querySelectorAll("rect[fill*='rgba(56']");
    const oilLayers = plantSvg.querySelectorAll("line[stroke*='#f59']");
    
    // Default levels (initial volumes before transpiration)
    waterLayers[0].setAttribute("y", "55"); waterLayers[0].setAttribute("height", "30");
    waterLayers[1].setAttribute("y", "55"); waterLayers[1].setAttribute("height", "30");
    waterLayers[2].setAttribute("y", "55"); waterLayers[2].setAttribute("height", "30");
    oilLayers[0].setAttribute("y1", "55"); oilLayers[0].setAttribute("y2", "55");
    oilLayers[1].setAttribute("y1", "55"); oilLayers[1].setAttribute("y2", "55");
    oilLayers[2].setAttribute("y1", "55"); oilLayers[2].setAttribute("y2", "55");

    let speech = "";
    let journalHtml = "";

    switch (step) {
      case 0:
        speech = "Welcome! Let's start our scientific journey. We want to investigate how leaves affect a plant's water intake. Our first step is to state our <strong>Scientific Question</strong>.";
        journalHtml = `
          <div class="notebook-step">
            <div class="notebook-label">Step 1: Scientific Question</div>
            <div class="notebook-value">${PlantTransportLab.question}</div>
          </div>
        `;
        break;
      case 1:
        speech = "Excellent! Next, we define the <strong>Aim</strong> of our experiment. The Aim states clearly what we want to find out in the laboratory.";
        journalHtml = `
          <div class="notebook-step">
            <div class="notebook-label">Step 1: Scientific Question</div>
            <div class="notebook-value">${PlantTransportLab.question}</div>
          </div>
          <div class="notebook-step">
            <div class="notebook-label">Step 2: Aim of Investigation</div>
            <div class="notebook-value">${PlantTransportLab.aim}</div>
          </div>
        `;
        break;
      case 2:
        speech = "A <strong>Hypothesis</strong> is a logical scientific prediction. It shows the relationship between our variables and states a cause: more leaves mean more transpiration!";
        journalHtml = `
          <div class="notebook-step">
            <div class="notebook-label">Step 3: Scientific Hypothesis</div>
            <div class="notebook-value italic">"${PlantTransportLab.hypothesis}"</div>
          </div>
        `;
        break;
      case 3:
        speech = "To ensure a <strong>fair test</strong>, we identify our variables. We change only ONE variable, measure the outcome, and keep all other conditions identical (controlled).";
        journalHtml = `
          <div class="notebook-step">
            <div class="notebook-label">Step 4: Variable Classifications</div>
            <div class="mb-2"><span class="text-emerald-400 font-bold">Changed Var:</span> ${PlantTransportLab.changedVariable}</div>
            <div class="mb-2"><span class="text-sky-400 font-bold">Measured Var:</span> ${PlantTransportLab.measuredVariable}</div>
            <div>
              <span class="text-slate-400 font-bold">Controlled Vars:</span>
              <ul class="list-disc ml-4 text-xs mt-1 text-slate-300">
                ${PlantTransportLab.controlledVariables.map(v => `<li>${v}</li>`).join('')}
              </ul>
            </div>
          </div>
        `;
        break;
      case 4:
        speech = "Look at the <strong>Experimental Setup</strong> on the right. We prepare 3 identical beakers with 200 ml of water. We add a layer of oil. Do you know why? Yes, to prevent water evaporating directly into the air!";
        journalHtml = `
          <div class="notebook-step">
            <div class="notebook-label">Step 5: Experimental Set-up</div>
            <div class="notebook-value">${PlantTransportLab.setup.description}</div>
          </div>
        `;
        break;
      case 5:
        speech = "We leave them in a sunny location for 24 hours. Watch the water levels drop! Plant C (6 leaves) drops the most, while Plant A (0 leaves) doesn't change. Let's record the final volumes and calculate the water taken in.";
        
        // Visual drop animation in SVG
        waterLayers[1].setAttribute("y", "58"); waterLayers[1].setAttribute("height", "27");
        waterLayers[2].setAttribute("y", "65"); waterLayers[2].setAttribute("height", "20");
        oilLayers[1].setAttribute("y1", "58"); oilLayers[1].setAttribute("y2", "58");
        oilLayers[2].setAttribute("y1", "65"); oilLayers[2].setAttribute("y2", "65");

        journalHtml = `
          <div class="notebook-step">
            <div class="notebook-label">Step 6: Data Gathering Table</div>
            <table class="data-table-form text-xs w-full">
              <thead>
                <tr>
                  <th>Setup</th>
                  <th>Leaves</th>
                  <th>Initial (ml)</th>
                  <th>Final (ml)</th>
                  <th>Taken In (ml)</th>
                </tr>
              </thead>
              <tbody>
                ${PlantTransportLab.results.map(r => `
                  <tr>
                    <td class="font-bold">${r.label}</td>
                    <td>${r.changed}</td>
                    <td>${r.initial} ml</td>
                    <td>${r.final} ml</td>
                    <td class="text-cyan-400 font-bold">${r.output} ml</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `;
        break;
      case 6:
        speech = "Wonderful! Finally, we write the <strong>Conclusion</strong> based on our data. As the number of leaves increases, the amount of water taken in increases. Our hypothesis is supported!";
        
        // Keep drops
        waterLayers[1].setAttribute("y", "58"); waterLayers[1].setAttribute("height", "27");
        waterLayers[2].setAttribute("y", "65"); waterLayers[2].setAttribute("height", "20");
        oilLayers[1].setAttribute("y1", "58"); oilLayers[1].setAttribute("y2", "58");
        oilLayers[2].setAttribute("y1", "65"); oilLayers[2].setAttribute("y2", "65");

        journalHtml = `
          <div class="notebook-step">
            <div class="notebook-label">Step 7: Conclusion Statement</div>
            <div class="notebook-value border-l-emerald-500 font-bold">${PlantTransportLab.conclusion}</div>
          </div>
        `;
        break;
    }

    speechEl.innerHTML = speech;
    titleEl.textContent = `Plant Transport Notebook - Step ${step + 1} of 7`;
    bodyEl.innerHTML = journalHtml;
  }

  nextStage1Step() {
    if (this.state.stage1Step < 6) {
      this.state.stage1Step++;
      this.updateStage1View();
    } else {
      // Completed Stage 1, redirect to map
      this.state.activeStage = "Stage 2";
      this.showScreen("map-screen");
      this.initMap();
    }
  }

  prevStage1Step() {
    if (this.state.stage1Step > 0) {
      this.state.stage1Step--;
      this.updateStage1View();
    }
  }


  // ==========================================
  // TOPIC SELECTION MAP
  // ==========================================
  
  initMap() {
    const mapGrid = document.getElementById("labs-map-grid");
    if (!mapGrid) return;

    const labs = Object.values(PracticeLabs);
    
    // Config colors per lab
    const colors = {
      water_cycle: "#06b6d4",
      electrical: "#f59e0b",
      reproduction: "#10b981",
      respiratory: "#06b6d4", // cyan
      circulatory: "#f43f5e"
    };

    const icons = {
      water_cycle: "💧",
      electrical: "⚡",
      reproduction: "🌱",
      respiratory: "🫁",
      circulatory: "🫀"
    };

    mapGrid.innerHTML = labs.map(lab => {
      const key = lab.id;
      const attempts = this.state.attempts[key] || 0;
      const isCompleted = this.state.completedLabs[key];
      const isMastered = isCompleted && isCompleted.mastered;
      const badgeText = isMastered ? "Mastered" : isCompleted ? "Completed" : "Not Started";
      const mcqScore = isCompleted ? `${isCompleted.mcqScore || 0}%` : "-";
      const structScore = isCompleted ? `${isCompleted.structScore || 0}%` : "-";
      const color = colors[key] || "#3b82f6";
      const icon = icons[key] || "🔬";

      return `
        <div class="lab-card ${isMastered ? 'mastered' : ''}" style="--card-accent: ${color};" data-lab="${key}">
          <div class="lab-header">
            <span class="lab-icon">${icon}</span>
            <span class="lab-badge">${badgeText}</span>
          </div>
          <div class="lab-body">
            <span class="lab-topic">${lab.topic}</span>
            <h3>${lab.title}</h3>
          </div>
          <div class="lab-stats">
            <div>Attempts: <strong>${attempts}</strong></div>
            <div>Score: <strong>${mcqScore} / ${structScore}</strong></div>
          </div>
        </div>
      `;
    }).join('');

    // Attach card clicks
    const cards = mapGrid.querySelectorAll(".lab-card");
    cards.forEach(card => {
      card.addEventListener("click", () => {
        const labKey = card.dataset.lab;
        this.startPracticeLab(labKey);
      });
    });

    // Handle Stage 3 Unlock Button
    const stage3Btn = document.getElementById("start-stage3-btn");
    if (this.canUnlockStage3()) {
      stage3Btn.classList.remove("btn-disabled");
      stage3Btn.innerHTML = "Enter Stage 3 Challenge 🚀";
    } else {
      stage3Btn.classList.add("btn-disabled");
      stage3Btn.innerHTML = "🔒 Lock: Stage 3 Challenge (Complete 4 Labs first)";
    }
  }


  // ==========================================
  // STAGE 2: WE PRACTISE (GUIDED WORKSPACE)
  // ==========================================
  
  startPracticeLab(key) {
    this.stopActiveSims();

    const lab = PracticeLabs[key];
    if (!lab) return;

    this.state.activeLabKey = key;
    this.state.activeWizardStep = 0;
    this.state.placedVariables = { changed: null, measured: null };
    this.state.simRunning = false;
    this.state.simCompleted = false;
    this.state.userCalculatedOutputs = [];
    this.state.dataChecked = false;
    this.state.mcqCleared = false;
    this.state.structuredCleared = false;
    
    // Increment attempts
    this.state.attempts[key] = (this.state.attempts[key] || 0) + 1;
    this.saveStateToStorage();

    // Populate titles
    document.getElementById("practice-lab-topic").textContent = lab.topic;
    document.getElementById("practice-lab-title").textContent = lab.title;
    
    this.showScreen("stage2-screen");
    this.loadWizardStep(0);
  }

  loadWizardStep(stepIdx) {
    this.state.activeWizardStep = stepIdx;
    
    // Update step HUD
    const stepHUDs = document.querySelectorAll(".w-step");
    stepHUDs.forEach(hud => {
      const idx = parseInt(hud.dataset.wstep);
      hud.classList.remove("active", "completed");
      if (idx === stepIdx) hud.classList.add("active");
      else if (idx < stepIdx) hud.classList.add("completed");
    });

    // Toggle forms
    for (let i = 0; i <= 3; i++) {
      const el = document.getElementById(`wstep-content-${i}`);
      if (el) {
        if (i === stepIdx) el.classList.remove("hidden");
        else el.classList.add("hidden");
      }
    }

    // Reset feedback panel
    const feedbackBox = document.getElementById("wizard-feedback-box");
    feedbackBox.classList.add("hidden");
    
    // Hide hint panel
    document.getElementById("practice-hint-text").classList.add("hidden");

    this.elWStepPrev.disabled = stepIdx === 0;
    this.elWStepNext.disabled = true; // Wait for verification at each stage

    // Load step-specific contents
    switch (stepIdx) {
      case 0:
        this.setupPracticeStep1();
        break;
      case 1:
        this.setupPracticeStep2();
        break;
      case 2:
        this.setupPracticeStep3();
        break;
      case 3:
        this.setupPracticeStep4();
        break;
    }
  }

  navigateWizard(direction) {
    const nextStep = this.state.activeWizardStep + direction;
    if (nextStep >= 0 && nextStep <= 3) {
      this.loadWizardStep(nextStep);
    } else if (nextStep > 3) {
      // Completed last step -> Finish lab
      this.finishPracticeLab();
    }
  }

  showWizardFeedback(isSuccess, message) {
    const box = document.getElementById("wizard-feedback-box");
    const icon = document.getElementById("feedback-icon");
    const text = document.getElementById("feedback-message-text");

    box.classList.remove("hidden", "feedback-success", "feedback-error");
    if (isSuccess) {
      box.classList.add("feedback-success");
      icon.textContent = "✅";
    } else {
      box.classList.add("feedback-error");
      icon.textContent = "❌";
    }
    text.innerHTML = message;
  }

  // --- Step 1: Matching Variables ---
  setupPracticeStep1() {
    const lab = PracticeLabs[this.state.activeLabKey];
    
    // Setup drop zones clean
    const dropChanged = document.getElementById("drop-changed");
    const dropMeasured = document.getElementById("drop-measured");
    
    dropChanged.innerHTML = `<span class="text-[10px] text-slate-500">Drop Here</span>`;
    dropMeasured.innerHTML = `<span class="text-[10px] text-slate-500">Drop Here</span>`;
    
    document.getElementById("hypothesis-check-container").classList.add("hidden");

    // Populate draggable variables toolbox
    const toolbox = document.getElementById("scaffold-variable-toolbox");
    
    // We add correct changed, correct measured, and 2 controlled distractors
    const choices = [
      { id: "changed", text: lab.changedVariable },
      { id: "measured", text: lab.measuredVariable },
      { id: "ctrl1", text: lab.controlledVariables[0] },
      { id: "ctrl2", text: lab.controlledVariables[1] }
    ];
    
    // Shuffle choices
    choices.sort(() => Math.random() - 0.5);

    toolbox.innerHTML = choices.map(c => `
      <div class="draggable-pill" draggable="true" data-varid="${c.id}" data-text="${c.text}">
        ${c.text}
      </div>
    `).join('');

    // Re-bind drag handles
    const pills = toolbox.querySelectorAll(".draggable-pill");
    pills.forEach(pill => {
      pill.addEventListener("dragstart", (e) => {
        e.dataTransfer.setData("text/varid", pill.dataset.varid);
        e.dataTransfer.setData("text/pilltext", pill.dataset.text);
      });
    });

    const dropzones = document.querySelectorAll(".target-dropzone");
    dropzones.forEach(zone => {
      zone.addEventListener("dragover", (e) => {
        e.preventDefault();
        zone.classList.add("hovered");
      });

      zone.addEventListener("dragleave", () => {
        zone.classList.remove("hovered");
      });

      zone.addEventListener("drop", (e) => {
        e.preventDefault();
        zone.classList.remove("hovered");
        
        const varId = e.dataTransfer.getData("text/varid");
        const pillText = e.dataTransfer.getData("text/pilltext");
        const expected = zone.dataset.expected;

        // Visual snap
        zone.innerHTML = `<div class="draggable-pill placed">${pillText}</div>`;
        this.state.placedVariables[expected] = varId;

        this.checkVariablesMatching();
      });
    });

    // If already completed previously in this session
    if (this.state.placedVariables.changed === "changed" && this.state.placedVariables.measured === "measured") {
      this.checkVariablesMatching();
    }
  }

  checkVariablesMatching() {
    const p = this.state.placedVariables;
    if (p.changed && p.measured) {
      if (p.changed === "changed" && p.measured === "measured") {
        this.showWizardFeedback(true, "Splendid! You have correctly identified the variables.");
        
        // Show aim/hypothesis
        const lab = PracticeLabs[this.state.activeLabKey];
        document.getElementById("practice-lab-aim-readout").innerHTML = lab.aim;
        document.getElementById("practice-lab-hypothesis-readout").innerHTML = `"${lab.hypothesis}"`;
        document.getElementById("hypothesis-check-container").classList.remove("hidden");
        
        this.elWStepNext.disabled = false;
      } else {
        this.showWizardFeedback(false, "Hmm, those aren't quite correct. Remember, the <strong>Changed Variable</strong> is what we change, and the <strong>Measured Variable</strong> is the outcome we observe.");
        this.elWStepNext.disabled = true;
      }
    }
  }

  // --- Step 2: Simulation Viewport Setup ---
  setupPracticeStep2() {
    this.stopActiveSims();

    const labKey = this.state.activeLabKey;
    const lab = PracticeLabs[labKey];
    
    // Controlled variables summary
    const ctrlList = document.getElementById("practice-controlled-variables-list");
    ctrlList.innerHTML = lab.controlledVariables.map(v => `<li>${v}</li>`).join('');

    // Toggle viewports
    const canvas = document.getElementById("practice-evaporation-canvas");
    const container = document.getElementById("practice-interactive-sim-container");
    
    canvas.classList.add("hidden");
    container.innerHTML = "";

    // Reset button
    this.elRunSim.disabled = false;
    this.elRunSim.textContent = "Run Investigation 🧪";
    document.getElementById("simulation-running-hud").classList.add("hidden");

    // Initialize the appropriate visualization graphics
    if (labKey === "water_cycle") {
      canvas.classList.remove("hidden");
      this.state.activeSimInstance = new EvaporationSimulation("practice-evaporation-canvas");
    } else if (labKey === "electrical") {
      container.innerHTML = `<div id="circ-build-mount" class="w-full"></div>`;
      this.state.activeSimInstance = new CircuitBuilder("circ-build-mount", (complete, val, fault) => {
        if (complete) {
          this.state.simCompleted = true;
          this.elWStepNext.disabled = false;
          this.showWizardFeedback(true, `Excellent! The circuit is complete. The digital light sensor reads: <strong>${val} units</strong>.`);
        } else {
          this.state.simCompleted = false;
          this.elWStepNext.disabled = true;
          if (fault) {
            this.showWizardFeedback(false, `Oops! Circuit fails. Tip: checks for open switches or disconnected wires.`);
          }
        }
      });
      // For electrical systems, we must construct the circuit builder before proceeding
      this.elRunSim.classList.add("hidden"); // Drag/drop replaces the run button
    } else if (labKey === "reproduction") {
      container.innerHTML = `<div id="seed-mount" class="w-full"></div>`;
      this.state.activeSimInstance = new SeedGerminationSimulation("seed-mount");
      this.elRunSim.classList.remove("hidden");
    } else if (labKey === "respiratory") {
      container.innerHTML = `<div id="resp-mount" class="w-full"></div>`;
      this.state.activeSimInstance = new RespiratorySimulation("resp-mount");
      this.elRunSim.classList.remove("hidden");
    } else if (labKey === "circulatory") {
      container.innerHTML = `<div id="pulse-mount" class="w-full"></div>`;
      this.state.activeSimInstance = new CirculatorySimulation("pulse-mount");
      this.elRunSim.classList.remove("hidden");
    }
  }

  runPracticeSimulation() {
    const labKey = this.state.activeLabKey;
    const runHud = document.getElementById("simulation-running-hud");
    
    this.elRunSim.disabled = true;
    runHud.classList.remove("hidden");
    runHud.innerHTML = "Conducting experiment... 🧪 ⏳";

    let duration = 3000; // 3 seconds default

    if (labKey === "water_cycle") {
      this.state.activeSimInstance.start(5, 10, 16);
      duration = 8000; // evaporation time-lapse is 8s
    } else if (labKey === "reproduction") {
      // time lapse day transitions automatically
      let day = 0;
      const interval = setInterval(() => {
        day++;
        this.state.activeSimInstance.updateDays(day);
        if (day === 5) {
          clearInterval(interval);
          this.completeSimulationProgress();
        }
      }, 800);
      return;
    } else if (labKey === "respiratory" || labKey === "circulatory") {
      // Simulate exercising
      let level = 0;
      const interval = setInterval(() => {
        level++;
        if (level <= 3) {
          this.state.activeSimInstance.setExerciseLevel(level);
          // Trigger button highlighting in simulation
          const btns = this.state.activeSimInstance.container.querySelectorAll(labKey === "respiratory" ? ".exercise-btn" : ".pulse-btn");
          btns.forEach(b => {
            b.classList.remove('bg-sky-600', 'bg-rose-600', 'active-level');
            if (parseInt(b.dataset.level) === level) {
              b.classList.add(labKey === "respiratory" ? 'bg-sky-600' : 'bg-rose-600', 'active-level');
            }
          });
        } else {
          clearInterval(interval);
          this.completeSimulationProgress();
        }
      }, 1500);
      return;
    }

    setTimeout(() => {
      this.completeSimulationProgress();
    }, duration);
  }

  completeSimulationProgress() {
    document.getElementById("simulation-running-hud").classList.add("hidden");
    this.showWizardFeedback(true, "Data collection complete! You are ready to record results in the data sheet.");
    this.state.simCompleted = true;
    this.elWStepNext.disabled = false;
  }

  // --- Step 3: Data Sheet & Graphing ---
  setupPracticeStep3() {
    const lab = PracticeLabs[this.state.activeLabKey];
    
    // Headers
    document.getElementById("th-changed-var").textContent = lab.changedVariable;
    document.getElementById("th-measured-var").textContent = lab.measuredVariable;

    // Build Table Rows
    const tbody = document.getElementById("practice-table-rows");
    
    if (this.state.activeLabKey === "water_cycle") {
      tbody.innerHTML = lab.results.map((r, idx) => `
        <tr>
          <td class="font-bold text-xs">${r.label} (${r.changed})</td>
          <td class="font-mono text-xs">${r.initial} ml</td>
          <td class="font-mono text-xs">${r.final} ml</td>
          <td>
            <input type="number" class="table-input" data-index="${idx}" id="input-row-${idx}" placeholder="?" /> ml
          </td>
        </tr>
      `).join('');
    } else if (this.state.activeLabKey === "electrical") {
      tbody.innerHTML = lab.results.map((r, idx) => `
        <tr>
          <td class="font-bold text-xs">${r.label}</td>
          <td class="font-mono text-xs">-</td>
          <td class="font-mono text-xs">-</td>
          <td>
            <input type="number" class="table-input" data-index="${idx}" id="input-row-${idx}" placeholder="?" /> units
          </td>
        </tr>
      `).join('');
    } else if (this.state.activeLabKey === "reproduction") {
      tbody.innerHTML = lab.results.map((r, idx) => `
        <tr>
          <td class="font-bold text-xs">${r.label}</td>
          <td class="font-mono text-xs">${r.initial} seeds</td>
          <td class="font-mono text-xs">-</td>
          <td>
            <input type="number" class="table-input" data-index="${idx}" id="input-row-${idx}" placeholder="?" /> germinated
          </td>
        </tr>
      `).join('');
    } else if (this.state.activeLabKey === "respiratory" || this.state.activeLabKey === "circulatory") {
      tbody.innerHTML = lab.results.map((r, idx) => {
        const countLabel = this.state.activeLabKey === "respiratory" ? "Breaths / 30s" : "Beats / 15s";
        const calcText = this.state.activeLabKey === "respiratory" ? "Rate (x2)" : "Rate (x4)";
        const countVal = this.state.activeLabKey === "respiratory" ? r.count30s : r.count15s;
        const unit = this.state.activeLabKey === "respiratory" ? "breaths/min" : "beats/min";

        return `
          <tr>
            <td class="font-bold text-xs">${r.label}</td>
            <td class="font-mono text-xs">${countVal} (${countLabel})</td>
            <td class="font-mono text-xs">-</td>
            <td>
              <input type="number" class="table-input" data-index="${idx}" id="input-row-${idx}" placeholder="?" /> ${unit}
            </td>
          </tr>
        `;
      }).join('');
    }

    // Reset graph
    document.getElementById("practice-results-graph").innerHTML = `
      <div class="text-xs text-slate-500 w-full text-center">Verify data sheet to plot graph.</div>
    `;
    document.getElementById("graph-x-label").textContent = `X-Axis: ${lab.changedVariable}`;

    this.state.dataChecked = false;
  }

  checkPracticeDataSheet() {
    const lab = PracticeLabs[this.state.activeLabKey];
    let allCorrect = true;
    const inputs = [];

    lab.results.forEach((r, idx) => {
      const inputEl = document.getElementById(`input-row-${idx}`);
      if (!inputEl) return;

      const val = parseFloat(inputEl.value);
      if (isNaN(val) || val !== r.output) {
        allCorrect = false;
        inputEl.style.borderColor = "#ef435f"; // Red border
      } else {
        inputEl.style.borderColor = "#10b981"; // Green border
        inputs.push(val);
      }
    });

    if (allCorrect) {
      this.showWizardFeedback(true, "Splendid! All calculations on the data sheet are correct.");
      
      // Plot the graph bars
      const graph = document.getElementById("practice-results-graph");
      
      // Find max value to scale heights
      const maxVal = Math.max(...lab.results.map(r => r.output));

      graph.innerHTML = lab.results.map((r, idx) => {
        const pctHeight = Math.max(15, (r.output / maxVal) * 80); // cap min height at 15% for visual
        return `
          <div class="graph-bar-wrapper">
            <div class="text-[10px] text-cyan-400 font-bold mb-1">${r.output}</div>
            <div class="graph-bar w-full" style="height: ${pctHeight}%; --accent-cyan: ${this.getLabColor(this.state.activeLabKey)};"></div>
            <div class="graph-label">${r.label.split(' ')[0]}</div>
          </div>
        `;
      }).join('');

      this.state.dataChecked = true;
      this.elWStepNext.disabled = false;
    } else {
      this.showWizardFeedback(false, "Some values in the data sheet are incorrect or missing. Double check your calculations.");
      this.state.dataChecked = false;
      this.elWStepNext.disabled = true;
    }
  }

  getLabColor(key) {
    const colors = {
      water_cycle: "#06b6d4",
      electrical: "#f59e0b",
      reproduction: "#10b981",
      respiratory: "#06b6d4",
      circulatory: "#f43f5e"
    };
    return colors[key] || "#3b82f6";
  }

  // --- Step 4: MCQ & Structured Questions ---
  setupPracticeStep4() {
    const lab = PracticeLabs[this.state.activeLabKey];
    
    // Clear check boxes
    document.getElementById("practice-mcq-container").classList.remove("hidden");
    document.getElementById("practice-structured-container").classList.add("hidden");
    
    // Set MCQ Q
    document.getElementById("practice-mcq-q-text").innerHTML = lab.quiz.mcq.question;
    
    // Populate options
    const optContainer = document.getElementById("practice-mcq-options-container");
    optContainer.innerHTML = lab.quiz.mcq.options.map((opt, idx) => `
      <div class="quiz-option-card" data-idx="${idx}">
        <span class="font-bold text-xs uppercase text-slate-500">${String.fromCharCode(65 + idx)}.</span>
        <span class="text-xs text-slate-200">${opt}</span>
      </div>
    `).join('');

    const cards = optContainer.querySelectorAll(".quiz-option-card");
    cards.forEach(card => {
      card.addEventListener("click", () => {
        // Evaluate immediately
        const selIdx = parseInt(card.dataset.idx);
        cards.forEach(c => c.classList.remove("correct", "incorrect"));
        
        if (selIdx === lab.quiz.mcq.correctIndex) {
          card.classList.add("correct");
          this.showWizardFeedback(true, "Correct! Well done. Let's move to the structured question.");
          setTimeout(() => {
            this.transitionToPracticeStructured();
          }, 1200);
        } else {
          card.classList.add("incorrect");
          this.showWizardFeedback(false, "That's not the correct answer. Review the hint below.");
        }
      });
    });

    this.state.mcqCleared = false;
  }

  transitionToPracticeStructured() {
    const lab = PracticeLabs[this.state.activeLabKey];
    
    document.getElementById("practice-mcq-container").classList.add("hidden");
    document.getElementById("practice-structured-container").classList.remove("hidden");
    
    document.getElementById("practice-struct-q-text").innerHTML = lab.quiz.structured.question;
    
    // Build sentence frame with dropdowns
    // sentenceFrame: "They must be placed in the same location so that they experience the same ________ conditions. Therefore, any difference in the amount of water evaporated is caused only by the ________."
    // We replace the underlines with select tags filled with options
    const box = document.getElementById("practice-sentence-builder-box");
    
    let frameHtml = lab.quiz.structured.frameText || lab.quiz.structured.sentenceFrame;
    
    // Words options database
    const wordPool = {
      water_cycle: ["surrounding", "exposed", "surface", "volume", "initial", "conditions", "area"],
      electrical: ["bulbs", "batteries", "circuits", "wires", "switches"],
      reproduction: ["water", "seeds", "cotton", "oxygen", "warmth", "dishes"],
      respiratory: ["breathing", "fitness", "lungs", "running", "fairly", "Ali", "duration"],
      circulatory: ["decrease", "exercise", "increase", "heart", "muscles", "pulse"]
    };

    const options = wordPool[this.state.activeLabKey] || ["water", "air", "light"];
    const selectTemplate = (id) => `
      <select class="sentence-select" id="select-word-${id}">
        <option value="">--select--</option>
        ${options.map(o => `<option value="${o}">${o}</option>`).join('')}
      </select>
    `;

    // Replace ________ (8 underscores) with select boxes.
    // Replace sequentially
    let selectCounter = 0;
    while (frameHtml.includes("________")) {
      frameHtml = frameHtml.replace("________", selectTemplate(selectCounter));
      selectCounter++;
    }

    box.innerHTML = frameHtml;
    this.state.structuredCleared = false;
  }

  checkPracticeStructuredQuestion() {
    const lab = PracticeLabs[this.state.activeLabKey];
    const selects = this.container.querySelectorAll(".sentence-select");
    let allCorrect = true;

    selects.forEach((sel, idx) => {
      const val = sel.value;
      const expected = lab.quiz.structured.expectedKeywords[idx];
      if (val !== expected) {
        allCorrect = false;
        sel.style.borderColor = "#ef435f";
      } else {
        sel.style.borderColor = "#10b981";
      }
    });

    if (allCorrect) {
      // Mastered!
      this.showWizardFeedback(true, "Outstanding! You have masterfully answered the structured explanation.");
      this.state.structuredCleared = true;
      this.elWStepNext.disabled = false;
      this.elWStepNext.textContent = "Finish Lab & Map 🗺️";
    } else {
      this.showWizardFeedback(false, "Not quite correct. Check the words selected in your explanation.");
      this.elWStepNext.disabled = true;
    }
  }

  showPracticeHint() {
    const lab = PracticeLabs[this.state.activeLabKey];
    const hintTextEl = document.getElementById("practice-hint-text");
    
    // Add hint use count
    this.state.hintsUsed[this.state.activeLabKey]++;

    hintTextEl.classList.remove("hidden");
    if (!this.state.mcqCleared && document.getElementById("practice-structured-container").classList.contains("hidden")) {
      hintTextEl.textContent = lab.quiz.mcq.hint;
    } else {
      hintTextEl.textContent = lab.quiz.structured.hint;
    }
  }

  finishPracticeLab() {
    const key = this.state.activeLabKey;
    
    // Mark as completed
    this.state.completedLabs[key] = {
      completed: true,
      mastered: true, // Stage 2 labs require complete wizard walkthrough
      mcqScore: 100, // cleared 100% to proceed
      structScore: 100
    };
    
    this.saveStateToStorage();
    this.stopActiveSims();

    // Route to selection map
    this.showScreen("map-screen");
    this.initMap();
  }


  // ==========================================
  // STAGE 3: I INVESTIGATE (INDEPENDENT PLANNER)
  // ==========================================
  
  initStage3() {
    // Select a random scenario
    const randIdx = Math.floor(Math.random() * InvestigateScenarios.length);
    this.state.activeStage3Scenario = InvestigateScenarios[randIdx];
    
    const sc = this.state.activeStage3Scenario;

    document.getElementById("stage3-scenario-text").textContent = sc.scenario;

    // Reset journal fields
    this.setupStage3Inputs();
    this.setupStage3Procedure();
    this.setupStage3DataTable();
  }

  setupStage3Inputs() {
    const sc = this.state.activeStage3Scenario;

    // Generate random options for questions
    const qSelect = document.getElementById("journal-q-select");
    const questions = [sc.question, ...InvestigateScenarios.filter(x => x.id !== sc.id).map(x => x.question)];
    questions.sort(() => Math.random() - 0.5);
    qSelect.innerHTML = `<option value="">--Select Scientific Question--</option>` + 
      questions.map(q => `<option value="${q}">${q}</option>`).join('');

    // Aim Options
    const aimSelect = document.getElementById("journal-aim-select");
    const aims = [sc.aim, ...InvestigateScenarios.filter(x => x.id !== sc.id).map(x => x.aim)];
    aims.sort(() => Math.random() - 0.5);
    aimSelect.innerHTML = `<option value="">--Select Aim--</option>` + 
      aims.map(a => `<option value="${a}">${a}</option>`).join('');

    // Hypothesis
    const hypoSelect = document.getElementById("journal-hypo-select");
    const hypos = [sc.hypothesis, ...InvestigateScenarios.filter(x => x.id !== sc.id).map(x => x.hypothesis)];
    hypos.sort(() => Math.random() - 0.5);
    hypoSelect.innerHTML = `<option value="">--Select Hypothesis--</option>` + 
      hypos.map(h => `<option value="${h}">${h}</option>`).join('');

    // Changed Variable
    const changedSelect = document.getElementById("journal-changed-select");
    const changeds = [sc.changedVariable, ...InvestigateScenarios.filter(x => x.id !== sc.id).map(x => x.changedVariable)];
    changeds.sort(() => Math.random() - 0.5);
    changedSelect.innerHTML = `<option value="">--Select Changed Variable--</option>` + 
      changeds.map(c => `<option value="${c}">${c}</option>`).join('');

    // Measured Variable
    const measuredSelect = document.getElementById("journal-measured-select");
    const measureds = [sc.measuredVariable, ...InvestigateScenarios.filter(x => x.id !== sc.id).map(x => x.measuredVariable)];
    measureds.sort(() => Math.random() - 0.5);
    measuredSelect.innerHTML = `<option value="">--Select Measured Variable--</option>` + 
      measureds.map(m => `<option value="${m}">${m}</option>`).join('');

    // Controlled Variables Checkboxes
    const ctrlContainer = document.getElementById("journal-controlled-checkboxes");
    const allCtrls = [...sc.controlledVariables];
    
    // Add two distractors (changed variables or irrelevant terms)
    allCtrls.push("Speed of the wind during seed germination", "Number of identical beakers connected in series");
    allCtrls.sort(() => Math.random() - 0.5);

    ctrlContainer.innerHTML = allCtrls.map((v, idx) => `
      <label class="flex items-center gap-2 text-xs text-slate-300 mb-2 cursor-pointer">
        <input type="checkbox" class="ctrl-checkbox" value="${v}">
        <span>${v}</span>
      </label>
    `).join('');

    // Setup fault detection
    const faultDesc = document.getElementById("stage3-faulty-desc");
    faultDesc.innerHTML = `Identify the fault in Tom's proposed setup options:`;
    
    const optionsContainer = document.getElementById("stage3-setup-options");
    optionsContainer.innerHTML = sc.setupOptions.map((opt, idx) => `
      <label class="flex items-start gap-2 text-xs text-slate-300 cursor-pointer bg-slate-900/60 p-2 rounded border border-slate-800 hover:bg-slate-800">
        <input type="radio" name="stage3-fault-choice" value="${opt.id}" class="mr-2 mt-0.5">
        <span>${opt.text}</span>
      </label>
    `).join('');

    // Conclusion Select
    const conclusionSelect = document.getElementById("journal-conclusion-select");
    const conclusions = [sc.conclusion, ...InvestigateScenarios.filter(x => x.id !== sc.id).map(x => x.conclusion)];
    conclusions.sort(() => Math.random() - 0.5);
    conclusionSelect.innerHTML = `<option value="">--Select Conclusion--</option>` + 
      conclusions.map(c => `<option value="${c}">${c}</option>`).join('');
  }

  // --- Step 8: Procedure sorting ---
  setupStage3Procedure() {
    const sc = this.state.activeStage3Scenario;
    
    // Scramble the procedure
    this.state.scrambledProcedure = [...sc.procedure];
    this.state.scrambledProcedure.sort(() => Math.random() - 0.5);
    
    this.renderStage3ProcedureList();
  }

  renderStage3ProcedureList() {
    const list = document.getElementById("stage3-procedure-list");
    list.innerHTML = this.state.scrambledProcedure.map((p, idx) => `
      <div class="flex items-center justify-between bg-slate-900 border border-slate-800 rounded p-2 text-[11px] text-slate-200">
        <span class="flex-1">${idx + 1}. ${p}</span>
        <div class="flex gap-1 ml-2">
          <button class="bg-slate-700 hover:bg-slate-600 text-white rounded p-1 text-[8px] up-btn" data-idx="${idx}">▲</button>
          <button class="bg-slate-700 hover:bg-slate-600 text-white rounded p-1 text-[8px] down-btn" data-idx="${idx}">▼</button>
        </div>
      </div>
    `).join('');

    // Bind reordering triggers
    const upBtns = list.querySelectorAll(".up-btn");
    upBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.dataset.idx);
        if (idx > 0) {
          const temp = this.state.scrambledProcedure[idx];
          this.state.scrambledProcedure[idx] = this.state.scrambledProcedure[idx - 1];
          this.state.scrambledProcedure[idx - 1] = temp;
          this.renderStage3ProcedureList();
        }
      });
    });

    const downBtns = list.querySelectorAll(".down-btn");
    downBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.dataset.idx);
        if (idx < this.state.scrambledProcedure.length - 1) {
          const temp = this.state.scrambledProcedure[idx];
          this.state.scrambledProcedure[idx] = this.state.scrambledProcedure[idx + 1];
          this.state.scrambledProcedure[idx + 1] = temp;
          this.renderStage3ProcedureList();
        }
      });
    });
  }

  // --- Step 9: Results Table ---
  setupStage3DataTable() {
    const sc = this.state.activeStage3Scenario;
    
    // Labels
    document.getElementById("stage3-th-changed").textContent = sc.changedVariable;
    document.getElementById("stage3-th-measured").textContent = sc.measuredVariable;
    document.getElementById("stage3-graph-x-label").textContent = `X-Axis: ${sc.changedVariable}`;

    // Table rows
    const tbody = document.getElementById("stage3-table-rows");
    tbody.innerHTML = sc.results.map((r, idx) => {
      const initVal = r.initial !== 0 ? `${r.initial}` : "-";
      const finalVal = r.final !== 0 ? `${r.final}` : "-";
      return `
        <tr>
          <td class="font-bold text-xs">${r.label}</td>
          <td class="font-mono text-xs">${initVal}</td>
          <td class="font-mono text-xs">${finalVal}</td>
          <td>
            <input type="number" class="table-input s3-input" data-index="${idx}" id="s3-input-${idx}" placeholder="?" />
          </td>
        </tr>
      `;
    }).join('');

    // Clear graph
    document.getElementById("stage3-graph").innerHTML = `
      <div class="text-xs text-slate-500 w-full text-center py-8">Complete table calculations to plot graph.</div>
    `;

    // Dynamic input check for live graphing
    const inputs = tbody.querySelectorAll(".s3-input");
    inputs.forEach(input => {
      input.addEventListener("input", () => this.drawStage3GraphPreview());
    });
  }

  drawStage3GraphPreview() {
    const sc = this.state.activeStage3Scenario;
    const graph = document.getElementById("stage3-graph");
    
    let allInputsFilled = true;
    const values = [];

    sc.results.forEach((r, idx) => {
      const val = parseFloat(document.getElementById(`s3-input-${idx}`).value);
      if (isNaN(val)) {
        allInputsFilled = false;
      } else {
        values.push(val);
      }
    });

    if (allInputsFilled) {
      const maxVal = Math.max(...values, 1);
      graph.innerHTML = sc.results.map((r, idx) => {
        const h = Math.max(15, (values[idx] / maxVal) * 80);
        return `
          <div class="graph-bar-wrapper">
            <div class="text-[9px] text-amber-500 font-bold mb-1">${values[idx]}</div>
            <div class="graph-bar w-full" style="height: ${h}%; background: linear-gradient(180deg, var(--accent-amber), rgba(245, 158, 11, 0.2));"></div>
            <div class="graph-label">${r.label.split(' ')[0]}</div>
          </div>
        `;
      }).join('');
    } else {
      graph.innerHTML = `
        <div class="text-xs text-slate-500 w-full text-center py-8">Complete table calculations to plot graph.</div>
      `;
    }
  }

  // --- Step 11: Validation ---
  submitStage3Journal() {
    const sc = this.state.activeStage3Scenario;
    let errors = [];

    // 1. Question
    const qVal = document.getElementById("journal-q-select").value;
    if (qVal !== sc.question) errors.push("Step 1: Scientific Question is incorrect.");

    // 2. Aim
    const aimVal = document.getElementById("journal-aim-select").value;
    if (aimVal !== sc.aim) errors.push("Step 2: Aim of Experiment is incorrect.");

    // 3. Hypothesis
    const hypoVal = document.getElementById("journal-hypo-select").value;
    if (hypoVal !== sc.hypothesis) errors.push("Step 3: Hypothesis is incorrect.");

    // 4. Changed Variable
    const changedVal = document.getElementById("journal-changed-select").value;
    if (changedVal !== sc.changedVariable) errors.push("Step 4: Changed Variable is incorrect.");

    // 5. Measured Variable
    const measuredVal = document.getElementById("journal-measured-select").value;
    if (measuredVal !== sc.measuredVariable) errors.push("Step 5: Measured Variable is incorrect.");

    // 6. Controlled Variables
    const checkboxes = document.querySelectorAll(".ctrl-checkbox");
    const checked = Array.from(checkboxes).filter(c => c.checked).map(c => c.value);
    
    const correctCtrls = sc.controlledVariables;
    const hasDistractor = checked.some(c => !correctCtrls.includes(c));
    const missesCorrect = correctCtrls.some(c => !checked.includes(c));

    if (hasDistractor || missesCorrect) {
      errors.push("Step 6: Controlled Variables selection is incorrect. Ensure you keep all variables identical except for the changed variable.");
    }

    // 7. Faulty Setup
    const faultChoice = document.querySelector("input[name='stage3-fault-choice']:checked");
    if (!faultChoice || faultChoice.value !== "correct") {
      errors.push("Step 7: Setup Fault Selection is incorrect. Examine how variables are controlled.");
    }

    // 8. Procedure Ordering
    const correctProcStr = JSON.stringify(sc.procedure);
    const userProcStr = JSON.stringify(this.state.scrambledProcedure);
    if (correctProcStr !== userProcStr) {
      errors.push("Step 8: Experimental Procedure order is incorrect.");
    }

    // 9. Results calculations
    let resultsCorrect = true;
    sc.results.forEach((r, idx) => {
      const val = parseFloat(document.getElementById(`s3-input-${idx}`).value);
      if (isNaN(val) || val !== r.output) {
        resultsCorrect = false;
      }
    });
    if (!resultsCorrect) {
      errors.push("Step 9: Data calculations are incorrect. Check initial and final differences.");
    }

    // 11. Conclusion
    const conclusionVal = document.getElementById("journal-conclusion-select").value;
    if (conclusionVal !== sc.conclusion) {
      errors.push("Step 11: Conclusion statement is incorrect.");
    }

    if (errors.length === 0) {
      alert("Perfect! Your laboratory journal has been reviewed by the Science Academy and graded 100% correct! Unlocking the final Mixed Quiz assessment.");
      this.state.activeStage = "Quiz";
      this.showScreen("quiz-screen");
      this.initMixedQuiz();
    } else {
      alert("Assessment Review Found Errors:\n\n" + errors.map(e => `• ${e}`).join('\n') + "\n\nCorrect the errors in your journal and submit again.");
    }
  }


  // ==========================================
  // MIXED QUIZ CONTROLLER
  // ==========================================
  
  initMixedQuiz() {
    this.state.quizIndex = 0;
    this.state.quizCorrectCount = 0;
    this.state.quizCompleted = false;

    // Shuffle mixed quiz questions
    MixedQuizQuestions.sort(() => Math.random() - 0.5);

    document.getElementById("quiz-total-q").textContent = MixedQuizQuestions.length;
    this.loadQuizQuestion(0);
  }

  loadQuizQuestion(idx) {
    this.state.quizIndex = idx;
    
    // Progress HUD
    document.getElementById("quiz-q-num").textContent = idx + 1;
    const progressPct = (idx / MixedQuizQuestions.length) * 100;
    document.getElementById("quiz-progress-bar").style.width = `${progressPct}%`;

    const q = MixedQuizQuestions[idx];

    document.getElementById("quiz-q-topic").textContent = q.topic;
    document.getElementById("quiz-question-text").innerHTML = q.question;

    // Reset button layouts
    this.elQuizSubmit.classList.remove("hidden");
    this.elQuizNext.classList.add("hidden");
    this.elQuizSubmit.disabled = false;

    // Reset feedback
    const feed = document.getElementById("quiz-feedback-box");
    feed.classList.add("hidden");

    const optContainer = document.getElementById("quiz-options-container");
    const structContainer = document.getElementById("quiz-structured-container");

    optContainer.innerHTML = "";
    structContainer.innerHTML = "";
    optContainer.classList.add("hidden");
    structContainer.classList.add("hidden");

    if (q.type === "mcq" || q.type === "graph_reading" || q.type === "conclusion_writing") {
      optContainer.classList.remove("hidden");
      optContainer.innerHTML = q.options.map((opt, i) => `
        <div class="quiz-option-card" data-idx="${i}">
          <span class="font-bold text-xs uppercase text-slate-500">${String.fromCharCode(65 + i)}.</span>
          <span class="text-xs text-slate-200">${opt}</span>
        </div>
      `).join('');

      // Add choice selections
      const cards = optContainer.querySelectorAll(".quiz-option-card");
      cards.forEach(card => {
        card.addEventListener("click", () => {
          cards.forEach(c => c.classList.remove("selected"));
          card.classList.add("selected");
        });
      });

    } else if (q.type === "structured" || q.type === "fair_test") {
      structContainer.classList.remove("hidden");
      
      // Let's create text input field
      structContainer.innerHTML = `
        <div class="flex-col">
          <textarea class="journal-input w-full text-xs h-24 mb-2" id="quiz-struct-text-input" placeholder="Type your scientific explanation here..."></textarea>
          <div class="text-[10px] text-slate-400">Include key terms: ${q.expectedKeywords.map(k => `<strong>${k}</strong>`).join(', ')}</div>
        </div>
      `;
    } else if (q.type === "variable_id") {
      structContainer.classList.remove("hidden");
      structContainer.innerHTML = `
        <div class="flex-col gap-3">
          <div class="mb-3">
            <span class="text-xs font-bold text-slate-400">Changed Variable:</span>
            <input type="text" class="journal-input text-xs mt-1" id="quiz-var-changed" placeholder="e.g. Temperature of water">
          </div>
          <div>
            <span class="text-xs font-bold text-slate-400">Measured Variable:</span>
            <input type="text" class="journal-input text-xs mt-1" id="quiz-var-measured" placeholder="e.g. Amount of water evaporated">
          </div>
        </div>
      `;
    }
  }

  submitQuizAnswer() {
    const q = MixedQuizQuestions[this.state.quizIndex];
    let isCorrect = false;
    let feedbackMsg = "";

    const feed = document.getElementById("quiz-feedback-box");
    const feedIcon = document.getElementById("quiz-feedback-icon");
    const feedText = document.getElementById("quiz-feedback-text");

    if (q.type === "mcq" || q.type === "graph_reading" || q.type === "conclusion_writing") {
      const selected = document.querySelector(".quiz-option-card.selected");
      if (!selected) {
        alert("Please select an option before checking!");
        return;
      }

      const idx = parseInt(selected.dataset.idx);
      const cards = document.querySelectorAll(".quiz-option-card");
      
      if (idx === q.correctIndex) {
        isCorrect = true;
        selected.classList.add("correct");
        feedbackMsg = "Correct! " + (q.explanation || "");
      } else {
        selected.classList.add("incorrect");
        // Highlight correct one
        cards[q.correctIndex].classList.add("correct");
        feedbackMsg = "Incorrect. " + (q.explanation || "");
      }

    } else if (q.type === "structured" || q.type === "fair_test") {
      const txtVal = document.getElementById("quiz-struct-text-input").value.toLowerCase();
      if (!txtVal.trim()) {
        alert("Please write your answer explanation!");
        return;
      }

      // Check if all expected keywords exist in the response
      const missing = q.expectedKeywords.filter(k => !txtVal.includes(k.toLowerCase()));
      if (missing.length === 0) {
        isCorrect = true;
        feedbackMsg = `Correct! Exceptional scientific explanation. Sample answer: "${q.expectedAnswers[0]}"`;
      } else {
        feedbackMsg = `Not complete. Your answer is missing keywords: ${missing.join(', ')}. Sample correct answer: "${q.expectedAnswers[0]}"`;
      }

    } else if (q.type === "variable_id") {
      const chg = document.getElementById("quiz-var-changed").value.toLowerCase();
      const meas = document.getElementById("quiz-var-measured").value.toLowerCase();
      
      if (!chg || !meas) {
        alert("Please fill in both fields!");
        return;
      }

      const correctChg = q.variables.changed.toLowerCase();
      const correctMeas = q.variables.measured.toLowerCase();

      // Check key substrings
      const matchesChanged = chg.includes(correctChg) || correctChg.includes(chg);
      const matchesMeasured = meas.includes(correctMeas) || correctMeas.includes(meas);

      if (matchesChanged && matchesMeasured) {
        isCorrect = true;
        feedbackMsg = `Correct! Changed: "${q.variables.changed}". Measured: "${q.variables.measured}".`;
      } else {
        feedbackMsg = `Incorrect. Expected values: Changed Variable = "${q.variables.changed}", Measured Variable = "${q.variables.measured}".`;
      }
    }

    this.elQuizSubmit.classList.add("hidden");
    this.elQuizNext.classList.remove("hidden");
    
    feed.classList.remove("hidden", "feedback-success", "feedback-error");
    if (isCorrect) {
      this.state.quizCorrectCount++;
      feed.classList.add("feedback-success");
      feedIcon.textContent = "✅";
    } else {
      feed.classList.add("feedback-error");
      feedIcon.textContent = "❌";
    }
    feedText.innerHTML = feedbackMsg;
  }

  nextQuizQuestion() {
    const nextIdx = this.state.quizIndex + 1;
    if (nextIdx < MixedQuizQuestions.length) {
      this.loadQuizQuestion(nextIdx);
    } else {
      this.completeMixedQuiz();
    }
  }

  completeMixedQuiz() {
    this.state.activeStage = "Rewards";
    this.showScreen("rewards-screen");
    
    const accuracy = Math.round((this.state.quizCorrectCount / MixedQuizQuestions.length) * 100);
    document.getElementById("scorecard-quiz").textContent = `${accuracy}% (${this.state.quizCorrectCount} / ${MixedQuizQuestions.length})`;
  }

  resetAppAcademy() {
    // Reset all progress
    this.state = {
      activeStage: "Stage 1",
      completedLabs: {},
      attempts: { water_cycle: 0, electrical: 0, reproduction: 0, respiratory: 0, circulatory: 0 },
      scores: {},
      hintsUsed: { water_cycle: 0, electrical: 0, reproduction: 0, respiratory: 0, circulatory: 0 },
      stage1Step: 0,
      activeLabKey: null,
      activeWizardStep: 0,
      placedVariables: { changed: null, measured: null },
      simRunning: false,
      simCompleted: false,
      userCalculatedOutputs: [],
      dataChecked: false,
      mcqCleared: false,
      structuredCleared: false,
      activeSimInstance: null,
      activeStage3Scenario: null,
      stage3CalculatedOutputs: [],
      scrambledProcedure: [],
      quizIndex: 0,
      quizCorrectCount: 0,
      quizCompleted: false
    };

    localStorage.removeItem("p5_science_lab_state");
    this.showScreen("welcome-screen");
  }
}

// Instantiate on load
window.addEventListener("DOMContentLoaded", () => {
  window.appInstance = new InvestigationApp();
});
