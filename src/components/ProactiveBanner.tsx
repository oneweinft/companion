import { useState, useEffect } from 'react';
import type { ProactiveMessage } from '../hooks/useProactiveMessaging';

interface ProactiveBannerProps {
  message: ProactiveMessage;
  companionName: string;
  accent: string;
  onDismiss: () => void;
  onRespond: (text: string) => void;
}

/**
 * Proactive message banner — displays a companion's proactive reach-out
 * as a slide-in notification at the top of the chat.
 *
 * Design: glassmorphism floating card with companion avatar thumbnail,
 * message preview, and quick action buttons (Respond / Dismiss).
 */
export function ProactiveBanner({ message, companionName, accent, onDismiss, onRespond }: ProactiveBannerProps) {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);

  // Animate in
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    setTimeout(onDismiss, 300);
  };

  const handleRespond = () => {
    if (message.followUp) {
      onRespond(message.followUp);
    } else {
      onRespond(`Hi ${companionName}, I'm here. Tell me more.`);
    }
    handleDismiss();
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 'calc(var(--safe-top) + 8px)',
        left: 12,
        right: 12,
        zIndex: 200,
        transform: visible ? 'translateY(0)' : 'translateY(-120%)',
        opacity: visible ? 1 : 0,
        transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease',
      }}
    >
      <div
        className="glass-panel"
        style={{
          borderRadius: 18,
          padding: 14,
          boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px ${accent}20`,
          background: 'rgba(14, 14, 26, 0.92)',
          backdropFilter: 'var(--glass-blur)',
          WebkitBackdropFilter: 'var(--glass-blur)',
        }}
      >
        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          {/* Companion avatar circle */}
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: `linear-gradient(135deg, ${accent}, var(--color-base))`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            boxShadow: `0 0 12px ${accent}40`,
          }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.9)' }}>
              {companionName[0]}
            </span>
          </div>

          {/* Content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-body)' }}>
                {companionName}
              </span>
              <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                · {message.title}
              </span>
            </div>
            <div
              style={{
                fontSize: 13,
                color: 'var(--text-secondary)',
                lineHeight: 1.45,
                fontFamily: 'var(--font-body)',
                overflow: expanded ? 'visible' : 'hidden',
                textOverflow: 'ellipsis',
                display: expanded ? 'block' : '-webkit-box',
                WebkitLineClamp: expanded ? 'unset' : 2,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {message.body}
            </div>
            {message.followUp && expanded && (
              <div style={{
                marginTop: 8,
                padding: '8px 12px',
                borderRadius: 10,
                background: `${accent}0a`,
                border: `1px solid ${accent}15`,
                fontSize: 13,
                color: accent,
                fontStyle: 'italic',
                fontFamily: 'var(--font-body)',
              }}>
                "{message.followUp}"
              </div>
            )}
          </div>

          {/* Dismiss button */}
          <button
            onClick={handleDismiss}
            aria-label="Dismiss"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              padding: 0,
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 24, height: 24,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
          <button
            className="pressable"
            onClick={handleRespond}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: 10,
              border: 'none',
              background: `${accent}15`,
              color: accent,
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
            }}
          >
            {message.followUp ? 'Respond' : 'Say hi'}
          </button>
          <button
            onClick={() => setExpanded(!expanded)}
            style={{
              padding: '8px 12px',
              borderRadius: 10,
              border: `1px solid var(--border-default)`,
              background: 'var(--surface-2)',
              color: 'var(--text-secondary)',
              fontSize: 13,
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
            }}
          >
            {expanded ? 'Less' : 'More'}
          </button>
        </div>
      </div>
    </div>
  );
}
