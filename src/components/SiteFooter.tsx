import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-navy text-navy-foreground">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <span className="font-display text-2xl font-bold">
              Magi <span className="text-gold">BD</span>
            </span>
            <p className="mt-3 text-sm text-navy-foreground/70">
              The definitive ranking platform for influential and notable people across various categories.
            </p>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gold">Quick Links</h4>
            <nav className="flex flex-col gap-2">
              <Link to="/" className="text-sm text-navy-foreground/70 hover:text-navy-foreground">Home</Link>
              <Link to="/categories" className="text-sm text-navy-foreground/70 hover:text-navy-foreground">Categories</Link>
              <Link to="/rankings" className="text-sm text-navy-foreground/70 hover:text-navy-foreground">Rankings</Link>
            </nav>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gold">About</h4>
            <p className="text-sm text-navy-foreground/70">
              Magi BD curates and ranks the most influential people across industries, celebrating excellence and achievement.
            </p>
          </div>
        </div>
        <div className="mt-8 border-t border-navy-foreground/10 pt-6 text-center text-xs text-navy-foreground/50">
          © {new Date().getFullYear()} Magi BD. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
