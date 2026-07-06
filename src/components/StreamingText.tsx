import type { InteractionState } from '../types';
import { STATE_COLORS } from '../types';

interface StreamingTextProps {
  text: string;
  state: InteractionState;
  emotion?: string;
}

/**
 * Streaming text display for AI responses.
 *
 * Features:
 * - Skeleton loading shimmer during "thinking" state (2026 trend)
 * - Typewriter cursor during streaming (2026 trend)
 * - Fade-in animation when text starts
 * - Emotion tag badge
 *
 * Reference: ChatGPT unified interface — text streams while voice plays
 */
export function StreamingText({ text, state, emotion }: StreamingTextProps) {
  // Skeleton loading during thinking
  if (state === 'thinking') {
    return (
      <div style={{ width: '100%', maxWidth: 340, margin: '0 auto', padding: '0 20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[0.9, 0.7, 0.85, 0.5].map((width, i) => (
            <div
              key={i}
              className="skeleton-shimmer"
              style={{
                height: 14,
                width: `${width * 100}%`,
                borderRadius: 4,
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  // Nothing to show
  if (!text && state !== 'speaking') {
    return null;
  }

  const accentColor = state === 'speaking' ? STATE_COLORS.speaking : '#9999B0';

  return (
    <div
      style={{
        width: '100%',
        maxWidth: 340,
        margin: '0 auto',
        padding: '0 20px',
        animation: 'fade-in 0.3s ease',
      }}
    >
      {/* Emotion badge */}
      {emotion && state === 'speaking' && (
        <div
          style={{
            display: 'inline-block',
            fontSize: 11,
            color: accentColor,
            padding: '2px 10px',
            borderRadius: 10,
            background: `${accentColor}15`,
            marginBottom: 8,
            textTransform: 'capitalize',
            letterSpacing: 0.5,
          }}
        >
          {emotion}
        </div>
      )}

      <p
        aria-live="polite"
        style={{
          fontSize: 16,
          lineHeight: 1.7,
          color: '#D4D4E8',
          letterSpacing: 0.01,
          minHeight: 20,
        }}
      >
        {text}
        {state === 'speaking' && (
          <span
            style={{
              display: 'inline-block',
              width: 2,
              height: 18,
              background: accentColor,
              marginLeft: 2,
              verticalAlign: 'middle',
              animation: 'blink-cursor 0.5s step-end infinite',
            }}
          />
        )}
      </p>
    </div>
  );
}
