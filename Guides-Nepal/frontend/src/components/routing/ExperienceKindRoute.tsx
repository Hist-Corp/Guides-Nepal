import React from 'react';
import { Navigate, useParams } from 'react-router-dom';
import {
  getExperienceCity,
  getExperienceKind,
  type ExperienceKind,
} from '../../utils/canonicalExperience';
import KathmanduExperiencePage from '../../pages/kathmandu/KathmanduExperiencePage';
import PokharaExperiencePage from '../../pages/pokhara/PokharaExperiencePage';
import LalitpurExperiencePage from '../../pages/lalitpur/LalitpurExperiencePage';
import BhaktapurExperiencePage from '../../pages/bhaktapur/BhaktapurExperiencePage';
import BharatpurExperiencePage from '../../pages/bharatpur/BharatpurExperiencePage';
import ExperiencePage from '../../pages/ExperiencePage';

const cityExperiencePages: Record<string, React.FC> = {
  kathmandu: KathmanduExperiencePage,
  pokhara: PokharaExperiencePage,
  lalitpur: LalitpurExperiencePage,
  bhaktapur: BhaktapurExperiencePage,
  bharatpur: BharatpurExperiencePage,
};

/**
 * Detail route behind the kind-based URLs /trek/:slug and /hike/:slug.
 * Renders the same city experience page the slug always used, so the booking
 * workflow is unchanged; a wrong-kind URL (/trek/<hike-slug>) normalizes to
 * the correct one, and slugs outside the city catalogs fall back to the
 * legacy global experience page (e.g. shivapuri-day-hike).
 */
export const ExperienceKindRoute: React.FC<{ kind: ExperienceKind }> = ({ kind }) => {
  const { slug = '' } = useParams<{ slug: string }>();
  const detected = getExperienceKind(slug);
  if (detected && detected !== kind) return <Navigate to={`/${detected}/${slug}`} replace />;

  const Page = cityExperiencePages[getExperienceCity(slug) ?? ''];
  if (!Page) return <ExperiencePage />;
  return <Page />;
};

/**
 * Wrapper for the legacy /city/:city/experience/:slug routes: trek & hike
 * slugs redirect to their canonical /trek/... or /hike/... URL so old links
 * (bookmarks, saved searches, external refs) stay valid, while every other
 * experience renders exactly as before.
 */
export const CityExperienceRoute: React.FC<{ Page: React.FC }> = ({ Page }) => {
  const { slug = '' } = useParams<{ slug: string }>();
  const kind = getExperienceKind(slug);
  return kind ? <Navigate to={`/${kind}/${slug}`} replace /> : <Page />;
};

export default ExperienceKindRoute;
