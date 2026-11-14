import { Outlet } from "react-router-dom"
import Topbar from "../components/Topbar"
import NavSidebar from "../components/NavSidebar"

export default function HostLayout() {
  return (
    <div className="dash-backdrop h-screen flex flex-col">
      <Topbar />
      <div className="relative flex flex-1 overflow-hidden">
        <NavSidebar />
        <main className="gn-scroll-light relative flex-1 overflow-y-auto p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
