import { FormEvent, useEffect, useState } from "react"
import PageShell from "../components/PageShell"
import Button from "../components/Button"
import Field from "../components/Field"
import Card from "../components/Card"
import { getProfile, updateProfile, updateNotificationSettings, updatePayoutSettings, getNotificationSettings, getPayoutSettings } from "../services/api"
import { useAuthStore } from "../state/authStore"

type NotificationSettings = {
  email_bookings: boolean
  email_messages: boolean
  email_reviews: boolean
  email_payouts: boolean
  email_marketing: boolean
  push_bookings: boolean
  push_messages: boolean
  push_reviews: boolean
}

type PayoutSettings = {
  method: "bank_transfer" | "wise" | "paypal"
  bank_account?: { name: string; account: string; routing: string; swift: string }
  wise_account?: { email: string }
  paypal_account?: { email: string }
  auto_payout: boolean
  min_payout_amount: number
  payout_schedule: "weekly" | "biweekly" | "monthly"
}

const initialNotifications: NotificationSettings = {
  email_bookings: true, email_messages: true, email_reviews: true, email_payouts: true,
  email_marketing: false, push_bookings: true, push_messages: true, push_reviews: false
}

const initialPayout: PayoutSettings = {
  method: "bank_transfer", auto_payout: true, min_payout_amount: 50, payout_schedule: "weekly",
  bank_account: { name: "", account: "", routing: "", swift: "" }
}

export default function HostSettings() {
  const { user, setUser } = useAuthStore()
  const [activeTab, setActiveTab] = useState<"profile" | "notifications" | "payout" | "security">("profile")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Profile
  const [profile, setProfile] = useState({ firstName: "", lastName: "", phone: "", email: "" })
  // Notifications
  const [notifications, setNotifications] = useState<NotificationSettings>(initialNotifications)
  // Payout
  const [payout, setPayout] = useState<PayoutSettings>(initialPayout)
  // Security
  const [passwordForm, setPasswordForm] = useState({ current: "", new: "", confirm: "" })

  useEffect(() => {
    if (user) {
      setProfile({ firstName: user.firstName || "", lastName: user.lastName || "", phone: "", email: user.email })
    }
    loadSettings()
  }, [user])

  const loadSettings = async () => {
    try {
      const [notif, payoutData] = await Promise.all([
        getNotificationSettings(),
        getPayoutSettings()
      ])
      if (notif) setNotifications(notif)
      if (payoutData) setPayout(payoutData)
    } catch (e) {
      console.error("Failed to load settings", e)
    }
  }

  const saveProfile = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError("")
    setSuccess("")
    try {
      await updateProfile({ firstName: profile.firstName, lastName: profile.lastName, phone: profile.phone })
      setUser({ ...user!, firstName: profile.firstName, lastName: profile.lastName })
      setSuccess("Profile updated successfully")
    } catch (e: any) {
      setError(e?.response?.data?.detail || "Failed to update profile")
    } finally { setSaving(false) }
  }

  const saveNotifications = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError("")
    setSuccess("")
    try {
      await updateNotificationSettings(notifications)
      setSuccess("Notification preferences saved")
    } catch (e: any) {
      setError(e?.response?.data?.detail || "Failed to save notifications")
    } finally { setSaving(false) }
  }

  const savePayout = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError("")
    setSuccess("")
    try {
      await updatePayoutSettings(payout)
      setSuccess("Payout settings saved")
    } catch (e: any) {
      setError(e?.response?.data?.detail || "Failed to save payout settings")
    } finally { setSaving(false) }
  }

  const changePassword = async (e: FormEvent) => {
    e.preventDefault()
    if (passwordForm.new !== passwordForm.confirm) {
      setError("New passwords do not match")
      return
    }
    if (passwordForm.new.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }
    setSaving(true)
    setError("")
    setSuccess("")
    try {
      // This would call an API to change password
      await new Promise(r => setTimeout(r, 1000))
      setPasswordForm({ current: "", new: "", confirm: "" })
      setSuccess("Password changed successfully")
    } catch (e: any) {
      setError(e?.response?.data?.detail || "Failed to change password")
    } finally { setSaving(false) }
  }

  const toggleNotif = (key: keyof NotificationSettings) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const togglePayout = (key: keyof PayoutSettings) => {
    if (typeof payout[key] === "boolean") {
      setPayout(prev => ({ ...prev, [key]: !prev[key] }))
    }
  }

  return (
    <PageShell title="Settings" description="Manage your profile, notifications, payout preferences, and security." noCard>
      {(error || success) && (
        <div className="mb-6 rounded-lg p-3 text-sm" style={{ background: error ? "#fef2f2" : "#f0fdf4", color: error ? "#dc2626" : "#16a34a" }}>
          {error || success}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        <aside className="lg:w-56 flex-shrink-0">
          <nav className="space-y-1">
            {[
              { id: "profile", label: "Profile", icon: "👤" },
              { id: "notifications", label: "Notifications", icon: "🔔" },
              { id: "payout", label: "Payout settings", icon: "💳" },
              { id: "security", label: "Security", icon: "🔒" },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                  activeTab === tab.id
                    ? "bg-brand-500/10 text-brand-500"
                    : "text-soft hover:bg-surface-2 hover:text-main"
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </aside>

        <div className="flex-1">
          {activeTab === "profile" && (
            <Card className="p-6">
              <form onSubmit={saveProfile}>
                <h3 className="text-lg font-semibold mb-4">Personal information</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="First name" required value={profile.firstName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfile(p => ({ ...p, firstName: e.target.value }))} />
                  <Field label="Last name" required value={profile.lastName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfile(p => ({ ...p, lastName: e.target.value }))} />
                  <Field label="Email" type="email" value={profile.email} disabled />
                  <Field label="Phone" type="tel" value={profile.phone} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfile(p => ({ ...p, phone: e.target.value }))} placeholder="+977 98XXXXXXXX" />
                </div>
                <div className="mt-6 flex justify-end">
                  <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save changes"}</Button>
                </div>
              </form>
            </Card>
          )}

          {activeTab === "notifications" && (
            <Card className="p-6">
              <form onSubmit={saveNotifications}>
                <h3 className="text-lg font-semibold mb-4">Email notifications</h3>
                <div className="space-y-3 mb-6">
                  {[
                    { key: "email_bookings", label: "New booking requests", desc: "When a guest requests to book your experience" },
                    { key: "email_messages", label: "Guest messages", desc: "When a guest sends you a message" },
                    { key: "email_reviews", label: "New reviews", desc: "When a guest leaves a review" },
                    { key: "email_payouts", label: "Payout updates", desc: "When a payout is processed or fails" },
                    { key: "email_marketing", label: "Marketing emails", desc: "Tips, updates, and promotions from Guides Nepal" },
                  ].map(item => (
                    <label key={item.key} className="flex items-center justify-between py-3 border-b last:border-0 cursor-pointer">
                      <div>
                        <span className="font-medium">{item.label}</span>
                        <p className="text-sm text-soft">{item.desc}</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifications[item.key as keyof NotificationSettings]}
                        onChange={() => toggleNotif(item.key as keyof NotificationSettings)}
                        className="h-5 w-5 rounded border-line text-brand-500 focus:ring-brand-500"
                      />
                    </label>
                  ))}
                </div>

                <h3 className="text-lg font-semibold mb-4">Push notifications</h3>
                <div className="space-y-3">
                  {[
                    { key: "push_bookings", label: "Booking requests" },
                    { key: "push_messages", label: "Guest messages" },
                    { key: "push_reviews", label: "New reviews" },
                  ].map(item => (
                    <label key={item.key} className="flex items-center justify-between py-3 border-b last:border-0 cursor-pointer">
                      <span className="font-medium">{item.label}</span>
                      <input
                        type="checkbox"
                        checked={notifications[item.key as keyof NotificationSettings]}
                        onChange={() => toggleNotif(item.key as keyof NotificationSettings)}
                        className="h-5 w-5 rounded border-line text-brand-500 focus:ring-brand-500"
                      />
                    </label>
                  ))}
                </div>

                <div className="mt-6 flex justify-end">
                  <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save preferences"}</Button>
                </div>
              </form>
            </Card>
          )}

          {activeTab === "payout" && (
            <Card className="p-6">
              <form onSubmit={savePayout}>
                <h3 className="text-lg font-semibold mb-4">Payout method</h3>
                <div className="space-y-3 mb-6">
                  {[
                    { value: "bank_transfer", label: "Bank transfer", desc: "Direct deposit to your bank account" },
                    { value: "wise", label: "Wise (formerly TransferWise)", desc: "International transfers with low fees" },
                    { value: "paypal", label: "PayPal", desc: "Fast payouts to your PayPal account" },
                  ].map(method => (
                    <label key={method.value} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition ${payout.method === method.value ? "border-brand-500 bg-brand-500/5" : "border-line hover:border-brand-300"}`}>
                      <input
                        type="radio"
                        name="method"
                        value={method.value}
                        checked={payout.method === method.value}
                        onChange={() => setPayout(prev => ({ ...prev, method: method.value as PayoutSettings["method"] }))}
                        className="h-5 w-5 text-brand-500 focus:ring-brand-500"
                      />
                      <div>
                        <span className="font-medium">{method.label}</span>
                        <p className="text-sm text-soft">{method.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>

                {payout.method === "bank_transfer" && payout.bank_account && (
                  <div className="mb-6 grid gap-4 md:grid-cols-2">
                    <h4 className="font-medium md:col-span-2">Bank account details</h4>
                    <Field label="Account holder name" value={payout.bank_account.name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPayout(prev => ({ ...prev, bank_account: { ...prev.bank_account!, name: e.target.value } }))} />
                    <Field label="Account number" value={payout.bank_account.account} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPayout(prev => ({ ...prev, bank_account: { ...prev.bank_account!, account: e.target.value } }))} />
                    <Field label="Routing number" value={payout.bank_account.routing} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPayout(prev => ({ ...prev, bank_account: { ...prev.bank_account!, routing: e.target.value } }))} />
                    <Field label="SWIFT/BIC" value={payout.bank_account.swift} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPayout(prev => ({ ...prev, bank_account: { ...prev.bank_account!, swift: e.target.value } }))} />
                  </div>
                )}

                {payout.method === "wise" && payout.wise_account && (
                  <div className="mb-6">
                    <Field label="Wise email" type="email" value={payout.wise_account.email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPayout(prev => ({ ...prev, wise_account: { ...prev.wise_account!, email: e.target.value } }))} />
                  </div>
                )}

                {payout.method === "paypal" && payout.paypal_account && (
                  <div className="mb-6">
                    <Field label="PayPal email" type="email" value={payout.paypal_account.email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPayout(prev => ({ ...prev, paypal_account: { ...prev.paypal_account!, email: e.target.value } }))} />
                  </div>
                )}

                <h3 className="text-lg font-semibold mb-4">Payout preferences</h3>
                <div className="space-y-4 mb-6">
                  <label className="flex items-center justify-between py-3 border-b last:border-0 cursor-pointer">
                    <div>
                      <span className="font-medium">Automatic payouts</span>
                      <p className="text-sm text-soft">Automatically transfer funds when they reach the minimum amount</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={payout.auto_payout}
                      onChange={() => togglePayout("auto_payout")}
                      className="h-5 w-5 rounded border-line text-brand-500 focus:ring-brand-500"
                    />
                  </label>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Minimum payout amount (USD)" type="number" min="10" step="10" value={String(payout.min_payout_amount)} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPayout(prev => ({ ...prev, min_payout_amount: Number(e.target.value) }))} />
                    <Field label="Payout schedule" as="select" value={payout.payout_schedule} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setPayout(prev => ({ ...prev, payout_schedule: e.target.value as PayoutSettings["payout_schedule"] }))}>
                      <option value="weekly">Weekly</option>
                      <option value="biweekly">Bi-weekly</option>
                      <option value="monthly">Monthly</option>
                    </Field>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save payout settings"}</Button>
                </div>
              </form>
            </Card>
          )}

          {activeTab === "security" && (
            <Card className="p-6">
              <form onSubmit={changePassword}>
                <h3 className="text-lg font-semibold mb-4">Change password</h3>
                <div className="grid gap-4 md:grid-cols-2 max-w-xl">
                  <Field label="Current password" type="password" required value={passwordForm.current} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPasswordForm(p => ({ ...p, current: e.target.value }))} />
                  <Field label="New password" type="password" required value={passwordForm.new} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPasswordForm(p => ({ ...p, new: e.target.value }))} minLength={8} />
                  <Field label="Confirm new password" type="password" required value={passwordForm.confirm} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPasswordForm(p => ({ ...p, confirm: e.target.value }))} />
                </div>
                <div className="mt-6 flex justify-end">
                  <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Change password"}</Button>
                </div>
              </form>

              <div className="mt-8 border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Danger zone</h3>
                <p className="text-soft mb-4">These actions are irreversible.</p>
                <div className="flex flex-wrap gap-3">
                  <Button variant="danger" onClick={() => { if (window.confirm("Delete your account? This cannot be undone.")) alert("Account deletion not implemented in demo") }}>Delete account</Button>
                  <Button variant="secondary" onClick={() => { if (window.confirm("Log out of all devices?")) alert("Logged out everywhere") }}>Log out everywhere</Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </PageShell>
  )
}