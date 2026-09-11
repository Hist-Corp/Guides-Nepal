import { NavLink } from "react-router-dom"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "../hooks/useTheme"
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
  const { theme, toggleTheme } = useTheme()
  const base = role ? `/dashboard/${role}` : "/dashboard/login"
  const groups: NavGroup[] =
    role === "super-admin"
      ? [
          { heading: "Overview", items: [{ to: `${base}`, label: "Dashboard", icon: "grid" }] },
          {
            heading: "Governance",
            items: [
              { to: `${base}/hierarchy`, label: "Role Hierarchy", icon: "shield" },
              { to: `${base}/administration`, label: "Administration", icon: "settings" },
            ],
          },
          {
            heading: "Operations",
            items: [
              { to: `${base}/host-applications`, label: "Host Applications", icon: "mail" },
              { to: `${base}/support-tickets`, label: "Support Tickets", icon: "ticket" },
              { to: `${base}/customers`, label: "Customers", icon: "user" },
            ],
          },
          {
            heading: "Content & Growth",
            items: [
              { to: `${base}/website-content`, label: "Website Content", icon: "globe" },
              { to: `${base}/pages`, label: "Pages", icon: "map" },
              { to: `${base}/blog`, label: "Blog", icon: "pen" },
              { to: `${base}/guides-content`, label: "Guides Content", icon: "compass" },
              { to: `${base}/media`, label: "Media Library", icon: "photo" },
              { to: `${base}/seo`, label: "SEO Settings", icon: "search" },
              { to: `${base}/intelligence`, label: "Intelligence", icon: "chart" },
            ],
          },
        ]
      : role === "admin"
      ? [
          { heading: "Overview", items: [{ to: `${base}`, label: "Dashboard", icon: "grid" }] },
          {
            heading: "Marketplace",
            items: [
              { to: `${base}/hosts`, label: "Hosts", icon: "home" },
              { to: `${base}/guides`, label: "Guides", icon: "compass" },
              { to: `${base}/customers`, label: "Customers", icon: "user" },
            ],
          },
          {
            heading: "Growth",
            items: [
              { to: `${base}/analytics`, label: "Analytics", icon: "chart" },
              { to: `${base}/revenue`, label: "Revenue", icon: "wallet" },
            ],
          },
          {
            heading: "Content & CMS",
            items: [
              { to: `${base}/pages`, label: "Pages", icon: "map" },
              { to: `${base}/blog`, label: "Blog", icon: "pen" },
              { to: `${base}/guides-content`, label: "Guides Content", icon: "compass" },
              { to: `${base}/media`, label: "Media Library", icon: "photo" },
              { to: `${base}/seo`, label: "SEO Settings", icon: "search" },
            ],
          },
          {
            heading: "Platform",
            items: [
              { to: `${base}/content`, label: "Content", icon: "pen" },
              { to: `${base}/website-content`, label: "Website Content", icon: "globe" },
              { to: `${base}/administration`, label: "Administration", icon: "settings" },
              { to: `${base}/settings`, label: "Settings", icon: "settings" },
            ],
          },
        ]
      : role === "host"
      ? [
          { heading: "Overview", items: [{ to: `${base}`, label: "Dashboard", icon: "grid" }] },
          {
            heading: "Business",
            items: [
              { to: `${base}/tours`, label: "Tours", icon: "map" },
              { to: `${base}/bookings`, label: "Bookings", icon: "calendar" },
              { to: `${base}/guides`, label: "My Guides", icon: "compass" },
            ],
          },
          {
            heading: "Money",
            items: [
              { to: `${base}/earnings`, label: "Earnings", icon: "wallet" },
              { to: `${base}/performance`, label: "Performance", icon: "chart" },
              { to: `${base}/customers`, label: "Customers", icon: "user" },
            ],
          },
        ]
      : role === "guide"
      ? [
          { heading: "Overview", items: [{ to: `${base}`, label: "Dashboard", icon: "grid" }] },
          {
            heading: "Work",
            items: [
              { to: `${base}/my-tours`, label: "My Tours", icon: "map" },
              { to: `${base}/my-bookings`, label: "My Bookings", icon: "calendar" },
              { to: `${base}/schedule`, label: "Schedule", icon: "calendar" },
            ],
          },
          {
            heading: "You",
            items: [
              { to: `${base}/earnings`, label: "Earnings", icon: "wallet" },
              { to: `${base}/customers`, label: "Customers", icon: "user" },
              { to: `${base}/profile`, label: "Profile", icon: "user" },
            ],
          },
        ]
      : role === "regional-head"
      ? [
          { heading: "Overview", items: [{ to: `${base}`, label: "Dashboard", icon: "grid" }] },
          {
            heading: "Regional ops",
            items: [
              { to: `${base}/applications`, label: "Applications", icon: "mail" },
              { to: `${base}/region`, label: "My Region", icon: "map" },
              { to: `${base}/customers`, label: "Customers", icon: "user" },
            ],
          },
        ]
      : role === "customer-support"
      ? [
          { heading: "Overview", items: [{ to: `${base}`, label: "Dashboard", icon: "grid" }] },
          {
            heading: "Support",
            items: [
              { to: `${base}/tickets`, label: "Tickets", icon: "ticket" },
              { to: `${base}/customers`, label: "Customers", icon: "user" },
              { to: `${base}/faq`, label: "FAQ Manager", icon: "help" },
            ],
          },
        ]
      : role === "content-writer"
      ? [
          { heading: "Overview", items: [{ to: `${base}`, label: "Dashboard", icon: "grid" }] },
          {
            heading: "Content",
            items: [
              { to: `${base}/website-content`, label: "Website Content", icon: "globe" },
              { to: `${base}/pages`, label: "Pages", icon: "map" },
              { to: `${base}/blog`, label: "Blog", icon: "pen" },
              { to: `${base}/guides-content`, label: "Guides Content", icon: "compass" },
            ],
          },
          {
            heading: "Assets & SEO",
            items: [
              { to: `${base}/media`, label: "Media Library", icon: "photo" },
              { to: `${base}/seo`, label: "SEO Settings", icon: "search" },
            ],
          },
        ]
      : []

  return (
    <aside className="gn-scroll flex w-60 shrink-0 flex-col bg-ink-900 overflow-y-auto">
      <nav className="p-3 space-y-5">
        {groups.map((group) => (
          <div key={group.heading}>
            <div className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              {group.heading}
            </div>
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-all ${
                      isActive
                        ? "bg-brand-500/15 text-brand-300 shadow-[inset_0_0_0_1px_rgba(59,130,246,0.25)]"
                        : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
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

      {/* Theme toggle (light/dark) */}
      <div className="mt-auto border-t border-white/10 pt-3">
        <button
          onClick={toggleTheme}
          className="flex w-full cursor-pointer items-center justify-between rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:bg-white/5"
        >
          <span className="flex items-center gap-2">
            {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
            {theme === "dark" ? "Light mode" : "Dark mode"}
          </span>
          <span aria-hidden>{theme === "dark" ? "☀️" : "🌙"}</span>
        </button>
      </div>
    </aside>
  )
}
