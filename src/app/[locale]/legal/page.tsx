export default function LegalPage() {
  return (
    <main className="min-h-screen bg-heat-black pt-32 pb-24">
      <div className="container mx-auto px-6 max-w-4xl">
        <h1 className="font-display text-4xl font-bold tracking-widest text-white mb-12 uppercase">
          Impressum & Legal
        </h1>
        <div className="space-y-8 text-heat-chrome-light">
          <section>
            <h2 className="text-xl font-bold text-white mb-4">Angaben gemäß § 5 TMG</h2>
            <p>
              Max Mustermann<br />
              Musterstraße 1<br />
              12345 Musterstadt
            </p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-white mb-4">Kontakt</h2>
            <p>
              Telefon: +49 (0) 123 44 55 66<br />
              E-Mail: info@heat-dresden.de
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
