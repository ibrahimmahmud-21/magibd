import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { isAdminAuthenticated, adminLogout } from "@/lib/admin-auth";
import { useEffect, useState } from "react";
import { LayoutDashboard, Users, FolderOpen, List, LogOut, Home } from "lucide-react";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const navigate = useNavigate();
  const [authed, setAuthed] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!isAdminAuthenticated()) {
      navigate({ to: "/admin/login" });
    } else {
      setAuthed(true);
    }
    setChecked(true);
  }, [navigate]);

  if (!checked || !authed) return null;

  const handleLogout = () => {
    adminLogout();
    navigate({ to: "/admin/login" });
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 w-56 border-r border-border bg-card">
        <div className="flex h-14 items-center border-b border-border px-4">
          <span className="font-display text-lg font-bold text-navy">
            Magi <span className="text-gold">BD</span>
          </span>
          <span className="ml-2 rounded bg-navy/10 px-1.5 py-0.5 text-[10px] font-medium text-navy">Admin</span>
        </div>
        <nav className="flex flex-col gap-1 p-3">
          <Link
            to="/admin"
            activeOptions={{ exact: true }}
            className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
            activeProps={{ className: "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm bg-accent text-foreground font-medium" }}
          >
            <LayoutDashboard className="h-4 w-4" /> Dashboard
          </Link>
          <Link
            to="/admin/categories"
            className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
            activeProps={{ className: "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm bg-accent text-foreground font-medium" }}
          >
            <FolderOpen className="h-4 w-4" /> Categories
          </Link>
          <Link
            to="/admin/people"
            className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
            activeProps={{ className: "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm bg-accent text-foreground font-medium" }}
          >
            <Users className="h-4 w-4" /> People
          </Link>
          <Link
            to="/admin/rankings"
            className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
            activeProps={{ className: "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm bg-accent text-foreground font-medium" }}
          >
            <List className="h-4 w-4" /> Rankings
          </Link>
        </nav>
        <div className="absolute bottom-0 left-0 right-0 border-t border-border p-3">
          <Link to="/" className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground">
            <Home className="h-4 w-4" /> View Site
          </Link>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-destructive hover:bg-destructive/10"
          >
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-56 flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}
