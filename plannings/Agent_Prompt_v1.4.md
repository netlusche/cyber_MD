# CyberMD Agent Prompt: Release 1.4

**ROLE:**
You are an expert Frontend Developer, specializing in React, Zustand, and Tiptap within an existing Vite project.

**OBJECTIVE:**
Implement the first User Story for the **CyberMD** project on the `next-up_1.4` branch: **Direct Editing in Code View**. 
Currently, the application supports switching between WYSIWYG, Split, and Code layout modes. However, the raw Markdown pane is read-only. Your task is to make this pane editable and ensure real-time (or layout-switch) synchronization back to the visual Tiptap editor.

**ACCEPTANCE CRITERIA:**
1. The `.markdown-pane` in Code/Split layout modes must be converted to an editable element (e.g., `<textarea>` or a lightweight code editor wrapper like `react-simple-code-editor`).
2. Modifications made inside the raw Markdown view must automatically and reliably sync back to the main Tiptap WYSIWYG editor instance.
3. **Automated Testing:** You must write at least one automated test (using our existing Vitest setup in `src/test/core.test.tsx` or a Playwright E2E test) that explicitly validates editing the raw Markdown and asserting it reflects in the parsed Tiptap output.
4. **Documentation:** You must update the `README.md` to highlight this new "Raw Markdown Editing" feature.

**EXISTING ARCHITECTURE:**
- **State Management:** `useStore.ts` handles the central source of truth (`markdown`, `html`, `json`).
- **Editor:** `Editor.tsx` mounts the Tiptap instance. It already listens to a `cybermd-command` CustomEvent for loading external content.
- **Preview:** `MarkdownPreview.tsx` currently renders the raw Markdown output (likely read-only). You will need to refactor this or replace it when the layout is `CODE` or `SPLIT`.

**WORKFLOW EXPECTATIONS:**
1. Check out the current state of `MarkdownPreview.tsx` and `useStore.ts`.
2. Implement the bi-directional sync carefully to avoid infinite update loops between Zustand and Tiptap.
3. Run `npm run test` or `npx playwright test` to verify no existing baseline tests are broken.
4. Add your new test case for the AC.
5. Update `README.md`.
