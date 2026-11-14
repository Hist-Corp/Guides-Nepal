import { useState } from "react"
import { getApiUrl } from "../config/api"

interface ForgotPasswordModalProps {
  isOpen: boolean
  onClose: () => void
  onSwitchToLogin: () => void
}

const GENERIC_SUCCESS_MESSAGE =
  "If an account exists for that email, we have sent a password reset link. Please check your inbox (and spam folder) for an email from Guides Nepal with instructions to reset your password."

export default function ForgotPasswordModal({ isOpen, onClose, onSwitchToLogin }: ForgotPasswordModalProps) {
  const [email, setEmail] = useState("")
  const [emailError, setEmailError] = useState<string | null>(null)
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  if (!isOpen) return null

  const validateEmail = (value: string) => {
    if (!value) {
      setEmailError("Email is required")
      return false
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value)) {
      setEmailError("Please enter a valid email address")
      return false
    }
    setEmailError(null)
    return true
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
    if (emailError) validateEmail(e.target.value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateEmail(email)) {
      return
    }

    setStatus("loading")
    setErrorMessage(null)

    try {
      const resp = await fetch(getApiUrl("/auth/forgot-password"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      if (!resp.ok) {
        console.warn("Password reset request returned non-OK:", resp.status)
      }

      setStatus("success")
    } catch (err) {
      console.error("Failed to send password reset email:", err)
      setStatus("error")
      setErrorMessage("We could not process your request at the moment. Please try again later.")
    }
  }

  const handleClose = () => {
    setStatus("idle")
    setEmail("")
    setEmailError(null)
    setErrorMessage(null)
    onClose()
  }

  const handleSwitchToLogin = () => {
    setStatus("idle")
    setEmail("")
    setEmailError(null)
    setErrorMessage(null)
    onSwitchToLogin()
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity" onClick={handleClose}></div>

      <div className="relative w-full max-w-[480px] bg-white rounded-3xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
        <div className="bg-[#FFF0E6] p-6 text-center relative">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>

          <div className="flex justify-center mb-3">
            <div className="w-12 h-12 rounded-full bg-brand-yellow flex items-center justify-center text-[#213448] shadow-sm">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-[#213448] mb-1">Reset your password</h2>
          <p className="text-gray-600">We'll email you a link to reset it</p>
        </div>

        <div className="p-8">
          {status === "success" ? (
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </div>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed mb-6">{GENERIC_SUCCESS_MESSAGE}</p>
              <button
                onClick={handleSwitchToLogin}
                className="w-full bg-brand-yellow hover:bg-[#E5A800] text-[#213448] font-bold py-3.5 rounded-full transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                Back to log in
              </button>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <span className="text-gray-500 text-sm">
                  Enter your account email and we'll send a link to reset your password.
                </span>
              </div>

              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="Email"
                    required
                    autoFocus
                    className={`w-full px-4 py-3.5 border rounded-xl focus:ring-2 focus:ring-brand-yellow focus:border-transparent outline-none transition-all placeholder:text-gray-400 text-gray-900 bg-gray-50 focus:bg-white ${
                      emailError ? "border-red-500" : "border-gray-200"
                    }`}
                    value={email}
                    onChange={handleEmailChange}
                    disabled={status === "loading"}
                  />
                  {emailError && <div className="text-red-600 text-xs mt-1">{emailError}</div>}
                </div>

                {status === "error" && errorMessage && (
                  <div className="flex items-start gap-2 text-red-600 text-sm bg-red-50 rounded-xl p-3">
                    <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span>{errorMessage}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-brand-yellow hover:bg-[#E5A800] text-[#213448] font-bold py-3.5 rounded-full transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-lg flex items-center justify-center gap-2"
                  disabled={status === "loading"}
                >
                  {status === "loading" ? (
                    <>
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      Sending link…
                    </>
                  ) : (
                    "Send reset link"
                  )}
                </button>
              </form>

              <div className="text-center mt-8 text-sm text-gray-500">
                <button
                  onClick={handleSwitchToLogin}
                  className="inline-flex items-center gap-1 text-[#213448] font-bold hover:text-brand-yellow transition-colors hover:underline"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                  Back to log in
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}