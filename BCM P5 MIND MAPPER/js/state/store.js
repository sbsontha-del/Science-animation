// Application State Store with LocalStorage Persistence & Subscription Support
import { CURRICULUM } from '../data/curriculum.js';
import { HistoryManager } from './history.js';

const STORAGE_KEY = 'bcm_p5_science_mind_mapper_v2_state';

export class Store {
  constructor() {
    this.history = new HistoryManager(50);
    this.subscribers = new Set();
    
    // Default initial state
    const firstTopic = Object.keys(CURRICULUM)[0];
    const firstConcept = Object.keys(CURRICULUM[firstTopic].concepts)[0];

    this.state = {
      currentStep: 1, // 1: criteria/brainstorm, 2: cluster, 3: map
      topic: firstTopic,
      concept: firstConcept,
      checkedCriteria: {}, // { [conceptKey]: [0, 2, ...] }
      words: [], // list of unique brainstormed keywords
      clusters: [], // [{ id: 'c1', name: 'Cluster Name', words: ['word1', 'word2'] }]
      unsortedWords: [],
      // Canvas entities
      canvas: {
        nodes: [], // [{ id, text, x, y, color, kind, shape }]
        edges: [], // [{ id, a, b, label, type, style }]
        brackets: [], // [{ id, type, x, y, sx, sy, label }]
        inkObjects: [] // [{ kind, pts, ... }]
      },
      viewport: {
        panX: 0,
        panY: 0,
        scale: 1
      },
      activeTool: 'pointer', // pointer | free | smart | shape | link | eraser
      selected: {
        type: null, // 'node' | 'edge' | 'bracket' | 'ink'
        id: null
      },
      linkStart: null
    };

    this.loadFromStorage();
    this.saveSnapshot();
  }

  subscribe(listener) {
    this.subscribers.add(listener);
    return () => this.subscribers.delete(listener);
  }

  notify(event = 'stateChanged') {
    this.subscribers.forEach(fn => fn(this.state, event));
    this.persistDebounced();
  }

  saveSnapshot() {
    this.history.push({
      topic: this.state.topic,
      concept: this.state.concept,
      words: [...this.state.words],
      clusters: JSON.parse(JSON.stringify(this.state.clusters)),
      unsortedWords: [...this.state.unsortedWords],
      canvas: JSON.parse(JSON.stringify(this.state.canvas))
    });
  }

  applySnapshot(snapshot) {
    if (!snapshot) return;
    this.state.topic = snapshot.topic || this.state.topic;
    this.state.concept = snapshot.concept || this.state.concept;
    this.state.words = snapshot.words || [];
    this.state.clusters = snapshot.clusters || [];
    this.state.unsortedWords = snapshot.unsortedWords || [];
    this.state.canvas = snapshot.canvas || { nodes: [], edges: [], brackets: [], inkObjects: [] };
    this.state.selected = { type: null, id: null };
    this.state.linkStart = null;
    this.notify('snapshotRestored');
  }

  undo() {
    const snap = this.history.undo();
    if (snap) this.applySnapshot(snap);
  }

  redo() {
    const snap = this.history.redo();
    if (snap) this.applySnapshot(snap);
  }

  // --- Curriculum & Topic Handlers ---
  setTopic(topic) {
    if (!CURRICULUM[topic]) return;
    this.state.topic = topic;
    const concepts = Object.keys(CURRICULUM[topic].concepts);
    this.state.concept = concepts[0];
    this.notify('topicChanged');
  }

  setConcept(concept) {
    if (!CURRICULUM[this.state.topic]?.concepts[concept]) return;
    this.state.concept = concept;
    this.notify('conceptChanged');
  }

  toggleCriterion(index, isChecked) {
    const key = `${this.state.topic}::${this.state.concept}`;
    const list = new Set(this.state.checkedCriteria[key] || []);
    if (isChecked) list.add(index);
    else list.delete(index);
    this.state.checkedCriteria[key] = Array.from(list);
    this.notify('criteriaChanged');
  }

  isCriterionChecked(index) {
    const key = `${this.state.topic}::${this.state.concept}`;
    return (this.state.checkedCriteria[key] || []).includes(index);
  }

  // --- Brainstorm Keywords ---
  addKeyword(word) {
    const cleaned = (word || '').trim();
    if (!cleaned) return false;
    if (this.state.words.includes(cleaned)) return false;
    
    this.saveSnapshot();
    this.state.words.push(cleaned);
    this.state.unsortedWords.push(cleaned);
    this.notify('keywordAdded');
    return true;
  }

  removeKeyword(word) {
    this.saveSnapshot();
    this.state.words = this.state.words.filter(w => w !== word);
    this.state.unsortedWords = this.state.unsortedWords.filter(w => w !== word);
    this.state.clusters.forEach(c => {
      c.words = c.words.filter(w => w !== word);
    });
    this.notify('keywordRemoved');
  }

  editKeyword(oldWord, newWord) {
    const cleaned = (newWord || '').trim();
    if (!cleaned || cleaned === oldWord) return;
    if (this.state.words.includes(cleaned)) return;

    this.saveSnapshot();
    this.state.words = this.state.words.map(w => w === oldWord ? cleaned : w);
    this.state.unsortedWords = this.state.unsortedWords.map(w => w === oldWord ? cleaned : w);
    this.state.clusters.forEach(c => {
      c.words = c.words.map(w => w === oldWord ? cleaned : w);
    });
    this.notify('keywordEdited');
  }

  // --- Clusters ---
  createCluster(name = 'New Cluster') {
    this.saveSnapshot();
    const id = 'cluster_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
    const cluster = { id, name, words: [] };
    this.state.clusters.push(cluster);
    this.notify('clusterCreated');
    return cluster;
  }

  renameCluster(clusterId, name) {
    const cluster = this.state.clusters.find(c => c.id === clusterId);
    if (cluster) {
      cluster.name = name;
      this.persistDebounced();
    }
  }

  deleteCluster(clusterId) {
    this.saveSnapshot();
    const cluster = this.state.clusters.find(c => c.id === clusterId);
    if (cluster) {
      // Return words back to unsorted
      cluster.words.forEach(w => {
        if (!this.state.unsortedWords.includes(w)) {
          this.state.unsortedWords.push(w);
        }
      });
      this.state.clusters = this.state.clusters.filter(c => c.id !== clusterId);
      this.notify('clusterDeleted');
    }
  }

  moveWordToCluster(word, clusterId) {
    this.saveSnapshot();
    // Remove from unsorted
    this.state.unsortedWords = this.state.unsortedWords.filter(w => w !== word);
    // Remove from other clusters
    this.state.clusters.forEach(c => {
      c.words = c.words.filter(w => w !== word);
    });
    // Add to target cluster
    const target = this.state.clusters.find(c => c.id === clusterId);
    if (target && !target.words.includes(word)) {
      target.words.push(word);
    }
    this.notify('wordMoved');
  }

  moveWordToUnsorted(word) {
    this.saveSnapshot();
    this.state.clusters.forEach(c => {
      c.words = c.words.filter(w => w !== word);
    });
    if (!this.state.unsortedWords.includes(word)) {
      this.state.unsortedWords.push(word);
    }
    this.notify('wordMoved');
  }

  resetClustering() {
    this.saveSnapshot();
    this.state.clusters = [];
    this.state.unsortedWords = [...this.state.words];
    this.notify('clusteringReset');
  }

  // --- Canvas Mind Map Generation ---
  buildMindMapFromClusters() {
    this.saveSnapshot();
    const nodes = [];
    const edges = [];
    const conceptName = this.state.concept;

    // Central Core Concept Node
    const rootId = 'root_' + Date.now();
    nodes.push({
      id: rootId,
      text: conceptName,
      x: 750,
      y: 100,
      color: '#fff3d6',
      borderColor: '#d97706',
      kind: 'central',
      shape: 'pill',
      fontSize: 18
    });

    // Clusters layout
    const clusterList = this.state.clusters;
    const numClusters = clusterList.length;
    const clusterSpacing = 320;
    const startX = Math.max(100, 750 - ((numClusters - 1) * clusterSpacing) / 2);

    clusterList.forEach((c, cIdx) => {
      const cId = 'c_node_' + c.id;
      const cx = startX + cIdx * clusterSpacing;
      const cy = 280;

      nodes.push({
        id: cId,
        text: c.name || 'Category',
        x: cx,
        y: cy,
        color: '#e0f2fe',
        borderColor: '#0284c7',
        kind: 'cluster',
        shape: 'rounded',
        fontSize: 15
      });

      edges.push({
        id: 'edge_' + rootId + '_' + cId,
        a: rootId,
        b: cId,
        label: '',
        type: 'curved',
        color: '#0284c7'
      });

      // Child keyword nodes
      const items = c.words;
      items.forEach((item, iIdx) => {
        const iId = 'item_' + Date.now() + '_' + cIdx + '_' + iIdx;
        const col = iIdx % 2;
        const row = Math.floor(iIdx / 2);
        const ix = cx - 60 + col * 140;
        const iy = cy + 120 + row * 90;

        nodes.push({
          id: iId,
          text: item,
          x: ix,
          y: iy,
          color: '#f0fdf4',
          borderColor: '#16a34a',
          kind: 'idea',
          shape: 'rect',
          fontSize: 14
        });

        edges.push({
          id: 'edge_' + cId + '_' + iId,
          a: cId,
          b: iId,
          label: '',
          type: 'curved',
          color: '#16a34a'
        });
      });
    });

    // Unsorted words placed in an "ideas" holding bank on the side
    const unsorted = this.state.unsortedWords;
    unsorted.forEach((uw, uIdx) => {
      const uId = 'unsorted_' + Date.now() + '_' + uIdx;
      nodes.push({
        id: uId,
        text: uw,
        x: 60 + (uIdx % 3) * 160,
        y: 750 + Math.floor(uIdx / 3) * 80,
        color: '#fdf2f8',
        borderColor: '#db2777',
        kind: 'idea',
        shape: 'rect',
        fontSize: 14
      });
    });

    this.state.canvas = {
      nodes,
      edges,
      brackets: [],
      inkObjects: []
    };
    this.state.selected = { type: null, id: null };
    this.notify('mindMapBuilt');
  }

  // --- Persistence Handlers ---
  persistDebounced() {
    clearTimeout(this._persistTimer);
    this._persistTimer = setTimeout(() => {
      try {
        const payload = {
          currentStep: this.state.currentStep,
          topic: this.state.topic,
          concept: this.state.concept,
          checkedCriteria: this.state.checkedCriteria,
          words: this.state.words,
          clusters: this.state.clusters,
          unsortedWords: this.state.unsortedWords,
          canvas: this.state.canvas,
          viewport: this.state.viewport
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      } catch (err) {
        console.warn('Failed to save to localStorage', err);
      }
    }, 400);
  }

  loadFromStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      if (data && typeof data === 'object') {
        if (data.topic && CURRICULUM[data.topic]) {
          this.state.topic = data.topic;
        } else {
          this.state.topic = Object.keys(CURRICULUM)[0];
        }
        if (data.concept && CURRICULUM[this.state.topic]?.concepts[data.concept]) {
          this.state.concept = data.concept;
        } else {
          this.state.concept = Object.keys(CURRICULUM[this.state.topic].concepts)[0];
        }
        if (Array.isArray(data.words)) this.state.words = data.words;
        if (Array.isArray(data.clusters)) this.state.clusters = data.clusters;
        if (Array.isArray(data.unsortedWords)) this.state.unsortedWords = data.unsortedWords;
        if (data.checkedCriteria && typeof data.checkedCriteria === 'object') this.state.checkedCriteria = data.checkedCriteria;
        if (data.canvas && typeof data.canvas === 'object') {
          this.state.canvas = {
            nodes: Array.isArray(data.canvas.nodes) ? data.canvas.nodes : [],
            edges: Array.isArray(data.canvas.edges) ? data.canvas.edges : [],
            brackets: Array.isArray(data.canvas.brackets) ? data.canvas.brackets : [],
            inkObjects: Array.isArray(data.canvas.inkObjects) ? data.canvas.inkObjects : []
          };
        }
        if (data.viewport) this.state.viewport = data.viewport;
        if (data.currentStep) this.state.currentStep = data.currentStep;
      }
    } catch (err) {
      console.warn('Could not parse stored mind mapper state', err);
    }
  }

  clearAllData() {
    this.saveSnapshot();
    this.state.words = [];
    this.state.clusters = [];
    this.state.unsortedWords = [];
    this.state.canvas = { nodes: [], edges: [], brackets: [], inkObjects: [] };
    this.state.selected = { type: null, id: null };
    localStorage.removeItem(STORAGE_KEY);
    this.notify('allDataCleared');
  }
}

export const store = new Store();
