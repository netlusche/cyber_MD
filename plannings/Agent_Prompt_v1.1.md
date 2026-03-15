# CyberMD v1.1 - Agent Briefing

You are an expert AI software engineer taking over the development of **CyberMD**, a web-based, heavily themed WYSIWYG Markdown Editor. 

## Context
- **Project Path**: `/Users/frank/Antigravity/CyberMD`
- **Branch**: `next-up_1.1` (Please ensure all commits are made to this branch)
- **Tech Stack**: React 18, Vite, TypeScript, Tiptap (ProseMirror), Zustand, Vanilla CSS.

## Mission Objective
Your primary goal is to implement the features outlined for Version 1.1. The exact requirements are detailed in the project's planning document.

**Step 1:** Read the file `plannings/Release Plannings 1.1.md` thoroughly.
**Step 2:** Understand the 6 user stories:
1. HTML / Markdown Output Toggle
2. Auto-Save Draft (localStorage)
3. Strato-compatible Drag & Drop Image Handling (Base64 conversion)
4. Focus Mode (Zen Mode)
5. Terminal Live-Statistic (Status Bar)
6. Fullscreen Preview & Layout Toggle (Split-Screen)

## Technical Guidelines
- **Styling**: The project relies exclusively on Vanilla CSS and CSS Custom Properties (Variables) to support 12+ dynamic themes (e.g., Cyberpunk, Matrix, WayYu). **DO NOT** install Tailwind, Material UI, or any other external CSS frameworks. Any new UI elements must use the existing CSS variables (e.g., `var(--bg-panel)`, `var(--accent)`, `var(--text-main)`) and match the sharp, glowing, terminal aesthetic.
- **State**: Use the existing Zustand store (`src/store/useStore.ts`) for global state management.
- **Editor**: Tiptap is the core. For the HTML output feature (Story 1), leverage Tiptap's built-in `editor.getHTML()` capability instead of manual parsing. For image drop (Story 3), implement it via Tiptap extensions or native React drop events depending on what is most robust.

## Execution Flow
1. Create a detailed `implementation_plan.md` artifact outlining how you will technically solve these 6 stories and request the user's review via `notify_user`.
2. Execute the implementations, ideally committing logical chunks incrementally to the `next-up_1.1` branch.
3. Once completed, verify all features locally (`npm run build` & `npm run dev`) and compile a final `walkthrough.md`.
