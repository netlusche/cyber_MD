# CyberMD // TERMINAL

A web-based, theme-able WYSIWYG Markdown Editor built with React, Vite, and Tiptap.
Designed for a responsive, fast, and highly customizable writing experience with realtime GitHub Flavored Markdown (GFM) generation.

![CyberMD](https://img.shields.io/badge/Status-Online-00ffff.svg?style=flat-square) ![License](https://img.shields.io/badge/License-GPL_v3-ff003c.svg?style=flat-square) ![React](https://img.shields.io/badge/React-18-61dafb.svg?style=flat-square)

## Features

- **Realtime GFM & HTML:** Write in a modern WYSIWYG interface and see clean GitHub Flavored Markdown or raw HTML generated instantly on the right.
- **Advanced Formatting:** Full support for Headers, Bold/Italic, Blockquotes, Inline Code, Code Blocks, Task Lists (Checkboxes), and interactive Data Tables.
- **Image Integration (Base64):** Drag and drop or paste images seamlessly. They are automatically converted into Base64 strings and embedded natively into your document without external hosting.
- **Auto-Save Draft:** Your document state (ast, markdown, and html) is perpetually auto-saved locally in your browser. Never lose unsaved changes again.
- **Focus & Layout Modes:** Enter **ZEN Mode** to hide all UI clutter, or seamlessly toggle between Split-Screen, Full Editor, or Full Preview layouts.
- **Status Bar:** Keep track of live words, characters, and estimated reading time via a persistent, terminal-style footer.
- **Cyberpunk UI & 12+ Themes:** Choose from a wide variety of Sci-Fi and Pop Culture themes including:
  - Neon Cyberpunk
  - Man Machine (Kraftwerk)
  - Matrix Green
  - LCARS (Star Trek)
  - MedBay / Trauma Team
  - Weyland-Yutani (Aliens)
  - RobCo Term Link (Fallout)
  - Outrun (Synthwave)
  - The Grid (Tron)
  - Steampunk (Brass)
  - The Force (Star Wars)
  - Arrakis (Dune)
  - Comic (Marvel)
  - Megacorp (Light Corporate Mode)
- **Local File Management:** Safely load existing `.md` files directly from your disk and export/download your work via the native File System Access API.
- **Custom UI Overlays:** Interactive URL/Image prompts and an MS Word-style 8x8 grid for dynamic table insertion. No native browser blocks or focus issues.

## Tech Stack

- **Frontend Framework:** React 18+ with Vite and TypeScript
- **Editor Foundation:** [Tiptap](https://tiptap.dev/) (headless wrapper around ProseMirror)
- **Markdown Parser:** `tiptap-markdown`
- **State Management:** Zustand
- **Icons:** Lucide React
- **Security:** DOMPurify
- **Styling:** Pure Vanilla CSS using CSS Custom Properties (Variables) for robust, instant theme switching.

## Getting Started

Ready to connect your terminal to the Editor?

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd CyberMD
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`.

## Usage
- **NEW / DEMO:** Clears the editor or loads the base CyberMD tutorial. Shows a stylized cyberpunk warning modal to prevent accidental data loss.
- **LOAD .MD / .HTML:** Opens your file browser to pick a local markdown or HTML file and loads it deeply into the Tiptap structure. Base64 images are supported.
- **EXPORT / COPY:** Toggle your preview pane to `.md` or `.html` to download the specific compiled document natively to your disk or copy the raw output to your clipboard.
- **ZEN:** Hides toolbars and UI panels for a distraction-free writing experience.
- **LAYOUT:** Switch between `EDITOR`, `SPLIT`, and `PREVIEW` modes dynamically to suit your screen space.

## Customizing Themes
All themes are defined solely via CSS variables in `src/index.css`. To create a new theme:
1. Copy an existing `[data-theme="..."]` block in `src/index.css`.
2. Name it and adjust the hex colors for backgrounds, primary text, accents, and glows.
3. Add the string ID to the `Theme` type in `src/store/useStore.ts`.
4. Add an `<option>` to the settings dropdown in `src/App.tsx`.

## License
This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details.
