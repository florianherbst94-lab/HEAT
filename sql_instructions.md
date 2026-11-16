Florian,

Die Ursache des Fehlers liegt darin, dass in der aktiven **Supabase-Datenbank** die Tabelle `pre_registrations` noch nicht existiert (die Fehlermeldung lautet: "Could not find the table 'public.pre_registrations' in the schema cache"). 

Um das zu beheben, musst du lediglich ein kleines SQL-Skript im Supabase Dashboard ausführen. 

**So geht's:**
1. Gehe auf [supabase.com](https://supabase.com) und logge dich in dein Projekt (z.B. "HEAT") ein.
2. Klicke links im Menü auf **"SQL Editor"**.
3. Klicke auf **"New query"** (Neue Abfrage).
4. Füge den folgenden Code in das große Textfeld ein:

\`\`\`sql
-- Aktiviere UUID-Generierung (falls noch nicht geschehen)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Erstelle die Tabelle für die Vorregistrierungen
CREATE TABLE IF NOT EXISTS pre_registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  first_name VARCHAR(100),
  email VARCHAR(255) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  consent_marketing BOOLEAN DEFAULT false,
  source VARCHAR(100),
  utm_campaign VARCHAR(100),
  utm_source VARCHAR(100),
  notification_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, email)
);

-- Sicherheitseinstellungen (Row Level Security) aktivieren
ALTER TABLE pre_registrations ENABLE ROW LEVEL SECURITY;

-- Erlaubt das Eintragen neuer Mails (für das Formular)
CREATE POLICY "Allow public insert to pre_registrations" 
  ON pre_registrations FOR INSERT TO public WITH CHECK (true);

-- Erlaubt Admins (dir) vollen Zugriff
CREATE POLICY "Allow admin full access to pre_registrations" 
  ON pre_registrations FOR ALL TO authenticated USING (true) WITH CHECK (true);
\`\`\`

5. Klicke rechts unten auf **"Run"** (oder drücke Cmd+Enter).

Sobald du das gemacht hast, wird das Formular auf `access.heatdresden.de` augenblicklich und fehlerfrei funktionieren! 
