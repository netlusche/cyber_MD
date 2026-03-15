# Cyber_MD Release 1.2 // Feature Planning

## Story 1: PDF Export [User Request]
**Goal:** Allow users to export their beautifully rendered Markdown/HTML directly into a distributable PDF format.
- **Tasks:**
  - Implement a library like `html2pdf.js` or `react-to-pdf`.
  - Add a new "Export" Select Overlay / Dropdown in Editor Mode to save space.
  - This dropdown should group together: `Copy .md`, `Export .md`, and `Export PDF`.
  - Ensure the exported PDF strictly respects the active Cyberpunk theme (colors, fonts, borders).
  - Test page breaks and layout consistency.

## Story 2: Typewriter Mode
**Goal:** Ultimate focus mode for writers.
- **Tasks:**
  - When toggled on, the active typing line is always locked to the vertical center of the screen.
  - The document scrolls up automatically as you type, just like a real typewriter. 
  - **Activation UX:** To save space on mobile screens, convert the existing "Zen Mode" toggle button into a Dropdown/Select Menu. Users click the Zen icon to choose between activating traditional `Zen Mode` or the new `Typewriter Mode`.
