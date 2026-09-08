import useFetch from "../hooks/useFetch"
import { getBookings } from "../services/api"

export default function GuideMyBookings() {
  const { data, loading, error } = useFetch(getBookings)
  return (
    <div className="space-y-4">
      <div className="text-xl font-semibold text-darkBlue">My bookings</div>
      <div className="rounded-lg bg-white p-4 border border-gray-200">
        {loading && "Loading..."}
        {error && <span className="text-red-600">{error}</span>}
        {!loading && !error && Array.isArray(data) && (
          <ul className="space-y-2">
            {data.map((b: any) => (
              <li key={b.id} className="border rounded-lg p-3">
                <div className="font-medium">{b.experienceTitle ?? "Experience"}</div>
                <div className="text-sm text-gray-600">{b.date}</div>
                <div className="text-sm text-gray-600">Guests: {b.guests}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
