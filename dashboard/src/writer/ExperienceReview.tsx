import ExperienceReviewPanel from "../components/ExperienceReviewPanel"

/**
 * Content Writer review inbox — new-experience proposals only (SOP-GN-EXP-001).
 * Content Writers cannot authorize change requests (SOP-GN-EXP-002 gate is
 * Regional Manager only), so that queue is not shown here.
 */
export default function WriterExperienceReview() {
  return <ExperienceReviewPanel scope="proposals" />
}
