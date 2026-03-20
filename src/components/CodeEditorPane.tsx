import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../store/useStore';
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
      indentLevel = Math.max(0, indentLevel - 1);
      formatted += '\n' + tab.repeat(indentLevel) + token;
    } else if (token.match(/^<[a-zA-Z0-9]+.*>$/)) {
      formatted += '\n' + tab.repeat(indentLevel) + token;
      if (!token.match(/<(img|hr|br|input|meta|link|col)( |>|\/)/i)) {
        indentLevel++;
      }
    } else {
      formatted += token;
    }
  }

  formatted = formatted.replace(/>([^<]*)\n\s*<\//g, '>$1</');
  return formatted.trim();
};

export const CodeEditorPane: React.FC = () => {
  const { markdown, html, layout, setMarkdown, setHtml } = useAppStore();
  const [previewMode, setPreviewMode] = useState<'markdown' | 'html'>('markdown');
  const [previewExportOpen, setPreviewExportOpen] = useState(false);
  
  const [localValue, setLocalValue] = useState('');
  
  // Track if the change originated from the user typing here
  const isTypingRef = useRef(false);

  // Sync external changes (from Tiptap/Store) down to local textarea state
  useEffect(() => {
    if (!isTypingRef.current) {
       setLocalValue(previewMode === 'markdown' ? markdown : formatHTML(html));
    }
  }, [markdown, html, previewMode]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    isTypingRef.current = true;
    const newValue = e.target.value;
    setLocalValue(newValue);

    // Update Zustand instantly so we have truth (optional depending on use case, but needed for export)
    if (previewMode === 'markdown') {
      setMarkdown(newValue);
    } else {
      setHtml(newValue);
    }

    // Fire sync event to Tiptap
    window.dispatchEvent(
      new CustomEvent('cybermd-command', { 
        detail: { 
          type: 'sync', 
          format: previewMode,
          content: newValue 
        } 
      })
    );

    // Reset typing lock after a small delay
    setTimeout(() => {
       isTypingRef.current = false;
    }, 100);
  };

  const handleExportPDF = async () => {
    // The easiest way to trigger export PDF is to dispatch a custom event that App.tsx listens to,
    // or pass handleExportPDF as a prop. Let's dispatch a custom event.
    window.dispatchEvent(new CustomEvent('cybermd-export-pdf'));
  };

  const handleExportDocx = async () => {
    window.dispatchEvent(new CustomEvent('cybermd-export-docx'));
  };

  const handleExport = async () => {
    try {
      const contentToExport = localValue;
      const fileExt = previewMode === 'markdown' ? '.md' : '.html';
      const fileType = previewMode === 'markdown' ? 'text/markdown' : 'text/html';

      if ('showSaveFilePicker' in window) {
        // @ts-ignore
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
      } else {
        const blob = new Blob([contentToExport], { type: fileType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cyber_transmission${fileExt}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Save cancelled or failed:', err);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(localValue).then(() => {
      console.log('Copied to clipboard');
    });
  };

  return (
    <div className="markdown-pane neo-box" style={{ flex: layout === 'preview' ? 1 : 0.5, display: 'flex', flexDirection: 'column' }}>
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
      
      <textarea 
        className="code-output" 
        style={{ 
          flex: 1, 
          width: '100%', 
          marginTop: '2rem', 
          paddingBottom: '3rem', 
          resize: 'none', 
          border: 'none', 
          outline: 'none', 
          background: 'transparent',
          color: 'var(--text-main)',
          fontFamily: 'monospace',
          lineHeight: '1.5'
        }}
        value={localValue}
        onChange={handleChange}
        spellCheck={false}
      />
      
      <div className="export-btn-container" style={{ zIndex: 10 }}>
        <button className="btn-cyber" onClick={() => setPreviewExportOpen(!previewExportOpen)}>
          EXPORT <ChevronDown size={16} style={{ marginLeft: '4px' }}/>
        </button>
        {previewExportOpen && (
          <div className="custom-dropdown-menu" style={{ bottom: '100%', top: 'auto', marginBottom: '8px', right: 0, left: 'auto' }}>
            <button className="btn-action-dropdown" onMouseDown={() => { handleCopy(); setPreviewExportOpen(false); }}>COPY {previewMode.toUpperCase()}</button>
            <button className="btn-action-dropdown" onMouseDown={() => { handleExport(); setPreviewExportOpen(false); }}>EXPORT .{previewMode === 'markdown' ? 'MD' : 'HTML'}</button>
            <button className="btn-action-dropdown" onMouseDown={() => { handleExportPDF(); setPreviewExportOpen(false); }}>EXPORT PDF</button>
            <button className="btn-action-dropdown" onMouseDown={() => { handleExportDocx(); setPreviewExportOpen(false); }}>EXPORT .DOCX</button>
          </div>
        )}
      </div>
    </div>
  );
};
