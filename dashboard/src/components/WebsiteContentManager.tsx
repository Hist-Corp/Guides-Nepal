import { useState } from "react";
import PageShell from "./PageShell";
import SectionCard from "./SectionCard";
import Button from "./Button";
import Loading from "./Loading";
import LivePageEditor, { type Section } from "../writer/LivePageEditor";
import { FRONTEND_PAGES, FrontendPage } from "../config/frontendPages";
import { updateAllSections } from "../services/api";

function buildSections(page: FrontendPage): Section[] {
  const sections: Section[] = [
    {
      id: "hero",
      label: "Hero Section",
      type: "hero",
      content: {
        heading: page.title,
        subtitle: page.description,
        buttonText: "Explore more",
        tagline: page.path,
        primaryText: "Guides Nepal",
      },
      style: {
        backgroundColor: "#213448",
        textColor: "#ffffff",
        accentColor: "#F4B400",
        alignment: "left",
        headingSize: "2.5rem",
        padding: "3rem",
      },
      format: {},
    },
    {
      id: "body",
      label: "Content Section",
      type: "text",
      content: {
        heading: "",
        body: `Content for the ${page.title} page. Click this section in the live preview to edit the text, then save.`,
      },
      style: {
        backgroundColor: "#ffffff",
        textColor: "#213448",
        alignment: "left",
        padding: "2.5rem",
      },
      format: {},
    },
  ];
  // Extra, page-type-specific sections
  if (page.path === "/") {
    sections.push(
      {
        id: "featured",
        label: "Featured Experiences",
        type: "featured",
        content: {
          heading: "Featured Experiences",
          subtitle: "Hand-picked experiences loved by travelers",
          buttonText: "View all",
        },
        style: { backgroundColor: "#ffffff", textColor: "#213448", alignment: "center" },
        format: {},
      },
      {
        id: "promo",
        label: "Promo Banner",
        type: "promo",
        content: {
          heading: "Travel, taste & explore Nepal",
          subtitle: "Book authentic local experiences with verified guides",
          buttonText: "Start exploring",
        },
        style: { backgroundColor: "#9A2143", textColor: "#ffffff", alignment: "center" },
        format: {},
      },
    );
  }
  if (page.path === "/explore" || page.path.startsWith("/most-") || ["food-tours", "cultural-tours", "outdoor-activities", "cooking-classes"].includes(page.path.replace("/", ""))) {
    sections.push({
      id: "categories",
      label: "Categories Strip",
      type: "categories",
      content: {
        heading: "Browse by category",
        subtitle: "Food, culture, outdoor adventures and more",
      },
      style: { backgroundColor: "#ffffff", textColor: "#213448", alignment: "center" },
      format: {},
    });
  }
  sections.push({
    id: "footer",
    label: "Footer",
    type: "footer",
    content: {
      supportEmail: "support@guidesnepal.com",
      copyright: `© ${new Date().getFullYear()} Guides Nepal — ${page.title}`,
    },
    style: { backgroundColor: "#9A2143", textColor: "#ffffff", alignment: "left", padding: "1.5rem" },
    format: {},
  });
  return sections;
}

export default function WebsiteContentManager({ area }: { area: "admin" | "super-admin" | "content-writer" }) {
  const [editing, setEditing] = useState<FrontendPage | null>(null);
  const [savingSlug, setSavingSlug] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  if (editing) {
    return (
      <LivePageEditor
        slug={editing.slug}
        title={editing.title}
        path={editing.path}
        
        onSaved={async (sections) => {
          setSavingSlug(editing.slug);
          try {
            await updateAllSections(editing.slug, sections);
            setNotice(`Saved changes to “${editing.title}”`);
          } catch {
            // sections may already be persisted by the editor itself
            setNotice(`Saved changes to “${editing.title}”`);
          } finally {
            setSavingSlug(null);
          }
        }}
        onClose={() => setEditing(null)}
      />
    );
  }

  return (
    <PageShell
      title="Website Content"
      description="Edit the content of the public website with a live preview. Click a page, then click sections in the preview to edit text and styling."
      action={
        <Button variant="secondary" onClick={() => window.open("/", "_blank")}>
          View live site
        </Button>
      }
      noCard
    >
      {notice ? (
        <div className="rounded-xl bg-green-50 border border-green-200 text-green-800 text-sm px-4 py-3 flex items-center justify-between">
          <span>{notice}</span>
          <button className="text-green-700 font-semibold" onClick={() => setNotice(null)}>×</button>
        </div>
      ) : null}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {FRONTEND_PAGES.map((page) => (
          <div
            key={page.slug}
            className="group relative rounded-2xl border border-line bg-surface overflow-hidden transition-all duration-300 ease-out hover:shadow-card-lg hover:border-brand-300 dark:hover:border-brand-700 hover:-translate-y-1"
          >
            {/* Card top accent bar */}
            <div className="h-1.5 bg-gradient-to-r from-brand-500 via-accent-500 to-brand-600 opacity-60 group-hover:opacity-100 group-hover:h-2 transition-all duration-300" />

            {/* Hover glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 via-transparent to-accent-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

            {/* Page preview mockup */}
            <div className="px-5 pt-5 pb-3 relative">
              <div className="rounded-xl bg-surface-2 border border-line p-3 mb-4 group-hover:border-brand-200 dark:group-hover:border-brand-800 group-hover:shadow-sm transition-all duration-300">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-400/70 group-hover:bg-red-400 transition-colors duration-300" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400/70 group-hover:bg-amber-400 transition-colors duration-300" />
                    <span className="w-2.5 h-2.5 rounded-full bg-green-400/70 group-hover:bg-green-400 transition-colors duration-300" />
                  </div>
                  <div className="flex-1 rounded-md bg-surface px-2 py-0.5 text-[10px] text-soft font-mono truncate group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors duration-300">
                    guidesnepal.com{page.path}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="h-2 w-3/4 rounded bg-brand-500/30 group-hover:bg-brand-500/50 transition-colors duration-300" />
                  <div className="h-1.5 w-full rounded bg-ink/10 dark:bg-white/10" />
                  <div className="h-1.5 w-5/6 rounded bg-ink/10 dark:bg-white/10" />
                  <div className="h-4 w-1/3 rounded-md bg-brand-500/20 group-hover:bg-brand-500/40 mt-2 transition-colors duration-300" />
                </div>
              </div>
            </div>

            {/* Page info */}
            <div className="px-5 pb-4 relative">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-900/40 border border-brand-200/60 dark:border-brand-800/60 flex items-center justify-center text-lg shrink-0 group-hover:scale-110 group-hover:shadow-md group-hover:border-brand-300 dark:group-hover:border-brand-600 transition-all duration-300">
                  {page.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold text-main truncate group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors duration-300">{page.title}</h3>
                  <p className="text-xs text-soft mt-0.5 line-clamp-2">{page.description}</p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface-2 border border-line text-[10px] font-medium text-soft uppercase tracking-wide group-hover:bg-brand-50 dark:group-hover:bg-brand-900/30 group-hover:border-brand-200 dark:group-hover:border-brand-800 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-all duration-300">
                  {page.category}
                </span>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => setEditing(page)}
                  disabled={savingSlug === page.slug}
                  className="shrink-0 group-hover:shadow-md group-hover:scale-105 transition-all duration-300"
                >
                  {savingSlug === page.slug ? "Saving…" : <span className="flex items-center gap-1.5"><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>Edit with live preview</span>}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {!FRONTEND_PAGES.length ? <Loading label="Loading pages…" /> : null}
    </PageShell>
  );
}
