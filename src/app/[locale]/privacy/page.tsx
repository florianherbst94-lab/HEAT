export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-heat-black text-white pt-32 pb-24">
      <div className="container mx-auto px-6 max-w-4xl space-y-10">
        <div>
          <span className="text-heat-red font-bold uppercase tracking-widest text-xs mb-2 block">
            TRANSPARENZ & COMPLIANCE
          </span>
          <h1 className="font-display text-4xl font-extrabold tracking-widest uppercase mb-4">
            Datenschutzerklärung
          </h1>
          <p className="text-heat-chrome text-sm font-light leading-relaxed">
            Informationen über die Verarbeitung personenbezogener Daten im Rahmen der Plattform <strong>heatdresden.de</strong>, des <strong>HEAT CLUB</strong> und der Aktion <strong>HEAT FITS</strong>.
          </p>
        </div>

        <div className="bg-amber-500/10 border border-amber-500/40 p-4 rounded-sm text-xs text-amber-200">
          <strong>[HINWEIS ZUR RECHTSVERBINDLICHKEIT]</strong>: Die nachfolgenden Abschnitte beschreiben die technischen Datenverarbeitungsprozesse im System und dienen als Vorlage für die finale juristische Prüfung durch einen Fachanwalt.
        </div>

        <div className="space-y-8 text-sm text-heat-chrome-light font-light leading-relaxed">
          {/* Section 1 */}
          <section className="bg-heat-anthracite/30 border border-heat-chrome-dark p-6 rounded-sm space-y-3">
            <h2 className="font-display text-lg font-bold text-white uppercase">
              1. HEAT CLUB Mitgliedskonto & Registrierung
            </h2>
            <p>
              Bei der Registrierung für den HEAT CLUB verarbeiten wir Ihren Vornamen, Ihre E-Mail-Adresse, Bestätigung der Volljährigkeit (18+) sowie optional Nachname, Mobilnummer/WhatsApp-Nummer und Instagram-Handle.
            </p>
            <p className="text-xs text-zinc-400">
              <strong>Zweck:</strong> Bereitstellung des Community-Zugangs, Zuordnung der HEAT Member ID (z.B. HEAT #001842), Teilnahme an Voting-Aktionen und Gästelisten-Verlosungen.
            </p>
          </section>

          {/* Section 2 */}
          <section className="bg-heat-anthracite/30 border border-heat-chrome-dark p-6 rounded-sm space-y-3">
            <h2 className="font-display text-lg font-bold text-white uppercase">
              2. Foto-Upload & HEAT FITS Galerie
            </h2>
            <p>
              Beim Upload eines Outfits für HEAT FITS speichern wir das Bildmaterial, Titel, Caption, Veröffentlichungs-Einwilligung und Zeitstempel. Vor dem Upload entfernen wir EXIF-Metadaten soweit technisch möglich.
            </p>
            <p className="text-xs text-zinc-400">
              <strong>Zweck:</strong> Darstellung im Rahmen der HEAT FITS Online-Galerie und Auswertung von Voting-Ergebnissen.
            </p>
          </section>

          {/* Section 3 */}
          <section className="bg-heat-anthracite/30 border border-heat-chrome-dark p-6 rounded-sm space-y-3">
            <h2 className="font-display text-lg font-bold text-white uppercase">
              3. Voting-System & Anti-Fraud
            </h2>
            <p>
              Zur Vermeidung von Abstimmungs-Manipulationen protokollieren wir Votes serverseitig in Kombination mit der verifizierten HEAT Member ID. Eine Weitergabe dieser Abstimmungsdaten an Dritte erfolgt nicht.
            </p>
          </section>

          {/* Section 4 */}
          <section className="bg-heat-anthracite/30 border border-heat-chrome-dark p-6 rounded-sm space-y-3">
            <h2 className="font-display text-lg font-bold text-white uppercase">
              4. E-Mail & WhatsApp Marketing (Opt-in)
            </h2>
            <p>
              Marketing-Mitteilungen per E-Mail oder WhatsApp erfolgen ausschließlich nach expliziter, nicht vorausgewählter Einwilligung (Double-Opt-In bzw. protokollierter Opt-In-Zeitstempel und Quellennachweis).
            </p>
          </section>

          {/* Section 5 */}
          <section className="bg-heat-anthracite/30 border border-heat-chrome-dark p-6 rounded-sm space-y-3">
            <h2 className="font-display text-lg font-bold text-white uppercase">
              5. Widerruf & Account-Löschung
            </h2>
            <p>
              Sie können Ihre Einwilligung jederzeit mit Wirkung für die Zukunft widerrufen oder die vollständige Löschung Ihres HEAT CLUB Accounts und Ihrer hochgeladenen Fotos anfordern per E-Mail an <strong>datenschutz@heatdresden.de</strong>.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
