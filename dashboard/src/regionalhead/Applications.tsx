import { useState } from "react"
import HostApplicationsPanel from "../components/HostApplicationsPanel"
import GuideApplicationsPanel from "../components/GuideApplicationsPanel"

export default function RegionalApplications() {
  const [queue, setQueue] = useState<"guide" | "host">("guide")
  return (
    <div className="space-y-4">
      <div className="flex rounded-lg border bg-white p-1 text-sm font-semibold w-fit">
        <button
          onClick={() => setQueue("guide")}
          className={`rounded-md px-3 py-1.5 ${queue === "guide" ? "bg-darkBlue text-white" : "text-gray-600"}`}
        >
          Guides
        </button>
        <button
          onClick={() => setQueue("host")}
          className={`rounded-md px-3 py-1.5 ${queue === "host" ? "bg-darkBlue text-white" : "text-gray-600"}`}
        >
          Hosts
        </button>
      </div>
      {queue === "guide" ? <GuideApplicationsPanel /> : <HostApplicationsPanel />}
    </div>
  )
}
