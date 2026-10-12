// Stepped Wizard Workflow Manager (1. Ready & Brainstorm -> 2. Cluster -> 3. Mind Map)
import { store } from '../state/store.js';

export class WizardComponent {
  constructor() {
    this.steps = [
      { id: 1, sectionId: 'stepSection1', title: 'Brainstorm' },
      { id: 2, sectionId: 'stepSection2', title: 'Cluster' },
      { id: 3, sectionId: 'stepSection3', title: 'Mind Map' }
    ];

    this.navBtns = document.querySelectorAll('.wizard-step-tab');
    this.prevBtns = document.querySelectorAll('.wizard-prev-btn');
    this.nextBtns = document.querySelectorAll('.wizard-next-btn');
    this.buildMapBtn = document.getElementById('buildMapBtn');
    this.zenToggleBtn = document.getElementById('zenToggleBtn');
    this.workspaceCard = document.getElementById('stepSection3');

    this.init();
  }

  init() {
    this.navBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const stepNum = parseInt(btn.dataset.step, 10);
        this.goToStep(stepNum);
      });
    });

    this.prevBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.goToStep(store.state.currentStep - 1);
      });
    });

    this.nextBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.goToStep(store.state.currentStep + 1);
      });
    });

    if (this.buildMapBtn) {
      this.buildMapBtn.addEventListener('click', () => {
        store.buildMindMapFromClusters();
        this.goToStep(3);
      });
    }

    if (this.zenToggleBtn && this.workspaceCard) {
      this.zenToggleBtn.addEventListener('click', () => {
        const isZen = this.workspaceCard.classList.toggle('zen-mode');
        this.zenToggleBtn.textContent = isZen ? '↙ Exit Fullscreen' : '⛶ Fullscreen Canvas';
      });
    }

    this.updateUI();
  }

  goToStep(stepNum) {
    if (stepNum < 1 || stepNum > 3) return;
    store.state.currentStep = stepNum;
    store.persistDebounced();
    this.updateUI();

    // Scroll to active section smoothly
    const activeSection = document.getElementById(`stepSection${stepNum}`);
    if (activeSection) {
      activeSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  updateUI() {
    const cur = store.state.currentStep;

    this.navBtns.forEach(btn => {
      const stepNum = parseInt(btn.dataset.step, 10);
      btn.classList.toggle('is-active', stepNum === cur);
      btn.classList.toggle('is-completed', stepNum < cur);
    });

    this.steps.forEach(s => {
      const el = document.getElementById(s.sectionId);
      if (el) {
        if (s.id === cur) {
          el.classList.remove('hidden');
        } else {
          // Keep mind map visible if on step 3
          el.classList.add('hidden');
        }
      }
    });
  }
}
