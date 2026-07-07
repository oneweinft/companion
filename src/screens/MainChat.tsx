import { useEffect, useRef, useState, useCallback } from 'react';
import { useVoiceInteraction, type CompanionContext, OPENAI_VOICES } from '../hooks/useVoiceInteraction';
import { useApp } from '../context/AppContext';
import { AvatarRenderer } from '../components/AvatarRenderer';
import { Waveform } from '../components/Waveform';
import { StreamingText } from '../components/StreamingText';
import { TranscriptBubble } from '../components/TranscriptBubble';
import { VoiceControlBar } from '../components/VoiceControlBar';
import { ConversationHistory } from '../components/ConversationHistory';
import { TextInputFallback } from '../components/TextInputFallback';
import { ConversationPrompts } from '../components/ConversationPrompts';
import { MemoryPeek, useMemoryPeek } from '../components/MemoryPeek';
import { ImageMessage } from '../components/ImageMessage';
import { STATE_COLORS } from '../types';
import { generateCompanionPhoto, isDigitalTwinConfigured } from '../lib/digitalTwin';
import { useProactiveMessaging } from '../hooks/useProactiveMessaging';
import { useSoulScore } from '../hooks/useSoulScore';
import { ProactiveBanner } from '../components/ProactiveBanner';
import { SoulScoreWidget, AchievementToast } from '../components/SoulScore';

/** Redesigned main chat screen — voice-first with companion portrait, prompts, and memory peek. */
export function MainChat() {
  const { selectedCompanion, navigate } = useApp();

    // All hooks must be called before any conditional returns (Rules of Hooks)
  // Pass companion personality info for contextual LLM responses
  const companionCtx: CompanionContext | null = selectedCompanion
    ? { name: selectedCompanion.name, bio: selectedCompanion.bio, personalityTraits: selectedCompanion.personalityTraits }
    : null;

    const {
    state,
    transcript,
    assistantText,
    messages,
    currentEmotion,
        micActive,
    micError,
    toggleMic,
    sendTextMessage,
    audioLevel,
    waveformData,
        voiceOutputEnabled,
    toggleVoiceOutput,
    selectedVoice,
    setSelectedVoice,
  } = useVoiceInteraction(companionCtx);

  const historyRef = useRef<HTMLDivElement>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [memoryText, setMemoryText] = useState<string | null>(null);
  const [voiceMenuOpen, setVoiceMenuOpen] = useState(false);
  const [photoMessages, setPhotoMessages] = useState<Record<string, { url?: string; prompt?: string; generating: boolean }>>({});

  const isIdle = state === 'idle';
  const hasMessages = messages.length > 0;
  const twinAvailable = isDigitalTwinConfigured();
  const { visible: memoryPeekVisible, setVisible: setMemoryPeekVisible } = useMemoryPeek(isIdle, hasMessages);

  // Proactive messaging — 7-day cycle from prompts_7day.py
  const { pendingMessage: proactiveMessage, dismissProactive, recordInteraction } = useProactiveMessaging(
    selectedCompanion?.name ?? null
  );

  // Soul Score gamification
  const soulScore = useSoulScore();

  // Redirect if no companion selected
  useEffect(() => {
    if (!selectedCompanion) {
      navigate('characterSelection');
    }
  }, [selectedCompanion, navigate]);

  // Auto-scroll history
  useEffect(() => {
    if (historyRef.current) {
      historyRef.current.scrollTop = historyRef.current.scrollHeight;
    }
  }, [messages]);

  // Fetch memory context for peek
  useEffect(() => {
    if (hasMessages && isIdle) {
      const lastAssistant = [...messages].reverse().find(m => m.role === 'assistant');
      if (lastAssistant) {
        setMemoryText(lastAssistant.content.slice(0, 60) + '...');
      }
    }
  }, [isIdle, hasMessages, messages]);

  // Soul Score: daily login bonus + voice conversation tracking
  useEffect(() => { soulScore.recordDailyLogin(); }, []); // eslint-disable-line
  const prevSpeakingRef = useRef(false);
  useEffect(() => {
    if (state === 'speaking' && !prevSpeakingRef.current) {
      soulScore.recordVoice();
      recordInteraction();
    }
    prevSpeakingRef.current = state === 'speaking';
  }, [state, soulScore, recordInteraction]);

    if (!selectedCompanion) {
    return null;
  }

  const companion = selectedCompanion;
  const stateColor = STATE_COLORS[state];
  const accent = companion.accentColor;

  const handlePromptSelect = (prompt: string) => {
    sendTextMessage(prompt);
    soulScore.recordMessage();
    recordInteraction();
    setMemoryPeekVisible(false);
  };

  // Wrapped sendTextMessage that also records Soul Score + proactive interaction
  const handleSendText = useCallback((text: string) => {
    sendTextMessage(text);
    soulScore.recordMessage();
    recordInteraction();
  }, [sendTextMessage, soulScore, recordInteraction]);

  // Request companion photo — uses digital-twin-generator for in-chat image generation
  const handleRequestPhoto = useCallback(async () => {
    if (!companion?.avatarImage || !twinAvailable) return;

    const photoId = `photo_${Date.now()}`;
    const prompts = [
      'A candid selfie, smiling warmly at the camera',
      'Relaxing at a cozy cafe, natural lighting',
      'A thoughtful portrait, soft focus, evening light',
      'Outdoors in a garden, golden hour sunlight',
      'A casual moment, laughing, candid shot',
    ];
    const prompt = prompts[Math.floor(Math.random() * prompts.length)];

    // Set loading state
    setPhotoMessages(prev => ({ ...prev, [photoId]: { prompt, generating: true } }));

    try {
      const imageUrl = await generateCompanionPhoto(
        companion.avatarImage!,
        prompt,
        { qualityMode: 'fast' }
      );
      setPhotoMessages(prev => ({ ...prev, [photoId]: { url: imageUrl, prompt, generating: false } }));

      // Persist to localStorage for gallery display in CompanionProfile
      if (imageUrl) {
        try {
          const key = `soullink_photos_${companion.id}`;
          const existing = JSON.parse(localStorage.getItem(key) || '[]');
          existing.unshift({ url: imageUrl, prompt, timestamp: Date.now() });
          localStorage.setItem(key, JSON.stringify(existing.slice(0, 50)));
        } catch {
          // storage might be full
        }
      }
    } catch (err) {
      setPhotoMessages(prev => ({ ...prev, [photoId]: { prompt, generating: false } }));
    }
  }, [companion, twinAvailable]);

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg-primary)',
        transition: 'background 0.8s ease',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Aurora mesh background */}
      <div className="aurora-bg" />

      {/* Proactive message banner (7-day cycle) */}
      {proactiveMessage && (
        <ProactiveBanner
          message={proactiveMessage}
          companionName={companion.name}
          accent={accent}
          onDismiss={dismissProactive}
          onRespond={(text) => handleSendText(text)}
        />
      )}

      {/* Achievement toast (Soul Score) */}
      {soulScore.newAchievement && (
        <AchievementToast
          achievement={soulScore.newAchievement}
          onDismiss={soulScore.dismissAchievement}
        />
      )}

      {/* ===== Header ===== */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 'calc(var(--safe-top) + 10px) 16px 8px',
          flexShrink: 0,
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Companion name + thumbnail */}
        <button
          onClick={() => setHistoryOpen(!historyOpen)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${companion.gradientFrom}, ${companion.gradientTo})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 0 12px ${accent}40`,
            }}
          >
            <span style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.9)' }}>
              {companion.name[0]}
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: 0.3, fontFamily: 'var(--font-display)' }}>
              {companion.name}
            </span>
            <span style={{ fontSize: 10, color: accent }}>
              {companion.archetype}
            </span>
          </div>
        </button>

        {/* Status + profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {state !== 'idle' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: stateColor,
                  animation: 'breathe 1.5s ease-in-out infinite',
                }}
              />
                            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                Active
              </span>
            </div>
          )}
          {/* Request Photo button — uses digital-twin-generator */}
          {twinAvailable && companion.avatarImage && (
            <button
              className="pressable"
              onClick={handleRequestPhoto}
              disabled={state !== 'idle'}
              aria-label="Request a photo"
              style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                border: 'none',
                cursor: state === 'idle' ? 'pointer' : 'default',
                background: 'var(--surface-2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: state === 'idle' ? 1 : 0.4,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2v11z" stroke="var(--text-secondary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="13" r="4" stroke="var(--text-secondary)" strokeWidth="1.5" />
              </svg>
            </button>
          )}
          {/* Soul Score widget */}
          <SoulScoreWidget soulScore={soulScore} accent={accent} onClick={() => navigate('profile')} />
          {/* Phone call mode button */}
          <button
            className="pressable"
            onClick={() => navigate('phoneCall')}
            aria-label="Start phone call"
            style={{
              width: 32, height: 32, borderRadius: 10,
              border: 'none', cursor: 'pointer',
              background: 'var(--surface-2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" stroke="var(--text-secondary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          {/* Group chat button */}
          <button
            className="pressable"
            onClick={() => navigate('groupChat')}
            aria-label="Group chat"
            style={{
              width: 32, height: 32, borderRadius: 10,
              border: 'none', cursor: 'pointer',
              background: 'var(--surface-2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="var(--text-secondary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="9" cy="7" r="4" stroke="var(--text-secondary)" strokeWidth="1.5" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="var(--text-secondary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            onClick={() => navigate('profile')}
            aria-label="Companion profile"
            style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              border: 'none',
              cursor: 'pointer',
              background: 'var(--surface-2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="3" stroke="var(--text-secondary)" strokeWidth="2" />
              <path d="M12 1v6m0 10v6M4.22 4.22l4.24 4.24m7.08 7.08l4.24 4.24M1 12h6m10 0h6M4.22 19.78l4.24-4.24m7.08-7.08l4.24-4.24" stroke="var(--text-secondary)" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </header>

      {/* ===== Conversation History Drawer ===== */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(8, 8, 15, 0.92)',
          backdropFilter: 'var(--glass-blur)',
          WebkitBackdropFilter: 'var(--glass-blur)',
          zIndex: 100,
          transform: historyOpen ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
          display: 'flex',
          flexDirection: 'column',
          paddingTop: 'calc(var(--safe-top) + 12px)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 16px 12px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>
            Conversation
          </span>
          <button
            onClick={() => setHistoryOpen(false)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              fontSize: 14,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Close
          </button>
        </div>
        <div ref={historyRef} style={{ flex: 1, overflowY: 'auto' }}>
          <ConversationHistory messages={messages} />
        </div>
      </div>

      {/* ===== Center Stage ===== */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 20,
          padding: '12px 0',
          minHeight: 0,
          position: 'relative',
          zIndex: 1,
        }}
      >
                {/* Companion Avatar */}
                <AvatarRenderer
          appearance={companion.appearance}
          visual={companion.visual}
          avatarImage={companion.avatarImage}
          state={state}
          emotion={currentEmotion}
          audioLevel={audioLevel}
          showTwinBadge={!companion.avatarImage?.includes('pravatar')}
        />

        {/* Waveform */}
        <Waveform data={waveformData} state={state} height={60} />

        {/* Live Transcription */}
        <TranscriptBubble text={transcript} state={state} />

        {/* Streaming AI Response */}
        <StreamingText
          text={assistantText}
          state={state}
          emotion={currentEmotion}
        />

        {/* Generated companion photos */}
        {Object.entries(photoMessages).map(([id, photo]) => (
          <ImageMessage
            key={id}
            imageUrl={photo.url}
            prompt={photo.prompt}
            isGenerating={photo.generating}
            accent={accent}
            onRetry={handleRequestPhoto}
          />
        ))}

        {/* Conversation Prompts (idle state only) */}
        {isIdle && messages.length === 0 && (
                    <ConversationPrompts
            companion={companion}
            onSelectPrompt={handlePromptSelect}
          />
        )}

        {/* Memory Peek (periodic idle state) */}
        <MemoryPeek
          companion={companion}
          memoryText={memoryText}
          onOpenProfile={() => navigate('profile')}
          visible={memoryPeekVisible}
        />
      </main>

      {/* ===== Bottom Controls ===== */}
      <footer
        style={{
          flexShrink: 0,
          padding: '8px 20px 0',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 12,
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Conversation history toggle */}
        {hasMessages && isIdle && !historyOpen && (
          <button
            onClick={() => setHistoryOpen(true)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              fontSize: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '4px 12px',
              borderRadius: 12,
              transition: 'color 0.2s ease',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M6 14l6-6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {messages.length} {messages.length === 1 ? 'message' : 'messages'}
          </button>
        )}

                                {/* Voice output toggle + voice selector */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, position: 'relative' }}>
          <VoiceControlBar
            state={state}
            onToggleMic={toggleMic}
            micActive={micActive}
          />
          {/* Voice output on/off toggle */}
          <button
            onClick={toggleVoiceOutput}
            aria-label={voiceOutputEnabled ? 'Mute voice output' : 'Unmute voice output'}
            style={{
              background: voiceOutputEnabled ? 'var(--surface-3)' : 'none',
              border: '1px solid var(--border-default)',
              cursor: 'pointer',
              color: voiceOutputEnabled ? accent : 'var(--text-muted)',
              borderRadius: '50%',
              width: 40,
              height: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
              flexShrink: 0,
            }}
          >
            {voiceOutputEnabled ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M11 5L6 9H2v6h4l5 4V5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M15.54 8.46a5 5 0 010 7.07" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M19.07 4.93a10 10 0 010 14.14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M11 5L6 9H2v6h4l5 4V5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="23" y1="9" x2="17" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <line x1="17" y1="9" x2="23" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            )}
          </button>
          {/* Voice selector button */}
          <button
            onClick={() => setVoiceMenuOpen(prev => !prev)}
            aria-label="Select voice"
            style={{
              background: voiceMenuOpen ? 'var(--surface-3)' : 'none',
              border: '1px solid var(--border-default)',
              cursor: 'pointer',
              color: voiceMenuOpen ? accent : 'var(--text-muted)',
              borderRadius: '50%',
              width: 40,
              height: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
              flexShrink: 0,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 2a3 3 0 00-3 3v7a3 3 0 006 0V5a3 3 0 00-3-3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M19 10v2a7 7 0 01-14 0v-2M12 19v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          {/* Voice dropdown */}
          {voiceMenuOpen && (
            <>
              {/* Backdrop to close on outside tap */}
              <div
                onClick={() => setVoiceMenuOpen(false)}
                style={{
                  position: 'fixed',
                  inset: 0,
                  zIndex: 99,
                }}
              />
              {/* Dropdown panel */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '100%',
                  right: 0,
                  marginBottom: 8,
                  background: 'rgba(14, 14, 26, 0.96)',
                  backdropFilter: 'var(--glass-blur)',
                  WebkitBackdropFilter: 'var(--glass-blur)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 16,
                  padding: 8,
                  minWidth: 240,
                  maxHeight: 320,
                  overflowY: 'auto',
                  zIndex: 100,
                  animation: 'fade-in 0.2s ease',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                }}
              >
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, padding: '6px 10px 8px', fontWeight: 600 }}>
                  AI Voice
                </div>
                {OPENAI_VOICES.map(voice => (
                  <button
                    key={voice.id}
                    onClick={() => {
                      setSelectedVoice(voice.id);
                      setVoiceMenuOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 12,
                      border: 'none',
                      cursor: 'pointer',
                      background: selectedVoice === voice.id ? `${accent}15` : 'transparent',
                      color: selectedVoice === voice.id ? accent : 'var(--text-primary)',
                      transition: 'background 0.15s ease',
                      textAlign: 'left',
                    }}
                  >
                    {/* Gender icon */}
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%',
                      background: selectedVoice === voice.id ? `${accent}25` : 'var(--surface-2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <span style={{ fontSize: 13 }}>
                        {voice.gender === 'female' ? '\u2640' : voice.gender === 'male' ? '\u2642' : '\u26A5'}
                      </span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{voice.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {voice.description}
                      </div>
                    </div>
                    {selectedVoice === voice.id && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                        <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <div style={{ width: '100%', paddingBottom: 'calc(var(--safe-bottom) + 12px)' }}>
          <TextInputFallback
            state={state}
            onSend={handleSendText}
            micError={micError}
          />
        </div>
      </footer>
    </div>
  );
}
