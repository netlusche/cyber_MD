import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'cyberpunk' | 'man-machine' | 'matrix' | 'lcars' | 'megacorp' | 'trauma-team' | 'wayyu' | 'robco' | 'outrun' | 'the-grid' | 'steampunk' | 'the-force' | 'arakis' | 'comic';

interface AppState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  markdown: string;
  setMarkdown: (md: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      theme: 'cyberpunk',
      setTheme: (theme) => set({ theme }),
      markdown: '',
      setMarkdown: (markdown) => set({ markdown }),
    }),
    {
      name: 'cybermd-theme-storage', // Key im localStorage
      partialize: (state) => ({ theme: state.theme }), // Nur das Theme speichern, nicht den Markdown-Inhalt
    }
  )
);
