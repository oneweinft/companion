import type { ChatMessage } from '../types';
import { EMOTION_COLORS } from '../types';

interface ConversationHistoryProps {
  messages: ChatMessage[];
}

/**
 * Scrollable conversation history showing past messages.
 * Uses glassmorphism panels with emotion-colored accents.
 * Auto-scrolls to latest message.
 */
export function ConversationHistory({ messages }: ConversationHistoryProps) {
  if (messages.length === 0) return null;

  return (
    <div
      style={{
        flex: 1,
        overflowY: 'auto',
        padding: '12px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      }}
    >
      {messages.map(msg => {
        const isUser = msg.role === 'user';
        const emotionColor = msg.emotion
          ? EMOTION_COLORS[msg.emotion].glow
          : '#7B2D8E';

        return (
          <div
            key={msg.id}
            style={{
              alignSelf: isUser ? 'flex-end' : 'flex-start',
              maxWidth: '80%',
              animation: 'float-up 0.3s ease',
            }}
          >
            <div
              className="glass-panel"
              style={{
                padding: '10px 14px',
                borderRadius: 16,
                borderBottomRightRadius: isUser ? 4 : 16,
                borderBottomLeftRadius: isUser ? 16 : 4,
                background: isUser
                  ? 'rgba(255, 51, 102, 0.08)'
                  : `${emotionColor}10`,
                borderColor: isUser
                  ? 'rgba(255, 51, 102, 0.15)'
                  : `${emotionColor}25`,
              }}
            >
              {!isUser && msg.emotion && (
                <div
                  style={{
                    fontSize: 10,
                    color: emotionColor,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    marginBottom: 4,
                    fontWeight: 600,
                  }}
                >
                  {msg.emotion}
                </div>
              )}
              <p
                style={{
                  fontSize: 14,
                  lineHeight: 1.5,
                  color: '#D4D4E8',
                }}
              >
                {msg.content}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
