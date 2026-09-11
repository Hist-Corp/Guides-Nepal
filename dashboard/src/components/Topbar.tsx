import { useAuthStore } from "../state/authStore"
import { useNavigate, Link } from "react-router-dom"
import { useState } from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "../hooks/useTheme"
import HelpFaqModal from "./HelpFaqModal"

export default function Topbar() {
  const navigate = useNavigate()
  const { role, user, reset } = useAuthStore()
  const { theme, toggleTheme } = useTheme()
  const [helpOpen, setHelpOpen] = useState(false)
  function logout() {
    reset()
    navigate("/dashboard/login", { replace: true })
  }
  const areaLabel = role
    ? role.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
    : ""
  const initials = user
    ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase() || "U"
    : "?"

  return (
    <header className="gn-topbar sticky top-0 z-20 h-16 border-b border-line flex items-center px-5 justify-between shrink-0">
      <div className="flex items-center gap-3">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg text-main">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-brand-600 text-sm text-white shadow-btn-blue">
            ग
          </span>
          Guides Nepal
        </Link>
        <span className="h-5 w-px bg-gray-200" aria-hidden />
        <span className="rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-brand-700 ring-1 ring-inset ring-brand-200 dark:bg-brand-600/20 dark:text-brand-300 dark:ring-brand-500/40">
          {areaLabel || "Console"}
        </span>
      </div>

      <div className="hidden lg:block relative w-80">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-soft"
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"
        >
          <circle cx="11" cy="11" r="7" strokeLinecap="round" />
          <path d="m20 20-3.5-3.5" strokeLinecap="round" />
        </svg>
        <input
          className="w-full rounded-full border border-line bg-surface-2 pl-9 pr-3 py-2 text-sm text-main placeholder:text-soft outline-none transition focus:border-brand-500 focus:bg-surface focus:ring-4 focus:ring-brand-600/10"
          placeholder="Search…"
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => setHelpOpen(true)}
          className="hidden cursor-pointer items-center rounded-full px-3 py-1.5 text-xs font-semibold text-soft transition hover:bg-surface-3 hover:text-main sm:block"
        >
          Help &amp; FAQ
        </button>
        <button
          onClick={toggleTheme}
          title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          className="cursor-pointer rounded-lg p-2 text-soft transition hover:bg-surface-3 hover:text-main"
        >
          {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
        <div className="hidden sm:flex items-center gap-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-blue-500 text-xs font-bold text-white ring-1 ring-inset ring-blue-600/30 dark:bg-amber-400 dark:text-amber-950 dark:ring-amber-300/50">
            {initials}
          </div>
          <div className="leading-tight">
            <div className="text-sm font-medium text-main">
              {user ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() : "Guest"}
            </div>
            <div className="text-[11px] text-soft capitalize">{role ?? "guest"}</div>
          </div>
        </div>
        <span className="h-5 w-px bg-gray-200" aria-hidden />
        <button
          onClick={logout}
          className="cursor-pointer rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1.5 text-xs font-semibold text-blue-700 transition-all hover:bg-blue-100 hover:border-blue-300 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-400 dark:hover:bg-amber-400/20 dark:hover:border-amber-400/50"
        >
          Log out
        </button>
      </div>
      <HelpFaqModal open={helpOpen} onClose={() => setHelpOpen(false)} />
    </header>
  )
}

