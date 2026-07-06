import type { InteractionState } from '../types';
import { STATE_COLORS, STATE_LABELS } from '../types';

interface VoiceControlBarProps {
  state: InteractionState;
  onToggleMic: () => void;
  micActive: boolean;
}

/**
 * Voice control bar with mic button and state label.
 *
 * Design:
 * - Large circular mic button as primary action (2026 trend: voice-first input)
 * - Button color changes with interaction state
 * - Pulsing ring when listening (privacy/trust signal)
 * - State label below button
 * - Glassmorphism panel background
 */
export function VoiceControlBar({ state, onToggleMic, micActive }: VoiceControlBarProps) {
  const color = STATE_COLORS[state];
  const label = STATE_LABELS[state];
  const canInteract = state === 'idle' || state === 'listening';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 16,
        paddingBottom: '4px',
      }}
    >
      {/* State label */}
      <div
        style={{
          fontSize: 13,
          color: state === 'idle' ? '#5A5A70' : color,
          letterSpacing: 1,
          textTransform: 'uppercase',
          fontWeight: 500,
          transition: 'color 0.3s ease',
          animation: state !== 'idle' ? 'fade-in 0.3s ease' : 'none',
        }}
      >
        {label}
      </div>

      {/* Mic button */}
      <button
        onClick={onToggleMic}
        disabled={!canInteract}
        aria-label={micActive ? 'Stop listening' : 'Start talking'}
        style={{
          position: 'relative',
          width: 72,
          height: 72,
          borderRadius: '50%',
          border: 'none',
          cursor: canInteract ? 'pointer' : 'default',
          background: state === 'idle'
            ? `linear-gradient(135deg, ${color}, ${color}cc)`
            : `linear-gradient(135deg, ${color}, ${color}aa)`,
          boxShadow: `
            0 4px 20px ${color}40,
            0 0 40px ${color}30,
            inset 0 1px 0 rgba(255,255,255,0.2)
          `,
          transition: 'transform 0.2s ease, box-shadow 0.3s ease, background 0.4s ease',
          transform: micActive ? 'scale(1.1)' : 'scale(1)',
          opacity: canInteract ? 1 : 0.5,
        }}
      >
        {/* Pulse ring when listening */}
        {micActive && (
          <span
            style={{
              position: 'absolute',
              inset: -6,
              borderRadius: '50%',
              border: `2px solid ${color}`,
              animation: 'pulse-ring 1.5s ease-out infinite',
              pointerEvents: 'none',
            }}
          />
        )}

        {/* Mic icon */}
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          {micActive ? (
            // Stop / square icon when listening
            <rect x="6" y="6" width="12" height="12" rx="2" fill="white" />
          ) : (
            // Mic icon when idle
            <>
              <path
                d="M12 15a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3Z"
                fill="white"
              />
              <path
                d="M19 11a1 1 0 0 0-2 0 5 5 0 0 1-10 0 1 1 0 0 0-2 0 7 7 0 0 0 6 6.92V21a1 1 0 0 0 2 0v-3.08A7 7 0 0 0 19 11Z"
                fill="white"
              />
            </>
          )}
        </svg>
      </button>

      {/* Hint text */}
      {state === 'idle' && (
        <div
          style={{
            fontSize: 12,
            color: '#5A5A70',
            animation: 'fade-in 0.5s ease',
          }}
        >
          Hold a conversation with SoulLink
        </div>
      )}
    </div>
  );
}
