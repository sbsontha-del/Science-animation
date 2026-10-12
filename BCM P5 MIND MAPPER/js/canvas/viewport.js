// Infinite Canvas Viewport Controller: Pan, Zoom, Screen-to-Canvas Transforms
export class Viewport {
  constructor(canvasContainer, canvasElement) {
    this.container = canvasContainer;
    this.canvas = canvasElement;
    this.panX = 0;
    this.panY = 0;
    this.scale = 1;
    this.minScale = 0.35;
    this.maxScale = 2.5;

    this.isPanning = false;
    this.startX = 0;
    this.startY = 0;
    this.spacePressed = false;

    this.listeners = [];
    this.setupListeners();
    this.updateTransform();
  }

  onTransform(fn) {
    this.listeners.push(fn);
  }

  setupListeners() {
    // Keyboard Spacebar for pan toggle
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space' && !['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
        this.spacePressed = true;
        this.container.classList.add('space-panning');
      }
    });

    window.addEventListener('keyup', (e) => {
      if (e.code === 'Space') {
        this.spacePressed = false;
        this.container.classList.remove('space-panning');
      }
    });

    // Mouse Panning (Middle click or Spacebar + Left click)
    this.container.addEventListener('mousedown', (e) => {
      if (e.button === 1 || (e.button === 0 && this.spacePressed)) {
        e.preventDefault();
        this.isPanning = true;
        this.startX = e.clientX - this.panX;
        this.startY = e.clientY - this.panY;
        this.container.classList.add('is-panning');
      }
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isPanning) return;
      this.panX = e.clientX - this.startX;
      this.panY = e.clientY - this.startY;
      this.updateTransform();
    });

    window.addEventListener('mouseup', (e) => {
      if (this.isPanning) {
        this.isPanning = false;
        this.container.classList.remove('is-panning');
      }
    });

    // Wheel Zoom & Trackpad Pan
    this.container.addEventListener('wheel', (e) => {
      e.preventDefault();
      if (e.ctrlKey || e.metaKey) {
        // Zooming gesture
        const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
        this.zoomAtPoint(e.clientX, e.clientY, zoomFactor);
      } else {
        // Pan gesture (trackpad scroll)
        this.panX -= e.deltaX;
        this.panY -= e.deltaY;
        this.updateTransform();
      }
    }, { passive: false });

    // Touch Pinch-to-Zoom & Pan
    let initialTouchDist = 0;
    let initialScale = 1;
    let touchStartMid = { x: 0, y: 0 };

    this.container.addEventListener('touchstart', (e) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        initialTouchDist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
        initialScale = this.scale;
        touchStartMid = {
          x: (t1.clientX + t2.clientX) / 2,
          y: (t1.clientY + t2.clientY) / 2
        };
      }
    }, { passive: false });

    this.container.addEventListener('touchmove', (e) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        const currentDist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
        if (initialTouchDist > 0) {
          const factor = currentDist / initialTouchDist;
          this.setScale(initialScale * factor, touchStartMid.x, touchStartMid.y);
        }
      }
    }, { passive: false });
  }

  zoomAtPoint(clientX, clientY, factor) {
    const rect = this.container.getBoundingClientRect();
    const mouseX = clientX - rect.left;
    const mouseY = clientY - rect.top;

    const newScale = Math.min(this.maxScale, Math.max(this.minScale, this.scale * factor));
    if (newScale === this.scale) return;

    // Zoom centered around mouse pointer
    this.panX = mouseX - (mouseX - this.panX) * (newScale / this.scale);
    this.panY = mouseY - (mouseY - this.panY) * (newScale / this.scale);
    this.scale = newScale;
    this.updateTransform();
  }

  setScale(newScale, clientX, clientY) {
    const targetScale = Math.min(this.maxScale, Math.max(this.minScale, newScale));
    if (clientX !== undefined && clientY !== undefined) {
      const rect = this.container.getBoundingClientRect();
      const mouseX = clientX - rect.left;
      const mouseY = clientY - rect.top;
      this.panX = mouseX - (mouseX - this.panX) * (targetScale / this.scale);
      this.panY = mouseY - (mouseY - this.panY) * (targetScale / this.scale);
    }
    this.scale = targetScale;
    this.updateTransform();
  }

  zoomIn() {
    const rect = this.container.getBoundingClientRect();
    this.zoomAtPoint(rect.left + rect.width / 2, rect.top + rect.height / 2, 1.2);
  }

  zoomOut() {
    const rect = this.container.getBoundingClientRect();
    this.zoomAtPoint(rect.left + rect.width / 2, rect.top + rect.height / 2, 0.83);
  }

  resetView() {
    this.panX = 40;
    this.panY = 40;
    this.scale = 1;
    this.updateTransform();
  }

  updateTransform() {
    this.canvas.style.transform = `translate(${this.panX}px, ${this.panY}px) scale(${this.scale})`;
    this.listeners.forEach(fn => fn({ panX: this.panX, panY: this.panY, scale: this.scale }));
  }

  screenToCanvas(clientX, clientY) {
    const rect = this.container.getBoundingClientRect();
    const x = (clientX - rect.left - this.panX) / this.scale;
    const y = (clientY - rect.top - this.panY) / this.scale;
    return { x, y };
  }

  canvasToScreen(canvasX, canvasY) {
    const rect = this.container.getBoundingClientRect();
    const x = rect.left + this.panX + canvasX * this.scale;
    const y = rect.top + this.panY + canvasY * this.scale;
    return { x, y };
  }
}
