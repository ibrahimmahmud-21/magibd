import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { useEffect, useState } from "react";
import { getRankingListBySlug, getRankingEntries } from "@/lib/supabase-helpers";
import { PersonCard } from "@/components/PersonCard";
import type { Database } from "@/integrations/supabase/types";

type Category = Database["public"]["Tables"]["categories"]["Row"];
type RankingList = Database["public"]["Tables"]["ranking_lists"]["Row"] & { categories: Category | null };
type RankingEntry = Database["public"]["Tables"]["ranking_entries"]["Row"] & { people: Database["public"]["Tables"]["people"]["Row"] };

export const Route = createFileRoute("/list/$slug")({
  component: ListPage,
});

function ListPage() {
  const { slug } = Route.useParams();
  const [list, setList] = useState<RankingList | null>(null);
  const [entries, setEntries] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const listData = await getRankingListBySlug(slug);
        setList(listData as RankingList);
        const entriesData = await getRankingEntries(listData.id);
        setEntries(entriesData as RankingEntry[]);
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
          <div className="h-8 w-64 animate-pulse rounded bg-muted" />
          <div className="mt-8 grid gap-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!list) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <div className="mx-auto max-w-7xl px-4 py-12 text-center">
          <h1 className="font-display text-2xl font-bold">List not found</h1>
          <Link to="/rankings" className="mt-4 inline-block text-gold hover:underline">Back to rankings</Link>
        </div>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="bg-navy px-4 py-12 text-center">
        <div className="mb-2 text-xs font-medium uppercase tracking-wider text-gold">
          {list.categories?.name} • Top {list.list_size}
        </div>
        <h1 className="font-display text-3xl font-bold text-navy-foreground">{list.title}</h1>
        {list.description && (
          <p className="mx-auto mt-2 max-w-xl text-navy-foreground/70">{list.description}</p>
        )}
      </div>
      <div className="mx-auto max-w-3xl px-4 py-8">
        {entries.length > 0 ? (
          <div className="grid gap-3">
            {entries.map((entry) => (
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
        ) : (
          <p className="text-center text-muted-foreground py-8">No entries in this list yet.</p>
        )}
      </div>
      <SiteFooter />
    </div>
  );
}
