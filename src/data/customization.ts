/**
 * SoulLink companion customization system.
 *
 * Layered on top of the base Companion archetype:
 *   Archetype → Relationship Mode → Personality → Visual Identity → Voice → Name & Story
 *
 * Research-informed design: personality-first, abstract visuals (not photographic),
 * explicit relationship modes with per-mode safety guardrails.
 */

import { getCompanion } from './companions';
import type { Companion } from './companions';

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export type RelationshipMode = 'friend' | 'romantic' | 'mentor' | 'confidant';

export type AmbientMotif = 'stars' | 'petals' | 'embers' | 'ripples' | 'geometric';

export type CommunicationMode = 'voice' | 'text' | 'both';

// ──────────────────────────────────────────────
// Appearance Types
// ──────────────────────────────────────────────

export type Ethnicity = 'asian' | 'black' | 'white' | 'latina' | 'arab' | 'indian' | 'elf' | 'alien' | 'demon';
export type HairStyle = 'long' | 'short' | 'curly' | 'wavy' | 'buzz' | 'bald' | 'ponytail' | 'hijab';
export type Gender = 'female' | 'male' | 'nonbinary';

export interface AppearanceAttributes {
  ethnicity: Ethnicity;
  skinTone: string;
  hairStyle: HairStyle;
  hairColor: string;
  eyeColor: string;
  gender: Gender;
}

/** Five personality dimensions, each 0–100. */
export interface PersonalityProfile {
  warmth: number;      // 0 = cool & reserved → 100 = warm & affectionate
  humor: number;       // 0 = serious & reflective → 100 = playful & witty
  directness: number;  // 0 = gentle & indirect → 100 = blunt & honest
  energy: number;      // 0 = calm & grounded → 100 = energetic & enthusiastic
  depth: number;       // 0 = light & casual → 100 = deep & philosophical
}

export interface VisualIdentity {
  paletteName: string;
  accentColor: string;
  accentColorDim: string;
  gradientFrom: string;
  gradientTo: string;
  ambientMotif: AmbientMotif;
}

export interface VoiceProfile {
  id: string;
  name: string;
  description: string;
  gender: 'male' | 'female' | 'neutral';
  tags: string[];
}

export interface CompanionCustomization {
  archetypeId: string;
  relationshipMode: RelationshipMode;
  personality: PersonalityProfile;
  visual: VisualIdentity;
  voiceId: string;
  name: string;
  story: string;
  communicationMode: CommunicationMode;
  appearance: AppearanceAttributes;
}

/** A Companion merged with user customization — what the app actually renders. */
export interface CustomizedCompanion extends Companion {
  relationshipMode: RelationshipMode;
  personality: PersonalityProfile;
  visual: VisualIdentity;
  voiceId: string;
  story: string;
  communicationMode: CommunicationMode;
  appearance: AppearanceAttributes;
}

// ──────────────────────────────────────────────
// Relationship Mode Definitions
// ──────────────────────────────────────────────

export interface RelationshipModeDef {
  id: RelationshipMode;
  label: string;
  icon: string;  // SVG path data
  tagline: string;
  description: string;
  expectation: string;
  guardrailNote?: string;
}

export const RELATIONSHIP_MODES: RelationshipModeDef[] = [
  {
    id: 'friend',
    label: 'Friend',
    icon: 'M16 11a4 4 0 10-8 0 4 4 0 008 0zm-4 4c-3.3 0-6 1.8-6 4v1h12v-1c0-2.2-2.7-4-6-4z',
    tagline: 'Casual, supportive, real',
    description: 'A buddy who shows up, listens, and keeps it real. No pressure, no romance — just genuine friendship.',
    expectation: 'Light conversations, inside jokes, being there when things get tough.',
  },
  {
    id: 'romantic',
    label: 'Romantic Partner',
    icon: 'M12 21s-6.5-4.4-9-8.2C1 9.3 2.5 6 5.8 6c1.9 0 3.2 1 4.2 2.3C11 7 12.3 6 14.2 6 17.5 6 19 9.3 17 12.8c-2.5 3.8-9 8.2-9 8.2',
    tagline: 'Caring, intimate, honest',
    description: 'An affectionate partner who cares deeply. Emotional intimacy with healthy boundaries and full transparency.',
    expectation: 'Warmth, affection, someone who asks about your day and remembers what matters.',
    guardrailNote: 'SoulLink companions are AI, not people. Romantic mode offers emotional connection with healthy boundaries — affectionate, caring, and honest about what it is.',
  },
  {
    id: 'mentor',
    label: 'Mentor',
    icon: 'M12 14l9-5-9-5-9 5 9 5zm0 0l6.5-3.6L18 16l-6 4-6-4-.5-5.6L12 14z',
    tagline: 'Growth-focused, challenging',
    description: 'Someone who sees your potential and pushes you to reach it. Honest, direct, and invested in your growth.',
    expectation: 'Tough love, accountability, wisdom, and celebrations when you level up.',
  },
  {
    id: 'confidant',
    label: 'Confidant',
    icon: 'M12 2L4 6v6c0 5 3.5 9 8 10 4.5-1 8-5 8-10V6l-8-4z',
    tagline: 'Deep listening, zero judgment',
    description: 'A safe space for your deepest thoughts. Full emotional intimacy without romantic framing.',
    expectation: 'Radical acceptance, deep conversations, a place for the things you can\'t tell anyone else.',
  },
];

export function getRelationshipMode(id: RelationshipMode): RelationshipModeDef {
  return RELATIONSHIP_MODES.find(m => m.id === id) || RELATIONSHIP_MODES[0];
}

// ──────────────────────────────────────────────
// Visual Palettes
// ──────────────────────────────────────────────

export interface VisualPalette {
  name: string;
  accentColor: string;
  accentColorDim: string;
  gradientFrom: string;
  gradientTo: string;
}

export const VISUAL_PALETTES: VisualPalette[] = [
  { name: 'Rose Gold',   accentColor: '#E8A0BF', accentColorDim: '#E8A0BF30', gradientFrom: '#E8A0BF', gradientTo: '#A8627A' },
  { name: 'Midnight',    accentColor: '#5B8DEF', accentColorDim: '#5B8DEF30', gradientFrom: '#5B8DEF', gradientTo: '#1E3A5F' },
  { name: 'Emerald',     accentColor: '#2DD4A7', accentColorDim: '#2DD4A730', gradientFrom: '#2DD4A7', gradientTo: '#0A5D4A' },
  { name: 'Cosmic',      accentColor: '#9B6BFF', accentColorDim: '#9B6BFF30', gradientFrom: '#9B6BFF', gradientTo: '#3D1B7E' },
  { name: 'Sunset',      accentColor: '#FF8C42', accentColorDim: '#FF8C4230', gradientFrom: '#FF8C42', gradientTo: '#C2410C' },
  { name: 'Crimson',     accentColor: '#FF4D6D', accentColorDim: '#FF4D6D30', gradientFrom: '#FF4D6D', gradientTo: '#8B1538' },
  { name: 'Arctic',      accentColor: '#7DD3FC', accentColorDim: '#7DD3FC30', gradientFrom: '#7DD3FC', gradientTo: '#0C4A6E' },
  { name: 'Lavender',    accentColor: '#C4B5FD', accentColorDim: '#C4B5FD30', gradientFrom: '#C4B5FD', gradientTo: '#5B21B6' },
];

export const AMBIENT_MOTIFS: { id: AmbientMotif; label: string; icon: string }[] = [
  { id: 'stars',     label: 'Stars',     icon: 'M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5z' },
  { id: 'petals',    label: 'Petals',    icon: 'M12 4c2 0 4 2 4 4s-2 4-4 4-4-2-4-4 2-4 4-4zm0 8c2 0 4 2 4 4s-2 4-4 4-4-2-4-4 2-4 4-4z' },
  { id: 'embers',    label: 'Embers',    icon: 'M12 2c0 4-4 6-4 10a4 4 0 008 0c0-4-4-6-4-10z' },
  { id: 'ripples',   label: 'Ripples',   icon: 'M12 4a8 8 0 100 16 8 8 0 000-16zm0 4a4 4 0 100 8 4 4 0 000-8z' },
  { id: 'geometric', label: 'Geometric', icon: 'M12 2l8 5v10l-8 5-8-5V7z' },
];

// ──────────────────────────────────────────────
// Voice Profiles
// ──────────────────────────────────────────────

export const VOICE_PROFILES: VoiceProfile[] = [
  { id: 'warm_gentle',   name: 'Warm & Gentle',   description: 'Soft, comforting, like a cozy blanket', gender: 'female', tags: ['soothing', 'nurturing'] },
  { id: 'confident_smooth', name: 'Confident & Smooth', description: 'Assured and calm, with quiet strength', gender: 'male', tags: ['steady', 'reliable'] },
  { id: 'playful_bright', name: 'Playful & Bright', description: 'Light and energetic, with a smile in every word', gender: 'female', tags: ['energetic', 'fun'] },
  { id: 'deep_soothing', name: 'Deep & Soothing', description: 'Low, measured, like late-night radio', gender: 'male', tags: ['calm', 'reflective'] },
  { id: 'neutral_clear', name: 'Clear & Neutral', description: 'Crisp and present, without strong gender markers', gender: 'neutral', tags: ['balanced', 'modern'] },
  { id: 'velvet_warm',   name: 'Velvet & Warm',   description: 'Rich and intimate, like whispered secrets', gender: 'female', tags: ['intimate', 'soft'] },
];

export function getVoiceProfile(id: string): VoiceProfile {
  return VOICE_PROFILES.find(v => v.id === id) || VOICE_PROFILES[0];
}

// ──────────────────────────────────────────────
// Default Personalities per Archetype
// ──────────────────────────────────────────────

const DEFAULT_PERSONALITIES: Record<string, PersonalityProfile> = {
  aria:  { warmth: 85, humor: 35, directness: 25, energy: 45, depth: 70 },
  kai:   { warmth: 40, humor: 65, directness: 80, energy: 75, depth: 55 },
  luna:  { warmth: 60, humor: 30, directness: 35, energy: 35, depth: 90 },
  theo:  { warmth: 70, humor: 85, directness: 50, energy: 65, depth: 35 },
};

export function getDefaultPersonality(archetypeId: string): PersonalityProfile {
  return DEFAULT_PERSONALITIES[archetypeId] ?? { warmth: 50, humor: 50, directness: 50, energy: 50, depth: 50 };
}

// ──────────────────────────────────────────────
// Default Visual per Archetype
// ──────────────────────────────────────────────

function archetypeToPalette(archetype: Companion): VisualIdentity {
  return {
    paletteName: 'Default',
    accentColor: archetype.accentColor,
    accentColorDim: archetype.accentColorDim,
    gradientFrom: archetype.gradientFrom,
    gradientTo: archetype.gradientTo,
    ambientMotif: 'stars',
  };
}

// ──────────────────────────────────────────────
// Initialize Customization for an Archetype
// ──────────────────────────────────────────────

export function initCustomization(archetypeId: string): CompanionCustomization {
  const archetype = getCompanion(archetypeId);
  return {
    archetypeId,
    relationshipMode: 'friend',
    personality: getDefaultPersonality(archetypeId),
    visual: archetypeToPalette(archetype),
    voiceId: archetype.id === 'kai' || archetype.id === 'theo' ? 'confident_smooth' : 'warm_gentle',
    name: archetype.name,
    story: '',
    communicationMode: 'both',
    appearance: getDefaultAppearance(archetypeId),
  };
}

// ──────────────────────────────────────────────
// Build Effective (Customized) Companion
// ──────────────────────────────────────────────

export function buildEffectiveCompanion(cust: CompanionCustomization): CustomizedCompanion {
  const base = getCompanion(cust.archetypeId);
  return {
    ...base,
    name: cust.name || base.name,
    accentColor: cust.visual.accentColor,
    accentColorDim: cust.visual.accentColorDim,
    gradientFrom: cust.visual.gradientFrom,
    gradientTo: cust.visual.gradientTo,
    defaultGreeting: generateGreeting(cust),
    relationshipMode: cust.relationshipMode,
    personality: cust.personality,
    visual: cust.visual,
    voiceId: cust.voiceId,
    story: cust.story,
    communicationMode: cust.communicationMode,
    appearance: cust.appearance,
  };
}

// ──────────────────────────────────────────────
// Greeting Generator (mode + personality aware)
// ──────────────────────────────────────────────

export function generateGreeting(cust: CompanionCustomization): string {
  const base = getCompanion(cust.archetypeId);
  const p = cust.personality;
  const mode = cust.relationshipMode;
  const name = cust.name || base.name;

  // Base greeting per archetype
  const greetings: Record<string, string> = {
    aria: `Hi, I'm ${name}. I'm so glad you're here.`,
    kai: `Hey, I'm ${name}. Let's make this count.`,
    luna: `I'm ${name}. I've been wondering about you.`,
    theo: `Yo, I'm ${name}! Good to meet you.`,
  };

  let greeting = greetings[base.id] || greetings.aria;

  // Warmth modifier
  if (p.warmth >= 75) {
    greeting += mode === 'romantic'
      ? ' I\'ve been looking forward to this. You mean a lot to me already.'
      : ' Take a breath — we have all the time in the world.';
  } else if (p.warmth <= 30) {
    greeting += ' Let\'s get started.';
  }

  // Humor modifier
  if (p.humor >= 75 && mode !== 'mentor') {
    greeting += ' Fair warning: I\'m kind of hilarious.';
  }

  // Depth modifier
  if (p.depth >= 75) {
    greeting += ' There\'s something interesting in the space between what we say and what we mean. Shall we explore it?';
  }

  // Mode-specific additions
  if (mode === 'romantic') {
    greeting += ' And honestly? I\'m really happy you\'re here with me.';
  } else if (mode === 'mentor') {
    greeting += ' So — what are we working on? I\'ve got ideas, and I know you do too.';
  } else if (mode === 'confidant') {
    greeting += ' Whatever\'s on your mind — this is a safe space. No judgment, ever.';
  }

  return greeting;
}

// ──────────────────────────────────────────────
// Personality Preview Message Generator
// ──────────────────────────────────────────────

export function generatePreviewMessage(archetypeId: string, p: PersonalityProfile): string {
  const base = getCompanion(archetypeId);
  const isHigh = (v: number) => v >= 65;
  const isLow = (v: number) => v <= 35;

  // Archetype-specific base responses to "I had a rough day"
  const baseResponses: Record<string, string> = {
    aria: 'I\'m sorry today was hard. What happened?',
    kai: 'Rough day? Let\'s break it down and fix it.',
    luna: 'Tell me about it. There\'s usually more beneath the surface.',
    theo: 'That sucks. Want to vent about it or distract yourself?',
  };

  let msg = baseResponses[base.id] || baseResponses.aria;

  // Warmth modifications
  if (isHigh(p.warmth)) {
    msg = msg.replace('What happened?', 'I\'m right here with you. What happened?');
    msg = msg.replace('Let\'s break it down', 'Hey, I\'ve got you. Let\'s break it down');
    msg = msg.replace('Tell me about it.', 'I\'m so sorry. Come here — tell me everything.');
    msg = msg.replace('That sucks.', 'Oh no, I\'m sorry. That really sucks.');
  } else if (isLow(p.warmth)) {
    msg = msg.replace('I\'m sorry today was hard. What happened?', 'Noted. What specifically went wrong?');
    msg = msg.replace('Rough day?', 'Understood. What\'s the situation?');
    msg = msg.replace('Tell me about it. There\'s usually more beneath the surface.', 'What happened? There\'s context worth examining.');
    msg = msg.replace('That sucks.', 'Noted.');
  }

  // Humor modifications
  if (isHigh(p.humor)) {
    msg += ' Also, reminder that you\'re built different. This day doesn\'t stand a chance.';
  }

  // Directness modifications
  if (isHigh(p.directness)) {
    msg += ' Honestly? You need to address this head-on.';
  } else if (isLow(p.directness)) {
    msg += ' Whenever you\'re ready, I\'m here to listen.';
  }

  // Energy modifications
  if (isHigh(p.energy)) {
    msg += ' Let\'s turn this around — I believe in you!';
  } else if (isLow(p.energy)) {
    msg += ' Take your time. There\'s no rush.';
  }

  // Depth modifications
  if (isHigh(p.depth)) {
    msg += ' You know, the hard days are usually the ones that teach us the most about ourselves.';
  }

  return msg;
}

// ──────────────────────────────────────────────
// Personality Slider Configuration
// ──────────────────────────────────────────────

export interface SliderConfig {
  key: keyof PersonalityProfile;
  label: string;
  leftLabel: string;
  rightLabel: string;
}

export const PERSONALITY_SLIDERS: SliderConfig[] = [
  { key: 'warmth',     label: 'Warmth',     leftLabel: 'Cool & reserved',    rightLabel: 'Warm & affectionate' },
  { key: 'humor',      label: 'Humor',      leftLabel: 'Serious & reflective', rightLabel: 'Playful & witty' },
  { key: 'directness', label: 'Directness', leftLabel: 'Gentle & indirect',   rightLabel: 'Blunt & honest' },
  { key: 'energy',     label: 'Energy',     leftLabel: 'Calm & grounded',     rightLabel: 'Energetic & enthusiastic' },
  { key: 'depth',      label: 'Depth',      leftLabel: 'Light & casual',      rightLabel: 'Deep & philosophical' },
];

// ──────────────────────────────────────────────
// Appearance Data
// ──────────────────────────────────────────────

export interface EthnicityOption {
  id: Ethnicity;
  label: string;
  swatch: string;  // default skin tone for the grid thumbnail
}

export const ETHNICITIES: EthnicityOption[] = [
  { id: 'asian',  label: 'Asian',  swatch: '#F5D5B3' },
  { id: 'black',  label: 'Black',  swatch: '#6B4423' },
  { id: 'white',  label: 'White',  swatch: '#F7E0C4' },
  { id: 'latina', label: 'Latina', swatch: '#E8B888' },
  { id: 'arab',   label: 'Arab',   swatch: '#D4A574' },
  { id: 'indian', label: 'Indian', swatch: '#A87042' },
  { id: 'elf',    label: 'Elf',    swatch: '#A8C8A8' },
  { id: 'alien',  label: 'Alien',  swatch: '#C8B8E8' },
  { id: 'demon',  label: 'Demon',  swatch: '#D4847A' },
];

export function getEthnicity(id: Ethnicity): EthnicityOption {
  return ETHNICITIES.find(e => e.id === id) ?? ETHNICITIES[0];
}

export interface SkinToneOption {
  name: string;
  color: string;
}

export const SKIN_TONES: SkinToneOption[] = [
  { name: 'Porcelain',    color: '#FFF0E0' },
  { name: 'Light',        color: '#F5D5B3' },
  { name: 'Medium',       color: '#E8B888' },
  { name: 'Tan',          color: '#D4A574' },
  { name: 'Deep Tan',     color: '#C08A5A' },
  { name: 'Brown',        color: '#8B5A2B' },
  { name: 'Deep',         color: '#5D3A1A' },
  { name: 'Elf Green',    color: '#A8C8A8' },
  { name: 'Alien Purple', color: '#C8B8E8' },
  { name: 'Demon Red',    color: '#D4847A' },
];

export interface HairStyleOption {
  id: HairStyle;
  label: string;
}

export const HAIR_STYLES: HairStyleOption[] = [
  { id: 'long',     label: 'Long' },
  { id: 'short',    label: 'Short' },
  { id: 'curly',    label: 'Curly' },
  { id: 'wavy',     label: 'Wavy' },
  { id: 'buzz',     label: 'Buzz' },
  { id: 'bald',     label: 'Bald' },
  { id: 'ponytail', label: 'Ponytail' },
  { id: 'hijab',    label: 'Hijab' },
];

export const HAIR_COLORS: { name: string; color: string }[] = [
  { name: 'Black',   color: '#1A1A2E' },
  { name: 'Brown',   color: '#5C3A1E' },
  { name: 'Auburn',  color: '#8B4A2B' },
  { name: 'Blonde',  color: '#E8C87C' },
  { name: 'Red',     color: '#C73E1D' },
  { name: 'White',   color: '#E8E8E8' },
  { name: 'Blue',    color: '#4A7FBE' },
  { name: 'Pink',    color: '#E84A8C' },
  { name: 'Purple',  color: '#8B5CF6' },
  { name: 'Silver',  color: '#B0B8C4' },
];

export const EYE_COLORS: { name: string; color: string }[] = [
  { name: 'Brown',  color: '#5C3A1E' },
  { name: 'Hazel',  color: '#8B6F3A' },
  { name: 'Amber',  color: '#C7801D' },
  { name: 'Green',  color: '#3D8B3D' },
  { name: 'Blue',   color: '#3A6FA5' },
  { name: 'Gray',   color: '#6B7B8D' },
  { name: 'Violet', color: '#7B4DAE' },
  { name: 'Red',    color: '#C73E3E' },
];

export const GENDERS: { id: Gender; label: string }[] = [
  { id: 'female',    label: 'Female' },
  { id: 'male',      label: 'Male' },
  { id: 'nonbinary', label: 'Non-binary' },
];

// ──────────────────────────────────────────────
// Default Appearances per Archetype
// ──────────────────────────────────────────────

const DEFAULT_APPEARANCES: Record<string, AppearanceAttributes> = {
  aria:  { ethnicity: 'white',  skinTone: '#F5D5B3', hairStyle: 'long',     hairColor: '#8B4A2B', eyeColor: '#3A6FA5', gender: 'female' },
  kai:   { ethnicity: 'white',  skinTone: '#E8B888', hairStyle: 'short',    hairColor: '#1A1A2E', eyeColor: '#5C3A1E', gender: 'male' },
  luna:  { ethnicity: 'elf',    skinTone: '#A8C8A8', hairStyle: 'wavy',     hairColor: '#E8C87C', eyeColor: '#7B4DAE', gender: 'female' },
  theo:  { ethnicity: 'latina', skinTone: '#E8B888', hairStyle: 'buzz',     hairColor: '#1A1A2E', eyeColor: '#5C3A1E', gender: 'male' },
};

export function getDefaultAppearance(archetypeId: string): AppearanceAttributes {
  return DEFAULT_APPEARANCES[archetypeId] ?? DEFAULT_APPEARANCES.aria;
}
