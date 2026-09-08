export type Role =
  | "super-admin"
  | "admin"
  | "content-writer"
  | "regional-head"
  | "customer-support"
  | "host"
  | "guide"

// Hierarchy, lowest privilege first:
// guide < host < customer-support < regional-head < content-writer < admin < super-admin
const ORDER: Role[] = [
  "guide",
  "host",
  "customer-support",
  "regional-head",
  "content-writer",
  "admin",
  "super-admin",
]

export function canAccess(required: Role, actual: Role | null) {
  if (!actual) return false
  // Super Admin has access to every role's functionality.
  if (actual === "super-admin") return true
  const indexRequired = ORDER.indexOf(required)
  const indexActual = ORDER.indexOf(actual)
  return indexActual >= indexRequired && !(actual === "host" && required === "admin")
}

export function normalizeRole(role: string | null | undefined): Role | null {
  if (!role) return null
  const r = role.toLowerCase()
  if (r === "admin") return "admin"
  if (r === "super-admin" || r === "superadmin" || r === "super_admin") return "super-admin"
  if (r === "host") return "host"
  if (r === "guide") return "guide"
  if (r === "content-writer" || r === "content_writer" || r === "content writer" || r === "writer") return "content-writer"
  if (r === "regional-head" || r === "regional_head" || r === "regional head") return "regional-head"
  if (r === "customer-support" || r === "customer_support" || r === "customer support" || r === "support") return "customer-support"
  return null
}
