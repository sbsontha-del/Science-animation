// Command / Snapshot History Manager for Undo / Redo
export class HistoryManager {
  constructor(limit = 50) {
    this.limit = limit;
    this.undoStack = [];
    this.redoStack = [];
    this.listeners = [];
  }

  onChange(fn) {
    this.listeners.push(fn);
  }

  notify() {
    this.listeners.forEach(fn => fn({
      canUndo: this.canUndo(),
      canRedo: this.canRedo()
    }));
  }

  push(snapshot) {
    // Clone snapshot to prevent mutation leaks
    const serialized = JSON.stringify(snapshot);
    if (this.undoStack.length > 0 && this.undoStack[this.undoStack.length - 1] === serialized) {
      return; // Deduplicate identical states
    }
    this.undoStack.push(serialized);
    if (this.undoStack.length > this.limit) {
      this.undoStack.shift();
    }
    this.redoStack = [];
    this.notify();
  }

  canUndo() {
    return this.undoStack.length > 1;
  }

  canRedo() {
    return this.redoStack.length > 0;
  }

  undo() {
    if (!this.canUndo()) return null;
    const current = this.undoStack.pop();
    this.redoStack.push(current);
    const target = this.undoStack[this.undoStack.length - 1];
    this.notify();
    return JSON.parse(target);
  }

  redo() {
    if (!this.canRedo()) return null;
    const target = this.redoStack.pop();
    this.undoStack.push(target);
    this.notify();
    return JSON.parse(target);
  }

  clear() {
    this.undoStack = [];
    this.redoStack = [];
    this.notify();
  }
}
