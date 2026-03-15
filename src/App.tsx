import { useEffect, useState, useRef } from 'react';
import './App.css';
import { Editor } from './components/Editor';
import { useAppStore } from './store/useStore';
import { StatusBar } from './components/StatusBar';
import { ChevronDown } from 'lucide-react';
// @ts-ignore
import html2pdf from 'html2pdf.js';

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
  const { theme, setTheme, markdown, html, focusMode, layout, setLayout } = useAppStore();
  const [previewMode, setPreviewMode] = useState<'markdown' | 'html'>('markdown');
  const [actionsOpen, setActionsOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [previewExportOpen, setPreviewExportOpen] = useState(false);
  const pdfExportRef = useRef<HTMLDivElement>(null);

  const themesList = [
    { id: 'cyberpunk', name: 'Cyberpunk' },
    { id: 'plain', name: 'Plain Light' },
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

  // Mobile responsiveness: prevent SPLIT layout on small screens
  useEffect(() => {
    const checkLayout = () => {
      if (window.innerWidth < 1024 && layout === 'split') {
        setLayout('editor');
      }
    };
    
    // Initial check
    checkLayout();

    window.addEventListener('resize', checkLayout);
    return () => window.removeEventListener('resize', checkLayout);
  }, [layout, setLayout]);

  const handleExportPDF = async () => {
    if (!pdfExportRef.current) return;

    try {
      const computedStyles = getComputedStyle(document.body);
      const bgMain = computedStyles.getPropertyValue('--bg-main').trim() || '#0c0d10';

      const opt: any = {
        margin:       10,
        filename:     'cyber_transmission.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { 
          scale: 2, 
          useCORS: true, 
          logging: false,
          backgroundColor: bgMain
        },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      // Temporarily make it visible but outside of view for absolute accurate rendering
      pdfExportRef.current.style.top = '0px';
      pdfExportRef.current.style.opacity = '1';
      pdfExportRef.current.style.zIndex = '-9999';

      const pdf = await html2pdf().set(opt).from(pdfExportRef.current).toPdf().get('pdf');
      const pdfBlob = pdf.output('blob');

      // Put it back
      pdfExportRef.current.style.top = '-9999px';
      pdfExportRef.current.style.opacity = '0';

      if ('showSaveFilePicker' in window) {
        // @ts-ignore
        const fileHandle = await window.showSaveFilePicker({
          suggestedName: `cyber_transmission.pdf`,
          types: [{ description: `PDF File`, accept: { 'application/pdf': ['.pdf'] } }],
        });
        const writable = await fileHandle.createWritable();
        await writable.write(pdfBlob);
        await writable.close();
      } else {
        const url = URL.createObjectURL(pdfBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cyber_transmission.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('PDF Export failed during generation:', err);
      if (pdfExportRef.current) {
        pdfExportRef.current.style.top = '-9999px';
        pdfExportRef.current.style.opacity = '0';
      }
    }
  };

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
      {focusMode === 'none' && (
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
                  <button className="btn-action-dropdown" onMouseDown={() => { handleNewClick(); setActionsOpen(false); }}>NEW</button>
                  <button className="btn-action-dropdown" onMouseDown={() => { handleLoad(); setActionsOpen(false); }}>LOAD .MD</button>
                  <button className="btn-action-dropdown" onMouseDown={() => { handleLoadHtml(); setActionsOpen(false); }}>LOAD .HTML</button>
                  <button className="btn-action-dropdown" onMouseDown={() => { handleDemo(); setActionsOpen(false); }}>TUTORIAL</button>
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '1rem', minWidth: '200px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
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
                        className={`btn-action-dropdown ${theme === t.id ? 'dropdown-active' : ''}`}
                        onMouseDown={() => {
                          setTheme(t.id as any);
                          setThemeOpen(false);
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
              >WYSIWYG</button>
              <button 
                className={`btn-cyber split-btn-toggle ${layout === 'split' ? 'btn-active' : ''}`} 
                onClick={() => setLayout('split')}
                style={{ border: 'none', borderRadius: 0, margin: 0, borderLeft: '1px solid var(--accent)', borderRight: '1px solid var(--accent)' }}
              >SPLIT</button>
              <button 
                className={`btn-cyber ${layout === 'preview' ? 'btn-active' : ''}`} 
                onClick={() => setLayout('preview')}
                style={{ border: 'none', borderRadius: 0, margin: 0 }}
              >CODE</button>
            </div>
          </div>
        </header>
      )}

      <div className="split-view" style={{ flex: 1, overflow: 'hidden', margin: 0, padding: focusMode !== 'none' ? '0' : '1rem' }}>
        <div className="editor-pane neo-box" style={{ 
          display: (focusMode === 'none' && layout === 'preview') ? 'none' : undefined,
          flex: focusMode !== 'none' || layout === 'editor' ? 1 : 0.5, 
          border: focusMode !== 'none' ? 'none' : undefined, 
          borderRadius: focusMode !== 'none' ? 0 : undefined 
        }}>
            <Editor />
            { (layout === 'editor' || focusMode !== 'none') && (
              <div className="export-btn-container" style={{ zIndex: 10 }}>
                <button className="btn-cyber" onClick={() => setExportOpen(!exportOpen)}>
                  EXPORT <ChevronDown size={16} style={{ marginLeft: '4px' }}/>
                </button>
                {exportOpen && (
                  <div className="custom-dropdown-menu" style={{ bottom: '100%', top: 'auto', marginBottom: '8px', right: 0, left: 'auto' }}>
                    <button className="btn-action-dropdown" onMouseDown={() => {
                      navigator.clipboard.writeText(markdown).then(() => {
                        console.log('Copied Markdown to clipboard');
                      });
                      setExportOpen(false);
                    }}>COPY .MD</button>
                    <button className="btn-action-dropdown" onMouseDown={async () => {
                      try {
                        if ('showSaveFilePicker' in window) {
                          // @ts-ignore
                          const fileHandle = await window.showSaveFilePicker({
                            suggestedName: `cyber_transmission.md`,
                            types: [{ description: `MARKDOWN File`, accept: { 'text/markdown': ['.md'] } }],
                          });
                          const writable = await fileHandle.createWritable();
                          await writable.write(markdown);
                          await writable.close();
                        } else {
                          const blob = new Blob([markdown], { type: 'text/markdown' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `cyber_transmission.md`;
                          document.body.appendChild(a);
                          a.click();
                          document.body.removeChild(a);
                          URL.revokeObjectURL(url);
                        }
                      } catch (err) {
                        console.error('Save failed:', err);
                      }
                      setExportOpen(false);
                    }}>EXPORT .MD</button>
                    <button className="btn-action-dropdown" onMouseDown={() => { handleExportPDF(); setExportOpen(false); }}>EXPORT PDF</button>
                  </div>
                )}
              </div>
            )}
          </div>

        {(focusMode === 'none' && layout !== 'editor') && (
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
            
            <div className="export-btn-container" style={{ zIndex: 10 }}>
              <button className="btn-cyber" onClick={() => setPreviewExportOpen(!previewExportOpen)}>
                EXPORT <ChevronDown size={16} style={{ marginLeft: '4px' }}/>
              </button>
              {previewExportOpen && (
                <div className="custom-dropdown-menu" style={{ bottom: '100%', top: 'auto', marginBottom: '8px', right: 0, left: 'auto' }}>
                  <button className="btn-action-dropdown" onMouseDown={() => { handleCopy(); setPreviewExportOpen(false); }}>COPY {previewMode.toUpperCase()}</button>
                  <button className="btn-action-dropdown" onMouseDown={() => { handleExport(); setPreviewExportOpen(false); }}>EXPORT .{previewMode === 'markdown' ? 'MD' : 'HTML'}</button>
                  <button className="btn-action-dropdown" onMouseDown={() => { handleExportPDF(); setPreviewExportOpen(false); }}>EXPORT PDF</button>
                </div>
              )}
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

      {/* Hidden container for PDF rendering - completely integrated into the React tree */}
      <div 
        style={{
          position: 'absolute',
          top: '-9999px',
          left: '0',
          width: '800px',
          opacity: 0,
          pointerEvents: 'none',
          backgroundColor: 'var(--bg-main)'
        }}
      >
        <div ref={pdfExportRef} style={{ padding: '2rem', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }}>
          <div className="markdown-pane neo-box" style={{ border: 'none', boxShadow: 'none', margin: 0, padding: 0, background: 'transparent' }}>
            <div 
              className="code-output prose tiptap" 
              style={{ whiteSpace: 'normal', wordWrap: 'break-word', color: 'var(--text-main)', fontFamily: 'var(--font-secondary), sans-serif' }}
              dangerouslySetInnerHTML={{ __html: html }} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
