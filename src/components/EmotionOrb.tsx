import { useMemo } from 'react';
import type { InteractionState, EmotionLabel } from '../types';
import { EMOTION_COLORS, STATE_COLORS } from '../types';

interface EmotionOrbProps {
  state: InteractionState;
  emotion: EmotionLabel;
  intensity: number;
  audioLevel: number;
}

/**
 * Emotion-reactive avatar orb.
 * Changes color, glow, and animation based on interaction state + detected emotion.
 * Inspired by Pi AI's abstract voice animations and ElevenLabs 3D Orb.
 *
 * Color logic from SoulLink avatar_sync.py:
 * - valence > 0.3 → green glow (#00D4AA)
 * - valence < -0.3 → red glow (#FF3366)
 * - neutral → purple glow (#7B2D8E)
 */
export function EmotionOrb({ state, emotion, intensity, audioLevel }: EmotionOrbProps) {
  const emotionColor = EMOTION_COLORS[emotion] || EMOTION_COLORS.neutral;
  const stateColor = STATE_COLORS[state];

  // During speaking/listening, use state color. During idle, use emotion color.
  const activeColor = state === 'idle' ? emotionColor.glow : stateColor;
  const accentColor = state === 'idle' ? emotionColor.accent : stateColor;

  // Size modulation based on audio level and state
  const scale = useMemo(() => {
    if (state === 'listening') return 1 + audioLevel * 0.15;
    if (state === 'speaking') return 1 + audioLevel * 0.12;
    if (state === 'thinking') return 1.02;
    return 1;
  }, [state, audioLevel]);

  // Breathing animation for idle
  const orbStyle: React.CSSProperties = {
    transform: `scale(${scale})`,
    transition: state === 'idle' ? 'transform 2s ease-in-out' : 'transform 0.1s ease-out',
    animation: state === 'idle' ? 'breathe 3s ease-in-out infinite' : 'none',
  };

  return (
    <div className="orb-container" style={{ position: 'relative', width: 180, height: 180 }}>
      {/* Outer pulse rings (listening state) */}
      {state === 'listening' && (
        <>
          <div
            className="pulse-ring"
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              border: `2px solid ${activeColor}40`,
              animation: 'pulse-ring 1.5s ease-out infinite',
            }}
          />
          <div
            className="pulse-ring"
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              border: `2px solid ${activeColor}30`,
              animation: 'pulse-ring 1.5s ease-out infinite 0.5s',
            }}
          />
        </>
      )}

      {/* Outer glow */}
      <div
        style={{
          position: 'absolute',
          inset: -20,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${activeColor}30 0%, transparent 70%)`,
          filter: 'blur(20px)',
          opacity: 0.6 + intensity * 0.3,
          transition: 'background 0.6s ease, opacity 0.4s ease',
        }}
      />

      {/* Main orb */}
      <div
        className="orb-main"
        style={{
          ...orbStyle,
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background: `
            radial-gradient(circle at 35% 30%, ${accentColor} 0%, ${activeColor} 40%, ${activeColor}80 70%, ${activeColor}40 100%)
          `,
          boxShadow: `
            0 0 60px ${activeColor}50,
            0 0 120px ${activeColor}30,
            inset 0 -20px 40px rgba(0,0,0,0.3),
            inset 0 20px 30px rgba(255,255,255,0.15)
          `,
          transition: 'background 0.6s ease, box-shadow 0.6s ease',
        }}
      >
        {/* Inner highlight (eye-like) */}
        <div
          style={{
            position: 'absolute',
            top: '22%',
            left: '30%',
            width: '35%',
            height: '25%',
            borderRadius: '50%',
            background: 'radial-gradient(ellipse, rgba(255,255,255,0.4) 0%, transparent 70%)',
            filter: 'blur(4px)',
          }}
        />

        {/* Thinking dots */}
        {state === 'thinking' && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            {[0, 1, 2].map(i => (
              <div
                key={i}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.8)',
                  animation: `breathe 1s ease-in-out infinite ${i * 0.2}s`,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
