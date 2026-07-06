import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { checkSubscriptionStatus, isRevenueCatConfigured } from '../lib/revenuecat';

type SubscriptionLevel = 'free' | 'premium' | 'pro';

interface SubscriptionContextValue {
  level: SubscriptionLevel;
  isSubscribed: boolean;
  loading: boolean;
  isConfigured: boolean;
  refresh: () => Promise<void>;
  setLevel: (level: SubscriptionLevel) => void;
}

const SubscriptionContext = createContext<SubscriptionContextValue | null>(null);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [level, setLevelState] = useState<SubscriptionLevel>('free');
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const status = await checkSubscriptionStatus();
      setLevelState(status as SubscriptionLevel);
    } catch {
      setLevelState('free');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const setLevel = useCallback((newLevel: SubscriptionLevel) => {
    setLevelState(newLevel);
    if (!isRevenueCatConfigured) {
      localStorage.setItem('soullink_subscription', newLevel);
    }
  }, []);

  return (
    <SubscriptionContext.Provider
      value={{
        level,
        isSubscribed: level === 'premium' || level === 'pro',
        loading,
        isConfigured: isRevenueCatConfigured,
        refresh,
        setLevel,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription(): SubscriptionContextValue {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) throw new Error('useSubscription must be used within SubscriptionProvider');
  return ctx;
}
