import { Link, useNavigate } from "@tanstack/react-router";
import { Search, Menu, X } from "lucide-react";
import { useState } from "react";

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate({ to: "/search", search: { q: searchQuery.trim() } });
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="font-display text-2xl font-bold tracking-tight text-navy">
            Magi <span className="text-gold">BD</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 md:flex">
          <Link to="/" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground" activeProps={{ className: "text-sm font-medium text-foreground" }}>
            Home
          </Link>
          <Link to="/categories" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground" activeProps={{ className: "text-sm font-medium text-foreground" }}>
            Categories
          </Link>
          <Link to="/rankings" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground" activeProps={{ className: "text-sm font-medium text-foreground" }}>
            Rankings
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {searchOpen ? (
            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search people..."
                className="h-9 w-48 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                autoFocus
              />
              <button type="button" onClick={() => setSearchOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </form>
          ) : (
            <button onClick={() => setSearchOpen(true)} className="text-muted-foreground hover:text-foreground">
              <Search className="h-5 w-5" />
            </button>
          )}

          <button onClick={() => setMenuOpen(!menuOpen)} className="text-muted-foreground hover:text-foreground md:hidden">
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t border-border bg-card px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-3">
            <Link to="/" className="text-sm font-medium text-foreground" onClick={() => setMenuOpen(false)}>Home</Link>
            <Link to="/categories" className="text-sm font-medium text-foreground" onClick={() => setMenuOpen(false)}>Categories</Link>
            <Link to="/rankings" className="text-sm font-medium text-foreground" onClick={() => setMenuOpen(false)}>Rankings</Link>
          </nav>
        </div>
      )}
    </header>
  );
}
