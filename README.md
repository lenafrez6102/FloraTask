# FloraTask

A standalone offline task timer and 3D botanical garden built with TypeScript, React 19, Vite, Three.js, and Tailwind CSS. Plant virtual seeds, track focus sessions, and watch your daily productivity bloom into a living garden of features, bug fixes, refactors, and creative work.

## Features

- **Interactive Focus Timer** — Start focus sessions with click-to-edit duration (`MM:SS`), quick presets (5m, 15m, 25m, 45m, 60m), and live blooming preview
- **3D Living Garden** — Interactive raised loam soil bed rendered with Three.js PBR lighting, OrbitControls, camera angle presets (Isometric, Top-Down, Close-Up), and interactive watering particles
- **Botanical Flower Varieties** — 6 distinct species mapped to task categories: Cherry Blossom (Feature), Lavender (Bug Fix), Chamomile Daisy (Refactor), Marigold (Research), Tulip (Design), and Mint Succulent (Documentation)
- **Natural Parametric Growth** — Subdivided bi-cubic parametric petal curvature, S-curved tapered stems, phototropic circumnutation, and staggered multi-whorl blooming without artificial domes
- **Batch Time Manager** — Adjust time across all tasks (`+5m`, `+15m`, `-5m`) or apply uniform durations across the garden in a single click
- **Herbarium Field Guide** — Interactive metamorphosis inspector with 0–100% growth scrubber, botanical facts, and 3D preview
- **Analytics & Distribution Charts** — Visual breakdown of time by category, Feature vs. Bug Fix distribution ratios, and 7-day productivity growth timelines
- **Offline Ambient Soundscapes** — Real-time synthesized Web Audio API soundscapes (Gentle Rain, Summer Breeze, Wind Chimes) with zero external audio assets
- **Data Persistence & Portability** — 100% offline LocalStorage persistence with full JSON backup export and import
- **Responsive & Accessible** — Clean zero-pill UI with desktop and mobile support, dual 3D Garden and 2D Botanical Bed views

---

## Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| [React 19](https://react.dev/) | Component architecture, declarative state, and hooks (`useRef`, `useState`, `useEffect`, `useCallback`) |
| [TypeScript](https://www.typescriptlang.org/) | Strict type safety for session models, botanical genetics, and 3D parameters |
| [Three.js r186](https://threejs.org/) | 3D scene graph, procedural geometry, PBR physical materials, lighting, and camera controls |
| [Tailwind CSS v4](https://tailwindcss.com/) | Modern utility-first CSS styling with clean typography and organic botanical palette |
| [Lucide React](https://lucide.dev/) | Minimalist UI icons for navigation, controls, and botanical indicators |
| [Motion](https://motion.dev/) | Smooth UI animations and micro-interactions |

### Backend & Infrastructure
| Technology | Purpose |
|---|---|
| [Vite 8](https://vite.dev/) | Fast development server and optimized client-side bundle compilation |
| [LocalStorage API](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) | Client-side persistent storage for garden sessions and user preferences |
| [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) | Pure procedural sound synthesis (pink noise generators, resonant bandpass filters, biquad chimes) |
| [Vercel / Cloud Run / Static Hosting](https://vercel.com/) | Lightweight zero-config static edge deployment |

### Key Libraries
| Library | Purpose |
|---|---|
| `three` | Core 3D engine: `WebGLRenderer`, `MeshPhysicalMaterial`, `BufferGeometry`, `RoomEnvironment` |
| `@types/three` | TypeScript type declarations for Three.js objects and math helpers |
| `lucide-react` | Scalable feather icons for garden tools, timer presets, and audio controls |
| `motion` | Spring and exit transitions for modals, badges, and analytics panels |

---

## Data Persistence & 3D Procedural Architecture

This project uses a dual-layer client-side architecture that eliminates external asset downloads and network latency while maintaining instantaneous rendering performance.

### Client-Side Persistence Layer (LocalStorage Engine)

All garden sessions, growth progress, category tags, and historical records are managed locally in the browser's `localStorage`. Reads are synchronous and immediate, and state writes notify reactive listeners across the app:

```ts
// utils/storage.ts
export function saveGardenSessions(sessions: GardenSession[]): void {
  try {
    localStorage.setItem('floratask_garden_sessions', JSON.stringify(sessions));
    window.dispatchEvent(new Event('floratask_sessions_updated'));
  } catch (error) {
    console.error('Failed to save garden sessions:', error);
  }
}
```

When a user completes a timer session, water drops are simulated, growth stages recalculate based on accrued time, and local storage triggers instant updates without requiring any cloud database.

### Procedural 3D Botanical Generation Layer

Instead of loading heavy `.glb`/`.gltf` 3D model files (which can fail offline or cause slow initial load times), all flower species, stems, leaves, and petal textures are procedurally synthesized on HTML5 Canvas:

```ts
// components/ThreeGarden/flowerGenerators.ts
const canvas = document.createElement('canvas');
canvas.width = 512;
canvas.height = 512;
const ctx = canvas.getContext('2d');

// Paint botanical radial gradient and vascular capillary veins
const texture = new THREE.CanvasTexture(canvas);
texture.colorSpace = THREE.SRGBColorSpace;
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm, bun, or yarn
- Modern web browser with WebGL 2.0 support (Chrome, Firefox, Safari, Edge)

### 1. Clone the repo

```bash
git clone https://github.com/your-username/floratask.git
cd floratask
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

The applet runs completely standalone and offline. Optional runtime variables:

```
APP_URL="http://localhost:3000"
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view your garden in the browser.

---

### Important Deployment Notes

- FloraTask runs 100% client-side with no required backend database or third-party API dependencies
- Procedural Three.js textures and Web Audio API oscillators are generated on-the-fly, so static host caching works out of the box
- WebGL software-fallback detection is built-in (`isSoftwareGl`), automatically tuning pixel ratios and shadow cascades for lower-powered devices

---

## Project Structure

```
src/
├── components/
│   ├── Analytics/
│   │   └── ProgressCharts.tsx       # Category distribution, Feature vs. Bug ratio, 7-day timeline
│   ├── Common/                      # Shared notification toast and UI components
│   ├── Garden/
│   │   ├── BatchTimeModal.tsx       # Bulk task time adjustor (+5m, +15m, uniform duration)
│   │   ├── FlowerDetailModal.tsx    # Flower inspector, inline rename, time edit, uprooting
│   │   ├── FlowerSvg.tsx            # High-fidelity 2D botanical SVG illustrations
│   │   ├── GardenPlot.tsx           # Garden bed container with 3D/2D switcher & date navigation
│   │   └── ManualPlantModal.tsx     # Direct seed planting modal with custom tags
│   ├── Herbarium/
│   │   └── FlowerEncyclopedia.tsx   # Field guide & 3D Metamorphosis growth scrubber
│   ├── ThreeGarden/
│   │   ├── BloomInspector3D.tsx     # Interactive single-flower 3D orbit inspection
│   │   ├── flowerGenerators.ts      # Procedural bi-cubic parametric petals, textures & stems
│   │   └── Garden3DScene.tsx        # 3D raised soil bed, OrbitControls, raycasting & rain particles
│   └── Timer/
│       └── FocusTimer.tsx           # Main Pomodoro timer with inline click-to-edit duration
├── constants/
│   └── categories.ts                # Botanical species definitions, colors, stages, and plant biology
├── types/
│   └── garden.ts                    # TypeScript definitions for tasks, stages, and categories
├── utils/
│   ├── audio.ts                     # Web Audio API synthesized soundscapes (Rain, Breeze, Chimes)
│   └── storage.ts                   # LocalStorage persistence, starter seed data, JSON export/import
├── App.tsx                          # Root application layout with tabbed navigation & sound controls
├── index.css                        # Tailwind CSS v4 entry point
└── main.tsx                         # React 19 application mount point
```

---

## Usage

### Starting a Focus Session
1. Enter your task title and select a category tag (e.g. *Feature*, *Bug Fix*, *Refactor*).
2. Choose a duration using the quick preset pills (`5m`, `15m`, `25m`, `45m`, `60m`) or **click directly on the `MM:SS` timer display** to type any custom duration.
3. Click **Start Focus** to begin accrual. The live flower preview will grow progressively as time passes.

### Changing Task Times in Bulk
Click the **Adjust Times** button above the garden bed to open the Batch Time Manager:
- Add or subtract time across all tasks (`+5m`, `+15m`, `-5m`).
- Set a uniform time (e.g. 25m or 45m) across all active plants.
- Tweak individual task times using inline steppers.

### 3D Garden Interaction
- **Rotate & Orbit**: Click and drag to orbit around the raised garden bed.
- **Zoom**: Scroll to zoom in on individual blooms.
- **Camera Angles**: Use the top-right camera pills to switch between *Isometric*, *Top Down*, and *Close Up* views.
- **Watering**: Click the watering can icon to shower the garden with 3D water particles.

### Reviewing Feature vs. Bug Fix Distribution
Switch to the **Garden Charts** tab to review:
- Category distribution breakdown (Total minutes & percentage per flower type).
- **Feature vs. Bug Fix Balance Ratio** to ensure your codebase maintenance is balanced with new development.
- 7-Day productivity timeline showing daily flower yields.

### Ambient Soundscapes
Click the audio pill in the top header to choose your synthesized background ambiance:
- **Gentle Rain** (Filtered pink noise with randomized raindrop clicks)
- **Summer Breeze** (Low-frequency modulated organic air draft)
- **Wind Chimes** (Pentatonic algorithmic metallic chimes)

---

## Major Note about Procedural 3D & Offline Architecture

FloraTask is designed with **zero external asset dependencies**:
- No external `.glb` / `.gltf` 3D files to download or fail.
- No remote image CDNs required for botanical textures; all vascular veins, gradients, and disc florets are rendered via procedural canvas shaders.
- No streaming audio files; all ambient rain, breeze, and chimes are synthesized directly in the client via the browser's native Web Audio API oscillators and filters.
- All session records remain on your local machine and can be backed up or restored anytime via the **JSON Backup & Restore** feature in the top navigation.

---

## License

MIT — free to use and modify for personal and educational projects.

