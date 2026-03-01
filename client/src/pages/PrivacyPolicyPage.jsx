import Footer from '../components/Footer';

export default function PrivacyPolicyPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#fff' }}>
      {/* Header */}
      <header style={{ background: '#6B3D1E', color: '#fff', padding: '3rem 1.5rem 2rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Privacy Policy</h1>
        <p style={{ color: '#a7f3d0', fontSize: '1rem' }}>Last updated: January 2025</p>
        <a href="/listings" style={{ display: 'inline-block', marginTop: '1rem', color: '#6ee7b7', fontSize: '0.875rem', textDecoration: 'underline' }}>
          ← Back to Home
        </a>
      </header>

      {/* Content */}
      <main style={{ flex: 1, maxWidth: '800px', margin: '0 auto', padding: '2.5rem 1.5rem', width: '100%', color: '#1a1a1a' }}>
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#6B3D1E', marginBottom: '0.75rem' }}>Introduction</h2>
          <p style={{ lineHeight: 1.7, marginBottom: '0.5rem' }}>
            Golden Key Realty is committed to protecting your personal data and respecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you interact with our services.
          </p>
          <p style={{ lineHeight: 1.7 }}>
            By using our website or engaging our real estate services, you acknowledge the practices described in this policy. We encourage you to read this document carefully.
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#6B3D1E', marginBottom: '0.75rem' }}>Data We Collect</h2>
          <p style={{ lineHeight: 1.7, marginBottom: '0.5rem' }}>
            We may collect personal information such as your name, email address, phone number, and property preferences when you submit an inquiry or register for our services.
          </p>
          <p style={{ lineHeight: 1.7, marginBottom: '0.5rem' }}>
            We also collect technical data such as IP addresses, browser type, and browsing activity through cookies and analytics tools to improve our website performance.
          </p>
          <p style={{ lineHeight: 1.7 }}>
            All data is collected only when necessary and with your consent where required under applicable law.
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#6B3D1E', marginBottom: '0.75rem' }}>How We Use Your Data</h2>
          <p style={{ lineHeight: 1.7, marginBottom: '0.5rem' }}>
            Your data is used to respond to property inquiries, match you with suitable listings, and provide personalised real estate services across Malta and Gozo.
          </p>
          <p style={{ lineHeight: 1.7, marginBottom: '0.5rem' }}>
            We may use your contact details to send you relevant property updates or newsletters, but only where you have opted in to receive such communications.
          </p>
          <p style={{ lineHeight: 1.7 }}>
            We do not sell or share your personal data with third parties for their own marketing purposes.
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#6B3D1E', marginBottom: '0.75rem' }}>GDPR Rights</h2>
          <p style={{ lineHeight: 1.7, marginBottom: '0.5rem' }}>
            Under the General Data Protection Regulation (GDPR), you have the right to access, correct, or delete the personal data we hold about you at any time.
          </p>
          <p style={{ lineHeight: 1.7, marginBottom: '0.5rem' }}>
            You may also object to the processing of your data, request data portability, or withdraw consent where processing is based on your consent.
          </p>
          <p style={{ lineHeight: 1.7 }}>
            To exercise any of these rights, please contact us using the details below and we will respond within 30 days.
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#6B3D1E', marginBottom: '0.75rem' }}>Contact Us</h2>
          <p style={{ lineHeight: 1.7, marginBottom: '0.5rem' }}>
            If you have any questions about this Privacy Policy or how we handle your data, please contact our Data Protection Officer at privacy@goldenkey.mt.
          </p>
          <p style={{ lineHeight: 1.7 }}>
            You also have the right to lodge a complaint with the Office of the Information and Data Protection Commissioner (IDPC) in Malta at <strong>idpc.org.mt</strong>.
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}
