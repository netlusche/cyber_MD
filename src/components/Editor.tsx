import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { TaskList } from '@tiptap/extension-task-list';
import { TaskItem } from '@tiptap/extension-task-item';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { Image } from '@tiptap/extension-image';
import { Link } from '@tiptap/extension-link';
import { Markdown } from 'tiptap-markdown';
import { Toolbar } from './Toolbar';
import { useAppStore } from '../store/useStore';

const INITIAL_CONTENT = `
# System Initialization...
**Status**: Online.

Welcome to the CyberMD interface.

## Quick Test Tasks
- [x] Boot sequence
- [ ] Connect to main frame
- [ ] Upload payload

## Data Transmission
| ID | Signal | Quality |
|---|---|---|
| 01 | XZ-9 | 99% |
| 02 | YK-2 | 45% |

> "Information wants to be free."

\`\`\`javascript
const hack = (target) => {
  return target.breach();
};
\`\`\`
`.trim();

export const Editor: React.FC = () => {
  const setMarkdown = useAppStore((state) => state.setMarkdown);
  const setHtml = useAppStore((state) => state.setHtml);
  const setJson = useAppStore((state) => state.setJson);
  const focusMode = useAppStore((state) => state.focusMode);

  const editor = useEditor({
    extensions: [
      StarterKit,
      TaskList,
      TaskItem.configure({ nested: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Image.configure({ allowBase64: true }),
      Link.configure({ openOnClick: false }),
      Markdown.configure({ html: true }),
    ],
    content: useAppStore.getState().json || useAppStore.getState().html || useAppStore.getState().markdown || INITIAL_CONTENT,
    onTransaction: ({ editor, transaction }) => {
      if (useAppStore.getState().focusMode === 'typewriter' && (transaction.docChanged || transaction.selectionSet)) {
        setTimeout(() => {
          const { view } = editor;
          if (!view || !view.dom) return;
          const { head } = view.state.selection;
          try {
            const coords = view.coordsAtPos(head);
            const scrollContainer = document.getElementById('editor-scroll-container');
            if (scrollContainer) {
              const containerRect = scrollContainer.getBoundingClientRect();
              const relY = coords.top - containerRect.top;
              const containerCenter = containerRect.height / 2;
              scrollContainer.scrollBy({
                top: relY - containerCenter + 20,
                behavior: 'smooth'
              });
            }
          } catch(e) {}
        }, 10);
      }
    },
    onUpdate: ({ editor }) => {
      // The markdown extension injects getMarkdown method
      const md = (editor.storage as any).markdown.getMarkdown();
      setMarkdown(md);
      setHtml(editor.getHTML());
      setJson(editor.getJSON());
    },
    editorProps: {
      attributes: {
        class: 'editor-content',
      },
      handleDrop: (view, event) => {
        if (event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
          const file = event.dataTransfer.files[0];
          if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
              if (e.target?.result) {
                // In JSDOM testing, posAtCoords might fail or return null, fallback to current selection
                const schema = view.state.schema;
                const coordinates = view.posAtCoords ? view.posAtCoords({ left: event.clientX, top: event.clientY }) : null;
                const insertPos = coordinates?.pos || view.state.selection.to;
                const node = schema.nodes.image.create({ src: e.target.result as string });
                const transaction = view.state.tr.insert(insertPos, node);
                view.dispatch(transaction);
              }
            };
            reader.readAsDataURL(file);
            return true; // handled
          }
        }
        return false;
      },
      handlePaste: (view, event) => {
        if (event.clipboardData && event.clipboardData.files && event.clipboardData.files[0]) {
          const file = event.clipboardData.files[0];
          if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
              if (e.target?.result) {
                const schema = view.state.schema;
                const node = schema.nodes.image.create({ src: e.target.result as string });
                const transaction = view.state.tr.replaceSelectionWith(node);
                view.dispatch(transaction);
              }
            };
            reader.readAsDataURL(file);
            return true;
          }
        }
        return false;
      }
    },
  });

  useEffect(() => {
    if (editor) {
      // Patch markdown-it to allow base64 image data URIs
      const mdEngine = (editor.storage as any).markdown?.parser?.md;
      if (mdEngine && mdEngine.validateLink) {
        const originalValidateLink = mdEngine.validateLink.bind(mdEngine);
        mdEngine.validateLink = (url: string) => {
          if (url.startsWith('data:image/')) return true;
          return originalValidateLink(url);
        };
      }

      // Hydrate editor content from store if it hasn't been modified yet
      const storeState = useAppStore.getState();
      if ((storeState.json || storeState.html || storeState.markdown) && editor.isEmpty) {
        editor.commands.setContent(storeState.json || storeState.html || storeState.markdown);
      } else {
        // Trigger an initial update to set the markdown
        const md = (editor.storage as any).markdown.getMarkdown();
        setMarkdown(md);
        setHtml(editor.getHTML());
        setJson(editor.getJSON());
      }

      // Listen for external commands (Load/New/Demo)
      const handleEditorCommand = (event: CustomEvent<{ type: 'load' | 'new' | 'demo', content?: string }>) => {
        if (event.detail.type === 'load' && event.detail.content !== undefined) {
          editor.commands.setContent(event.detail.content);
        } else if (event.detail.type === 'new') {
          editor.commands.clearContent();
        } else if (event.detail.type === 'demo') {
          editor.commands.clearContent();
          setTimeout(() => {
            editor.commands.setContent(INITIAL_CONTENT);
          }, 0);
        }
        
        // Ensure markdown state is synced after external change
        setTimeout(() => {
          const newMd = (editor.storage as any).markdown.getMarkdown();
          setMarkdown(newMd);
          setHtml(editor.getHTML());
          setJson(editor.getJSON());
        }, 10);
      };

      window.addEventListener('cybermd-command', handleEditorCommand as EventListener);
      return () => {
        window.removeEventListener('cybermd-command', handleEditorCommand as EventListener);
      };
    }
  }, [editor, setMarkdown]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Toolbar editor={editor} />
      <div id="editor-scroll-container" style={{ flex: 1, overflow: 'auto' }}>
        <div style={{ paddingBottom: focusMode === 'typewriter' ? '50vh' : '0', paddingTop: focusMode === 'typewriter' ? '45vh' : '0', minHeight: '100%' }}>
          <EditorContent editor={editor} style={{ height: '100%' }} />
        </div>
      </div>
    </div>
  );
};
