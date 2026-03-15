import React from 'react';
import { useAppStore } from '../store/useStore';

export const StatusBar: React.FC = () => {
  const markdown = useAppStore((state) => state.markdown);

  const words = markdown.trim() ? markdown.trim().split(/\s+/).length : 0;
  const chars = markdown.length;
  const readingTime = Math.ceil(words / 200) || 1;

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0.25rem 1rem',
      backgroundColor: 'var(--bg-panel)',
      borderTop: '1px solid var(--border)',
      color: 'var(--text-main)',
      fontFamily: 'var(--font-mono)',
      fontSize: '0.75rem',
      textTransform: 'uppercase',
      boxShadow: '0 -2px 10px rgba(0,0,0,0.5)'
    }}>
      <div style={{ display: 'flex', gap: '1.5rem' }}>
        <span className="hide-mobile">[ STATUS ]: ONLINE {words > 0 && <span style={{ color: 'var(--accent)' }}>// DRAFT SAVED</span>}</span>
        <span>[ WORDS ]: {words}</span>
        <span>[ CHARS ]: {chars}</span>
      </div>
      <div className="hide-mobile">
        <span>[ EST. READING TIME ]: {readingTime} MIN</span>
      </div>
    </div>
  );
};
