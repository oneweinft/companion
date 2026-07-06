import { useState } from 'react';
import { useSubscription } from '../context/SubscriptionContext';
import { useAuth } from '../context/AuthContext';
import { SUBSCRIPTION_TIERS, purchaseSubscription, restorePurchases, isRevenueCatConfigured } from '../lib/revenuecat';

export function PaywallScreen() {
  const { setLevel } = useSubscription();
  const { signOut } = useAuth();
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePurchase = async (tierId: string, packageId?: string) => {
        if (tierId === 'free') {
      setLevel('free');
      localStorage.setItem('soullink_paywall_dismissed', 'true');
      return;
    }

    setError(null);
    setPurchasing(tierId);

    const result = await purchaseSubscription(packageId || tierId);
    setPurchasing(null);

    if (result.success) {
      setLevel(tierId as 'premium' | 'pro');
    } else {
      setError(result.error || 'Purchase failed. Please try again.');
    }
  };

  const handleRestore = async () => {
    setError(null);
    setPurchasing('restore');
    const result = await restorePurchases();
    setPurchasing(null);
    if (result.success) {
      setLevel('pro');
    } else {
      setError(result.error || 'No previous purchases found.');
    }
  };

  return (
    <div style={{
      minHeight: '100%',
      display: 'flex',
      flexDirection: 'column',
      padding: 'calc(var(--safe-top) + 20px) 20px calc(var(--safe-bottom) + 20px)',
      background: 'var(--bg-primary)',
      position: 'relative',
    }}>
      <div className="aurora-bg" />
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 28, animation: 'fade-in-up 0.5s ease', position: 'relative', zIndex: 1 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: -0.5, margin: 0, lineHeight: 1.15 }}>
          Choose Your Plan
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-secondary)', marginTop: 8, lineHeight: 1.5 }}>
          Unlock the full SoulLink experience
        </p>
      </div>

      {/* Tiers */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {SUBSCRIPTION_TIERS.map((tier, index) => {
          const isPurchasing = purchasing === tier.id;
          const isFree = tier.id === 'free';

          return (
            <div
              key={tier.id}
              style={{
                background: tier.highlight
                  ? `linear-gradient(135deg, rgba(123, 45, 142, 0.12), rgba(255, 51, 102, 0.06))`
                  : 'var(--surface-1)',
                border: tier.highlight
                  ? `1.5px solid rgba(123, 45, 142, 0.4)`
                  : '1px solid var(--border-subtle)',
                borderRadius: 18, padding: 20, position: 'relative',
                animation: `fade-in-up 0.5s ease ${0.1 + index * 0.1}s both`,
              }}
            >
              {/* Badge */}
              {tier.highlight && (
                <div style={{
                  position: 'absolute', top: -10, right: 20,
                  background: `linear-gradient(135deg, var(--color-base), var(--color-accent))`,
                  color: '#fff', fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                  letterSpacing: 0.5, padding: '4px 12px', borderRadius: 8,
                  boxShadow: '0 2px 8px rgba(123, 45, 142, 0.3)',
                }}>
                  Most Popular
                </div>
              )}

              {/* Name + price */}
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
                <div>
                  <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>{tier.name}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: 26, fontWeight: 700, color: tier.highlight ? 'var(--color-accent)' : 'var(--text-primary)' }}>
                    {tier.price}
                  </span>
                  <span style={{ fontSize: 13, color: 'var(--text-muted)', marginLeft: 4 }}>
                    {tier.period}
                  </span>
                </div>
              </div>

              {/* Features */}
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {tier.features.map((feature, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: 2 }}>
                      <path d="M20 6L9 17l-5-5" stroke={tier.highlight ? 'var(--color-accent)' : 'var(--color-glow)'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <button
                onClick={() => handlePurchase(tier.id, tier.packageId)}
                disabled={isPurchasing}
                                style={{
                  width: '100%', padding: '13px', borderRadius: 12, cursor: isPurchasing ? 'wait' : 'pointer',
                  fontSize: 15, fontWeight: 600, transition: 'all 0.2s ease',
                  background: isFree
                    ? 'transparent'
                    : tier.highlight
                      ? `linear-gradient(135deg, var(--color-base), var(--color-accent))`
                      : 'var(--bg-tertiary)',
                  color: isFree ? 'var(--text-secondary)' : '#fff',
                  border: isFree ? '1px solid var(--border-subtle)' : 'none',
                  opacity: isPurchasing ? 0.7 : 1,
                  boxShadow: !isFree && tier.highlight ? '0 4px 16px rgba(123, 45, 142, 0.3)' : 'none',
                }}
              >
                {isPurchasing ? 'Processing...' : isFree ? 'Continue Free' : `Get ${tier.name}`}
              </button>
            </div>
          );
        })}
      </div>

      {/* Error */}
      {error && (
        <div style={{
          marginTop: 14, fontSize: 13, color: '#FF6B6B', padding: '10px 14px',
          background: 'rgba(255, 107, 107, 0.1)', borderRadius: 10, textAlign: 'center',
        }}>
          {error}
        </div>
      )}

      {/* Footer actions */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 20 }}>
        <button
          onClick={handleRestore}
          disabled={purchasing === 'restore'}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 13, color: 'var(--text-muted)', padding: '8px',
          }}
        >
          {purchasing === 'restore' ? 'Restoring...' : 'Restore Purchases'}
        </button>
        <button
          onClick={signOut}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 13, color: 'var(--text-muted)', padding: '8px',
          }}
        >
          Sign Out
        </button>
      </div>

      {/* Config note */}
      {!isRevenueCatConfigured && (
        <div style={{
          marginTop: 12, fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.6,
        }}>
          Demo Mode: Purchases are simulated. Set <code style={{ color: 'var(--text-primary)' }}>VITE_REVENUECAT_API_KEY</code> in .env.local for real IAP.
        </div>
      )}

      <p style={{ marginTop: 14, fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.5 }}>
        Subscription automatically renews unless cancelled. Manage in your app store settings.
      </p>
    </div>
  );
}
