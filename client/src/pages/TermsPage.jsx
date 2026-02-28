import Footer from '../components/Footer';

export default function TermsPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#fff' }}>
      {/* Header */}
      <header style={{ background: '#1B4332', color: '#fff', padding: '3rem 1.5rem 2rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Terms &amp; Conditions</h1>
        <p style={{ color: '#a7f3d0', fontSize: '1rem' }}>Last updated: January 2025</p>
        <a href="/listings" style={{ display: 'inline-block', marginTop: '1rem', color: '#6ee7b7', fontSize: '0.875rem', textDecoration: 'underline' }}>
          ← Back to Home
        </a>
      </header>

      {/* Content */}
      <main style={{ flex: 1, maxWidth: '800px', margin: '0 auto', padding: '2.5rem 1.5rem', width: '100%', color: '#1a1a1a' }}>
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1B4332', marginBottom: '0.75rem' }}>Agreement</h2>
          <p style={{ lineHeight: 1.7, marginBottom: '0.5rem' }}>
            By accessing or using the Golden Key Realty website or services, you agree to be bound by these Terms &amp; Conditions. Please read them carefully before proceeding.
          </p>
          <p style={{ lineHeight: 1.7 }}>
            If you do not agree to these terms, you should not use our website or engage our services. We reserve the right to update these terms at any time.
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1B4332', marginBottom: '0.75rem' }}>Service Terms</h2>
          <p style={{ lineHeight: 1.7, marginBottom: '0.5rem' }}>
            Golden Key Realty provides real estate agency services including property listings, buyer and seller representation, and property management across Malta and Gozo.
          </p>
          <p style={{ lineHeight: 1.7, marginBottom: '0.5rem' }}>
            All property listings displayed on our website are provided for informational purposes and are subject to availability. Prices and details may change without notice.
          </p>
          <p style={{ lineHeight: 1.7 }}>
            Our services are subject to the applicable laws of Malta, including the Estate Agents Act and any relevant European Union directives.
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1B4332', marginBottom: '0.75rem' }}>User Obligations</h2>
          <p style={{ lineHeight: 1.7, marginBottom: '0.5rem' }}>
            Users must provide accurate and truthful information when submitting inquiries or registering for services. Misrepresentation may result in termination of services.
          </p>
          <p style={{ lineHeight: 1.7, marginBottom: '0.5rem' }}>
            You agree not to use our website for any unlawful purpose, to distribute spam, or to attempt to gain unauthorised access to our systems.
          </p>
          <p style={{ lineHeight: 1.7 }}>
            Any intellectual property, including content and branding on this website, remains the exclusive property of Golden Key Realty.
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1B4332', marginBottom: '0.75rem' }}>Limitation of Liability</h2>
          <p style={{ lineHeight: 1.7, marginBottom: '0.5rem' }}>
            Golden Key Realty shall not be liable for any indirect, incidental, or consequential damages arising from your use of our website or services.
          </p>
          <p style={{ lineHeight: 1.7 }}>
            While we strive to ensure all property information is accurate, we cannot guarantee the completeness or accuracy of third-party listing data and accept no liability for errors therein.
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1B4332', marginBottom: '0.75rem' }}>Governing Law</h2>
          <p style={{ lineHeight: 1.7, marginBottom: '0.5rem' }}>
            These Terms &amp; Conditions are governed by and construed in accordance with the laws of Malta, without regard to its conflict of law principles.
          </p>
          <p style={{ lineHeight: 1.7 }}>
            Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts of Malta. For questions, contact us at legal@goldenkey.mt.
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}
