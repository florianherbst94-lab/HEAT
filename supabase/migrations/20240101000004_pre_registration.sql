-- Add new columns to events
ALTER TABLE events ADD COLUMN IF NOT EXISTS pre_registration_active BOOLEAN DEFAULT false;
ALTER TABLE events ADD COLUMN IF NOT EXISTS background_video_url TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS presale_start_date TIMESTAMP WITH TIME ZONE;

-- Create pre_registrations table
CREATE TABLE IF NOT EXISTS pre_registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  first_name VARCHAR(100),
  email VARCHAR(255) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- pending, confirmed
  consent_marketing BOOLEAN DEFAULT false,
  source VARCHAR(100),
  utm_campaign VARCHAR(100),
  utm_source VARCHAR(100),
  notification_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, email)
);

-- Policies for pre_registrations (assuming RLS is enabled)
ALTER TABLE pre_registrations ENABLE ROW LEVEL SECURITY;

-- Allow insert from anon
CREATE POLICY "Allow public insert to pre_registrations" ON pre_registrations
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Admin full access
CREATE POLICY "Allow admin full access to pre_registrations" ON pre_registrations
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
