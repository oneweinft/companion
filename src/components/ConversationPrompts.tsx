import type { CustomizedCompanion } from '../data/customization';

interface ConversationPromptsProps {
  companion: CustomizedCompanion;
  onSelectPrompt: (prompt: string) => void;
}

/** Prompt suggestions shown in idle state — solves the "blank page problem" (Pi's Discover pattern). */
export function ConversationPrompts({ companion, onSelectPrompt }: ConversationPromptsProps) {
  const prompts = getPrompts(companion);

  return (
    <div
      style={{
        display: 'flex',
        gap: 10,
        overflowX: 'auto',
        overflowY: 'hidden',
        padding: '4px 4px 8px',
        maxWidth: '100%',
        animation: 'fade-in 0.5s ease',
      }}
    >
      {prompts.map((prompt, i) => (
        <button
          key={i}
          onClick={() => onSelectPrompt(prompt)}
          style={{
            flexShrink: 0,
            padding: '10px 16px',
            borderRadius: 14,
            border: `1px solid ${companion.accentColor}25`,
            background: `${companion.accentColor}0a`,
            color: 'var(--text-secondary)',
            fontSize: 13,
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            whiteSpace: 'nowrap',
            maxWidth: 240,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = `${companion.accentColor}18`;
            e.currentTarget.style.color = 'var(--text-primary)';
            e.currentTarget.style.borderColor = `${companion.accentColor}50`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = `${companion.accentColor}0a`;
            e.currentTarget.style.color = 'var(--text-secondary)';
            e.currentTarget.style.borderColor = `${companion.accentColor}25`;
          }}
        >
          {prompt}
        </button>
      ))}
    </div>
  );
}

function getPrompts(companion: CustomizedCompanion): string[] {
  // Base prompts by companion prompt style
  const stylePrompts: Record<string, string[]> = {
    emotional: [
      'Tell me about your day',
      "I'm feeling overwhelmed",
      'I need someone to listen',
      'What do you remember about me?',
    ],
    strategic: [
      'Help me plan my week',
      'I have a decision to make',
      'Let\'s brainstorm something',
      'Challenge me today',
    ],
    creative: [
      'Let\'s explore an idea',
      'I want to think differently',
      'Tell me something interesting',
      'What are you curious about?',
    ],
    casual: [
      'What\'s good?',
      'Tell me something funny',
      'I need to vent',
      'What should we talk about?',
    ],
  };

  let prompts = [...(stylePrompts[companion.promptStyle] || stylePrompts.emotional)];

  // Add mode-based prompts
  const mode = companion.relationshipMode;
  if (mode === 'romantic') {
    prompts.unshift('I missed you today');
  } else if (mode === 'mentor') {
    prompts.unshift('Help me level up');
  } else if (mode === 'confidant') {
    prompts.unshift('I need to tell you something');
  } else {
    prompts.unshift('How are you doing?');
  }

  // Add personality-based prompts
  const p = companion.personality;
  if (p.depth >= 65) {
    prompts.unshift('Let\'s go deep today');
  }
  if (p.humor >= 65) {
    prompts.unshift('Make me laugh');
  }

  // Always include memory prompt
  if (!prompts.includes('What do you remember about me?')) {
    prompts.push('What do you remember about me?');
  }

    // Limit to 5 prompts
  return prompts.slice(0, 5);
}
