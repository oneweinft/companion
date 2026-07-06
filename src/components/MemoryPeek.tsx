import { useState, useEffect, useRef } from 'react';
import type { Companion } from '../data/companions';

interface MemoryPeekProps {
  companion: Companion;
  memoryText: string | null;
  onOpenProfile: () => void;
  visible: boolean;
}

/** Small glassmorphism card that periodically shows a stored memory — drives emotional investment. */
export function MemoryPeek({ companion, memoryText, onOpenProfile, visible }: MemoryPeekProps) {
  if (!visible || !memoryText) return null;

  return (
    <button
      onClick={onOpenProfile}
      className="glass-panel"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '12px 16px',
        borderRadius: 16,
        cursor: 'pointer',
        border: `1px solid ${companion.accentColor}25`,
        background: `${companion.accentColor}0a`,
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        maxWidth: 320,
        animation: 'float-up 0.5s ease',
        transition: 'all 0.3s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = `${companion.accentColor}50`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = `${companion.accentColor}25`;
      }}
    >
      {/* Memory icon */}
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 10,
          background: `${companion.accentColor}20`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M12 3C7.58 3 4 6.58 4 11c0 1.66.5 3.2 1.38 4.5L4 21l5.5-1.38C10.8 20.5 12.34 21 14 21c4.42 0 8-3.58 8-8s-3.58-8-8-8h-2Z" fill={companion.accentColor} />
          <circle cx="14" cy="13" r="1" fill="rgba(255,255,255,0.9)" />
          <circle cx="10" cy="13" r="1" fill="rgba(255,255,255,0.9)" />
        </svg>
      </div>

      {/* Memory text */}
      <div style={{ textAlign: 'left', overflow: 'hidden' }}>
        <div style={{ fontSize: 10, color: companion.accentColor, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>
          I remember...
        </div>
        <div
          style={{
            fontSize: 13,
            color: 'var(--text-secondary)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: 240,
          }}
        >
          {memoryText}
        </div>
      </div>

      {/* Arrow */}
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginLeft: 'auto' }}>
        <path d="M9 6l6 6-6 6" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

/** Hook to manage MemoryPeek visibility — shows after idle period, auto-hides. */
export function useMemoryPeek(isIdle: boolean, hasMessages: boolean) {
  const [visible, setVisible] = useState(false);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);

    if (isIdle && hasMessages) {
      // Show after 2 minutes of idle
      idleTimerRef.current = setTimeout(() => {
        setVisible(true);
        // Auto-hide after 10 seconds
        hideTimerRef.current = setTimeout(() => {
          setVisible(false);
        }, 10000);
      }, 120000);
    } else {
      setVisible(false);
    }

    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [isIdle, hasMessages]);

  return { visible, setVisible };
}
