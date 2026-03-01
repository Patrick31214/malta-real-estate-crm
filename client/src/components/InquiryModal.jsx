import { useState, useEffect } from 'react';
import { inquiries, properties } from '../services/api';
import './Modal.css';

const INQUIRY_TYPES = ['viewing_request', 'information_request', 'make_offer', 'callback_request', 'general'];
const STATUSES = ['new', 'assigned', 'in_progress', 'viewing_scheduled', 'matched', 'resolved', 'cancelled', 'on_hold'];
const PRIORITIES = ['low', 'medium', 'high', 'urgent'];
const SOURCES = ['website', 'phone', 'walk_in', 'email', 'referral', 'chatbot', 'whatsapp'];

const defaultForm = {
  clientName: '', clientEmail: '', clientPhone: '',
  propertyId: '', inquiryType: 'general', status: 'new',
  priority: 'medium', message: '', notes: '', source: 'website'
};

function InquiryModal({ inquiry, onClose, onSaved }) {
  const [form, setForm] = useState(defaultForm);
  const [propertyList, setPropertyList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    properties.getAll({ limit: 200 }).then(res => {
      if (res.success) setPropertyList(res.data.properties);
    });

    if (inquiry) {
      setForm({
        clientName: inquiry.clientName || '',
        clientEmail: inquiry.clientEmail || '',
        clientPhone: inquiry.clientPhone || '',
        propertyId: inquiry.propertyId || '',
        inquiryType: inquiry.inquiryType || 'general',
        status: inquiry.status || 'new',
        priority: inquiry.priority || 'medium',
        message: inquiry.message || '',
        notes: inquiry.notes || '',
        source: inquiry.source || 'website'
      });
    }
  }, [inquiry]);

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = inquiry
        ? await inquiries.update(inquiry.id, form)
        : await inquiries.create(form);

      if (res.success) {
        onSaved();
      } else {
        setError(res.message || 'Failed to save inquiry.');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-header">
          <h2>{inquiry ? 'Edit Inquiry' : 'Add New Inquiry'}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {error && <div className="alert alert-error">{error}</div>}

          <div className="form-row">
            <div className="form-group flex-2">
              <label>Client Name *</label>
              <input name="clientName" className="form-input" value={form.clientName} onChange={handleChange} required placeholder="Jane Smith" />
            </div>
            <div className="form-group">
              <label>Priority</label>
              <select name="priority" className="form-input" value={form.priority} onChange={handleChange}>
                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Email *</label>
              <input name="clientEmail" type="email" className="form-input" value={form.clientEmail} onChange={handleChange} required placeholder="jane@example.com" />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input name="clientPhone" className="form-input" value={form.clientPhone} onChange={handleChange} placeholder="+356 9912 3456" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group flex-2">
              <label>Property <span style={{fontWeight:400,color:'var(--text-light)'}}>(optional)</span></label>
              <select name="propertyId" className="form-input" value={form.propertyId} onChange={handleChange}>
                <option value="">No specific property…</option>
                {propertyList.map(p => (
                  <option key={p.id} value={p.id}>{p.title} — {p.city}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Inquiry Type</label>
              <select name="inquiryType" className="form-input" value={form.inquiryType} onChange={handleChange}>
                {INQUIRY_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Status</label>
              <select name="status" className="form-input" value={form.status} onChange={handleChange}>
                {STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Source</label>
              <select name="source" className="form-input" value={form.source} onChange={handleChange}>
                {SOURCES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Message</label>
            <textarea name="message" className="form-input" rows={3} value={form.message} onChange={handleChange} placeholder="Client's inquiry message…" style={{resize:'vertical'}} />
          </div>

          <div className="form-group">
            <label>Internal Notes</label>
            <textarea name="notes" className="form-input" rows={2} value={form.notes} onChange={handleChange} placeholder="Private notes…" style={{resize:'vertical'}} />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving…' : (inquiry ? 'Save Changes' : 'Create Inquiry')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default InquiryModal;
