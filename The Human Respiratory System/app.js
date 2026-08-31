// app.js - Core logic for Activity 4.3 Interactive Lesson

// State tracking
const state = {
  currentMission: 'home',
  completed: {
    plant: false,
    fish: false,
    human: false,
    compare: false,
    final: false,
  },
};

// DOM Helpers
function $(sel) { return document.querySelector(sel); }
function $$(sel) { return Array.from(document.querySelectorAll(sel)); }

// Progress bar handling
function updateProgress(step) {
  const steps = ['plant', 'fish', 'human', 'compare', 'final'];
  steps.forEach((s) => {
    const el = $(`#step-${s}`);
    if (!el) return;
    if (state.completed[s]) {
      el.className = 'step completed';
      el.innerHTML = `✔ ${s.charAt(0).toUpperCase() + s.slice(1)}`;
    } else if (s === step) {
      el.className = 'step active';
      el.textContent = s.charAt(0).toUpperCase() + s.slice(1);
    } else {
      el.className = 'step';
      el.textContent = s.charAt(0).toUpperCase() + s.slice(1);
    }
  });
}

// Show Screen
function showScreen(id) {
  $$('.screen').forEach(s => s.classList.remove('active'));
  const screen = $(`#${id}`);
  if (screen) {
    screen.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

// Video fallback renderer if missing file
function showVideoFallback(video) {
  if (!video || video.parentElement.querySelector('.video-placeholder')) return;
  const placeholder = document.createElement('div');
  placeholder.className = 'video-placeholder';
  const src = video.getAttribute('src');
  const filename = src ? src.split('/').pop() : 'video.mp4';
  placeholder.innerHTML = `
    <div class="placeholder-icon">🎬</div>
    <div class="placeholder-title">Observation Video</div>
    <div class="placeholder-filename"><code>${filename}</code></div>
    <div class="placeholder-note">Path: <code>${src}</code></div>
  `;
  video.style.display = 'none';
  video.parentNode.insertBefore(placeholder, video);
}

// Initialize video listeners
function initVideos() {
  $$('.video-player').forEach(video => {
    video.addEventListener('error', () => showVideoFallback(video));
    if (video.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) {
      showVideoFallback(video);
    }
  });
}

// Event Listeners Setup
document.addEventListener('DOMContentLoaded', () => {
  initVideos();

  // Home Start
  const startBtn = $('#start-btn');
  if (startBtn) {
    startBtn.addEventListener('click', () => {
      showScreen('mission-plant');
      updateProgress('plant');
    });
  }

  // Continue to question buttons in video sections
  $$('.next-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-next');
      const target = $(`#${targetId}`);
      if (target) {
        target.hidden = false;
        target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });
  });

  // MISSION 1: PLANT PART A
  const plantQaA = $('#plant-qa-a');
  if (plantQaA) {
    const feedbackBox = plantQaA.querySelector('.feedback-container');
    const feedbackMsg = plantQaA.querySelector('.feedback-msg');
    const modelAns = plantQaA.querySelector('.model-answer');
    const watchAgainBtn = plantQaA.querySelector('.watch-again-btn');

    plantQaA.querySelectorAll('.option-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const isCorrect = btn.getAttribute('data-correct') === 'true';
        feedbackBox.hidden = false;
        if (isCorrect) {
          feedbackMsg.textContent = 'Good observation!';
          feedbackMsg.className = 'feedback-msg correct';
          if (modelAns) modelAns.hidden = false;
          if (watchAgainBtn) watchAgainBtn.hidden = true;

          // Unlock Part B
          setTimeout(() => {
            const partB = $('#plant-part-b');
            if (partB) {
              partB.hidden = false;
              partB.scrollIntoView({ behavior: 'smooth' });
            }
          }, 600);
        } else {
          feedbackMsg.textContent = 'Look carefully at the surface of the leaf again.';
          feedbackMsg.className = 'feedback-msg incorrect';
          if (modelAns) modelAns.hidden = true;
          if (watchAgainBtn) watchAgainBtn.hidden = false;
        }
      });
    });

    if (watchAgainBtn) {
      watchAgainBtn.addEventListener('click', () => {
        const vid = $('#video-plant-a');
        if (vid) {
          vid.scrollIntoView({ behavior: 'smooth' });
          if (vid.currentTime) vid.currentTime = 0;
          vid.play().catch(() => {});
        }
      });
    }
  }

  // MISSION 1: PLANT PART B
  const plantQaB = $('#plant-qa-b');
  if (plantQaB) {
    const feedbackBox = plantQaB.querySelector('.feedback-container');
    const feedbackMsg = plantQaB.querySelector('.feedback-msg');

    plantQaB.querySelectorAll('.option-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const isCorrect = btn.getAttribute('data-correct') === 'true';
        feedbackBox.hidden = false;
        if (isCorrect) {
          feedbackMsg.textContent = 'Correct!';
          feedbackMsg.className = 'feedback-msg correct';
          const compB = $('#plant-completion-b');
          if (compB) {
            compB.hidden = false;
            compB.scrollIntoView({ behavior: 'smooth' });
          }
        } else {
          feedbackMsg.textContent = 'Look again.';
          feedbackMsg.className = 'feedback-msg incorrect';
        }
      });
    });
  }

  // Plant Sentence Check
  const plantSubmit = $('#plant-submit');
  if (plantSubmit) {
    plantSubmit.addEventListener('click', () => {
      const d1 = $('#plant-drop-1').value;
      const d2 = $('#plant-drop-2').value;
      const fb = $('#plant-final-feedback');
      if (d1 === 'surrounding' && d2 === 'tiny openings') {
        fb.textContent = 'Oxygen from the surrounding moves into the leaf through tiny openings.';
        fb.className = 'feedback-msg correct';
        fb.hidden = false;
        state.completed.plant = true;
        updateProgress('plant');
        $('#plant-mission-complete').hidden = false;
        $('#plant-mission-complete').scrollIntoView({ behavior: 'smooth' });
      } else {
        fb.textContent = 'Try again.';
        fb.className = 'feedback-msg incorrect';
        fb.hidden = false;
      }
    });
  }

  // Navigation to Fish
  const toFishBtn = $('#to-fish-btn');
  if (toFishBtn) {
    toFishBtn.addEventListener('click', () => {
      showScreen('mission-fish');
      updateProgress('fish');
    });
  }

  // MISSION 2: FISH PART A
  const fishQaA = $('#fish-qa-a');
  if (fishQaA) {
    const feedbackBox = fishQaA.querySelector('.feedback-container');
    const feedbackMsg = fishQaA.querySelector('.feedback-msg');

    fishQaA.querySelectorAll('.option-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const isCorrect = btn.getAttribute('data-correct') === 'true';
        feedbackBox.hidden = false;
        if (isCorrect) {
          feedbackMsg.textContent = 'Correct!';
          feedbackMsg.className = 'feedback-msg correct';
          setTimeout(() => {
            const partB = $('#fish-part-b');
            if (partB) {
              partB.hidden = false;
              partB.scrollIntoView({ behavior: 'smooth' });
            }
          }, 600);
        } else {
          feedbackMsg.textContent = 'Look again.';
          feedbackMsg.className = 'feedback-msg incorrect';
        }
      });
    });
  }

  // Fish Sentence Check
  const fishSubmit = $('#fish-submit');
  if (fishSubmit) {
    fishSubmit.addEventListener('click', () => {
      const val = $('#fish-select').value;
      const fb = $('#fish-final-feedback');
      if (val === 'gills') {
        fb.textContent = 'Oxygen in the water enters the fish through the gills.';
        fb.className = 'feedback-msg correct';
        fb.hidden = false;
        $('#fish-explanation').hidden = false;
        state.completed.fish = true;
        updateProgress('fish');
        $('#fish-mission-complete').hidden = false;
        $('#fish-mission-complete').scrollIntoView({ behavior: 'smooth' });
      } else {
        fb.textContent = 'Try again.';
        fb.className = 'feedback-msg incorrect';
        fb.hidden = false;
      }
    });
  }

  // Navigation to Human
  const toHumanBtn = $('#to-human-btn');
  if (toHumanBtn) {
    toHumanBtn.addEventListener('click', () => {
      showScreen('mission-human');
      updateProgress('human');
    });
  }

  // MISSION 3: HUMAN PART A
  const humanSubmitA = $('#human-submit-a');
  if (humanSubmitA) {
    humanSubmitA.addEventListener('click', () => {
      const val = $('#human-select-a').value;
      const fb = $('#human-feedback-a');
      if (val === 'windpipe') {
        fb.textContent = 'Air enters the lungs through the windpipe.';
        fb.className = 'feedback-msg correct';
        fb.hidden = false;
        const part2 = $('#human-qa-part2');
        if (part2) {
          part2.hidden = false;
          part2.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        fb.textContent = 'Try again.';
        fb.className = 'feedback-msg incorrect';
        fb.hidden = false;
      }
    });
  }

  const humanQaPart2 = $('#human-qa-part2');
  if (humanQaPart2) {
    const feedbackBox = humanQaPart2.querySelector('.feedback-container');
    const feedbackMsg = humanQaPart2.querySelector('.feedback-msg');

    humanQaPart2.querySelectorAll('.option-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const isCorrect = btn.getAttribute('data-correct') === 'true';
        feedbackBox.hidden = false;
        if (isCorrect) {
          feedbackMsg.textContent = 'Correct!';
          feedbackMsg.className = 'feedback-msg correct';
          setTimeout(() => {
            const partB = $('#human-part-b');
            if (partB) {
              partB.hidden = false;
              partB.scrollIntoView({ behavior: 'smooth' });
            }
          }, 600);
        } else {
          feedbackMsg.textContent = 'Look again.';
          feedbackMsg.className = 'feedback-msg incorrect';
        }
      });
    });
  }

  // MISSION 3: HUMAN PART B
  const humanQaB = $('#human-qa-b');
  if (humanQaB) {
    const feedbackBox = humanQaB.querySelector('.feedback-container');
    const feedbackMsg = humanQaB.querySelector('.feedback-msg');

    humanQaB.querySelectorAll('.option-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const isCorrect = btn.getAttribute('data-correct') === 'true';
        feedbackBox.hidden = false;
        if (isCorrect) {
          feedbackMsg.textContent = 'Gaseous exchange takes place in the lungs.';
          feedbackMsg.className = 'feedback-msg correct';
          const compC = $('#human-completion-c');
          if (compC) {
            compC.hidden = false;
            compC.scrollIntoView({ behavior: 'smooth' });
          }
        } else {
          feedbackMsg.textContent = 'Try again.';
          feedbackMsg.className = 'feedback-msg incorrect';
        }
      });
    });
  }

  const humanSubmitC = $('#human-submit-c');
  if (humanSubmitC) {
    humanSubmitC.addEventListener('click', () => {
      const val = $('#human-select-c').value;
      const fb = $('#human-feedback-c');
      if (val === 'nose') {
        fb.textContent = 'Humans breathe out air through the nose.';
        fb.className = 'feedback-msg correct';
        fb.hidden = false;
        state.completed.human = true;
        updateProgress('human');
        $('#human-mission-complete').hidden = false;
        $('#human-mission-complete').scrollIntoView({ behavior: 'smooth' });
      } else {
        fb.textContent = 'Try again.';
        fb.className = 'feedback-msg incorrect';
        fb.hidden = false;
      }
    });
  }

  // Navigation to Compare
  const toCompareBtn = $('#to-compare-btn');
  if (toCompareBtn) {
    toCompareBtn.addEventListener('click', () => {
      showScreen('mission-compare');
      updateProgress('compare');
    });
  }

  // MISSION 4: COMPARE INTERACTION
  let selectedChip = null;
  const chips = $$('.drag-chip');
  const targets = $$('.drop-target');

  chips.forEach(chip => {
    chip.addEventListener('dragstart', (e) => {
      selectedChip = chip.getAttribute('data-label');
      e.dataTransfer.setData('text/plain', selectedChip);
    });

    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('selected'));
      selectedChip = chip.getAttribute('data-label');
      chip.classList.add('selected');
    });
  });

  targets.forEach(target => {
    target.addEventListener('dragover', (e) => e.preventDefault());
    target.addEventListener('drop', (e) => {
      e.preventDefault();
      if (selectedChip) {
        target.textContent = selectedChip;
        target.classList.add('filled');
        selectedChip = null;
        chips.forEach(c => c.classList.remove('selected'));
      }
    });

    target.addEventListener('click', () => {
      if (selectedChip) {
        target.textContent = selectedChip;
        target.classList.add('filled');
        selectedChip = null;
        chips.forEach(c => c.classList.remove('selected'));
      }
    });
  });

  const checkCompareBtn = $('#check-compare-btn');
  if (checkCompareBtn) {
    checkCompareBtn.addEventListener('click', () => {
      const fb = $('#compare-feedback');
      let allCorrect = true;
      targets.forEach(t => {
        const expected = t.getAttribute('data-expected');
        if (t.textContent !== expected) {
          allCorrect = false;
        }
      });

      if (allCorrect) {
        fb.textContent = 'Excellent! Comparison table completed correctly.';
        fb.className = 'feedback-msg correct';
        fb.hidden = false;
        $$('.explain-cell').forEach(cell => cell.hidden = false);
        state.completed.compare = true;
        updateProgress('compare');
        $('#compare-mission-complete').hidden = false;
        $('#compare-mission-complete').scrollIntoView({ behavior: 'smooth' });
      } else {
        fb.textContent = 'Some parts are misplaced. Please review and try again.';
        fb.className = 'feedback-msg incorrect';
        fb.hidden = false;
      }
    });
  }

  // Navigation to Final
  const toFinalBtn = $('#to-final-btn');
  if (toFinalBtn) {
    toFinalBtn.addEventListener('click', () => {
      showScreen('final-challenge');
      updateProgress('final');
    });
  }

  // FINAL CHALLENGE
  const finalSubmit = $('#final-submit');
  if (finalSubmit) {
    finalSubmit.addEventListener('click', () => {
      const d1 = $('#final-drop-1').value;
      const d2 = $('#final-drop-2').value;
      const fb = $('#final-feedback');

      if (d1 === 'oxygen' && d2 === 'carbon dioxide') {
        fb.textContent = 'Plants, fish and humans take in oxygen and give out carbon dioxide differently.';
        fb.className = 'feedback-msg correct';
        fb.hidden = false;
        $('#final-matching').hidden = false;
        $('#final-complete').hidden = false;
        state.completed.final = true;
        updateProgress('final');
        $('#final-complete').scrollIntoView({ behavior: 'smooth' });
      } else {
        fb.textContent = 'Try again.';
        fb.className = 'feedback-msg incorrect';
        fb.hidden = false;
      }
    });
  }

  // Restart
  const restartBtn = $('#restart-btn');
  if (restartBtn) {
    restartBtn.addEventListener('click', () => {
      window.location.reload();
    });
  }
});
