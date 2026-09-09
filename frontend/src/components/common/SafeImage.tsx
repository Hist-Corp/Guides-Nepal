import { useState, useEffect } from 'react';
import { NEPAL_IMAGES } from '../../data/images';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  fallbackSrc?: string;
}

// Image with graceful fallback: if the remote URL fails (offline, 404,
// hotlink blocked) fall back to the local Nepal placeholder SVG.
export const SafeImage: React.FC<SafeImageProps> = ({ src, fallbackSrc = NEPAL_IMAGES.placeholder, alt = '', onError, ...rest }) => {
  const [current, setCurrent] = useState(src);
  useEffect(() => {
    setCurrent(src);
  }, [src]);
  return (
    <img
      src={current}
      alt={alt}
      loading="lazy"
      onError={(e) => {
        if (current !== fallbackSrc) {
          setCurrent(fallbackSrc);
        }
        onError?.(e);
      }}
      {...rest}
    />
  );
};

export default SafeImage;
