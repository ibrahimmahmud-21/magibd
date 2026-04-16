import { supabase } from "@/integrations/supabase/client";

// Helper to generate slug from text
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Categories
export async function getCategories() {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("display_order", { ascending: true });
  if (error) throw error;
  return data;
}

export async function getCategoryBySlug(slug: string) {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .single();
  if (error) throw error;
  return data;
}

// People
export async function getPeople() {
  const { data, error } = await supabase
    .from("people")
    .select("*, people_categories(category_id, categories(*))")
    .order("full_name");
  if (error) throw error;
  return data;
}

export async function getPersonBySlug(slug: string) {
  const { data, error } = await supabase
    .from("people")
    .select("*, people_categories(category_id, categories(*))")
    .eq("slug", slug)
    .single();
  if (error) throw error;
  return data;
}

export async function searchPeople(query: string) {
  const { data, error } = await supabase
    .from("people")
    .select("*, people_categories(category_id, categories(*))")
    .ilike("full_name", `%${query}%`)
    .limit(20);
  if (error) throw error;
  return data;
}

// Ranking Lists
export async function getRankingLists() {
  const { data, error } = await supabase
    .from("ranking_lists")
    .select("*, categories(*)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getFeaturedRankingLists() {
  const { data, error } = await supabase
    .from("ranking_lists")
    .select("*, categories(*)")
    .eq("is_featured", true)
    .order("created_at", { ascending: false })
    .limit(6);
  if (error) throw error;
  return data;
}

export async function getRankingListBySlug(slug: string) {
  const { data, error } = await supabase
    .from("ranking_lists")
    .select("*, categories(*)")
    .eq("slug", slug)
    .single();
  if (error) throw error;
  return data;
}

export async function getRankingEntries(rankingListId: string) {
  const { data, error } = await supabase
    .from("ranking_entries")
    .select("*, people(*)")
    .eq("ranking_list_id", rankingListId)
    .order("rank_position", { ascending: true });
  if (error) throw error;
  return data;
}

export async function getRankingListsByCategory(categoryId: string) {
  const { data, error } = await supabase
    .from("ranking_lists")
    .select("*, categories(*)")
    .eq("category_id", categoryId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

// Get person rankings across all lists
export async function getPersonRankings(personId: string) {
  const { data, error } = await supabase
    .from("ranking_entries")
    .select("*, ranking_lists(*, categories(*))")
    .eq("person_id", personId)
    .order("rank_position", { ascending: true });
  if (error) throw error;
  return data;
}

// Upload photo
export async function uploadProfilePhoto(file: File): Promise<string> {
  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  const { error } = await supabase.storage
    .from("profile-photos")
    .upload(fileName, file);
  if (error) throw error;
  const { data } = supabase.storage
    .from("profile-photos")
    .getPublicUrl(fileName);
  return data.publicUrl;
}

// Stats
export async function getDashboardStats() {
  const [people, categories, lists] = await Promise.all([
    supabase.from("people").select("id", { count: "exact", head: true }),
    supabase.from("categories").select("id", { count: "exact", head: true }),
    supabase.from("ranking_lists").select("id", { count: "exact", head: true }),
  ]);
  return {
    totalPeople: people.count ?? 0,
    totalCategories: categories.count ?? 0,
    totalLists: lists.count ?? 0,
  };
}
