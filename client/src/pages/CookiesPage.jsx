import Footer from '../components/Footer';

export default function CookiesPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#fff' }}>
      {/* Header */}
      <header style={{ background: '#6B3D1E', color: '#fff', padding: '3rem 1.5rem 2rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Cookie Policy</h1>
        <p style={{ color: '#a7f3d0', fontSize: '1rem' }}>Last updated: January 2025</p>
        <a href="/listings" style={{ display: 'inline-block', marginTop: '1rem', color: '#6ee7b7', fontSize: '0.875rem', textDecoration: 'underline' }}>
          ← Back to Home
        </a>
      </header>

      {/* Content */}
      <main style={{ flex: 1, maxWidth: '800px', margin: '0 auto', padding: '2.5rem 1.5rem', width: '100%', color: '#1a1a1a' }}>
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#6B3D1E', marginBottom: '0.75rem' }}>What Are Cookies</h2>
          <p style={{ lineHeight: 1.7, marginBottom: '0.5rem' }}>
            Cookies are small text files that are stored on your device when you visit a website. They help websites remember your preferences and improve your browsing experience.
          </p>
          <p style={{ lineHeight: 1.7 }}>
            By continuing to use our website, you consent to our use of cookies as described in this policy. You can manage or disable cookies through your browser settings at any time.
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#6B3D1E', marginBottom: '0.75rem' }}>Types of Cookies We Use</h2>
          <p style={{ lineHeight: 1.7, marginBottom: '0.5rem' }}>
            <strong>Essential cookies</strong> are necessary for the basic functioning of our website, such as maintaining your session when you log into our CRM portal.
          </p>
          <p style={{ lineHeight: 1.7, marginBottom: '0.5rem' }}>
            <strong>Analytical cookies</strong> help us understand how visitors interact with our website by collecting anonymous usage data, which we use to improve performance.
          </p>
          <p style={{ lineHeight: 1.7 }}>
            <strong>Preference cookies</strong> remember your settings such as language, currency, and theme preferences so you don't have to re-enter them on each visit.
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#6B3D1E', marginBottom: '0.75rem' }}>Managing Cookies</h2>
          <p style={{ lineHeight: 1.7, marginBottom: '0.5rem' }}>
            You can control and manage cookies through your browser settings. Most browsers allow you to view, delete, or block cookies from specific websites.
          </p>
          <p style={{ lineHeight: 1.7, marginBottom: '0.5rem' }}>
            Please note that disabling essential cookies may affect the functionality of our website and prevent you from accessing certain features, including the CRM login portal.
          </p>
          <p style={{ lineHeight: 1.7 }}>
            For guidance on managing cookies in your specific browser, visit the browser's official help documentation or <strong>aboutcookies.org</strong>.
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#6B3D1E', marginBottom: '0.75rem' }}>Third-Party Cookies</h2>
          <p style={{ lineHeight: 1.7, marginBottom: '0.5rem' }}>
            We may use third-party services such as Google Analytics or social media plugins that set their own cookies on your device to track engagement and usage patterns.
          </p>
          <p style={{ lineHeight: 1.7 }}>
            These third parties have their own privacy and cookie policies, and we encourage you to review them. Golden Key Realty has no control over third-party cookies. For questions, contact us at privacy@goldenkey.mt.
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}
