import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getCategories, generateSlug } from "@/lib/supabase-helpers";
import { Plus, Pencil, Trash2 } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Category = Database["public"]["Tables"]["categories"]["Row"];

export const Route = createFileRoute("/admin/categories")({
  component: AdminCategories,
});

function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [editing, setEditing] = useState<Category | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", display_order: 0 });
  const [loading, setLoading] = useState(false);

  const loadData = () => {
    getCategories().then(setCategories).catch(console.error);
  };

  useEffect(() => { loadData(); }, []);

  const resetForm = () => {
    setForm({ name: "", description: "", display_order: 0 });
    setEditing(null);
    setShowForm(false);
  };

  const handleEdit = (cat: Category) => {
    setEditing(cat);
    setForm({ name: cat.name, description: cat.description || "", display_order: cat.display_order });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editing) {
        await supabase
          .from("categories")
          .update({ name: form.name, slug: generateSlug(form.name), description: form.description || null, display_order: form.display_order })
          .eq("id", editing.id);
      } else {
        await supabase
          .from("categories")
          .insert({ name: form.name, slug: generateSlug(form.name), description: form.description || null, display_order: form.display_order });
      }
      resetForm();
      loadData();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this category?")) return;
    await supabase.from("categories").delete().eq("id", id);
    loadData();
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Categories</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage ranking categories</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="inline-flex items-center gap-1.5 rounded-md bg-navy px-4 py-2 text-sm font-medium text-navy-foreground hover:bg-navy-light"
        >
          <Plus className="h-4 w-4" /> Add Category
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mt-6 rounded-lg border border-border bg-card p-5">
          <h2 className="mb-4 font-display text-lg font-semibold">{editing ? "Edit" : "Add"} Category</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Display Order</label>
              <input
                type="number"
                value={form.display_order}
                onChange={(e) => setForm({ ...form, display_order: parseInt(e.target.value) || 0 })}
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                rows={2}
              />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button type="submit" disabled={loading} className="rounded-md bg-navy px-4 py-2 text-sm font-medium text-navy-foreground hover:bg-navy-light disabled:opacity-50">
              {loading ? "Saving..." : editing ? "Update" : "Create"}
            </button>
            <button type="button" onClick={resetForm} className="rounded-md border border-input px-4 py-2 text-sm">Cancel</button>
          </div>
        </form>
      )}

      <div className="mt-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="pb-2 font-medium text-muted-foreground">Name</th>
              <th className="pb-2 font-medium text-muted-foreground">Slug</th>
              <th className="pb-2 font-medium text-muted-foreground">Order</th>
              <th className="pb-2 text-right font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat.id} className="border-b border-border">
                <td className="py-3 font-medium">{cat.name}</td>
                <td className="py-3 text-muted-foreground">{cat.slug}</td>
                <td className="py-3 text-muted-foreground">{cat.display_order}</td>
                <td className="py-3 text-right">
                  <button onClick={() => handleEdit(cat)} className="mr-2 text-muted-foreground hover:text-foreground">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDelete(cat.id)} className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {categories.length === 0 && <p className="mt-4 text-center text-muted-foreground">No categories yet.</p>}
      </div>
    </div>
  );
}
