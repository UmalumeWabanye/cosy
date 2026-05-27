// Analytics event tracking utility
export type EventName =
  | 'landing-page-load'
  | 'cta-click'
  | 'listing-view'
  | 'compare-click'
  | 'save-search'
  | 'signup-attempt'
  | 'signup-confirm'
  | 'application-submit'
  | 'browse-visit'
  | 'campus-page-view';

export interface EventProperties {
  [key: string]: string | number | boolean | undefined;
}

export const trackEvent = (eventName: EventName, properties?: EventProperties) => {
  // Only track on client side
  if (typeof window === 'undefined') return;

  // Prepare event payload
  const payload = {
    event: eventName,
    timestamp: new Date().toISOString(),
    url: typeof window !== 'undefined' ? window.location.pathname : '',
    ...properties,
  };

  // Google Analytics (if gtag available)
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', eventName, properties || {});
  }

  // Posthog (if ph available)
  if (typeof window !== 'undefined' && (window as any).posthog) {
    (window as any).posthog.capture(eventName, properties || {});
  }

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[analytics] Event:', payload);
  }

  // Optional: Send to custom analytics endpoint
  if (process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT) {
    navigator.sendBeacon(
      process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT,
      JSON.stringify(payload)
    );
  }
};

// Helper to track funnel step
export const trackFunnelStep = (step: string, source?: string) => {
  trackEvent('landing-page-load', {
    funnel_step: step,
    source: source || 'organic',
  });
};
