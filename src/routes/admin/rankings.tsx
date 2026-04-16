import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getRankingLists, getCategories, getPeople, getRankingEntries, generateSlug } from "@/lib/supabase-helpers";
import { Plus, Pencil, Trash2, GripVertical } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Category = Database["public"]["Tables"]["categories"]["Row"];
type Person = Database["public"]["Tables"]["people"]["Row"];
type RankingList = Database["public"]["Tables"]["ranking_lists"]["Row"] & { categories: Category | null };
type RankingEntry = Database["public"]["Tables"]["ranking_entries"]["Row"] & { people: Person };

export const Route = createFileRoute("/admin/rankings")({
  component: AdminRankings,
});

function AdminRankings() {
  const [lists, setLists] = useState<RankingList[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [showListForm, setShowListForm] = useState(false);
  const [editingList, setEditingList] = useState<RankingList | null>(null);
  const [selectedList, setSelectedList] = useState<RankingList | null>(null);
  const [entries, setEntries] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const [listForm, setListForm] = useState({
    title: "", category_id: "", list_size: 10, description: "", is_featured: false,
  });
  const [entryForm, setEntryForm] = useState({ person_id: "", rank_position: 1, score: "" });
  const [showEntryForm, setShowEntryForm] = useState(false);

  const loadData = async () => {
    const [l, c, p] = await Promise.all([getRankingLists(), getCategories(), getPeople()]);
    setLists(l as RankingList[]);
    setCategories(c);
    setPeople(p as Person[]);
  };

  useEffect(() => { loadData(); }, []);

  const loadEntries = async (list: RankingList) => {
    setSelectedList(list);
    const data = await getRankingEntries(list.id);
    setEntries(data as RankingEntry[]);
  };

  // List CRUD
  const resetListForm = () => {
    setListForm({ title: "", category_id: "", list_size: 10, description: "", is_featured: false });
    setEditingList(null);
    setShowListForm(false);
  };

  const handleEditList = (list: RankingList) => {
    setEditingList(list);
    setListForm({
      title: list.title,
      category_id: list.category_id,
      list_size: list.list_size,
      description: list.description || "",
      is_featured: list.is_featured,
    });
    setShowListForm(true);
  };

  const handleSubmitList = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = {
        title: listForm.title,
        slug: generateSlug(listForm.title),
        category_id: listForm.category_id,
        list_size: listForm.list_size,
        description: listForm.description || null,
        is_featured: listForm.is_featured,
      };
      if (editingList) {
        await supabase.from("ranking_lists").update(data).eq("id", editingList.id);
      } else {
        await supabase.from("ranking_lists").insert(data);
      }
      resetListForm();
      loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteList = async (id: string) => {
    if (!confirm("Delete this ranking list?")) return;
    await supabase.from("ranking_lists").delete().eq("id", id);
    if (selectedList?.id === id) {
      setSelectedList(null);
      setEntries([]);
    }
    loadData();
  };

  // Entry CRUD
  const handleAddEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedList) return;
    setLoading(true);
    try {
      await supabase.from("ranking_entries").insert({
        ranking_list_id: selectedList.id,
        person_id: entryForm.person_id,
        rank_position: entryForm.rank_position,
        score: entryForm.score ? parseFloat(entryForm.score) : null,
      });
      setEntryForm({ person_id: "", rank_position: entries.length + 2, score: "" });
      setShowEntryForm(false);
      loadEntries(selectedList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEntry = async (id: string) => {
    if (!selectedList) return;
    await supabase.from("ranking_entries").delete().eq("id", id);
    loadEntries(selectedList);
  };

  const moveEntry = async (entryId: string, direction: "up" | "down") => {
    if (!selectedList) return;
    const idx = entries.findIndex((e) => e.id === entryId);
    if (idx === -1) return;
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= entries.length) return;

    const a = entries[idx];
    const b = entries[swapIdx];

    await Promise.all([
      supabase.from("ranking_entries").update({ rank_position: b.rank_position }).eq("id", a.id),
      supabase.from("ranking_entries").update({ rank_position: a.rank_position }).eq("id", b.id),
    ]);
    loadEntries(selectedList);
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Rankings</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage ranking lists and entries</p>
        </div>
        <button
          onClick={() => { resetListForm(); setShowListForm(true); }}
          className="inline-flex items-center gap-1.5 rounded-md bg-navy px-4 py-2 text-sm font-medium text-navy-foreground hover:bg-navy-light"
        >
          <Plus className="h-4 w-4" /> New List
        </button>
      </div>

      {/* List Form */}
      {showListForm && (
        <form onSubmit={handleSubmitList} className="mt-6 rounded-lg border border-border bg-card p-5">
          <h2 className="mb-4 font-display text-lg font-semibold">{editingList ? "Edit" : "Create"} Ranking List</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Title *</label>
              <input value={listForm.title} onChange={(e) => setListForm({ ...listForm, title: e.target.value })} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm" required />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Category *</label>
              <select value={listForm.category_id} onChange={(e) => setListForm({ ...listForm, category_id: e.target.value })} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm" required>
                <option value="">Select...</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">List Size</label>
              <select value={listForm.list_size} onChange={(e) => setListForm({ ...listForm, list_size: parseInt(e.target.value) })} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                <option value={10}>Top 10</option>
                <option value={50}>Top 50</option>
                <option value={100}>Top 100</option>
              </select>
            </div>
            <div className="flex items-end gap-2">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={listForm.is_featured} onChange={(e) => setListForm({ ...listForm, is_featured: e.target.checked })} />
                Featured on homepage
              </label>
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium">Description</label>
              <textarea value={listForm.description} onChange={(e) => setListForm({ ...listForm, description: e.target.value })} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" rows={2} />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button type="submit" disabled={loading} className="rounded-md bg-navy px-4 py-2 text-sm font-medium text-navy-foreground hover:bg-navy-light disabled:opacity-50">
              {loading ? "Saving..." : editingList ? "Update" : "Create"}
            </button>
            <button type="button" onClick={resetListForm} className="rounded-md border border-input px-4 py-2 text-sm">Cancel</button>
          </div>
        </form>
      )}

      {/* Lists table */}
      <div className="mt-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="pb-2 font-medium text-muted-foreground">Title</th>
              <th className="pb-2 font-medium text-muted-foreground">Category</th>
              <th className="pb-2 font-medium text-muted-foreground">Size</th>
              <th className="pb-2 font-medium text-muted-foreground">Featured</th>
              <th className="pb-2 text-right font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {lists.map((list) => (
              <tr key={list.id} className={`border-b border-border cursor-pointer ${selectedList?.id === list.id ? "bg-accent" : "hover:bg-accent/50"}`} onClick={() => loadEntries(list)}>
                <td className="py-3 font-medium">{list.title}</td>
                <td className="py-3 text-muted-foreground">{list.categories?.name}</td>
                <td className="py-3 text-muted-foreground">Top {list.list_size}</td>
                <td className="py-3">{list.is_featured ? <span className="text-gold">★</span> : "—"}</td>
                <td className="py-3 text-right">
                  <button onClick={(e) => { e.stopPropagation(); handleEditList(list); }} className="mr-2 text-muted-foreground hover:text-foreground">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); handleDeleteList(list.id); }} className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {lists.length === 0 && <p className="mt-4 text-center text-muted-foreground">No ranking lists yet.</p>}
      </div>

      {/* Entries panel */}
      {selectedList && (
        <div className="mt-8 rounded-lg border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">
              {selectedList.title} — Entries
            </h2>
            <button
              onClick={() => { setEntryForm({ person_id: "", rank_position: entries.length + 1, score: "" }); setShowEntryForm(true); }}
              className="inline-flex items-center gap-1.5 rounded-md bg-gold px-3 py-1.5 text-xs font-medium text-gold-foreground hover:bg-gold/90"
            >
              <Plus className="h-3.5 w-3.5" /> Add Entry
            </button>
          </div>

          {showEntryForm && (
            <form onSubmit={handleAddEntry} className="mt-4 flex flex-wrap items-end gap-3 rounded-md bg-surface p-4">
              <div>
                <label className="mb-1 block text-xs font-medium">Person *</label>
                <select value={entryForm.person_id} onChange={(e) => setEntryForm({ ...entryForm, person_id: e.target.value })} className="h-9 w-48 rounded-md border border-input bg-background px-2 text-sm" required>
                  <option value="">Select...</option>
                  {people.map((p) => <option key={p.id} value={p.id}>{p.full_name}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium">Rank #</label>
                <input type="number" min={1} value={entryForm.rank_position} onChange={(e) => setEntryForm({ ...entryForm, rank_position: parseInt(e.target.value) || 1 })} className="h-9 w-20 rounded-md border border-input bg-background px-2 text-sm" required />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium">Score</label>
                <input type="number" step="0.01" value={entryForm.score} onChange={(e) => setEntryForm({ ...entryForm, score: e.target.value })} className="h-9 w-24 rounded-md border border-input bg-background px-2 text-sm" />
              </div>
              <button type="submit" disabled={loading} className="h-9 rounded-md bg-navy px-4 text-xs font-medium text-navy-foreground">Add</button>
              <button type="button" onClick={() => setShowEntryForm(false)} className="h-9 rounded-md border border-input px-4 text-xs">Cancel</button>
            </form>
          )}

          <div className="mt-4 space-y-1">
            {entries.map((entry) => (
              <div key={entry.id} className="flex items-center gap-3 rounded-md border border-border bg-background px-3 py-2">
                <GripVertical className="h-4 w-4 text-muted-foreground" />
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-navy text-xs font-bold text-navy-foreground">
                  #{entry.rank_position}
                </span>
                <span className="flex-1 text-sm font-medium">{entry.people.full_name}</span>
                {entry.score && <span className="text-xs text-gold">Score: {entry.score}</span>}
                <div className="flex gap-1">
                  <button onClick={() => moveEntry(entry.id, "up")} className="rounded px-1 py-0.5 text-xs text-muted-foreground hover:bg-accent">↑</button>
                  <button onClick={() => moveEntry(entry.id, "down")} className="rounded px-1 py-0.5 text-xs text-muted-foreground hover:bg-accent">↓</button>
                  <button onClick={() => handleDeleteEntry(entry.id)} className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
            {entries.length === 0 && <p className="py-4 text-center text-sm text-muted-foreground">No entries yet. Add people to this list.</p>}
          </div>
        </div>
      )}
    </div>
  );
}
