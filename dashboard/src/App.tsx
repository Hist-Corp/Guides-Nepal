import { Routes, Route, Navigate } from "react-router-dom"
import LoginPage from "./auth/LoginPage"
import DashboardLayout from "./layouts/DashboardLayout"
import AdminLayout from "./layouts/AdminLayout"
import HostLayout from "./layouts/HostLayout"
import GuideLayout from "./layouts/GuideLayout"
import RequireAuth from "./guards/RequireAuth"
import RequireRole from "./guards/RequireRole"
import PublicLayout from "./public/components/PublicLayout"
import PublicHome from "./public/Home"
import PublicExplore from "./public/Explore"
import PublicSearch from "./public/Search"
import CategoryPage from "./public/CategoryPage"
import ExperienceDetail from "./public/ExperienceDetail"
import CityPage from "./public/CityPage"
import CityExperiences from "./public/CityExperiences"
import LocalProfile from "./public/LocalProfile"
import NotFound from "./public/NotFound"
import Support from "./public/Support"
import AdminOverview from "./admin/Overview"
import AdminHosts from "./admin/Hosts"
import AdminGuides from "./admin/Guides"
import AdminAnalytics from "./admin/Analytics"
import AdminRevenue from "./admin/Revenue"
import AdminSettings from "./admin/Settings"
import WebsiteContentManager from "./components/WebsiteContentManager"
import AdminContent from "./admin/Content"
import RoleHierarchy from "./superadmin/RoleHierarchy"
import Customers from "./components/Customers"
import Administration from "./components/Administration"
import SuperAdminIntelligence from "./superadmin/Intelligence"
import WriterLayout from "./layouts/WriterLayout"
import WriterOverview from "./writer/Overview"
import WriterPages from "./writer/Pages"
import WriterBlog from "./writer/Blog"
import WriterGuidesContent from "./writer/GuidesContent"
import WriterMedia from "./writer/Media"
import WriterSeo from "./writer/Seo"
import SuperAdminOverview from "./superadmin/Overview"
import SuperAdminHostApplications from "./superadmin/HostApplications"
import SuperAdminSupportTickets from "./superadmin/SupportTickets"
import RegionalHeadOverview from "./regionalhead/Overview"
import RegionalApplications from "./regionalhead/Applications"
import RegionalInfo from "./regionalhead/Region"
import SupportOverview from "./support/Overview"
import SupportTickets from "./support/Tickets"
import SupportFaq from "./support/Faq"
import HostOverview from "./host/Overview"
import HostGuides from "./host/Guides"
import HostTours from "./host/Tours"
import HostBookings from "./host/Bookings"
import HostEarnings from "./host/Earnings"
import HostPerformance from "./host/Performance"
import GuideOverview from "./guide/Overview"
import GuideMyTours from "./guide/MyTours"
import GuideMyBookings from "./guide/MyBookings"
import GuideSchedule from "./guide/Schedule"
import GuideEarnings from "./guide/Earnings"
import GuideProfile from "./guide/Profile"

export default function App() {
  return (
    <Routes>
      {/* Public traveler-facing site */}
      <Route path="/" element={<PublicLayout />}>
        <Route index element={<PublicHome />} />
        <Route path="explore" element={<PublicExplore />} />
        <Route path="search" element={<PublicSearch />} />
        <Route path="most-popular" element={<CategoryPage slugKey="most-popular" />} />
        <Route path="most-delicious" element={<CategoryPage slugKey="most-delicious" />} />
        <Route path="real-good-travel" element={<CategoryPage slugKey="real-good-travel" />} />
        <Route path="food-tours" element={<CategoryPage slugKey="food-tours" />} />
        <Route path="food-tours/culture/:slug" element={<ExperienceDetail />} />
        <Route path="cultural-tours" element={<CategoryPage slugKey="cultural-tours" />} />
        <Route path="outdoor-activities" element={<CategoryPage slugKey="outdoor-activities" />} />
        <Route path="cooking-classes" element={<CategoryPage slugKey="cooking-classes" />} />
        <Route path="experience/:id" element={<ExperienceDetail />} />
        <Route path="experience/seo/:slug" element={<ExperienceDetail />} />
        <Route path="city/:cityId" element={<CityPage />} />
        <Route path="city/:cityId/experiences" element={<CityExperiences />} />
        <Route path="city/:cityId/experience/:slug" element={<ExperienceDetail />} />
        <Route path="local/:id" element={<LocalProfile />} />
        <Route path="*" element={<NotFound />} />
      </Route>
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
          <Route path="hosts" element={<AdminHosts />} />
          <Route path="guides" element={<AdminGuides />} />
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
          path="super-admin/*"
          element={
            <RequireAuth>
              <RequireRole role="super-admin">
                <AdminLayout />
              </RequireRole>
            </RequireAuth>
          }
        >
          <Route index element={<SuperAdminOverview />} />
          <Route path="host-applications" element={<SuperAdminHostApplications />} />
          <Route path="support-tickets" element={<SuperAdminSupportTickets />} />
          <Route path="hierarchy" element={<RoleHierarchy />} />
          <Route path="administration" element={<Administration />} />
          <Route path="customers" element={<Customers />} />
          <Route path="website-content" element={<WebsiteContentManager area="super-admin" />} />
          <Route path="intelligence" element={<SuperAdminIntelligence />} />
          <Route path="pages" element={<WriterPages />} />
          <Route path="blog" element={<WriterBlog />} />
          <Route path="guides-content" element={<WriterGuidesContent />} />
          <Route path="media" element={<WriterMedia />} />
          <Route path="seo" element={<WriterSeo />} />
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
          <Route path="region" element={<RegionalInfo />} />
          <Route path="customers" element={<Customers title="Customers" description="Travelers and bookings within your region." />} />
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
          <Route path="customers" element={<Customers title="Customers" description="Travelers you have helped or can assist." />} />
        </Route>
        <Route
          path="content-writer/*"
          element={
            <RequireAuth>
              <RequireRole role="content-writer">
                <WriterLayout />
              </RequireRole>
            </RequireAuth>
          }
        >
          <Route index element={<WriterOverview />} />
          <Route path="pages" element={<WriterPages />} />
          <Route path="blog" element={<WriterBlog />} />
          <Route path="guides-content" element={<WriterGuidesContent />} />
          <Route path="website-content" element={<WebsiteContentManager area="content-writer" />} />
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
          <Route path="bookings" element={<HostBookings />} />
          <Route path="customers" element={<Customers title="My Customers" description="Travelers who booked your experiences." />} />
          <Route path="earnings" element={<HostEarnings />} />
          <Route path="performance" element={<HostPerformance />} />
        </Route>
        <Route
          path="guide/*"
          element={
            <RequireAuth>
              <RequireRole role="guide">
                <GuideLayout />
              </RequireRole>
            </RequireAuth>
          }
        >
          <Route index element={<GuideOverview />} />
          <Route path="my-tours" element={<GuideMyTours />} />
          <Route path="my-bookings" element={<GuideMyBookings />} />
          <Route path="schedule" element={<GuideSchedule />} />
          <Route path="customers" element={<Customers title="My Customers" description="Travelers you have guided or can help." />} />
          <Route path="earnings" element={<GuideEarnings />} />
          <Route path="profile" element={<GuideProfile />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
