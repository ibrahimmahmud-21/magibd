import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { useEffect, useState } from "react";
import { searchPeople } from "@/lib/supabase-helpers";
import { PersonCard } from "@/components/PersonCard";
import { Search } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Person = Database["public"]["Tables"]["people"]["Row"];

export const Route = createFileRoute("/search")({
  validateSearch: (search) => ({
    q: (search.q as string) || "",
  }),
  component: SearchPage,
});

function SearchPage() {
  const { q } = Route.useSearch();
  const [results, setResults] = useState<Person[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState(q);
  const navigate = Route.useNavigate();

  useEffect(() => {
    if (q) {
      setLoading(true);
      searchPeople(q)
        .then((data) => setResults(data))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [q]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate({ search: { q: query.trim() } });
    }
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="font-display text-3xl font-bold text-foreground">Search</h1>
        <form onSubmit={handleSearch} className="mt-6 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search people by name..."
              className="h-11 w-full rounded-md border border-input bg-background pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <button
            type="submit"
            className="rounded-md bg-navy px-5 text-sm font-medium text-navy-foreground hover:bg-navy-light"
          >
            Search
          </button>
        </form>

        <div className="mt-8">
          {loading ? (
            <div className="grid gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
          ) : q && results.length > 0 ? (
            <div className="grid gap-3">
              {results.map((person) => (
                <PersonCard
                  key={person.id}
                  slug={person.slug}
                  fullName={person.full_name}
                  photoUrl={person.photo_url}
                  shortBio={person.short_bio}
                  country={person.country}
                />
              ))}
            </div>
          ) : q ? (
            <p className="text-center text-muted-foreground">No results found for "{q}"</p>
          ) : null}
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
