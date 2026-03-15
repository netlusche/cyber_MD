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

  const editor = useEditor({
    extensions: [
      StarterKit,
      TaskList,
      TaskItem.configure({ nested: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Image,
      Link.configure({ openOnClick: false }),
      Markdown,
    ],
    content: INITIAL_CONTENT,
    onUpdate: ({ editor }) => {
      // The markdown extension injects getMarkdown method
      const md = (editor.storage as any).markdown.getMarkdown();
      setMarkdown(md);
    },
    editorProps: {
      attributes: {
        class: 'editor-content',
      },
    },
  });

  useEffect(() => {
    if (editor) {
      // Trigger an initial update to set the markdown
      const md = (editor.storage as any).markdown.getMarkdown();
      setMarkdown(md);

      // Listen for external commands (Load/New)
      const handleEditorCommand = (event: CustomEvent<{ type: 'load' | 'new', content?: string }>) => {
        if (event.detail.type === 'load' && event.detail.content !== undefined) {
          editor.commands.setContent(event.detail.content);
        } else if (event.detail.type === 'new') {
          editor.commands.clearContent();
        }
        
        // Ensure markdown state is synced after external change
        setTimeout(() => {
          const newMd = (editor.storage as any).markdown.getMarkdown();
          setMarkdown(newMd);
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
      <div style={{ flex: 1, overflow: 'auto' }}>
        <EditorContent editor={editor} style={{ height: '100%' }} />
      </div>
    </div>
  );
};
