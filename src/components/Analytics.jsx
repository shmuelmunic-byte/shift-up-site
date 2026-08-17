import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

// Fires Meta PageView + GA4 page_view + GTM dataLayer event on every SPA route change.
// Skips the first render because index.html scripts handle the initial load.
export default function Analytics() {
  const location = useLocation();
  const isFirst = useRef(true);

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }

    // Push an SPA pageview into the GTM dataLayer so tags configured in GTM
    // fire on internal route changes (GTM alone only sees the initial load).
    if (Array.isArray(window.dataLayer)) {
      window.dataLayer.push({
        event: 'spa_pageview',
        page_title: document.title,
        page_location: window.location.href,
        page_path: location.pathname,
      });
    }

    if (typeof window.fbq === 'function') {
      window.fbq('track', 'PageView');
    }
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'page_view', {
        page_title: document.title,
        page_location: window.location.href,
        page_path: location.pathname,
      });
    }
  }, [location.pathname]);

  return null;
}
