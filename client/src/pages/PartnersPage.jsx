import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Handshake } from 'lucide-react';

function PartnersPage() {
  const [form, setForm] = useState({
    company: '',
    contactName: '',
    email: '',
    phone: '',
    partnershipType: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/inquiries/public', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inquiryType: 'partnership',
          clientName: form.contactName,
          clientEmail: form.email,
          clientPhone: form.phone,
          message: form.message,
          source: 'website',
          notes: `Company: ${form.company}, Partnership Type: ${form.partnershipType}`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
      } else {
        setError(data.message || 'Submission failed. Please try again.');
      }
    } catch {
      setError('Network error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0A0A0A 0%, #1A1A2E 40%, #1B4332 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 20px',
    }}>
      <div style={{ maxWidth: 640, width: '100%' }}>
        {/* Header */}
        <div style={{ marginBottom: 16 }}>
          <Link to="/" style={{ color: '#D4AF37', textDecoration: 'none', fontSize: 14 }}>← Back to Home</Link>
        </div>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #D4AF37, #F0D060)',
            boxShadow: '0 4px 20px rgba(212,175,55,0.4)',
            marginBottom: 20,
          }}>
            <Handshake size={32} color="#1B4332" strokeWidth={2} />
          </div>
          <h1 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 36,
            fontWeight: 700,
            color: '#FFFFFF',
            marginBottom: 12,
            lineHeight: 1.2,
          }}>
            Partner With Us
          </h1>
          <p style={{
            color: 'rgba(255,255,255,0.65)',
            fontSize: 16,
            lineHeight: 1.7,
            maxWidth: 480,
            margin: '0 auto',
          }}>
            Explore strategic partnership opportunities with Golden Key Realty. Together we can deliver exceptional real estate experiences across Malta.
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(212,175,55,0.06)',
          border: '1px solid rgba(212,175,55,0.2)',
          borderRadius: 20,
          padding: '40px 48px',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: '0 8px 40px rgba(212,175,55,0.15)',
        }}>
          {submitted ? (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>🤝</div>
              <h2 style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 24,
                color: '#D4AF37',
                marginBottom: 12,
              }}>
                Inquiry Received!
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.65)', lineHeight: 1.7 }}>
                Thank you for reaching out. Our partnerships team will contact you within 3–5 business days to discuss how we can collaborate.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && (
                <div style={{ marginBottom: 16, padding: '12px 16px', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, color: '#f87171', fontSize: 14 }}>
                  ⚠️ {error}
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                <div>
                  <label style={labelStyle}>Company Name *</label>
                  <input
                    name="company"
                    value={form.company}
                    onChange={handleChange}
                    required
                    placeholder="Your company"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Contact Name *</label>
                  <input
                    name="contactName"
                    value={form.contactName}
                    onChange={handleChange}
                    required
                    placeholder="Full name"
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                <div>
                  <label style={labelStyle}>Email Address *</label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    placeholder="you@company.com"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Phone Number</label>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+356 ..."
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>Partnership Type *</label>
                <select
                  name="partnershipType"
                  value={form.partnershipType}
                  onChange={handleChange}
                  required
                  style={inputStyle}
                >
                  <option value="">Select partnership type</option>
                  <option value="referral">Referral Partnership</option>
                  <option value="co-listing">Co-Listing Agreement</option>
                  <option value="developer">Property Developer</option>
                  <option value="financial">Financial Services</option>
                  <option value="legal">Legal / Notarial</option>
                  <option value="marketing">Marketing & Media</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div style={{ marginBottom: 28 }}>
                <label style={labelStyle}>Message *</label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  required
                  rows={4}
                  placeholder="Describe your partnership proposal and what you hope to achieve..."
                  style={{ ...inputStyle, height: 'auto', resize: 'vertical' }}
                />
              </div>

              <button type="submit" disabled={loading} style={{ ...submitButtonStyle, opacity: loading ? 0.7 : 1 }}>
                {loading ? 'Submitting…' : 'Submit Partnership Inquiry'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

const labelStyle = {
  display: 'block',
  fontSize: 11,
  fontWeight: 700,
  color: '#D4AF37',
  textTransform: 'uppercase',
  letterSpacing: '0.8px',
  marginBottom: 6,
};

const inputStyle = {
  width: '100%',
  padding: '12px 16px',
  background: 'rgba(255,255,255,0.06)',
  border: '1.5px solid rgba(212,175,55,0.25)',
  borderRadius: 10,
  color: '#FFFFFF',
  fontSize: 15,
  fontFamily: 'inherit',
  outline: 'none',
  boxSizing: 'border-box',
};

const submitButtonStyle = {
  width: '100%',
  padding: '14px 24px',
  background: 'linear-gradient(135deg, #D4AF37, #F0D060)',
  border: 'none',
  borderRadius: 12,
  color: '#1B4332',
  fontSize: 16,
  fontWeight: 700,
  cursor: 'pointer',
  fontFamily: 'inherit',
  boxShadow: '0 4px 20px rgba(212,175,55,0.35)',
  transition: 'opacity 0.2s',
};

export default PartnersPage;
