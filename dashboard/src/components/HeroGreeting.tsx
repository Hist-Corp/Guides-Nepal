import { useAuthStore } from "../state/authStore"

export default function HeroGreeting() {
  const { user, role } = useAuthStore()
  const name = user ? `${user.firstName ?? ""}`.trim() || "there" : "there"
  const area = role
    ? role.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
    : "Dashboard"
  return (
    <div className="gn-card bg-hero-grad relative h-full overflow-hidden rounded-2xl border border-line p-6">
      <div className="absolute -right-8 -top-8 h-36 w-36 rounded-full bg-blue-500/20 blur-2xl dark:bg-amber-400/25" />
      <div className="absolute -left-8 bottom-0 h-28 w-28 rounded-full bg-white/40 blur-2xl dark:bg-white/10" />
      <div className="relative flex flex-col justify-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-brand-700 ring-1 ring-inset ring-brand-200 dark:bg-white/10 dark:text-brand-300 dark:ring-brand-500/30">
          ⚡ {area}
        </div>
        <div className="mt-2 text-2xl font-black tracking-tight text-main">
          Welcome back, {name}
        </div>
        <div className="mt-1 text-sm text-soft">
          Here's what's happening across your workspace today.
        </div>
      </div>
    </div>
  )
}

