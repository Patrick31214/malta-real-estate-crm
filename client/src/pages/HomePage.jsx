import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { listings as listingsApi, servicesPublic } from '../services/api';
import './HomePage.css';

/* ─── Static data ─────────────────────────────────────────────── */
const PROPERTIES = [
  {
    id: 1,
    title: 'Luxury Penthouse – Sliema',
    location: 'Sliema, Malta',
    price: '€1,250,000',
    beds: 4,
    baths: 3,
    badge: 'For Sale',
    imgClass: 'hp-prop-img-1',
    emoji: '🌅',
  },
  {
    id: 2,
    title: 'Sea-View Apartment – Valletta',
    location: 'Valletta, Malta',
    price: '€3,500 / mo',
    beds: 3,
    baths: 2,
    badge: 'Long Let',
    imgClass: 'hp-prop-img-2',
    emoji: '🏛️',
  },
  {
    id: 3,
    title: 'Modern Villa – St. Julian\'s',
    location: "St. Julian's, Malta",
    price: '€2,100,000',
    beds: 5,
    baths: 4,
    badge: 'For Sale',
    imgClass: 'hp-prop-img-3',
    emoji: '🏖️',
  },
];

const SERVICES = [
  {
    icon: '🚤',
    title: 'Boat Tours',
    desc: 'Explore Malta\'s stunning coastline with private and group charter tours.',
  },
  {
    icon: '🚗',
    title: 'Car Rentals',
    desc: 'Premium vehicle hire for short and long-term clients across the islands.',
  },
  {
    icon: '🏠',
    title: 'Property Management',
    desc: 'Full-service property management for landlords and investors.',
  },
  {
    icon: '✈️',
    title: 'Relocation Services',
    desc: 'End-to-end relocation support for individuals and corporate moves.',
  },
];

const WHY_US = [
  {
    icon: '🗺️',
    title: 'Expert Local Knowledge',
    desc: 'Deep roots in the Maltese market with 15+ years of experience.',
  },
  {
    icon: '🏆',
    title: 'Premium Listings',
    desc: 'Curated portfolio of exclusive properties across all islands.',
  },
  {
    icon: '🕐',
    title: '24/7 Support',
    desc: 'Our team is always available to answer your questions.',
  },
  {
    icon: '❤️',
    title: 'Trusted by Hundreds',
    desc: 'Over 1,000 satisfied clients place their trust in us every year.',
  },
];

const TESTIMONIALS = [
  {
    initials: 'MF',
    name: 'Marco Farrugia',
    role: 'Property Buyer',
    quote:
      'Golden Key Realty made buying our dream home in Sliema completely effortless. Their knowledge of the local market is unmatched.',
  },
  {
    initials: 'SC',
    name: 'Sophie Camilleri',
    role: 'Tenant – Long Let',
    quote:
      'Found the perfect apartment in Valletta within a week. The team was professional, responsive and genuinely caring throughout.',
  },
  {
    initials: 'JB',
    name: 'James Borg',
    role: 'Investor',
    quote:
      "I've used Golden Key Realty for three investment properties now. Their property management service has been exceptional every time.",
  },
];

/* ─── Component ───────────────────────────────────────────────── */
export default function HomePage() {
  const [featuredProperties, setFeaturedProperties] = useState(null);
  const [apiServices, setApiServices] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contactResult, setContactResult] = useState(null); // 'success' | 'error'

  useEffect(() => {
    listingsApi.getAll({ featured: true, limit: 6 })
      .then(data => {
        if (data?.success && data?.data?.properties?.length > 0) {
          setFeaturedProperties(data.data.properties);
        }
      })
      .catch(() => {});
    servicesPublic.getPublic()
      .then(data => {
        if (data?.success && data?.data?.services?.length > 0) {
          setApiServices(data.data.services);
        }
      })
      .catch(() => {});
  }, []);

  const displayProperties = featuredProperties || PROPERTIES;
  const displayServices = apiServices
    ? apiServices.slice(0, 4).map(s => ({ icon: s.emoji || '🏠', title: s.name, desc: s.description }))
    : SERVICES;

  const handleContactChange = (e) => {
    setContactForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setContactSubmitting(true);
    setContactResult(null);
    try {
      const res = await fetch('/api/inquiries/public', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inquiryType: 'general',
          clientName: contactForm.name,
          clientEmail: contactForm.email,
          clientPhone: contactForm.phone,
          message: contactForm.message,
          source: 'website',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setContactResult('success');
        setContactForm({ name: '', email: '', phone: '', message: '' });
      } else {
        setContactResult('error');
      }
    } catch {
      setContactResult('error');
    } finally {
      setContactSubmitting(false);
    }
  };

  return (
    <div className="hp-page">
      {/* ── Navigation ── */}
      <nav className="hp-nav">
        <Link to="/" className="hp-nav-logo">
          <span className="hp-nav-logo-icon">🔑</span>
          Golden Key Realty
        </Link>

        <ul className={`hp-nav-links${mobileMenuOpen ? ' open' : ''}`}>
          {/* Home */}
          <li className="hp-nav-item">
            <Link to="/" className="hp-nav-link">Home</Link>
          </li>

          {/* Properties mega */}
          <li className="hp-nav-item">
            <span className="hp-nav-link">
              Properties <span className="hp-nav-chevron">▾</span>
            </span>
            <div className="hp-mega-menu">
              <Link to="/listings?type=sale">For Sale</Link>
              <Link to="/listings?type=long-let">For Rent (Long Let)</Link>
              <Link to="/listings?type=short-let">Short Let</Link>
              <Link to="/listings?type=commercial">Commercial</Link>
              <hr />
              <Link to="/listings" className="hp-mega-see-all">Browse All →</Link>
            </div>
          </li>

          {/* Services mega */}
          <li className="hp-nav-item">
            <span className="hp-nav-link">
              Services <span className="hp-nav-chevron">▾</span>
            </span>
            <div className="hp-mega-menu">
              <a href="/#services">Boat Tours</a>
              <a href="/#services">Car Rentals</a>
              <a href="/#services">Relocation</a>
              <a href="/#services">Property Management</a>
              <hr />
              <a href="/#services" className="hp-mega-see-all">View All →</a>
            </div>
          </li>

          {/* About mega */}
          <li className="hp-nav-item">
            <span className="hp-nav-link">
              About <span className="hp-nav-chevron">▾</span>
            </span>
            <div className="hp-mega-menu">
              <a href="/#about">About Us</a>
              <a href="/#team">Our Team</a>
              <a href="/#branches">Our Branches</a>
              <Link to="/join-us">Careers</Link>
            </div>
          </li>

          {/* Contact mega */}
          <li className="hp-nav-item">
            <span className="hp-nav-link">
              Contact <span className="hp-nav-chevron">▾</span>
            </span>
            <div className="hp-mega-menu">
              <a href="/#contact">Contact Us</a>
              <a href="https://wa.me/35699800363" target="_blank" rel="noopener noreferrer">WhatsApp</a>
              <a href="/#contact">Request a Viewing</a>
            </div>
          </li>

          {/* Join Us mega */}
          <li className="hp-nav-item">
            <span className="hp-nav-link">
              Join Us <span className="hp-nav-chevron">▾</span>
            </span>
            <div className="hp-mega-menu">
              <Link to="/join-us">Become an Affiliate</Link>
              <Link to="/partners">Partner With Us</Link>
            </div>
          </li>
        </ul>

        <button
          className="hp-mobile-toggle"
          aria-label="Toggle navigation"
          onClick={() => setMobileMenuOpen(prev => !prev)}
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>

        <Link to="/login" className="hp-nav-login">🔐 Login</Link>
      </nav>

      {/* ── Hero ── */}
      <section className="hp-hero">
        {/* Geometric SVG decoration */}
        <div className="hp-hero-bg">
          <svg viewBox="0 0 1440 800" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
            <defs>
              <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#B8864E" stopOpacity="0.6" />
              </linearGradient>
            </defs>
            {/* Hexagon grid pattern */}
            {[...Array(8)].map((_, row) =>
              [...Array(10)].map((_, col) => {
                const x = col * 160 + (row % 2 === 0 ? 0 : 80);
                const y = row * 120;
                return (
                  <polygon
                    key={`${row}-${col}`}
                    points={`${x},${y + 40} ${x + 40},${y} ${x + 80},${y} ${x + 120},${y + 40} ${x + 80},${y + 80} ${x + 40},${y + 80}`}
                    fill="none"
                    stroke="url(#g1)"
                    strokeWidth="1"
                  />
                );
              })
            )}
          </svg>
        </div>

        <div className="hp-hero-content">
          <div className="hp-hero-badge">🌍 Malta&#39;s #1 Real Estate Agency</div>
          <h1 className="hp-hero-title">Golden Key Realty</h1>
          <p className="hp-hero-subtitle">
            Malta&#39;s Premier Real Estate Agency — Find Your Dream Property
          </p>
          <div className="hp-hero-ctas">
            <Link to="/listings" className="hp-btn-primary">
              🏠 Browse Properties
            </Link>
            <a href="#contact" className="hp-btn-secondary">
              📞 Contact Us
            </a>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <div className="hp-stats">
        <div className="hp-stats-grid">
          <div>
            <span className="hp-stat-number">500+</span>
            <span className="hp-stat-label">Properties</span>
          </div>
          <div>
            <span className="hp-stat-number">50+</span>
            <span className="hp-stat-label">Agents</span>
          </div>
          <div>
            <span className="hp-stat-number">10+</span>
            <span className="hp-stat-label">Branches</span>
          </div>
          <div>
            <span className="hp-stat-number">1,000+</span>
            <span className="hp-stat-label">Happy Clients</span>
          </div>
        </div>
      </div>

      {/* ── Featured Properties ── */}
      <div className="hp-section-full">
        <div className="hp-section" style={{ padding: 0 }}>
          <h2 className="hp-section-title">Featured Properties</h2>
          <p className="hp-section-sub">
            Hand-picked listings across Malta&#39;s most sought-after locations
          </p>

          <div className="hp-props-grid">
            {displayProperties.map((p) => {
              const isApi = featuredProperties !== null;
              const image = isApi ? (p.images?.[0] || null) : null;
              let badge, location, price, beds, baths;
              if (isApi) {
                badge = p.listingType === 'sale' ? 'For Sale' : p.rentalType === 'long_let' ? 'Long Let' : 'Short Let';
                location = p.city ? `${p.city}, Malta` : 'Malta';
                price = p.price ? `€${Number(p.price).toLocaleString()}${p.listingType === 'rent' ? ' / mo' : ''}` : 'Price on request';
                beds = p.bedrooms;
                baths = p.bathrooms;
              } else {
                badge = p.badge;
                location = p.location;
                price = p.price;
                beds = p.beds;
                baths = p.baths;
              }
              return (
                <Link key={p.id} to={`/listings?property=${p.id}`} className="hp-prop-card" style={{ textDecoration: 'none' }}>
                  <div
                    className={`hp-prop-img${!isApi ? ` ${p.imgClass}` : ''}`}
                    style={image ? { backgroundImage: `url(${image})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
                  >
                    <span className="hp-prop-badge">{badge}</span>
                    {!image && <span>{isApi ? '🏠' : p.emoji}</span>}
                  </div>
                  <div className="hp-prop-body">
                    <div className="hp-prop-title">{p.title}</div>
                    <div className="hp-prop-location">📍 {location}</div>
                    <div className="hp-prop-price">{price}</div>
                    <div className="hp-prop-meta">
                      {beds && <span>🛏 {beds} beds</span>}
                      {baths && <span>🚿 {baths} baths</span>}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="hp-center">
            <Link to="/listings" className="hp-btn-primary">View All Properties →</Link>
          </div>
        </div>
      </div>

      {/* ── Services ── */}
      <div id="services" className="hp-section-alt">
        <div className="hp-section" style={{ padding: 0 }}>
          <h2 className="hp-section-title">Our Services</h2>
          <p className="hp-section-sub">
            Beyond property — a complete lifestyle solution in Malta
          </p>
          <div className="hp-services-grid">
            {displayServices.map((s) => (
              <div key={s.title} className="hp-service-card">
                <div className="hp-service-icon">{s.icon}</div>
                <div className="hp-service-title">{s.title}</div>
                <p className="hp-service-desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Why Choose Us ── */}
      <div id="about" className="hp-section-full">
        <div className="hp-section" style={{ padding: 0 }}>
          <h2 className="hp-section-title">Why Choose Us</h2>
          <p className="hp-section-sub">
            We go beyond transactions — we build lasting relationships
          </p>
          <div className="hp-why-grid">
            {WHY_US.map((w) => (
              <div key={w.title} className="hp-why-card">
                <div className="hp-why-icon">{w.icon}</div>
                <div>
                  <div className="hp-why-title">{w.title}</div>
                  <div className="hp-why-desc">{w.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Testimonials ── */}
      <div className="hp-section-alt">
        <div className="hp-section" style={{ padding: 0 }}>
          <h2 className="hp-section-title">What Our Clients Say</h2>
          <p className="hp-section-sub">Real stories from real people we&#39;ve helped</p>
          <div className="hp-testi-grid">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="hp-testi-card">
                <div className="hp-testi-stars">★★★★★</div>
                <p className="hp-testi-quote">&#34;{t.quote}&#34;</p>
                <div className="hp-testi-author">
                  <div className="hp-testi-avatar">{t.initials}</div>
                  <div>
                    <div className="hp-testi-name">{t.name}</div>
                    <div className="hp-testi-role">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Contact ── */}
      <div id="contact" className="hp-section-full">
        <div className="hp-section" style={{ padding: 0 }}>
          <h2 className="hp-section-title">Get In Touch</h2>
          <p className="hp-section-sub">
            Our team is ready to help you find the perfect property
          </p>
          <div className="hp-contact-inner">
            <div className="hp-contact-info">
              <h3>Talk to our team</h3>
              <p>
                Whether you&#39;re buying, renting, or simply exploring your options, our
                expert agents are here to guide you every step of the way. Reach us by
                phone, email, or WhatsApp — we respond fast.
              </p>
              <div className="hp-contact-items">
                <div className="hp-contact-item">
                  <div className="hp-contact-item-icon">📞</div>
                  <div>
                    <div className="hp-contact-item-label">Phone</div>
                    <div className="hp-contact-item-value">+356 9980 0363</div>
                  </div>
                </div>
                <div className="hp-contact-item">
                  <div className="hp-contact-item-icon">📧</div>
                  <div>
                    <div className="hp-contact-item-label">Email</div>
                    <div className="hp-contact-item-value">info@goldenkey.mt</div>
                  </div>
                </div>
                <div className="hp-contact-item">
                  <div className="hp-contact-item-icon">🌍</div>
                  <div>
                    <div className="hp-contact-item-label">Location</div>
                    <div className="hp-contact-item-value">Malta &amp; Gozo, Malta</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="hp-contact-cards">
              <a
                href="https://wa.me/35699800363"
                target="_blank"
                rel="noopener noreferrer"
                className="hp-contact-cta-card"
              >
                <div className="hp-contact-cta-icon">💬</div>
                <div className="hp-contact-cta-title">WhatsApp Us</div>
                <div className="hp-contact-cta-desc">Chat with an agent right now</div>
              </a>
              <a href="mailto:info@goldenkey.mt" className="hp-contact-cta-card">
                <div className="hp-contact-cta-icon">📧</div>
                <div className="hp-contact-cta-title">Send an Email</div>
                <div className="hp-contact-cta-desc">We reply within 2 hours</div>
              </a>
              <a href="#contact" className="hp-contact-cta-card">
                <div className="hp-contact-cta-icon">🏠</div>
                <div className="hp-contact-cta-title">Request a Viewing</div>
                <div className="hp-contact-cta-desc">Book a property visit today</div>
              </a>
            </div>
          </div>

          {/* Contact form */}
          <div className="hp-contact-form-wrap" style={{ marginTop: '2rem' }}>
            {contactResult === 'success' ? (
              <div className="hp-contact-form-success">
                ✅ Message sent! Our team will get back to you shortly.
              </div>
            ) : (
              <form className="hp-contact-form" onSubmit={handleContactSubmit}>
                {contactResult === 'error' && (
                  <div className="hp-contact-form-error">
                    ⚠️ Something went wrong. Please try again or contact us directly.
                  </div>
                )}
                <div className="hp-contact-form-row">
                  <div>
                    <label className="hp-contact-form-label">Full Name *</label>
                    <input
                      className="hp-contact-form-input"
                      name="name"
                      value={contactForm.name}
                      onChange={handleContactChange}
                      required
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="hp-contact-form-label">Email *</label>
                    <input
                      className="hp-contact-form-input"
                      name="email"
                      type="email"
                      value={contactForm.email}
                      onChange={handleContactChange}
                      required
                      placeholder="you@example.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="hp-contact-form-label">Phone</label>
                  <input
                    className="hp-contact-form-input"
                    name="phone"
                    value={contactForm.phone}
                    onChange={handleContactChange}
                    placeholder="+356 ..."
                  />
                </div>
                <div>
                  <label className="hp-contact-form-label">Message *</label>
                  <textarea
                    className="hp-contact-form-input"
                    name="message"
                    value={contactForm.message}
                    onChange={handleContactChange}
                    required
                    rows={4}
                    placeholder="How can we help you?"
                    style={{ resize: 'vertical' }}
                  />
                </div>
                <button
                  type="submit"
                  className="hp-btn-primary"
                  disabled={contactSubmitting}
                  style={{ marginTop: '0.5rem' }}
                >
                  {contactSubmitting ? 'Sending…' : '📩 Send Message'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <footer className="hp-footer">
        <div className="hp-footer-grid">
          {/* Col 1 — Brand */}
          <div>
            <Link to="/" className="hp-footer-logo">🔑 Golden Key Realty</Link>
            <p className="hp-footer-tagline">
              Your trusted partner for premium properties across the Maltese islands.
            </p>
            <a
              href="https://wa.me/35699800363"
              target="_blank"
              rel="noopener noreferrer"
              className="hp-footer-wa"
            >
              💬 +356 9980 0363
            </a>
          </div>

          {/* Col 2 — Quick Links */}
          <div>
            <div className="hp-footer-col-title">Quick Links</div>
            <ul className="hp-footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/listings">Properties</Link></li>
              <li><a href="/#services">Services</a></li>
              <li><a href="/#about">About Us</a></li>
              <li><a href="/#contact">Contact Us</a></li>
              <li><Link to="/join-us">Join Us</Link></li>
            </ul>
          </div>

          {/* Col 3 — Legal */}
          <div>
            <div className="hp-footer-col-title">Legal</div>
            <ul className="hp-footer-links">
              <li><Link to="/privacy-policy">Privacy Policy</Link></li>
              <li><Link to="/terms">Terms &amp; Conditions</Link></li>
              <li><Link to="/cookies">Cookie Policy</Link></li>
              <li><a href="#">GDPR Notice</a></li>
            </ul>
          </div>

          {/* Col 4 — Social */}
          <div>
            <div className="hp-footer-col-title">Follow Us</div>
            <ul className="hp-footer-social">
              <li><a href="#" target="_blank" rel="noopener noreferrer">📘 Facebook</a></li>
              <li><a href="#" target="_blank" rel="noopener noreferrer">📸 Instagram</a></li>
              <li><a href="#" target="_blank" rel="noopener noreferrer">💼 LinkedIn</a></li>
              <li><a href="#" target="_blank" rel="noopener noreferrer">🐦 Twitter/X</a></li>
              <li><a href="#" target="_blank" rel="noopener noreferrer">▶️ YouTube</a></li>
              <li><a href="#" target="_blank" rel="noopener noreferrer">🎵 TikTok</a></li>
              <li>
                <a href="https://wa.me/35699800363" target="_blank" rel="noopener noreferrer">
                  💬 WhatsApp
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="hp-footer-bottom">
          <p>© {new Date().getFullYear()} Golden Key Realty. All rights reserved.</p>
          <p>Powered by Malta Real Estate CRM</p>
        </div>
      </footer>
    </div>
  );
}
