import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { useEffect, useState } from "react";
import { getPersonBySlug, getPersonRankings } from "@/lib/supabase-helpers";
import { RankBadge } from "@/components/RankBadge";
import { User, MapPin, Calendar, Trophy } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Person = Database["public"]["Tables"]["people"]["Row"] & {
  people_categories: Array<{ category_id: string; categories: Database["public"]["Tables"]["categories"]["Row"] | null }>;
};
type PersonRanking = Database["public"]["Tables"]["ranking_entries"]["Row"] & {
  ranking_lists: Database["public"]["Tables"]["ranking_lists"]["Row"] & {
    categories: Database["public"]["Tables"]["categories"]["Row"] | null;
  };
};

export const Route = createFileRoute("/person/$slug")({
  component: PersonPage,
});

function PersonPage() {
  const { slug } = Route.useParams();
  const [person, setPerson] = useState<Person | null>(null);
  const [rankings, setRankings] = useState<PersonRanking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const personData = await getPersonBySlug(slug);
        setPerson(personData as Person);
        const rankingsData = await getPersonRankings(personData.id);
        setRankings(rankingsData as PersonRanking[]);
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
        <div className="mx-auto max-w-4xl px-4 py-12">
          <div className="h-64 animate-pulse rounded-lg bg-muted" />
        </div>
      </div>
    );
  }

  if (!person) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <div className="mx-auto max-w-7xl px-4 py-12 text-center">
          <h1 className="font-display text-2xl font-bold">Person not found</h1>
          <Link to="/" className="mt-4 inline-block text-gold hover:underline">Go home</Link>
        </div>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <div className="mx-auto max-w-4xl px-4 py-12">
        {/* Profile header */}
        <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
          {person.photo_url ? (
            <img
              src={person.photo_url}
              alt={person.full_name}
              className="h-40 w-40 rounded-xl object-cover shadow-lg"
            />
          ) : (
            <div className="flex h-40 w-40 items-center justify-center rounded-xl bg-muted">
              <User className="h-16 w-16 text-muted-foreground" />
            </div>
          )}
          <div className="text-center md:text-left">
            <h1 className="font-display text-3xl font-bold text-foreground">{person.full_name}</h1>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-3 md:justify-start">
              {person.country && (
                <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" /> {person.country}
                </span>
              )}
              {person.age && (
                <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" /> Age {person.age}
                </span>
              )}
            </div>
            {person.short_bio && (
              <p className="mt-3 text-muted-foreground">{person.short_bio}</p>
            )}
            {/* Categories */}
            {person.people_categories.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {person.people_categories.map((pc) =>
                  pc.categories ? (
                    <Link
                      key={pc.category_id}
                      to="/category/$slug"
                      params={{ slug: pc.categories.slug }}
                      className="rounded-full bg-gold/10 px-3 py-1 text-xs font-medium text-gold hover:bg-gold/20"
                    >
                      {pc.categories.name}
                    </Link>
                  ) : null
                )}
              </div>
            )}
          </div>
        </div>

        {/* Rankings */}
        {rankings.length > 0 && (
          <div className="mt-10">
            <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-bold text-foreground">
              <Trophy className="h-5 w-5 text-gold" /> Rankings
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {rankings.map((r) => (
                <Link
                  key={r.id}
                  to="/list/$slug"
                  params={{ slug: r.ranking_lists.slug }}
                  className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 transition-all hover:border-gold/40"
                >
                  <RankBadge rank={r.rank_position} />
                  <div>
                    <p className="text-sm font-semibold text-foreground">{r.ranking_lists.title}</p>
                    <p className="text-xs text-muted-foreground">{r.ranking_lists.categories?.name}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Full Description */}
        {person.full_description && (
          <div className="mt-10">
            <h2 className="mb-4 font-display text-xl font-bold text-foreground">Biography</h2>
            <div className="prose prose-sm max-w-none text-muted-foreground">
              <p className="whitespace-pre-wrap">{person.full_description}</p>
            </div>
          </div>
        )}

        {/* Achievements */}
        {person.achievements && person.achievements.length > 0 && (
          <div className="mt-10">
            <h2 className="mb-4 font-display text-xl font-bold text-foreground">Achievements</h2>
            <ul className="grid gap-2">
              {person.achievements.map((ach, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gold" />
                  {ach}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <SiteFooter />
    </div>
  );
}
