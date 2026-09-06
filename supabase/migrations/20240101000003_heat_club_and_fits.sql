-- HEAT CLUB Members and HEAT FITS Schema

-- 1. HEAT Members Table
CREATE SEQUENCE IF NOT EXISTS heat_members_seq START WITH 1842 INCREMENT BY 1;

CREATE TABLE IF NOT EXISTS public.heat_members (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  member_seq integer DEFAULT nextval('heat_members_seq') UNIQUE,
  member_number text UNIQUE,
  first_name text NOT NULL,
  last_name text,
  email text UNIQUE NOT NULL,
  phone text,
  instagram text,
  birthdate date,
  email_verified_at timestamp with time zone,
  whatsapp_opt_in boolean DEFAULT false,
  whatsapp_opt_in_at timestamp with time zone,
  whatsapp_opt_in_source text,
  email_marketing_opt_in boolean DEFAULT false,
  email_marketing_opt_in_at timestamp with time zone,
  consent_terms_text text,
  session_token text UNIQUE,
  auth_otp text,
  auth_otp_expires_at timestamp with time zone,
  status text DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'deleted')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Trigger to automatically set member_number like HEAT #001842
CREATE OR REPLACE FUNCTION set_heat_member_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.member_number IS NULL THEN
    NEW.member_number := 'HEAT #' || lpad(NEW.member_seq::text, 6, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_heat_member_number ON public.heat_members;
CREATE TRIGGER trg_set_heat_member_number
BEFORE INSERT ON public.heat_members
FOR EACH ROW
EXECUTE FUNCTION set_heat_member_number();

-- 2. Fit Campaigns Table
CREATE TABLE IF NOT EXISTS public.fit_campaigns (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  event_name text NOT NULL,
  event_date date,
  upload_start timestamp with time zone,
  upload_end timestamp with time zone,
  voting_start timestamp with time zone,
  voting_end timestamp with time zone,
  max_votes_per_member integer DEFAULT 5,
  show_vote_count boolean DEFAULT true,
  description text,
  prize text,
  hero_image_url text,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'upcoming', 'live', 'voting_closed', 'finished')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Fit Entries Table
CREATE TABLE IF NOT EXISTS public.fit_entries (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id uuid REFERENCES public.fit_campaigns(id) ON DELETE CASCADE,
  member_id uuid REFERENCES public.heat_members(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  title text,
  caption text,
  instagram_handle text,
  moderation_status text DEFAULT 'pending' CHECK (moderation_status IN ('pending', 'approved', 'rejected', 'hidden')),
  website_consent boolean DEFAULT true NOT NULL,
  website_consent_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  social_media_consent boolean DEFAULT false,
  social_media_consent_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  approved_at timestamp with time zone
);

-- 4. Fit Votes Table
CREATE TABLE IF NOT EXISTS public.fit_votes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id uuid REFERENCES public.fit_campaigns(id) ON DELETE CASCADE,
  entry_id uuid REFERENCES public.fit_entries(id) ON DELETE CASCADE,
  member_id uuid REFERENCES public.heat_members(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT unique_member_entry UNIQUE (member_id, entry_id)
);

-- 5. Fit Winners Table
CREATE TABLE IF NOT EXISTS public.fit_winners (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id uuid REFERENCES public.fit_campaigns(id) ON DELETE CASCADE,
  entry_id uuid REFERENCES public.fit_entries(id) ON DELETE CASCADE,
  winner_type text CHECK (winner_type IN ('community_winner', 'heat_choice', 'wildcard', 'guestlist_winner')),
  badge_title text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for fast lookup & anti-fraud performance
CREATE INDEX IF NOT EXISTS idx_fit_entries_campaign_status ON public.fit_entries(campaign_id, moderation_status);
CREATE INDEX IF NOT EXISTS idx_fit_votes_campaign_member ON public.fit_votes(campaign_id, member_id);
CREATE INDEX IF NOT EXISTS idx_fit_votes_entry ON public.fit_votes(entry_id);

-- Storage bucket for fits images if supported
INSERT INTO storage.buckets (id, name, public)
VALUES ('fits', 'fits', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for fits bucket
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Allow public uploads to fits bucket'
  ) THEN
    CREATE POLICY "Allow public uploads to fits bucket"
    ON storage.objects FOR INSERT
    TO public
    WITH CHECK (bucket_id = 'fits');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Allow public read access for fits bucket'
  ) THEN
    CREATE POLICY "Allow public read access for fits bucket"
    ON storage.objects FOR SELECT
    TO public
    USING (bucket_id = 'fits');
  END IF;
END $$;
