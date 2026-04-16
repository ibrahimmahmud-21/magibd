import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { useEffect, useState } from "react";
import { getFeaturedRankingLists, getCategories, getRankingEntries } from "@/lib/supabase-helpers";
import { PersonCard } from "@/components/PersonCard";
import { ArrowRight, Award, TrendingUp, Crown } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Category = Database["public"]["Tables"]["categories"]["Row"];
type RankingList = Database["public"]["Tables"]["ranking_lists"]["Row"] & { categories: Category | null };
type RankingEntry = Database["public"]["Tables"]["ranking_entries"]["Row"] & { people: Database["public"]["Tables"]["people"]["Row"] };

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const [featuredLists, setFeaturedLists] = useState<RankingList[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [topEntries, setTopEntries] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [lists, cats] = await Promise.all([
          getFeaturedRankingLists(),
          getCategories(),
        ]);
        setFeaturedLists(lists as RankingList[]);
        setCategories(cats);

        // Get entries from first featured list
        if (lists.length > 0) {
          const entries = await getRankingEntries(lists[0].id);
          setTopEntries((entries as RankingEntry[]).slice(0, 5));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="min-h-screen">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden bg-navy px-4 py-20 text-center md:py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-navy-light/20 to-transparent" />
        <div className="relative mx-auto max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-gold/20 px-4 py-1.5 text-xs font-medium text-gold">
            <Crown className="h-3.5 w-3.5" />
            Prestigious Rankings
          </div>
          <h1 className="font-display text-4xl font-bold leading-tight text-navy-foreground md:text-6xl">
            The Definitive Guide to <span className="text-gold">Influence & Excellence</span>
          </h1>
          <p className="mt-4 text-base text-navy-foreground/70 md:text-lg">
            Discover and explore rankings of the most influential and notable people across industries, curated with precision and authority.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              to="/rankings"
              className="inline-flex items-center gap-2 rounded-md bg-gold px-6 py-3 text-sm font-semibold text-gold-foreground transition-colors hover:bg-gold/90"
            >
              Explore Rankings <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/categories"
              className="inline-flex items-center gap-2 rounded-md border border-navy-foreground/20 px-6 py-3 text-sm font-medium text-navy-foreground transition-colors hover:bg-navy-foreground/5"
            >
              Browse Categories
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground">Categories</h2>
            <p className="mt-1 text-sm text-muted-foreground">Explore rankings by category</p>
          </div>
          <Link to="/categories" className="text-sm font-medium text-gold hover:underline">
            View all →
          </Link>
        </div>
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : categories.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.slice(0, 8).map((cat) => (
              <Link
                key={cat.id}
                to="/category/$slug"
                params={{ slug: cat.slug }}
                className="group flex items-center gap-3 rounded-lg border border-border bg-card p-4 transition-all hover:border-gold/40 hover:shadow-md"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gold/10 text-gold">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-display text-sm font-semibold text-foreground group-hover:text-gold transition-colors">{cat.name}</h3>
                  {cat.description && (
                    <p className="text-xs text-muted-foreground line-clamp-1">{cat.description}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">No categories yet. Add some in the admin panel.</p>
        )}
      </section>

      {/* Featured Rankings */}
      {featuredLists.length > 0 && (
        <section className="bg-surface px-4 py-16">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <div className="mb-2 inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-gold">
                  <TrendingUp className="h-3.5 w-3.5" />
                  Featured
                </div>
                <h2 className="font-display text-2xl font-bold text-foreground">Trending Rankings</h2>
              </div>
              <Link to="/rankings" className="text-sm font-medium text-gold hover:underline">
                View all →
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {featuredLists.map((list) => (
                <Link
                  key={list.id}
                  to="/list/$slug"
                  params={{ slug: list.slug }}
                  className="group rounded-lg border border-border bg-card p-6 transition-all hover:border-gold/40 hover:shadow-md"
                >
                  <div className="mb-2 text-xs font-medium text-gold">
                    {list.categories?.name} • Top {list.list_size}
                  </div>
                  <h3 className="font-display text-lg font-bold text-foreground group-hover:text-gold transition-colors">
                    {list.title}
                  </h3>
                  {list.description && (
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{list.description}</p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Top Ranked */}
      {topEntries.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16">
          <h2 className="mb-8 font-display text-2xl font-bold text-foreground">Top Ranked</h2>
          <div className="grid gap-3">
            {topEntries.map((entry) => (
              <PersonCard
                key={entry.id}
                slug={entry.people.slug}
                fullName={entry.people.full_name}
                photoUrl={entry.people.photo_url}
                shortBio={entry.people.short_bio}
                rank={entry.rank_position}
                score={entry.score ? Number(entry.score) : null}
                country={entry.people.country}
              />
            ))}
          </div>
        </section>
      )}

      <SiteFooter />
    </div>
  );
}
