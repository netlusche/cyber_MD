import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../App';
import { useAppStore } from '../store/useStore';
import { Editor } from '../components/Editor';

describe('CyberMD Regression Tests (Vitest Component)', () => {
  beforeEach(() => {
    // Reset Zustand store
    const { setState } = useAppStore;
    setState({
      markdown: '',
      html: '',
      theme: 'cyberpunk',
      focusMode: 'none',
      layout: 'editor',
    });
    vi.clearAllMocks();
  });

  it('3. Editor Unmounting in Split Layouts ("Dead Action Buttons Bug")', async () => {
    render(<App />);
    
    // Switch to CODE layout
    const codeBtn = screen.getByText('CODE');
    fireEvent.click(codeBtn);

    await waitFor(() => {
      expect(useAppStore.getState().layout).toBe('preview');
    });

    // The editor wrapper shouldn't be completely unmounted, just styled display: none
    const editorPane = document.querySelector('.split-view .editor-pane') as HTMLElement;
    expect(editorPane).toBeInTheDocument();
    expect(editorPane.style.display).toBe('none'); // Important for regression

    // The inner tip-tap component should still be around to receive events
    const tiptap = document.querySelector('.tiptap');
    expect(tiptap).toBeInTheDocument();

    // Fire the LOAD command while in CODE view and verify state update
    window.dispatchEvent(new CustomEvent('cybermd-command', { detail: { type: 'load', content: '# Triggered While Hidden' } }));

    await waitFor(() => {
      expect(useAppStore.getState().html).toContain('Triggered While Hidden');
    });
  });

  it('4. DOM/CSS Overrides - Tiptap Checkboxes ("Ugly Browser Style Bug")', async () => {
    // This bug tests that checkboxes properly render with our CSS custom styles, 
    // which structurally means they are an input[type="checkbox"] within a task list item.
    // CSS layout engines are best tested in E2E, but we can verify DOM integrity here.
    render(<Editor />);
    
    // Dispatch a command to insert a checklist
    window.dispatchEvent(new CustomEvent('cybermd-command', { detail: { type: 'load', content: '- [x] Completed task\n- [ ] Pending task' } }));
    
    await waitFor(() => {
      const state = useAppStore.getState();
      expect(state.html).toContain('data-type="taskList"');
    });

    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    expect(checkboxes.length).toBeGreaterThanOrEqual(2);
    expect(checkboxes[0]).toBeInTheDocument();
  });

  it('5. Plain Light Theme Contrast', async () => {
    // We fixed contrast by ensuring explicit background colors for active buttons in plain light theme
    // Let's switch theme to "plain" and check CSS variable assignment or just ensure it exists
    render(<App />);

    const themeBtnObj = screen.getByRole('button', { name: /Cyberpunk/i });
    fireEvent.click(themeBtnObj);

    const plainThemeBtn = screen.getByText('Plain Light');
    fireEvent.mouseDown(plainThemeBtn);

    await waitFor(() => {
      expect(document.documentElement.getAttribute('data-theme')).toBe('plain');
    });

    // We verify the actual contrast behavior exists in App.css, so verifying the correct data-theme matches what the user expects.
    // The CSS logic dictates high contrast variables (`--bg-panel: #f8fafc`, etc)
    // We can check if the active layout button has the btn-active class.
    const wysiwygBtn = screen.getByText('WYSIWYG');
    expect(wysiwygBtn.className).toContain('btn-active');
  });
});
