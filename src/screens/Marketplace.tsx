import { useState, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { AvatarRenderer } from '../components/AvatarRenderer';
import { initCustomization } from '../data/customization';
import {
  MARKETPLACE_CATEGORIES,
  filterMarketplace,
  marketplaceToCustomization,
  type MarketplaceCompanion,
} from '../data/marketplace';
import { backBtnStyle, h1Style, subStyle, screenContainerStyle } from '../styles/shared';

/**
 * Character Marketplace — browse and adopt community-created companions.
 *
 * Users can:
 * - Browse trending companions by category
 * - Preview companion personality and bio
 * - Adopt a companion (starts onboarding with preset)
 * - Share their own companion as a code
 */
export function Marketplace() {
  const { navigate, updateCustomization, selectCompanion, customization } = useApp();
  const [category, setCategory] = useState<string>('trending');
  const [selected, setSelected] = useState<MarketplaceCompanion | null>(null);
  const [showShare, setShowShare] = useState(false);
  const [shareCode, setShareCode] = useState('');

  const companions = filterMarketplace(category);

  // Adopt a marketplace companion
  const handleAdopt = useCallback((mc: MarketplaceCompanion) => {
    // Start fresh onboarding with the marketplace companion's customization
    selectCompanion('aria'); // base archetype
    const preset = marketplaceToCustomization(mc);
    // Apply all marketplace values
    updateCustomization({
      relationshipMode: preset.relationshipMode,
      personality: preset.personality,
      visual: preset.visual,
      voiceId: preset.voiceId,
      name: preset.name,
      story: preset.story,
      avatarImage: preset.avatarImage,
    });
    navigate('relationshipMode');
  }, [selectCompanion, updateCustomization, navigate]);

  // Generate share code for current companion
  const handleShare = useCallback(() => {
    if (!customization) return;
    try {
      const code = btoa(JSON.stringify(customization)).slice(0, 8).toUpperCase();
      setShareCode(code);
    } catch {
      setShareCode('ERROR');
    }
  }, [customization]);

  // ── Detail view ──
  if (selected) {
    const visual = initCustomization('aria').visual;
    visual.accentColor = selected.accentColor;
    visual.gradientFrom = selected.gradientFrom;
    visual.gradientTo = selected.gradientTo;
    visual.paletteName = selected.name;

    return (
      <div style={{ ...screenContainerStyle(selected.accentColor), overflowY: 'auto' }}>
        <div className="aurora-bg" />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 480, margin: '0 auto', width: '100%' }}>
          <button
            onClick={() => setSelected(null)}
            style={backBtnStyle}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back to marketplace
          </button>

          {/* Hero */}
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
            marginBottom: 24, animation: 'fade-in-up 0.4s ease',
          }}>
            <AvatarRenderer
              visual={visual}
              avatarImage={selected.avatarImage}
              size={120}
              variant="portrait"
            />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 26, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                {selected.name}
              </div>
              <div style={{ fontSize: 13, color: selected.accentColor, marginTop: 2 }}>
                {selected.archetype}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                Created by {selected.creator} · {selected.likes.toLocaleString()} likes
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {selected.personalityTraits.map(trait => (
                <span key={trait} style={{
                  fontSize: 11, padding: '3px 10px', borderRadius: 10,
                  background: `${selected.accentColor}15`, color: 'var(--text-secondary)',
                }}>
                  {trait}
                </span>
              ))}
            </div>
          </div>

          {/* Bio */}
          <div className="surface-card" style={{ padding: 16, borderRadius: 18, marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
              About
            </div>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, fontFamily: 'var(--font-body)' }}>
              {selected.bio}
            </div>
          </div>

          {/* Personality bars */}
          <div className="surface-card" style={{ padding: 16, borderRadius: 18, marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>
              Personality Profile
            </div>
            {Object.entries(selected.personality).map(([key, value]) => (
              <div key={key} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{key}</span>
                  <span style={{ fontSize: 12, color: selected.accentColor }}>{value}</span>
                </div>
                <div style={{ height: 4, borderRadius: 2, background: 'var(--surface-2)', overflow: 'hidden' }}>
                  <div style={{
                    width: `${value}%`, height: '100%', borderRadius: 2,
                    background: selected.accentColor,
                  }} />
                </div>
              </div>
            ))}
          </div>

          {/* Adopt button */}
          <button
            className="pressable"
            onClick={() => handleAdopt(selected)}
            style={{
              width: '100%',
              padding: '16px 32px',
              borderRadius: 16,
              border: 'none',
              cursor: 'pointer',
              background: `linear-gradient(135deg, ${selected.accentColor}, var(--color-base))`,
              color: '#FFFFFF',
              fontSize: 17,
              fontWeight: 600,
              fontFamily: 'var(--font-body)',
              boxShadow: `0 4px 24px ${selected.accentColor}40`,
            }}
          >
            Adopt {selected.name}
          </button>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', marginTop: 8 }}>
            You can customize further after adopting
          </div>
        </div>
      </div>
    );
  }

  // ── Share view ──
  if (showShare) {
    return (
      <div style={{ ...screenContainerStyle(), overflowY: 'auto' }}>
        <div className="aurora-bg" />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 480, margin: '0 auto', width: '100%' }}>
          <button onClick={() => setShowShare(false)} style={backBtnStyle}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back to marketplace
          </button>

          <h1 style={h1Style}>Share your companion</h1>
          <p style={subStyle}>
            Generate a share code that others can use to adopt your companion's personality.
          </p>

          <div className="surface-card" style={{ padding: 20, borderRadius: 18, marginTop: 20, textAlign: 'center' }}>
            {customization ? (
              <>
                <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 8 }}>
                  {customization.name}'s share code:
                </div>
                <div style={{
                  fontSize: 28, fontWeight: 700, color: 'var(--color-accent)',
                  fontFamily: 'var(--font-display)', letterSpacing: 4,
                  padding: '16px 0', borderRadius: 12,
                  background: 'var(--surface-2)',
                  marginBottom: 12,
                }}>
                  {shareCode || '------'}
                </div>
                <button
                  className="pressable"
                  onClick={handleShare}
                  style={{
                    padding: '10px 24px', borderRadius: 12,
                    border: 'none',
                    background: 'linear-gradient(135deg, var(--color-accent), var(--color-base))',
                    color: '#FFFFFF', fontSize: 15, fontWeight: 600,
                    cursor: 'pointer', fontFamily: 'var(--font-body)',
                  }}
                >
                  {shareCode ? 'Regenerate' : 'Generate code'}
                </button>
                {shareCode && (
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
                    Share this code with friends to let them adopt {customization.name}
                  </div>
                )}
              </>
            ) : (
              <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>
                Create a companion first to share it.
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Main marketplace view ──
  return (
    <div style={{ ...screenContainerStyle(), overflowY: 'auto' }}>
      <div className="aurora-bg" />
      <div style={{ position: 'relative', zIndex: 1, maxWidth: 480, margin: '0 auto', width: '100%' }}>
        <button onClick={() => navigate('characterSelection')} style={backBtnStyle}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back
        </button>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={h1Style}>Marketplace</h1>
            <p style={subStyle}>Community-created companions</p>
          </div>
          <button
            className="pressable"
            onClick={() => setShowShare(true)}
            style={{
              padding: '8px 14px', borderRadius: 12,
              border: '1px solid var(--border-default)',
              background: 'var(--surface-2)',
              color: 'var(--text-secondary)',
              fontSize: 13, cursor: 'pointer',
              fontFamily: 'var(--font-body)',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Share
          </button>
        </div>

        {/* Category filter */}
        <div style={{
          display: 'flex', gap: 6, overflowX: 'auto',
          padding: '12px 0 16px', marginTop: 4,
        }}>
          {MARKETPLACE_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              style={{
                padding: '6px 14px',
                borderRadius: 20,
                border: category === cat.id
                  ? `1px solid var(--color-accent)`
                  : '1px solid var(--border-subtle)',
                background: category === cat.id ? 'var(--color-accent)15' : 'var(--surface-1)',
                color: category === cat.id ? 'var(--color-accent)' : 'var(--text-muted)',
                fontSize: 13,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                fontFamily: 'var(--font-body)',
                transition: 'all 0.2s ease',
              }}
            >
              <span style={{ marginRight: 4 }}>{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>

        {/* Companion cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {companions.map(mc => (
            <button
              key={mc.id}
              className="pressable"
              onClick={() => setSelected(mc)}
              style={{
                display: 'flex', gap: 12, alignItems: 'center',
                padding: 14, borderRadius: 16,
                border: '1px solid var(--border-subtle)',
                background: 'var(--surface-1)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s ease',
              }}
            >
              {/* Avatar */}
              <div style={{
                width: 56, height: 56, borderRadius: 14,
                overflow: 'hidden', flexShrink: 0,
                border: `2px solid ${mc.accentColor}30`,
              }}>
                <img
                  src={mc.avatarImage}
                  alt={mc.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                    {mc.name}
                  </span>
                  <span style={{ fontSize: 10, color: mc.accentColor }}>
                    {mc.archetype}
                  </span>
                </div>
                <div style={{
                  fontSize: 12, color: 'var(--text-muted)', marginTop: 2,
                  overflow: 'hidden', textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {mc.bio}
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 4, alignItems: 'center' }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{mc.creator}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>·</span>
                  <span style={{ fontSize: 11, color: '#FF8A00' }}>❤ {mc.likes.toLocaleString()}</span>
                </div>
              </div>

              {/* Chevron */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, color: 'var(--text-muted)' }}>
                <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
