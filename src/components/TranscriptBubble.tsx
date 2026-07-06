import type { InteractionState } from '../types';
import { STATE_COLORS } from '../types';

interface TranscriptBubbleProps {
  text: string;
  state: InteractionState;
}

/**
 * Live transcription bubble — shows what the user is saying in real-time.
 * Appears during "listening" state with progressive text reveal.
 *
 * Reference: 2026 trend — "live transcription so users can verify
 * what the app heard before submitting"
 */
export function TranscriptBubble({ text, state }: TranscriptBubbleProps) {
  if (state !== 'listening' || !text) return null;

  const color = STATE_COLORS.listening;

  return (
    <div
      style={{
        width: '100%',
        maxWidth: 340,
        margin: '0 auto',
        padding: '0 20px',
        animation: 'fade-in 0.2s ease',
      }}
    >
      <div
        className="glass-panel"
        style={{
          padding: '12px 16px',
          borderRadius: 16,
          borderBottomRightRadius: 4,
          background: `${color}10`,
          borderColor: `${color}30`,
        }}
      >
        <div
          style={{
            fontSize: 10,
            color: `${color}`,
            textTransform: 'uppercase',
            letterSpacing: 1,
            marginBottom: 4,
            fontWeight: 600,
          }}
        >
          You
        </div>
        <p
          style={{
            fontSize: 15,
            lineHeight: 1.5,
            color: '#E8E8F0',
          }}
        >
          {text}
          <span
            style={{
              display: 'inline-block',
              width: 2,
              height: 15,
              background: color,
              marginLeft: 1,
              verticalAlign: 'middle',
              animation: 'blink-cursor 0.5s step-end infinite',
            }}
          />
        </p>
      </div>
    </div>
  );
}
