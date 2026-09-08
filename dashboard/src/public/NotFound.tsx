import { Link } from "react-router-dom"

export default function NotFound() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-24 text-center">
      <div className="text-6xl">🎒</div>
      <h1 className="text-3xl font-bold text-darkBlue mt-4">Page not found</h1>
      <p className="text-gray-500 mt-2">The trail you followed doesn't lead anywhere — let's get you back on the path.</p>
      <Link to="/" className="inline-block mt-6 rounded-xl px-6 py-3 bg-brand-yellow text-darkBlue font-semibold hover:opacity-90">
        Back to home
      </Link>
    </div>
  )
}
