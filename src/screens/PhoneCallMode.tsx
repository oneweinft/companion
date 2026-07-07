import { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { useVoiceInteraction, type CompanionContext } from '../hooks/useVoiceInteraction';
import { AvatarRenderer } from '../components/AvatarRenderer';
import { STATE_COLORS, STATE_LABELS } from '../types';

/**
 * Phone Call Mode — full-screen immersive voice experience.
 *
 * Inspired by Replika's phone call feature and Muah.ai's call mode.
 * Large avatar, call timer, mute/speaker/end controls.
 * Uses the same useVoiceInteraction hook as MainChat.
 */
export function PhoneCallMode() {
  const { selectedCompanion, navigate } = useApp();
  const [callDuration, setCallDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const [callState, setCallState] = useState<'connecting' | 'connected' | 'ended'>('connecting');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // All hooks must be called before conditional returns
  const companionCtx: CompanionContext | null = selectedCompanion
    ? { name: selectedCompanion.name, bio: selectedCompanion.bio, personalityTraits: selectedCompanion.personalityTraits }
    : null;

  const {
    state,
    transcript,
    assistantText,
    currentEmotion,
    micActive,
    toggleMic,
    audioLevel,
    voiceOutputEnabled,
    toggleVoiceOutput,
  } = useVoiceInteraction(companionCtx);

  // Auto-connect after a brief delay
  useEffect(() => {
    const connectTimer = setTimeout(() => setCallState('connected'), 2000);
    return () => clearTimeout(connectTimer);
  }, []);

  // Call timer
  useEffect(() => {
    if (callState === 'connected') {
      timerRef.current = setInterval(() => {
        setCallDuration(d => d + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [callState]);

  // Auto-start listening when connected
  useEffect(() => {
    if (callState === 'connected' && !micActive && state === 'idle') {
      const timer = setTimeout(() => toggleMic(), 500);
      return () => clearTimeout(timer);
    }
  }, [callState, state, micActive, toggleMic]);

  // Handle mute
  const handleMute = useCallback(() => {
    if (micActive) toggleMic();
    setMuted(m => !m);
  }, [micActive, toggleMic]);

  // End call
  const handleEndCall = useCallback(() => {
    setCallState('ended');
    if (micActive) toggleMic();
    setTimeout(() => navigate('chat'), 1500);
  }, [micActive, toggleMic, navigate]);

  if (!selectedCompanion) {
    navigate('chat');
    return null;
  }

  const companion = selectedCompanion;
  const accent = companion.accentColor;
  const stateColor = STATE_COLORS[state];
  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: `radial-gradient(ellipse at 50% 30%, ${accent}15 0%, var(--bg-primary) 60%)`,
        padding: 'calc(var(--safe-top) + 40px) 20px calc(var(--safe-bottom) + 40px)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div className="aurora-bg" />

      {/* ── Top: Status ── */}
      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
        {callState === 'connecting' && (
          <div style={{ fontSize: 14, color: 'var(--text-muted)', animation: 'fade-in 0.5s ease' }}>
            Calling {companion.name}...
          </div>
        )}
        {callState === 'connected' && (
          <>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '4px 12px', borderRadius: 12,
              background: `${stateColor}15`,
              marginBottom: 6,
            }}>
              <div style={{
                width: 6, height: 6, borderRadius: '50%',
                background: stateColor,
                animation: 'breathe 1.5s ease-in-out infinite',
              }} />
              <span style={{ fontSize: 11, color: stateColor, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 500 }}>
                {STATE_LABELS[state]}
              </span>
            </div>
            <div style={{
              fontSize: 17, fontWeight: 600, color: 'var(--text-primary)',
              fontFamily: 'var(--font-display)', letterSpacing: 0.5,
            }}>
              {formatTime(callDuration)}
            </div>
          </>
        )}
        {callState === 'ended' && (
          <div style={{ fontSize: 14, color: 'var(--text-muted)', animation: 'fade-in 0.3s ease' }}>
            Call ended
          </div>
        )}
      </div>

      {/* ── Center: Avatar ── */}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
        <AvatarRenderer
          appearance={companion.appearance}
          visual={companion.visual}
          avatarImage={companion.avatarImage}
          state={callState === 'connecting' ? 'idle' : state}
          emotion={currentEmotion}
          audioLevel={audioLevel}
          size={200}
          showTwinBadge={!companion.avatarImage?.includes('pravatar')}
        />
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: 28, fontWeight: 600, color: 'var(--text-primary)',
            fontFamily: 'var(--font-display)',
          }}>
            {companion.name}
          </div>
          <div style={{ fontSize: 13, color: accent, marginTop: 2 }}>
            {companion.archetype}
          </div>
        </div>

        {/* Live transcript */}
        {(transcript || assistantText) && callState === 'connected' && (
          <div style={{
            maxWidth: 320, textAlign: 'center', minHeight: 40,
            fontSize: 14, color: 'var(--text-secondary)',
            fontFamily: 'var(--font-body)', lineHeight: 1.5,
            opacity: 0.8,
          }}>
            {assistantText || transcript || ''}
          </div>
        )}
      </div>

      {/* ── Bottom: Call controls ── */}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
        {/* Secondary controls */}
        <div style={{ display: 'flex', gap: 24 }}>
          {/* Mute */}
          <CallControlButton
            active={!muted}
            onClick={handleMute}
            disabled={callState !== 'connected'}
            label={muted ? 'Unmute' : 'Mute'}
            icon={muted ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 15a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3Z" fill="currentColor" />
                <path d="M19 11a1 1 0 0 0-2 0 5 5 0 0 1-10 0 1 1 0 0 0-2 0 7 7 0 0 0 6 6.92V21a1 1 0 0 0 2 0v-3.08A7 7 0 0 0 19 11Z" fill="currentColor" />
                <line x1="3" y1="3" x2="21" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 15a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3Z" fill="currentColor" />
                <path d="M19 11a1 1 0 0 0-2 0 5 5 0 0 1-10 0 1 1 0 0 0-2 0 7 7 0 0 0 6 6.92V21a1 1 0 0 0 2 0v-3.08A7 7 0 0 0 19 11Z" fill="currentColor" />
              </svg>
            )}
          />

          {/* Speaker / voice output */}
          <CallControlButton
            active={voiceOutputEnabled}
            onClick={() => toggleVoiceOutput()}
            disabled={callState !== 'connected'}
            label={voiceOutputEnabled ? 'Speaker' : 'Earpiece'}
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M3 10v4a1 1 0 0 0 1 1h3l4 4V5L7 9H4a1 1 0 0 0-1 1z" fill="currentColor" />
                {voiceOutputEnabled && <path d="M16 8a5 5 0 0 1 0 8M19 5a9 9 0 0 1 0 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />}
              </svg>
            }
          />

          {/* Text input fallback */}
          <CallControlButton
            active={false}
            onClick={() => navigate('chat')}
            disabled={false}
            label="Text mode"
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            }
          />
        </div>

        {/* End call button */}
        <button
          className="pressable"
          onClick={handleEndCall}
          disabled={callState === 'ended'}
          aria-label="End call"
          style={{
            width: 68,
            height: 68,
            borderRadius: '50%',
            border: 'none',
            cursor: callState === 'ended' ? 'default' : 'pointer',
            background: callState === 'ended' ? 'var(--surface-2)' : '#FF3B30',
            boxShadow: callState === 'ended' ? 'none' : '0 4px 24px rgba(255, 59, 48, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.2s ease, background 0.3s ease',
          }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" style={{ transform: 'rotate(135deg)' }}>
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" fill="white" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ── Helper: Call control button ──────────────────────

function CallControlButton({
  active,
  onClick,
  disabled,
  label,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  disabled: boolean;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <button
      className="pressable"
      onClick={onClick}
      disabled={disabled}
      style={{
        width: 56, height: 56, borderRadius: '50%',
        cursor: disabled ? 'default' : 'pointer',
        background: active ? 'var(--surface-3)' : 'var(--surface-1)',
        border: `1px solid ${active ? 'var(--border-default)' : 'var(--border-subtle)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: active ? 'var(--text-primary)' : 'var(--text-muted)',
        opacity: disabled ? 0.4 : 1,
        transition: 'all 0.2s ease',
        flexDirection: 'column',
      }}
    >
      {icon}
      <span style={{ fontSize: 9, marginTop: 2, fontFamily: 'var(--font-body)' }}>{label}</span>
    </button>
  );
}
