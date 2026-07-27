// Singapore P5 Science Mastery Academy - Application Controller
// Orchestrates screen routing, modular progression, student data, AI adaptivity, and dashboards.

const PracticeMiniLessons = {
  // Module 1: Asking Scientific Questions
  p1_1: "Heat energy always flows from a hotter place to a colder place. To study this scientifically, we must ask questions that compare different materials to see which conducts heat faster!",
  p1_2: "Friction is a force that opposes motion when two surfaces rub together. We can test this by measuring the frictional force when blocks slide on different materials!",
  p1_3: "Plants absorb water through their roots, which travels up the stem to the leaves. We want to test how the number of leaves affects water absorption.",

  // Module 2: Writing the Aim
  p2_1: "Different materials have different abilities to conduct heat. To design a valid experiment, we must write a clear scientific aim that compares these materials.",
  p2_2: "Electromagnets are temporary magnets created by running electrical current through wire coils. More turns of wire make the magnetic force stronger, which we can measure by counting attracted paperclips.",
  p2_3: "Evaporation happens when liquid water absorbs heat and turns into water vapour. Let's study how the temperature of water affects the speed of evaporation!",

  // Module 3: Writing a Hypothesis
  p3_1: "Wind carries away water vapour above the water surface, making room for more water to evaporate. Therefore, higher wind speed increases the evaporation rate.",
  p3_2: "Gravity pulls objects downward with a force proportional to their mass. When we hang loads on a spring, the gravitational force pulls the spring and extends it.",
  p3_3: "Leaves have tiny pores called stomata where water vapour escapes. Having more leaves means more stomata, which leads to a faster rate of transpiration.",

  // Module 4: Identifying Variables
  p4_1: "When investigating evaporation, the exposed surface area is changed on purpose, while we measure the volume of water left. Other factors like temperature must be kept the same.",
  p4_2: "Light travels in straight lines. When a solid object blocks light, it casts a shadow. Changing the distance between the light source and the object changes the shadow size.",
  p4_3: "Electromagnets can be strengthened by increasing the coil turns. Let's isolate our changed variable (coil turns) and measured variable (magnetic strength).",

  // Module 5: Designing the Experiment
  p5_1: "To see which cup keeps water hot longest, we compare different metals. All other factors, like initial water temperature and cup size, must be identical for a fair test.",
  p5_2: "To test if the number of bulbs affects brightness, the circuit must be closed and complete. If there is a break (like an open switch), no current flows and the bulbs won't light up.",
  p5_3: "When light shines on an object, it can be absorbed, reflected, or transmitted. Let's set up a control with no object to compare the baseline light intensity.",

  // Module 6: Writing the Procedure
  p6_1: "Seeds need oxygen, water, and warmth to germinate. To investigate if moisture is needed, we set up petri dishes with dry cotton wool (control) vs damp cotton wool (test).",
  p6_2: "A step-by-step procedure must be precise and specify exactly how to assemble the circuit, connect the components, and read the light meter.",
  p6_3: "We can test magnetic strength by counting how many paperclips a magnet can attract. The procedure must describe how to bring the magnet close to the paperclips slowly.",

  // Module 7: Collecting and Presenting Data
  p7_1: "When collecting evaporation data, we measure the water volume before and after. The difference gives the amount evaporated. Calculating the average of three trials ensures reliable results.",
  p7_2: "Adding more bulbs in series reduces the electric current flowing in the circuit, causing each bulb to grow dimmer. We record the current using an ammeter.",
  p7_3: "During exercise, our muscles need more oxygen. The heart beats faster to pump oxygen-rich blood around the body. We measure the pulse rate in beats per minute (bpm).",

  // Module 8: Drawing Conclusions
  p8_1: "Our data shows that a magnet with more turns of coil attracts more steel paperclips. This allows us to conclude that increasing wire turns increases magnetic strength.",
  p8_2: "Populations in a habitat depend on each other. If the predator population decreases, the prey population will temporarily increase due to fewer hunters.",
  p8_3: "A rougher surface creates more friction, which slows down moving objects faster. We conclude that surface roughness is directly proportional to frictional force."
};

class ScientistAcademyApp {
  constructor() {
    this.state = {
      playerName: "",
      xp: 0,
      level: 1,
      coins: 0,
      stars: 0,
      unlockedModules: [1], // Module 1 unlocked by default
      clearedModules: [],
      activeModuleIndex: 0, // 0-indexed module index (0 to 7)
      activeStepIndex: 0,   // 0: Objectives, 1: Concept, 2: Practise, 3: Quiz, 4: Rewards
      practiceIndex: 0,
      notebookPages: {},
      selectedNotebookTab: 1,
      wrongAttemptsCount: 0,
      
      // Teacher configurations
      teacherConfig: {
        topics: ["Plant Transport", "Plant Reproduction", "Water Cycle", "Heat", "Light", "Electricity", "Magnets", "Forces"],
        difficulty: "medium",
        questionsCount: 3,
        hintsEnabled: true,
        shuffleEnabled: false
      }
    };

    this.activeSim = null;
    this.initElements();
    this.bindEvents();
    this.loadStateFromStorage();
    this.updateHUD();
    
    // Check if name is already set to skip login
    if (this.state.playerName) {
      this.showScreen("map-screen");
      this.initMap();
    } else {
      this.showScreen("welcome-screen");
    }
  }

  initElements() {
    this.elHeader = document.getElementById("game-header");
    this.elWelcomeScreen = document.getElementById("welcome-screen");
    this.elMapScreen = document.getElementById("map-screen");
    this.elWorkspaceScreen = document.getElementById("workspace-screen");
    
    // Header Stats
    this.elRank = document.getElementById("player-rank");
    this.elXp = document.getElementById("player-xp");
    this.elXpFill = document.getElementById("xp-fill");
    this.elCoins = document.getElementById("player-coins");
    this.elStars = document.getElementById("player-stars");
    
    // Modals
    this.elNotebookModal = document.getElementById("notebook-modal");
    this.elTeacherModal = document.getElementById("teacher-modal");
    
    // Forms & Inputs
    this.elLoginForm = document.getElementById("login-form");
    this.elNameInput = document.getElementById("pupil-name-input");
    this.elTeacherConfigForm = document.getElementById("teacher-config-form");
    
    // Workspace Controls
    this.elWorkspacePrev = document.getElementById("workspace-prev-btn");
    this.elWorkspaceNext = document.getElementById("workspace-next-btn");
    this.elSpeechBubble = document.getElementById("sprout-speech-bubble");
    this.elWorkspaceHintBtn = document.getElementById("workspace-hint-btn");
    
    // Teacher tabs
    this.elTabBtnSettings = document.getElementById("tab-btn-settings");
    this.elTabBtnReports = document.getElementById("tab-btn-reports");
    this.elTeacherSettingsPanel = document.getElementById("teacher-settings-panel");
    this.elTeacherReportsPanel = document.getElementById("teacher-reports-panel");
    this.elTeacherReportsTable = document.getElementById("teacher-reports-table-body");
  }

  bindEvents() {
    // Welcome / Login form
    if (this.elLoginForm) {
      this.elLoginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const name = this.elNameInput.value.trim();
        if (name) {
          this.state.playerName = name;
          this.saveStateToStorage();
          this.showScreen("map-screen");
          this.initMap();
          this.updateHUD();
          this.celebrateNewScientist();
        }
      });
    }

    // Toggle Modals
    document.getElementById("notebook-toggle-btn").addEventListener("click", () => this.openNotebook());
    document.getElementById("notebook-close-btn").addEventListener("click", () => this.closeNotebook());
    document.getElementById("teacher-toggle-btn").addEventListener("click", () => this.openTeacherPanel());
    document.getElementById("teacher-close-btn").addEventListener("click", () => this.closeTeacherPanel());
    
    // Logo button returns to map screen
    document.getElementById("hud-logo-btn").addEventListener("click", () => {
      this.stopActiveSim();
      this.showScreen("map-screen");
      this.initMap();
    });

    // Workspace Navigation buttons
    this.elWorkspacePrev.addEventListener("click", () => this.prevStep());
    this.elWorkspaceNext.addEventListener("click", () => this.nextStep());

    // Teacher tab switching
    this.elTabBtnSettings.addEventListener("click", () => this.switchTeacherTab("settings"));
    this.elTabBtnReports.addEventListener("click", () => this.switchTeacherTab("reports"));

    // Save Teacher Configurations
    this.elTeacherConfigForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const selectedTopics = Array.from(this.elTeacherConfigForm.querySelectorAll("input[name='topics']:checked")).map(cb => cb.value);
      const difficulty = document.getElementById("teacher-difficulty").value;
      const questionCount = parseInt(document.getElementById("teacher-question-count").value, 10);
      const hintsEnabled = document.getElementById("teacher-enable-hints").checked;
      const shuffleEnabled = document.getElementById("teacher-shuffle").checked;

      this.state.teacherConfig = {
        topics: selectedTopics,
        difficulty: difficulty,
        questionsCount: questionCount,
        hintsEnabled: hintsEnabled,
        shuffleEnabled: shuffleEnabled
      };
      
      this.saveStateToStorage();
      alert("⚙️ Academy settings applied successfully!");
      this.closeTeacherPanel();
      if (this.state.activeModuleIndex !== null && this.elWorkspaceScreen.style.display !== "none") {
        // Reload practice index to conform to new counts/filters
        this.state.practiceIndex = 0;
        this.loadStep(this.state.activeStepIndex);
      }
    });

    // Workspace hint clicks
    this.elWorkspaceHintBtn.addEventListener("click", () => this.showSproutHint());

    // Graduation / Academy Completion Screen Button Listeners
    const btnNotebook = document.getElementById("completion-review-notebook");
    if (btnNotebook) btnNotebook.addEventListener("click", () => {
      this.playClickSound();
      this.openNotebook();
    });

    const btnDownloadCert = document.getElementById("completion-download-cert");
    if (btnDownloadCert) btnDownloadCert.addEventListener("click", () => {
      this.playClickSound();
      window.print();
    });

    const btnReplayModules = document.getElementById("completion-replay-modules");
    if (btnReplayModules) btnReplayModules.addEventListener("click", () => {
      this.playClickSound();
      this.showScreen("map-screen");
      this.initMap();
    });

    const btnReturnMap = document.getElementById("completion-return-map");
    if (btnReturnMap) btnReturnMap.addEventListener("click", () => {
      this.playClickSound();
      this.showScreen("map-screen");
      this.initMap();
    });

    const btnRestartAcademy = document.getElementById("completion-restart-academy");
    if (btnRestartAcademy) btnRestartAcademy.addEventListener("click", () => {
      this.playClickSound();
      this.confirmRestartWholeAcademy();
    });
  }

  // ==========================================
  // STATE MANAGEMENT
  // ==========================================

  saveStateToStorage() {
    localStorage.setItem("p5_science_academy_state", JSON.stringify(this.state));
  }

  loadStateFromStorage() {
    const saved = localStorage.getItem("p5_science_academy_state");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        this.state = { ...this.state, ...parsed };
      } catch (e) {
        console.error("Failed to parse state from storage", e);
      }
    }
  }

  showScreen(screenId) {
    this.elWelcomeScreen.classList.add("hidden");
    this.elMapScreen.classList.add("hidden");
    this.elWorkspaceScreen.classList.add("hidden");
    const completionEl = document.getElementById("academy-completion-screen");
    if (completionEl) completionEl.classList.add("hidden");
    
    const target = document.getElementById(screenId);
    if (target) target.classList.remove("hidden");
    
    if (screenId === "welcome-screen") {
      this.elHeader.classList.add("hidden");
    } else {
      this.elHeader.classList.remove("hidden");
    }
  }

  getRank(xp) {
    if (xp < 200) return { title: "Explorer", icon: "🎖️", nextXp: 200 };
    if (xp < 400) return { title: "Investigator", icon: "🔍", nextXp: 400 };
    if (xp < 600) return { title: "Junior Scientist", icon: "🔬", nextXp: 600 };
    if (xp < 800) return { title: "Senior Scientist", icon: "🧬", nextXp: 800 };
    return { title: "Master Scientist", icon: "👑", nextXp: 1000 };
  }

  updateHUD() {
    const rank = this.getRank(this.state.xp);
    this.elRank.textContent = rank.title;
    document.getElementById("player-rank-icon").textContent = rank.icon;
    this.elXp.textContent = `${this.state.xp} XP`;
    
    // Level calculations
    const prevCap = rank.nextXp === 200 ? 0 : rank.nextXp - 200;
    const progressPercent = Math.min(100, Math.max(0, ((this.state.xp - prevCap) / 200) * 100));
    this.elXpFill.style.width = `${progressPercent}%`;

    this.elCoins.textContent = this.state.coins;
    this.elStars.textContent = `${this.state.clearedModules.length} / 8`;
    
    const mapRankTitle = document.getElementById("map-rank-title");
    if (mapRankTitle) {
      mapRankTitle.textContent = rank.title;
      const nextXpText = rank.nextXp === 1000 ? "Maximum Rank Achieved" : `Need ${rank.nextXp - this.state.xp} XP to rank up`;
      document.getElementById("next-rank-xp-readout").textContent = nextXpText;
    }
  }

  addReward(xp, coins) {
    this.state.xp += xp;
    this.state.coins += coins;
    this.saveStateToStorage();
    this.updateHUD();
    
    // Show a floating notification
    const notification = document.createElement("div");
    notification.className = "hud-stat-item floating-xp-text";
    notification.innerHTML = `<span style="color:#f59e0b;">⭐ +${xp} XP</span> <span style="color:#d97706; margin-left:8px;">🪙 +${coins} Coins</span>`;
    notification.style.position = "fixed";
    notification.style.top = "80px";
    notification.style.right = "20px";
    notification.style.zIndex = "1000";
    notification.style.animation = "floatNotification 2.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards";
    
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 2500);
  }

  // ==========================================
  // PROGRESS MAP VIEW (MISSION VIEWER)
  // ==========================================

  initMap() {
    // Show graduation banner if all 8 modules are completed
    const gradBannerContainer = document.getElementById("map-grad-banner-container");
    if (gradBannerContainer) {
      if (this.state.clearedModules.length === 8) {
        gradBannerContainer.innerHTML = `
          <div class="completion-grad-banner bg-gradient-to-r from-amber-400 to-yellow-500 text-white p-4 rounded-2xl flex justify-between items-center mb-6 max-w-4xl mx-auto shadow-md">
            <div>
              <h3 class="font-bold text-lg" style="margin: 0; line-height: 1.2;">🎓 Academy Graduate!</h3>
              <p class="text-xs opacity-90" style="margin: 4px 0 0 0;">You have successfully completed all 8 modules and unlocked your graduation certificate.</p>
            </div>
            <button class="btn btn-primary text-xs" id="map-view-grad-btn" style="background: white; color: #d97706; margin: 0; box-shadow: none; font-weight: bold; border-radius: 8px; padding: 6px 12px;">View Graduation 🎓</button>
          </div>
        `;
        gradBannerContainer.querySelector("#map-view-grad-btn").addEventListener("click", () => {
          this.playClickSound();
          this.showAcademyCompletionScreen();
        });
      } else {
        gradBannerContainer.innerHTML = "";
      }
    }

    const nodesContainer = document.getElementById("map-nodes-grid");
    if (!nodesContainer) return;

    nodesContainer.innerHTML = "";
    
    // Generate 8 nodes
    for (let i = 1; i <= 8; i++) {
      const module = AcademyModules.find(m => m.id === i);
      if (!module) continue;

      const isUnlocked = this.state.unlockedModules.includes(i);
      const isCleared = this.state.clearedModules.includes(i);
      const isActive = isUnlocked && !isCleared && (i === 1 || this.state.clearedModules.includes(i - 1));
      
      const nodeEl = document.createElement("div");
      nodeEl.className = `map-node ${isUnlocked ? 'unlocked' : 'locked'} ${isActive ? 'active-node' : ''}`;
      nodeEl.dataset.id = i;
      
      let innerHTML = "";
      if (isUnlocked) {
        innerHTML = `
          <div class="node-number">${i}</div>
          <div class="node-title">${module.title}</div>
          <div class="node-badge ${isCleared ? 'cleared' : ''}">
            ${isCleared ? `✅ ${module.badge}` : `🔓 Lock: ${module.badge}`}
          </div>
        `;
      } else {
        innerHTML = `
          <div class="node-number">🔒</div>
          <div class="node-title" style="color:var(--text-muted);">Module ${i}</div>
          <div class="node-lock-icon">🔒</div>
          <div class="node-badge">Locked</div>
        `;
      }
      
      nodeEl.innerHTML = innerHTML;
      
      nodeEl.addEventListener("click", () => {
        if (isUnlocked) {
          this.startModule(i);
        } else {
          alert(`🔒 Module ${i} is locked!\n\nYou must complete Module ${i - 1} ("${AcademyModules[i-2].title}") to unlock this skill.`);
        }
      });

      nodesContainer.appendChild(nodeEl);
    }
  }

  // ==========================================
  // MODULE LESSON WORKSPACE
  // ==========================================

  startModule(moduleId) {
    this.state.activeModuleIndex = moduleId - 1;
    this.state.activeStepIndex = 0;
    this.state.practiceIndex = 0;
    this.state.wrongAttemptsCount = 0;
    this.state.practiceAnswers = {};
    this.state.quizAnswers = {};
    this.stopActiveSim();

    this.showScreen("workspace-screen");
    this.loadStep(0);
  }

  stopActiveSim() {
    if (this.activeSim) {
      if (typeof this.activeSim.stop === "function") {
        this.activeSim.stop();
      }
      this.activeSim = null;
    }
  }

  loadStep(stepIndex) {
    this.state.activeStepIndex = stepIndex;
    this.stopActiveSim();
    this.elWorkspaceHintBtn.classList.add("hidden");
    
    // Update step highlights in the Wizard HUD
    for (let i = 0; i < 5; i++) {
      const node = document.getElementById(`step-node-${i}`);
      node.classList.remove("active", "completed");
      if (i === stepIndex) {
        node.classList.add("active");
      } else if (i < stepIndex) {
        node.classList.add("completed");
      }
    }

    // Configure Prev/Next buttons
    this.elWorkspacePrev.disabled = stepIndex === 0;
    
    const footer = document.querySelector(".nav-footer");
    if (stepIndex === 4) {
      if (footer) footer.classList.add("hidden");
    } else {
      if (footer) footer.classList.remove("hidden");
      if (stepIndex === 3) {
        this.elWorkspaceNext.textContent = "Submit Quiz 📝";
      } else {
        this.elWorkspaceNext.textContent = "Next Step ➡️";
      }
    }

    const module = AcademyModules[this.state.activeModuleIndex];
    const cardBody = document.getElementById("workspace-card-body");
    
    switch (stepIndex) {
      case 0:
        this.renderObjectives(module, cardBody);
        break;
      case 1:
        this.renderConcept(module, cardBody);
        break;
      case 2:
        this.renderPractice(module, cardBody);
        break;
      case 3:
        this.renderQuiz(module, cardBody);
        break;
      case 4:
        this.renderRewards(module, cardBody);
        break;
    }
  }

  nextStep() {
    if (this.state.activeStepIndex === 2) {
      // Practise Validation check
      if (!this.validatePracticeStep()) {
        return;
      }
      // If there are more practice questions, load them first
      const module = AcademyModules[this.state.activeModuleIndex];
      const maxPractice = Math.min(this.state.teacherConfig.questionsCount, module.practice.length);
      if (this.state.practiceIndex < maxPractice - 1) {
        this.state.practiceIndex++;
        this.state.wrongAttemptsCount = 0;
        this.loadStep(2);
        return;
      }
    }

    if (this.state.activeStepIndex === 3) {
      // Quiz Validation check
      if (!this.validateQuizStep()) {
        return;
      }
    }

    if (this.state.activeStepIndex < 4) {
      this.loadStep(this.state.activeStepIndex + 1);
    } else {
      // Finish Module!
      const activeId = this.state.activeModuleIndex + 1;
      
      // Save clear state
      if (!this.state.clearedModules.includes(activeId)) {
        this.state.clearedModules.push(activeId);
      }
      
      // Unlock next module
      if (activeId < 8 && !this.state.unlockedModules.includes(activeId + 1)) {
        this.state.unlockedModules.push(activeId + 1);
      }

      this.saveStateToStorage();

      if (this.state.clearedModules.length === 8) {
        this.showAcademyCompletionScreen();
      } else {
        this.showScreen("map-screen");
        this.initMap();
        this.updateHUD();
      }
    }
  }

  prevStep() {
    if (this.state.activeStepIndex === 2 && this.state.practiceIndex > 0) {
      this.state.practiceIndex--;
      this.loadStep(2);
      return;
    }
    if (this.state.activeStepIndex > 0) {
      this.loadStep(this.state.activeStepIndex - 1);
    }
  }

  // ==========================================
  // WIZARD RENDERER FUNCTIONS
  // ==========================================

  // Step 1: Objectives
  renderObjectives(module, container) {
    this.elSpeechBubble.innerHTML = `Welcome to Module ${module.id}! Today, we will master <strong>${module.title}</strong>. This skill is critical for answering high-marks investigation questions in P5 examinations!`;
    this.setSproutAvatar("happy");

    container.innerHTML = `
      <div class="flex flex-col gap-4">
        <h2 class="font-bold text-lg text-indigo-700">${module.title} - Objectives</h2>
        <p class="text-slate-600 text-sm">By the end of this module, you will confidently be able to:</p>
        <ul class="flex flex-col gap-3 mt-2">
          ${module.objectives.map(obj => `
            <li class="flex items-start gap-2 text-sm text-slate-700 font-semibold">
              <span class="text-emerald-500">✔</span> ${obj}
            </li>
          `).join('')}
        </ul>
        <div class="mt-6 p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800">
          💡 <strong>Professor Sprout's Tip:</strong> Inquiry skills are like tools! Once you master this skill, you can use it in Electricity, Plants, Heat, or any topic!
        </div>
      </div>
    `;
  }

  // Step 2: Concept Teaching
  renderConcept(module, container) {
    this.elSpeechBubble.innerHTML = `Let's study the core concept. Scroll down to review the worked examples of how scientists apply this skill in different Primary 5 Science topics!`;
    this.setSproutAvatar("explaining");

    // Filter worked examples based on teacher-selected topics
    const allowedTopics = this.state.teacherConfig.topics;
    const examples = module.teaching.workedExamples.filter(ex => allowedTopics.includes(ex.topic) || ex.topic === "Magnets" || ex.topic === "Light"); // Fallbacks for safety

    container.innerHTML = `
      <div class="flex flex-col gap-4 flex-1">
        <h2 class="font-bold text-lg text-indigo-700">Concept Teaching</h2>
        <div class="text-slate-700 text-sm leading-relaxed mb-3">
          ${module.teaching.concept}
        </div>
        
        <!-- Worked Example Swapper -->
        <div class="border rounded-xl p-4 bg-slate-50 flex-1">
          <div class="flex justify-between items-center mb-3">
            <span class="text-xs font-bold text-slate-500 uppercase">Worked Example Topic:</span>
            <select id="example-topic-selector" class="sentence-select">
              ${examples.map((ex, idx) => `<option value="${idx}">${ex.topic}</option>`).join('')}
            </select>
          </div>
          
          <div id="example-display-box" class="flex flex-col gap-2">
            <!-- Loaded dynamically below -->
          </div>
        </div>
      </div>
    `;

    const selector = document.getElementById("example-topic-selector");
    const displayBox = document.getElementById("example-display-box");

    const updateExample = (idx) => {
      const ex = examples[idx];
      if (!ex) return;
      displayBox.innerHTML = `
        <div class="text-xs font-bold text-indigo-500 uppercase">Observation / Scenario</div>
        <p class="text-sm font-semibold text-slate-800 mb-3">${ex.scenario}</p>
        <div class="text-xs font-bold text-emerald-500 uppercase">Scientific Application</div>
        <div class="text-sm text-slate-700 leading-relaxed bg-white p-3 rounded-lg border border-slate-100">${ex.conceptModel}</div>
      `;
    };

    if (selector) {
      selector.addEventListener("change", (e) => updateExample(e.target.value));
      updateExample(0);
    }
  }

  // Step 3: Interactive Practice
  renderPractice(module, container) {
    const question = module.practice[this.state.practiceIndex];
    if (!question) {
      container.innerHTML = `<p class="text-center text-slate-500 py-8">Practice complete! Click Next to start the Mastery Quiz.</p>`;
      return;
    }

    const lessonText = PracticeMiniLessons[question.id] || "Look at the activity on the right and select the correct answer.";
    this.elSpeechBubble.innerHTML = `<strong>🎓 Mini Lesson: ${question.topic}</strong><br><br>${lessonText}<br><br>💡 <em>Read this setup, then apply your scientific skills to answer the challenge on the right!</em>`;
    this.setSproutAvatar("explaining");

    if (this.state.teacherConfig.hintsEnabled) {
      this.elWorkspaceHintBtn.classList.remove("hidden");
    }

    let promptText = question.questionText;
    if (question.type === "fill_blank" && promptText.includes("<br>")) {
      promptText = promptText.split("<br>")[0];
    }

    container.innerHTML = `
      <div class="flex flex-col gap-4 flex-1">
        <div class="flex justify-between items-center">
          <span class="text-xs font-bold text-slate-500 uppercase">Practise: ${question.topic} (${this.state.practiceIndex + 1} of ${Math.min(this.state.teacherConfig.questionsCount, module.practice.length)})</span>
          <span class="text-xs font-bold text-amber-500 bg-amber-50 px-2 py-0.5 rounded" id="mistake-readout">Attempts: 0</span>
        </div>
        <p class="text-sm font-bold text-slate-800">${promptText}</p>
        
        <!-- Practice Area (Dynamically swapped based on question type) -->
        <div id="practice-interactive-container" class="flex-1 mt-2">
          <!-- Populated below -->
        </div>

        <div id="practice-feedback" class="feedback-box hidden"></div>
      </div>
    `;

    const interactiveArea = document.getElementById("practice-interactive-container");
    
    // Switch on question type
    if (question.type === "sort") {
      this.renderSortPractice(question, interactiveArea);
    } else if (question.type === "select") {
      this.renderSelectPractice(question, interactiveArea);
    } else if (question.type === "scramble") {
      this.renderScramblePractice(question, interactiveArea);
    } else if (question.type === "fill_blank") {
      this.renderFillBlankPractice(question, interactiveArea);
    } else if (question.type === "calculate") {
      this.renderCalculatePractice(question, interactiveArea);
    } else if (question.type === "graph_plot") {
      this.renderGraphPlotPractice(question, interactiveArea);
    } else if (question.type === "sim_layout") {
      this.renderSimLayoutPractice(question, interactiveArea);
    }
    
    this.attachSimulationIfApplicable(question);
  }

  attachSimulationIfApplicable(question) {
    const viewport = document.getElementById("practice-sim-viewport");
    if (!viewport) return;

    if (question.id === "p4_1") {
      this.activeSim = new EvaporationSimulation("practice-sim-viewport");
      this.activeSim.start(2, 5, 8); // Start evaporation particles
    } else if (question.id === "p6_1") {
      this.activeSim = new SeedGerminationSimulation("practice-sim-viewport");
    } else if (question.id === "p7_3") {
      this.activeSim = new CirculatorySimulation("practice-sim-viewport");
    }
  }

  handleDiagnosticInspect(component) {
    if (component === 'reset') {
      this.state.diagnosticSolved = false;
      this.state.circuitRepaired = false;
      this.elWorkspaceNext.textContent = "Complete Simulation Steps ➡️";
      const feedbackBox = document.getElementById("practice-feedback");
      if (feedbackBox) {
        feedbackBox.className = "feedback-box hidden";
        feedbackBox.innerHTML = "";
      }
      
      const module = AcademyModules[this.state.activeModuleIndex];
      const question = module.practice[this.state.practiceIndex];
      const lessonText = PracticeMiniLessons[question.id] || "Look at the activity on the right and select the correct answer.";
      this.elSpeechBubble.innerHTML = `<strong>🎓 Mini Lesson: ${question.topic}</strong><br><br>${lessonText}<br><br>💡 <em>Read this setup, then apply your scientific skills to answer the challenge on the right!</em>`;
    } else if (component === 'battery') {
      this.elSpeechBubble.innerHTML = "<strong>🔋 Battery Terminal Inspection</strong><br><br>The battery is supplying electrical energy. The positive (+) and negative (-) terminals are connected properly. The problem is somewhere else in the circuit!";
    } else if (component === 'switch') {
      this.elSpeechBubble.innerHTML = "<strong>🔌 Switch Contact Inspection</strong><br><br>Look carefully! The metal contacts of the switch are not touching, leaving an air gap. Can electric current travel across this gap?";
    } else if (component === 'bulb') {
      this.elSpeechBubble.innerHTML = "<strong>💡 Bulb Connection Inspection</strong><br><br>Look at where the blue wire meets the bulb! It is touching the glass envelope. Glass is a non-conductor. Which part of the bulb should the wire touch instead?";
    } else {
      const module = AcademyModules[this.state.activeModuleIndex];
      const question = module.practice[this.state.practiceIndex];
      const lessonText = PracticeMiniLessons[question.id] || "Look at the activity on the right and select the correct answer.";
      this.elSpeechBubble.innerHTML = `<strong>🎓 Mini Lesson: ${question.topic}</strong><br><br>${lessonText}<br><br>💡 <em>Read this setup, then apply your scientific skills to answer the challenge on the right!</em>`;
    }
  }

  handleDiagnosticRepaired() {
    this.state.circuitRepaired = true;
    this.elSpeechBubble.innerHTML = "<strong>🎉 Circuit Repaired!</strong><br><br>Fabulous job, Investigator! The switch is closed, and the wire is touching the metal casing. Electric current can now flow through the complete circuit.";
    
    const feedbackBox = document.getElementById("practice-feedback");
    if (feedbackBox) {
      feedbackBox.className = "feedback-box feedback-success";
      feedbackBox.innerHTML = `<strong>🎉 Success!</strong> You closed the switch and connected the wire to the metal casing. Click the button inside the simulation to complete the lesson!`;
      feedbackBox.classList.remove("hidden");
    }
    this.elWorkspaceNext.textContent = "Next Step ➡️";
  }

  // Activity Type A: Sorting / Variables Drag-and-drop
  renderSortPractice(question, container) {
    if (question.id === "p4_1") {
      container.innerHTML = `
        <div class="results-entry-container">
          <div class="sim-viewport" id="practice-sim-viewport" style="aspect-ratio: 16/9; min-height: 220px;"></div>
          <div class="scaffold-drag-area" style="grid-template-cols: 1fr; gap: 0.75rem;">
            <div class="scaffold-targets-list" style="gap: 0.75rem;">
              <div class="scaffold-target-item" style="padding: 0.75rem;">
                <div>
                  <div class="text-xs font-bold text-amber-500 uppercase">Changed Variable</div>
                </div>
                <div class="target-dropzone" data-expected="changed" id="drop-changed" style="min-width: 150px; min-height: 40px;">Drop Here</div>
              </div>
              
              <div class="scaffold-target-item" style="padding: 0.75rem;">
                <div>
                  <div class="text-xs font-bold text-cyan-500 uppercase">Measured Variable</div>
                </div>
                <div class="target-dropzone" data-expected="measured" id="drop-measured" style="min-width: 150px; min-height: 40px;">Drop Here</div>
              </div>
            </div>
            
            <div class="flex flex-wrap gap-2 justify-center p-2 border rounded-xl bg-slate-50" id="sort-cards-container">
              <!-- Draggable cards -->
            </div>
          </div>
        </div>
      `;

      const cardsContainer = document.getElementById("sort-cards-container");
      const items = [...question.items];
      items.sort(() => Math.random() - 0.5);

      items.forEach((item, idx) => {
        const card = document.createElement("div");
        card.className = "draggable-pill";
        card.draggable = true;
        card.textContent = item.text;
        card.dataset.category = item.category;
        card.id = `draggable-pill-${idx}`;
        card.addEventListener("dragstart", (e) => e.dataTransfer.setData("text/plain", card.id));
        cardsContainer.appendChild(card);
      });
    } else if (question.id === "p6_1") {
      container.innerHTML = `
        <div class="results-entry-container">
          <div class="sim-viewport" id="practice-sim-viewport" style="aspect-ratio: 16/9; min-height: 220px;"></div>
          <div class="flex flex-col gap-2 overflow-y-auto max-h-[230px] p-2 border rounded-xl bg-slate-50" id="sort-procedure-container">
            <!-- Scrambled steps -->
          </div>
        </div>
      `;

      const listContainer = document.getElementById("sort-procedure-container");
      const steps = [...question.itemsOrder];
      steps.sort(() => Math.random() - 0.5);

      steps.forEach((step, idx) => {
        const item = document.createElement("div");
        item.className = "quiz-option-card flex justify-between items-center";
        item.style.padding = "0.5rem 0.85rem";
        item.style.margin = "0";
        item.style.marginBottom = "0.4rem";
        item.innerHTML = `
          <span class="text-xs font-semibold text-slate-700">${step.text}</span>
          <select class="sentence-select step-order-selector" data-idx="${idx}" data-expected="${step.stepNum}" style="padding:0.25rem; font-size:0.8rem;">
            <option value="">Order</option>
            <option value="1">Step 1</option>
            <option value="2">Step 2</option>
            <option value="3">Step 3</option>
            <option value="4">Step 4</option>
            <option value="5">Step 5</option>
          </select>
        `;
        listContainer.appendChild(item);
        
        const selector = item.querySelector(".step-order-selector");
        selector.addEventListener("change", (e) => {
          this.state.practiceAnswers[`step_${idx}`] = parseInt(e.target.value, 10);
        });
      });
      return;
    } else if (question.id === "p1_1") {
      container.innerHTML = `
        <div class="scaffold-drag-area">
          <div class="scaffold-targets-list">
            <div class="scaffold-target-item flex-col items-stretch" style="gap: 0.5rem; align-items: stretch; min-height: 110px;">
              <div>
                <div class="text-xs font-bold text-emerald-500 uppercase">Investigable (Testable) Questions</div>
                <div class="text-[10px] text-slate-400">Put testable scientific questions here</div>
              </div>
              <div class="target-dropzone flex flex-col gap-2" data-expected="investigable" id="drop-investigable" style="min-height: 60px; padding: 0.5rem; align-items: center; justify-content: center;">Drop Here</div>
            </div>
            
            <div class="scaffold-target-item flex-col items-stretch" style="gap: 0.5rem; align-items: stretch; min-height: 110px;">
              <div>
                <div class="text-xs font-bold text-rose-500 uppercase">Non-Investigable Questions</div>
                <div class="text-[10px] text-slate-400">Put non-testable opinion or historical questions here</div>
              </div>
              <div class="target-dropzone flex flex-col gap-2" data-expected="non_investigable" id="drop-non-investigable" style="min-height: 60px; padding: 0.5rem; align-items: center; justify-content: center;">Drop Here</div>
            </div>
          </div>

          <div class="flex flex-col gap-2 justify-center p-3 border rounded-xl bg-slate-50" id="sort-cards-container">
            <!-- Draggable cards -->
          </div>
        </div>
      `;

      const cardsContainer = document.getElementById("sort-cards-container");
      const items = [...question.items];
      items.sort(() => Math.random() - 0.5);

      items.forEach((item, idx) => {
        const card = document.createElement("div");
        card.className = "draggable-pill";
        card.draggable = true;
        card.textContent = item.text;
        card.dataset.category = item.category;
        card.id = `draggable-pill-${idx}`;
        card.style.whiteSpace = "normal";
        card.style.fontSize = "0.75rem";
        card.style.padding = "0.5rem";
        card.addEventListener("dragstart", (e) => e.dataTransfer.setData("text/plain", card.id));
        cardsContainer.appendChild(card);
      });
    } else {
      container.innerHTML = `
        <div class="scaffold-drag-area">
          <!-- Target slots -->
          <div class="scaffold-targets-list">
            <div class="scaffold-target-item">
              <div>
                <div class="text-xs font-bold text-amber-500 uppercase">Changed Variable</div>
                <div class="text-[10px] text-slate-400">Put the cause variable here</div>
              </div>
              <div class="target-dropzone" data-expected="changed" id="drop-changed">Drop Here</div>
            </div>
            
            <div class="scaffold-target-item">
              <div>
                <div class="text-xs font-bold text-cyan-500 uppercase">Measured Variable</div>
                <div class="text-[10px] text-slate-400">Put the outcome variable here</div>
              </div>
              <div class="target-dropzone" data-expected="measured" id="drop-measured">Drop Here</div>
            </div>
          </div>

          <!-- Draggable cards -->
          <div class="flex flex-col gap-2 justify-center p-3 border rounded-xl bg-slate-50" id="sort-cards-container">
            <!-- Filled below -->
          </div>
        </div>
      `;

      const cardsContainer = document.getElementById("sort-cards-container");
      const items = [...question.items];
      items.sort(() => Math.random() - 0.5);

      items.forEach((item, idx) => {
        const card = document.createElement("div");
        card.className = "draggable-pill";
        card.draggable = true;
        card.textContent = item.text;
        card.dataset.category = item.category;
        card.id = `draggable-pill-${idx}`;
        card.addEventListener("dragstart", (e) => e.dataTransfer.setData("text/plain", card.id));
        cardsContainer.appendChild(card);
      });
    }

    // Add drag-and-drop event listeners to dropzones
    const dropzones = container.querySelectorAll(".target-dropzone");
    dropzones.forEach(dz => {
      dz.addEventListener("dragover", (e) => e.preventDefault());
      dz.addEventListener("dragenter", () => dz.classList.add("hovered"));
      dz.addEventListener("dragleave", () => dz.classList.remove("hovered"));
      dz.addEventListener("drop", (e) => {
        e.preventDefault();
        dz.classList.remove("hovered");
        const pillId = e.dataTransfer.getData("text/plain");
        const pill = document.getElementById(pillId);
        if (!pill) return;

        if (question.id === "p1_1") {
          if (dz.textContent.trim() === "Drop Here") {
            dz.textContent = "";
          }
          dz.appendChild(pill);
          pill.classList.add("placed");
          pill.style.width = "100%";
        } else {
          dz.innerHTML = "";
          dz.appendChild(pill);
          pill.classList.add("placed");
          const role = dz.dataset.expected;
          this.state.practiceAnswers[role] = pill.dataset.category;
        }
      });
    });
  }

  // Activity Type B: MCQ Selector
  renderSelectPractice(question, container) {
    container.innerHTML = `
      <div class="flex flex-col gap-2">
        ${question.options.map((opt, idx) => `
          <div class="quiz-option-card" data-idx="${idx}">
            <span class="font-bold text-slate-400">${String.fromCharCode(65 + idx)}.</span>
            <span class="text-sm">${opt}</span>
          </div>
        `).join('')}
      </div>
    `;

    const cards = container.querySelectorAll(".quiz-option-card");
    cards.forEach(card => {
      card.addEventListener("click", () => {
        cards.forEach(c => c.classList.remove("selected"));
        card.classList.add("selected");
        this.state.practiceAnswers.selectedOptionIdx = parseInt(card.dataset.idx, 10);
      });
    });
  }

  // Activity Type C: Word Scramble Reordering
  renderScramblePractice(question, container) {
    container.innerHTML = `
      <div class="flex flex-col gap-4">
        <!-- Scrambled source tray -->
        <div class="flex flex-wrap gap-2 p-4 border rounded-xl bg-slate-50 min-h-[60px]" id="scramble-source-tray">
          <!-- Card pills -->
        </div>

        <div class="text-xs font-bold text-slate-400 uppercase">Your Arranged Sentence:</div>
        <!-- Target slots tray -->
        <div class="flex flex-wrap gap-2 p-4 border-2 border-dashed rounded-xl bg-white min-h-[60px]" id="scramble-target-tray">
          <p class="text-xs text-slate-300 pointer-events-none select-none" id="empty-target-msg">Drag or click words to arrange them here...</p>
        </div>
      </div>
    `;

    const sourceTray = document.getElementById("scramble-source-tray");
    const targetTray = document.getElementById("scramble-target-tray");
    
    const words = [...question.scrambledWords];
    // Shuffle words
    words.sort(() => Math.random() - 0.5);

    words.forEach(w => {
      const pill = document.createElement("button");
      pill.className = "btn btn-secondary text-xs py-1 px-3 shadow-sm";
      pill.textContent = w;
      pill.style.textTransform = "none";
      
      pill.addEventListener("click", () => {
        const emptyMsg = document.getElementById("empty-target-msg");
        if (emptyMsg) emptyMsg.remove();

        if (pill.parentElement === sourceTray) {
          targetTray.appendChild(pill);
        } else {
          sourceTray.appendChild(pill);
          if (targetTray.children.length === 0) {
            targetTray.appendChild(emptyMsg || document.createElement('p'));
          }
        }
      });
      sourceTray.appendChild(pill);
    });
  }

  // Activity Type D: Fill-in-the-blank dropdowns
  renderFillBlankPractice(question, container) {
    let sentence = question.questionText;
    if (sentence.includes("<br>")) {
      const parts = sentence.split(/<br\s*\/?>/i);
      sentence = parts[parts.length - 1];
    }

    let blankIndex = 0;
    const selectOptionsHtml = `
      <option value="">Choose...</option>
      ${question.options.map(opt => `<option value="${opt}">${opt}</option>`).join('')}
    `;

    sentence = sentence.replace(/_{3,}/g, () => {
      const selectHtml = `
        <select class="sentence-select blank-dropdown" data-idx="${blankIndex}" style="display:inline-block; width:auto; vertical-align: middle; margin: 0 4px;">
          ${selectOptionsHtml}
        </select>
      `;
      blankIndex++;
      return selectHtml;
    });

    container.innerHTML = `
      <div class="sentence-builder bg-white p-6 border rounded-xl shadow-sm leading-relaxed" style="font-size:1.05rem; line-height: 2.2; border-left: 6px solid var(--accent-purple);">
        ${sentence}
      </div>
    `;

    const selectors = container.querySelectorAll(".blank-dropdown");
    selectors.forEach(select => {
      select.addEventListener("change", (e) => {
        const idx = parseInt(select.dataset.idx, 10);
        this.state.practiceAnswers[`blank_${idx}`] = e.target.value;
      });
    });
  }

  // Activity Type E: Mathematical data averaging
  renderCalculatePractice(question, container) {
    container.innerHTML = `
      <div class="results-entry-container">
        <div>
          <table class="data-table-form text-xs w-full">
            <thead>
              <tr class="bg-slate-50">
                <th>Container</th>
                <th>Trial 1</th>
                <th>Trial 2</th>
                <th>Trial 3</th>
                <th>Average (ml)</th>
              </tr>
            </thead>
            <tbody>
              ${question.tableData.map((row, idx) => `
                <tr>
                  <td class="font-bold text-slate-800">${row.container}</td>
                  <td>${row.t1} ml</td>
                  <td>${row.t2} ml</td>
                  <td>${row.t3} ml</td>
                  <td>
                    <input type="number" class="table-input calc-avg-input" data-idx="${idx}" placeholder="?">
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        <div class="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-xs leading-relaxed text-indigo-900 flex flex-col justify-center">
          <strong>Calculating Averages Tip:</strong> Add up all three trials, then divide the total sum by 3! <br><br>
          Example: <code>(T1 + T2 + T3) / 3 = Average</code>
        </div>
      </div>
    `;
  }

  // Activity Type F: Drag graph bar values
  renderGraphPlotPractice(question, container) {
    if (question.id === "p7_3") {
      container.innerHTML = `
        <div class="results-entry-container">
          <div class="sim-viewport" id="practice-sim-viewport" style="aspect-ratio: 16/9; min-height: 220px;"></div>
          <div class="flex flex-col justify-center p-3 border rounded-xl bg-slate-50">
            <span class="text-xs font-bold text-slate-500 uppercase block mb-1">Graph Plotter Controls</span>
            <p class="text-[10px] text-slate-600 mb-2">Adjust the sliders to match the pulse rate measurements:</p>
            <div class="flex flex-col gap-2">
              ${question.bars.map((bar, idx) => `
                <div class="flex justify-between items-center gap-2">
                  <span class="text-xs font-semibold text-slate-700" style="white-space:nowrap;">${bar.x}:</span>
                  <input type="range" class="w-24 cursor-pointer" data-idx="${idx}" min="50" max="160" step="5" value="60" id="range-plot-${idx}">
                  <span class="text-[10px] font-bold text-indigo-500" id="bar-value-${idx}">60 bpm</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;

      // Bind ranges
      question.bars.forEach((bar, idx) => {
        const slider = document.getElementById(`range-plot-${idx}`);
        const valLabel = document.getElementById(`bar-value-${idx}`);

        const updateHeight = (val) => {
          valLabel.textContent = `${val} bpm`;
          this.state.practiceAnswers[`bar_${idx}`] = parseInt(val, 10);
        };

        slider.addEventListener("input", (e) => updateHeight(e.target.value));
        updateHeight(60); // initial
      });
      return;
    }

    container.innerHTML = `
      <div class="results-entry-container">
        <div class="custom-graph-canvas" id="interactive-bar-graph">
          <!-- Dynamically generated bars -->
          ${question.bars.map((bar, idx) => `
            <div class="graph-bar-wrapper">
              <div class="text-[10px] font-bold text-indigo-500 mb-1" id="bar-value-${idx}">50</div>
              <div class="graph-bar" id="bar-plot-${idx}" style="height: 20%;" data-idx="${idx}"></div>
              <div class="graph-label font-bold">${bar.x}</div>
            </div>
          `).join('')}
        </div>
        <div class="p-4 border rounded-xl bg-slate-50 flex flex-col justify-center">
          <span class="text-xs font-bold text-slate-500 uppercase block mb-1">Graph Plotter Controls</span>
          <p class="text-xs text-slate-600 mb-3">Adjust the height of each bar. Drag the bars to match their values:</p>
          <div class="flex flex-col gap-2">
            ${question.bars.map((bar, idx) => `
              <div class="flex justify-between items-center">
                <span class="text-xs font-semibold text-slate-700">${bar.x}:</span>
                <input type="range" class="w-28 cursor-pointer" data-idx="${idx}" min="0" max="400" step="10" value="50" id="range-plot-${idx}">
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    // Bind ranges to visual bars
    question.bars.forEach((bar, idx) => {
      const slider = document.getElementById(`range-plot-${idx}`);
      const graphBar = document.getElementById(`bar-plot-${idx}`);
      const valLabel = document.getElementById(`bar-value-${idx}`);

      const updateHeight = (val) => {
        const pct = Math.min(95, Math.max(5, (val / 400) * 100));
        graphBar.style.height = `${pct}%`;
        valLabel.textContent = `${val} mA`;
        this.state.practiceAnswers[`bar_${idx}`] = parseInt(val, 10);
      };

      slider.addEventListener("input", (e) => updateHeight(e.target.value));
      updateHeight(50); // initial
    });
  }

  // Activity Type G: Spot Broken Components or Run interactive sim
  renderSimLayoutPractice(question, container) {
    if (question.id === "p5_2") {
      container.innerHTML = `
        <div id="practice-sim-viewport" style="width: 100%; height: 420px; position: relative; border-radius: 1.5rem; overflow: hidden;">
          <!-- Loaded dynamically -->
        </div>
      `;

      this.activeSim = new ElectricityDiagnosticSimulation(
        "practice-sim-viewport",
        (comp) => this.handleDiagnosticInspect(comp),
        () => this.handleDiagnosticRepaired()
      );
      this.state.diagnosticSolved = false;
      this.state.circuitRepaired = false;
      this.elWorkspaceNext.textContent = "Complete Simulation Steps ➡️";
    } else {
      container.innerHTML = `
        <div class="results-entry-container">
          <!-- Interactive Sim Panel -->
          <div class="sim-viewport" id="practice-sim-viewport" style="aspect-ratio: 16/9; min-height: 250px;">
            <!-- Loaded dynamically -->
          </div>
          
          <div class="flex flex-col justify-between p-4 border rounded-xl bg-slate-50">
            <div>
              <span class="text-xs font-bold text-slate-500 uppercase block mb-1">Interactive Diagnostic</span>
              <p class="text-xs text-slate-600 mb-4">Click and choose the option on the left side that explains the setup issue.</p>
            </div>
            
            <div class="flex flex-col gap-2" id="sim-options-wrapper">
              ${question.options.map((opt, idx) => `
                <label class="flex items-start gap-2 text-xs text-slate-700 font-semibold cursor-pointer">
                  <input type="radio" name="sim_choice" value="${idx}" class="mt-0.5 ctrl-checkbox"> ${opt}
                </label>
              `).join('')}
            </div>
          </div>
        </div>
      `;

      this.activeSim = new CircuitBuilder("practice-sim-viewport");
      setTimeout(() => {
        if (this.activeSim) {
          this.activeSim.setErrorCase("terminal_mismatch");
        }
      }, 100);

      const radios = container.querySelectorAll("input[name='sim_choice']");
      radios.forEach(radio => {
        radio.addEventListener("change", (e) => {
          this.state.practiceAnswers.selectedSimOption = parseInt(e.target.value, 10);
        });
      });
    }
  }

  // ==========================================
  // PRACTICE VALIDATION
  // ==========================================

  validatePracticeStep() {
    const module = AcademyModules[this.state.activeModuleIndex];
    const question = module.practice[this.state.practiceIndex];
    const feedbackBox = document.getElementById("practice-feedback");
    
    let isCorrect = false;
    let sproutSpeech = "";
    
    if (question.type === "sort") {
      if (question.id === "p6_1") {
        const selectors = document.querySelectorAll(".step-order-selector");
        let allCorrect = true;
        let answeredCount = 0;
        selectors.forEach(sel => {
          const idx = sel.dataset.idx;
          const expected = parseInt(sel.dataset.expected, 10);
          const userVal = this.state.practiceAnswers[`step_${idx}`];
          if (userVal) answeredCount++;
          if (userVal !== expected) allCorrect = false;
        });
        if (allCorrect && answeredCount === selectors.length) isCorrect = true;
      } else if (question.id === "p1_1") {
        const dropInv = document.getElementById("drop-investigable");
        const dropNon = document.getElementById("drop-non-investigable");
        if (dropInv && dropNon) {
          const invPills = dropInv.querySelectorAll(".draggable-pill");
          const nonPills = dropNon.querySelectorAll(".draggable-pill");
          let allInvCorrect = invPills.length === 2 && Array.from(invPills).every(p => p.dataset.category === "investigable");
          let allNonCorrect = nonPills.length === 2 && Array.from(nonPills).every(p => p.dataset.category === "non_investigable");
          if (allInvCorrect && allNonCorrect) {
            isCorrect = true;
          }
        }
      } else {
        const changed = this.state.practiceAnswers.changed;
        const measured = this.state.practiceAnswers.measured;
        if (changed === "changed" && measured === "measured") {
          isCorrect = true;
        }
      }
    } else if (question.type === "select") {
      const selected = this.state.practiceAnswers.selectedOptionIdx;
      if (selected === question.correctIndex) {
        isCorrect = true;
      }
    } else if (question.type === "scramble") {
      const targetTray = document.getElementById("scramble-target-tray");
      const buttons = targetTray.querySelectorAll("button");
      const words = Array.from(buttons).map(b => b.textContent);
      
      const correctStr = question.correctOrder.join(" ");
      const userStr = words.join(" ");
      if (correctStr === userStr) {
        isCorrect = true;
      }
    } else if (question.type === "fill_blank") {
      // Check blanks matching index values
      let checkAll = true;
      question.blanks.forEach((b, idx) => {
        const val = this.state.practiceAnswers[`blank_${idx}`];
        if (val !== b) checkAll = false;
      });
      if (checkAll) isCorrect = true;
    } else if (question.type === "calculate") {
      const inputs = document.querySelectorAll(".calc-avg-input");
      let allPassed = true;
      inputs.forEach(input => {
        const idx = parseInt(input.dataset.idx, 10);
        const val = parseFloat(input.value);
        const expected = question.tableData[idx].expectedAvg;
        if (isNaN(val) || val !== expected) allPassed = false;
      });
      if (allPassed) isCorrect = true;
    } else if (question.type === "graph_plot") {
      let graphMatch = true;
      question.bars.forEach((bar, idx) => {
        const userVal = this.state.practiceAnswers[`bar_${idx}`];
        const tolerance = question.id === "p7_3" ? 5 : 20;
        if (userVal === undefined || isNaN(userVal) || Math.abs(userVal - bar.targetY) > tolerance) {
          graphMatch = false;
        }
      });
      if (graphMatch) isCorrect = true;
    } else if (question.type === "sim_layout") {
      if (question.id === "p5_2") {
        if (this.activeSim && this.activeSim.currentScreen < 6) {
          feedbackBox.className = "feedback-box feedback-error";
          feedbackBox.innerHTML = `<strong>❌ Mission Incomplete:</strong> Please complete all observation, diagnosis, and repair steps in the simulation on the left first!`;
          feedbackBox.classList.remove("hidden");
          return false;
        } else {
          isCorrect = true;
        }
      } else {
        const selected = this.state.practiceAnswers.selectedSimOption;
        if (selected === question.correctIndex) {
          isCorrect = true;
        }
      }
    }

    // Process correctness
    if (isCorrect) {
      this.setSproutAvatar("happy");
      feedbackBox.className = "feedback-box feedback-success";
      
      const explanation = question.explanation || "Excellent scientific deduction! Your answer matches P5 MOE criteria perfectly.";
      feedbackBox.innerHTML = `<strong>🎉 Correct!</strong><br>${explanation}`;
      feedbackBox.classList.remove("hidden");
      
      sproutSpeech = `Fabulous! You got the answer right because you understood the scientific concept. Let's proceed to the next step!`;
      this.elSpeechBubble.innerHTML = sproutSpeech;
      
      // Reward XP/Coins
      this.addReward(15, 5);
      return true;
    } else {
      this.state.wrongAttemptsCount++;
      const attemptsReadout = document.getElementById("mistake-readout");
      if (attemptsReadout) {
        attemptsReadout.textContent = `Attempts: ${this.state.wrongAttemptsCount}`;
      }
      
      this.setSproutAvatar("sad");
      feedbackBox.className = "feedback-box feedback-error";
      feedbackBox.innerHTML = `<strong>❌ Not quite.</strong> Let's look at the scientific details. Try checking the hint below!`;
      feedbackBox.classList.remove("hidden");
      
      sproutSpeech = `Ah, that's not the correct answer. Let's think: what is our changed variable in this setup? Try to look closely at the question or click the hint button below!`;
      this.elSpeechBubble.innerHTML = sproutSpeech;
      
      // Adaptivity support: auto show hint if struggling
      if (this.state.wrongAttemptsCount >= 2) {
        this.showSproutHint();
      }
      return false;
    }
  }

  showSproutHint() {
    const module = AcademyModules[this.state.activeModuleIndex];
    const question = module.practice[this.state.practiceIndex];
    if (question && question.hint) {
      this.setSproutAvatar("thinking");
      this.elSpeechBubble.innerHTML = `<strong>Hint from Sprout:</strong><br>${question.hint}`;
    }
  }

  // ==========================================
  // Step 4: End-of-Module Quiz
  // ==========================================

  renderQuiz(module, container) {
    this.elSpeechBubble.innerHTML = `Time for the <strong>Mastery Quiz</strong>! Answer these 3 questions honestly. You must score 100% to pass the module and earn your skill badge!`;
    this.setSproutAvatar("explaining");

    container.innerHTML = `
      <div class="flex flex-col gap-4 flex-1">
        <h2 class="font-bold text-lg text-indigo-700">Mastery Quiz: ${module.title}</h2>
        <p class="text-xs text-slate-500 mb-3">Answer all questions below. Professor Sprout will check them at the end.</p>
        
        <div class="flex flex-col gap-4 overflow-y-auto max-h-[350px] pr-2">
          ${module.quiz.map((q, qidx) => `
            <div class="quiz-question-box border rounded-xl p-4 bg-slate-50">
              <span class="text-xs font-bold text-indigo-500 block mb-2">Question ${qidx + 1}</span>
              <p class="text-sm font-bold text-slate-800 mb-3">${q.question}</p>
              <div class="flex flex-col gap-2">
                ${q.options.map((opt, oidx) => `
                  <label class="flex items-center gap-2 text-xs text-slate-700 font-semibold cursor-pointer">
                    <input type="radio" name="quiz_q_${qidx}" value="${oidx}" class="ctrl-checkbox"> ${opt}
                  </label>
                `).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  validateQuizStep() {
    const module = AcademyModules[this.state.activeModuleIndex];
    let correctCount = 0;
    
    // Check all quiz questions
    for (let i = 0; i < module.quiz.length; i++) {
      const radios = document.getElementsByName(`quiz_q_${i}`);
      let selectedVal = null;
      radios.forEach(r => {
        if (r.checked) selectedVal = parseInt(r.value, 10);
      });

      if (selectedVal === null) {
        alert("⚠️ Please answer all quiz questions before submitting!");
        return false;
      }

      if (selectedVal === module.quiz[i].correctIndex) {
        correctCount++;
      }
    }

    const pass = correctCount === module.quiz.length; // 100% required for mastery
    if (pass) {
      alert(`🎉 Excellent Work!\n\nYou got ${correctCount}/${module.quiz.length} correct in the Quiz and mastered the skill!`);
      return true;
    } else {
      alert(`❌ Not quite there yet.\n\nYou scored ${correctCount}/${module.quiz.length}. Review Sprout's advice and try again!`);
      return false;
    }
  }

  renderRewards(module, container) {
    this.elSpeechBubble.innerHTML = `Woohoo! You completed the module and earned your badge! Choose an option below to continue.`;
    this.setSproutAvatar("celebrating");
    
    const isFirstClear = !this.state.clearedModules.includes(module.id);
    
    if (isFirstClear) {
      // Save clear state
      this.state.clearedModules.push(module.id);
      
      // Unlock next module
      if (module.id < 8 && !this.state.unlockedModules.includes(module.id + 1)) {
        this.state.unlockedModules.push(module.id + 1);
      }

      // Add page to digital notebook
      this.addNotebookPage(module);

      // Award rewards
      this.addReward(module.xpReward, module.coinReward);
      this.saveStateToStorage();
    }

    container.innerHTML = `
      <div class="badge-celebration flex flex-col items-center">
        <div class="badge-graphic-container">
          <div class="badge-glow"></div>
          <div class="badge-art">
            <span class="badge-star">${module.badgeIcon}</span>
            <span class="badge-title">${module.badge}</span>
          </div>
        </div>
        
        <h2 class="font-bold text-xl text-slate-800 mb-2">Module Cleared!</h2>
        <p class="text-sm text-slate-500 mb-4 text-center">You are now officially certified in <strong>${module.title}</strong>!</p>
        
        <div class="flex gap-4 mb-6">
          <div class="hud-stat-item" style="border-color: #f59e0b;">
            <span>⭐</span> <strong>+${module.xpReward} XP</strong>
          </div>
          <div class="hud-stat-item" style="border-color: #d97706;">
            <span>🪙</span> <strong>+${module.coinReward} Coins</strong>
          </div>
        </div>

        <div class="flex flex-col gap-2 w-full max-w-xs">
          <button class="btn btn-primary w-full text-xs py-2" id="rewards-continue-btn" style="background:#16a34a; box-shadow:0 4px 10px rgba(22,163,74,0.2); margin:0;">
            ${module.id === 8 ? "🎓 Go to Graduation Ceremony" : "Continue to Next Module ➡️"}
          </button>
          <button class="btn btn-secondary w-full text-xs py-2" id="rewards-restart-btn" style="margin:0;">
            🔄 Restart This Module
          </button>
          <button class="btn btn-secondary w-full text-xs py-2" id="rewards-map-btn" style="margin:0;">
            🗺️ Return to Academy Map
          </button>
        </div>
      </div>
    `;

    // Bind rewards screen buttons
    const continueBtn = container.querySelector("#rewards-continue-btn");
    const restartBtn = container.querySelector("#rewards-restart-btn");
    const mapBtn = container.querySelector("#rewards-map-btn");

    if (continueBtn) {
      continueBtn.addEventListener("click", () => {
        this.playClickSound();
        const activeId = module.id;

        if (this.state.clearedModules.length === 8) {
          this.showAcademyCompletionScreen();
        } else if (activeId < 8) {
          // Immediately start next module
          this.startModule(activeId + 1);
        } else {
          this.showScreen("map-screen");
          this.initMap();
          this.updateHUD();
        }
      });
    }

    if (restartBtn) {
      restartBtn.addEventListener("click", () => {
        this.playClickSound();
        this.confirmRestartModule();
      });
    }

    if (mapBtn) {
      mapBtn.addEventListener("click", () => {
        this.playClickSound();
        if (this.state.clearedModules.length === 8) {
          this.showAcademyCompletionScreen();
        } else {
          this.showScreen("map-screen");
          this.initMap();
          this.updateHUD();
        }
      });
    }

    this.triggerConfetti();
  }

  setSproutAvatar(expression) {
    const avatarEl = document.getElementById("sprout-avatar-icon");
    if (!avatarEl) return;
    
    switch (expression) {
      case "happy":
        avatarEl.textContent = "🐻";
        break;
      case "sad":
        avatarEl.textContent = "😢";
        break;
      case "thinking":
        avatarEl.textContent = "🧐";
        break;
      case "explaining":
        avatarEl.textContent = "👨‍🔬";
        break;
      case "celebrating":
        avatarEl.textContent = "🤩";
        break;
      default:
        avatarEl.textContent = "🐻";
    }
  }

  showAcademyCompletionScreen() {
    this.showScreen("academy-completion-screen");
    this.playSuccessSound();
    this.triggerConfetti();

    // Populate name
    document.getElementById("cert-pupil-name").textContent = this.state.playerName || "Master Scientist";
    
    // Populate date
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById("cert-date").textContent = new Date().toLocaleDateString('en-US', options);
    
    // Populate stats
    document.getElementById("completion-xp-count").textContent = this.state.xp;
    document.getElementById("completion-badges-count").textContent = this.state.clearedModules.length;
    
    // Populate badges case
    const badgesGrid = document.getElementById("completion-badges-grid");
    if (badgesGrid) {
      badgesGrid.innerHTML = AcademyModules.map(m => `
        <div class="flex items-center gap-1 bg-slate-100 py-1 px-2.5 rounded-full border border-slate-200" style="box-shadow: 0 1px 3px rgba(0,0,0,0.05);" title="${m.title}">
          <span class="text-sm">${m.badgeIcon}</span>
          <span class="text-[9px] font-bold text-slate-700">${m.badge}</span>
        </div>
      `).join('');
    }
  }

  restartCurrentModule() {
    const moduleId = this.state.activeModuleIndex + 1;
    
    // Clear answers and reset indexes
    this.state.practiceAnswers = {};
    this.state.quizAnswers = {};
    this.state.practiceIndex = 0;
    this.state.wrongAttemptsCount = 0;
    
    // Remove notebook page for this module
    delete this.state.notebookPages[moduleId];
    
    // Revert cleared status if it was completed
    const clearIndex = this.state.clearedModules.indexOf(moduleId);
    if (clearIndex !== -1) {
      this.state.clearedModules.splice(clearIndex, 1);
    }
    
    // Stop active simulations
    this.stopActiveSim();
    
    // Save progress
    this.saveStateToStorage();
    
    // Return to Step 0 (Objectives)
    this.loadStep(0);
    this.updateHUD();
  }

  confirmRestartModule() {
    // Pause any active simulation animations
    if (this.activeSim && typeof this.activeSim.stop === "function") {
      this.activeSim.stop();
    }

    const modal = document.createElement("div");
    modal.className = "modal-overlay flex items-center justify-center";
    modal.style.zIndex = "1000";
    modal.innerHTML = `
      <div class="modal-box max-w-sm w-full p-6 bg-white rounded-2xl shadow-2xl text-center border-2 border-indigo-500">
        <div class="text-3xl mb-2">🔄</div>
        <h3 class="text-lg font-bold text-indigo-900 mb-4">Restart this module?</h3>
        <p class="text-xs text-slate-600 mb-6" style="line-height:1.4; text-align: center;">
          Your answers and progress in this module will be cleared. Your other completed modules and academy progress will remain safe.
        </p>
        <div class="flex gap-4 justify-end">
          <button class="btn btn-secondary py-1.5 px-4 text-xs" id="restart-module-cancel" style="margin:0;">Cancel</button>
          <button class="btn btn-primary py-1.5 px-4 text-xs" id="restart-module-confirm" style="background:var(--accent-purple); margin:0;">Restart Module</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    modal.querySelector("#restart-module-cancel").addEventListener("click", () => {
      this.playClickSound();
      document.body.removeChild(modal);
      // Reload current step to resume simulations safely
      this.loadStep(this.state.activeStepIndex);
    });

    modal.querySelector("#restart-module-confirm").addEventListener("click", () => {
      this.playClickSound();
      document.body.removeChild(modal);
      this.restartCurrentModule();
    });
  }

  restartWholeAcademy() {
    // 1. Reset state to default values
    this.state.xp = 0;
    this.state.level = 1;
    this.state.coins = 0;
    this.state.stars = 0;
    this.state.unlockedModules = [1];
    this.state.clearedModules = [];
    this.state.activeModuleIndex = 0;
    this.state.activeStepIndex = 0;
    this.state.practiceIndex = 0;
    this.state.notebookPages = {};
    this.state.wrongAttemptsCount = 0;
    this.state.practiceAnswers = {};
    this.state.quizAnswers = {};

    // 2. Stop active simulations
    this.stopActiveSim();

    // 3. Save state
    this.saveStateToStorage();

    // 4. Update HUD values
    this.updateHUD();

    // 5. Navigate back to Progress Map (original state)
    this.showScreen("map-screen");
    this.initMap();
  }

  confirmRestartWholeAcademy() {
    // Pause any active simulation animations
    if (this.activeSim && typeof this.activeSim.stop === "function") {
      this.activeSim.stop();
    }

    const modal = document.createElement("div");
    modal.className = "modal-overlay flex items-center justify-center";
    modal.style.zIndex = "1000";
    modal.innerHTML = `
      <div class="modal-box max-w-sm w-full p-6 bg-white rounded-2xl shadow-2xl text-center border-2 border-red-500">
        <div class="text-3xl mb-2">⚠️</div>
        <h3 class="text-lg font-bold text-red-600 mb-4">Restart the entire academy?</h3>
        <p class="text-xs text-slate-600 mb-6" style="line-height: 1.4; text-align: center;">
          This will erase all module progress, quiz answers, notebook entries, XP, badges and completion records. This action cannot be undone.
        </p>
        <div class="text-left mb-4">
          <label class="text-[10px] font-bold text-slate-500 uppercase block mb-1">Type <strong>RESTART</strong> to confirm:</label>
          <input type="text" id="reset-word-input" class="journal-input w-full py-1.5 px-3 text-xs" placeholder="Type RESTART here" style="border: 2px solid #fecaca; border-radius: 6px; outline: none;">
        </div>
        <div class="flex gap-4 justify-end">
          <button class="btn btn-secondary py-1.5 px-4 text-xs" id="reset-modal-cancel" style="margin:0;">Cancel</button>
          <button class="btn btn-primary py-1.5 px-4 text-xs" id="reset-modal-confirm" style="background:#dc2626; opacity: 0.5; margin:0;" disabled>Restart Academy</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    const inputField = modal.querySelector("#reset-word-input");
    const confirmBtn = modal.querySelector("#reset-modal-confirm");
    const cancelBtn = modal.querySelector("#reset-modal-cancel");

    inputField.addEventListener("input", (e) => {
      if (e.target.value.trim() === "RESTART") {
        confirmBtn.disabled = false;
        confirmBtn.style.opacity = "1";
      } else {
        confirmBtn.disabled = true;
        confirmBtn.style.opacity = "0.5";
      }
    });

    cancelBtn.addEventListener("click", () => {
      this.playClickSound();
      document.body.removeChild(modal);
      // Reload current step to resume simulations safely
      this.loadStep(this.state.activeStepIndex);
    });

    confirmBtn.addEventListener("click", () => {
      this.playSuccessSound();
      document.body.removeChild(modal);
      this.restartWholeAcademy();
    });
  }

  playClickSound() {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.frequency.setValueAtTime(800, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.05);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.05);
    } catch (e) {}
  }

  playSuccessSound() {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const playNote = (freq, start, duration) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime + start);
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime + start);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + start + duration);
        osc.start(audioCtx.currentTime + start);
        osc.stop(audioCtx.currentTime + start + duration);
      };
      playNote(523.25, 0, 0.08); // C5
      playNote(659.25, 0.08, 0.08); // E5
      playNote(783.99, 0.16, 0.12); // G5
      playNote(1046.50, 0.28, 0.35); // C6
    } catch (e) {}
  }

  // ==========================================
  // DIGITAL SCIENCE NOTEBOOK STAMP AND PAGES
  // ==========================================

  addNotebookPage(module) {
    // Generate template notebook text based on module ID
    let notebookHtml = "";
    
    switch (module.id) {
      case 1:
        notebookHtml = `
          <div class="notebook-step">
            <div class="notebook-label">Skill 1: Asking Scientific Questions</div>
            <div class="notebook-value">
              <strong>Investigable Question Template:</strong> How does the [Changed Variable] affect the [Measured Variable]?
            </div>
            <div class="notebook-value mt-2">
              <strong>P5 Magnets Question:</strong> How does the size of a magnet affect the number of steel paperclips it attracts?
            </div>
            <div class="notebook-value mt-2">
              <strong>P5 Plant Transport Question:</strong> How does the number of leaves affect the rate of water absorption?
            </div>
          </div>
        `;
        break;
      case 2:
        notebookHtml = `
          <div class="notebook-step">
            <div class="notebook-label">Skill 2: Writing the Aim</div>
            <div class="notebook-value">
              <strong>Aim Sentence Structure:</strong> To find out if [Changed Variable] affects [Measured Variable].
            </div>
            <div class="notebook-value mt-2">
              <strong>P5 Electricity Aim:</strong> To find out if the number of batteries in series affects the brightness of the bulb.
            </div>
            <div class="notebook-value mt-2">
              <strong>P5 Properties of Materials Aim:</strong> To find out if the thickness of a plastic sheet affects the maximum weight it can support.
            </div>
          </div>
        `;
        break;
      case 3:
        notebookHtml = `
          <div class="notebook-step">
            <div class="notebook-label">Skill 3: Writing a Hypothesis</div>
            <div class="notebook-value">
              <strong>Hypothesis Structure:</strong> If the [Changed Variable] increases/decreases, then the [Measured Variable] will [increase/decrease] because [Scientific Reasoning].
            </div>
            <div class="notebook-value mt-2">
              <strong>P5 Water Cycle Hypothesis:</strong> If the wind speed increases, then the amount of water evaporated will increase because moving air carries away water vapour quickly, allowing more liquid water to evaporate.
            </div>
          </div>
        `;
        break;
      case 4:
        notebookHtml = `
          <div class="notebook-step">
            <div class="notebook-label">Skill 4: Identifying Variables</div>
            <div class="notebook-value">
              <strong>Variables Definitions:</strong>
              <ul>
                <li>Changed (Independent): What we vary on purpose.</li>
                <li>Measured (Dependent): What we observe/measure.</li>
                <li>Controlled: What we keep identical for a fair test.</li>
              </ul>
            </div>
            <div class="notebook-value mt-2">
              <strong>Forces Friction Investigation:</strong>
              <ul>
                <li>Changed: Type of surface</li>
                <li>Measured: Distance block travels</li>
                <li>Controlled: Block mass, slope angle</li>
              </ul>
            </div>
          </div>
        `;
        break;
      case 5:
        notebookHtml = `
          <div class="notebook-step">
            <div class="notebook-label">Skill 5: Designing the Experiment</div>
            <div class="notebook-value">
              <strong>Control Setup Rule:</strong> An experimental control setup is identical to the main setup except it lacks the changed variable.
            </div>
            <div class="notebook-value mt-2">
              <strong>P5 Plant Control:</strong> To prove leaves absorb water, compare Beaker A (leaves) to Beaker B (identical plant with all leaves removed).
            </div>
          </div>
        `;
        break;
      case 6:
        notebookHtml = `
          <div class="notebook-step">
            <div class="notebook-label">Skill 6: Writing the Procedure</div>
            <div class="notebook-value">
              <strong>Procedure Check:</strong> Write numbered steps with exact measurements, and always repeat the test three times to ensure reliability.
            </div>
          </div>
        `;
        break;
      case 7:
        notebookHtml = `
          <div class="notebook-step">
            <div class="notebook-label">Skill 7: Collecting Data</div>
            <div class="notebook-value">
              <strong>Data Tables and Averages:</strong>
              <table>
                <thead>
                  <tr><th>Leaves</th><th>T1</th><th>T2</th><th>T3</th><th>Avg</th></tr>
                </thead>
                <tbody>
                  <tr><td>0</td><td>200ml</td><td>200ml</td><td>200ml</td><td>200ml</td></tr>
                  <tr><td>3</td><td>180ml</td><td>182ml</td><td>178ml</td><td>180ml</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        `;
        break;
      case 8:
        notebookHtml = `
          <div class="notebook-step">
            <div class="notebook-label">Skill 8: Drawing Conclusions</div>
            <div class="notebook-value">
              <strong>Conclusion Framework:</strong> Relate the trend back to the aim and hypothesis, and support it with data measurements.
            </div>
          </div>
        `;
        break;
    }

    this.state.notebookPages[module.id] = notebookHtml;
    this.saveStateToStorage();
  }

  openNotebook() {
    this.elNotebookModal.classList.remove("hidden");
    this.renderNotebook();
  }

  closeNotebook() {
    this.elNotebookModal.classList.add("hidden");
  }

  renderNotebook() {
    const tabsContainer = document.getElementById("notebook-tabs");
    const pageBody = document.getElementById("notebook-page-body");
    const pageTitle = document.getElementById("notebook-page-title");
    const pageNumber = document.getElementById("notebook-page-number");
    const stampEl = document.getElementById("notebook-approval-stamp");
    
    tabsContainer.innerHTML = "";
    
    // Generate tabs 1-8
    for (let i = 1; i <= 8; i++) {
      const module = AcademyModules.find(m => m.id === i);
      const isUnlocked = this.state.notebookPages[i];
      
      const tab = document.createElement("button");
      tab.className = `notebook-tab ${this.state.selectedNotebookTab === i ? 'active-tab' : ''}`;
      tab.textContent = isUnlocked ? `${i}. ${module.title}` : `${i}. Locked 🔒`;
      tab.disabled = !isUnlocked;
      
      tab.addEventListener("click", () => {
        this.state.selectedNotebookTab = i;
        this.renderNotebook();
      });

      tabsContainer.appendChild(tab);
    }

    // Load active page body
    const activePageHtml = this.state.notebookPages[this.state.selectedNotebookTab];
    if (activePageHtml) {
      pageTitle.textContent = AcademyModules[this.state.selectedNotebookTab - 1].title;
      pageNumber.textContent = `PAGE ${this.state.selectedNotebookTab}`;
      pageBody.innerHTML = activePageHtml;
      stampEl.classList.remove("hidden");
      stampEl.classList.add("stamped");
    } else {
      pageTitle.textContent = "Notebook Journal";
      pageNumber.textContent = "PAGE -";
      pageBody.innerHTML = `<p class="text-slate-400 italic text-center mt-12">No notes recorded for this page yet. Master Module ${this.state.selectedNotebookTab} to unlock this tab!</p>`;
      stampEl.classList.add("hidden");
      stampEl.classList.remove("stamped");
    }
  }

  // ==========================================
  // TEACHER DASHBOARD LOGIC
  // ==========================================

  openTeacherPanel() {
    this.elTeacherModal.classList.remove("hidden");
    this.switchTeacherTab("settings");
  }

  closeTeacherPanel() {
    this.elTeacherModal.classList.add("hidden");
  }

  switchTeacherTab(tabName) {
    this.elTabBtnSettings.classList.remove("active");
    this.elTabBtnReports.classList.remove("active");
    this.elTeacherSettingsPanel.classList.add("hidden");
    this.elTeacherReportsPanel.classList.add("hidden");

    if (tabName === "settings") {
      this.elTabBtnSettings.classList.add("active");
      this.elTeacherSettingsPanel.classList.remove("hidden");
    } else {
      this.elTabBtnReports.classList.add("active");
      this.elTeacherReportsPanel.classList.remove("hidden");
      this.renderTeacherReports();
    }
  }

  renderTeacherReports() {
    this.elTeacherReportsTable.innerHTML = "";
    
    MockStudentProgress.forEach(student => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td class="p-2 font-semibold text-slate-800">${student.name}</td>
        <td class="p-2 text-center font-bold text-slate-600">${student.completedModules} / 8</td>
        <td class="p-2 text-center font-bold text-indigo-500">${student.averageQuizScore}%</td>
        <td class="p-2 text-center font-bold text-amber-500">${student.xp}</td>
        <td class="p-2 text-xs text-red-500 font-semibold">${student.misconceptions.join(', ') || 'None'}</td>
      `;
      this.elTeacherReportsTable.appendChild(tr);
    });
  }

  // ==========================================
  // CONFETTI CELEBRATIONS
  // ==========================================

  triggerConfetti() {
    const celebration = document.getElementById("confetti-celebration");
    celebration.innerHTML = "";
    celebration.classList.remove("hidden");

    const colors = ["#8b5cf6", "#3b82f6", "#06b6d4", "#10b981", "#f59e0b", "#f43f5e"];
    
    // Spawn 80 confetti pieces
    for (let i = 0; i < 80; i++) {
      const piece = document.createElement("div");
      piece.className = "confetti-piece";
      piece.style.left = `${Math.random() * 100}%`;
      piece.style.top = `-20px`;
      piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      piece.style.transform = `rotate(${Math.random() * 360}deg)`;
      piece.style.animationDelay = `${Math.random() * 1.5}s`;
      piece.style.animationDuration = `${2 + Math.random() * 2}s`;
      
      celebration.appendChild(piece);
    }

    setTimeout(() => {
      celebration.classList.add("hidden");
    }, 4500);
  }

  celebrateNewScientist() {
    alert(`👋 Welcome to the Scientist Academy, ${this.state.playerName}!\n\nProfessor Sprout has loaded your mission map. Let's start with Module 1: Asking Scientific Questions!`);
  }
}

// Start app on window load
window.addEventListener("load", () => {
  window.AcademyApp = new ScientistAcademyApp();
});
