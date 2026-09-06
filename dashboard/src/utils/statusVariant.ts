import { BadgeVariant } from "../components/Badge";

export function statusVariant(status?: string): BadgeVariant {
  switch ((status || "").toLowerCase()) {
    case "published":
      return "success";
    case "draft":
      return "draft";
    case "archived":
      return "archived";
    case "live":
      return "info";
    default:
      return "default";
  }
}
