import { useState } from 'react';
import type { Companion } from '../data/companions';

interface CompanionCardProps {
  companion: Companion;
  isSelected: boolean;
  onSelect: () => void;
}

/** Card for character selection grid. Shows portrait, name, archetype, traits. */
export function CompanionCard({ companion, isSelected, onSelect }: CompanionCardProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <button
      className="pressable"
      onClick={onSelect}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 10,
        padding: '20px 12px',
        borderRadius: 20,
        cursor: 'pointer',
        background: isSelected
          ? `${companion.accentColor}0a`
          : 'var(--surface-1)',
        border: isSelected
          ? `1.5px solid ${companion.accentColor}80`
          : '1px solid var(--border-subtle)',
        boxShadow: isSelected
          ? `0 4px 24px ${companion.accentColor}25, var(--shadow-inset)`
          : 'var(--shadow-sm), var(--shadow-inset)',
        transition: 'all 0.2s ease',
        transform: isSelected ? 'scale(1.02)' : 'scale(1)',
        width: '100%',
        textAlign: 'center',
      }}
    >
      {/* Portrait circle with avatar image */}
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${companion.gradientFrom}, ${companion.gradientTo})`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: `0 0 24px ${companion.accentColor}40, inset 0 -8px 16px rgba(0,0,0,0.2), inset 0 8px 12px rgba(255,255,255,0.15)`,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {companion.avatarImage && !imgError ? (
          <img
            src={companion.avatarImage}
            alt={companion.name}
            onError={() => setImgError(true)}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
          />
        ) : (
          <span style={{ fontSize: 28, fontWeight: 700, color: 'rgba(255,255,255,0.9)', textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
            {companion.name[0]}
          </span>
        )}
        {/* Selected checkmark */}
        {isSelected && (
          <div
            style={{
              position: 'absolute',
              bottom: -2,
              right: -2,
              width: 24,
              height: 24,
              borderRadius: '50%',
              background: companion.accentColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '3px solid var(--bg-primary)',
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        )}
      </div>

      {/* Name + archetype */}
      <div>
        <div style={{ fontSize: 17, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
          {companion.name}
        </div>
        <div style={{ fontSize: 12, color: companion.accentColor, marginTop: 2 }}>
          {companion.archetype}
        </div>
      </div>

      {/* Trait chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center' }}>
        {companion.personalityTraits.map(trait => (
          <span
            key={trait}
            style={{
              fontSize: 10,
              padding: '3px 8px',
              borderRadius: 8,
              background: `${companion.accentColor}15`,
              color: 'var(--text-secondary)',
              whiteSpace: 'nowrap',
            }}
          >
            {trait}
          </span>
        ))}
      </div>
    </button>
  );
}
