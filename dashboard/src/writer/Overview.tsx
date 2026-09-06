import { useState, useEffect } from "react";
import PageShell from "../components/PageShell";
import KPICard from "../components/KPICard";
import Card from "../components/Card";
import Button from "../components/Button";
import Loading from "../components/Loading";
import { FRONTEND_URL } from "../config/api";
import { getContentPages, getContentBlog, getContentGuides } from "../services/api";
import { FRONTEND_PAGES } from "../config/frontendPages";

export default function WriterOverview() {
  const [stats, setStats] = useState({ pages: 0, blog: 0, guides: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [pages, blog, guides] = await Promise.all([
          getContentPages().catch(() => []),
          getContentBlog().catch(() => []),
          getContentGuides().catch(() => []),
        ]);
        setStats({
          pages: Array.isArray(pages) ? pages.length : 0,
          blog: Array.isArray(blog) ? blog.length : 0,
          guides: Array.isArray(guides) ? guides.length : 0,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <PageShell
      title="Content Writer Overview"
      description="Quick overview of your content and a shortcut to the live website."
      action={
        <Button
          variant="primary"
          size="md"
          icon="🌐"
          onClick={() => window.open(FRONTEND_URL, "_blank")}
        >
          Open website
        </Button>
      }
      noCard
    >
      {loading ? (
        <Loading label="Loading overview…" />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            <KPICard title="Static Pages" value={stats.pages} sub="managed pages" />
            <KPICard title="Blog Articles" value={stats.blog} sub="published & drafts" />
            <KPICard title="Guides Content" value={stats.guides} sub="descriptions & FAQs" />
          </div>

          <Card>
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold text-darkBlue">Quick Actions</div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={() => window.open(`${FRONTEND_URL}/blog`, "_blank")}>
                Open Blog
              </Button>
              <Button size="sm" variant="secondary" onClick={() => window.open(`${FRONTEND_URL}/explore`, "_blank")}>
                Open Explore
              </Button>
            </div>
          </Card>

          <Card>
            <div className="text-sm font-semibold text-darkBlue mb-3">Frontend Pages Available</div>
            <p className="text-xs text-gray-500 mb-3">
              {FRONTEND_PAGES.length} pages registered across the site.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-1.5 text-sm">
              {FRONTEND_PAGES.map((p) => (
                <div key={p.slug} className="flex items-center gap-2">
                  <span>{p.icon}</span>
                  <span className="font-medium text-darkBlue">{p.title}</span>
                  <span className="text-gray-500">{p.path}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </PageShell>
  );
}