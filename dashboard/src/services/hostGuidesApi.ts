import { http } from "./http"
import { getHostExperiences } from "./api"

export { getHostExperiences }

export async function getHostGuides() {
  const res = await http.get("/host/guides")
  return res.data
}

export async function createHostGuide(payload: Record<string, unknown>) {
  const res = await http.post("/host/guides", payload)
  return res.data
}

export async function suspendHostGuide(id: number) {
  const res = await http.post(`/host/guides/${id}/suspend`)
  return res.data
}

export async function reactivateHostGuide(id: number) {
  const res = await http.post(`/host/guides/${id}/reactivate`)
  return res.data
}

export async function getHostExperienceGuides(experienceId: number) {
  const res = await http.get(`/host/guides/experiences/${experienceId}/guides`)
  return res.data
}

export async function assignHostExperienceGuide(experienceId: number, payload: Record<string, unknown>) {
  const res = await http.post(`/host/guides/experiences/${experienceId}/guides`, payload)
  return res.data
}

export async function unassignHostExperienceGuide(experienceId: number, guideId: number) {
  const res = await http.delete(`/host/guides/experiences/${experienceId}/guides/${guideId}`)
  return res.data
}
