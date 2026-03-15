import { useEffect, useState } from 'react';
import './App.css';
import { Editor } from './components/Editor';
import { useAppStore } from './store/useStore';

function App() {
  const { theme, setTheme, markdown } = useAppStore();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const handleExport = async () => {
    try {
      // Modern File System Access API (für Dialog und echtes Speichern)
      if ('showSaveFilePicker' in window) {
        // @ts-ignore - TS doesn't fully understand the new API natively yet
        const fileHandle = await window.showSaveFilePicker({
          suggestedName: 'cyber_transmission.md',
          types: [{
            description: 'Markdown File',
            accept: { 'text/markdown': ['.md'] },
          }],
        });
        const writable = await fileHandle.createWritable();
        await writable.write(markdown);
        await writable.close();
        console.log('File saved successfully');
      } else {
        // Fallback for older browsers
        const blob = new Blob([markdown], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'cyber_transmission.md';
        document.body.appendChild(a); // Required for some browsers
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      // Error handling (e.g. if the user cancels the save dialog)
      console.error('Save cancelled or failed:', err);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(markdown).then(() => {
      // Optional: Show a subtle toast or visual feedback here
      console.log('Copied to clipboard');
    });
  };

  const [showNewConfirm, setShowNewConfirm] = useState(false);

  const handleNewClick = () => {
    setShowNewConfirm(true);
  };

  const confirmNew = () => {
    window.dispatchEvent(new CustomEvent('cybermd-command', { detail: { type: 'new' } }));
    setShowNewConfirm(false);
  };

  const handleLoad = async () => {
    try {
      if ('showOpenFilePicker' in window) {
        // @ts-ignore
        const [fileHandle] = await window.showOpenFilePicker({
          types: [{
            description: 'Markdown File',
            accept: { 'text/markdown': ['.md'] },
          }],
          multiple: false
        });
        const file = await fileHandle.getFile();
        const content = await file.text();
        window.dispatchEvent(new CustomEvent('cybermd-command', { detail: { type: 'load', content } }));
      } else {
        // Fallback: <input type="file" />
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.md';
        input.onchange = async (e: any) => {
          const file = e.target.files[0];
          if (!file) return;
          const content = await file.text();
          window.dispatchEvent(new CustomEvent('cybermd-command', { detail: { type: 'load', content } }));
        };
        input.click();
      }
    } catch (err) {
      console.error('File load failed or cancelled', err);
    }
  };

  return (
    <div className="app-container" data-theme={theme}>
      <header style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)', textShadow: '0 0 5px var(--accent-glow)' }}>CYBER_MD // TERMINAL</h2>
        
        <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem' }}>
          <button className="btn-cyber" onClick={handleNewClick}>NEW</button>
          <button className="btn-cyber" onClick={handleLoad}>LOAD .MD</button>
        </div>

        <div className="theme-selector">
          <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>THEME:</label>
          <select value={theme} onChange={(e) => setTheme(e.target.value as any)}>
            <option value="cyberpunk">Neon Cyberpunk</option>
            <option value="man-machine">Man Machine (Kraftwerk)</option>
            <option value="matrix">Matrix Green</option>
            <option value="lcars">LCARS (Star Trek)</option>
            <option value="megacorp">Megacorp (Light Mode)</option>
            <option value="trauma-team">MedBay / Trauma Team (Light)</option>
            <option value="wayyu">Weyland-Yutani (Aliens)</option>
            <option value="robco">RobCo Term Link (Fallout)</option>
            <option value="outrun">Outrun (Synthwave)</option>
            <option value="the-grid">The Grid (Tron)</option>
            <option value="steampunk">Steampunk (Brass)</option>
            <option value="the-force">The Force (Star Wars)</option>
            <option value="arakis">Arrakis (Dune)</option>
            <option value="comic">Comic (Marvel)</option>
          </select>
        </div>
      </header>

      <div className="split-view">
        <div className="editor-pane neo-box">
          <Editor />
        </div>

        <div className="markdown-pane neo-box">
          <h4 style={{ position: 'absolute', top: '0.5rem', right: '1rem', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Live Markdown Out</h4>
          <pre className="code-output">{markdown}</pre>
          
          <div className="export-btn-container">
            <button className="btn-action" onClick={handleCopy} style={{ background: 'transparent', color: 'var(--accent)' }}>
              COPY MD
            </button>
            <button className="btn-action" onClick={handleExport}>
              EXPORT .MD
            </button>
          </div>
        </div>
      </div>
      
      {showNewConfirm && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div className="neo-box" style={{ padding: '2rem', maxWidth: '400px', textAlign: 'center' }}>
            <h3 style={{ color: 'var(--accent)', marginBottom: '1rem', textTransform: 'uppercase' }}>Warning</h3>
            <p style={{ marginBottom: '1.5rem', color: 'var(--text-main)' }}>
              Bist du sicher? Alle ungespeicherten Änderungen gehen verloren.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button className="btn-action" onClick={confirmNew}>PROCEED</button>
              <button className="btn-cyber" onClick={() => setShowNewConfirm(false)}>CANCEL</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
