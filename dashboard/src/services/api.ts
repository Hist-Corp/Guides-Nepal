import { http } from "./http"

export async function login(payload: { email: string; password: string }) {
  const res = await http.post("/auth/login", payload)
  return res.data
}

export async function registerUser(payload: {
  email: string
  password: string
  role?: "admin" | "host" | "guide" | "traveler"
  firstName?: string
  lastName?: string
  phone?: string
}) {
  const res = await http.post("/auth/register", payload)
  return res.data
}

export async function getMe() {
  const res = await http.get("/profile/me")
  return res.data
}

export async function getExperiences() {
  const res = await http.get("/experiences")
  return res.data
}

export async function getExperience(slug: string) {
  const res = await http.get(`/experiences/${slug}`)
  return res.data
}

export async function getGuides(city?: string) {
  const params = city ? { city } : {}
  const res = await http.get("/guides", { params })
  return res.data
}

export async function getGuide(id: number) {
  const res = await http.get(`/guides/${id}`)
  return res.data
}

export async function getBookings() {
  const res = await http.get("/bookings")
  return res.data
}

export async function createBooking(payload: {
  experience_id: number
  date: string
  guests: number
}) {
  const res = await http.post("/bookings", payload)
  return res.data
}

export async function updateBooking(id: number, payload: { status?: string; date?: string; guests?: number }) {
  const res = await http.patch(`/bookings/${id}`, payload)
  return res.data
}

export async function deleteBooking(id: number) {
  const res = await http.delete(`/bookings/${id}`)
  return res.data
}

export async function getProfile() {
  const res = await http.get("/profile/me")
  return res.data
}

export async function updateProfile(payload: {
  firstName?: string
  lastName?: string
  phone?: string
}) {
  const res = await http.patch("/profile/me", payload)
  return res.data
}

export async function forgotPassword(email: string) {
  const res = await http.post("/auth/forgot-password", { email })
  return res.data
}

export async function resetPassword(payload: {
  supabase_access_token: string
  password: string
}) {
  const res = await http.post("/auth/sync-password", payload)
  return res.data
}

// --- Admin API functions ---
export async function getAdminStats() {
  const res = await http.get("/admin/stats")
  return res.data
}

export async function getAdminUsers(role?: string) {
  const params = role ? { role } : {}
  const res = await http.get("/admin/users", { params })
  return res.data
}

export async function updateAdminUser(userId: number, payload: any) {
  const res = await http.patch(`/admin/users/${userId}`, payload)
  return res.data
}

export async function suspendUser(userId: number) {
  const res = await http.post(`/admin/users/${userId}/suspend`)
  return res.data
}

export async function activateUser(userId: number) {
  const res = await http.post(`/admin/users/${userId}/activate`)
  return res.data
}

export async function deleteUser(userId: number) {
  const res = await http.delete(`/admin/users/${userId}`)
  return res.data
}

export async function getAdminGuides(city?: string) {
  const params = city ? { city } : {}
  const res = await http.get("/admin/guides", { params })
  return res.data
}

export async function updateAdminGuide(guideId: number, payload: any) {
  const res = await http.patch(`/admin/guides/${guideId}`, payload)
  return res.data
}

export async function verifyGuide(guideId: number) {
  const res = await http.post(`/admin/guides/${guideId}/verify`)
  return res.data
}

export async function suspendGuide(guideId: number) {
  const res = await http.post(`/admin/guides/${guideId}/suspend`)
  return res.data
}

export async function deleteGuide(guideId: number) {
  const res = await http.delete(`/admin/guides/${guideId}`)
  return res.data
}

export async function getAdminExperiences(city?: string) {
  const params = city ? { city } : {}
  const res = await http.get("/admin/experiences", { params })
  return res.data
}

export async function createAdminExperience(payload: any) {
  const res = await http.post("/admin/experiences", payload)
  return res.data
}

export async function updateAdminExperience(expId: number, payload: any) {
  const res = await http.patch(`/admin/experiences/${expId}`, payload)
  return res.data
}

export async function deleteAdminExperience(expId: number) {
  const res = await http.delete(`/admin/experiences/${expId}`)
  return res.data
}

export async function getAdminBookings(status?: string) {
  const params = status ? { status } : {}
  const res = await http.get("/admin/bookings", { params })
  return res.data
}

export async function updateAdminBooking(bookingId: number, payload: any) {
  const res = await http.patch(`/admin/bookings/${bookingId}`, payload)
  return res.data
}

export async function cancelAdminBooking(bookingId: number) {
  const res = await http.post(`/admin/bookings/${bookingId}/cancel`)
  return res.data
}

// --- Content Management API ---
export async function getContentPages() {
  const res = await http.get("/content/pages")
  return res.data
}

export async function createContentPage(payload: any) {
  const res = await http.post("/content/pages", payload)
  return res.data
}

export async function updateContentPage(pageId: number, payload: any) {
  const res = await http.patch(`/content/pages/${pageId}`, payload)
  return res.data
}

export async function deleteContentPage(pageId: number) {
  const res = await http.delete(`/content/pages/${pageId}`)
  return res.data
}

export async function getContentBlog() {
  const res = await http.get("/content/blog")
  return res.data
}

export async function createContentBlog(payload: any) {
  const res = await http.post("/content/blog", payload)
  return res.data
}

export async function updateContentBlog(postId: number, payload: any) {
  const res = await http.patch(`/content/blog/${postId}`, payload)
  return res.data
}

export async function deleteContentBlog(postId: number) {
  const res = await http.delete(`/content/blog/${postId}`)
  return res.data
}

export async function getContentGuides() {
  const res = await http.get("/content/guides-content")
  return res.data
}

export async function createContentGuide(payload: any) {
  const res = await http.post("/content/guides-content", payload)
  return res.data
}

export async function updateContentGuide(contentId: number, payload: any) {
  const res = await http.patch(`/content/guides-content/${contentId}`, payload)
  return res.data
}

export async function deleteContentGuide(contentId: number) {
  const res = await http.delete(`/content/guides-content/${contentId}`)
  return res.data
}

// --- Media Library API ---
export async function getMedia() {
  const res = await http.get("/content/media")
  return res.data
}

export async function uploadMedia(payload: any) {
  const res = await http.post("/content/media", payload)
  return res.data
}

export async function deleteMedia(mediaId: number) {
  const res = await http.delete(`/content/media/${mediaId}`)
  return res.data
}

export async function updateMedia(mediaId: number, payload: any) {
  const res = await http.patch(`/content/media/${mediaId}`, payload)
  return res.data
}

// --- SEO Management API ---
export async function getSeo() {
  const res = await http.get("/content/seo")
  return res.data
}

export async function createSeo(payload: any) {
  const res = await http.post("/content/seo", payload)
  return res.data
}

export async function updateSeo(seoId: number, payload: any) {
  const res = await http.patch(`/content/seo/${seoId}`, payload)
  return res.data
}

export async function deleteSeo(seoId: number) {
  const res = await http.delete(`/content/seo/${seoId}`)
  return res.data
}

// --- Live Page Editor: Page Sections ---
export async function getPageSections(slug: string) {
  const res = await http.get(`/content/pages/${slug}/sections`)
  return res.data
}

export async function updatePageSection(slug: string, sectionId: string, payload: any) {
  const res = await http.put(`/content/pages/${slug}/sections/${sectionId}`, payload)
  return res.data
}

export async function createPageSection(slug: string, payload: any) {
  const res = await http.post(`/content/pages/${slug}/sections`, payload)
  return res.data
}

export async function updateAllSections(slug: string, sections: any[]) {
  const res = await http.put(`/content/pages/${slug}/sections`, { sections })
  return res.data
}

export async function deletePageSection(slug: string, sectionId: string) {
  const res = await http.delete(`/content/pages/${slug}/sections/${sectionId}`)
  return res.data
}
