import { useEffect } from 'react';

const FALLBACK_SRC = '/images/placeholder.svg';

export const GlobalImageFallback = () => {
  useEffect(() => {
    const onError = (e: Event) => {
      const target = e.target as HTMLElement | null;
      if (!target || target.tagName !== 'IMG') return;
      const img = target as HTMLImageElement;
      const applied = img.getAttribute('data-fallback-applied');
      if (applied === 'true') return;
      img.setAttribute('data-fallback-applied', 'true');
      img.src = FALLBACK_SRC;
    };

    window.addEventListener('error', onError, true);
    return () => {
      window.removeEventListener('error', onError, true);
    };
  }, []);

  return null;
};

export default GlobalImageFallback;
