# Feature Request: Multi-Image Combination & Vectorization Workflow 🔗🖼️

This issue tracks the implementation of a new visual workflow that allows users to fetch images via URLs, combine multiple images using AI blending weights, and vectorize the result.

## 1. Link Node (Image Fetcher) 🔗
- **Goal:** Allow users to paste a URL to load an image onto the canvas without downloading/uploading manually.
- **Implementation:**
  - Create a new `LinkNode.tsx` component.
  - Input: Text field for the URL.
  - Action: Proxy endpoint (`/api/fetch-image`) to bypass CORS, download the image, and convert it to Base64.
  - Output: Image preview and an output handle containing the Base64 data.

## 2. Combine Ideas Node (Multi-Image AI Blend) 🧬
- **Goal:** Take two or more image inputs, apply blending weights, and use multimodal AI to generate a cohesive new image.
- **Implementation:**
  - Create a new `CombineIdeasNode.tsx` component.
  - Inputs: Multiple target handles for incoming edges (Base64 images).
  - UI:
    - Thumbnail previews of each connected image.
    - **Per-image influence sliders (0-100%)** to weigh their importance.
    - A text prompt field: "How should these be combined?"
  - Action: Send all images + prompt + weights to a new API endpoint (e.g., `/api/combine-images`) utilizing Gemini 1.5 Pro's multimodal capabilities to generate a unified PNG.
  - Output: Generated image preview and a downstream handle.

## 3. Right Sidebar Inspector Panel 🎛️
- **Goal:** Provide a clean properties panel for configuring nodes without cluttering the canvas.
- **Implementation:**
  - Listen to React Flow's `onSelectionChange` event.
  - Slide out a right-hand drawer showing the properties of the selected node (Name, Link URL, Metadata, etc.).

## 4. Node UX Improvements ✨
- **Status Indicators:** Add pulsing "RUNNING" or green "DONE" pills to node headers based on API state.
- **Toolbar:** Add contextual "Copy" and "Delete" icons to node headers.

## Workflow Example
`Link Node (Tennis pose)` + `Image Upload (Soccer player style)` -> **Combine Ideas Node (Prompt: "Create a unique illustration style")** -> `Vectorize Node (Image to SVG)` -> **Rendered Result**
