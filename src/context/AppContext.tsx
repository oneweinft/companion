import { createContext, useContext, useState, type ReactNode } from 'react';
import type { CompanionCustomization, CustomizedCompanion } from '../data/customization';
import { initCustomization, buildEffectiveCompanion } from '../data/customization';

export type Screen =
  | 'welcome'
  | 'characterSelection'
  | 'relationshipMode'
  | 'personalityComposer'
  | 'characterCreator'
  | 'digitalTwinUpload'
  | 'voiceSelection'
  | 'nameStory'
  | 'firstMeeting'
  | 'chat'
  | 'profile';

interface AppContextValue {
  currentScreen: Screen;
  selectedCompanion: CustomizedCompanion | null;
  onboardingComplete: boolean;
  customization: CompanionCustomization | null;
  navigate: (screen: Screen) => void;
  selectCompanion: (id: string) => void;
  updateCustomization: (partial: Partial<CompanionCustomization>) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
}

const STORAGE_KEY = 'soullink_state';

const AppContext = createContext<AppContextValue | null>(null);

interface StoredState {
  customization: CompanionCustomization | null;
  onboardingComplete: boolean;
}

function loadState(): StoredState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredState & { companionId?: string | null; preferences?: unknown };
    // Migrate old format or read new format
    if (parsed.customization) {
      return { customization: parsed.customization, onboardingComplete: parsed.onboardingComplete ?? false };
    }
    return null;
  } catch {
    return null;
  }
}

function saveState(state: StoredState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage might be unavailable
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const stored = loadState();

  const [currentScreen, setCurrentScreen] = useState<Screen>(
    stored?.onboardingComplete && stored?.customization ? 'chat' : 'welcome'
  );
  const [customization, setCustomization] = useState<CompanionCustomization | null>(
    stored?.customization ?? null
  );
  const [selectedCompanion, setSelectedCompanion] = useState<CustomizedCompanion | null>(
    stored?.customization ? buildEffectiveCompanion(stored.customization) : null
  );
  const [onboardingComplete, setOnboardingComplete] = useState<boolean>(
    stored?.onboardingComplete ?? false
  );

  const navigate = (screen: Screen) => {
    setCurrentScreen(screen);
  };

  const selectCompanion = (id: string) => {
    const cust = initCustomization(id);
    setCustomization(cust);
    saveState({ customization: cust, onboardingComplete });
  };

  const updateCustomization = (partial: Partial<CompanionCustomization>) => {
    setCustomization(prev => {
      if (!prev) return prev;
      const next = { ...prev, ...partial };
      saveState({ customization: next, onboardingComplete });
      return next;
    });
  };

  const completeOnboarding = () => {
    if (customization) {
      const effective = buildEffectiveCompanion(customization);
      setSelectedCompanion(effective);
      setOnboardingComplete(true);
      saveState({ customization, onboardingComplete: true });
      setCurrentScreen('chat');
    }
  };

  const resetOnboarding = () => {
    setOnboardingComplete(false);
    setSelectedCompanion(null);
    setCustomization(null);
    saveState({ customization: null, onboardingComplete: false });
    setCurrentScreen('welcome');
  };

  return (
    <AppContext.Provider
      value={{
        currentScreen,
        selectedCompanion,
        onboardingComplete,
        customization,
        navigate,
        selectCompanion,
        updateCustomization,
        completeOnboarding,
        resetOnboarding,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
