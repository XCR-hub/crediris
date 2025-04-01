import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { pageview } from '@/lib/analytics';

export function usePageTracking() {
  const location = useLocation();

  useEffect(() => {
    // Track pageview
    pageview(location.pathname + location.search);

    // Scroll to top on route change
    window.scrollTo(0, 0);
  }, [location]);
}