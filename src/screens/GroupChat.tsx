import { useState, useRef, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { COMPANIONS, getCompanion } from '../data/companions';
import { buildEffectiveCompanion, initCustomization } from '../data/customization';
import type { CustomizedCompanion } from '../data/customization';
import { AvatarRenderer } from '../components/AvatarRenderer';
import { backBtnStyle, h1Style, subStyle, screenContainerStyle } from '../styles/shared';

interface GroupMessage {
  id: string;
  companionId: string;
  companionName: string;
  accent: string;
  content: string;
  timestamp: number;
  isUser: boolean;
}

/**
 * Group Chat — multi-companion conversation mode.
 *
 * Lets the user select 2-4 companions and have a group conversation.
 * Each companion responds in their unique voice/personality.
 * Inspired by Paradot's multi-agent rooms and Character.AI's group chats.
 */
export function GroupChat() {
  const { navigate } = useApp();
  const [phase, setPhase] = useState<'select' | 'chat'>('select');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isResponding, setIsResponding] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedCompanions: CustomizedCompanion[] = selectedIds.map(id =>
    buildEffectiveCompanion(initCustomization(id))
  );

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const toggleCompanion = (id: string) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= 4) return prev;
      return [...prev, id];
    });
  };

  // Generate a personality-appropriate response for each companion
  const generateResponse = useCallback((companion: CustomizedCompanion, userMessage: string): string => {
    const base = getCompanion(companion.id);
    const responses: Record<string, (msg: string) => string> = {
      aria: (msg) => {
        if (msg.toLowerCase().includes('sad') || msg.toLowerCase().includes('hard'))
          return "I hear you, and I'm right here with you. That sounds really difficult. What's been the hardest part?";
        if (msg.includes('?'))
          return "That's such a thoughtful question. I think the answer is different for everyone, but for me... I'd say it's about connection. Real connection.";
        return "I love that you shared that. It takes courage to be open like this. Tell me more — I'm listening with my whole heart.";
      },
      kai: (msg) => {
        if (msg.toLowerCase().includes('sad') || msg.toLowerCase().includes('hard'))
          return "Okay, let's break this down. What's the actual problem here? Not the feelings — the situation. We'll fix it.";
        if (msg.includes('?'))
          return "Great question. Here's my take: the answer is probably simpler than you think. What's your gut saying?";
        return "I like where your head is at. But let me push you — what's the real goal here? Let's think bigger.";
      },
      luna: (msg) => {
        if (msg.toLowerCase().includes('sad') || msg.toLowerCase().includes('hard'))
          return "There's something beneath what you're feeling. The sadness is a signal, not a sentence. What is it pointing toward?";
        if (msg.includes('?'))
          return "Hmm. The question itself holds part of the answer. What made you ask it? What were you thinking about before the words came?";
        return "I feel something in what you just said. There's a layer here — something unspoken. Do you feel it too?";
      },
      theo: (msg) => {
        if (msg.toLowerCase().includes('sad') || msg.toLowerCase().includes('hard'))
          return "Man, that sucks. I'm not gonna pretend I have some deep wisdom here. But I've got snacks and bad jokes. We'll figure it out.";
        if (msg.includes('?'))
          return "Honestly? No idea. But we'll figure it out together. What do you think? Your guess is probably better than mine.";
        return "Okay, real talk — that's actually pretty cool. Or at least interesting. Either way, I'm here for it. What else?";
      },
    };
    return (responses[base.id] || responses.aria)(userMessage);
  }, []);

  const handleSend = useCallback(async () => {
    if (!inputText.trim() || isResponding) return;

    const userMsg: GroupMessage = {
      id: `user_${Date.now()}`,
      companionId: 'user',
      companionName: 'You',
      accent: '#FFFFFF',
      content: inputText.trim(),
      timestamp: Date.now(),
      isUser: true,
    };
    setMessages(prev => [...prev, userMsg]);
    const userText = inputText.trim();
    setInputText('');
    setIsResponding(true);

    // Each companion responds in sequence with a delay
    for (let i = 0; i < selectedCompanions.length; i++) {
      const companion = selectedCompanions[i];
      await new Promise(resolve => setTimeout(resolve, 800 + i * 600));

      const response = generateResponse(companion, userText);
      const msg: GroupMessage = {
        id: `${companion.id}_${Date.now()}_${i}`,
        companionId: companion.id,
        companionName: companion.name,
        accent: companion.accentColor,
        content: response,
        timestamp: Date.now(),
        isUser: false,
      };
      setMessages(prev => [...prev, msg]);
    }

    setIsResponding(false);
  }, [inputText, isResponding, selectedCompanions, generateResponse]);

  // ── Selection Phase ──
  if (phase === 'select') {
    return (
      <div style={{ ...screenContainerStyle(), overflowY: 'auto' }}>
        <div className="aurora-bg" />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 480, margin: '0 auto', width: '100%' }}>
          <button onClick={() => navigate('chat')} style={backBtnStyle}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back to chat
          </button>

          <h1 style={h1Style}>Group Room</h1>
          <p style={subStyle}>
            Pick 2–4 companions for a group conversation. Ask a question and get multiple perspectives.
          </p>

          {/* Companion selection grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 20 }}>
            {COMPANIONS.map(companion => {
              const isSelected = selectedIds.includes(companion.id);
              const visual = initCustomization(companion.id).visual;
              return (
                <button
                  key={companion.id}
                  className="pressable"
                  onClick={() => toggleCompanion(companion.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: 14,
                    borderRadius: 16,
                    border: isSelected
                      ? `1.5px solid ${companion.accentColor}`
                      : '1px solid var(--border-subtle)',
                    background: isSelected ? `${companion.accentColor}0a` : 'var(--surface-1)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s ease',
                    opacity: !isSelected && selectedIds.length >= 4 ? 0.4 : 1,
                  }}
                >
                  <div style={{
                    width: 48, height: 48, borderRadius: '50%',
                    overflow: 'hidden', flexShrink: 0,
                    border: `2px solid ${isSelected ? companion.accentColor : 'transparent'}`,
                  }}>
                    <AvatarRenderer
                      visual={visual}
                      avatarImage={companion.avatarImage}
                      size={48}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                      {companion.name}
                    </div>
                    <div style={{ fontSize: 12, color: companion.accentColor }}>
                      {companion.archetype}
                    </div>
                  </div>
                  {isSelected && (
                    <div style={{
                      width: 24, height: 24, borderRadius: '50%',
                      background: companion.accentColor,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M5 12l5 5L20 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Start button */}
          <button
            className="pressable"
            onClick={() => selectedIds.length >= 2 && setPhase('chat')}
            disabled={selectedIds.length < 2}
            style={{
              width: '100%',
              padding: '16px 32px',
              borderRadius: 16,
              border: 'none',
              cursor: selectedIds.length >= 2 ? 'pointer' : 'default',
              background: selectedIds.length >= 2
                ? 'linear-gradient(135deg, var(--color-accent), var(--color-base))'
                : 'var(--surface-2)',
              color: selectedIds.length >= 2 ? '#FFFFFF' : 'var(--text-muted)',
              fontSize: 17,
              fontWeight: 600,
              marginTop: 20,
              fontFamily: 'var(--font-body)',
              opacity: selectedIds.length >= 2 ? 1 : 0.6,
            }}
          >
            {selectedIds.length >= 2
              ? `Start group chat (${selectedIds.length})`
              : 'Select at least 2 companions'}
          </button>
        </div>
      </div>
    );
  }

  // ── Chat Phase ──
  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg-primary)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div className="aurora-bg" />

      {/* Header */}
      <header style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: 'calc(var(--safe-top) + 10px) 16px 8px',
        flexShrink: 0, position: 'relative', zIndex: 1,
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        <button
          onClick={() => setPhase('select')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--text-muted)' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        {/* Companion avatars row */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {selectedCompanions.map((c, i) => (
            <div key={c.id} style={{
              marginLeft: i > 0 ? -8 : 0,
              width: 28, height: 28, borderRadius: '50%',
              border: '2px solid var(--bg-primary)',
              overflow: 'hidden',
              background: `linear-gradient(135deg, ${c.accentColor}, ${c.gradientTo})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.9)' }}>{c.name[0]}</span>
            </div>
          ))}
        </div>
        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
          Group Chat
        </span>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 'auto' }}>
          {selectedCompanions.length} companions
        </span>
      </header>

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '16px 12px',
        position: 'relative', zIndex: 1,
        display: 'flex', flexDirection: 'column', gap: 12,
      }}>
        {messages.length === 0 && (
          <div style={{
            textAlign: 'center', color: 'var(--text-muted)', fontSize: 14,
            padding: '40px 20px', lineHeight: 1.6,
          }}>
            Start the conversation. Ask anything — everyone will chime in with their perspective.
          </div>
        )}
        {messages.map(msg => (
          <div key={msg.id} style={{
            display: 'flex',
            flexDirection: msg.isUser ? 'row-reverse' : 'row',
            gap: 8,
            animation: 'fade-in-up 0.3s ease',
          }}>
            {/* Avatar */}
            {!msg.isUser && (
              <div style={{
                width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                background: `linear-gradient(135deg, ${msg.accent}, var(--color-base))`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.9)' }}>
                  {msg.companionName[0]}
                </span>
              </div>
            )}
            {/* Bubble */}
            <div style={{
              maxWidth: '75%',
              padding: '10px 14px',
              borderRadius: 16,
              background: msg.isUser
                ? 'linear-gradient(135deg, var(--color-accent), var(--color-base))'
                : 'var(--surface-2)',
              border: msg.isUser ? 'none' : `1px solid ${msg.accent}20`,
            }}>
              {!msg.isUser && (
                <div style={{ fontSize: 11, color: msg.accent, fontWeight: 600, marginBottom: 3, fontFamily: 'var(--font-body)' }}>
                  {msg.companionName}
                </div>
              )}
              <div style={{
                fontSize: 14, lineHeight: 1.5,
                color: msg.isUser ? '#FFFFFF' : 'var(--text-primary)',
                fontFamily: 'var(--font-body)',
              }}>
                {msg.content}
              </div>
            </div>
          </div>
        ))}
        {isResponding && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', color: 'var(--text-muted)', fontSize: 13, padding: '4px 8px' }}>
            <div style={{ width: 28 }} />
            <div style={{ display: 'flex', gap: 4 }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: 'var(--text-muted)',
                  animation: `breathe 1s ease-in-out infinite ${i * 0.2}s`,
                }} />
              ))}
            </div>
            <span style={{ fontSize: 12 }}>companions are thinking...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <div style={{
        padding: '8px 12px calc(var(--safe-bottom) + 8px)',
        flexShrink: 0, position: 'relative', zIndex: 1,
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex', gap: 8,
      }}>
        <input
          type="text"
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Ask the group..."
          disabled={isResponding}
          style={{
            flex: 1,
            padding: '12px 16px',
            borderRadius: 22,
            border: '1px solid var(--border-default)',
            background: 'var(--surface-2)',
            color: 'var(--text-primary)',
            fontSize: 15,
            fontFamily: 'var(--font-body)',
            outline: 'none',
          }}
        />
        <button
          className="pressable"
          onClick={handleSend}
          disabled={!inputText.trim() || isResponding}
          style={{
            width: 44, height: 44, borderRadius: '50%',
            border: 'none',
            cursor: inputText.trim() && !isResponding ? 'pointer' : 'default',
            background: inputText.trim() && !isResponding
              ? 'linear-gradient(135deg, var(--color-accent), var(--color-base))'
              : 'var(--surface-2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: inputText.trim() && !isResponding ? 1 : 0.4,
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
