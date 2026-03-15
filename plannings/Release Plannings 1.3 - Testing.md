# Automated Testing Implementation (Release 1.3)

## Prompt for the Next AI Agent

**ROLE:**
You are an expert Frontend QA Automation Engineer, specializing in React, Vite, and Playwright/Vitest. 

**OBJECTIVE:**
Implement a comprehensive, automated testing suite for **CyberMD** in the `next-up_1.3` branch. Focus heavily on preventing regressions for the bugs and edge-cases we encountered during Release 1.2 development. CyberMD is a browser-based Markdown editor built with React, Tiptap, Zustand, and custom CSS variables for theming.

**TECH STACK RECOMMENDATION:**
- **Unit/Component Tests:** Vitest + React Testing Library (for pure logic and simple component mounting)
- **E2E/Visual Tests:** Playwright (preferred due to the need to test complex visual layouts, PDF capturing with HTML2Canvas, and browser file dialogs)

**CORE FUNCTIONALITY TESTS (Mandatory Baseline):**
Before focusing on the edge-cases, you must implement a robust baseline of E2E and Unit tests covering the entire feature set of the application:
1. **Markdown Compilation:** Validate that Tiptap correctly parses Markdown input and generates accurate HTML/GFM output in the "CODE" (Preview) pane.
2. **Formatting Tools:** Test all toolbar buttons (Bold, Italic, Headers 1-3, Lists, Blockquotes, Inline Code, Code Blocks, Horizontal Rules).
3. **Complex Plugins:** Test the insertion and rendering of Interactive Tables (via the 8x8 picker grid), Image embeds (Base64 conversion and rendering), and Links.
4. **Layout Modes:** Verify that switching between WYSIWYG, SPLIT, and CODE layouts correctly adjusts flexbox widths and visibility without breaking the UI.
5. **Focus Modes:** Ensure ZEN mode hides the UI panels and Typewriter mode keeps the cursor vertically centered during rapid DOM changes.
6. **File I/O:** Mock the File System Access API and test "NEW" (clearing document with warning modal), "LOAD .MD / .HTML" (loading structured content into Tiptap), and "COPY" (clipboard writing).
7. **Theming Engine:** Verify that switching themes via the dropdown correctly injects the right CSS variables (`--bg-main`, `--text-main`, `--accent`) into the DOM root.
8. **Auto-Save:** Confirm that typing in the editor correctly updates the Zustand store and persists data to `localStorage`.

**REGRESSION TEST SCENARIOS (Based on Past Bugs & Challenges):**

1. **PDF Export Reliability (The "Empty PDF Bug")**
   - *Context:* We struggled for a long time with `html2canvas` generating completely blank white PDFs because the target element was initially hidden or had `z-index: -99999`. We fixed this by rendering a dedicated, strictly visible `pdfContentRef` off-screen inside a `div` during export.
   - *Test Requirement:* Write an E2E test that triggers the PDF export (`EXPORT PDF` dropdown item) and validates that the resulting buffer/blob is NOT 0 bytes and does not contain just a blank white canvas. (Mocking the Native File System API might be necessary).

2. **Responsive Toolbar & Flexbox Wrapping (The "Disappearing Menu Bug")**
   - *Context:* The Toolbar logic uses a `ResizeObserver` to set `isMobile` (<750px) and `isSuperCompact` (<450px) states. The "More Tools" (`...`) button kept either completely disappearing on smartphones or suddenly wrapping onto a new line, breaking the UI.
   - *Test Requirement:* Use Playwright to resize the viewport to `700px` (Tablet) and `<400px` (Mobile). Verify that the `lucide-react` `MoreHorizontal` icon is present in the DOM, strictly visible in the *first row* of formatting tools alongside headers (H1/H2).

3. **Editor Unmounting in Split Layouts (The "Dead Action Buttons Bug")**
   - *Context:* When switching from `WYSIWYG` (Editor) to the `CODE` (Preview) layout window, the Tiptap `<Editor />` component was completely unmounted to save space. This caused the "NEW", "LOAD .MD" buttons (which send commands to the Tiptap instance) to do nothing. We solved this by using `display: 'none'` instead of unmounting.
   - *Test Requirement:* Write a test that switches the layout to `CODE` mode and then clicks "ACTIONS -> NEW" or "ACTIONS -> LOAD .MD". Assert that the internal Markdown state or Tiptap instance correctly receives this event and updates appropriately without throwing null reference errors.

4. **DOM/CSS Overrides - Tiptap Checkboxes (The "Ugly Browser Style Bug")**
   - *Context:* Tiptap `taskList` checkboxes rendered as default browser blue checkboxes, misaligned with the text. We heavily customized them via CSS (`App.css`).
   - *Test Requirement:* Generate a checklist in Tiptap. Verify that the checkbox input (`input[type="checkbox"]`) correctly inherits our custom CSS border radii, has a dark gray background (`#334155`) when checked, and is aligned via flexbox with the adjacent label.

5. **Plain Light Theme Contrast**
   - *Context:* The newly added "Plain Light" theme had contrast issues on buttons, blending in dark blue active states with black text. We fixed this by assigning explicit light-gray hover backgrounds (`#e2e8f0`).
   - *Test Requirement:* Switch the theme dropdown to "Plain Light". Assert that the `.btn-active` background color or selected dropdown background equals the correct high-contrast hex value.

**EXECUTION STEPS:**
1. Setup the testing infrastructure (`npm install -D vitest @playwright/test ...`).
2. Configure tests to run headlessly over the Vite dev server.
3. Commit incrementally as you resolve each of the 5 key test scenarios. Wait for user review if tests require deep mocking of browser filesystems.
4. **Documentation:** Produce a comprehensive markdown file at `/manuals/test_automation.md`. This file MUST contain:
   - Instructions on how to run the automated tests locally (Vitest & Playwright commands).
   - A structured list and brief explanation of every test case implemented, ensuring future developers understand *what* is being tested and *why* (especially regarding the regression bugs).
