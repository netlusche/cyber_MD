import React, { useCallback, useState, useRef, useEffect } from 'react';
import { Editor } from '@tiptap/react';
import { 
  Bold, Italic, List, ListOrdered, CheckSquare, 
  Quote, Code, FileCode2, Image as ImageIcon, Link as LinkIcon,
  Minus, Table as TableIcon, Maximize, Minimize, MoreHorizontal
} from 'lucide-react';
import { useAppStore } from '../store/useStore';

interface ToolbarProps {
  editor: Editor | null;
}

export const Toolbar: React.FC<ToolbarProps> = ({ editor }) => {
  if (!editor) return null;

  const { isFocusMode, setFocusMode } = useAppStore();

  const toggleBold = useCallback(() => editor.chain().focus().toggleBold().run(), [editor]);
  const toggleItalic = useCallback(() => editor.chain().focus().toggleItalic().run(), [editor]);
  const toggleH1 = useCallback(() => editor.chain().focus().toggleHeading({ level: 1 }).run(), [editor]);
  const toggleH2 = useCallback(() => editor.chain().focus().toggleHeading({ level: 2 }).run(), [editor]);
  const toggleH3 = useCallback(() => editor.chain().focus().toggleHeading({ level: 3 }).run(), [editor]);
  const toggleBulletList = useCallback(() => editor.chain().focus().toggleBulletList().run(), [editor]);
  const toggleOrderedList = useCallback(() => editor.chain().focus().toggleOrderedList().run(), [editor]);
  const toggleTaskList = useCallback(() => editor.chain().focus().toggleTaskList().run(), [editor]);
  const toggleBlockquote = useCallback(() => editor.chain().focus().toggleBlockquote().run(), [editor]);
  const toggleCode = useCallback(() => editor.chain().focus().toggleCode().run(), [editor]);
  const toggleCodeBlock = useCallback(() => editor.chain().focus().toggleCodeBlock().run(), [editor]);
  const setHorizontalRule = useCallback(() => editor.chain().focus().setHorizontalRule().run(), [editor]);
  
  // Table Insertion UI State
  const [showTablePicker, setShowTablePicker] = useState(false);
  const [hoveredTableSize, setHoveredTableSize] = useState({ r: 0, c: 0 });
  const tablePickerRef = useRef<HTMLDivElement>(null);

  // Responsive Toolbar State
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isSuperCompact, setIsSuperCompact] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    if (!toolbarRef.current) return;
    
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        // Toolbar needs ~750px to comfortably fit all icons single-row
        const isCompact = entry.contentRect.width < 750;
        const isSuper = entry.contentRect.width < 450;
        setIsMobile(isCompact);
        setIsSuperCompact(isSuper);
        if (!isCompact) {
          setShowAdvanced(false);
        }
      }
    });

    observer.observe(toolbarRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (tablePickerRef.current && !tablePickerRef.current.contains(e.target as Node)) {
        setShowTablePicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const insertTable = useCallback((rows: number, cols: number) => {
    editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run();
    setShowTablePicker(false);
  }, [editor]);

  const [promptConfig, setPromptConfig] = useState<{ type: 'link' | 'image', defaultUrl?: string } | null>(null);
  const [promptUrl, setPromptUrl] = useState('');

  const handlePromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptConfig) return;

    if (promptConfig.type === 'link') {
      if (promptUrl === '') {
        editor.chain().focus().extendMarkRange('link').unsetLink().run();
      } else {
        editor.chain().focus().extendMarkRange('link').setLink({ href: promptUrl }).run();
      }
    } else if (promptConfig.type === 'image') {
      if (promptUrl) {
        editor.chain().focus().setImage({ src: promptUrl }).run();
      }
    }
    setPromptConfig(null);
    setPromptUrl('');
  };

  const addLink = useCallback(() => {
    const previousUrl = editor.getAttributes('link').href || '';
    setPromptUrl(previousUrl);
    setPromptConfig({ type: 'link' });
  }, [editor]);

  const addImage = useCallback(() => {
    setPromptUrl('');
    setPromptConfig({ type: 'image' });
  }, [editor]);

  return (
    <div ref={toolbarRef} className="toolbar-container neo-border" style={{ position: 'relative', flexWrap: 'nowrap', alignItems: 'flex-start' }}>
      {promptConfig && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'var(--bg-panel)', zIndex: 10,
          display: 'flex', alignItems: 'center', padding: '0 0.75rem', gap: '0.5rem'
        }}>
          <span style={{ color: 'var(--accent)', fontWeight: 'bold', fontSize: '0.85rem' }}>
            {promptConfig.type === 'link' ? 'LINK URL:' : 'IMAGE URL:'}
          </span>
          <form onSubmit={handlePromptSubmit} style={{ display: 'flex', flex: 1, gap: '0.5rem' }}>
            <input 
              autoFocus
              type="text" 
              value={promptUrl}
              onChange={(e) => setPromptUrl(e.target.value)}
              placeholder="https://..."
              style={{
                flex: 1,
                background: 'var(--bg-main)', color: 'var(--text-main)',
                border: '1px solid var(--border)', padding: '0.25rem 0.5rem',
                fontFamily: 'var(--font-mono)', outline: 'none', borderRadius: 'var(--radius)'
              }}
            />
            <button type="submit" className="btn-action" style={{ padding: '0.25rem 0.75rem' }}>OK</button>
            <button type="button" className="btn-cyber" onClick={() => setPromptConfig(null)}>X</button>
          </form>
        </div>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', flex: 1, alignItems: 'center' }}>
        <button 
          className={`btn-cyber ${editor.isActive('bold') ? 'btn-active' : ''}`}
          onClick={toggleBold} title="Bold"
        >
        <Bold size={16} />
      </button>
      <button 
        className={`btn-cyber ${editor.isActive('italic') ? 'btn-active' : ''}`}
        onClick={toggleItalic} title="Italic"
      >
        <Italic size={16} />
      </button>
      
      <div style={{ width: '1px', height: '20px', background: 'var(--border)', margin: '0 4px' }} />

      <button className={`btn-cyber ${editor.isActive('heading', { level: 1 }) ? 'btn-active' : ''}`} onClick={toggleH1}>H1</button>
      <button className={`btn-cyber ${editor.isActive('heading', { level: 2 }) ? 'btn-active' : ''}`} onClick={toggleH2}>H2</button>
      <button className={`btn-cyber ${editor.isActive('heading', { level: 3 }) ? 'btn-active' : ''}`} onClick={toggleH3}>H3</button>

      {(!isSuperCompact || showAdvanced) && (
        <>
          <div style={{ width: '1px', height: '20px', background: 'var(--border)', margin: '0 4px' }} />
          <button className={`btn-cyber ${editor.isActive('bulletList') ? 'btn-active' : ''}`} onClick={toggleBulletList} title="Bullet List"><List size={16} /></button>
          <button className={`btn-cyber ${editor.isActive('orderedList') ? 'btn-active' : ''}`} onClick={toggleOrderedList} title="Ordered List"><ListOrdered size={16} /></button>
          <button className={`btn-cyber ${editor.isActive('taskList') ? 'btn-active' : ''}`} onClick={toggleTaskList} title="Task List"><CheckSquare size={16} /></button>
        </>
      )}
      
      {isMobile && (
        <button 
          className={`btn-cyber ${showAdvanced ? 'btn-active' : ''}`} 
          onClick={() => setShowAdvanced(!showAdvanced)} 
          title="More Tools"
        >
          <MoreHorizontal size={16} />
        </button>
      )}

      {(!isMobile || showAdvanced) && (
        <>
          <div style={{ width: '1px', height: '20px', background: 'var(--border)', margin: '0 4px' }} />

          <button className={`btn-cyber ${editor.isActive('blockquote') ? 'btn-active' : ''}`} onClick={toggleBlockquote} title="Blockquote"><Quote size={16} /></button>
          <button className={`btn-cyber ${editor.isActive('code') ? 'btn-active' : ''}`} onClick={toggleCode} title="Inline Code"><Code size={16} /></button>
          <button className={`btn-cyber ${editor.isActive('codeBlock') ? 'btn-active' : ''}`} onClick={toggleCodeBlock} title="Code Block"><FileCode2 size={16} /></button>
          
          <div style={{ width: '1px', height: '20px', background: 'var(--border)', margin: '0 4px' }} />

          <button className="btn-cyber" onClick={addLink} title="Link"><LinkIcon size={16} /></button>
          <button className="btn-cyber" onClick={addImage} title="Image"><ImageIcon size={16} /></button>
          
          <div style={{ position: 'relative' }} ref={tablePickerRef}>
            <button 
              className="btn-cyber" 
              onClick={() => setShowTablePicker(!showTablePicker)} 
              title="Table"
            >
              <TableIcon size={16} />
            </button>
            
            {showTablePicker && (
              <div style={{
                position: 'absolute', top: '100%', left: 0, marginTop: '0.5rem',
                backgroundColor: 'var(--bg-panel)', border: '1px solid var(--border)',
                padding: '0.5rem', borderRadius: 'var(--radius)', zIndex: 50,
                boxShadow: '0 0 10px rgba(0,0,0,0.5)'
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '4px', marginBottom: '0.5rem' }}>
                  {Array.from({ length: 8 }).map((_, rowIndex) => (
                    Array.from({ length: 8 }).map((_, colIndex) => {
                      const r = rowIndex + 1;
                      const c = colIndex + 1;
                      const isHovered = r <= hoveredTableSize.r && c <= hoveredTableSize.c;
                      return (
                        <div 
                          key={`${r}-${c}`}
                          onMouseEnter={() => setHoveredTableSize({ r, c })}
                          onClick={() => insertTable(r, c)}
                          style={{
                            width: '18px', height: '18px',
                            border: '1px solid var(--border)',
                            backgroundColor: isHovered ? 'var(--accent)' : 'transparent',
                            cursor: 'pointer', transition: 'background-color 0.1s'
                          }}
                        />
                      );
                    })
                  ))}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
                  {hoveredTableSize.r > 0 ? `${hoveredTableSize.c} x ${hoveredTableSize.r} Table` : 'Select Size'}
                </div>
              </div>
            )}
          </div>

          <button className="btn-cyber" onClick={setHorizontalRule} title="Horizontal Rule"><Minus size={16} /></button>
        </>
      )}
      </div>

      <button 
        className={`btn-cyber ${isFocusMode ? 'btn-active' : ''}`} 
        onClick={() => setFocusMode(!isFocusMode)} 
        title="Zen Mode (Focus)"
        style={{ flexShrink: 0, margin: 0 }}
      >
        {isFocusMode ? <Minimize size={16} /> : <Maximize size={16} />}
      </button>
    </div>
  );
};
