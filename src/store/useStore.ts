import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'cyberpunk' | 'man-machine' | 'matrix' | 'lcars' | 'megacorp' | 'trauma-team' | 'wayyu' | 'robco' | 'outrun' | 'the-grid' | 'steampunk' | 'the-force' | 'arakis' | 'comic';

interface AppState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  markdown: string;
  setMarkdown: (md: string) => void;
  html: string;
  setHtml: (html: string) => void;
  json: any;
  setJson: (json: any) => void;
  isFocusMode: boolean;
  setFocusMode: (isFocusMode: boolean) => void;
  layout: 'split' | 'editor' | 'preview';
  setLayout: (layout: 'split' | 'editor' | 'preview') => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      theme: 'cyberpunk',
      setTheme: (theme) => set({ theme }),
      markdown: '',
      setMarkdown: (markdown) => set({ markdown }),
      html: '',
      setHtml: (html) => set({ html }),
      json: null,
      setJson: (json) => set({ json }),
      isFocusMode: false,
      setFocusMode: (isFocusMode) => set({ isFocusMode }),
      layout: 'split',
      setLayout: (layout) => set({ layout }),
    }),
    {
      name: 'cybermd-storage', // Key im localStorage (renamed from cybermd-theme-storage for backward/forward compat, or maybe keep the name?)
      partialize: (state) => ({ theme: state.theme, markdown: state.markdown, html: state.html, json: state.json }), 
    }
  )
);
