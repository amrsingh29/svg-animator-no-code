# Future Enhancement: Full Character Animation Platform

This document captures the vision to evolve SVG Animator into a full-featured character animation builder, inspired by tools like Seedance and similar AI-powered animation platforms.

## Target UI Components

### Already Built ✅
- **Node-based visual workflow** — React Flow canvas with drag-and-drop wiring
- **Text prompt input node** — Describes the desired animation/character
- **Reference image upload** — Image-to-SVG node accepts uploaded images
- **AI model integration** — Gemini connected via `/api/animate`
- **Live preview / Stage** — Result Node renders animated output
- **Project save / load** — Prisma + PostgreSQL persistence

### Medium Effort Gaps 🔧
- **Settings Node** — A configurable node with dropdowns for Mode (Fun/Serious), Trim (Auto/Manual), Think speed, Voice preset, and Music preset
- **AI Model Selector** — Allow users to pick between multiple AI backends (Gemini, OpenAI, Anthropic) from within the workspace
- **Auto-generated Code Panel** — A bottom panel that displays the generated React/CSS code in real-time as the animation is built
- **Multi-tab Projects** — Tab bar at the top allowing users to work on multiple projects simultaneously without navigating away
- **Full-screen Stage Mode** — An expanded preview that hides the node editor and shows only the rendered animation

### Major Effort Gaps 🚧
- **Audio Timeline with Waveform** — A horizontal scrubbing timeline at the bottom of the stage showing audio waveforms synced to the animation. Requires the Web Audio API and a waveform visualization library (e.g., WaveSurfer.js)
- **Voice & Music Integration** — Dropdown selectors for voice presets and background music tracks. Requires sourcing audio assets and integrating browser-based audio playback/recording
- **Video/Timeline Scrubbing** — Frame-by-frame playback control with a draggable playhead to jump to specific moments in the animation
- **3D Character Rendering** — Rendering full 3D animated characters (as opposed to 2D SVGs). Requires either integrating an external AI video generation API (Seedance, Kling, Runway) or building a WebGL/Three.js rendering pipeline

## Recommended Implementation Order
1. Settings Node + AI Model Selector (extends existing node system)
2. Code Preview Panel (new UI component, no backend changes)
3. Multi-tab Projects (state management refactor)
4. Full-screen Stage Mode (UI toggle)
5. Audio Timeline + Voice/Music (Web Audio API infrastructure)
6. 3D Character Rendering (external API integration or Three.js)

## Architecture Notes
- **LangChain** has been selected as the future LLM abstraction layer to support complex multi-step chaining workflows
- The current tech stack (Next.js, React Flow, Prisma) can support all of the above without a fundamental rewrite
- 3D rendering is the only feature that would require a fundamentally new rendering pipeline
