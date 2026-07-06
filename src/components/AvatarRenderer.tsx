import { useMemo, useState } from 'react';
import type { InteractionState, EmotionLabel } from '../types';
import { EMOTION_COLORS, STATE_COLORS } from '../types';
import type { AppearanceAttributes, VisualIdentity } from '../data/customization';

/**
 * AvatarRenderer — Portrait system with emotion-reactive effects.
 *
 * Supports two variants:
 *  - 'avatar'  (default): circular portrait for chat header / voice orb
 *  - 'portrait': rounded-rect framed portrait for profile screens
 *
 * Visual layers (outside → inside):
 *  1. Ambient glow    — soft radial, blurred, color-synced to state/emotion
 *  2. Pulse rings     — listening state only
 *  3. Gradient ring   — conic gradient border that shifts with emotion
 *  4. Portrait image  — avatarImage or appearance-based gradient fallback
 *  5. State overlay    — shimmer (thinking), radial pulse (speaking), etc.
 *  6. Indicators       — thinking dots, speaking bars
 */

interface AvatarRendererProps {
  appearance?: AppearanceAttributes;
  visual: VisualIdentity;
  avatarImage?: string;
  state?: InteractionState;
  emotion?: EmotionLabel;
  audioLevel?: number;
  size?: number;
  variant?: 'avatar' | 'portrait';
  /** Show a "Digital Twin" badge when the avatar is user-generated */
  showTwinBadge?: boolean;
}

export function AvatarRenderer({
  appearance,
  visual,
  avatarImage,
  state = 'idle',
  emotion = 'neutral',
  audioLevel = 0,
  size = 180,
  variant = 'avatar',
  showTwinBadge = false,
}: AvatarRendererProps) {
  const emotionColor = EMOTION_COLORS[emotion] || EMOTION_COLORS.neutral;
  const stateColor = STATE_COLORS[state];
  const effectColor = state === 'idle' ? emotionColor.glow : stateColor;
  const accent = visual.accentColor;
  const [imgError, setImgError] = useState(false);

  const isPortrait = variant === 'portrait';
  const borderRadius = isPortrait ? Math.round(size * 0.12) : '50%';

  // Scale based on state + audio level
  const scale = useMemo(() => {
    if (state === 'listening') return 1 + audioLevel * 0.06;
    if (state === 'speaking') return 1 + audioLevel * 0.04;
    if (state === 'thinking') return 1.02;
    return 1;
  }, [state, audioLevel]);

  // Build appearance-based gradient for fallback
  const fallbackGradient = useMemo(() => {
    if (!appearance) {
      return `linear-gradient(135deg, ${accent}, ${visual.gradientTo || accent})`;
    }
    // Use skin tone + hair color for a personalized gradient
    const skin = appearance.skinTone || accent;
    const hair = appearance.hairColor || visual.gradientTo || accent;
    return `linear-gradient(160deg, ${accent} 0%, ${hair}aa 40%, ${skin}cc 100%)`;
  }, [appearance, accent, visual.gradientTo]);

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      {/* Layer 1: Ambient outer glow */}
      <div style={{
        position: 'absolute', inset: -Math.round(size * 0.14), borderRadius,
        background: `radial-gradient(circle, ${effectColor}28 0%, transparent 65%)`,
        filter: `blur(${Math.round(size * 0.14)}px)`,
        opacity: 0.4 + (state === 'idle' ? 0.2 : 0.4),
        transition: 'background 0.6s ease, opacity 0.4s ease',
        pointerEvents: 'none',
      }} />

      {/* Layer 1b: Secondary accent glow */}
      <div style={{
        position: 'absolute', inset: -Math.round(size * 0.08), borderRadius,
        background: `radial-gradient(circle, ${accent}18 0%, transparent 60%)`,
        filter: `blur(${Math.round(size * 0.08)}px)`,
        opacity: 0.6,
        transition: 'opacity 0.4s ease',
        pointerEvents: 'none',
      }} />

      {/* Layer 2: Pulse rings (listening) */}
      {state === 'listening' && (
        <>
          <div style={{ position: 'absolute', inset: -8, borderRadius, border: `2px solid ${effectColor}40`, animation: 'pulse-ring 1.5s ease-out infinite', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', inset: -8, borderRadius, border: `2px solid ${effectColor}30`, animation: 'pulse-ring 1.5s ease-out infinite 0.5s', pointerEvents: 'none' }} />
        </>
      )}

      {/* Layer 3: Gradient conic ring */}
      <div style={{
        position: 'absolute', inset: -2, borderRadius,
        background: `conic-gradient(from 0deg, ${effectColor}50, ${accent}40, ${effectColor}50)`,
        opacity: 0.6,
        transition: 'background 0.6s ease',
        pointerEvents: 'none',
      }} />

      {/* Layer 4: Portrait image container */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius,
        transform: `scale(${scale})`,
        transition: state === 'idle' ? 'transform 2s ease-in-out' : 'transform 0.1s ease-out',
        animation: state === 'idle' ? 'breathe 3s ease-in-out infinite' : 'none',
        boxShadow: `0 0 60px ${effectColor}30, 0 0 120px ${accent}15, inset 0 -16px 32px rgba(0,0,0,0.35), inset 0 16px 24px rgba(255,255,255,0.10)`,
        overflow: 'hidden',
        background: fallbackGradient,
        border: `2px solid ${effectColor}30`,
      }}>
        {/* Portrait image or fallback */}
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
          /* Fallback: appearance-informed gradient with initial */
          <div style={{
            width: '100%', height: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: fallbackGradient,
            flexDirection: 'column',
            gap: 4,
          }}>
            <span style={{
              fontSize: size * 0.35,
              fontWeight: 700,
              color: 'rgba(255,255,255,0.92)',
              textShadow: '0 2px 12px rgba(0,0,0,0.4)',
              fontFamily: 'var(--font-display)',
            }}>
              {visual.paletteName?.[0]?.toUpperCase() || 'S'}
            </span>
            {appearance && (
              <span style={{
                fontSize: Math.max(9, size * 0.07),
                color: 'rgba(255,255,255,0.4)',
                textTransform: 'capitalize',
              }}>
                {appearance.ethnicity} · {appearance.hairStyle}
              </span>
            )}
          </div>
        )}

        {/* Layer 5: State overlays */}
        {state === 'listening' && (
          <div style={{ position: 'absolute', inset: 0, borderRadius, background: `radial-gradient(circle, ${effectColor}20 0%, transparent 80%)`, pointerEvents: 'none' }} />
        )}
        {state === 'thinking' && (
          <div style={{ position: 'absolute', inset: 0, borderRadius, background: `linear-gradient(110deg, transparent 30%, ${effectColor}25 50%, transparent 70%)`, animation: 'shimmer-sweep 2s ease-in-out infinite', pointerEvents: 'none' }} />
        )}
        {state === 'speaking' && (
          <div style={{ position: 'absolute', inset: 0, borderRadius, background: `radial-gradient(circle, ${effectColor}15 0%, transparent 80%)`, animation: 'breathe 1.2s ease-in-out infinite', pointerEvents: 'none' }} />
        )}

        {/* Layer 6: Indicators */}
        {/* Thinking dots */}
        {state === 'thinking' && (
          <div style={{ position: 'absolute', bottom: '12%', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 5, zIndex: 3 }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: 'rgba(255,255,255,0.85)', animation: `breathe 1s ease-in-out infinite ${i * 0.2}s` }} />
            ))}
          </div>
        )}

        {/* Speaking bars */}
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

      {/* Emotion ring (outer) */}
      <div style={{
        position: 'absolute', inset: -3, borderRadius,
        border: `2px solid ${effectColor}50`,
        transition: 'border-color 0.6s ease',
        pointerEvents: 'none',
      }} />

      {/* Digital twin badge */}
      {showTwinBadge && avatarImage && !imgError && (
        <div style={{
          position: 'absolute',
          bottom: isPortrait ? -4 : -2,
          right: isPortrait ? -4 : -2,
          background: 'var(--surface-2)',
          border: `1px solid ${accent}40`,
          borderRadius: '50%',
          width: Math.max(20, size * 0.12),
          height: Math.max(20, size * 0.12),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <svg width={Math.max(10, size * 0.06)} height={Math.max(10, size * 0.06)} viewBox="0 0 24 24" fill="none">
            <path d="M9 12l2 2 4-4" stroke={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="12" cy="12" r="9" stroke={accent} strokeWidth="1.5" />
          </svg>
        </div>
      )}
    </div>
  );
}
