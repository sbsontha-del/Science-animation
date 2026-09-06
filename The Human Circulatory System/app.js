// Main Application Script for Circulatory & Respiratory Systems (4.4 - 4.7)

document.addEventListener('DOMContentLoaded', () => {
  initTabNavigation();
  initDragAndDropRoleplay();
  initSocraticEngine();
  initVirtualExperiment();
  initComicFlipbook47();
  initRubricEvaluator();
  initQuizEngine();
});

/* ==================== TAB NAVIGATION & PASSWORD LOCK SYSTEM ==================== */
function initTabNavigation() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  const btnToggleTeacherPass = document.getElementById('btn-toggle-teacher-pass');
  const teacherPassBanner = document.getElementById('teacher-pass-banner');

  const lockModal = document.getElementById('password-lock-modal');
  const lockModalTitle = document.getElementById('lock-modal-title');
  const inputTabPassword = document.getElementById('input-tab-password');
  const btnSubmitTabPassword = document.getElementById('btn-submit-tab-password');
  const btnCloseLockModal = document.getElementById('btn-close-lock-modal');
  const btnCancelLockModal = document.getElementById('btn-cancel-lock-modal');
  const lockErrorMsg = document.getElementById('lock-error-msg');

  let pendingTabBtn = null;

  // Toggle Teacher Reference Banner
  if (btnToggleTeacherPass && teacherPassBanner) {
    btnToggleTeacherPass.addEventListener('click', () => {
      teacherPassBanner.classList.toggle('hidden');
    });
  }

  function activateTab(btn) {
    const targetTab = btn.getAttribute('data-tab');

    tabBtns.forEach(b => {
      b.classList.remove('active');
      b.setAttribute('aria-selected', 'false');
    });
    tabContents.forEach(c => c.classList.remove('active'));

    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');
    const contentEl = document.getElementById(targetTab);
    if (contentEl) contentEl.classList.add('active');
  }

  function unlockTab(btn) {
    btn.setAttribute('data-locked', 'false');
    btn.classList.remove('locked');
    const iconSpan = btn.querySelector('.lock-status-icon');
    if (iconSpan) iconSpan.textContent = '🔓';
  }

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const isLocked = btn.getAttribute('data-locked') === 'true';

      if (isLocked) {
        pendingTabBtn = btn;
        const tabText = btn.querySelector('.tab-text')?.textContent || 'Activity';
        if (lockModalTitle) lockModalTitle.textContent = `🔒 ${tabText} is Locked`;
        if (inputTabPassword) inputTabPassword.value = '';
        if (lockErrorMsg) lockErrorMsg.classList.add('hidden');
        if (lockModal) lockModal.classList.remove('hidden');
        if (inputTabPassword) inputTabPassword.focus();
      } else {
        activateTab(btn);
      }
    });
  });

  function processPasswordUnlock() {
    if (!pendingTabBtn) return;
    const userPass = (inputTabPassword?.value || '').trim().toLowerCase();
    const validPasses = (pendingTabBtn.getAttribute('data-pass') || '').toLowerCase().split(',');

    if (validPasses.some(p => p.trim() === userPass)) {
      unlockTab(pendingTabBtn);
      activateTab(pendingTabBtn);
      if (lockModal) lockModal.classList.add('hidden');
      if (lockErrorMsg) lockErrorMsg.classList.add('hidden');
    } else {
      if (lockErrorMsg) lockErrorMsg.classList.remove('hidden');
      if (inputTabPassword) {
        inputTabPassword.focus();
        inputTabPassword.select();
      }
    }
  }

  if (btnSubmitTabPassword) {
    btnSubmitTabPassword.addEventListener('click', processPasswordUnlock);
  }

  if (inputTabPassword) {
    inputTabPassword.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') processPasswordUnlock();
    });
  }

  function closeLockModal() {
    if (lockModal) lockModal.classList.add('hidden');
    if (lockErrorMsg) lockErrorMsg.classList.add('hidden');
    pendingTabBtn = null;
  }

  if (btnCloseLockModal) btnCloseLockModal.addEventListener('click', closeLockModal);
  if (btnCancelLockModal) btnCancelLockModal.addEventListener('click', closeLockModal);

  // Teacher Master Login Elements
  const btnTeacherLogin = document.getElementById('btn-teacher-login');
  const teacherLoginModal = document.getElementById('teacher-login-modal');
  const inputTeacherMasterPass = document.getElementById('input-teacher-master-pass');
  const btnSubmitTeacherLogin = document.getElementById('btn-submit-teacher-login');
  const btnCloseTeacherLogin = document.getElementById('btn-close-teacher-login');
  const btnCancelTeacherLogin = document.getElementById('btn-cancel-teacher-login');
  const teacherLoginErrorMsg = document.getElementById('teacher-login-error-msg');

  if (btnTeacherLogin && teacherLoginModal) {
    btnTeacherLogin.addEventListener('click', () => {
      if (inputTeacherMasterPass) inputTeacherMasterPass.value = '';
      if (teacherLoginErrorMsg) teacherLoginErrorMsg.classList.add('hidden');
      teacherLoginModal.classList.remove('hidden');
      if (inputTeacherMasterPass) inputTeacherMasterPass.focus();
    });
  }

  function processTeacherMasterLogin() {
    const pass = (inputTeacherMasterPass?.value || '').trim().toLowerCase();
    const validMasterPasses = ['teacher', 'teacher123', 'admin', 'master'];

    if (validMasterPasses.includes(pass)) {
      tabBtns.forEach(b => unlockTab(b));
      if (btnTeacherLogin) {
        btnTeacherLogin.innerHTML = '🔓 Teacher Mode (All Unlocked)';
        btnTeacherLogin.style.background = 'rgba(16, 185, 129, 0.3)';
        btnTeacherLogin.style.borderColor = '#10b981';
      }
      if (teacherLoginModal) teacherLoginModal.classList.add('hidden');
      if (teacherLoginErrorMsg) teacherLoginErrorMsg.classList.add('hidden');
    } else {
      if (teacherLoginErrorMsg) teacherLoginErrorMsg.classList.remove('hidden');
      if (inputTeacherMasterPass) {
        inputTeacherMasterPass.focus();
        inputTeacherMasterPass.select();
      }
    }
  }

  if (btnSubmitTeacherLogin) {
    btnSubmitTeacherLogin.addEventListener('click', processTeacherMasterLogin);
  }

  if (inputTeacherMasterPass) {
    inputTeacherMasterPass.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') processTeacherMasterLogin();
    });
  }

  function closeTeacherLoginModal() {
    if (teacherLoginModal) teacherLoginModal.classList.add('hidden');
    if (teacherLoginErrorMsg) teacherLoginErrorMsg.classList.add('hidden');
  }

  if (btnCloseTeacherLogin) btnCloseTeacherLogin.addEventListener('click', closeTeacherLoginModal);
  if (btnCancelTeacherLogin) btnCancelTeacherLogin.addEventListener('click', closeTeacherLoginModal);
}

/* ==================== ACTIVITY 4.4 ROLE-PLAY DRAG & DROP ==================== */
const roleplayData = {
  placed: {},
  expectedMap: {
    'slot-panel-lungs': 'panel-lungs',
    'slot-panel-heart': 'panel-heart',
    'slot-panel-body': 'panel-body',
    'slot-vessel-top-left': 'vessel-red-top-1',
    'slot-vessel-top-right': 'vessel-red-top-2',
    'slot-vessel-bot-right': 'vessel-blue-bot-1',
    'slot-vessel-bot-left': 'vessel-blue-bot-2'
  },
  itemInfo: {
    'panel-lungs': { label: 'LUNGS Panel', icon: '🫁' },
    'panel-heart': { label: 'HEART Panel', icon: '🫀' },
    'panel-body': { label: 'OTHER PARTS OF THE BODY Panel', icon: '🧠🦵' },
    'vessel-red-top-1': { label: 'Red Vessel (Lungs → Heart)', icon: '🔴' },
    'vessel-red-top-2': { label: 'Red Vessel (Heart → Body)', icon: '🔴' },
    'vessel-blue-bot-1': { label: 'Blue Vessel (Body → Heart)', icon: '🔵' },
    'vessel-blue-bot-2': { label: 'Blue Vessel (Heart → Lungs)', icon: '🔵' }
  }
};

function initDragAndDropRoleplay() {
  const dragItems = document.querySelectorAll('.drag-item');
  const dropSlots = document.querySelectorAll('.drop-slot, .vessel-slot-box');
  let draggedItem = null;

  dragItems.forEach(item => {
    item.addEventListener('dragstart', (e) => {
      draggedItem = item;
      item.classList.add('dragging');
      e.dataTransfer.setData('text/plain', item.getAttribute('data-id'));
    });

    item.addEventListener('dragend', () => {
      item.classList.remove('dragging');
      draggedItem = null;
    });

    item.addEventListener('click', () => {
      autoPlaceItem(item.getAttribute('data-id'));
    });
  });

  dropSlots.forEach(slot => {
    slot.addEventListener('dragover', (e) => {
      e.preventDefault();
      slot.classList.add('drag-over');
    });

    slot.addEventListener('dragleave', () => {
      slot.classList.remove('drag-over');
    });

    slot.addEventListener('drop', (e) => {
      e.preventDefault();
      slot.classList.remove('drag-over');
      const itemId = e.dataTransfer.getData('text/plain');
      placeItemInSlot(itemId, slot);
    });

    slot.addEventListener('click', () => {
      const slotId = slot.getAttribute('data-slot');
      if (roleplayData.placed[slotId]) {
        delete roleplayData.placed[slotId];
        renderSlots();
        updateSvgArrowsState();
        checkModelCompletion();
      }
    });
  });

  document.getElementById('btn-auto-assemble').addEventListener('click', autoAssembleModel);
  document.getElementById('btn-reset-roleplay').addEventListener('click', resetModel);
  document.getElementById('btn-run-simulation').addEventListener('click', runRoleplaySimulation);
}

function placeItemInSlot(itemId, slotEl) {
  const slotId = slotEl.getAttribute('data-slot');
  roleplayData.placed[slotId] = itemId;
  renderSlots();
  updateSvgArrowsState();
  checkModelCompletion();
}

function autoPlaceItem(itemId) {
  const slotIds = Object.keys(roleplayData.expectedMap);
  for (let slotId of slotIds) {
    if (roleplayData.expectedMap[slotId] === itemId && !roleplayData.placed[slotId]) {
      roleplayData.placed[slotId] = itemId;
      break;
    }
  }
  renderSlots();
  updateSvgArrowsState();
  checkModelCompletion();
}

function updateSvgArrowsState() {
  const arrowTopLeft = document.getElementById('svg-arrow-top-left');
  if (roleplayData.placed['slot-vessel-top-left'] === 'vessel-red-top-1') {
    arrowTopLeft.setAttribute('class', 'vessel-arrow-path red-arrow active');
    arrowTopLeft.setAttribute('marker-end', 'url(#arrow-head-red)');
  } else {
    arrowTopLeft.setAttribute('class', 'vessel-arrow-path red-arrow inactive');
    arrowTopLeft.setAttribute('marker-end', 'url(#arrow-head-gray)');
  }

  const arrowTopRight = document.getElementById('svg-arrow-top-right');
  if (roleplayData.placed['slot-vessel-top-right'] === 'vessel-red-top-2') {
    arrowTopRight.setAttribute('class', 'vessel-arrow-path red-arrow active');
    arrowTopRight.setAttribute('marker-end', 'url(#arrow-head-red)');
  } else {
    arrowTopRight.setAttribute('class', 'vessel-arrow-path red-arrow inactive');
    arrowTopRight.setAttribute('marker-end', 'url(#arrow-head-gray)');
  }

  const arrowBotRight = document.getElementById('svg-arrow-bot-right');
  if (roleplayData.placed['slot-vessel-bot-right'] === 'vessel-blue-bot-1') {
    arrowBotRight.setAttribute('class', 'vessel-arrow-path blue-arrow active');
    arrowBotRight.setAttribute('marker-end', 'url(#arrow-head-blue)');
  } else {
    arrowBotRight.setAttribute('class', 'vessel-arrow-path blue-arrow inactive');
    arrowBotRight.setAttribute('marker-end', 'url(#arrow-head-gray)');
  }

  const arrowBotLeft = document.getElementById('svg-arrow-bot-left');
  if (roleplayData.placed['slot-vessel-bot-left'] === 'vessel-blue-bot-2') {
    arrowBotLeft.setAttribute('class', 'vessel-arrow-path blue-arrow active');
    arrowBotLeft.setAttribute('marker-end', 'url(#arrow-head-blue)');
  } else {
    arrowBotLeft.setAttribute('class', 'vessel-arrow-path blue-arrow inactive');
    arrowBotLeft.setAttribute('marker-end', 'url(#arrow-head-gray)');
  }
}

function renderSlots() {
  const dropSlots = document.querySelectorAll('.drop-slot, .vessel-slot-box');
  dropSlots.forEach(slot => {
    const slotId = slot.getAttribute('data-slot');
    const expected = roleplayData.expectedMap[slotId];
    const placedItemId = roleplayData.placed[slotId];

    if (placedItemId) {
      const itemData = roleplayData.itemInfo[placedItemId];
      const isCorrect = (placedItemId === expected);
      
      let baseClass = slot.classList.contains('pink-panel-slot') ? 'pink-panel-slot' : 'vessel-slot-box';
      if (slotId.includes('top-left')) baseClass += ' top-left-vessel';
      if (slotId.includes('top-right')) baseClass += ' top-right-vessel';
      if (slotId.includes('bot-left')) baseClass += ' bottom-left-vessel';
      if (slotId.includes('bot-right')) baseClass += ' bottom-right-vessel';
      if (slotId.includes('body')) baseClass += ' large-body-slot';

      slot.className = `drop-slot ${baseClass} ${isCorrect ? 'filled-correct' : 'filled-incorrect'}`;

      let labelHeader = '';
      if (slotId.includes('top')) labelHeader = '<div class="vessel-label-text red-label">oxygenated blood</div>';
      if (slotId.includes('bot')) labelHeader = '<div class="vessel-label-text blue-label">deoxygenated blood</div>';

      slot.innerHTML = `${labelHeader}<div class="placed-item">${itemData.icon} ${itemData.label}</div>`;
    } else {
      let baseClass = slot.classList.contains('pink-panel-slot') ? 'pink-panel-slot' : 'vessel-slot-box';
      if (slotId.includes('top-left')) baseClass += ' top-left-vessel';
      if (slotId.includes('top-right')) baseClass += ' top-right-vessel';
      if (slotId.includes('bot-left')) baseClass += ' bottom-left-vessel';
      if (slotId.includes('bot-right')) baseClass += ' bottom-right-vessel';
      if (slotId.includes('body')) baseClass += ' large-body-slot';

      slot.className = `drop-slot ${baseClass}`;
      
      let hint = "Drop Item Here";
      if (expected === 'panel-lungs') hint = "Drop LUNGS Panel";
      else if (expected === 'panel-heart') hint = "Drop HEART Panel";
      else if (expected === 'panel-body') hint = "Drop OTHER PARTS OF THE BODY Panel";
      else if (expected === 'vessel-red-top-1') hint = "Red Vessel (Lungs → Heart)";
      else if (expected === 'vessel-red-top-2') hint = "Red Vessel (Heart → Body)";
      else if (expected === 'vessel-blue-bot-1') hint = "Blue Vessel (Body → Heart)";
      else if (expected === 'vessel-blue-bot-2') hint = "Blue Vessel (Heart → Lungs)";

      let labelHeader = '';
      if (slotId.includes('top')) labelHeader = '<div class="vessel-label-text red-label">oxygenated blood</div>';
      if (slotId.includes('bot')) labelHeader = '<div class="vessel-label-text blue-label">deoxygenated blood</div>';

      slot.innerHTML = `${labelHeader}<div class="slot-placeholder">${hint}</div>`;
    }
  });
}

function checkModelCompletion() {
  const totalRequired = Object.keys(roleplayData.expectedMap).length;
  let correctCount = 0;

  for (let slotId in roleplayData.expectedMap) {
    if (roleplayData.placed[slotId] === roleplayData.expectedMap[slotId]) {
      correctCount++;
    }
  }

  const simBtn = document.getElementById('btn-run-simulation');
  if (correctCount === totalRequired) {
    simBtn.disabled = false;
    simBtn.classList.add('pulse-anim');
  } else {
    simBtn.disabled = true;
    simBtn.classList.remove('pulse-anim');
  }
}

function autoAssembleModel() {
  for (let slotId in roleplayData.expectedMap) {
    roleplayData.placed[slotId] = roleplayData.expectedMap[slotId];
  }
  renderSlots();
  updateSvgArrowsState();
  checkModelCompletion();
}

function resetModel() {
  roleplayData.placed = {};
  renderSlots();
  updateSvgArrowsState();
  checkModelCompletion();

  document.querySelectorAll('.vessel-flow-pulse').forEach(p => p.classList.add('hidden'));
  document.getElementById('sim-blood-cell-node').classList.add('hidden');
  document.getElementById('sim-banner-status').classList.add('hidden');
}

function runRoleplaySimulation() {
  const bloodCell = document.getElementById('sim-blood-cell-node');
  const gasLabel = document.getElementById('cell-label-gas');
  const banner = document.getElementById('sim-banner-status');
  const bannerText = document.getElementById('sim-banner-text');

  document.querySelectorAll('.vessel-flow-pulse').forEach(p => p.classList.remove('hidden'));
  bloodCell.classList.remove('hidden');
  banner.classList.remove('hidden');

  const pathSequence = [
    { svgId: 'svg-arrow-top-left', text: "🔴 <strong>LUNGS ➡️ HEART:</strong> Oxygenated blood (rich in O₂) flows inside the Red Top Arrow from LUNGS to HEART.", color: "#ef4444", gas: "O₂" },
    { svgId: 'svg-arrow-top-right', text: "🫀 ➡️ 🧠🦵 <strong>HEART ➡️ OTHER PARTS OF THE BODY:</strong> Heart pumps oxygenated blood inside the Red Top Arrow to all parts of the body.", color: "#ef4444", gas: "O₂" },
    { svgId: 'svg-arrow-bot-right', text: "🧠🦵 ➡️ 🫀 <strong>OTHER PARTS OF THE BODY ➡️ HEART:</strong> Body cells use oxygen and release carbon dioxide. Deoxygenated blood (rich in CO₂) flows inside the Blue Bottom Arrow back to the Heart.", color: "#2563eb", gas: "CO₂" },
    { svgId: 'svg-arrow-bot-left', text: "🔵 <strong>HEART ➡️ LUNGS:</strong> Heart pumps deoxygenated blood inside the Blue Bottom Arrow to LUNGS, where CO₂ is removed and fresh O₂ is absorbed!", color: "#2563eb", gas: "CO₂" }
  ];

  let currentPathIndex = 0;

  function animateAlongArrow() {
    if (currentPathIndex >= pathSequence.length) {
      bannerText.innerHTML = "✅ <strong>Role-Play Simulation Complete!</strong> Observe how oxygenated blood (red) and deoxygenated blood (blue) flow through lungs, heart, and body parts.";
      return;
    }

    const currentInfo = pathSequence[currentPathIndex];
    bannerText.innerHTML = currentInfo.text;
    bloodCell.style.backgroundColor = currentInfo.color;
    gasLabel.textContent = currentInfo.gas;

    const svgPathEl = document.getElementById(currentInfo.svgId);
    const pathLength = svgPathEl.getTotalLength();
    let startTime = null;
    const duration = 2800;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const point = svgPathEl.getPointAtLength(progress * pathLength);

      const container = document.querySelector('.diagram-interactive-canvas');
      const rect = container.getBoundingClientRect();
      const posX = (point.x / 800) * rect.width;
      const posY = (point.y / 420) * rect.height;

      bloodCell.style.left = `${posX}px`;
      bloodCell.style.top = `${posY}px`;

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        currentPathIndex++;
        setTimeout(animateAlongArrow, 500);
      }
    }

    requestAnimationFrame(step);
  }

  animateAlongArrow();
}

/* ==================== SOCRATIC GUIDED INQUIRY & REAL-TIME KEYWORD ENGINE ==================== */
const socraticConfig = {
  'input-4-4-2a': {
    prompt: "Think about your role-play simulation! What gases were absorbed at the lungs and given out by body cells? What liquid and digested food nutrients are carried in blood?",
    keywords: [
      { text: 'oxygen', aliases: ['oxygen', 'o2'] },
      { text: 'carbon dioxide', aliases: ['carbon dioxide', 'co2'] },
      { text: 'water', aliases: ['water', 'h2o'] },
      { text: 'digested food', aliases: ['digested food', 'food', 'nutrients'] }
    ],
    starter: "Blood contains substances such as oxygen, carbon dioxide, water and digested food."
  },
  'input-4-4-2b': {
    prompt: "What action does the heart perform to push blood through blood vessels so it reaches your head, legs, and all organs?",
    keywords: [
      { text: 'pumps blood', aliases: ['pumps blood', 'pumps', 'pump', 'pushes'] },
      { text: 'all parts of the body', aliases: ['all parts of the body', 'all parts', 'rest of body', 'body'] }
    ],
    starter: "The heart pumps blood to all parts of the body."
  },
  'input-4-4-4': {
    prompt: "Trace the 4-step pathway of oxygen: 1) Where is oxygen absorbed? 2) Where does blood travel next? 3) What does the heart do? 4) Where is oxygen delivered?",
    keywords: [
      { text: 'absorbed into blood at lungs', aliases: ['lungs', 'absorbed', 'lung'] },
      { text: 'transported to heart', aliases: ['heart', 'transported', 'carried'] },
      { text: 'heart pumps blood', aliases: ['pumps', 'pump', 'pumping'] },
      { text: 'taken in by rest of body', aliases: ['rest of the body', 'rest of body', 'body', 'all parts'] }
    ],
    starter: "Oxygen is absorbed into the blood at the lungs. Blood rich in oxygen is transported to the heart. The heart pumps blood rich in oxygen to the rest of the body. Oxygen is taken in by the rest of the body."
  },
  'input-4-4-5': {
    prompt: "Trace how waste carbon dioxide is removed: 1) Where is CO₂ produced/given out? 2) Where does blood carry it first? 3) Where does the heart pump it? 4) How does it leave?",
    keywords: [
      { text: 'given out by body & enters blood', aliases: ['given out', 'body', 'enters the blood', 'enters blood'] },
      { text: 'transported to heart', aliases: ['heart', 'transported', 'carried'] },
      { text: 'pumps blood to lungs', aliases: ['pumps blood to the lungs', 'pumps to lungs', 'lungs', 'pump'] },
      { text: 'removed out of body', aliases: ['removed', 'out of the body', 'out of body', 'exhaled'] }
    ],
    starter: "Carbon dioxide is given out by the body and enters the blood. Blood rich in carbon dioxide is transported to the heart. Heart pumps blood to the lungs. Carbon dioxide is removed from the lungs and out of the body."
  },
  'input-4-4-7': {
    prompt: "Compare your model to an actual human body! 1) Where are lungs placed relative to the heart? 2) In real blood vessels, are oxygen and carbon dioxide transported at the same time?",
    keywords: [
      { text: 'lung position difference', aliases: ['above', 'position', 'positions', 'lungs', 'located'] },
      { text: 'both oxygen & carbon dioxide transported', aliases: ['both', 'oxygen and carbon dioxide', 'oxygen & carbon dioxide', 'both oxygen'] }
    ],
    starter: "The lungs are placed above the heart in the model while this is not the actual positions of the heart and lungs in the actual human circulatory system. Also, both oxygen and carbon dioxide are transported from the lungs to the heart in the actual human circulatory system."
  },
  'input-4-5-2': {
    prompt: "What would happen to plant leaves or human brain and muscle cells if food, water, and gases could not be transported to them?",
    keywords: [
      { text: 'receive substances needed', aliases: ['receive', 'substances', 'needed', 'food', 'water'] },
      { text: 'for them to survive', aliases: ['survive', 'survival', 'stay alive'] }
    ],
    starter: "This ensures that different parts of plants and humans receive substances that are needed for them to survive."
  },
  'input-4-5-sim1': {
    prompt: "What essential substances do both plants and humans transport?",
    keywords: [
      { text: 'transport food and water', aliases: ['food', 'water', 'substances', 'nutrients'] }
    ],
    starter: "Both systems transport food and water to different parts of the system."
  },
  'input-4-5-sim2': {
    prompt: "What structures do both use to carry liquids and nutrients?",
    keywords: [
      { text: 'transport substances in tubes', aliases: ['tubes', 'vessels', 'pipes'] }
    ],
    starter: "Both systems transport substances in tubes throughout the system."
  },
  'input-4-5-diff-plant-tubes': {
    prompt: "Does a plant have separate tubes for carrying food and water?",
    keywords: [
      { text: 'separate tubes', aliases: ['separate', 'food-carrying tubes', 'water-carrying tubes', 'food-carrying', 'water-carrying'] }
    ],
    starter: "Transports food and water through separate tubes (food-carrying tubes and water-carrying tubes)."
  },
  'input-4-5-diff-human-tubes': {
    prompt: "What tubes do humans use to transport blood?",
    keywords: [
      { text: 'same tube (blood vessels)', aliases: ['same tube', 'blood vessels', 'vessels', 'blood'] }
    ],
    starter: "Transports food and water through the same tube (blood vessels)."
  },
  'input-4-5-diff-plant-pump': {
    prompt: "Do plants have a organ or heart to pump liquids?",
    keywords: [
      { text: 'does not require a pump', aliases: ['does not require', 'no pump', 'without pump', 'no heart'] }
    ],
    starter: "Does not require a pump to transport substances."
  },
  'input-4-5-diff-human-pump': {
    prompt: "Do humans need an organ to pump blood?",
    keywords: [
      { text: 'requires a pump (heart)', aliases: ['heart', 'pump', 'pumps', 'push substances'] }
    ],
    starter: "Requires a pump (heart) to push substances carried by blood to different parts of the body."
  },
  'input-4-6-9c': {
    prompt: "State the relationship between activity vigor and heart rate:",
    keywords: [
      { text: 'more vigorous activity', aliases: ['vigorous', 'more vigorous', 'intense'] },
      { text: 'higher heart rate', aliases: ['higher', 'faster', 'increase', 'increases', 'heart rate'] }
    ],
    starter: "The more vigorous an activity, the higher the heart rate."
  },
  'input-4-6-9d': {
    prompt: "Why does the heart beat faster during exercise?",
    keywords: [
      { text: 'heart beats faster', aliases: ['beats faster', 'faster', 'pumps faster'] },
      { text: 'transport more oxygen & digested food', aliases: ['oxygen', 'digested food', 'food', 'nutrients'] },
      { text: 'different parts of body', aliases: ['different parts', 'body parts', 'body'] }
    ],
    starter: "During a more vigorous activity, the heart beats faster to provide the body to transport more oxygen and digested food to different parts of the body."
  },
  'input-4-6-10c': {
    prompt: "State the relationship between activity vigor and breathing rate:",
    keywords: [
      { text: 'more vigorous activity', aliases: ['vigorous', 'more vigorous'] },
      { text: 'higher breathing rate', aliases: ['higher', 'faster', 'increase', 'increases', 'breathing rate'] }
    ],
    starter: "The more vigorous an activity, the higher the breathing rate."
  },
  'input-4-6-10d': {
    prompt: "Why do your lungs breathe faster during exercise?",
    keywords: [
      { text: 'breathing is faster', aliases: ['breathing is faster', 'faster', 'breathe faster'] },
      { text: 'more oxygen taken in', aliases: ['more oxygen', 'oxygen', 'taken in'] },
      { text: 'more carbon dioxide given out', aliases: ['carbon dioxide', 'given out', 'co2', 'removed'] }
    ],
    starter: "During a more vigorous activity, breathing is faster. More oxygen is taken in and more carbon dioxide is given out from the body."
  },
  'input-4-6-11': {
    prompt: "How do the respiratory system and circulatory system work together during exercise?",
    keywords: [
      { text: 'respiratory and circulatory work together', aliases: ['work together', 'together', 'cooperate'] },
      { text: 'oxygen and digested food transported', aliases: ['oxygen', 'digested food', 'transported', 'food'] },
      { text: 'different parts of the body', aliases: ['different parts', 'body parts', 'body'] }
    ],
    starter: "The respiratory system and circulatory system work together to ensure that substances such as oxygen and digested food are transported to different parts of the body."
  },
  'input-4-6-resp': {
    prompt: "What is the function of the respiratory system during exercise?",
    keywords: [
      { text: 'take in oxygen', aliases: ['take in oxygen', 'oxygen', 'take in'] },
      { text: 'give out carbon dioxide', aliases: ['give out carbon dioxide', 'carbon dioxide', 'give out', 'co2'] }
    ],
    starter: "take in oxygen and give out carbon dioxide"
  },
  'input-4-6-circ': {
    prompt: "What is the function of the circulatory system during exercise?",
    keywords: [
      { text: 'transport oxygen', aliases: ['transport oxygen', 'oxygen', 'transports'] },
      { text: 'remove carbon dioxide', aliases: ['remove carbon dioxide', 'carbon dioxide', 'remove', 'co2'] }
    ],
    starter: "transport oxygen to and remove carbon dioxide from different parts of the body"
  },
  'input-4-6-dig': {
    prompt: "What is the function of the digestive system during exercise?",
    keywords: [
      { text: 'digest food', aliases: ['digest food', 'digest', 'food', 'digested food'] },
      { text: 'transported to different parts of body', aliases: ['transported', 'different parts', 'body'] }
    ],
    starter: "digest food so that it can be transported to different parts of the body"
  },
  'input-4-6-skel': {
    prompt: "What is the function of the skeletal & muscular systems during exercise?",
    keywords: [
      { text: 'provide support', aliases: ['provide support', 'support', 'supports'] },
      { text: 'help it move', aliases: ['help it move', 'move', 'movement'] }
    ],
    starter: "provide support for the body to help it move"
  },
  'input-4-7-story': {
    prompt: "Trace the journey of a drop of blood starting from the heart!",
    keywords: [
      { text: 'pumped by heart', aliases: ['heart', 'pumped', 'pump'] },
      { text: 'carries oxygen & food', aliases: ['oxygen', 'digested food', 'food'] },
      { text: 'delivers to body parts', aliases: ['body', 'body parts', 'cells'] },
      { text: 'picks up carbon dioxide', aliases: ['carbon dioxide', 'co2'] },
      { text: 'returns to lungs', aliases: ['lungs', 'breathe'] }
    ],
    starter: "I am a drop of blood. When the heart pumps me, I carry oxygen and digested food to all parts of the body. Oxygen is taken in by body parts and carbon dioxide enters blood, which returns to the heart and lungs."
  },
  'input-sq5b': {
    prompt: "State one difference in how substances are transported in System X (humans) vs System Y (plants):",
    keywords: [
      { text: 'same tube (blood vessels) in X', aliases: ['same tube', 'blood vessels', 'vessels', 'blood'] },
      { text: 'separate tubes in Y', aliases: ['separate tubes', 'separate', 'food-carrying', 'water-carrying'] }
    ],
    starter: "X transports food and water using the same tube (blood vessels) but Y has separate tubes for transporting food and water."
  },
  'input-sq6a': {
    prompt: "State the relationship between the number of goldfish and the amount of oxygen in water over time:",
    keywords: [
      { text: 'number of goldfish increases', aliases: ['number of goldfish increases', 'goldfish increases', 'more goldfish', 'increases'] },
      { text: 'amount of oxygen decreases', aliases: ['amount of oxygen', 'decreases', 'less oxygen', 'decrease'] }
    ],
    starter: "As the number of goldfish increases, the amount of oxygen in the water over time decreases."
  },
  'input-sq6b': {
    prompt: "Explain what caused the change in the amount of oxygen in water:",
    keywords: [
      { text: 'goldfishes take in oxygen', aliases: ['take in oxygen', 'take in', 'goldfishes take in oxygen', 'oxygen'] },
      { text: 'causing oxygen to decrease', aliases: ['causing the amount of oxygen to decrease', 'decrease', 'decreases'] }
    ],
    starter: "The goldfishes take in oxygen causing the amount of oxygen to decrease."
  }
};


function initSocraticEngine() {
  // Initialize target keyword bars for all text inputs
  initTargetKeywordsBars();

  const socraticBtns = document.querySelectorAll('.btn-socratic[data-target]');
  socraticBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = btn.getAttribute('data-target');
      evaluateSocraticAnswer(targetId);
    });
  });

  // Table 4.5
  const btnTable45 = document.getElementById('btn-check-4-5-table');
  if (btnTable45) {
    btnTable45.addEventListener('click', evaluateTable45Socratic);
  }

  // Concludes
  document.getElementById('btn-check-conclude-4-4').addEventListener('click', () => {
    const answers = {
      'blank-4-4-1a': ['heart'],
      'blank-4-4-1b': ['blood vessels', 'vessels'],
      'blank-4-4-1c': ['blood'],
      'blank-4-4-1d': ['functions', 'function'],
      'blank-4-4-2a': ['heart'],
      'blank-4-4-2b': ['blood vessels', 'vessels'],
      'blank-4-4-2c': ['heart']
    };
    checkBlanksGroup(answers, 'socratic-conclude-4-4');
  });

  document.getElementById('btn-check-conclude-4-5').addEventListener('click', () => {
    const answers = {
      'blank-4-5-1a': ['digested food', 'food'],
      'blank-4-5-1b': ['water'],
      'blank-4-5-2a': ['food-carrying tubes', 'food carrying tubes'],
      'blank-4-5-2b': ['water-carrying tubes', 'water carrying tubes'],
      'blank-4-5-3': ['blood vessels', 'vessels'],
      'blank-4-5-4': ['different']
    };
    checkBlanksGroup(answers, 'socratic-conclude-4-5');
  });

  // Q8, Q9, Q10
  document.getElementById('btn-check-4-6-8').addEventListener('click', () => {
    const v1 = document.getElementById('input-4-6-8-1').value.trim().toLowerCase();
    const v2 = document.getElementById('input-4-6-8-2').value.trim().toLowerCase();
    const v3 = document.getElementById('input-4-6-8-3').value.trim().toLowerCase();
    const panel = document.getElementById('socratic-4-6-8');
    panel.classList.remove('hidden');

    if (v1 === 'jumping' && v2 === 'marching' && v3 === 'sitting') {
      panel.innerHTML = `
        <div class="socratic-prompt">
          <span class="socratic-prompt-icon">🌟</span>
          <div><strong>Excellent reasoning!</strong> You correctly arranged the activities by vigor: <strong>jumping &gt; marching &gt; sitting</strong>.</div>
        </div>
      `;
    } else {
      panel.innerHTML = `
        <div class="socratic-prompt">
          <span class="socratic-prompt-icon">💡</span>
          <div><strong>Think about energy output:</strong> Which activity requires the most intense muscle movement (highest heart rate), and which requires resting?</div>
        </div>
      `;
    }
  });

  document.getElementById('btn-check-4-6-9').addEventListener('click', evaluateQ9Socratic);

  document.getElementById('btn-check-4-6-10').addEventListener('click', evaluateQ10Socratic);

  document.getElementById('btn-check-4-6-partB').addEventListener('click', evaluatePartBSocratic);

  document.getElementById('btn-check-conclude-4-6').addEventListener('click', () => {
    const answers = {
      'blank-4-6-1a': ['increase'],
      'blank-4-6-1b': ['oxygen'],
      'blank-4-6-1c': ['digested food', 'food'],
      'blank-4-6-2': ['together']
    };
    checkBlanksGroup(answers, 'socratic-conclude-4-6');
  });

  const btnSq5 = document.getElementById('btn-check-sq5');
  if (btnSq5) {
    btnSq5.addEventListener('click', () => evaluateSocraticAnswer('input-sq5b'));
  }

  const btnSq6 = document.getElementById('btn-check-sq6');
  if (btnSq6) {
    btnSq6.addEventListener('click', () => evaluateSocraticAnswer('input-sq6b'));
  }
}

function initTargetKeywordsBars() {
  for (let inputId in socraticConfig) {
    const inputEl = document.getElementById(inputId);
    if (!inputEl) continue;

    const config = socraticConfig[inputId];

    let barEl = document.getElementById(`keywords-bar-${inputId}`);
    if (!barEl) {
      barEl = document.createElement('div');
      barEl.className = 'target-keywords-bar';
      barEl.id = `keywords-bar-${inputId}`;

      const pillsHtml = config.keywords.map((kw, idx) => {
        return `<span class="kw-pill missing" data-kw-index="${idx}">⏳ ${kw.text}</span>`;
      }).join(' ');

      barEl.innerHTML = `<span class="kw-bar-label">🔑 Target Key Words:</span>${pillsHtml}`;

      inputEl.parentNode.insertBefore(barEl, inputEl.nextSibling);
    }

    inputEl.addEventListener('input', () => {
      updateKeywordsForInput(inputId);
    });

    updateKeywordsForInput(inputId);
  }
}

function updateKeywordsForInput(inputId) {
  const inputEl = document.getElementById(inputId);
  const config = socraticConfig[inputId];
  if (!inputEl || !config) return;

  const userTextLower = inputEl.value.trim().toLowerCase();
  const barEl = document.getElementById(`keywords-bar-${inputId}`);

  if (barEl) {
    const pills = barEl.querySelectorAll('.kw-pill');
    pills.forEach((pill, idx) => {
      const kw = config.keywords[idx];
      if (!kw) return;
      const isPresent = kw.aliases.some(alias => userTextLower.includes(alias.toLowerCase()));
      if (isPresent) {
        pill.className = 'kw-pill highlight-active';
        pill.innerHTML = `✨ ✓ ${kw.text}`;
      } else {
        pill.className = 'kw-pill missing';
        pill.innerHTML = `⏳ ${kw.text}`;
      }
    });
  }

  let panelId = inputId.replace('input-', 'socratic-');
  const panelEl = document.getElementById(panelId);
  if (panelEl && !panelEl.classList.contains('hidden')) {
    renderSocraticPanelContent(inputId, panelEl);
  }
}

function getHighlightedText(userText, keywords) {
  if (!userText || !userText.trim()) {
    return '<em>No response written yet. Type your answer in the box above!</em>';
  }

  let allAliases = [];
  keywords.forEach(kw => {
    kw.aliases.forEach(alias => {
      allAliases.push(alias);
    });
  });

  allAliases.sort((a, b) => b.length - a.length);
  const escaped = allAliases.map(a => a.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'));

  if (escaped.length === 0) return escapeHtml(userText);

  try {
    const regex = new RegExp(`(${escaped.join('|')})`, 'gi');
    const sanitizedText = escapeHtml(userText);
    return sanitizedText.replace(regex, '<mark class="kw-highlight">$1</mark>');
  } catch (e) {
    return escapeHtml(userText);
  }
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function renderSocraticPanelContent(inputId, panelEl) {
  const inputEl = document.getElementById(inputId);
  const config = socraticConfig[inputId];
  if (!inputEl || !config) return;

  const userText = inputEl.value;
  const userTextLower = userText.trim().toLowerCase();

  let foundCount = 0;
  const keywordBadgesHtml = config.keywords.map(kw => {
    const isPresent = kw.aliases.some(alias => userTextLower.includes(alias.toLowerCase()));
    if (isPresent) {
      foundCount++;
      return `<span class="kw-pill highlight-active">✨ ✓ ${kw.text}</span>`;
    } else {
      return `<span class="kw-pill missing">⏳ ${kw.text}</span>`;
    }
  }).join(' ');

  const highlightedAnswerHtml = getHighlightedText(userText, config.keywords);

  let statusMsg = "";
  if (foundCount === config.keywords.length) {
    statusMsg = "🌟 <strong>Outstanding Scientific Reasoning!</strong> You included all target key words!";
  } else if (foundCount > 0) {
    statusMsg = `👍 <strong>Great Progress!</strong> You have included ${foundCount} of ${config.keywords.length} target key words. Add the pending words below to complete your answer.`;
  } else {
    statusMsg = "💡 <strong>Let's Think Together!</strong> Use the Socratic guide and target key words to frame your answer.";
  }

  panelEl.innerHTML = `
    <div class="socratic-prompt">
      <span class="socratic-prompt-icon">🤔</span>
      <div>
        <p><strong>Socratic Thinking Guide:</strong> ${config.prompt}</p>
        <p class="mt-2">${statusMsg}</p>
      </div>
    </div>

    <div class="mb-2">
      <strong style="font-size: 0.82rem; color: #e9d5ff;">Target Key Words Progress (${foundCount}/${config.keywords.length}):</strong>
      <div class="keywords-checklist mt-1">
        ${keywordBadgesHtml}
      </div>
    </div>

    <div class="live-answer-preview">
      <div class="preview-header">📝 Your Answer (Live Keyword Highlights):</div>
      <div>${highlightedAnswerHtml}</div>
    </div>

    <div class="scaffold-starter-box mt-3">
      <div><strong>Sentence Starter Guide:</strong> "${config.starter}"</div>
      <button class="btn-use-starter" data-input-target="${inputId}">📋 Click to Insert Sentence Starter</button>
    </div>
  `;

  const starterBtn = panelEl.querySelector('.btn-use-starter');
  if (starterBtn) {
    starterBtn.addEventListener('click', () => {
      inputEl.value = config.starter;
      inputEl.focus();
      updateKeywordsForInput(inputId);
      renderSocraticPanelContent(inputId, panelEl);
    });
  }
}

function evaluateSocraticAnswer(inputId) {
  const inputEl = document.getElementById(inputId);
  let panelId = inputId.replace('input-', 'socratic-');
  const panelEl = document.getElementById(panelId);
  if (!inputEl || !panelEl) return;

  panelEl.classList.remove('hidden');
  renderSocraticPanelContent(inputId, panelEl);

  panelEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function evaluateTable45Socratic() {
  evaluateSocraticAnswer('input-4-5-diff-plant-tubes');
}

function evaluateQ9Socratic() {
  const panel = document.getElementById('socratic-4-6-9');
  if (!panel) return;
  panel.classList.remove('hidden');

  const input9a = document.getElementById('input-4-6-9a');
  const input9b = document.getElementById('input-4-6-9b');
  const input9c = document.getElementById('input-4-6-9c');
  const input9d = document.getElementById('input-4-6-9d');

  const val9a = (input9a?.value || '').trim().toLowerCase();
  const val9b = (input9b?.value || '').trim().toLowerCase();
  const text9c = input9c?.value || '';
  const text9d = input9d?.value || '';

  const is9aCorrect = val9a.includes('jump');
  const is9bCorrect = val9b.includes('sit') || val9b.includes('rest');

  if (input9a) input9a.style.borderColor = is9aCorrect ? 'var(--success-green)' : 'var(--danger-red)';
  if (input9b) input9b.style.borderColor = is9bCorrect ? 'var(--success-green)' : 'var(--danger-red)';

  const config9c = socraticConfig['input-4-6-9c'];
  const text9cLower = text9c.toLowerCase();
  let kwCount9c = 0;
  if (config9c) {
    config9c.keywords.forEach(kw => {
      if (kw.aliases.some(a => text9cLower.includes(a.toLowerCase()))) kwCount9c++;
    });
  }

  const config9d = socraticConfig['input-4-6-9d'];
  const text9dLower = text9d.toLowerCase();
  let kwCount9d = 0;
  if (config9d) {
    config9d.keywords.forEach(kw => {
      if (kw.aliases.some(a => text9dLower.includes(a.toLowerCase()))) kwCount9d++;
    });
  }

  let html9a = is9aCorrect 
    ? `<div class="sub-eval correct">✨ <strong>a) Highest Heart Rate:</strong> Correct! <em>Doing 15 Jumps</em> resulted in the highest heart rate (132 BPM).</div>`
    : `<div class="sub-eval incorrect">💡 <strong>a) Highest Heart Rate:</strong> Check your lab timer measurements! Which exercise caused the heart to beat fastest at 132 BPM? <strong>(Answer: Doing 15 Jumps)</strong></div>`;

  let html9b = is9bCorrect 
    ? `<div class="sub-eval correct">✨ <strong>b) Lowest Heart Rate:</strong> Correct! <em>Sitting (Resting)</em> resulted in the lowest heart rate (72 BPM).</div>`
    : `<div class="sub-eval incorrect">💡 <strong>b) Lowest Heart Rate:</strong> Check your lab timer measurements! Which activity had the lowest heart rate at 72 BPM? <strong>(Answer: Sitting)</strong></div>`;

  let html9c = (config9c && kwCount9c === config9c.keywords.length)
    ? `<div class="sub-eval correct">✨ <strong>c) Relationship:</strong> Excellent! You accurately stated how heart rate changes with exercise vigor.</div>`
    : `<div class="sub-eval guidance">💡 <strong>c) Relationship Hint:</strong> "As activity becomes <strong>more vigorous</strong>, the heart rate <strong>increases / becomes higher</strong>."</div>`;

  const highlighted9d = config9d ? getHighlightedText(text9d, config9d.keywords) : escapeHtml(text9d);
  let statusMsg9d = "";
  if (config9d) {
    if (kwCount9d === config9d.keywords.length) {
      statusMsg9d = `✨ <strong>d) Explanation:</strong> Outstanding scientific explanation! You included all ${config9d.keywords.length} target key concepts.`;
    } else {
      statusMsg9d = `💡 <strong>d) Explanation Coaching (${kwCount9d}/${config9d.keywords.length} keywords included):</strong> Explain why muscles need more blood during exercise (to transport more <strong>oxygen</strong> and <strong>digested food</strong> to <strong>different parts of the body</strong>).`;
    }
  }

  panel.innerHTML = `
    <div class="socratic-feedback-header">📊 <strong>Question 9 Guidance & Corrections:</strong></div>
    ${html9a}
    ${html9b}
    ${html9c}
    <div class="sub-eval ${kwCount9d === (config9d?.keywords.length || 0) ? 'correct' : 'guidance'}">
      <div>${statusMsg9d}</div>
      <div class="live-answer-preview mt-2">
        <div class="preview-header">📝 Your Explanation (Live Keyword Highlights):</div>
        <div>${highlighted9d}</div>
      </div>
      <div class="scaffold-starter-box mt-2">
        <div><strong>Sentence Starter Guide:</strong> "${config9d ? config9d.starter : ''}"</div>
        <button class="btn-use-starter" data-input-target="input-4-6-9d">📋 Insert Sentence Starter into 9d</button>
      </div>
    </div>
  `;

  const starterBtn = panel.querySelector('.btn-use-starter');
  if (starterBtn) {
    starterBtn.addEventListener('click', () => {
      const inputEl = document.getElementById('input-4-6-9d');
      if (inputEl && config9d) {
        inputEl.value = config9d.starter;
        inputEl.focus();
        updateKeywordsForInput('input-4-6-9d');
        evaluateQ9Socratic();
      }
    });
  }

  panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function evaluateQ10Socratic() {
  const panel = document.getElementById('socratic-4-6-10');
  if (!panel) return;
  panel.classList.remove('hidden');

  const input10a = document.getElementById('input-4-6-10a');
  const input10b = document.getElementById('input-4-6-10b');
  const input10c = document.getElementById('input-4-6-10c');
  const input10d = document.getElementById('input-4-6-10d');

  const val10a = (input10a?.value || '').trim().toLowerCase();
  const val10b = (input10b?.value || '').trim().toLowerCase();
  const text10c = input10c?.value || '';
  const text10d = input10d?.value || '';

  const is10aCorrect = val10a.includes('jump');
  const is10bCorrect = val10b.includes('sit') || val10b.includes('rest');

  if (input10a) input10a.style.borderColor = is10aCorrect ? 'var(--success-green)' : 'var(--danger-red)';
  if (input10b) input10b.style.borderColor = is10bCorrect ? 'var(--success-green)' : 'var(--danger-red)';

  const config10c = socraticConfig['input-4-6-10c'];
  const text10cLower = text10c.toLowerCase();
  let kwCount10c = 0;
  if (config10c) {
    config10c.keywords.forEach(kw => {
      if (kw.aliases.some(a => text10cLower.includes(a.toLowerCase()))) kwCount10c++;
    });
  }

  const config10d = socraticConfig['input-4-6-10d'];
  const text10dLower = text10d.toLowerCase();
  let kwCount10d = 0;
  if (config10d) {
    config10d.keywords.forEach(kw => {
      if (kw.aliases.some(a => text10dLower.includes(a.toLowerCase()))) kwCount10d++;
    });
  }

  let html10a = is10aCorrect 
    ? `<div class="sub-eval correct">✨ <strong>a) Highest Breathing Rate:</strong> Correct! <em>Doing 15 Jumps</em> resulted in the highest breathing rate (36 breaths/min).</div>`
    : `<div class="sub-eval incorrect">💡 <strong>a) Highest Breathing Rate:</strong> Check your lab timer measurements! Which exercise caused breathing to be fastest at 36 breaths/min? <strong>(Answer: Doing 15 Jumps)</strong></div>`;

  let html10b = is10bCorrect 
    ? `<div class="sub-eval correct">✨ <strong>b) Lowest Breathing Rate:</strong> Correct! <em>Sitting (Resting)</em> resulted in the lowest breathing rate (16 breaths/min).</div>`
    : `<div class="sub-eval incorrect">💡 <strong>b) Lowest Breathing Rate:</strong> Check your lab timer measurements! Which activity had the lowest breathing rate at 16 breaths/min? <strong>(Answer: Sitting)</strong></div>`;

  let html10c = (config10c && kwCount10c === config10c.keywords.length)
    ? `<div class="sub-eval correct">✨ <strong>c) Relationship:</strong> Excellent! You accurately stated how breathing rate changes with exercise vigor.</div>`
    : `<div class="sub-eval guidance">💡 <strong>c) Relationship Hint:</strong> "As activity becomes <strong>more vigorous</strong>, the breathing rate <strong>increases / becomes higher</strong>."</div>`;

  const highlighted10d = config10d ? getHighlightedText(text10d, config10d.keywords) : escapeHtml(text10d);
  let statusMsg10d = "";
  if (config10d) {
    if (kwCount10d === config10d.keywords.length) {
      statusMsg10d = `✨ <strong>d) Explanation:</strong> Outstanding scientific explanation! You included all ${config10d.keywords.length} target key concepts.`;
    } else {
      statusMsg10d = `💡 <strong>d) Explanation Coaching (${kwCount10d}/${config10d.keywords.length} keywords included):</strong> Explain gaseous exchange during exercise (to take in <strong>more oxygen</strong> and give out <strong>more carbon dioxide</strong>).`;
    }
  }

  panel.innerHTML = `
    <div class="socratic-feedback-header">📊 <strong>Question 10 Guidance & Corrections:</strong></div>
    ${html10a}
    ${html10b}
    ${html10c}
    <div class="sub-eval ${kwCount10d === (config10d?.keywords.length || 0) ? 'correct' : 'guidance'}">
      <div>${statusMsg10d}</div>
      <div class="live-answer-preview mt-2">
        <div class="preview-header">📝 Your Explanation (Live Keyword Highlights):</div>
        <div>${highlighted10d}</div>
      </div>
      <div class="scaffold-starter-box mt-2">
        <div><strong>Sentence Starter Guide:</strong> "${config10d ? config10d.starter : ''}"</div>
        <button class="btn-use-starter" data-input-target="input-4-6-10d">📋 Insert Sentence Starter into 10d</button>
      </div>
    </div>
  `;

  const starterBtn = panel.querySelector('.btn-use-starter');
  if (starterBtn) {
    starterBtn.addEventListener('click', () => {
      const inputEl = document.getElementById('input-4-6-10d');
      if (inputEl && config10d) {
        inputEl.value = config10d.starter;
        inputEl.focus();
        updateKeywordsForInput('input-4-6-10d');
        evaluateQ10Socratic();
      }
    });
  }

  panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function evaluatePartBSocratic() {
  const panel = document.getElementById('socratic-4-6-partB');
  if (!panel) return;
  panel.classList.remove('hidden');

  const systems = [
    { id: 'input-4-6-resp', title: 'Respiratory System' },
    { id: 'input-4-6-circ', title: 'Circulatory System' },
    { id: 'input-4-6-dig', title: 'Digestive System' },
    { id: 'input-4-6-skel', title: 'Skeletal & Muscular Systems' }
  ];

  let blocksHtml = systems.map(sys => {
    const inputEl = document.getElementById(sys.id);
    const text = inputEl ? inputEl.value : '';
    const config = socraticConfig[sys.id];
    if (!config) return '';

    const textLower = text.trim().toLowerCase();
    let count = 0;
    config.keywords.forEach(kw => {
      if (kw.aliases.some(a => textLower.includes(a.toLowerCase()))) count++;
    });

    const isComplete = count === config.keywords.length;
    const highlightedText = getHighlightedText(text, config.keywords);

    return `
      <div class="sub-eval ${isComplete ? 'correct' : 'guidance'}">
        <div><strong>${sys.title}:</strong> ${isComplete ? '✨ Complete!' : `💡 ${count}/${config.keywords.length} keywords included`}</div>
        <div class="live-answer-preview mt-1">
          <div>${highlightedText}</div>
        </div>
        <div class="scaffold-starter-box mt-1">
          <div><em>Sentence Starter:</em> "${config.starter}"</div>
        </div>
      </div>
    `;
  }).join('');

  panel.innerHTML = `
    <div class="socratic-feedback-header">📊 <strong>Body System Functions Evaluation:</strong></div>
    ${blocksHtml}
  `;

  panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}


function checkBlanksGroup(blanksMap, panelId) {
  let allCorrect = true;
  let missing = 0;

  for (let id in blanksMap) {
    const inputEl = document.getElementById(id);
    if (!inputEl) continue;
    const val = inputEl.value.trim().toLowerCase();
    const validOpts = blanksMap[id];

    if (validOpts.some(opt => val.includes(opt))) {
      inputEl.style.borderColor = 'var(--success-green)';
    } else {
      inputEl.style.borderColor = 'var(--danger-red)';
      allCorrect = false;
      missing++;
    }
  }

  const panel = document.getElementById(panelId);
  if (!panel) return;
  panel.classList.remove('hidden');

  if (allCorrect) {
    panel.innerHTML = `
      <div class="socratic-prompt">
        <span class="socratic-prompt-icon">🎉</span>
        <div><strong>All blanks filled correctly!</strong> You have mastered the conclusion concepts.</div>
      </div>
    `;
  } else {
    panel.innerHTML = `
      <div class="socratic-prompt">
        <span class="socratic-prompt-icon">💡</span>
        <div><strong>Check your inputs:</strong> ${missing} blank(s) highlighted in red need attention. Re-read the sentence context!</div>
      </div>
    `;
  }
}

/* ==================== VIRTUAL LAB EXPERIMENT 4.6 ==================== */
function initVirtualExperiment() {
  const expBtns = document.querySelectorAll('.exp-act-btn');
  const dispHeart = document.getElementById('disp-heart-rate');
  const dispBreath = document.getElementById('disp-breath-rate');
  const dispTimer = document.getElementById('disp-timer');
  const btnStart = document.getElementById('btn-start-exp');
  const iconHeart = document.getElementById('icon-heart-anim');
  const iconBreath = document.getElementById('icon-breath-anim');
  const dispHeart15s = document.getElementById('disp-heart-15s');
  const dispBreath15s = document.getElementById('disp-breath-15s');
  const cardHeart = document.getElementById('card-heart-metric');
  const cardBreath = document.getElementById('card-breath-metric');
  const bannerResult = document.getElementById('exp-result-banner');
  const textResult = document.getElementById('exp-result-text');

  const expData = {
    sitting: {
      name: 'Sitting (Resting)',
      heart: 72,
      breath: 16,
      heart15s: 18,
      breath15s: 4,
      heartSpeed: '0.83s',
      breathSpeed: '3.75s'
    },
    marching: {
      name: 'Marching on the Spot',
      heart: 96,
      breath: 24,
      heart15s: 24,
      breath15s: 6,
      heartSpeed: '0.625s',
      breathSpeed: '2.5s'
    },
    jumping: {
      name: 'Doing 15 Jumps',
      heart: 132,
      breath: 36,
      heart15s: 33,
      breath15s: 9,
      heartSpeed: '0.45s',
      breathSpeed: '1.66s'
    }
  };

  let currentAct = 'sitting';

  function applyActivityData(actKey) {
    const data = expData[actKey];
    if (!data) return;

    dispHeart.textContent = data.heart;
    dispBreath.textContent = data.breath;
    dispHeart15s.textContent = `${data.heart15s} beats in 15 seconds`;
    dispBreath15s.textContent = `${data.breath15s} breaths in 15 seconds`;

    // Dynamically adjust CSS animation pulse speed!
    if (iconHeart) iconHeart.style.animationDuration = data.heartSpeed;
    if (iconBreath) iconBreath.style.animationDuration = data.breathSpeed;
  }

  expBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      expBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentAct = btn.getAttribute('data-activity');
      applyActivityData(currentAct);
    });
  });

  // Apply initial sitting data & animation speeds
  applyActivityData('sitting');

  let timerInterval = null;
  btnStart.addEventListener('click', () => {
    let secondsLeft = 15;
    btnStart.disabled = true;
    dispTimer.textContent = `${secondsLeft}s`;

    if (cardHeart) cardHeart.classList.add('testing-active');
    if (cardBreath) cardBreath.classList.add('testing-active');
    if (bannerResult) bannerResult.classList.add('hidden');

    const data = expData[currentAct];

    if (timerInterval) clearInterval(timerInterval);

    timerInterval = setInterval(() => {
      secondsLeft--;
      dispTimer.textContent = `${secondsLeft}s`;

      const elapsed = 15 - secondsLeft;
      const liveHeartCount = Math.round((elapsed / 15) * data.heart15s);
      const liveBreathCount = Math.round((elapsed / 15) * data.breath15s);

      dispHeart15s.textContent = `${liveHeartCount} / ${data.heart15s} beats counted`;
      dispBreath15s.textContent = `${liveBreathCount} / ${data.breath15s} breaths counted`;

      if (secondsLeft <= 0) {
        clearInterval(timerInterval);
        btnStart.disabled = false;
        dispTimer.textContent = '15s Complete! ✅';

        if (cardHeart) cardHeart.classList.remove('testing-active');
        if (cardBreath) cardBreath.classList.remove('testing-active');

        dispHeart15s.textContent = `${data.heart15s} beats in 15 seconds`;
        dispBreath15s.textContent = `${data.breath15s} breaths in 15 seconds`;

        if (bannerResult && textResult) {
          bannerResult.classList.remove('hidden');
          textResult.innerHTML = `
            🎉 <strong>15-Second Test Complete for ${data.name}!</strong><br>
            • <strong>Heartbeat Count in 15s:</strong> ${data.heart15s} beats (Heart Rate = ${data.heart} BPM)<br>
            • <strong>Breathing Count in 15s:</strong> ${data.breath15s} breaths (Breathing Rate = ${data.breath} breaths/min)<br>
            💡 <em>Scientific Conclusion: More vigorous activity (Jumping &gt; Marching &gt; Sitting) increases both heart rate and breathing rate to supply more oxygen and digested food to active muscles!</em>
          `;
          bannerResult.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }
    }, 1000);
  });
}

/* ==================== COMIC FLIPBOOK CREATOR 4.7 ==================== */
/* ==================== COMIC FLIPBOOK CREATOR 4.7 ==================== */
function initComicFlipbook47() {
  const avatars = {
    pip: { name: 'Pip the Fox', icon: '🦊', role: 'Energetic Oxygen Blood Hero', desc: 'Arterial Blood Drop rich in O₂ & digested food' },
    flipper: { name: 'Flipper the Dolphin', icon: '🐬', role: 'Cool Venous Swimmer', desc: 'Swims Carbon Dioxide back to the Lungs' },
    ollie: { name: 'Ollie the Owl', icon: '🦉', role: 'Wise Scientist Guide', desc: 'Explores the Circulatory Pathways' },
    joey: { name: 'Joey the Kangaroo', icon: '🦘', role: 'Super Jumper', desc: 'Delivers oxygen to active muscles' }
  };

  const pagesConfig = {
    '1': {
      title: 'Page 1: Leaving the Heart (Engine Room)',
      counter: 'Scene 1 of 5',
      presets: [
        `"I am pumped out of the heart! I am rich in oxygen and digested food, heading to the body."`,
        `"Whoosh! The left side of the heart just squeezed me into blood vessels with high oxygen levels!"`,
        `"Destination: Body parts! Carrying digested food and oxygen to active muscles."`
      ],
      keywords: [
        { text: 'pumped by heart', aliases: ['pumped', 'heart', 'pump'] },
        { text: 'rich in oxygen & food', aliases: ['oxygen', 'digested food', 'food'] },
        { text: 'heading to body', aliases: ['body', 'body parts', 'vessels'] }
      ]
    },
    '2': {
      title: 'Page 2: Delivery Highway (Body Capillaries)',
      counter: 'Scene 2 of 5',
      presets: [
        `"Arrived at muscle cells! I release oxygen and digested food into the cells."`,
        `"Body cells absorb oxygen and food, then pass carbon dioxide and waste into me."`,
        `"Exchange complete! I am now carrying carbon dioxide and waste back."`
      ],
      keywords: [
        { text: 'deliver oxygen & food', aliases: ['oxygen', 'digested food', 'deliver', 'food'] },
        { text: 'body cells take in', aliases: ['body cells', 'cells', 'take in'] },
        { text: 'receive carbon dioxide', aliases: ['carbon dioxide', 'co2', 'waste'] }
      ]
    },
    '3': {
      title: 'Page 3: Returning to the Heart',
      counter: 'Scene 3 of 5',
      presets: [
        `"Flowing through veins back to the right side of the heart, loaded with carbon dioxide."`,
        `"The right side of the heart receives me and prepares to pump me to the lungs!"`,
        `"Back home at the heart! Next stop: the lungs for gaseous exchange."`
      ],
      keywords: [
        { text: 'flow through veins', aliases: ['veins', 'blood vessels', 'vessels'] },
        { text: 'carry carbon dioxide', aliases: ['carbon dioxide', 'co2'] },
        { text: 'return to heart', aliases: ['return', 'heart', 'right side'] }
      ]
    },
    '4': {
      title: 'Page 4: Refueling Station (Lungs Exchange)',
      counter: 'Scene 4 of 5',
      presets: [
        `"At the lungs! I give out carbon dioxide to be exhaled and take in fresh oxygen."`,
        `"Gaseous exchange! Carbon dioxide out, oxygen in! Now I am oxygen-rich again."`,
        `"Breathing out CO₂ and breathing in O₂! Loaded with fresh oxygen!"`
      ],
      keywords: [
        { text: 'at the lungs', aliases: ['lungs', 'alveoli'] },
        { text: 'give out carbon dioxide', aliases: ['give out carbon dioxide', 'exhale', 'co2'] },
        { text: 'take in fresh oxygen', aliases: ['take in oxygen', 'fresh oxygen', 'oxygen'] }
      ]
    },
    '5': {
      title: 'Page 5: Ready for Next Mission!',
      counter: 'Scene 5 of 5',
      presets: [
        `"Returned to the left side of the heart! Ready to be pumped all over the body again."`,
        `"The continuous circulatory cycle never stops! Keeping the body alive and energetic!"`,
        `"Mission accomplished! Rich in oxygen, ready for the next heartbeat!"`
      ],
      keywords: [
        { text: 'return to left heart', aliases: ['left side', 'heart', 'return'] },
        { text: 'continuous cycle', aliases: ['continuous', 'cycle', 'circulatory system'] },
        { text: 'keeps body alive', aliases: ['alive', 'survival', 'survive', 'energetic'] }
      ]
    }
  };

  let selectedAvatar = 'pip';
  let avatarChosen = false;
  let currentPage = '1';
  let pageModes = { '1': 'preset', '2': 'preset', '3': 'preset', '4': 'preset', '5': 'preset' };
  let pageTexts = {
    '1': pagesConfig['1'].presets[0],
    '2': pagesConfig['2'].presets[0],
    '3': pagesConfig['3'].presets[0],
    '4': pagesConfig['4'].presets[0],
    '5': pagesConfig['5'].presets[0]
  };
  let pageStickers = {
    '1': ['O2', 'Food'],
    '2': ['CO2', 'Waste'],
    '3': ['CO2'],
    '4': ['O2', 'CO2'],
    '5': ['O2', 'Food']
  };

  const avatarGrid = document.getElementById('avatar-grid');
  const avatarSelectHeader = document.getElementById('avatar-select-header');
  const avatarChosenBanner = document.getElementById('avatar-chosen-banner');
  const chosenAvatarIcon = document.getElementById('chosen-avatar-icon');
  const chosenAvatarName = document.getElementById('chosen-avatar-name');
  const chosenAvatarDesc = document.getElementById('chosen-avatar-desc');
  const btnChangeAvatar = document.getElementById('btn-change-avatar');

  const avatarCards = document.querySelectorAll('.avatar-card');
  const pagePills = document.querySelectorAll('.page-pill');
  const btnPrev = document.getElementById('btn-flip-prev');
  const btnNext = document.getElementById('btn-flip-next');
  const sceneTitle = document.getElementById('scene-title-badge');
  const sceneCounter = document.getElementById('scene-counter');
  const stageAvatarIcon = document.getElementById('stage-avatar-icon');
  const stageAvatarLabel = document.getElementById('stage-avatar-label');
  const stageSpeechBubble = document.getElementById('stage-speech-bubble');
  const stageStickersLayer = document.getElementById('stage-stickers-layer');
  const btnStickers = document.querySelectorAll('.btn-sticker[data-sticker]');
  const btnClearStickers = document.getElementById('btn-clear-stickers');
  const modePageNum = document.getElementById('mode-page-num');
  const btnModePreset = document.getElementById('btn-mode-preset');
  const btnModeFreetext = document.getElementById('btn-mode-freetext');
  const presetChipsBox = document.getElementById('preset-chips-box');
  const presetChipsList = document.getElementById('preset-chips-list');
  const inputDialogue = document.getElementById('input-comic-dialogue');
  const comicKeywordsBar = document.getElementById('comic-keywords-bar');
  const btnReadStorybook = document.getElementById('btn-read-storybook');
  const modalStorybook = document.getElementById('storybook-modal');
  const modalBody = document.getElementById('storybook-modal-body');
  const btnCloseStorybook = document.getElementById('btn-close-storybook');
  const btnCloseStorybook2 = document.getElementById('btn-close-storybook-2');

  function updateAvatarDisplay() {
    const av = avatars[selectedAvatar];
    if (!av) return;

    if (avatarChosen) {
      if (avatarGrid) avatarGrid.style.display = 'none';
      if (avatarSelectHeader) avatarSelectHeader.style.display = 'none';
      if (avatarChosenBanner) avatarChosenBanner.classList.remove('hidden');
      if (chosenAvatarIcon) chosenAvatarIcon.textContent = av.icon;
      if (chosenAvatarName) chosenAvatarName.textContent = av.name;
      if (chosenAvatarDesc) chosenAvatarDesc.textContent = `${av.role} • ${av.desc}`;
    } else {
      if (avatarGrid) avatarGrid.style.display = 'grid';
      if (avatarSelectHeader) avatarSelectHeader.style.display = 'block';
      if (avatarChosenBanner) avatarChosenBanner.classList.add('hidden');
    }
  }

  function renderPage() {
    const config = pagesConfig[currentPage];
    const av = avatars[selectedAvatar];

    if (sceneTitle) sceneTitle.textContent = config.title;
    if (sceneCounter) sceneCounter.textContent = config.counter;
    if (modePageNum) modePageNum.textContent = currentPage;

    pagePills.forEach(p => {
      p.classList.toggle('active', p.getAttribute('data-page') === currentPage);
    });

    if (stageAvatarIcon) stageAvatarIcon.textContent = av.icon;
    if (stageAvatarLabel) stageAvatarLabel.textContent = `${av.name} (${av.role})`;

    const text = pageTexts[currentPage] || '';
    if (stageSpeechBubble) stageSpeechBubble.textContent = text ? text : 'Click a preset prompt or write your dialogue below!';
    if (inputDialogue) inputDialogue.value = text;

    renderStickers();

    const mode = pageModes[currentPage] || 'preset';
    if (btnModePreset) btnModePreset.classList.toggle('active', mode === 'preset');
    if (btnModeFreetext) btnModeFreetext.classList.toggle('active', mode === 'freetext');

    if (mode === 'preset') {
      if (presetChipsBox) presetChipsBox.style.display = 'block';
    } else {
      if (presetChipsBox) presetChipsBox.style.display = 'none';
    }

    renderPresetChips();
    updateKeywordsBar();
    updateAvatarDisplay();
  }

  function renderStickers() {
    if (!stageStickersLayer) return;
    const stickers = pageStickers[currentPage] || [];
    const labels = {
      'O2': '🔴 Oxygen (O₂)',
      'Food': '🍞 Digested Food',
      'CO2': '🔵 Carbon Dioxide (CO₂)',
      'Waste': '💨 Waste Products'
    };
    stageStickersLayer.innerHTML = stickers.map(s => `<span class="stage-sticker-badge">${labels[s] || s}</span>`).join(' ');

    btnStickers.forEach(btn => {
      const stKey = btn.getAttribute('data-sticker');
      btn.classList.toggle('active', stickers.includes(stKey));
    });
  }

  function renderPresetChips() {
    if (!presetChipsList) return;
    const config = pagesConfig[currentPage];
    presetChipsList.innerHTML = config.presets.map(p => `
      <div class="preset-chip" data-preset="${escapeHtml(p)}">💡 ${escapeHtml(p)}</div>
    `).join('');

    presetChipsList.querySelectorAll('.preset-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const text = chip.getAttribute('data-preset');
        pageTexts[currentPage] = text;
        if (inputDialogue) inputDialogue.value = text;
        if (stageSpeechBubble) stageSpeechBubble.textContent = text;
        updateKeywordsBar();
      });
    });
  }

  function updateKeywordsBar() {
    if (!comicKeywordsBar) return;
    const config = pagesConfig[currentPage];
    const currentTextLower = (pageTexts[currentPage] || '').toLowerCase();

    let foundCount = 0;
    const pillsHtml = config.keywords.map(kw => {
      const isPresent = kw.aliases.some(alias => currentTextLower.includes(alias.toLowerCase()));
      if (isPresent) {
        foundCount++;
        return `<span class="kw-pill highlight-active">✨ ✓ ${kw.text}</span>`;
      } else {
        return `<span class="kw-pill missing">⏳ ${kw.text}</span>`;
      }
    }).join(' ');

    comicKeywordsBar.innerHTML = `<span class="kw-bar-label">🔑 Target Key Words (${foundCount}/${config.keywords.length}):</span> ${pillsHtml}`;
  }

  avatarCards.forEach(card => {
    card.addEventListener('click', () => {
      avatarCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      selectedAvatar = card.getAttribute('data-avatar');
      avatarChosen = true;
      updateAvatarDisplay();
      renderPage();
    });
  });

  if (btnChangeAvatar) {
    btnChangeAvatar.addEventListener('click', () => {
      avatarChosen = false;
      updateAvatarDisplay();
    });
  }

  pagePills.forEach(pill => {
    pill.addEventListener('click', () => {
      currentPage = pill.getAttribute('data-page');
      renderPage();
    });
  });

  if (btnPrev) {
    btnPrev.addEventListener('click', () => {
      let pageNum = parseInt(currentPage, 10);
      if (pageNum > 1) {
        currentPage = String(pageNum - 1);
        renderPage();
      }
    });
  }

  if (btnNext) {
    btnNext.addEventListener('click', () => {
      let pageNum = parseInt(currentPage, 10);
      if (pageNum < 5) {
        currentPage = String(pageNum + 1);
        renderPage();
      }
    });
  }

  btnStickers.forEach(btn => {
    btn.addEventListener('click', () => {
      const st = btn.getAttribute('data-sticker');
      let currentStickers = pageStickers[currentPage] || [];
      if (currentStickers.includes(st)) {
        pageStickers[currentPage] = currentStickers.filter(s => s !== st);
      } else {
        if (!pageStickers[currentPage]) pageStickers[currentPage] = [];
        pageStickers[currentPage].push(st);
      }
      renderStickers();
    });
  });

  if (btnClearStickers) {
    btnClearStickers.addEventListener('click', () => {
      pageStickers[currentPage] = [];
      renderStickers();
    });
  }

  if (btnModePreset) {
    btnModePreset.addEventListener('click', () => {
      pageModes[currentPage] = 'preset';
      renderPage();
    });
  }

  if (btnModeFreetext) {
    btnModeFreetext.addEventListener('click', () => {
      pageModes[currentPage] = 'freetext';
      renderPage();
    });
  }

  if (inputDialogue) {
    inputDialogue.addEventListener('input', () => {
      pageTexts[currentPage] = inputDialogue.value;
      if (stageSpeechBubble) stageSpeechBubble.textContent = inputDialogue.value || 'Type your dialogue above...';
      updateKeywordsBar();
    });
  }

  if (btnReadStorybook && modalStorybook && modalBody) {
    btnReadStorybook.addEventListener('click', () => {
      const av = avatars[selectedAvatar];
      const labels = { 'O2': '🔴 O₂', 'Food': '🍞 Digested Food', 'CO2': '🔵 CO₂', 'Waste': '💨 Waste' };

      let panelsHtml = '';
      for (let p = 1; p <= 5; p++) {
        const pStr = String(p);
        const config = pagesConfig[pStr];
        const text = pageTexts[pStr] || 'No dialogue written yet.';
        const stickers = pageStickers[pStr] || [];
        const stickersBadges = stickers.map(s => `<span class="stage-sticker-badge">${labels[s] || s}</span>`).join(' ');

        panelsHtml += `
          <div class="story-card-panel">
            <div class="story-card-panel-header">${config.title}</div>
            <div class="comic-stage" style="min-height: auto;">
              <div class="stage-backdrop">
                <div class="stage-avatar-wrapper">
                  <span class="stage-avatar-icon">${av.icon}</span>
                  <span class="stage-avatar-label">${av.name}</span>
                </div>
                <div class="stage-speech-bubble">"${escapeHtml(text)}"</div>
                <div class="stage-stickers-layer">${stickersBadges}</div>
              </div>
            </div>
          </div>
        `;
      }

      modalBody.innerHTML = `
        <div style="text-align: center; margin-bottom: 1rem;">
          <h3>Author Hero: ${av.icon} <strong>${av.name}</strong> (${av.role})</h3>
          <p style="color: #d8b4fe; font-size: 0.9rem;">The Complete Circulation Journey Storybook</p>
        </div>
        ${panelsHtml}
      `;

      modalStorybook.classList.remove('hidden');
    });
  }

  if (btnCloseStorybook && modalStorybook) {
    btnCloseStorybook.addEventListener('click', () => modalStorybook.classList.add('hidden'));
  }
  if (btnCloseStorybook2 && modalStorybook) {
    btnCloseStorybook2.addEventListener('click', () => modalStorybook.classList.add('hidden'));
  }

  renderPage();
}

/* ==================== RUBRIC EVALUATOR ==================== */
function initRubricEvaluator() {
  document.getElementById('btn-calc-rubric').addEventListener('click', () => {
    const r1 = document.querySelector('input[name="rubric-row1"]:checked');
    const r2 = document.querySelector('input[name="rubric-row2"]:checked');
    const r3 = document.querySelector('input[name="rubric-row3"]:checked');

    const res = document.getElementById('rubric-result');

    if (!r1 || !r2 || !r3) {
      res.className = 'feedback-msg incorrect';
      res.innerHTML = '⚠️ Please select a rubric option for all 3 areas.';
      return;
    }

    const score = parseInt(r1.value) + parseInt(r2.value) + parseInt(r3.value);
    if (score === 9) {
      res.className = 'feedback-msg correct';
      res.innerHTML = '🌟 <strong>Got it! Excellent!</strong> You have fully mastered describing all 3 human systems, their functions, and how they work together for survival!';
    } else if (score >= 6) {
      res.className = 'feedback-msg correct';
      res.innerHTML = '👍 <strong>Getting there!</strong> Great job. Review the missing parts or functions to reach "Got it!"';
    } else {
      res.className = 'feedback-msg incorrect';
      res.innerHTML = '🌱 <strong>Just started.</strong> Keep practicing the story role-play and answer keys to build your understanding.';
    }
  });
}

/* ==================== QUIZ ENGINE (CHECK FOR UNDERSTANDING) ==================== */
function initQuizEngine() {
  document.getElementById('btn-submit-mcq').addEventListener('click', () => {
    const mcqAnswers = { mcq1: '4', mcq2: '2', mcq3: '1', mcq4: '1' };
    let score = 0;

    for (let q in mcqAnswers) {
      const selected = document.querySelector(`input[name="${q}"]:checked`);
      const fb = document.getElementById(`fb-${q}`);

      if (selected && selected.value === mcqAnswers[q]) {
        score++;
        fb.className = 'feedback-msg correct';
        fb.innerHTML = '✅ Correct!';
      } else {
        fb.className = 'feedback-msg incorrect';
        fb.innerHTML = `❌ Incorrect. Think carefully about how blood flows through the heart and organs.`;
      }
    }
  });

  document.getElementById('btn-check-sq5').addEventListener('click', () => {
    const sq5a = document.getElementById('input-sq5a').value.trim().toLowerCase();
    const sq5b = document.getElementById('input-sq5b').value.trim().toLowerCase();
    const panel = document.getElementById('socratic-sq5');
    panel.classList.remove('hidden');

    const hasCirc = sq5a.includes('circulatory');
    const hasDiff = sq5b.includes('same') || sq5b.includes('separate') || sq5b.includes('tube') || sq5b.includes('pump');

    panel.innerHTML = `
      <div class="socratic-prompt">
        <span class="socratic-prompt-icon">💡</span>
        <div>
          <p><strong>System X & Y Guidance:</strong> System X is the <strong>Circulatory System</strong>. For 5b, think about whether humans carry food and water in the <em>same tube (blood vessels)</em> while plants use <em>separate food and water tubes</em>.</p>
        </div>
      </div>
      <div class="keywords-checklist">
        ${hasCirc ? '<span class="keyword-tag included">✓ System X: Circulatory system</span>' : '<span class="keyword-tag missing">⏳ System X: Circulatory system</span>'}
        ${hasDiff ? '<span class="keyword-tag included">✓ Tube structure difference</span>' : '<span class="keyword-tag missing">⏳ Tube structure difference</span>'}
      </div>
    `;
  });

  document.getElementById('btn-check-sq6').addEventListener('click', () => {
    const sq6a = document.getElementById('input-sq6a').value.trim().toLowerCase();
    const sq6b = document.getElementById('input-sq6b').value.trim().toLowerCase();
    const sq6c = document.getElementById('input-sq6c').value.trim().toLowerCase();
    const panel = document.getElementById('socratic-sq6');
    panel.classList.remove('hidden');

    const hasRel = sq6a.includes('decreases') || sq6a.includes('decrease') || sq6a.includes('less');
    const hasCause = sq6b.includes('take in') || sq6b.includes('breathe') || sq6b.includes('oxygen');
    const hasLungs = sq6c.includes('lung');

    panel.innerHTML = `
      <div class="socratic-prompt">
        <span class="socratic-prompt-icon">🐟</span>
        <div>
          <p><strong>Goldfish & Human Respiratory Guidance:</strong> As more goldfish are added, what gas do they take in from water? Which human organ also takes in oxygen during gaseous exchange?</p>
        </div>
      </div>
      <div class="keywords-checklist">
        ${hasRel ? '<span class="keyword-tag included">✓ Relationship (decreases)</span>' : '<span class="keyword-tag missing">⏳ Relationship (decreases)</span>'}
        ${hasCause ? '<span class="keyword-tag included">✓ Cause (fish take in O₂)</span>' : '<span class="keyword-tag missing">⏳ Cause (fish take in O₂)</span>'}
        ${hasLungs ? '<span class="keyword-tag included">✓ Human organ: Lungs</span>' : '<span class="keyword-tag missing">⏳ Human organ: Lungs</span>'}
      </div>
    `;
  });
}
