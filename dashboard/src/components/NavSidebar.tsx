import { NavLink } from "react-router-dom"
import { useAuthStore } from "../state/authStore"

type IconName =
  | "grid" | "mail" | "ticket" | "globe" | "shield" | "pen" | "map"
  | "chat" | "home" | "compass" | "chart" | "wallet"
  | "settings" | "calendar" | "user" | "photo" | "search" | "help"

type NavItem = { to: string; label: string; icon: IconName }
type NavGroup = { heading: string; items: NavItem[] }

function Icon({ name, className = "h-4 w-4" }: { name: IconName; className?: string }) {
  const paths: Record<IconName, JSX.Element> = {
    grid: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </>
    ),
    mail: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" />
      </>
    ),
    ticket: (
      <>
        <path d="M3 9V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 6v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-6Z" />
        <path d="M13 5v2m0 4v2m0 4v2" />
      </>
    ),
    globe: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18Z" />
      </>
    ),
    shield: <path d="M12 3 4 6v6c0 4.4 3.2 7.7 8 9 4.8-1.3 8-4.6 8-9V6l-8-3Z" />,
    pen: <path d="M17 3a2.8 2.8 0 1 1 4 4L8 20l-5 1 1-5L17 3Z" />,
    map: (
      <>
        <path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z" />
        <path d="M9 4v14m6-12v14" />
      </>
    ),
    chat: <path d="M21 12a8 8 0 0 1-11.6 7.1L4 21l1.9-5.4A8 8 0 1 1 21 12Z" />,
    home: (
      <>
        <path d="m3 10 9-7 9 7v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-9Z" />
        <path d="M9 21v-7h6v7" />
      </>
    ),
    compass: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="m15.5 8.5-2 5-5 2 2-5 5-2Z" />
      </>
    ),
    chart: <path d="M4 20V10m6 10V4m6 16v-7M2 20h20" />,
    wallet: (
      <>
        <rect x="3" y="6" width="18" height="13" rx="2" />
        <path d="M3 10h18M16 15h2" />
      </>
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 13.5a7.6 7.6 0 0 0 0-3l2-1.5-2-3.4-2.4 1a7.6 7.6 0 0 0-2.6-1.5L14 2.5h-4l-.4 2.6a7.6 7.6 0 0 0-2.6 1.5l-2.4-1-2 3.4 2 1.5a7.6 7.6 0 0 0 0 3l-2 1.5 2 3.4 2.4-1a7.6 7.6 0 0 0 2.6 1.5l.4 2.6h4l.4-2.6a7.6 7.6 0 0 0 2.6-1.5l2.4 1 2-3.4-2-1.5Z" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M3 10h18M8 3v4m8-4v4" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </>
    ),
    photo: (
      <>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <circle cx="9" cy="10" r="1.5" />
        <path d="m3 18 5-5 4 4 3-3 6 6" />
      </>
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </>
    ),
    help: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M9.5 9a2.5 2.5 0 1 1 3.6 2.3c-.8.4-1.1 1-1.1 1.7v.5" />
        <path d="M12 17h.01" />
      </>
    ),
  }
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {paths[name]}
    </svg>
  )
}
export default function NavSidebar() {
  const { role } = useAuthStore()
  const base = role ? `/dashboard/${role}` : "/dashboard/login"
  const groups: NavGroup[] =
    role === "super-admin"
      ? [
          {
            heading: "Platform",
            items: [
              { to: `${base}`, label: "Overview", icon: "grid" },
              { to: `${base}/host-applications`, label: "Host Applications", icon: "mail" },
              { to: `${base}/support-tickets`, label: "Support Tickets", icon: "ticket" },
              { to: `${base}/website-content`, label: "Website Content", icon: "globe" },
            ],
          },
          {
            heading: "Areas",
            items: [
              { to: "/dashboard/admin", label: "Admin area", icon: "shield" },
              { to: "/dashboard/content-writer", label: "Content Writer", icon: "pen" },
              { to: "/dashboard/regional-head", label: "Regional Head", icon: "map" },
              { to: "/dashboard/customer-support", label: "Customer Support", icon: "chat" },
              { to: "/dashboard/host", label: "Host", icon: "home" },
              { to: "/dashboard/guide", label: "Guide", icon: "compass" },
            ],
          },
        ]
      : role === "admin"
      ? [
          {
            heading: "Overview",
            items: [{ to: `${base}`, label: "Dashboard", icon: "grid" }],
          },
          {
            heading: "People",
            items: [
              { to: `${base}/hosts`, label: "Hosts", icon: "home" },
              { to: `${base}/guides`, label: "Guides", icon: "compass" },
              { to: `${base}/content`, label: "Content Writer", icon: "pen" },
            ],
          },
          {
            heading: "Business",
            items: [
              { to: `${base}/analytics`, label: "Analytics", icon: "chart" },
              { to: `${base}/revenue`, label: "Revenue & Payouts", icon: "wallet" },
              { to: `${base}/website-content`, label: "Website Content", icon: "globe" },
            ],
          },
          {
            heading: "System",
            items: [{ to: `${base}/settings`, label: "System Settings", icon: "settings" }],
          },
        ]
      : role === "host"
      ? [
          {
            heading: "Overview",
            items: [{ to: `${base}`, label: "Dashboard", icon: "grid" }],
          },
          {
            heading: "Operations",
            items: [
              { to: `${base}/guides`, label: "Guides", icon: "compass" },
              { to: `${base}/tours`, label: "Tours", icon: "map" },
              { to: `${base}/bookings`, label: "Bookings", icon: "calendar" },
            ],
          },
          {
            heading: "Performance",
            items: [
              { to: `${base}/earnings`, label: "Earnings", icon: "wallet" },
              { to: `${base}/performance`, label: "Performance", icon: "chart" },
            ],
          },
        ]
      : role === "guide"
      ? [
          {
            heading: "Overview",
            items: [{ to: `${base}`, label: "Dashboard", icon: "grid" }],
          },
          {
            heading: "My Work",
            items: [
              { to: `${base}/my-tours`, label: "My Tours", icon: "map" },
              { to: `${base}/my-bookings`, label: "My Bookings", icon: "calendar" },
              { to: `${base}/schedule`, label: "Schedule", icon: "calendar" },
            ],
          },
          {
            heading: "Account",
            items: [
              { to: `${base}/earnings`, label: "Earnings", icon: "wallet" },
              { to: `${base}/profile`, label: "Profile", icon: "user" },
            ],
          },
        ]
      : role === "regional-head"
      ? [
          {
            heading: "Overview",
            items: [{ to: `${base}`, label: "Dashboard", icon: "grid" }],
          },
          {
            heading: "Region",
            items: [
              { to: `${base}/applications`, label: "Host Applications", icon: "mail" },
              { to: `${base}/region`, label: "My Region", icon: "map" },
            ],
          },
        ]
      : role === "customer-support"
      ? [
          {
            heading: "Overview",
            items: [{ to: `${base}`, label: "Dashboard", icon: "grid" }],
          },
          {
            heading: "Tickets",
            items: [
              { to: `${base}/tickets`, label: "Support Tickets", icon: "ticket" },
              { to: `${base}/faq`, label: "FAQ & Solutions", icon: "help" },
            ],
          },
        ]
      : role === "content-writer"
      ? [
          {
            heading: "Overview",
            items: [{ to: `${base}`, label: "Dashboard", icon: "grid" }],
          },
          {
            heading: "Content",
            items: [
              { to: `${base}/pages`, label: "Pages", icon: "map" },
              { to: `${base}/blog`, label: "Blog", icon: "pen" },
              { to: `${base}/guides-content`, label: "Guides Content", icon: "compass" },
            ],
          },
          {
            heading: "Library",
            items: [
              { to: `${base}/media`, label: "Media Library", icon: "photo" },
              { to: `${base}/seo`, label: "SEO Management", icon: "search" },
            ],
          },
        ]
      : []

  return (
    <aside className="w-60 shrink-0 bg-white border-r border-gray-200 overflow-y-auto">
      <nav className="p-3 space-y-5">
        {groups.map((group) => (
          <div key={group.heading}>
            <div className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              {group.heading}
            </div>
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                      isActive
                        ? "bg-darkBlue text-white font-medium"
                        : "text-gray-600 hover:bg-gray-100 hover:text-darkBlue"
                    }`
                  }
                  end
                >
                  <Icon name={item.icon} />
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  )
}
