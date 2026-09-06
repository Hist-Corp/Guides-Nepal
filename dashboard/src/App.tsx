import { Routes, Route, Navigate } from "react-router-dom"
import LoginPage from "./auth/LoginPage"
import DashboardLayout from "./layouts/DashboardLayout"
import AdminLayout from "./layouts/AdminLayout"
import HostLayout from "./layouts/HostLayout"
import GuideLayout from "./layouts/GuideLayout"
import RequireAuth from "./guards/RequireAuth"
import RequireRole from "./guards/RequireRole"
import AdminOverview from "./admin/Overview"
import AdminHosts from "./admin/Hosts"
import AdminGuides from "./admin/Guides"
import AdminAnalytics from "./admin/Analytics"
import AdminRevenue from "./admin/Revenue"
import AdminSettings from "./admin/Settings"
import AdminContent from "./admin/Content"
import WriterLayout from "./layouts/WriterLayout"
import WriterOverview from "./writer/Overview"
import WriterPages from "./writer/Pages"
import WriterBlog from "./writer/Blog"
import WriterGuidesContent from "./writer/GuidesContent"
import WriterMedia from "./writer/Media"
import WriterSeo from "./writer/Seo"
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
          <Route path="content" element={<AdminContent />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="revenue" element={<AdminRevenue />} />
          <Route path="settings" element={<AdminSettings />} />
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
          <Route path="earnings" element={<GuideEarnings />} />
          <Route path="profile" element={<GuideProfile />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard/login" replace />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard/login" replace />} />
    </Routes>
  )
}
