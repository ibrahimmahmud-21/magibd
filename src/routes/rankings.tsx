import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { useEffect, useState } from "react";
import { getRankingLists } from "@/lib/supabase-helpers";
import type { Database } from "@/integrations/supabase/types";

type Category = Database["public"]["Tables"]["categories"]["Row"];
type RankingList = Database["public"]["Tables"]["ranking_lists"]["Row"] & { categories: Category | null };

export const Route = createFileRoute("/rankings")({
  head: () => ({
    meta: [
      { title: "All Rankings — Magi BD" },
      { name: "description", content: "Explore all ranking lists on Magi BD." },
    ],
  }),
  component: RankingsPage,
});

function RankingsPage() {
  const [lists, setLists] = useState<RankingList[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRankingLists()
      .then((data) => setLists(data as RankingList[]))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="mx-auto max-w-7xl px-4 py-12">
        <h1 className="font-display text-3xl font-bold text-foreground">All Rankings</h1>
        <p className="mt-2 text-muted-foreground">Explore all curated ranking lists</p>

        {loading ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : lists.length > 0 ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {lists.map((list) => (
              <Link
                key={list.id}
                to="/list/$slug"
                params={{ slug: list.slug }}
                className="group rounded-lg border border-border bg-card p-6 transition-all hover:border-gold/40 hover:shadow-md"
              >
                <div className="mb-2 text-xs font-medium text-gold">
                  {list.categories?.name} • Top {list.list_size}
                </div>
                <h2 className="font-display text-lg font-bold text-foreground group-hover:text-gold transition-colors">
                  {list.title}
                </h2>
                {list.description && (
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{list.description}</p>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <p className="mt-8 text-center text-muted-foreground">No ranking lists yet.</p>
        )}
      </div>
      <SiteFooter />
    </div>
  );
}
