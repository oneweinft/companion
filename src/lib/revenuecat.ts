/**
 * RevenueCat integration for cross-platform in-app purchases.
 *
 * Setup:
 * 1. Create a free account at https://app.revenuecat.com
 * 2. Create a project and add Apple App Store + Google Play credentials
 * 3. Set up subscription products (monthly, yearly) in App Store Connect + Google Play Console
 * 4. Add entitlements and offerings in RevenueCat dashboard
 * 5. Add to .env.local:
 *    VITE_REVENUECAT_API_KEY=your-sdk-key
 *
 * In the native apps, also call Purchases.configure() in the
 * native AppDelegate (iOS) and MainActivity (Android).
 */

export const REVENUECAT_API_KEY = import.meta.env.VITE_REVENUECAT_API_KEY as string | undefined;
export const isRevenueCatConfigured = Boolean(REVENUECAT_API_KEY);

export interface SubscriptionTier {
  id: string;
  name: string;
  price: string;
  period: string;
  features: string[];
  highlight?: boolean;
  packageId?: string; // RevenueCat package identifier
}

export const SUBSCRIPTION_TIERS: SubscriptionTier[] = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: 'forever',
    features: [
      '1 AI companion',
      '20 messages per day',
      'Text chat only',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '$9.99',
    period: 'per month',
    features: [
      'Up to 3 AI companions',
      'Unlimited messages',
      'Voice input & output',
      '6 premium AI voices',
      'Memory & personality customization',
    ],
    highlight: true,
    packageId: 'premium_monthly',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$59.99',
    period: 'per year',
    features: [
      'Everything in Premium',
      'Unlimited companions',
      'Priority AI responses',
      'Custom voice cloning',
      'Advanced relationship modes',
      'Early access to new features',
    ],
    packageId: 'premium_yearly',
  },
];

/**
 * Attempts to purchase a subscription package via RevenueCat.
 * When running in the browser (dev mode), simulates a successful purchase.
 */
export async function purchaseSubscription(packageId: string): Promise<{ success: boolean; error?: string }> {
  if (!isRevenueCatConfigured) {
    // Dev mode simulation
    console.log('[SoulLink] RevenueCat not configured - simulating purchase for', packageId);
    await new Promise(resolve => setTimeout(resolve, 800));
    localStorage.setItem('soullink_subscription', packageId === 'premium_yearly' ? 'pro' : 'premium');
    return { success: true };
  }

  try {
    const { Purchases } = await import('@revenuecat/purchases-capacitor');
    const offerings = await Purchases.getOfferings();
    const aPackage = offerings.current?.availablePackages?.find(p => p.identifier === packageId);

    if (!aPackage) {
      return { success: false, error: 'Package not found. Make sure products are configured in RevenueCat.' };
    }

    const { customerInfo } = await Purchases.purchasePackage({ aPackage });
    const hasEntitlement = customerInfo.entitlements.active['pro'] || customerInfo.entitlements.active['premium'];
    return { success: Boolean(hasEntitlement) };
  } catch (err: any) {
    if (err.userCancelled) {
      return { success: false, error: 'Purchase cancelled' };
    }
    console.error('[SoulLink] Purchase failed:', err);
    return { success: false, error: err.message || 'Purchase failed' };
  }
}

/**
 * Checks the current subscription status via RevenueCat.
 * Returns the entitlement level: 'free', 'premium', or 'pro'.
 */
export async function checkSubscriptionStatus(): Promise<string> {
  if (!isRevenueCatConfigured) {
    // Dev mode: check localStorage
    const stored = localStorage.getItem('soullink_subscription');
    return stored || 'free';
  }

  try {
    const { Purchases } = await import('@revenuecat/purchases-capacitor');
    const { customerInfo } = await Purchases.getCustomerInfo();
    if (customerInfo.entitlements.active['pro']) return 'pro';
    if (customerInfo.entitlements.active['premium']) return 'premium';
    return 'free';
  } catch {
    return 'free';
  }
}

/**
 * Restores previous purchases.
 */
export async function restorePurchases(): Promise<{ success: boolean; error?: string }> {
  if (!isRevenueCatConfigured) {
    return { success: false, error: 'No purchases to restore' };
  }

  try {
    const { Purchases } = await import('@revenuecat/purchases-capacitor');
    const { customerInfo } = await Purchases.restorePurchases();
    const hasEntitlement = customerInfo.entitlements.active['pro'] || customerInfo.entitlements.active['premium'];
    return { success: Boolean(hasEntitlement) };
  } catch (err: any) {
    return { success: false, error: err.message || 'Restore failed' };
  }
}
