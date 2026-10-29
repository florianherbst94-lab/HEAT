export default function LegalPage() {
  return (
    <main className="min-h-screen bg-heat-black pt-32 pb-24">
      <div className="container mx-auto px-6 max-w-4xl">
        <h1 className="font-display text-4xl font-bold tracking-widest text-white mb-12 uppercase">
          Impressum
        </h1>
        <div className="space-y-8 text-heat-chrome-light">
          <section>
            <h2 className="text-xl font-bold text-white mb-4">Angaben gemäß § 5 Digitale-Dienste-Gesetz (DDG)</h2>
            <p className="mb-4">
              <strong>Anbieter</strong><br />
              HEAT GbR<br />
              Wölfnitzer Ring 6<br />
              01169 Dresden<br />
              Deutschland
            </p>
            <p>
              <strong>Vertretungsberechtigter Gesellschafter</strong><br />
              Bangal Camara
            </p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-white mb-4">Kontakt</h2>
            <p>
              <strong>E-Mail:</strong> <a href="mailto:info@heatdresden.de" className="text-heat-magenta hover:text-white transition-colors">info@heatdresden.de</a><br />
              <strong>Website:</strong> <a href="https://heatdresden.de" target="_blank" rel="noopener noreferrer" className="text-heat-magenta hover:text-white transition-colors">https://heatdresden.de</a>
            </p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-white mb-4">Verbraucherstreitbeilegung</h2>
            <p>
              Wir sind weder verpflichtet noch bereit, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
