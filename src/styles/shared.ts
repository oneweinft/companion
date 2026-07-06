/**
 * SoulLink shared UI styles.
 *
 * Centralizes the common style objects (backBtn, headings, subtitles, cards)
 * that were duplicated across CharacterCreator, PersonalityComposer, NameStory,
 * RelationshipMode, VoiceSelection, and other screens.
 *
 * Uses the new design system tokens from index.css.
 */

import type { CSSProperties } from 'react';

/** Back button — ghost style with chevron */
export const backBtnStyle: CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: 'var(--text-muted)',
  fontSize: 14,
  padding: '4px 0',
  marginBottom: 8,
  alignSelf: 'flex-start',
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  transition: 'color 0.2s ease',
};

/** Primary screen heading — Fraunces display serif */
export const h1Style: CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontSize: 28,
  fontWeight: 600,
  color: 'var(--text-primary)',
  letterSpacing: -0.5,
  margin: 0,
  lineHeight: 1.15,
};

/** Subtitle text under headings */
export const subStyle: CSSProperties = {
  fontSize: 14,
  color: 'var(--text-secondary)',
  marginTop: 6,
  lineHeight: 1.5,
};

/** Card style — surface-card (no blur) */
export const cardStyle: CSSProperties = {
  padding: 16,
  borderRadius: 18,
  background: 'var(--surface-1)',
  border: '1px solid var(--border-subtle)',
  boxShadow: 'var(--shadow-sm), var(--shadow-inset)',
  transition: 'all 0.2s ease',
  cursor: 'pointer',
  textAlign: 'left' as const,
};

/** Card selected style — with accent border */
export const cardSelectedStyle = (accent: string): CSSProperties => ({
  ...cardStyle,
  border: `1.5px solid ${accent}`,
  background: `${accent}0a`,
  boxShadow: `0 4px 24px ${accent}25, var(--shadow-inset)`,
  transform: 'scale(1.01)',
});

/** Primary CTA button */
export const ctaButtonStyle = (accent: string, disabled = false): CSSProperties => ({
  width: '100%',
  padding: '16px 32px',
  borderRadius: 16,
  border: 'none',
  cursor: disabled ? 'default' : 'pointer',
  background: disabled
    ? 'var(--surface-2)'
    : `linear-gradient(135deg, ${accent}, var(--color-base))`,
  color: disabled ? 'var(--text-muted)' : '#FFFFFF',
  fontSize: 17,
  fontWeight: 600,
  letterSpacing: 0.3,
  fontFamily: 'var(--font-body)',
  boxShadow: disabled ? 'none' : `0 4px 24px ${accent}40`,
  transition: 'transform 0.15s ease, box-shadow 0.2s ease',
  opacity: disabled ? 0.6 : 1,
});

/** Screen container with aurora background */
export const screenContainerStyle = (accent?: string): CSSProperties => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column' as const,
  position: 'relative' as const,
  background: accent
    ? `radial-gradient(ellipse at 50% 20%, ${accent}08 0%, transparent 60%), var(--bg-primary)`
    : 'var(--bg-primary)',
  padding: 'calc(var(--safe-top) + 16px) 20px calc(var(--safe-bottom) + 16px)',
  overflow: 'hidden' as const,
});
