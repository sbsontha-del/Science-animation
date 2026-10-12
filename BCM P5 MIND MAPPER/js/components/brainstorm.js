// Brainstorming keywords component
import { store } from '../state/store.js';
import { CURRICULUM } from '../data/curriculum.js';
import { modal } from './modal.js';

export class BrainstormComponent {
  constructor() {
    this.input = document.getElementById('keywordInput');
    this.addBtn = document.getElementById('addKeywordBtn');
    this.chipsContainer = document.getElementById('brainstormChips');
    this.countBadge = document.getElementById('keywordCountBadge');
    this.wordBankContainer = document.getElementById('wordBankContainer');
    this.wordBankToggle = document.getElementById('toggleWordBankBtn');
    this.wordBankChips = document.getElementById('wordBankChips');
    
    this.init();
  }

  init() {
    if (this.addBtn) {
      this.addBtn.addEventListener('click', () => this.handleAdd());
    }
    if (this.input) {
      this.input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.handleAdd();
        }
      });
    }

    if (this.wordBankToggle) {
      this.wordBankToggle.addEventListener('click', () => {
        const isHidden = this.wordBankChips.classList.toggle('hidden');
        this.wordBankToggle.textContent = isHidden ? '💡 Show Word Bank Suggestions' : '✕ Hide Word Bank';
      });
    }

    store.subscribe((state, event) => {
      if (['keywordAdded', 'keywordRemoved', 'keywordEdited', 'topicChanged', 'conceptChanged', 'snapshotRestored', 'allDataCleared'].includes(event)) {
        this.render();
      }
    });

    this.render();
  }

  handleAdd() {
    const text = this.input.value.trim();
    if (!text) {
      this.input.focus();
      return;
    }
    const success = store.addKeyword(text);
    if (success) {
      this.input.value = '';
      this.input.focus();
    } else {
      this.input.select();
    }
  }

  async handleEdit(word) {
    const newWord = await modal.prompt(
      'Edit Keyword',
      'Change the keyword or phrase:',
      word,
      'Enter keyword...'
    );
    if (newWord && newWord.trim()) {
      store.editKeyword(word, newWord.trim());
    }
  }

  render() {
    const { words, topic, concept } = store.state;

    // Render keyword count
    if (this.countBadge) {
      this.countBadge.textContent = `${words.length} keyword${words.length === 1 ? '' : 's'}`;
    }

    // Render active brainstorm chips
    if (this.chipsContainer) {
      this.chipsContainer.innerHTML = '';
      if (words.length === 0) {
        this.chipsContainer.innerHTML = `
          <div class="empty-state-hint">
            <span>💭 No keywords yet. Type what you remember and press <kbd>Enter</kbd> or click <b>Add</b>.</span>
          </div>
        `;
      } else {
        words.forEach(w => {
          const chip = document.createElement('div');
          chip.className = 'chip animate-pop';
          chip.dataset.word = w;

          const span = document.createElement('span');
          span.className = 'chip-label';
          span.textContent = w;
          span.title = 'Double-click to edit';
          span.ondblclick = () => this.handleEdit(w);

          const editBtn = document.createElement('button');
          editBtn.className = 'chip-action-btn edit';
          editBtn.innerHTML = '✎';
          editBtn.title = 'Edit keyword';
          editBtn.onclick = (e) => {
            e.stopPropagation();
            this.handleEdit(w);
          };

          const delBtn = document.createElement('button');
          delBtn.className = 'chip-action-btn delete';
          delBtn.innerHTML = '&times;';
          delBtn.title = 'Remove keyword';
          delBtn.onclick = (e) => {
            e.stopPropagation();
            store.removeKeyword(w);
          };

          chip.appendChild(span);
          chip.appendChild(editBtn);
          chip.appendChild(delBtn);
          this.chipsContainer.appendChild(chip);
        });
      }
    }

    // Render word bank suggestions
    if (this.wordBankChips) {
      this.wordBankChips.innerHTML = '';
      const conceptData = CURRICULUM[topic]?.concepts[concept];
      const suggestions = conceptData?.suggestedKeywords || [];

      suggestions.forEach(suggested => {
        const isAdded = words.includes(suggested);
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `word-bank-tag ${isAdded ? 'added' : ''}`;
        btn.innerHTML = `${isAdded ? '✓' : '+'} ${suggested}`;
        btn.title = isAdded ? 'Already added' : 'Click to add to brainstorm';
        if (!isAdded) {
          btn.onclick = () => {
            store.addKeyword(suggested);
          };
        }
        this.wordBankChips.appendChild(btn);
      });
    }
  }
}
