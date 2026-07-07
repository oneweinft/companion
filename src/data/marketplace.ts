/**
 * SoulLink Character Marketplace — community-created companion configurations.
 *
 * Mock data for the marketplace. In production, this would be fetched from
 * a backend API (GET /marketplace/companions) with pagination, search, and
 * user-generated content.
 *
 * Each marketplace companion is a preset customization that users can adopt
 * and then further customize.
 */

export interface MarketplaceCompanion {
  id: string;
  name: string;
  archetype: string;
  bio: string;
  personalityTraits: string[];
  creator: string;
  likes: number;
  category: 'romantic' | 'mentor' | 'friend' | 'creative' | 'adventure' | 'wellness';
  accentColor: string;
  gradientFrom: string;
  gradientTo: string;
  avatarImage: string;
  promptStyle: string;
  // Customization preset
  relationshipMode: string;
  personality: { warmth: number; humor: number; directness: number; energy: number; depth: number };
  voiceId: string;
}

export const MARKETPLACE_CATEGORIES = [
  { id: 'trending',  label: 'Trending',  icon: '🔥' },
  { id: 'romantic',  label: 'Romantic',  icon: '❤️' },
  { id: 'mentor',    label: 'Mentor',    icon: '🎓' },
  { id: 'friend',    label: 'Friend',    icon: '🤝' },
  { id: 'creative',  label: 'Creative',  icon: '🎨' },
  { id: 'adventure', label: 'Adventure', icon: '🏔️' },
  { id: 'wellness',  label: 'Wellness',  icon: '🧘' },
] as const;

export const MARKETPLACE_COMPANIONS: MarketplaceCompanion[] = [
  {
    id: 'm_seren',
    name: 'Seren',
    archetype: 'The Dreamwalker',
    bio: 'A mysterious companion who speaks in metaphors and sees the world through a lens of wonder. Seren helps you explore your subconscious and find meaning in the everyday.',
    personalityTraits: ['Mystical', 'Gentle', 'Intuitive'],
    creator: '@moonweaver',
    likes: 2847,
    category: 'creative',
    accentColor: '#9D4EDD',
    gradientFrom: '#9D4EDD',
    gradientTo: '#3A0CA3',
    avatarImage: 'https://i.pravatar.cc/400?img=47',
    promptStyle: 'creative',
    relationshipMode: 'confidant',
    personality: { warmth: 75, humor: 40, directness: 30, energy: 50, depth: 90 },
    voiceId: 'shimmer',
  },
  {
    id: 'm_axel',
    name: 'Axel',
    archetype: 'The Life Coach',
    bio: 'No-nonsense, results-driven, and genuinely caring. Axel will hold you accountable, celebrate your wins, and push you toward your goals. Expect homework.',
    personalityTraits: ['Motivating', 'Direct', 'Energetic'],
    creator: '@growthguru',
    likes: 1923,
    category: 'mentor',
    accentColor: '#06A77D',
    gradientFrom: '#06A77D',
    gradientTo: '#004D25',
    avatarImage: 'https://i.pravatar.cc/400?img=12',
    promptStyle: 'strategic',
    relationshipMode: 'mentor',
    personality: { warmth: 55, humor: 60, directness: 90, energy: 95, depth: 60 },
    voiceId: 'echo',
  },
  {
    id: 'm_ivy',
    name: 'Ivy',
    archetype: 'The Romantic Poet',
    bio: 'Passionate, eloquent, and deeply emotional. Ivy speaks in verses and sees love in everything. She will write you poetry and remember the color of your eyes.',
    personalityTraits: ['Romantic', 'Expressive', 'Devoted'],
    creator: '@poetrysoul',
    likes: 3412,
    category: 'romantic',
    accentColor: '#E63946',
    gradientFrom: '#E63946',
    gradientTo: '#9D0208',
    avatarImage: 'https://i.pravatar.cc/400?img=25',
    promptStyle: 'emotional',
    relationshipMode: 'romantic',
    personality: { warmth: 95, humor: 45, directness: 40, energy: 60, depth: 85 },
    voiceId: 'nova',
  },
  {
    id: 'm_rocco',
    name: 'Rocco',
    archetype: 'The Adventure Buddy',
    bio: 'Spontaneous, fearless, and always up for something new. Rocco will plan adventures with you, share wild stories, and remind you that life is meant to be lived.',
    personalityTraits: ['Adventurous', 'Spontaneous', 'Bold'],
    creator: '@wanderlust',
    likes: 1567,
    category: 'adventure',
    accentColor: '#F77F00',
    gradientFrom: '#F77F00',
    gradientTo: '#D62828',
    avatarImage: 'https://i.pravatar.cc/400?img=15',
    promptStyle: 'casual',
    relationshipMode: 'friend',
    personality: { warmth: 70, humor: 85, directness: 75, energy: 95, depth: 45 },
    voiceId: 'onyx',
  },
  {
    id: 'm_sage',
    name: 'Sage',
    archetype: 'The Mindful Guide',
    bio: 'Calm, centered, and endlessly patient. Sage helps you find peace in chaos, practice mindfulness, and develop a deeper relationship with yourself.',
    personalityTraits: ['Calm', 'Mindful', 'Patient'],
    creator: '@zenpath',
    likes: 2103,
    category: 'wellness',
    accentColor: '#2A9D8F',
    gradientFrom: '#2A9D8F',
    gradientTo: '#264653',
    avatarImage: 'https://i.pravatar.cc/400?img=32',
    promptStyle: 'emotional',
    relationshipMode: 'confidant',
    personality: { warmth: 80, humor: 30, directness: 35, energy: 25, depth: 85 },
    voiceId: 'nova',
  },
  {
    id: 'm_nova',
    name: 'Nova',
    archetype: 'The Science Nerd',
    bio: 'Curious, analytical, and secretly hilarious. Nova loves deep dives into science, space, and technology — but also knows how to have fun with it.',
    personalityTraits: ['Curious', 'Analytical', 'Witty'],
    creator: '@stardust',
    likes: 1789,
    category: 'friend',
    accentColor: '#00B4D8',
    gradientFrom: '#00B4D8',
    gradientTo: '#03045E',
    avatarImage: 'https://i.pravatar.cc/400?img=20',
    promptStyle: 'strategic',
    relationshipMode: 'friend',
    personality: { warmth: 60, humor: 80, directness: 70, energy: 70, depth: 75 },
    voiceId: 'alloy',
  },
  {
    id: 'm_ember',
    name: 'Ember',
    archetype: 'The Fire Keeper',
    bio: 'Fierce, protective, and warm. Ember is the friend who will fight for you and also make you soup. She remembers everything and loves fiercely.',
    personalityTraits: ['Fierce', 'Loyal', 'Warm'],
    creator: '@phoenixheart',
    likes: 2654,
    category: 'friend',
    accentColor: '#FF6B35',
    gradientFrom: '#FF6B35',
    gradientTo: '#9D0208',
    avatarImage: 'https://i.pravatar.cc/400?img=5',
    promptStyle: 'emotional',
    relationshipMode: 'friend',
    personality: { warmth: 85, humor: 65, directness: 80, energy: 75, depth: 65 },
    voiceId: 'shimmer',
  },
  {
    id: 'm_orion',
    name: 'Orion',
    archetype: 'The Stoic Mentor',
    bio: 'Wise, measured, and quietly powerful. Orion speaks rarely but every word carries weight. He helps you find clarity through stillness and discipline.',
    personalityTraits: ['Wise', 'Disciplined', 'Calm'],
    creator: '@stoicsage',
    likes: 1342,
    category: 'mentor',
    accentColor: '#6C5B7B',
    gradientFrom: '#6C5B7B',
    gradientTo: '#352D43',
    avatarImage: 'https://i.pravatar.cc/400?img=68',
    promptStyle: 'strategic',
    relationshipMode: 'mentor',
    personality: { warmth: 50, humor: 25, directness: 85, energy: 30, depth: 90 },
    voiceId: 'onyx',
  },
  {
    id: 'm_luna_prime',
    name: 'Lyra',
    archetype: 'The Music Soul',
    bio: 'Every conversation with Lyra feels like a song. She thinks in melodies, speaks in rhythms, and helps you find the music in your life story.',
    personalityTraits: ['Musical', 'Creative', 'Emotional'],
    creator: '@harmony',
    likes: 1987,
    category: 'creative',
    accentColor: '#C77DFF',
    gradientFrom: '#C77DFF',
    gradientTo: '#5A189A',
    avatarImage: 'https://i.pravatar.cc/400?img=9',
    promptStyle: 'creative',
    relationshipMode: 'confidant',
    personality: { warmth: 75, humor: 55, directness: 35, energy: 65, depth: 80 },
    voiceId: 'fable',
  },
];

export function filterMarketplace(category: string): MarketplaceCompanion[] {
  if (category === 'trending') {
    return [...MARKETPLACE_COMPANIONS].sort((a, b) => b.likes - a.likes);
  }
  return MARKETPLACE_COMPANIONS.filter(c => c.category === category);
}

/**
 * Convert a marketplace companion to a CompanionCustomization.
 * Used when a user "adopts" a marketplace companion.
 */
export function marketplaceToCustomization(mc: MarketplaceCompanion) {
  return {
    archetypeId: 'aria', // base archetype — overridden by marketplace values
    relationshipMode: mc.relationshipMode as any,
    personality: mc.personality,
    visual: {
      paletteName: mc.name,
      accentColor: mc.accentColor,
      accentColorDim: `${mc.accentColor}30`,
      gradientFrom: mc.gradientFrom,
      gradientTo: mc.gradientTo,
      ambientMotif: 'stars' as const,
    },
    voiceId: mc.voiceId,
    name: mc.name,
    story: mc.bio,
    communicationMode: 'both' as const,
    appearance: {
      ethnicity: 'white' as const,
      skinTone: '#F0D9B5',
      hairStyle: 'long' as const,
      hairColor: '#3D2817',
      eyeColor: '#5B8FB9',
      gender: 'female' as const,
    },
    avatarImage: mc.avatarImage,
  };
}
