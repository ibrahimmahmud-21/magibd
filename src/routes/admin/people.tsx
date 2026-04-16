import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getPeople, getCategories, generateSlug, uploadProfilePhoto } from "@/lib/supabase-helpers";
import { Plus, Pencil, Trash2, User, Search } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Category = Database["public"]["Tables"]["categories"]["Row"];
type Person = Database["public"]["Tables"]["people"]["Row"] & {
  people_categories: Array<{ category_id: string; categories: Category | null }>;
};

export const Route = createFileRoute("/admin/people")({
  component: AdminPeople,
});

function AdminPeople() {
  const [people, setPeople] = useState<Person[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Person | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    short_bio: "",
    full_description: "",
    country: "",
    age: "",
    achievements: "",
    photo_url: "",
    category_ids: [] as string[],
  });

  const loadData = async () => {
    const [p, c] = await Promise.all([getPeople(), getCategories()]);
    setPeople(p as Person[]);
    setCategories(c);
  };

  useEffect(() => { loadData(); }, []);

  const resetForm = () => {
    setForm({ full_name: "", short_bio: "", full_description: "", country: "", age: "", achievements: "", photo_url: "", category_ids: [] });
    setEditing(null);
    setShowForm(false);
  };

  const handleEdit = (person: Person) => {
    setEditing(person);
    setForm({
      full_name: person.full_name,
      short_bio: person.short_bio || "",
      full_description: person.full_description || "",
      country: person.country || "",
      age: person.age?.toString() || "",
      achievements: (person.achievements || []).join("\n"),
      photo_url: person.photo_url || "",
      category_ids: person.people_categories.map((pc) => pc.category_id),
    });
    setShowForm(true);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadProfilePhoto(file);
      setForm({ ...form, photo_url: url });
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const personData = {
        full_name: form.full_name,
        slug: generateSlug(form.full_name),
        short_bio: form.short_bio || null,
        full_description: form.full_description || null,
        country: form.country || null,
        age: form.age ? parseInt(form.age) : null,
        achievements: form.achievements ? form.achievements.split("\n").filter(Boolean) : [],
        photo_url: form.photo_url || null,
      };

      let personId: string;
      if (editing) {
        await supabase.from("people").update(personData).eq("id", editing.id);
        personId = editing.id;
        // Remove old category links
        await supabase.from("people_categories").delete().eq("person_id", personId);
      } else {
        const { data } = await supabase.from("people").insert(personData).select("id").single();
        personId = data!.id;
      }

      // Insert category links
      if (form.category_ids.length > 0) {
        await supabase.from("people_categories").insert(
          form.category_ids.map((catId) => ({ person_id: personId, category_id: catId }))
        );
      }

      resetForm();
      loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this person?")) return;
    await supabase.from("people").delete().eq("id", id);
    loadData();
  };

  const toggleCategory = (catId: string) => {
    setForm((prev) => ({
      ...prev,
      category_ids: prev.category_ids.includes(catId)
        ? prev.category_ids.filter((id) => id !== catId)
        : [...prev.category_ids, catId],
    }));
  };

  const filtered = people.filter((p) =>
    p.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">People</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage profiles</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="inline-flex items-center gap-1.5 rounded-md bg-navy px-4 py-2 text-sm font-medium text-navy-foreground hover:bg-navy-light"
        >
          <Plus className="h-4 w-4" /> Add Person
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mt-6 rounded-lg border border-border bg-card p-5">
          <h2 className="mb-4 font-display text-lg font-semibold">{editing ? "Edit" : "Add"} Person</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Full Name *</label>
              <input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm" required />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Country</label>
              <input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Age</label>
              <input type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Photo</label>
              <input type="file" accept="image/*" onChange={handlePhotoUpload} className="text-sm" />
              {form.photo_url && <img src={form.photo_url} alt="" className="mt-2 h-16 w-16 rounded-md object-cover" />}
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium">Short Bio</label>
              <input value={form.short_bio} onChange={(e) => setForm({ ...form, short_bio: e.target.value })} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm" />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium">Full Description</label>
              <textarea value={form.full_description} onChange={(e) => setForm({ ...form, full_description: e.target.value })} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" rows={4} />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium">Achievements (one per line)</label>
              <textarea value={form.achievements} onChange={(e) => setForm({ ...form, achievements: e.target.value })} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" rows={3} />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium">Categories</label>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleCategory(cat.id)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                      form.category_ids.includes(cat.id)
                        ? "bg-gold text-gold-foreground"
                        : "bg-muted text-muted-foreground hover:bg-accent"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
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

      {/* Search */}
      <div className="mt-6 relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search people..."
          className="h-9 w-full max-w-xs rounded-md border border-input bg-background pl-9 pr-3 text-sm"
        />
      </div>

      {/* Table */}
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="pb-2 font-medium text-muted-foreground">Photo</th>
              <th className="pb-2 font-medium text-muted-foreground">Name</th>
              <th className="pb-2 font-medium text-muted-foreground">Country</th>
              <th className="pb-2 font-medium text-muted-foreground">Categories</th>
              <th className="pb-2 text-right font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((person) => (
              <tr key={person.id} className="border-b border-border">
                <td className="py-2">
                  {person.photo_url ? (
                    <img src={person.photo_url} alt="" className="h-8 w-8 rounded object-cover" />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded bg-muted">
                      <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                </td>
                <td className="py-2 font-medium">{person.full_name}</td>
                <td className="py-2 text-muted-foreground">{person.country || "—"}</td>
                <td className="py-2">
                  <div className="flex flex-wrap gap-1">
                    {person.people_categories.map((pc) =>
                      pc.categories ? (
                        <span key={pc.category_id} className="rounded bg-gold/10 px-1.5 py-0.5 text-[10px] text-gold">
                          {pc.categories.name}
                        </span>
                      ) : null
                    )}
                  </div>
                </td>
                <td className="py-2 text-right">
                  <button onClick={() => handleEdit(person)} className="mr-2 text-muted-foreground hover:text-foreground">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDelete(person.id)} className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="mt-4 text-center text-muted-foreground">No people found.</p>}
      </div>
    </div>
  );
}
