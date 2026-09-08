import { useState } from "react";
import PageShell from "./PageShell";
import SectionCard from "./SectionCard";
import Button from "./Button";
import Loading from "./Loading";
import LivePageEditor from "../writer/LivePageEditor";
import { FRONTEND_PAGES, FrontendPage } from "../config/frontendPages";
import { updateAllSections } from "../services/api";

type Section = {
  id: string;
  title: string;
  type: string;
  content: Record<string, any>;
  style: Record<string, any>;
};

function buildSections(page: FrontendPage): Section[] {
  const sections: Section[] = [
    {
      id: "hero",
      title: "Hero Section",
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
    },
    {
      id: "body",
      title: "Content Section",
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
    },
  ];
  // Extra, page-type-specific sections
  if (page.path === "/") {
    sections.push(
      {
        id: "featured",
        title: "Featured Experiences",
        type: "featured",
        content: {
          heading: "Featured Experiences",
          subtitle: "Hand-picked experiences loved by travelers",
          buttonText: "View all",
        },
        style: { backgroundColor: "#ffffff", textColor: "#213448", alignment: "center" },
      },
      {
        id: "promo",
        title: "Promo Banner",
        type: "promo",
        content: {
          heading: "Travel, taste & explore Nepal",
          subtitle: "Book authentic local experiences with verified guides",
          buttonText: "Start exploring",
        },
        style: { backgroundColor: "#9A2143", textColor: "#ffffff", alignment: "center" },
      },
    );
  }
  if (page.path === "/explore" || page.path.startsWith("/most-") || ["food-tours", "cultural-tours", "outdoor-activities", "cooking-classes"].includes(page.path.replace("/", ""))) {
    sections.push({
      id: "categories",
      title: "Categories Strip",
      type: "categories",
      content: {
        heading: "Browse by category",
        subtitle: "Food, culture, outdoor adventures and more",
      },
      style: { backgroundColor: "#ffffff", textColor: "#213448", alignment: "center" },
    });
  }
  sections.push({
    id: "footer",
    title: "Footer",
    type: "footer",
    content: {
      supportEmail: "support@guidesnepal.com",
      copyright: `© ${new Date().getFullYear()} Guides Nepal — ${page.title}`,
    },
    style: { backgroundColor: "#9A2143", textColor: "#ffffff", alignment: "left", padding: "1.5rem" },
  });
  return sections;
}

export default function WebsiteContentManager({ area }: { area: "admin" | "super-admin" }) {
  const [editing, setEditing] = useState<FrontendPage | null>(null);
  const [savingSlug, setSavingSlug] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  if (editing) {
    return (
      <LivePageEditor
        slug={editing.slug}
        title={editing.title}
        path={editing.path}
        initialSections={buildSections(editing)}
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

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {FRONTEND_PAGES.map((page) => (
          <SectionCard
            key={page.slug}
            title={`${page.icon} ${page.title}`}
            subtitle={page.description || page.path}
          >
            <div className="flex items-center justify-between">
              <code className="text-xs text-gray-500">{page.path}</code>
              <Button
                size="sm"
                variant="primary"
                onClick={() => setEditing(page)}
                disabled={savingSlug === page.slug}
              >
                {savingSlug === page.slug ? "Saving…" : "Edit with live preview"}
              </Button>
            </div>
          </SectionCard>
        ))}
      </div>

      {!FRONTEND_PAGES.length ? <Loading label="Loading pages…" /> : null}
    </PageShell>
  );
}
