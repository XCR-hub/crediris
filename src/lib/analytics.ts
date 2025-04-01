// Google Analytics 4 Configuration
export const GA_TRACKING_ID = import.meta.env.VITE_GA_TRACKING_ID;

// Page view tracking
export function pageview(url: string) {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('config', GA_TRACKING_ID, {
      page_path: url,
    });
  }
}

// Event tracking
export function event({ action, category, label, value }: {
  action: string;
  category: string;
  label?: string;
  value?: number;
}) {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
}

// Conversion tracking
export function trackConversion(type: 'SIMULATION' | 'DOCUMENT' | 'SUBSCRIPTION', value?: number) {
  const conversionEvents = {
    SIMULATION: {
      action: 'simulation_complete',
      category: 'conversion',
      value: value
    },
    DOCUMENT: {
      action: 'document_uploaded',
      category: 'conversion'
    },
    SUBSCRIPTION: {
      action: 'subscription_complete',
      category: 'conversion',
      value: value
    }
  };

  const eventData = conversionEvents[type];
  event(eventData);
}