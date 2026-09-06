-- Events Table
CREATE TABLE public.events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  category text NOT NULL CHECK (category IN ('Heat Day', 'Heat Night')),
  date date,
  start_time time without time zone,
  end_time time without time zone,
  location_name text,
  city text,
  address text,
  min_age integer DEFAULT 18,
  dresscode text DEFAULT 'Dress to impress',
  music_genres text,
  description text,
  artists text,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  image_url text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Community Members
CREATE TABLE public.community_members (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  birthdate date,
  instagram_handle text,
  city text,
  interest_day boolean DEFAULT false,
  interest_night boolean DEFAULT false,
  preferred_music text,
  consent_email boolean DEFAULT false,
  consent_whatsapp boolean DEFAULT false,
  consent_instagram boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Guestlists
CREATE TABLE public.guestlists (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id uuid REFERENCES public.events(id) ON DELETE CASCADE,
  first_name text NOT NULL,
  email text NOT NULL,
  phone text,
  birthdate date,
  instagram_handle text,
  city text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected', 'checked-in', 'no-show')),
  qr_code text UNIQUE,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tickets
CREATE TABLE public.tickets (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id uuid REFERENCES public.events(id) ON DELETE CASCADE,
  category text NOT NULL, -- Early Bird, Regular, etc.
  price numeric(10, 2) NOT NULL,
  quantity_total integer NOT NULL,
  quantity_sold integer DEFAULT 0,
  sale_start timestamp with time zone,
  sale_end timestamp with time zone,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'sold_out')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Orders
CREATE TABLE public.orders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id uuid REFERENCES public.events(id) ON DELETE CASCADE,
  buyer_name text NOT NULL,
  buyer_email text NOT NULL,
  total_amount numeric(10, 2) NOT NULL,
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_provider text, -- stripe, paypal
  payment_intent_id text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Order Items / Issued Tickets
CREATE TABLE public.order_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
  ticket_id uuid REFERENCES public.tickets(id) ON DELETE SET NULL,
  qr_code text UNIQUE,
  status text DEFAULT 'valid' CHECK (status IN ('valid', 'checked-in', 'cancelled')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
