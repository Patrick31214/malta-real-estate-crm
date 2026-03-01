import { useState, useEffect } from 'react';
import { owners } from '../services/api';
import './Modal.css';

const TITLE_OPTIONS = ['Mr', 'Mrs', 'Ms', 'Dr', 'Prof', 'Eng', 'Other'];
const LANGUAGE_OPTIONS = ['English', 'Maltese', 'Italian', 'Other'];
const RELATIONSHIP_OPTIONS = [
  'Wife', 'Husband', 'Son', 'Daughter', 'Property Manager', 'Lawyer',
  'Accountant', 'Secretary', 'Company Representative', 'Other',
];

const defaultContact = () => ({
  relationship: '', fullName: '', email: '', phone: '', whatsapp: '', notes: '',
});

const defaultForm = {
  firstName: '', lastName: '', email: '', phone: '', mobile: '',
  address: '', city: '', country: 'Malta',
  // new personal fields
  title: '', whatsapp: '', idCardNumber: '', passportNumber: '',
  nationality: '', dateOfBirth: '', preferredLanguage: '', preferredContactMethod: 'phone',
  notes: '',
  // company
  companyName: '', taxId: '', companyReg: '', companyEmail: '',
  companyPhone: '', companyAddress: '', vatNumber: '',
  // related contacts
  relatedContacts: [],
};

function SectionHeader({ title, open, onToggle }) {
  return (
    <div className="collapsible-header" onClick={onToggle}>
      <span>{title}</span>
      <span className={`chevron${open ? ' open' : ''}`}>▼</span>
    </div>
  );
}

function OwnerModal({ owner, onClose, onSaved }) {
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sections, setSections] = useState({ company: false, contacts: false });
  const toggleSection = name => setSections(s => ({ ...s, [name]: !s[name] }));

  useEffect(() => {
    if (owner) {
      setForm({
        firstName: owner.firstName || '',
        lastName: owner.lastName || '',
        email: owner.email || '',
        phone: owner.phone || '',
        mobile: owner.mobile || '',
        address: owner.address || '',
        city: owner.city || '',
        country: owner.country || 'Malta',
        title: owner.title || '',
        whatsapp: owner.whatsapp || '',
        idCardNumber: owner.idCardNumber || '',
        passportNumber: owner.passportNumber || '',
        nationality: owner.nationality || '',
        dateOfBirth: owner.dateOfBirth ? owner.dateOfBirth.slice(0, 10) : '',
        preferredLanguage: owner.preferredLanguage || '',
        preferredContactMethod: owner.preferredContactMethod || 'phone',
        notes: owner.notes || '',
        companyName: owner.companyName || '',
        taxId: owner.taxId || '',
        companyReg: owner.companyReg || '',
        companyEmail: owner.companyEmail || '',
        companyPhone: owner.companyPhone || '',
        companyAddress: owner.companyAddress || '',
        vatNumber: owner.vatNumber || '',
        relatedContacts: Array.isArray(owner.relatedContacts) ? owner.relatedContacts : [],
      });
    }
  }, [owner]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleContactChange = (idx, field, value) => {
    setForm(f => {
      const updated = f.relatedContacts.map((c, i) => i === idx ? { ...c, [field]: value } : c);
      return { ...f, relatedContacts: updated };
    });
  };

  const addContact = () => {
    setForm(f => ({ ...f, relatedContacts: [...f.relatedContacts, defaultContact()] }));
    setSections(s => ({ ...s, contacts: true }));
  };

  const removeContact = (idx) => {
    setForm(f => ({ ...f, relatedContacts: f.relatedContacts.filter((_, i) => i !== idx) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = owner
        ? await owners.update(owner.id, form)
        : await owners.create(form);

      if (res.success) {
        onSaved();
      } else {
        setError(res.message || 'Failed to save owner.');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ width: '95vw', maxWidth: '1200px', height: '90vh' }}>
        <div className="modal-header">
          <h2>{owner ? 'Edit Owner' : 'Add New Owner'}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {error && <div className="alert alert-error">{error}</div>}

          {/* ── Personal Details ── */}
          <div className="form-row">
            <div className="form-group" style={{ flex: '0 0 120px' }}>
              <label>Title</label>
              <select name="title" className="form-input" value={form.title} onChange={handleChange}>
                <option value="">—</option>
                {TITLE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>First Name *</label>
              <input name="firstName" className="form-input" value={form.firstName} onChange={handleChange} required placeholder="John" />
            </div>
            <div className="form-group">
              <label>Last Name *</label>
              <input name="lastName" className="form-input" value={form.lastName} onChange={handleChange} required placeholder="Doe" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group flex-2">
              <label>Email *</label>
              <input name="email" type="email" className="form-input" value={form.email} onChange={handleChange} required placeholder="john.doe@example.mt" />
            </div>
            <div className="form-group">
              <label>Nationality</label>
              <input name="nationality" className="form-input" value={form.nationality} onChange={handleChange} placeholder="Maltese" />
            </div>
            <div className="form-group">
              <label>Date of Birth</label>
              <input name="dateOfBirth" type="date" className="form-input" value={form.dateOfBirth} onChange={handleChange} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Phone</label>
              <input name="phone" className="form-input" value={form.phone} onChange={handleChange} placeholder="+356 2123 4567" />
            </div>
            <div className="form-group">
              <label>Mobile</label>
              <input name="mobile" className="form-input" value={form.mobile} onChange={handleChange} placeholder="+356 9912 3456" />
            </div>
            <div className="form-group">
              <label>WhatsApp Number</label>
              <input name="whatsapp" className="form-input" value={form.whatsapp} onChange={handleChange} placeholder="+356 9912 3456" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>ID Card Number</label>
              <input name="idCardNumber" className="form-input" value={form.idCardNumber} onChange={handleChange} placeholder="123456M" />
            </div>
            <div className="form-group">
              <label>Passport Number</label>
              <input name="passportNumber" className="form-input" value={form.passportNumber} onChange={handleChange} placeholder="AB1234567" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group flex-2">
              <label>Address</label>
              <input name="address" className="form-input" value={form.address} onChange={handleChange} placeholder="123 Triq il-Kbira" />
            </div>
            <div className="form-group">
              <label>City</label>
              <input name="city" className="form-input" value={form.city} onChange={handleChange} placeholder="Valletta" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Preferred Language</label>
              <select name="preferredLanguage" className="form-input" value={form.preferredLanguage} onChange={handleChange}>
                <option value="">Select…</option>
                {LANGUAGE_OPTIONS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Preferred Contact Method</label>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center', paddingTop: 6 }}>
                {['phone', 'email', 'whatsapp'].map(m => (
                  <label key={m} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="preferredContactMethod"
                      value={m}
                      checked={form.preferredContactMethod === m}
                      onChange={handleChange}
                    />
                    {m.charAt(0).toUpperCase() + m.slice(1)}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Notes</label>
            <textarea name="notes" className="form-input" rows={3} value={form.notes} onChange={handleChange} placeholder="Internal notes about this owner…" style={{ resize: 'vertical' }} />
          </div>

          {/* ── Company Info ── */}
          <SectionHeader title="🏢 Company Info" open={sections.company} onToggle={() => toggleSection('company')} />
          {sections.company && (
            <div className="collapsible-section">
              <div className="form-row">
                <div className="form-group flex-2">
                  <label>Company Name</label>
                  <input name="companyName" className="form-input" value={form.companyName} onChange={handleChange} placeholder="Malta Properties Ltd" />
                </div>
                <div className="form-group">
                  <label>Company Reg. Number</label>
                  <input name="companyReg" className="form-input" value={form.companyReg} onChange={handleChange} placeholder="C 12345" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Company Email</label>
                  <input name="companyEmail" type="email" className="form-input" value={form.companyEmail} onChange={handleChange} placeholder="info@company.mt" />
                </div>
                <div className="form-group">
                  <label>Company Phone</label>
                  <input name="companyPhone" className="form-input" value={form.companyPhone} onChange={handleChange} placeholder="+356 2123 0000" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group flex-2">
                  <label>Company Address</label>
                  <input name="companyAddress" className="form-input" value={form.companyAddress} onChange={handleChange} placeholder="123 Business Centre, Valletta" />
                </div>
                <div className="form-group">
                  <label>VAT Number</label>
                  <input name="vatNumber" className="form-input" value={form.vatNumber} onChange={handleChange} placeholder="MT12345678" />
                </div>
                <div className="form-group">
                  <label>Tax ID</label>
                  <input name="taxId" className="form-input" value={form.taxId} onChange={handleChange} placeholder="12345678" />
                </div>
              </div>
            </div>
          )}

          {/* ── Related Contacts ── */}
          <SectionHeader
            title={`👥 Related Contacts${form.relatedContacts.length > 0 ? ` (${form.relatedContacts.length})` : ''}`}
            open={sections.contacts}
            onToggle={() => toggleSection('contacts')}
          />
          {sections.contacts && (
            <div className="collapsible-section">
              {form.relatedContacts.map((contact, idx) => (
                <div key={idx} style={{ border: '1px solid var(--glass-border)', borderRadius: 8, padding: '12px', marginBottom: 10, background: 'rgba(196,135,90,0.03)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <strong style={{ fontSize: 13 }}>Contact #{idx + 1}</strong>
                    <button type="button" className="btn btn-danger btn-sm" onClick={() => removeContact(idx)}>Remove</button>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Relationship</label>
                      <select className="form-input" value={contact.relationship} onChange={e => handleContactChange(idx, 'relationship', e.target.value)}>
                        <option value="">Select…</option>
                        {RELATIONSHIP_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                    <div className="form-group flex-2">
                      <label>Full Name</label>
                      <input className="form-input" value={contact.fullName} onChange={e => handleContactChange(idx, 'fullName', e.target.value)} placeholder="Jane Doe" />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Email</label>
                      <input type="email" className="form-input" value={contact.email} onChange={e => handleContactChange(idx, 'email', e.target.value)} placeholder="jane@example.mt" />
                    </div>
                    <div className="form-group">
                      <label>Phone</label>
                      <input className="form-input" value={contact.phone} onChange={e => handleContactChange(idx, 'phone', e.target.value)} placeholder="+356 9912 3456" />
                    </div>
                    <div className="form-group">
                      <label>WhatsApp</label>
                      <input className="form-input" value={contact.whatsapp} onChange={e => handleContactChange(idx, 'whatsapp', e.target.value)} placeholder="+356 9912 3456" />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Notes</label>
                    <textarea className="form-input" rows={2} value={contact.notes} onChange={e => handleContactChange(idx, 'notes', e.target.value)} placeholder="Notes about this contact…" style={{ resize: 'vertical' }} />
                  </div>
                </div>
              ))}
              <button type="button" className="btn btn-outline btn-sm" onClick={addContact} style={{ marginTop: 4 }}>
                + Add Contact
              </button>
            </div>
          )}
          {!sections.contacts && (
            <div style={{ textAlign: 'right', marginTop: 4 }}>
              <button type="button" className="btn btn-outline btn-sm" onClick={addContact}>
                + Add Related Contact
              </button>
            </div>
          )}

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving…' : (owner ? 'Save Changes' : 'Add Owner')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default OwnerModal;
