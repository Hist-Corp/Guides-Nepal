import { Routes, Route, Navigate } from "react-router-dom"
import LoginPage from "./auth/LoginPage"
import DashboardLayout from "./layouts/DashboardLayout"
import AdminLayout from "./layouts/AdminLayout"
import HostLayout from "./layouts/HostLayout"
import RequireAuth from "./guards/RequireAuth"
import RequireRole from "./guards/RequireRole"
import AdminOverview from "./admin/Overview"
import AdminHosts from "./admin/Hosts"
import AdminGuides from "./admin/Guides"
import AdminAnalytics from "./admin/Analytics"
import AdminRevenue from "./admin/Revenue"
import AdminSettings from "./admin/Settings"
import WebsiteContentManager from "./components/WebsiteContentManager"
import AdminContent from "./admin/Content"
import RoleHierarchy from "./admin/RoleHierarchy"
import AdminIntelligence from "./admin/Intelligence"
import PlatformOverview from "./admin/PlatformOverview"
import Customers from "./components/Customers"
import Administration from "./components/Administration"
import HostApplicationsPanel from "./components/HostApplicationsPanel"
import SupportTicketsPanel from "./components/SupportTicketsPanel"
import WriterLayout from "./layouts/WriterLayout"
import WriterOverview from "./writer/Overview"
import WriterPages from "./writer/Pages"
import WriterBlog from "./writer/Blog"
import WriterGuidesContent from "./writer/GuidesContent"
import WriterMedia from "./writer/Media"
import WriterSeo from "./writer/Seo"
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

export default function App() {
  return (
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
          <Route path="blog" element={<WriterBlog />} />
          <Route path="guides-content" element={<WriterGuidesContent />} />
          <Route path="website-content" element={<WebsiteContentManager area="content-manager" />} />
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
        {/* Unknown dashboard URLs fall back to login. */}
        <Route path="*" element={<Navigate to="/dashboard/login" replace />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard/login" replace />} />
    </Routes>
  )
}
