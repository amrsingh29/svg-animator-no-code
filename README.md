# SVG Animator No-Code 🎨✨

**SVG Animator No-Code** is a powerful visual node-based editor designed to simplify the creation, animation, and extraction of SVGs directly from the browser. It combines a seamless drag-and-drop workspace with AI-powered code generation to bring static vectors to life instantly.

## 🌟 Core Capabilities

### 🧠 AI-Powered Generation
* **Text-to-Animation**: Just describe how you want an SVG to animate (e.g., "make the logo pulse and glow continuously"), and the AI generation node writes the underlying CSS keyframes and applies them to your SVG.
* **Component Extraction**: Transforms animated SVGs into clean, usable inline React components that you can copy and paste directly into your codebase.

### 🔀 Node-Based Visual Editor
* **Unlimited Workspaces**: Utilize an infinite canvas built on top of `React Flow` to structurally wire your ideas together.
* **Drag-and-Drop Nodes**: Connect an **SVG Source** to a **Text Prompt**, route it through the **AI Generator**, and visualize the result instantly on the **Render Node**.

### 💼 Project and Asset Management
* **My Projects**: Save the exact state of your canvas (nodes, edges, prompts, and SVGs) to the database and resume editing them seamlessly at any time.
* **My Animations**: A curated gallery of exported, finalized SVG renders stored securely in your user account.
* **Duplicate Prevention**: Intelligently updates existing canvases upon save without polluting your dashboard.

### 🔐 Secure & Persistent
* **Authentication**: Seamless Google OAuth integration via `NextAuth.js`.
* **Database**: Supported by Prisma and PostgreSQL for reliable and secure workspace persistence.

## 🚀 Future Roadmap
We are actively tracking future capabilities via GitHub Issues, including Granular Transformation Nodes, Interactive Triggers (Hover/Click), Sequence Timely delays, and Lottie/MP4 export options.

## 🛠️ Getting Started
To run this application locally, please see the [Local Deployment Guide](docs/local-deployment-guide.md) inside the `docs` folder.

---
Built with Next.js, React Flow, Prisma, and ❤️.
