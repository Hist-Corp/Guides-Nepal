export default function SupportFaq() {
  const solutions = [
    {
      q: "Customer cannot log in",
      a: "Ask them to use 'Forgot your password'. If the account is suspended, escalate to an Admin to reactivate it."
    },
    {
      q: "Booking payment issue",
      a: "Verify the booking reference and payment status. Escalate billing disputes to an Admin via a ticket tagged 'urgent'."
    },
    {
      q: "Guide no-show",
      a: "Collect the booking details, apologise to the customer, and coordinate with the Host to arrange a replacement or refund."
    },
    {
      q: "Refund request",
      a: "Check the cancellation policy on the experience. Approved refunds must be confirmed by an Admin before processing."
    }
  ]
  return (
    <div className="space-y-4">
      <div className="text-2xl font-bold text-darkBlue">FAQ / Solutions</div>
      <div className="space-y-3">
        {solutions.map((s) => (
          <div key={s.q} className="rounded-2xl bg-white p-4 border">
            <div className="font-semibold text-darkBlue">{s.q}</div>
            <div className="text-sm text-gray-600 mt-1">{s.a}</div>
          </div>
        ))}
      </div>
    </div>
  )
}