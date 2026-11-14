import { useEffect } from 'react';
import { GA_MEASUREMENT_ID, GTM_CONTAINER_ID, getCookieConsent } from '../../utils/analytics';

export default function Analytics() {
  useEffect(() => {
    const consent = getCookieConsent();
    if (!consent?.analytics) return;
    if (GTM_CONTAINER_ID && !document.getElementById('gtm-script')) {
      const script = document.createElement('script');
      script.id = 'gtm-script';
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtm.js?id=${GTM_CONTAINER_ID}`;
      document.head.appendChild(script);
    }
    if (GA_MEASUREMENT_ID && !document.getElementById('ga-script')) {
      const script = document.createElement('script');
      script.id = 'ga-script';
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
      document.head.appendChild(script);
      window.dataLayer = window.dataLayer || [];
      window.gtag = function gtag(...args: unknown[]) { window.dataLayer.push(args); };
      window.gtag('js', new Date());
      window.gtag('config', GA_MEASUREMENT_ID, { anonymize_ip: true });
    }
  }, []);
  return null;
}

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}
