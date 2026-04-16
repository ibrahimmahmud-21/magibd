import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getDashboardStats } from "@/lib/supabase-helpers";
import { Users, FolderOpen, List } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const [stats, setStats] = useState({ totalPeople: 0, totalCategories: 0, totalLists: 0 });

  useEffect(() => {
    getDashboardStats().then(setStats).catch(console.error);
  }, []);

  const cards = [
    { label: "Total People", value: stats.totalPeople, icon: Users, color: "bg-blue-500/10 text-blue-600" },
    { label: "Total Categories", value: stats.totalCategories, icon: FolderOpen, color: "bg-amber-500/10 text-amber-600" },
    { label: "Total Lists", value: stats.totalLists, icon: List, color: "bg-emerald-500/10 text-emerald-600" },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-foreground">Dashboard</h1>
      <p className="mt-1 text-sm text-muted-foreground">Overview of your ranking platform</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {cards.map((card) => (
          <div key={card.label} className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${card.color}`}>
                <card.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{card.value}</p>
                <p className="text-xs text-muted-foreground">{card.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
