export type Role =
  | "admin"
  | "content-manager"
  | "regional-head"
  | "customer-support"
  | "host"

// Hierarchy, lowest privilege first:
// host < customer-support < regional-head < content-manager < admin
const ORDER: Role[] = [
  "host",
  "customer-support",
  "regional-head",
  "content-manager",
  "admin",
]

export function canAccess(required: Role, actual: Role | null) {
  if (!actual) return false
  const indexRequired = ORDER.indexOf(required)
  const indexActual = ORDER.indexOf(actual)
  return indexActual >= indexRequired
}

/**
 * Maps a stored/API role value onto a dashboard role.
 *
 * Only the five dashboard roles resolve; every other value (including the
 * retired `super-admin` and `guide` roles) returns `null`, which keeps those
 * accounts out of every console. `content-writer` stays mapped because it is
 * the previous name of the same role, not a separate one.
 */
export function normalizeRole(role: string | null | undefined): Role | null {
  if (!role) return null
  const r = role.toLowerCase()
  if (r === "admin") return "admin"
  if (r === "host") return "host"
  if (r === "regional-head" || r === "regional_head" || r === "regional head") return "regional-head"
  if (r === "customer-support" || r === "customer_support" || r === "customer support" || r === "support") return "customer-support"
  if (
    r === "content-manager" ||
    r === "content_manager" ||
    r === "content manager" ||
    // legacy name of the same role
    r === "content-writer" ||
    r === "content_writer" ||
    r === "content writer" ||
    r === "writer"
  )
    return "content-manager"
  return null
}
