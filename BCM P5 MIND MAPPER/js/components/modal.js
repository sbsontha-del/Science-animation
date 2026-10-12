// Modern in-app dialogs replacing disruptive browser prompt/alert
export class ModalManager {
  constructor() {
    this.overlay = null;
    this.setup();
  }

  setup() {
    let overlay = document.getElementById('appModalOverlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'appModalOverlay';
      overlay.className = 'modal-overlay hidden';
      overlay.innerHTML = `
        <div class="modal-card" role="dialog" aria-modal="true">
          <div class="modal-header">
            <h3 class="modal-title" id="modalTitle">Modal</h3>
            <button class="modal-close-btn" id="modalCloseBtn" aria-label="Close">&times;</button>
          </div>
          <div class="modal-body" id="modalBody"></div>
          <div class="modal-footer" id="modalFooter"></div>
        </div>
      `;
      document.body.appendChild(overlay);
    }
    this.overlay = overlay;
    this.titleEl = overlay.querySelector('#modalTitle');
    this.bodyEl = overlay.querySelector('#modalBody');
    this.footerEl = overlay.querySelector('#modalFooter');
    this.closeBtn = overlay.querySelector('#modalCloseBtn');

    this.closeBtn.onclick = () => this.hide();
    this.overlay.onclick = (e) => {
      if (e.target === this.overlay) this.hide();
    };
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !this.overlay.classList.contains('hidden')) {
        this.hide();
      }
    });
  }

  show({ title, bodyHtml, buttons = [] }) {
    this.titleEl.textContent = title || '';
    this.bodyEl.innerHTML = bodyHtml || '';
    this.footerEl.innerHTML = '';

    buttons.forEach(btn => {
      const b = document.createElement('button');
      b.className = btn.className || 'btn-secondary';
      b.textContent = btn.label;
      b.onclick = () => {
        if (btn.onClick) {
          const shouldClose = btn.onClick(this.bodyEl);
          if (shouldClose !== false) this.hide();
        } else {
          this.hide();
        }
      };
      this.footerEl.appendChild(b);
    });

    this.overlay.classList.remove('hidden');
    // Auto-focus first input if exists
    const input = this.bodyEl.querySelector('input, textarea, select');
    if (input) setTimeout(() => { input.focus(); if (input.select) input.select(); }, 50);
  }

  hide() {
    this.overlay.classList.add('hidden');
  }

  prompt(title, message, defaultValue = '', placeholder = '') {
    return new Promise((resolve) => {
      this.show({
        title,
        bodyHtml: `
          <p class="modal-desc">${message}</p>
          <div class="form-group" style="margin-top:12px;">
            <input type="text" id="modalPromptInput" class="modal-input" value="${defaultValue.replace(/"/g, '&quot;')}" placeholder="${placeholder}" autofocus>
          </div>
        `,
        buttons: [
          {
            label: 'Cancel',
            className: 'btn-outline',
            onClick: () => { resolve(null); return true; }
          },
          {
            label: 'Confirm',
            className: 'btn-primary',
            onClick: (body) => {
              const val = body.querySelector('#modalPromptInput').value;
              resolve(val);
              return true;
            }
          }
        ]
      });

      const inp = document.getElementById('modalPromptInput');
      if (inp) {
        inp.onkeydown = (e) => {
          if (e.key === 'Enter') {
            resolve(inp.value);
            this.hide();
          }
        };
      }
    });
  }

  alert(title, htmlMessage) {
    return new Promise((resolve) => {
      this.show({
        title,
        bodyHtml: `<div class="modal-desc">${htmlMessage}</div>`,
        buttons: [
          {
            label: 'Got it',
            className: 'btn-primary',
            onClick: () => { resolve(true); return true; }
          }
        ]
      });
    });
  }

  confirm(title, message) {
    return new Promise((resolve) => {
      this.show({
        title,
        bodyHtml: `<div class="modal-desc">${message}</div>`,
        buttons: [
          {
            label: 'Cancel',
            className: 'btn-outline',
            onClick: () => { resolve(false); return true; }
          },
          {
            label: 'Confirm',
            className: 'btn-danger',
            onClick: () => { resolve(true); return true; }
          }
        ]
      });
    });
  }
}

export const modal = new ModalManager();
