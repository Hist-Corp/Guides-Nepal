import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface ImageLightboxProps {
  src: string;
  alt: string;
  onClose: () => void;
}

/**
 * Fullscreen photo viewer used by the guide profile / portfolio / gallery
 * pages. An image click opens it; the backdrop, the ✕ button or the Escape
 * key closes it. Rendered through a portal so it always sits above the sticky
 * header and floating widgets.
 */
export const ImageLightbox: React.FC<ImageLightboxProps> = ({ src, alt, onClose }) => {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-[100000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out"
      onClick={onClose}
      role="presentation"
    >
      <button
        type="button"
        aria-label="Close image"
        onClick={onClose}
        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 hover:bg-white flex items-center justify-center text-gray-800 transition-colors shadow-lg"
      >
        <X className="w-5 h-5" />
      </button>
      <img
        src={src}
        alt={alt}
        className="max-h-[90vh] max-w-[92vw] rounded-xl object-contain shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />
    </div>,
    document.body
  );
};

export default ImageLightbox;
