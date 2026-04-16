import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { useEffect, useState } from "react";
import { getCategoryBySlug, getRankingListsByCategory } from "@/lib/supabase-helpers";
import type { Database } from "@/integrations/supabase/types";

type Category = Database["public"]["Tables"]["categories"]["Row"];
type RankingList = Database["public"]["Tables"]["ranking_lists"]["Row"];

export const Route = createFileRoute("/category/$slug")({
  component: CategoryPage,
});

function CategoryPage() {
  const { slug } = Route.useParams();
  const [category, setCategory] = useState<Category | null>(null);
  const [lists, setLists] = useState<RankingList[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const cat = await getCategoryBySlug(slug);
        setCategory(cat);
        const rankingLists = await getRankingListsByCategory(cat.id);
        setLists(rankingLists);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <div className="mx-auto max-w-7xl px-4 py-12">
          <div className="h-8 w-48 animate-pulse rounded bg-muted" />
          <div className="mt-8 grid gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <div className="mx-auto max-w-7xl px-4 py-12 text-center">
          <h1 className="font-display text-2xl font-bold">Category not found</h1>
          <Link to="/categories" className="mt-4 inline-block text-gold hover:underline">Back to categories</Link>
        </div>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="bg-navy px-4 py-12 text-center">
        <h1 className="font-display text-3xl font-bold text-navy-foreground">{category.name}</h1>
        {category.description && (
          <p className="mt-2 text-navy-foreground/70">{category.description}</p>
        )}
      </div>
      <div className="mx-auto max-w-7xl px-4 py-8">
        {lists.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {lists.map((list) => (
              <Link
                key={list.id}
                to="/list/$slug"
                params={{ slug: list.slug }}
                className="group rounded-lg border border-border bg-card p-5 transition-all hover:border-gold/40 hover:shadow-md"
              >
                <div className="mb-2 text-xs font-medium text-gold">Top {list.list_size}</div>
                <h3 className="font-display text-lg font-semibold text-foreground group-hover:text-gold transition-colors">{list.title}</h3>
                {list.description && (
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{list.description}</p>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">No ranking lists in this category yet.</p>
        )}
      </div>
      <SiteFooter />
    </div>
  );
}
