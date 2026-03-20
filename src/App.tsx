import { useEffect, useState, useRef } from 'react';
import './App.css';
import { Editor } from './components/Editor';
import { useAppStore } from './store/useStore';
import { StatusBar } from './components/StatusBar';
import { CodeEditorPane } from './components/CodeEditorPane';
import { ChevronDown } from 'lucide-react';
// @ts-ignore
import html2pdf from 'html2pdf.js';

const App = () => {
  const { theme, setTheme, markdown, html, focusMode, layout, setLayout } = useAppStore();
  const [actionsOpen, setActionsOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const pdfExportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handlePdfExport = () => handleExportPDF();
    window.addEventListener('cybermd-export-pdf', handlePdfExport);
    return () => window.removeEventListener('cybermd-export-pdf', handlePdfExport);
  }, []);

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
      let fileHandle: FileSystemFileHandle | undefined;
      // Request file picker BEFORE the heavy PDF generation to retain user gesture
      if ('showSaveFilePicker' in window) {
        // @ts-ignore
        fileHandle = await window.showSaveFilePicker({
          suggestedName: `cyber_transmission.pdf`,
          types: [{ description: `PDF File`, accept: { 'application/pdf': ['.pdf'] } }],
        });
      }

      const opt: any = {
        margin:       10,
        filename:     'cyber_transmission.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { 
          scale: 2, 
          useCORS: true, 
          logging: false,
          backgroundColor: '#ffffff' // Force white background for the PDF
        },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      // Create a clone of the render container so we can sanitize it without touching the React DOM
      const clone = pdfExportRef.current.cloneNode(true) as HTMLElement;
      clone.style.top = '0px';
      clone.style.opacity = '1';
      clone.style.zIndex = '-9999';
      
      // Enforce the 'plain' light theme on the cloned container for clean PDF output
      clone.setAttribute('data-theme', 'plain');
      clone.style.backgroundColor = '#ffffff';
      clone.style.color = '#333333';
      
      // Remove the cyberpunk UI box shadow and borders from the markdown container
      const markdownPane = clone.querySelector('.markdown-pane');
      if (markdownPane) {
        markdownPane.classList.remove('neo-box');
        (markdownPane as HTMLElement).style.border = 'none';
        (markdownPane as HTMLElement).style.boxShadow = 'none';
        (markdownPane as HTMLElement).style.background = 'transparent';
      }

      const codeOutput = clone.querySelector('.code-output');
      if (codeOutput) {
        (codeOutput as HTMLElement).style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
        (codeOutput as HTMLElement).style.color = '#333333';
      }

      // Explicitly override ALL fonts via an injected style block so headers and specific elements aren't missed
      const styleNode = document.createElement('style');
      styleNode.innerHTML = `
        * {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
        }
        pre, code, pre *, code * {
          font-family: ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace !important;
        }
      `;
      clone.appendChild(styleNode);

      document.body.appendChild(clone);

      // Allow the DOM to repaint so html2canvas captures valid content after system dialog closes
      await new Promise(resolve => requestAnimationFrame(resolve));
      await new Promise(resolve => setTimeout(resolve, 100));

      // Workaround for html2canvas IndexSizeError: 
      // It crashes when text-transform: uppercase changes string length (e.g. 'ß' -> 'SS') 
      // or when encountering zero-width spaces injected by Prosemirror.
      const sanitizeNode = (node: Node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const el = node as HTMLElement;
          Array.from(el.childNodes).forEach(sanitizeNode);
          
          const style = window.getComputedStyle(el);
          const isUppercase = style.textTransform === 'uppercase';
          
          for (let i = 0; i < el.childNodes.length; i++) {
            const child = el.childNodes[i];
            if (child.nodeType === Node.TEXT_NODE && child.textContent) {
               let text = child.textContent.replace(/[\u200B-\u200D\uFEFF]/g, '');
               if (isUppercase) text = text.toUpperCase();
               child.textContent = text;
            }
          }
          if (isUppercase) {
             el.style.setProperty('text-transform', 'none', 'important');
          }
        }
      };
      
      sanitizeNode(clone);

      const pdfBlob = await html2pdf().set(opt).from(clone).output('blob');
      
      document.body.removeChild(clone);

      if (fileHandle) {
        const writable = await fileHandle.createWritable();
        await writable.write(pdfBlob);
        await writable.close();
      } else {
        // Fallback for browsers without File System Access API
        const url = URL.createObjectURL(pdfBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cyber_transmission.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        // User cancelled the file picker, no need to log as error
        console.log('PDF Export cancelled by user.');
        return;
      }
      console.error('PDF Export failed during generation:', err);
      if (pdfExportRef.current) {
        pdfExportRef.current.style.top = '-9999px';
        pdfExportRef.current.style.opacity = '0';
      }
    }
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
          <CodeEditorPane />
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
