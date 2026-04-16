import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { useEffect, useState } from "react";
import { getCategories } from "@/lib/supabase-helpers";
import { Award } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Category = Database["public"]["Tables"]["categories"]["Row"];

export const Route = createFileRoute("/categories")({
  head: () => ({
    meta: [
      { title: "Categories — Magi BD" },
      { name: "description", content: "Browse all ranking categories on Magi BD." },
    ],
  }),
  component: CategoriesPage,
});

function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="mx-auto max-w-7xl px-4 py-12">
        <h1 className="font-display text-3xl font-bold text-foreground">All Categories</h1>
        <p className="mt-2 text-muted-foreground">Browse rankings by category</p>

        {loading ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-28 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : categories.length > 0 ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to="/category/$slug"
                params={{ slug: cat.slug }}
                className="group flex items-start gap-4 rounded-lg border border-border bg-card p-5 transition-all hover:border-gold/40 hover:shadow-md"
              >
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-gold/10 text-gold">
                  <Award className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="font-display text-lg font-semibold text-foreground group-hover:text-gold transition-colors">{cat.name}</h2>
                  {cat.description && (
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{cat.description}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="mt-8 text-center text-muted-foreground">No categories yet.</p>
        )}
      </div>
      <SiteFooter />
    </div>
  );
}
