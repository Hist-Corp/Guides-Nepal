import { Navigate, useParams } from 'react-router-dom';
import { findGuideById } from '../../data/guidesData';
import { guideContactPath, guideGalleryPath, guideProfilePath } from '../../utils/guideUrl';

type Section = 'gallery' | 'contact';

/**
 * Keeps old `/local/:id` bookmarks working while every new link uses the
 * canonical slug URL at `/guidesprofile/:slug`.
 */
const LegacyGuideRedirect = ({ section }: { section?: Section }) => {
  const { id } = useParams<{ id: string }>();
  const guideId = Number(id);
  const guide = Number.isInteger(guideId) ? findGuideById(guideId) : undefined;

  if (!guide) {
    return <Navigate to={id ? `/guides/${encodeURIComponent(id)}` : '/'} replace />;
  }

  const target =
    section === 'gallery'
      ? guideGalleryPath(guide)
      : section === 'contact'
        ? guideContactPath(guide)
        : guideProfilePath(guide);

  return <Navigate to={target} replace />;
};

export default LegacyGuideRedirect;
