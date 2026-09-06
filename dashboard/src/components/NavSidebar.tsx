import { NavLink } from "react-router-dom"
import { useAuthStore } from "../state/authStore"

export default function NavSidebar() {
  const { role } = useAuthStore()
  const base = role ? `/dashboard/${role}` : "/dashboard/login"
  const items =
    role === "admin"
      ? [
          { to: `${base}`, label: "Overview" },
          { to: `${base}/hosts`, label: "Hosts" },
          { to: `${base}/guides`, label: "Guides" },
          { to: `${base}/content`, label: "Content Writer" },
          { to: `${base}/analytics`, label: "Analytics" },
          { to: `${base}/revenue`, label: "Revenue & payouts" },
          { to: `${base}/settings`, label: "System settings" }
        ]
      : role === "host"
      ? [
          { to: `${base}`, label: "Overview" },
          { to: `${base}/guides`, label: "Guides" },
          { to: `${base}/tours`, label: "Tours" },
          { to: `${base}/bookings`, label: "Bookings" },
          { to: `${base}/earnings`, label: "Earnings" },
          { to: `${base}/performance`, label: "Performance" }
        ]
      : role === "guide"
      ? [
          { to: `${base}`, label: "Overview" },
          { to: `${base}/my-tours`, label: "My tours" },
          { to: `${base}/my-bookings`, label: "My bookings" },
          { to: `${base}/schedule`, label: "Schedule" },
          { to: `${base}/earnings`, label: "Earnings" },
          { to: `${base}/profile`, label: "Profile" }
        ]
      : role === "content-writer"
      ? [
          { to: `${base}`, label: "Overview" },
          { to: `${base}/pages`, label: "Pages" },
          { to: `${base}/blog`, label: "Blog" },
          { to: `${base}/guides-content`, label: "Guides Content" },
          { to: `${base}/media`, label: "Media Library" },
          { to: `${base}/seo`, label: "SEO Management" }
        ]
      : []

  return (
    <aside className="w-64 border-r bg-lightBlue/50">
      <nav className="p-3 space-y-1">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `block rounded-lg px-3 py-2 text-sm ${isActive ? "bg-lightBlue text-darkBlue font-semibold" : "hover:bg-lightBlue/70"}`
            }
            end
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
