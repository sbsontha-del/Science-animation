# Activity 4.3 – Plants, Fish and Humans 🌿🐟🫁

An interactive Primary 5 Science learning application focusing on **gaseous exchange in plants, fish, and humans**.

Designed specifically for 10–11 year old pupils with a modern, visual, science laboratory theme.

---

## 🌟 Key Features
- **4 Guided Missions**:
  1. 🌿 **Mission 1 – Plant**: Observe leaf stomata and gaseous exchange through tiny openings.
  2. 🐟 **Mission 2 – Fish**: Observe fish gills and gaseous exchange in water.
  3. 🫁 **Mission 3 – Human**: Trace the air pathway (windpipe) and gaseous exchange in the lungs.
  4. 📊 **Mission 4 – Compare**: Interactive comparison table matching organisms to their parts and explanations.
- **Final Challenge**: Interactive conclusion builder and matching activity.
- **Pedagogical Workflow**: `WATCH ➔ OBSERVE ➔ ANSWER ➔ CHECK ➔ FEEDBACK ➔ CONTINUE`
- **Video Fallbacks**: Automatic video placeholder handling to ensure smooth lesson continuation.
- **Responsive Layout**: Designed for laptop and tablet displays.

---

## 📁 Repository Structure
```
The Human Respiratory System/
├── index.html                   # Main HTML5 application
├── style.css                    # Modern science laboratory design system
├── app.js                       # Mission state, progress bar, & quiz logic
├── .gitignore                   # Git configuration
├── README.md                    # Project documentation
└── assets/
    └── videos/
        ├── plant_bubbles.mp4
        ├── plant_microscope.mp4
        ├── fish_gills.mp4
        ├── fish_gaseous_exchange.mp4
        └── The Human Respiratory System/
            ├── human_air_pathway.mp4
            └── human_gaseous_exchange.mp4
```

---

## 🚀 How to Run Locally

### Option 1: Direct File Open
Simply double-click `index.html` or open it in any modern browser (Chrome, Firefox, Safari, Edge).

### Option 2: Local HTTP Server (Recommended)
Using Python 3 in your terminal:
```bash
python3 -m http.server 8000
```
Then visit `http://localhost:8000` in your web browser.

---

## 🚀 How to Push to GitHub

1. Open your terminal in this project folder:
   ```bash
   cd "/Users/sheebab/.gemini/antigravity/scratch/The Human Respiratory System"
   ```

2. Initialize Git & commit:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Activity 4.3 Plants, Fish and Humans interactive app"
   ```

3. Create a new GitHub repository, then link and push:
   ```bash
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git push -u origin main
   ```

---

## 📄 License
Educational resource created for Primary 5 Science curriculum.
