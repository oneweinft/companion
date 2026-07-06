import { useMemo, useState } from 'react';
import type { InteractionState, EmotionLabel } from '../types';
import { EMOTION_COLORS, STATE_COLORS } from '../types';
import type { AppearanceAttributes, VisualIdentity } from '../data/customization';

// AvatarRenderer - Static portrait avatar with emotion-reactive effects
// Replaces the 3D orb with a photorealistic image + reactive glow/animation

interface AvatarRendererProps {
  appearance?: AppearanceAttributes;
  visual: VisualIdentity;
  avatarImage?: string;
  state?: InteractionState;
  emotion?: EmotionLabel;
  audioLevel?: number;
  size?: number;
}

export function AvatarRenderer({
  visual,
  avatarImage,
  state = 'idle',
  emotion = 'neutral',
  audioLevel = 0,
  size = 180,
}: AvatarRendererProps) {
  const emotionColor = EMOTION_COLORS[emotion] || EMOTION_COLORS.neutral;
  const stateColor = STATE_COLORS[state];
  const effectColor = state === 'idle' ? emotionColor.glow : stateColor;
  const accent = visual.accentColor;
  const [imgError, setImgError] = useState(false);

  const scale = useMemo(() => {
    if (state === 'listening') return 1 + audioLevel * 0.06;
    if (state === 'speaking') return 1 + audioLevel * 0.04;
    if (state === 'thinking') return 1.02;
    return 1;
  }, [state, audioLevel]);

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      {/* Pulse rings (listening) */}
      {state === 'listening' && (
        <>
          <div style={{ position: 'absolute', inset: -8, borderRadius: '50%', border: `2px solid ${effectColor}40`, animation: 'pulse-ring 1.5s ease-out infinite', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', inset: -8, borderRadius: '50%', border: `2px solid ${effectColor}30`, animation: 'pulse-ring 1.5s ease-out infinite 0.5s', pointerEvents: 'none' }} />
        </>
      )}

      {/* Outer glow */}
      <div style={{
        position: 'absolute', inset: -24, borderRadius: '50%',
        background: `radial-gradient(circle, ${effectColor}30 0%, transparent 70%)`,
        filter: 'blur(24px)',
        opacity: 0.5 + (state === 'idle' ? 0.2 : 0.4),
        transition: 'background 0.6s ease, opacity 0.4s ease',
        pointerEvents: 'none',
      }} />

      {/* Portrait circle with static image */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: '50%',
        transform: `scale(${scale})`,
        transition: state === 'idle' ? 'transform 2s ease-in-out' : 'transform 0.1s ease-out',
        animation: state === 'idle' ? 'breathe 3s ease-in-out infinite' : 'none',
        boxShadow: `0 0 60px ${effectColor}40, 0 0 120px ${accent}20, inset 0 -16px 32px rgba(0,0,0,0.3), inset 0 16px 24px rgba(255,255,255,0.12)`,
        overflow: 'hidden',
        background: `linear-gradient(135deg, ${accent}, ${visual.gradientTo || accent})`,
      }}>
        {/* Static portrait image */}
        {avatarImage && !imgError ? (
          <img
            src={avatarImage}
            alt="Companion portrait"
            onError={() => setImgError(true)}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
          />
        ) : (
          /* Fallback: gradient with initial */
          <div style={{
            width: '100%', height: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: `linear-gradient(135deg, ${accent}, ${visual.gradientTo || accent})`,
          }}>
            <span style={{
              fontSize: size * 0.35,
              fontWeight: 700,
              color: 'rgba(255,255,255,0.9)',
              textShadow: '0 2px 8px rgba(0,0,0,0.3)',
            }}>
              {visual.paletteName?.[0] || 'S'}
            </span>
          </div>
        )}

        {/* State overlays */}
        {state === 'listening' && (
          <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: `radial-gradient(circle, ${effectColor}20 0%, transparent 80%)`, pointerEvents: 'none' }} />
        )}
        {state === 'thinking' && (
          <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: `linear-gradient(110deg, transparent 30%, ${effectColor}25 50%, transparent 70%)`, animation: 'shimmer-sweep 2s ease-in-out infinite', pointerEvents: 'none' }} />
        )}
        {state === 'speaking' && (
          <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: `radial-gradient(circle, ${effectColor}15 0%, transparent 80%)`, animation: 'breathe 1.2s ease-in-out infinite', pointerEvents: 'none' }} />
        )}

        {/* Thinking dots */}
        {state === 'thinking' && (
          <div style={{ position: 'absolute', bottom: '12%', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 5, zIndex: 3 }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: 'rgba(255,255,255,0.85)', animation: `breathe 1s ease-in-out infinite ${i * 0.2}s` }} />
            ))}
          </div>
        )}

        {/* Speaking indicator - subtle ring at bottom */}
        {state === 'speaking' && (
          <div style={{
            position: 'absolute', bottom: '8%', left: '50%', transform: 'translateX(-50%)',
            display: 'flex', gap: 3, alignItems: 'flex-end', zIndex: 3,
          }}>
            {[0, 1, 2, 3, 4].map(i => (
              <div key={i} style={{
                width: 3, borderRadius: 2,
                height: 8 + Math.abs(Math.sin(Date.now() / 150 + i * 0.5)) * 14,
                background: 'rgba(255,255,255,0.7)',
                animation: `breathe 0.4s ease-in-out infinite ${i * 0.08}s`,
              }} />
            ))}
          </div>
        )}
      </div>

      {/* Emotion ring */}
      <div style={{ position: 'absolute', inset: -3, borderRadius: '50%', border: `2px solid ${effectColor}50`, transition: 'border-color 0.6s ease', pointerEvents: 'none' }} />
    </div>
  );
}
