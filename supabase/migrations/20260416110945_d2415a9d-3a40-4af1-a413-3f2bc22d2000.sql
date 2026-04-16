
-- Create categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create people table
CREATE TABLE public.people (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  photo_url TEXT,
  short_bio TEXT,
  full_description TEXT,
  achievements TEXT[] DEFAULT '{}',
  country TEXT,
  age INTEGER,
  custom_stats JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create ranking_lists table
CREATE TABLE public.ranking_lists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  list_size INTEGER NOT NULL DEFAULT 10,
  description TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create ranking_entries table
CREATE TABLE public.ranking_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ranking_list_id UUID NOT NULL REFERENCES public.ranking_lists(id) ON DELETE CASCADE,
  person_id UUID NOT NULL REFERENCES public.people(id) ON DELETE CASCADE,
  rank_position INTEGER NOT NULL,
  score NUMERIC(10, 2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(ranking_list_id, rank_position),
  UNIQUE(ranking_list_id, person_id)
);

-- Create people_categories junction table
CREATE TABLE public.people_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  person_id UUID NOT NULL REFERENCES public.people(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  UNIQUE(person_id, category_id)
);

-- Enable RLS on all tables
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.people ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ranking_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ranking_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.people_categories ENABLE ROW LEVEL SECURITY;

-- Public read access for all tables
CREATE POLICY "Anyone can view categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Anyone can view people" ON public.people FOR SELECT USING (true);
CREATE POLICY "Anyone can view ranking_lists" ON public.ranking_lists FOR SELECT USING (true);
CREATE POLICY "Anyone can view ranking_entries" ON public.ranking_entries FOR SELECT USING (true);
CREATE POLICY "Anyone can view people_categories" ON public.people_categories FOR SELECT USING (true);

-- Authenticated write access
CREATE POLICY "Authenticated users can insert categories" ON public.categories FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update categories" ON public.categories FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete categories" ON public.categories FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert people" ON public.people FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update people" ON public.people FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete people" ON public.people FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert ranking_lists" ON public.ranking_lists FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update ranking_lists" ON public.ranking_lists FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete ranking_lists" ON public.ranking_lists FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert ranking_entries" ON public.ranking_entries FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update ranking_entries" ON public.ranking_entries FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete ranking_entries" ON public.ranking_entries FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert people_categories" ON public.people_categories FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update people_categories" ON public.people_categories FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete people_categories" ON public.people_categories FOR DELETE TO authenticated USING (true);

-- Indexes
CREATE INDEX idx_people_slug ON public.people(slug);
CREATE INDEX idx_categories_slug ON public.categories(slug);
CREATE INDEX idx_ranking_lists_slug ON public.ranking_lists(slug);
CREATE INDEX idx_ranking_lists_category ON public.ranking_lists(category_id);
CREATE INDEX idx_ranking_entries_list ON public.ranking_entries(ranking_list_id);
CREATE INDEX idx_ranking_entries_person ON public.ranking_entries(person_id);
CREATE INDEX idx_people_categories_person ON public.people_categories(person_id);
CREATE INDEX idx_people_categories_category ON public.people_categories(category_id);
CREATE INDEX idx_people_fullname_search ON public.people USING gin(to_tsvector('english', full_name));

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_people_updated_at BEFORE UPDATE ON public.people FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_ranking_lists_updated_at BEFORE UPDATE ON public.ranking_lists FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_ranking_entries_updated_at BEFORE UPDATE ON public.ranking_entries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for profile photos
INSERT INTO storage.buckets (id, name, public) VALUES ('profile-photos', 'profile-photos', true);

CREATE POLICY "Profile photos are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'profile-photos');
CREATE POLICY "Authenticated users can upload profile photos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'profile-photos');
CREATE POLICY "Authenticated users can update profile photos" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'profile-photos');
CREATE POLICY "Authenticated users can delete profile photos" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'profile-photos');
