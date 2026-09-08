import { useAuthStore } from "../state/authStore"

export default function HeroGreeting() {
  const { user, role } = useAuthStore()
  const name = user ? `${user.firstName ?? ""}`.trim() || "there" : "there"
  const area = role
    ? role.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
    : "Dashboard"
  return (
    <div className="h-full bg-darkBlue text-white p-6 flex flex-col justify-center">
      <div className="text-xs uppercase tracking-wider text-white/60">{area}</div>
      <div className="mt-1 text-2xl font-semibold">Welcome back, {name}</div>
      <div className="mt-1 text-sm text-white/70">Here's what's happening across your workspace today.</div>
    </div>
  )
}

