// Clustering component with Touch + Mouse Drag & Drop and Pedagogical Thinking Scaffolds
import { store } from '../state/store.js';
import { CURRICULUM } from '../data/curriculum.js';
import { modal } from './modal.js';

export class ClusterComponent {
  constructor() {
    this.unsortedContainer = document.getElementById('unsortedChips');
    this.clustersGrid = document.getElementById('clustersGrid');
    this.newClusterBtn = document.getElementById('newClusterBtn');
    this.hintBtn = document.getElementById('suggestClustersBtn');
    this.checkThinkingBtn = document.getElementById('checkClustersBtn');
    this.resetBtn = document.getElementById('clearClustersBtn');
    this.feedbackBox = document.getElementById('thinkingFeedbackBox');

    this.hintIndex = 0;
    this.draggedWord = null;
    this.touchGhost = null;

    this.init();
  }

  init() {
    if (this.newClusterBtn) {
      this.newClusterBtn.addEventListener('click', () => {
        const cluster = store.createCluster(`Group ${store.state.clusters.length + 1}`);
        // Focus the input of the newly created cluster
        setTimeout(() => {
          const el = document.querySelector(`[data-cluster-id="${cluster.id}"] .cluster-title-input`);
          if (el) el.focus();
        }, 50);
      });
    }

    if (this.hintBtn) {
      this.hintBtn.addEventListener('click', () => this.handleHint());
    }

    if (this.checkThinkingBtn) {
      this.checkThinkingBtn.addEventListener('click', () => this.handleCheckThinking());
    }

    if (this.resetBtn) {
      this.resetBtn.addEventListener('click', async () => {
        const ok = await modal.confirm(
          'Reset Clusters?',
          'Are you sure you want to clear all clusters? Your keywords will return to the unsorted pool.'
        );
        if (ok) {
          store.resetClustering();
          this.feedbackBox.classList.add('hidden');
        }
      });
    }

    this.setupDropZone(this.unsortedContainer, null);

    store.subscribe((state, event) => {
      if ([
        'wordMoved', 'clusterCreated', 'clusterDeleted', 'clusteringReset',
        'keywordAdded', 'keywordRemoved', 'keywordEdited', 'topicChanged',
        'conceptChanged', 'snapshotRestored', 'allDataCleared'
      ].includes(event)) {
        this.render();
      }
    });

    this.render();
  }

  handleHint() {
    const { topic, concept } = store.state;
    const conceptData = CURRICULUM[topic]?.concepts[concept];
    const hints = conceptData?.hints || [
      'Look at your keywords. Which ones relate to the same step, part, or property?',
      'Can you group them by what happens (cause and effect)?',
      'What big question connects several of these terms?'
    ];

    const hint = hints[this.hintIndex % hints.length];
    this.hintIndex++;

    this.showFeedback(`
      <div class="feedback-badge hint">💡 Thinking Prompt #${this.hintIndex}</div>
      <p class="feedback-text">${hint}</p>
      <div class="feedback-subnote">Tip: Give your cluster a clear category name that summarizes why these ideas belong together.</div>
    `);
  }

  handleCheckThinking() {
    const { topic, concept, words, clusters } = store.state;
    const conceptData = CURRICULUM[topic]?.concepts[concept];
    if (!conceptData) return;

    const allWordsLower = words.join(' ').toLowerCase();
    const missingChecks = (conceptData.checks || []).filter(item => {
      return !allWordsLower.includes(item.key.toLowerCase());
    });

    const clusterCount = clusters.length;
    let html = `<div class="feedback-badge check">✓ Metacognitive Review</div>`;

    if (clusterCount === 0) {
      html += `<p class="feedback-text">You haven't created any clusters yet! Click <b>+ Create Cluster</b> to start grouping your ideas.</p>`;
    } else {
      html += `<p class="feedback-text">You have formed <b>${clusterCount}</b> cluster${clusterCount === 1 ? '' : 's'}. Look closely at whether every keyword in each group truly relates to its category title.</p>`;
    }

    if (missingChecks.length > 0) {
      const topCheck = missingChecks[0];
      html += `
        <div class="feedback-gap-box">
          <div class="feedback-gap-title">💭 Something to consider:</div>
          <div class="feedback-gap-desc">${topCheck.prompt}</div>
        </div>
        <div class="feedback-subnote">Add or adjust keywords in Step 1 if you realize a key science idea is missing!</div>
      `;
    } else {
      html += `
        <div class="feedback-success-box">
          🌟 <b>Comprehensive Brainstorm:</b> Your keywords cover all the major syllabus requirements for <i>${concept}</i>! You are ready to build your Mind Map.
        </div>
      `;
    }

    this.showFeedback(html);
  }

  showFeedback(html) {
    this.feedbackBox.innerHTML = html;
    this.feedbackBox.classList.remove('hidden');
    this.feedbackBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  setupDropZone(element, clusterId) {
    element.addEventListener('dragover', (e) => {
      e.preventDefault();
      element.classList.add('drag-hover');
    });

    element.addEventListener('dragleave', (e) => {
      if (!element.contains(e.relatedTarget)) {
        element.classList.remove('drag-hover');
      }
    });

    element.addEventListener('drop', (e) => {
      e.preventDefault();
      element.classList.remove('drag-hover');
      const word = e.dataTransfer.getData('text/plain') || this.draggedWord;
      if (word) {
        if (clusterId) {
          store.moveWordToCluster(word, clusterId);
        } else {
          store.moveWordToUnsorted(word);
        }
      }
      this.draggedWord = null;
    });
  }

  createDraggableChip(word) {
    const chip = document.createElement('div');
    chip.className = 'draggable-chip';
    chip.draggable = true;
    chip.dataset.word = word;
    chip.innerHTML = `
      <span class="chip-grip">⠿</span>
      <span class="chip-text">${word}</span>
    `;

    // Mouse drag
    chip.addEventListener('dragstart', (e) => {
      this.draggedWord = word;
      e.dataTransfer.setData('text/plain', word);
      chip.classList.add('dragging');
    });

    chip.addEventListener('dragend', () => {
      this.draggedWord = null;
      chip.classList.remove('dragging');
    });

    // Touch events for iPad / Tablets
    chip.addEventListener('touchstart', (e) => {
      const touch = e.touches[0];
      this.draggedWord = word;

      // Create visual touch ghost
      const ghost = chip.cloneNode(true);
      ghost.classList.add('touch-drag-ghost');
      document.body.appendChild(ghost);
      ghost.style.left = `${touch.clientX}px`;
      ghost.style.top = `${touch.clientY}px`;
      this.touchGhost = ghost;
      chip.classList.add('dragging');
    }, { passive: true });

    chip.addEventListener('touchmove', (e) => {
      if (!this.touchGhost) return;
      const touch = e.touches[0];
      this.touchGhost.style.left = `${touch.clientX}px`;
      this.touchGhost.style.top = `${touch.clientY}px`;
    }, { passive: true });

    chip.addEventListener('touchend', (e) => {
      if (this.touchGhost) {
        this.touchGhost.remove();
        this.touchGhost = null;
      }
      chip.classList.remove('dragging');

      const touch = e.changedTouches[0];
      const targetElem = document.elementFromPoint(touch.clientX, touch.clientY);
      if (targetElem) {
        const dropZone = targetElem.closest('.cluster-body, #unsortedChips');
        if (dropZone) {
          if (dropZone.id === 'unsortedChips') {
            store.moveWordToUnsorted(word);
          } else {
            const clusterCard = dropZone.closest('.cluster-card');
            if (clusterCard && clusterCard.dataset.clusterId) {
              store.moveWordToCluster(word, clusterCard.dataset.clusterId);
            }
          }
        }
      }
      this.draggedWord = null;
    });

    return chip;
  }

  render() {
    const { unsortedWords, clusters } = store.state;

    // Render Unsorted Pool
    if (this.unsortedContainer) {
      this.unsortedContainer.innerHTML = '';
      if (unsortedWords.length === 0) {
        this.unsortedContainer.innerHTML = `
          <div class="empty-drop-hint">
            ✓ All keywords have been grouped into clusters!
          </div>
        `;
      } else {
        unsortedWords.forEach(w => {
          this.unsortedContainer.appendChild(this.createDraggableChip(w));
        });
      }
    }

    // Render Clusters Grid
    if (this.clustersGrid) {
      this.clustersGrid.innerHTML = '';
      clusters.forEach(c => {
        const card = document.createElement('div');
        card.className = 'cluster-card';
        card.dataset.clusterId = c.id;

        const header = document.createElement('div');
        header.className = 'cluster-header';

        const titleInput = document.createElement('input');
        titleInput.type = 'text';
        titleInput.className = 'cluster-title-input';
        titleInput.value = c.name;
        titleInput.placeholder = 'Category Name...';
        titleInput.oninput = (e) => store.renameCluster(c.id, e.target.value);
        titleInput.onblur = (e) => store.renameCluster(c.id, e.target.value.trim() || 'Untitled Category');

        const badge = document.createElement('span');
        badge.className = 'cluster-count-badge';
        badge.textContent = `${c.words.length}`;

        const delBtn = document.createElement('button');
        delBtn.type = 'button';
        delBtn.className = 'cluster-delete-btn';
        delBtn.innerHTML = '&times;';
        delBtn.title = 'Remove cluster (keywords will return to unsorted)';
        delBtn.onclick = () => store.deleteCluster(c.id);

        header.appendChild(titleInput);
        header.appendChild(badge);
        header.appendChild(delBtn);

        const body = document.createElement('div');
        body.className = 'cluster-body';
        this.setupDropZone(body, c.id);

        if (c.words.length === 0) {
          body.innerHTML = `<div class="cluster-empty-hint">Drop keywords here</div>`;
        } else {
          c.words.forEach(w => {
            body.appendChild(this.createDraggableChip(w));
          });
        }

        card.appendChild(header);
        card.appendChild(body);
        this.clustersGrid.appendChild(card);
      });
    }
  }
}
