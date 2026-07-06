import { useEffect, useRef, useState } from 'react';
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
import { STATE_COLORS } from '../types';

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

  const isIdle = state === 'idle';
  const hasMessages = messages.length > 0;
  const { visible: memoryPeekVisible, setVisible: setMemoryPeekVisible } = useMemoryPeek(isIdle, hasMessages);

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

    if (!selectedCompanion) {
    return null;
  }

  const companion = selectedCompanion;
  const stateColor = STATE_COLORS[state];
  const accent = companion.accentColor;

  const handlePromptSelect = (prompt: string) => {
    sendTextMessage(prompt);
    setMemoryPeekVisible(false);
  };

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: `
          radial-gradient(ellipse at 50% 20%, ${accent}0a 0%, transparent 60%),
          radial-gradient(ellipse at 50% 80%, ${stateColor}08 0%, transparent 50%),
          var(--bg-primary)
        `,
        transition: 'background 0.8s ease',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* ===== Header ===== */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 'calc(var(--safe-top) + 10px) 16px 8px',
          flexShrink: 0,
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
            <span style={{ fontSize: 15, fontWeight: 600, color: '#E8E8F0', letterSpacing: 0.3 }}>
              {companion.name}
            </span>
            <span style={{ fontSize: 10, color: accent }}>
              {companion.archetype}
            </span>
          </div>
        </button>

        {/* Status + profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
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
                            <span style={{ fontSize: 11, color: '#5A5A70' }}>
                Active
              </span>
            </div>
          )}
          <button
            onClick={() => navigate('profile')}
            aria-label="Companion profile"
            style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              border: 'none',
              cursor: 'pointer',
              background: 'var(--glass-bg)',
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
          background: 'rgba(10, 10, 20, 0.85)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
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
          borderTop: '1px solid rgba(255,255,255,0.05)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 12,
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
              background: voiceOutputEnabled ? 'rgba(255,255,255,0.08)' : 'none',
              border: '1px solid rgba(255,255,255,0.1)',
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
              background: voiceMenuOpen ? 'rgba(255,255,255,0.08)' : 'none',
              border: '1px solid rgba(255,255,255,0.1)',
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
                  background: 'rgba(20, 20, 30, 0.96)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.1)',
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
                      background: selectedVoice === voice.id ? `${accent}25` : 'rgba(255,255,255,0.06)',
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
            onSend={sendTextMessage}
            micError={micError}
          />
        </div>
      </footer>
    </div>
  );
}
