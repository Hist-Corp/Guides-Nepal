import React from 'react';
import { Navigate, useParams } from 'react-router-dom';
import ExperiencePage from '../../pages/ExperiencePage';
import { getCanonicalExperienceBySlug } from '../../utils/canonicalExperience';

// Numeric IDs were created separately for each city, so they are not globally
// unique. These are the old global URLs that can be identified unambiguously.
const legacyExperiencePaths: Record<string, string> = {
  '1': '/city/bhaktapur/experience/bhaktapur-heritage-walk',
  '401': '/city/bhaktapur/experience/bhaktapur-heritage-walk',
};

const canonicalPathFor = (identifier: string) => {
  if (legacyExperiencePaths[identifier]) return legacyExperiencePaths[identifier];

  return getCanonicalExperienceBySlug(identifier)?.path;
};

/** Redirects legacy global experience URLs to their city-owned detail page. */
const CanonicalExperienceRoute: React.FC = () => {
  const { id = '' } = useParams<{ id: string }>();
  const canonicalPath = canonicalPathFor(id);

  return canonicalPath ? <Navigate to={canonicalPath} replace /> : <ExperiencePage />;
};

export default CanonicalExperienceRoute;
