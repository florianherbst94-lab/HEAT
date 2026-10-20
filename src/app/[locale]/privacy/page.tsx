export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-heat-black text-white pt-32 pb-24 font-sans">
      <div className="container mx-auto px-6 max-w-4xl space-y-10">
        <div>
          <span className="text-heat-red font-bold uppercase tracking-widest text-xs mb-2 block">
            Datenschutz & Rechtliches
          </span>
          <h1 className="font-display text-4xl md:text-5xl font-extrabold tracking-widest uppercase mb-4">
            Datenschutzerklärung
          </h1>
          <p className="text-heat-chrome text-sm font-light leading-relaxed">
            Stand: 12.12.2026
          </p>
        </div>

        <div className="space-y-8 text-sm text-heat-chrome-light font-light leading-relaxed">
          
          <section className="space-y-4">
            <h2 className="font-display text-xl font-bold text-white uppercase tracking-widest border-b border-heat-chrome-dark pb-2">
              1. Datenschutz auf einen Blick
            </h2>
            <h3 className="font-bold text-white">Allgemeine Hinweise</h3>
            <p>
              Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können.
            </p>
            <h3 className="font-bold text-white">Datenerfassung auf dieser Website</h3>
            <p>
              <strong>Wer ist verantwortlich für die Datenerfassung auf dieser Website?</strong><br />
              Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. Dies ist die:<br /><br />
              <strong>HEAT GbR</strong><br />
              (Adresse bitte im Impressum entnehmen oder hier einfügen)<br />
              E-Mail: info@heatdresden.de
            </p>
            <p>
              <strong>Wie erfassen wir Ihre Daten?</strong><br />
              Ihre Daten werden zum einen dadurch erhoben, dass Sie uns diese mitteilen. Hierbei kann es sich z. B. um Daten handeln, die Sie in ein Kontaktformular oder bei der Vorregistrierung (Early Access) eingeben. Andere Daten werden automatisch oder nach Ihrer Einwilligung beim Besuch der Website durch unsere IT-Systeme erfasst (z.B. Internetbrowser, Betriebssystem oder Uhrzeit des Seitenaufrufs).
            </p>
            <p>
              <strong>Wofür nutzen wir Ihre Daten?</strong><br />
              Ein Teil der Daten wird erhoben, um eine fehlerfreie Bereitstellung der Website zu gewährleisten. Andere Daten (insbesondere bei der Registrierung) werden zur Organisation, Planung und Durchführung unserer Veranstaltungen (HEAT Events) sowie zur Information über Tickets und Gästelisten verwendet.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-xl font-bold text-white uppercase tracking-widest border-b border-heat-chrome-dark pb-2">
              2. Pre-Registration / Early Access & HEAT CLUB
            </h2>
            <p>
              Wenn Sie sich für unseren "Early Access" (Vorregistrierung) oder den HEAT CLUB anmelden, erheben wir folgende Daten:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-heat-chrome">
              <li>Ihre E-Mail-Adresse (Pflichtfeld)</li>
              <li>Ihren Vornamen (Optional)</li>
              <li>Zeitstempel und IP-Adresse der Registrierung (zur rechtlichen Absicherung des Opt-Ins)</li>
            </ul>
            <p>
              <strong>Zweck der Verarbeitung:</strong><br />
              Die Verarbeitung dieser Daten erfolgt ausschließlich zu dem Zweck, Sie über den Start des Ticketverkaufs, Early-Access-Angebote, neue Event-Termine und allgemeine Neuigkeiten rund um die Veranstaltungen der HEAT GbR zu informieren. Ferner nutzen wir die Daten für die Abwicklung von Gästelisten, Einlasskontrollen und Community-Aktionen (z.B. HEAT FITS).
            </p>
            <p>
              <strong>Rechtsgrundlage:</strong><br />
              Die Verarbeitung der in das Registrierungsformular eingegebenen Daten erfolgt ausschließlich auf Grundlage Ihrer Einwilligung (Art. 6 Abs. 1 lit. a DSGVO). Sie können diese Einwilligung jederzeit widerrufen. Dazu reicht eine formlose Mitteilung per E-Mail an uns oder ein Klick auf den "Abmelden"-Link in unseren E-Mails. Die Rechtmäßigkeit der bis zum Widerruf erfolgten Datenverarbeitungsvorgänge bleibt vom Widerruf unberührt.
            </p>
            <p>
              <strong>Speicherdauer:</strong><br />
              Die von Ihnen zum Zwecke der Vorregistrierung / des Newsletters hinterlegten Daten werden von uns so lange gespeichert, bis Sie sich aus dem Verteiler austragen und werden nach der Abbestellung aus der Verteilerliste gelöscht. Daten, die zu anderen Zwecken (z.B. für Ticketkäufe) bei uns gespeichert wurden, bleiben hiervon unberührt.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-xl font-bold text-white uppercase tracking-widest border-b border-heat-chrome-dark pb-2">
              3. Hosting und externe Dienstleister (Auftragsverarbeiter)
            </h2>
            <p>Wir hosten unsere Website und unsere Datenbanken bei externen Dienstleistern:</p>
            <ul className="list-disc pl-5 space-y-2 text-heat-chrome">
              <li><strong>Vercel:</strong> Für das Hosting der Website (Vercel Inc., USA).</li>
              <li><strong>Supabase:</strong> Für die sichere Speicherung der Registrierungsdaten und Nutzer-Accounts (Supabase Inc., USA / Serverstandorte i.d.R. EU).</li>
              <li><strong>Resend:</strong> Für den Versand von Bestätigungs-E-Mails und Event-Updates (Resend Inc., USA).</li>
            </ul>
            <p>
              Der Einsatz dieser Dienstleister erfolgt zum Zwecke einer sicheren, schnellen und effizienten Bereitstellung unseres Online-Angebots durch professionelle Anbieter (Art. 6 Abs. 1 lit. f DSGVO). Wir haben mit den genannten Anbietern Verträge zur Auftragsverarbeitung (AVV) bzw. entsprechende Standardvertragsklauseln (SCC) abgeschlossen, die sicherstellen, dass die personenbezogenen Daten unserer Websitebesucher nur nach unseren Weisungen und unter Einhaltung der DSGVO verarbeitet werden.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-xl font-bold text-white uppercase tracking-widest border-b border-heat-chrome-dark pb-2">
              4. Ihre Rechte
            </h2>
            <p>
              Sie haben im Rahmen der geltenden gesetzlichen Bestimmungen jederzeit das Recht auf unentgeltliche Auskunft über Ihre gespeicherten personenbezogenen Daten, deren Herkunft und Empfänger und den Zweck der Datenverarbeitung und ggf. ein Recht auf Berichtigung oder Löschung dieser Daten.
            </p>
            <p>
              <strong>Widerruf Ihrer Einwilligung zur Datenverarbeitung:</strong><br />
              Viele Datenverarbeitungsvorgänge sind nur mit Ihrer ausdrücklichen Einwilligung möglich. Sie können eine bereits erteilte Einwilligung jederzeit widerrufen. Die Rechtmäßigkeit der bis zum Widerruf erfolgten Datenverarbeitung bleibt vom Widerruf unberührt.
            </p>
            <p>
              Hierzu sowie zu weiteren Fragen zum Thema personenbezogene Daten können Sie sich jederzeit an uns wenden: <strong>info@heatdresden.de</strong>
            </p>
          </section>

        </div>
      </div>
    </main>
  );
}
