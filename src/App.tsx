import { AuthProvider, useAuth } from './context/AuthContext';
import { SubscriptionProvider, useSubscription } from './context/SubscriptionContext';
import { AppProvider, useApp } from './context/AppContext';
import { LoginScreen } from './screens/LoginScreen';
import { PaywallScreen } from './screens/PaywallScreen';
import { WelcomeScreen } from './screens/WelcomeScreen';
import { CharacterSelection } from './screens/CharacterSelection';
import { RelationshipMode } from './screens/RelationshipMode';
import { PersonalityComposer } from './screens/PersonalityComposer';
import { CharacterCreator } from './screens/CharacterCreator';
import { VoiceSelection } from './screens/VoiceSelection';
import { NameStory } from './screens/NameStory';
import { FirstMeeting } from './screens/FirstMeeting';
import { MainChat } from './screens/MainChat';
import { CompanionProfile } from './screens/CompanionProfile';

function ScreenRouter() {
  const { currentScreen } = useApp();

  switch (currentScreen) {
    case 'welcome':
      return <WelcomeScreen />;
    case 'characterSelection':
      return <CharacterSelection />;
    case 'relationshipMode':
      return <RelationshipMode />;
    case 'personalityComposer':
      return <PersonalityComposer />;
    case 'characterCreator':
      return <CharacterCreator />;
    case 'voiceSelection':
      return <VoiceSelection />;
    case 'nameStory':
      return <NameStory />;
    case 'firstMeeting':
      return <FirstMeeting />;
    case 'chat':
      return <MainChat />;
    case 'profile':
      return <CompanionProfile />;
    default:
      return <WelcomeScreen />;
  }
}

/** Gate 1: Auth — shows LoginScreen if not authenticated */
function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading, isGuest } = useAuth();

  if (loading) {
    return (
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid var(--glass-border)', borderTopColor: 'var(--color-accent)', animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
  }

  // Allow through if logged in OR in guest mode
  if (!user && !isGuest) {
    return <LoginScreen />;
  }

  return <>{children}</>;
}

/** Gate 2: Subscription — shows PaywallScreen if not subscribed (skips for guests) */
function SubscriptionGate({ children }: { children: React.ReactNode }) {
  const { isGuest } = useAuth();
  const { isSubscribed, loading } = useSubscription();

  // Guests and subscribed users get through
  // Non-subscribed users see the paywall (but can skip with "Continue Free")
  if (loading) {
    return (
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid var(--glass-border)', borderTopColor: 'var(--color-accent)', animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
  }

  // If user chose free tier, they've already dismissed the paywall
  // isSubscribed will be false for free, but we store their choice
  if (!isSubscribed) {
    // Check if user already dismissed paywall (chose free)
    const dismissed = localStorage.getItem('soullink_paywall_dismissed');
    if (!dismissed && !isGuest) {
      return <PaywallScreen />;
    }
  }

  return <>{children}</>;
}

function App() {
  return (
    <AuthProvider>
      <AuthGate>
        <SubscriptionProvider>
          <SubscriptionGate>
            <AppProvider>
              <div style={{ height: '100%', animation: 'screen-enter 0.4s ease' }}>
                <ScreenRouter />
              </div>
            </AppProvider>
          </SubscriptionGate>
        </SubscriptionProvider>
      </AuthGate>
    </AuthProvider>
  );
}

export default App;
