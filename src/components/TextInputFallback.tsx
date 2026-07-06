import { useState, useRef, useEffect } from 'react';
import type { InteractionState } from '../types';
import { STATE_COLORS } from '../types';

interface TextInputFallbackProps {
  state: InteractionState;
  onSend: (text: string) => void;
  micError: string | null;
}

/**
 * Text input fallback for when voice recognition isn't available
 * or the user prefers to type. Appears below the mic button.
 *
 * Shows when:
 * - micError is set (voice not working)
 * - Always available as an alternative input method
 */
export function TextInputFallback({ state, onSend, micError }: TextInputFallbackProps) {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const canSend = (state === 'idle' || state === 'listening') && input.trim().length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (canSend) {
      onSend(input.trim());
      setInput('');
    }
  };

  // Focus input when error appears
  useEffect(() => {
    if (micError && inputRef.current) {
      inputRef.current.focus();
    }
  }, [micError]);

  const color = STATE_COLORS[state] || STATE_COLORS.idle;

  return (
    <div
      style={{
        width: '100%',
        maxWidth: 340,
        margin: '0 auto',
        animation: 'fade-in 0.3s ease',
      }}
    >
      {/* Error message */}
      {micError && (
        <div
          style={{
            fontSize: 12,
            color: '#FF6B6B',
            textAlign: 'center',
            marginBottom: 8,
            padding: '0 16px',
          }}
        >
          {micError}
        </div>
      )}

      {/* Text input form */}
      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          gap: 8,
          padding: '0 16px',
        }}
      >
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type your message..."
          disabled={state === 'thinking' || state === 'speaking'}
          aria-label="Type a message"
          style={{
            flex: 1,
            height: 40,
            padding: '0 14px',
            borderRadius: 20,
            border: '1px solid rgba(255,255,255,0.12)',
            background: 'rgba(255,255,255,0.06)',
            color: '#E8E8F0',
            fontSize: 14,
            outline: 'none',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            transition: 'border-color 0.2s ease',
          }}
          onFocus={e => {
            e.target.style.borderColor = `${color}50`;
          }}
          onBlur={e => {
            e.target.style.borderColor = 'rgba(255,255,255,0.12)';
          }}
        />
        <button
          type="submit"
          disabled={!canSend}
          aria-label="Send message"
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            border: 'none',
            cursor: canSend ? 'pointer' : 'default',
            background: canSend
              ? `linear-gradient(135deg, ${color}, ${color}cc)`
              : 'rgba(255,255,255,0.08)',
            boxShadow: canSend ? `0 2px 12px ${color}40` : 'none',
            transition: 'background 0.2s ease, box-shadow 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M3 11.5L21 3L12.5 21L11 13L3 11.5Z"
              fill={canSend ? 'white' : 'rgba(255,255,255,0.3)'}
            />
          </svg>
        </button>
      </form>
    </div>
  );
}
