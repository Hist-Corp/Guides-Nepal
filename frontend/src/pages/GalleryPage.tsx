import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useGoBack } from '../utils/backNavigation';
import { Header } from '../components/common/Header';
import { Footer } from '../components/common/Footer';
import { ArrowLeft } from 'lucide-react';
import { ImageLightbox } from '../components/common/ImageLightbox';
import { NEPAL_IMAGES } from '../data/images';
import { findGuideBySlug } from '../utils/guideUrl';

// Extra masonry tiles beyond the guide's own photos, drawn from the verified
// Nepal image pool so the grid feels alive instead of repeating one photo.
const extraGallery: { src: string; alt: string }[] = [
  { src: NEPAL_IMAGES.himalayanPeaks, alt: 'Himalayan peaks above the clouds' },
  { src: NEPAL_IMAGES.temples, alt: 'Nepali temple architecture' },
  { src: NEPAL_IMAGES.phewaLake, alt: 'Phewa Lake, Pokhara' },
  { src: NEPAL_IMAGES.trekking, alt: 'Trekking a mountain trail' },
  { src: NEPAL_IMAGES.oldTown, alt: 'Old town lanes of the Kathmandu Valley' },
  { src: NEPAL_IMAGES.forestHills, alt: 'Forest-covered hills' },
];

const GalleryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const goBack = useGoBack();
  const guide = findGuideBySlug(slug);
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);

  if (!guide || !guide.gallery) return null;

  const sanitizeImageUrl = (u: string): string => {
    try {
      const parsed = new URL(u, window.location.origin);
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return '';
      return encodeURI(parsed.href);
    } catch {
      return '';
    }
  };
  const safeGuideImage = sanitizeImageUrl(guide.image);

  return (
    <div className="min-h-screen flex flex-col font-sans bg-white">
      <Header />

      <main id="main-content" className="flex-grow bg-gray-50/50">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={goBack}
              className="flex items-center gap-2 font-bold text-gray-600 transition-colors hover:text-[#213448] hover:bg-white/20 px-4 py-2 rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Profile
            </button>
            <h1 className="text-3xl font-bold text-gray-900">{guide.name}'s Gallery</h1>
            <p className="text-gray-500 mt-2">A collection of moments and memories</p>
          </div>

          {/* Masonry Grid */}
          <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
            {/* Hero Image First */}
            <div
              className="break-inside-avoid rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group relative cursor-zoom-in"
              onClick={() =>
                setLightbox({ src: safeGuideImage, alt: `${guide.name} profile photo` })
              }
            >
              <img
                src={safeGuideImage}
                alt={`${guide.name} Profile`}
                className="w-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
            </div>

            {/* Gallery Images */}
            {guide.gallery.map((img, index) => {
              const safeImg = sanitizeImageUrl(img);
              return (
                <div
                  key={index}
                  onClick={() =>
                    setLightbox({ src: safeImg, alt: `${guide.name} gallery photo ${index + 1}` })
                  }
                  className="break-inside-avoid rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group relative cursor-zoom-in"
                >
                  <img
                    src={safeImg}
                    alt={`Gallery ${index + 1}`}
                    className="w-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
                </div>
              );
            })}

            {/* Additional photos from the verified Nepal image pool (masonry effect) */}
            {extraGallery.map((photo, i) => (
              <div
                key={`extra-${i}`}
                onClick={() => setLightbox({ src: photo.src, alt: photo.alt })}
                className="break-inside-avoid rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group relative cursor-zoom-in"
              >
                <img
                  src={photo.src}
                  alt={photo.alt}
                  className="w-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
              </div>
            ))}
          </div>
        </div>
      </main>

      {lightbox && (
        <ImageLightbox src={lightbox.src} alt={lightbox.alt} onClose={() => setLightbox(null)} />
      )}

      <Footer />
    </div>
  );
};

export default GalleryPage;
