Florian,

Damit du die Galerie vom Admin-Dashboard aus steuern kannst (Bilder hochladen, anordnen und löschen), brauchen wir eine neue Tabelle in der Datenbank für die Bilder und einen "Speicherort" (Bucket) für die Bilddateien.

Bitte gehe wieder in dein **Supabase Dashboard** -> **SQL Editor** -> **New query** und führe dieses Skript aus:

\`\`\`sql
-- Erstelle die Tabelle für die Galerie-Bilder
CREATE TABLE IF NOT EXISTS gallery_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Füge einen Storage-Bucket für die Bilder hinzu (falls noch nicht vorhanden)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('gallery', 'gallery', true)
ON CONFLICT (id) DO NOTHING;

-- Erlaube öffentlichen Zugriff auf die Bilder (damit sie auf der Webseite angezeigt werden können)
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'gallery' );

-- Erlaube Admin-Uploads (über Service Role)
CREATE POLICY "Admin Uploads" 
ON storage.objects FOR INSERT 
WITH CHECK ( bucket_id = 'gallery' );

CREATE POLICY "Admin Deletes" 
ON storage.objects FOR DELETE 
USING ( bucket_id = 'gallery' );
\`\`\`

Klicke auf **Run**. Sobald das erledigt ist, programmiere ich dir jetzt parallel das Dashboard und die Startseite so um, dass die Galerie dynamisch wird!
