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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const DEFAULT_ANALYTICS_ENDPOINT = `${API_BASE_URL}/analytics/events`;

const getSessionId = () => {
  if (typeof window === 'undefined') return 'server';
  const key = 'cosy_analytics_session';
  const existing = window.localStorage.getItem(key);
  if (existing) return existing;
  const generated = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  window.localStorage.setItem(key, generated);
  return generated;
};

const sendToBackend = (payload: Record<string, unknown>) => {
  if (typeof window === 'undefined') return;
  const endpoint = process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT || DEFAULT_ANALYTICS_ENDPOINT;
  const body = JSON.stringify(payload);

  if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
    const blob = new Blob([body], { type: 'application/json' });
    navigator.sendBeacon(endpoint, blob);
    return;
  }

  fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    keepalive: true,
  }).catch(() => null);
};

export const trackEvent = (eventName: EventName, properties?: EventProperties) => {
  // Only track on client side
  if (typeof window === 'undefined') return;

  // Prepare event payload
  const payload = {
    event: eventName,
    timestamp: new Date().toISOString(),
    url: typeof window !== 'undefined' ? window.location.pathname : '',
    sessionId: getSessionId(),
    source: new URLSearchParams(window.location.search).get('source') || 'direct',
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

  // Persist for in-app reporting.
  sendToBackend(payload);
};

// Helper to track funnel step
export const trackFunnelStep = (step: string, source?: string) => {
  trackEvent('landing-page-load', {
    funnel_step: step,
    source: source || 'organic',
  });
};
