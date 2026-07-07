import { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { AvatarRenderer } from '../components/AvatarRenderer';
import { useSoulScore } from '../hooks/useSoulScore';
import { SoulScoreSection } from '../components/SoulScore';

/** localStorage key for storing generated photos per companion. */
function photoKey(companionId: string) {
  return `soullink_photos_${companionId}`;
}

interface StoredPhoto {
  url: string;
  prompt: string;
  timestamp: number;
}

function loadPhotos(companionId: string): StoredPhoto[] {
  try {
    const raw = localStorage.getItem(photoKey(companionId));
    return raw ? (JSON.parse(raw) as StoredPhoto[]) : [];
  } catch {
    return [];
  }
}

function savePhotos(companionId: string, photos: StoredPhoto[]) {
  try {
    localStorage.setItem(photoKey(companionId), JSON.stringify(photos));
  } catch {
    // storage might be full or unavailable
  }
}

/** Companion profile + memories + settings — slide-in panel from right. */
export function CompanionProfile() {
    const { selectedCompanion, navigate, resetOnboarding } = useApp();

  if (!selectedCompanion) {
    navigate('characterSelection');
    return null;
  }

  const companion = selectedCompanion;
  const accent = companion.accentColor;

  // Soul Score gamification
  const soulScore = useSoulScore();

  // Photo gallery state
  const [photos, setPhotos] = useState<StoredPhoto[]>([]);
  const [expandedPhoto, setExpandedPhoto] = useState<StoredPhoto | null>(null);

  useEffect(() => {
    setPhotos(loadPhotos(companion.id));
  }, [companion.id]);

  const handleDeletePhoto = useCallback((timestamp: number) => {
    setPhotos(prev => {
      const next = prev.filter(p => p.timestamp !== timestamp);
      savePhotos(companion.id, next);
      return next;
    });
  }, [companion.id]);

  // Mock stats — in production, fetch from GET /users/stats
  const stats = {
    streakDays: 1,
    totalMessages: 0,
    conversations: 0,
  };

  // Mock memories — in production, fetch from GET /memory/context
  const memories: { type: string; content: string }[] = [];

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg-primary)',
        animation: 'slide-in-right 0.35s ease',
        overflowY: 'auto',
        padding: 'calc(var(--safe-top) + 12px) 20px calc(var(--safe-bottom) + 20px)',
        position: 'relative',
      }}
    >
      <div className="aurora-bg" />
      {/* Close button */}
      <button
        onClick={() => navigate('chat')}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--text-muted)',
          fontSize: 14,
          padding: '4px 0',
          marginBottom: 16,
          alignSelf: 'flex-start',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Back to chat
      </button>

      {/* Portrait + name */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 12,
          marginBottom: 28,
          animation: 'fade-in-up 0.4s ease',
        }}
      >
                <AvatarRenderer
          appearance={companion.appearance}
          visual={companion.visual}
          avatarImage={companion.avatarImage}
          size={96}
          variant="portrait"
          showTwinBadge={!companion.avatarImage?.includes('pravatar')}
        />
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 22, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
            {companion.name}
          </div>
          <div style={{ fontSize: 13, color: accent, marginTop: 2 }}>
            {companion.archetype}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {companion.personalityTraits.map(trait => (
            <span
              key={trait}
              style={{
                fontSize: 11,
                padding: '3px 10px',
                borderRadius: 10,
                background: `${accent}15`,
                color: 'var(--text-secondary)',
              }}
            >
              {trait}
            </span>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div
        className="surface-card"
        style={{
          padding: 16,
          marginBottom: 16,
          borderRadius: 18,
          animation: 'fade-in-up 0.4s ease 0.1s both',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>
          Connection
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-around' }}>
          <StatBlock label="Streak" value={`${stats.streakDays}d`} accent={accent} />
          <StatBlock label="Messages" value={String(stats.totalMessages)} accent={accent} />
          <StatBlock label="Chats" value={String(stats.conversations)} accent={accent} />
        </div>
      </div>

      {/* Soul Score */}
      <SoulScoreSection soulScore={soulScore} accent={accent} />

      {/* What I know about you */}
      <div
        className="surface-card"
        style={{
          padding: 16,
          marginBottom: 16,
          borderRadius: 18,
          animation: 'fade-in-up 0.4s ease 0.2s both',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div style={{ fontSize: 11, color: accent, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12, fontWeight: 600 }}>
          What I know about you
        </div>
        {memories.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {memories.map((mem, i) => (
              <div
                key={i}
                style={{
                  padding: '10px 12px',
                  borderRadius: 12,
                  background: 'rgba(255,255,255,0.03)',
                  border: `1px solid ${accent}15`,
                }}
              >
                <div style={{ fontSize: 10, color: accent, marginBottom: 4, textTransform: 'uppercase' }}>
                  {mem.type}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {mem.content}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            style={{
              padding: '20px 12px',
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontSize: 13,
              lineHeight: 1.6,
            }}
          >
            As you talk with {companion.name}, the things you share will be remembered here.
            Start a conversation to build your connection.
          </div>
        )}
      </div>

      {/* Photo Gallery */}
      <div
        className="surface-card"
        style={{
          padding: 16,
          marginBottom: 16,
          borderRadius: 18,
          animation: 'fade-in-up 0.4s ease 0.25s both',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Photo Gallery
          </div>
          {photos.length > 0 && (
            <span style={{ fontSize: 11, color: accent }}>
              {photos.length} {photos.length === 1 ? 'photo' : 'photos'}
            </span>
          )}
        </div>

        {photos.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {photos.map(photo => (
              <div
                key={photo.timestamp}
                className="pressable"
                onClick={() => setExpandedPhoto(photo)}
                style={{
                  position: 'relative',
                  borderRadius: 12,
                  overflow: 'hidden',
                  aspectRatio: '3/4',
                  cursor: 'pointer',
                  background: 'var(--surface-1)',
                }}
              >
                <img
                  src={photo.url}
                  alt={photo.prompt}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
                <div style={{
                  position: 'absolute',
                  bottom: 0, left: 0, right: 0,
                  padding: '16px 8px 6px',
                  background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
                  fontSize: 10,
                  color: 'rgba(255,255,255,0.8)',
                  fontFamily: 'var(--font-body)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {photo.prompt}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            style={{
              padding: '24px 12px',
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontSize: 13,
              lineHeight: 1.6,
            }}
          >
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" style={{ opacity: 0.3, marginBottom: 8 }}>
              <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="9" cy="9" r="2" stroke="currentColor" strokeWidth="1.5" />
              <path d="M21 15l-5-5L5 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <div>No photos yet</div>
            <div style={{ fontSize: 11, marginTop: 4 }}>
              Ask {companion.name} for a photo in chat
            </div>
          </div>
        )}
      </div>

      {/* Preferences */}
      <div
        className="surface-card"
        style={{
          padding: 16,
          marginBottom: 16,
          borderRadius: 18,
          animation: 'fade-in-up 0.4s ease 0.3s both',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>
          Preferences
        </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Relationship</span>
            <span style={{ fontSize: 13, color: accent, textTransform: 'capitalize' }}>
              {companion.relationshipMode}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Communication</span>
            <span style={{ fontSize: 13, color: accent, textTransform: 'capitalize' }}>
              {companion.communicationMode}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Aura</span>
            <span style={{ fontSize: 13, color: accent }}>
              {companion.visual.paletteName}
            </span>
          </div>
        </div>
      </div>

      {/* Switch companion */}
      <button
        className="pressable"
        onClick={() => navigate('characterSelection')}
        style={{
          width: '100%',
          padding: '14px 24px',
          borderRadius: 14,
          border: `1px solid ${accent}30`,
          background: `${accent}08`,
          color: 'var(--text-primary)',
          fontSize: 15,
          fontWeight: 500,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          marginBottom: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M17 1l4 4-4 4M3 11V9a4 4 0 0 1 4-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 0 1-4 4H3" stroke={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Switch companion
      </button>

      {/* Browse marketplace */}
      <button
        className="pressable"
        onClick={() => navigate('marketplace')}
        style={{
          width: '100%',
          padding: '12px 24px',
          borderRadius: 14,
          border: `1px solid var(--border-default)`,
          background: 'var(--surface-1)',
          color: 'var(--text-secondary)',
          fontSize: 14,
          fontWeight: 500,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          marginBottom: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M3 9l1-5h16l1 5M5 9v11h14V9M9 14h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Browse marketplace
      </button>

      {/* Reset onboarding */}
      <button
        onClick={resetOnboarding}
        style={{
          width: '100%',
          padding: '10px 24px',
          borderRadius: 14,
          border: 'none',
          background: 'none',
          color: 'var(--text-muted)',
          fontSize: 13,
          cursor: 'pointer',
          transition: 'color 0.2s ease',
        }}
      >
        Reset SoulLink
      </button>

      {/* Fullscreen photo viewer */}
      {expandedPhoto && (
        <div
          onClick={() => setExpandedPhoto(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.92)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            animation: 'fade-in 0.2s ease',
            padding: 20,
          }}
        >
          <img
            src={expandedPhoto.url}
            alt={expandedPhoto.prompt}
            style={{
              maxWidth: '90%',
              maxHeight: '70%',
              borderRadius: 16,
              objectFit: 'contain',
            }}
          />
          <div style={{
            marginTop: 16,
            fontSize: 13,
            color: 'rgba(255,255,255,0.7)',
            fontFamily: 'var(--font-body)',
            textAlign: 'center',
            maxWidth: 400,
          }}>
            {expandedPhoto.prompt}
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); handleDeletePhoto(expandedPhoto.timestamp); setExpandedPhoto(null); }}
            style={{
              marginTop: 16,
              padding: '8px 20px',
              borderRadius: 10,
              border: `1px solid rgba(255,100,100,0.3)`,
              background: 'rgba(255,100,100,0.1)',
              color: '#FF6B6B',
              fontSize: 13,
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
            }}
          >
            Delete photo
          </button>
          <button
            onClick={() => setExpandedPhoto(null)}
            style={{
              position: 'absolute',
              top: 'calc(var(--safe-top) + 16px)',
              right: 20,
              background: 'var(--surface-3)',
              border: '1px solid var(--border-default)',
              borderRadius: '50%',
              width: 36,
              height: 36,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-primary)',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

function StatBlock({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 22, fontWeight: 700, color: accent }}>{value}</div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{label}</div>
    </div>
  );
}
