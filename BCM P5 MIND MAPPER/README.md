# BCM P5 Science Mind Mapper

A professional, interactive, and pedagogically structured concept-mapping application designed for **Singapore Primary 5 Science students** (MOE syllabus).

The application follows a structured 3-phase revision process:
1. **Get Ready & Brainstorm**: Success Criteria self-check and active memory retrieval without prompts.
2. **Cluster & Categorize**: Categorization of ideas into coherent science groups with Socratic thinking prompts and metacognitive checks.
3. **Mind Map Workspace**: Interactive concept mapping with directional verbs, freehand sketching, smart shape recognition, hierarchical brackets, undo/redo, and high-resolution export.

---

## 🌟 Key Features

- **Singapore MOE Primary 5 Science Alignment**:
  - **Cycles**: Flowering Plant Reproduction, Human Reproduction, Water & Changes of State, Evaporation & Variables, The Water Cycle.
  - **Systems**: Plant Transport (Xylem & Phloem), Gaseous Exchange in Plants, Human Respiratory System, Human Circulatory System, Systems Working Together, Electrical Systems (Series & Parallel circuits, Conductors & Insulators, Fair tests).
- **Active Recall Brainstorming**: Students retrieve terms from memory first. An optional Word Bank suggestion drawer is available when memory prompts are needed.
- **Cognitive Scaffolding**:
  - `💡 Give Me a Hint`: Provides progressive thinking prompts (not direct answers).
  - `✓ Check My Thinking`: Evaluates brainstormed ideas against MOE syllabus requirements to flag missing conceptual areas.
- **Professional Mind Map Workspace**:
  - **Infinite Canvas with Pan & Zoom**: Smooth mouse wheel zoom, trackpad pinch, and spacebar/middle-click panning.
  - **Node Styling**: Pastel science themes, customizable shapes (pill, rounded rectangle, square), and inline label editing.
  - **Connectors & Linking Verbs**: Connect nodes with curved Beziers, orthogonal elbows, straight arrows, or bidirectional arrows, labeled with science verbs (e.g., *"loses heat to become"*, *"transports"*, *"pumps"*).
  - **Hierarchical Brackets**: Left `{`, Right `}`, Top `⏞`, and Bottom `⏟` grouping braces with resize, flip, and drag support.
  - **Free Draw & Smart Draw**: Smooth handwriting splines and geometric recognition (rough loops snap to ellipses, boxes, triangles, lines, or arrows).
  - **Touch & iPad Friendly**: Unified pointer events support drag-and-drop on iPads, tablets, and Chromebooks.
  - **Local Persistence & History**: Auto-saves to browser `localStorage` with multi-step Undo/Redo (`Ctrl+Z`, `Ctrl+Y`).
  - **High-Res Export & Print**: Export to high-resolution PNG image or print-ready revision worksheet.

---

## 🚀 How to Run

Because the application is built using modern vanilla web technologies (ES6 modules, CSS Custom Properties, SVG & HTML5 Canvas), **no installation or build steps are required**.

### Option 1: Direct File Opening
Double-click `index.html` to open it in Chrome, Safari, Edge, or Firefox.

### Option 2: Local Web Server (Recommended for ES Modules)
Run a lightweight server using Python:

```bash
cd "/Users/sheebab/Desktop/BCM P5 SCIENCE MIND MAPPER"
python3 -m http.server 3000
```
Then navigate to:
```
http://localhost:3000
```

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Ctrl + Z` / `Cmd + Z` | Undo last action |
| `Ctrl + Y` / `Cmd + Shift + Z` | Redo action |
| `Delete` / `Backspace` | Delete selected node, connector, bracket, or drawing |
| `Spacebar + Mouse Drag` | Pan canvas viewport |
| `Mouse Wheel` | Pan viewport / trackpad scroll |
| `Ctrl + Mouse Wheel` | Zoom in / Zoom out |
| `Escape` | Cancel drawing/connector mode and deselect |
| `Double Click Node/Label` | Edit node or connector text |

---

## 📂 Project Architecture

```
BCM P5 SCIENCE MIND MAPPER/
├── index.html                  # Main application structure
├── README.md                   # Documentation and usage guide
├── css/
│   ├── main.css                # Design tokens, header, typography, layout
│   ├── components.css          # Selectors, checklists, chips, clusters, modals
│   ├── canvas.css              # Viewport, node shapes, connectors, toolbar, popup
│   └── print.css               # Print and PDF worksheet layout
└── js/
    ├── app.js                  # Application entry point & integration controller
    ├── data/
    │   └── curriculum.js       # Singapore MOE P5 Science curriculum & hints
    ├── state/
    │   ├── store.js            # Central reactive store & persistence
    │   └── history.js          # Command history manager for Undo / Redo
    ├── components/
    │   ├── wizard.js           # 3-step navigation & zen mode
    │   ├── brainstorm.js       # Active recall chips & word bank
    │   ├── cluster.js          # Touch + mouse drag & drop clustering & hints
    │   └── modal.js            # Custom in-app dialogs & prompts
    └── canvas/
        ├── viewport.js         # Infinite canvas, pan & zoom controller
        ├── nodes.js            # Node rendering, positioning & shapes
        ├── edges.js            # Connector lines, Bezier curves & verbs
        ├── brackets.js         # Hierarchical grouping braces
        ├── freehand.js         # Spline smoothing & smart shape recognition
        └── export.js           # High-res PNG & print engine
```
