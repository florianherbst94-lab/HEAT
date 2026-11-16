Florian,

Ah, jetzt habe ich das Problem zu 100% identifiziert! Ich habe mir die Datenbankstruktur gerade noch einmal angesehen.

Dein Screenshot hat absolut recht. Die `pre_registrations` Tabelle ist jetzt da.
Aber es fehlt noch ein winziges Detail bei der Haupt-Tabelle `events`: In dieser Tabelle fehlen noch die drei Spalten, mit denen das Early-Access-System arbeitet (`pre_registration_active`, `background_video_url`, `presale_start_date`).

Weil diese drei Felder fehlen, kann das Admin-Dashboard das Event nicht richtig laden und speichert auch nichts ab.

Bitte gehe noch einmal exakt wie vorhin in dein Supabase Dashboard in den **SQL Editor** -> **New Query** und führe folgenden kurzen Befehl aus:

\`\`\`sql
ALTER TABLE events ADD COLUMN IF NOT EXISTS pre_registration_active BOOLEAN DEFAULT false;
ALTER TABLE events ADD COLUMN IF NOT EXISTS background_video_url TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS presale_start_date TIMESTAMP WITH TIME ZONE;
\`\`\`

Sobald das durchgelaufen ist, hast du alle Tabellen zu 100% synchron und das Admin-Dashboard lädt sofort deine Daten.
