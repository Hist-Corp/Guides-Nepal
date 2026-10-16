import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './auth/LoginPage';
import DashboardLayout from './layouts/DashboardLayout';
import AdminLayout from './layouts/AdminLayout';
import HostLayout from './layouts/HostLayout';
import RequireAuth from './guards/RequireAuth';
import RequireRole from './guards/RequireRole';
import WriterLayout from './layouts/WriterLayout';
import Loading from './components/Loading';

// Route components are code-split with React.lazy so the initial login bundle
// stays small (e.g. recharts is only pulled in by the analytics pages) and a
// failure inside one lazily-loaded page is isolated to that chunk instead of
// breaking the whole app at startup. Layouts/guards stay eager because they
// form the shell rendered on every authenticated navigation.
const AdminOverview = lazy(() => import('./admin/Overview'));
const AdminHosts = lazy(() => import('./admin/Hosts'));
const AdminGuides = lazy(() => import('./admin/Guides'));
const AdminAnalytics = lazy(() => import('./admin/Analytics'));
const AdminRevenue = lazy(() => import('./admin/Revenue'));
const AdminSettings = lazy(() => import('./admin/Settings'));
const WebsiteContentManager = lazy(() => import('./components/WebsiteContentManager'));
const AdminContent = lazy(() => import('./admin/Content'));
const RoleHierarchy = lazy(() => import('./admin/RoleHierarchy'));
const AdminIntelligence = lazy(() => import('./admin/Intelligence'));
const PlatformOverview = lazy(() => import('./admin/PlatformOverview'));
const Customers = lazy(() => import('./components/Customers'));
const Administration = lazy(() => import('./components/Administration'));
const HostApplicationsPanel = lazy(() => import('./components/HostApplicationsPanel'));
const GuideApplicationsPanel = lazy(() => import('./components/GuideApplicationsPanel'));
const SupportTicketsPanel = lazy(() => import('./components/SupportTicketsPanel'));
const WriterOverview = lazy(() => import('./writer/Overview'));
const WriterPages = lazy(() => import('./writer/Pages'));
const WriterBlog = lazy(() => import('./writer/Blog'));
const WriterGuidesContent = lazy(() => import('./writer/GuidesContent'));
const WriterMedia = lazy(() => import('./writer/Media'));
const WriterSeo = lazy(() => import('./writer/Seo'));
const WriterExperienceReview = lazy(() => import('./writer/ExperienceReview'));
const RegionalHeadOverview = lazy(() => import('./regionalhead/Overview'));
const RegionalApplications = lazy(() => import('./regionalhead/Applications'));
const RegionalInfo = lazy(() => import('./regionalhead/Region'));
const RegionalExperienceReview = lazy(() => import('./regionalhead/ExperienceReview'));
const SupportOverview = lazy(() => import('./support/Overview'));
const SupportTickets = lazy(() => import('./support/Tickets'));
const SupportFaq = lazy(() => import('./support/Faq'));
const HostOverview = lazy(() => import('./host/Overview'));
const HostGuides = lazy(() => import('./host/Guides'));
const HostTours = lazy(() => import('./host/Tours'));
const HostExperiences = lazy(() => import('./host/Experiences'));
const HostBookings = lazy(() => import('./host/Bookings'));
const HostEarnings = lazy(() => import('./host/Earnings'));
const HostPerformance = lazy(() => import('./host/Performance'));

export default function App() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loading label="Loading page…" />
        </div>
      }
    >
      <Routes>
        {/* Root always lands on the dashboard login — the dashboard app ships no public pages. */}
        <Route path="/" element={<Navigate to="/dashboard/login" replace />} />
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Navigate to="/dashboard/login" replace />} />
          <Route path="login" element={<LoginPage />} />
          <Route
            path="admin/*"
            element={
              <RequireAuth>
                <RequireRole role="admin">
                  <AdminLayout />
                </RequireRole>
              </RequireAuth>
            }
          >
            <Route index element={<AdminOverview />} />
            <Route path="platform" element={<PlatformOverview />} />
            <Route path="hosts" element={<AdminHosts />} />
            <Route path="guides" element={<AdminGuides />} />
            <Route path="host-applications" element={<HostApplicationsPanel />} />
            <Route path="guide-applications" element={<GuideApplicationsPanel />} />
            <Route path="support-tickets" element={<SupportTicketsPanel />} />
            <Route path="hierarchy" element={<RoleHierarchy />} />
            <Route path="intelligence" element={<AdminIntelligence />} />
            <Route path="customers" element={<Customers />} />
            <Route path="content" element={<AdminContent />} />
            <Route path="pages" element={<WriterPages />} />
            <Route path="blog" element={<WriterBlog />} />
            <Route path="guides-content" element={<WriterGuidesContent />} />
            <Route path="media" element={<WriterMedia />} />
            <Route path="seo" element={<WriterSeo />} />
            <Route path="administration" element={<Administration />} />
            <Route path="website-content" element={<WebsiteContentManager area="admin" />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="revenue" element={<AdminRevenue />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
          <Route
            path="regional-head/*"
            element={
              <RequireAuth>
                <RequireRole role="regional-head">
                  <AdminLayout />
                </RequireRole>
              </RequireAuth>
            }
          >
            <Route index element={<RegionalHeadOverview />} />
            <Route path="applications" element={<RegionalApplications />} />
            <Route path="experiences" element={<RegionalExperienceReview />} />
            <Route path="region" element={<RegionalInfo />} />
            <Route
              path="customers"
              element={
                <Customers
                  title="Customers"
                  description="Travelers and bookings within your region."
                />
              }
            />
          </Route>
          <Route
            path="customer-support/*"
            element={
              <RequireAuth>
                <RequireRole role="customer-support">
                  <AdminLayout />
                </RequireRole>
              </RequireAuth>
            }
          >
            <Route index element={<SupportOverview />} />
            <Route path="tickets" element={<SupportTickets />} />
            <Route path="faq" element={<SupportFaq />} />
            <Route
              path="customers"
              element={
                <Customers
                  title="Customers"
                  description="Travelers you have helped or can assist."
                />
              }
            />
          </Route>
          <Route
            path="content-manager/*"
            element={
              <RequireAuth>
                <RequireRole role="content-manager">
                  <WriterLayout />
                </RequireRole>
              </RequireAuth>
            }
          >
            <Route index element={<WriterOverview />} />
            <Route path="pages" element={<WriterPages />} />
            <Route path="experiences" element={<WriterExperienceReview />} />
            <Route path="blog" element={<WriterBlog />} />
            <Route path="guides-content" element={<WriterGuidesContent />} />
            <Route
              path="website-content"
              element={<WebsiteContentManager area="content-manager" />}
            />
            <Route path="media" element={<WriterMedia />} />
            <Route path="seo" element={<WriterSeo />} />
          </Route>
          <Route
            path="host/*"
            element={
              <RequireAuth>
                <RequireRole role="host">
                  <HostLayout />
                </RequireRole>
              </RequireAuth>
            }
          >
            <Route index element={<HostOverview />} />
            <Route path="guides" element={<HostGuides />} />
            <Route path="tours" element={<HostTours />} />
            <Route path="experiences" element={<HostExperiences />} />
            <Route path="bookings" element={<HostBookings />} />
            <Route
              path="customers"
              element={
                <Customers
                  title="My Customers"
                  description="Travelers who booked your experiences."
                />
              }
            />
            <Route path="earnings" element={<HostEarnings />} />
            <Route path="performance" element={<HostPerformance />} />
          </Route>
          {/* Unknown dashboard URLs fall back to login. */}
          <Route path="*" element={<Navigate to="/dashboard/login" replace />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard/login" replace />} />
      </Routes>
    </Suspense>
  );
}
