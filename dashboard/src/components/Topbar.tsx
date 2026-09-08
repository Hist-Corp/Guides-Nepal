import { useAuthStore } from "../state/authStore"
import { useNavigate, Link } from "react-router-dom"

export default function Topbar() {
  const navigate = useNavigate()
  const { role, user, reset } = useAuthStore()
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
    <header className="h-16 bg-white border-b border-gray-200 flex items-center px-5 justify-between shrink-0">
      <div className="flex items-center gap-3">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg text-darkBlue">
          <span className="h-8 w-8 rounded-full bg-brand-yellow flex items-center justify-center text-sm">
            🇳🇵
          </span>
          Guides Nepal
        </Link>
        <span className="h-5 w-px bg-gray-200" aria-hidden />
        <span className="text-xs font-medium uppercase tracking-wider text-gray-500">
          {areaLabel || "Console"}
        </span>
      </div>

      <div className="hidden lg:block relative w-80">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"
        >
          <circle cx="11" cy="11" r="7" strokeLinecap="round" />
          <path d="m20 20-3.5-3.5" strokeLinecap="round" />
        </svg>
        <input
          className="w-full rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-3 py-2 text-sm text-darkBlue placeholder:text-gray-400 focus:outline-none focus:border-brand-yellow focus:bg-white"
          placeholder="Search…"
        />
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-full bg-darkBlue text-white text-xs font-semibold grid place-items-center">
            {initials}
          </div>
          <div className="leading-tight">
            <div className="text-sm font-medium text-darkBlue">
              {user ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() : "Guest"}
            </div>
            <div className="text-[11px] text-gray-500 capitalize">{role ?? "guest"}</div>
          </div>
        </div>
        <span className="h-5 w-px bg-gray-200" aria-hidden />
        <button
          onClick={logout}
          className="text-sm font-medium text-gray-500 hover:text-darkBlue transition-colors"
        >
          Log out
        </button>
      </div>
    </header>
  )
}

