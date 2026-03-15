import { useEffect, useState } from 'react';
import './App.css';
import { Editor } from './components/Editor';
import { useAppStore } from './store/useStore';
import { StatusBar } from './components/StatusBar';
import { ChevronDown } from 'lucide-react';

const formatHTML = (html: string) => {
  let indentLevel = 0;
  const tab = '  ';
  let formatted = '';

  const cleanedHtml = html.replace(/>\s*</g, '><');
  const tokens = cleanedHtml.split(/(<[^>]+>)/g).filter(t => t.trim().length > 0);

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i].trim();
    if (!token) continue;

    if (token.match(/^<\/[a-zA-Z0-9]+>$/)) {
      // Closing tag
      indentLevel = Math.max(0, indentLevel - 1);
      formatted += '\n' + tab.repeat(indentLevel) + token;
    } else if (token.match(/^<[a-zA-Z0-9]+.*>$/)) {
      // Opening tag
      formatted += '\n' + tab.repeat(indentLevel) + token;
      if (!token.match(/<(img|hr|br|input|meta|link|col)( |>|\/)/i)) {
        indentLevel++;
      }
    } else {
      // Text
      formatted += token;
    }
  }

  // Cleanup: collapse text on the same line as its enclosing tags
  formatted = formatted.replace(/>([^<]*)\n\s*<\//g, '>$1</');
  return formatted.trim();
};

function App() {
  const { theme, setTheme, markdown, html, isFocusMode, layout, setLayout } = useAppStore();
  const [previewMode, setPreviewMode] = useState<'markdown' | 'html'>('markdown');
  const [actionsOpen, setActionsOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);

  const themesList = [
    { id: 'cyberpunk', name: 'Cyberpunk' },
    { id: 'man-machine', name: 'Man Machine' },
    { id: 'matrix', name: 'Matrix Green' },
    { id: 'lcars', name: 'LCARS' },
    { id: 'megacorp', name: 'Megacorp' },
    { id: 'trauma-team', name: 'MedBay' },
    { id: 'wayyu', name: 'Wey-Yu' },
    { id: 'robco', name: 'RobCo' },
    { id: 'outrun', name: 'Outrun' },
    { id: 'the-grid', name: 'The Grid' },
    { id: 'steampunk', name: 'Steampunk' },
    { id: 'the-force', name: 'The Force' },
    { id: 'arakis', name: 'Arrakis' },
    { id: 'comic', name: 'Comic' },
  ];

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const handleExport = async () => {
    try {
      const contentToExport = previewMode === 'markdown' ? markdown : formatHTML(html);
      const fileExt = previewMode === 'markdown' ? '.md' : '.html';
      const fileType = previewMode === 'markdown' ? 'text/markdown' : 'text/html';

      // Modern File System Access API (für Dialog und echtes Speichern)
      if ('showSaveFilePicker' in window) {
        // @ts-ignore - TS doesn't fully understand the new API natively yet
        const fileHandle = await window.showSaveFilePicker({
          suggestedName: `cyber_transmission${fileExt}`,
          types: [{
            description: `${previewMode.toUpperCase()} File`,
            accept: { [fileType]: [fileExt] },
          }],
        });
        const writable = await fileHandle.createWritable();
        await writable.write(contentToExport);
        await writable.close();
        console.log('File saved successfully');
      } else {
        // Fallback for older browsers
        const blob = new Blob([contentToExport], { type: fileType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cyber_transmission${fileExt}`;
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
    const contentToCopy = previewMode === 'markdown' ? markdown : formatHTML(html);
    navigator.clipboard.writeText(contentToCopy).then(() => {
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

  const [showDemoConfirm, setShowDemoConfirm] = useState(false);

  const handleDemo = () => {
    setShowDemoConfirm(true);
  };

  const confirmDemo = () => {
    window.dispatchEvent(new CustomEvent('cybermd-command', { detail: { type: 'demo' } }));
    setShowDemoConfirm(false);
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

  const handleLoadHtml = async () => {
    try {
      if ('showOpenFilePicker' in window) {
        // @ts-ignore
        const [fileHandle] = await window.showOpenFilePicker({
          types: [{
            description: 'HTML File',
            accept: { 'text/html': ['.html', '.htm'] },
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
        input.accept = '.html,.htm';
        input.onchange = async (e: any) => {
          const file = e.target.files[0];
          if (!file) return;
          const content = await file.text();
          window.dispatchEvent(new CustomEvent('cybermd-command', { detail: { type: 'load', content } }));
        };
        input.click();
      }
    } catch (err) {
      console.error('HTML File load failed or cancelled', err);
    }
  };

  return (
    <div className="app-container" data-theme={theme} style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      {!isFocusMode && (
        <header className="app-header" style={{ 
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem',
          padding: '1rem', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-panel)',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <img src="./cybermd-logo.png" alt="CyberMD Logo" className="app-logo" style={{ height: '48px', objectFit: 'contain' }} />
            <h2 className="app-title">
              CYBER_MD
              <span className="title-suffix">// TERMINAL</span>
            </h2>
          </div>
          
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <button 
                className="btn-cyber" 
                onClick={() => setActionsOpen(!actionsOpen)}
                style={{ color: 'var(--accent)', borderColor: 'var(--accent)' }}
              >
                ACTIONS <ChevronDown size={16} />
              </button>
              {actionsOpen && (
                <div className="custom-dropdown-menu">
                  <button className="btn-action-dropdown" onClick={() => { handleNewClick(); setActionsOpen(false); }}>NEW</button>
                  <button className="btn-action-dropdown" onClick={() => { handleLoad(); setActionsOpen(false); }}>LOAD .MD</button>
                  <button className="btn-action-dropdown" onClick={() => { handleLoadHtml(); setActionsOpen(false); }}>LOAD .HTML</button>
                  <button className="btn-action-dropdown" onClick={() => { handleDemo(); setActionsOpen(false); }}>TUTORIAL</button>
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem', minWidth: '200px' }}>
            <div className="theme-selector" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>THEME:</label>
              <div style={{ position: 'relative' }}>
                <button 
                  className="btn-cyber" 
                  onClick={() => setThemeOpen(!themeOpen)}
                  style={{ minWidth: '140px', justifyContent: 'space-between' }}
                >
                  {themesList.find(t => t.id === theme)?.name || 'THEME'} <ChevronDown size={16} />
                </button>
                {themeOpen && (
                  <div className="custom-dropdown-menu" style={{ right: 0, left: 'auto', maxHeight: '50vh', overflowY: 'auto' }}>
                    {themesList.map(t => (
                      <button 
                        key={t.id}
                        className="btn-action-dropdown"
                        onClick={() => {
                          setTheme(t.id as any);
                          setThemeOpen(false);
                        }}
                        style={{
                          backgroundColor: theme === t.id ? 'var(--accent)' : 'transparent',
                          color: theme === t.id ? 'var(--bg-base)' : 'var(--text-main)',
                        }}
                      >
                        {theme === t.id ? `> ${t.name}` : t.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div style={{ display: 'flex', borderRadius: 'var(--radius)', overflow: 'hidden', border: '1px solid var(--accent)' }}>
              <button 
                className={`btn-cyber ${layout === 'editor' ? 'btn-active' : ''}`} 
                onClick={() => setLayout('editor')}
                style={{ border: 'none', borderRadius: 0, margin: 0 }}
              >EDITOR</button>
              <button 
                className={`btn-cyber ${layout === 'split' ? 'btn-active' : ''}`} 
                onClick={() => setLayout('split')}
                style={{ border: 'none', borderRadius: 0, margin: 0, borderLeft: '1px solid var(--accent)', borderRight: '1px solid var(--accent)' }}
              >SPLIT</button>
              <button 
                className={`btn-cyber ${layout === 'preview' ? 'btn-active' : ''}`} 
                onClick={() => setLayout('preview')}
                style={{ border: 'none', borderRadius: 0, margin: 0 }}
              >PREVIEW</button>
            </div>
          </div>
        </header>
      )}

      <div className="split-view" style={{ flex: 1, overflow: 'hidden', margin: 0, padding: isFocusMode ? '0' : '1rem' }}>
        {((!isFocusMode && layout !== 'preview') || isFocusMode) && (
          <div className="editor-pane neo-box" style={{ flex: isFocusMode || layout === 'editor' ? 1 : 0.5, border: isFocusMode ? 'none' : undefined, borderRadius: isFocusMode ? 0 : undefined }}>
            <Editor />
          </div>
        )}

        {(!isFocusMode && layout !== 'editor') && (
          <div className="markdown-pane neo-box" style={{ flex: layout === 'preview' ? 1 : 0.5 }}>
            <div style={{ position: 'absolute', top: '0.5rem', right: '1rem', display: 'flex', gap: '0.5rem', zIndex: 10 }}>
              <button 
                className={`btn-cyber ${previewMode === 'markdown' ? 'btn-active' : ''}`} 
                onClick={() => setPreviewMode('markdown')}
                style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
              >MD</button>
              <button 
                className={`btn-cyber ${previewMode === 'html' ? 'btn-active' : ''}`} 
                onClick={() => setPreviewMode('html')}
                style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
              >HTML</button>
            </div>
            
            <pre className="code-output" style={{ flex: 1, overflow: 'auto', marginTop: '2rem', paddingBottom: '3rem' }}>
              {previewMode === 'markdown' ? markdown : formatHTML(html)}
            </pre>
            
            <div className="export-btn-container">
              <button className="btn-cyber" onClick={handleCopy}>
                COPY {previewMode.toUpperCase()}
              </button>
              <button className="btn-cyber" onClick={handleExport}>
                EXPORT .{previewMode === 'markdown' ? 'MD' : 'HTML'}
              </button>
            </div>
          </div>
        )}
      </div>
      
      <StatusBar />
      
      {showNewConfirm && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 999,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div className="neo-box" style={{ padding: '2rem', textAlign: 'center', maxWidth: '400px', backgroundColor: 'var(--bg-panel)' }}>
            <h3 style={{ color: 'var(--accent)', marginBottom: '1rem', textShadow: '0 0 10px var(--accent-glow)' }}>WARNING</h3>
            <p style={{ marginBottom: '2rem', lineHeight: 1.5 }}>
              Are you sure? All unsaved changes will be lost.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button className="btn-action" onClick={confirmNew}>PROCEED</button>
              <button className="btn-cyber" onClick={() => setShowNewConfirm(false)}>CANCEL</button>
            </div>
          </div>
        </div>
      )}

      {showDemoConfirm && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 999,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div className="neo-box" style={{ padding: '2rem', textAlign: 'center', maxWidth: '400px', backgroundColor: 'var(--bg-panel)' }}>
            <h3 style={{ color: 'var(--accent)', marginBottom: '1rem', textShadow: '0 0 10px var(--accent-glow)' }}>WARNING</h3>
            <p style={{ marginBottom: '2rem', lineHeight: 1.5 }}>
              Are you sure you want to load the Demo? All unsaved changes will be overwritten.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button className="btn-action" onClick={confirmDemo}>PROCEED</button>
              <button className="btn-cyber" onClick={() => setShowDemoConfirm(false)}>CANCEL</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
