import { useState, useEffect } from 'react';
import { owners } from '../services/api';
import './Modal.css';

const defaultForm = {
  firstName: '', lastName: '', email: '', phone: '', mobile: '',
  address: '', city: '', country: 'Malta', companyName: '', taxId: '', notes: ''
};

function OwnerModal({ owner, onClose, onSaved }) {
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
        companyName: owner.companyName || '',
        taxId: owner.taxId || '',
        notes: owner.notes || ''
      });
    }
  }, [owner]);

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
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
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-header">
          <h2>{owner ? 'Edit Owner' : 'Add New Owner'}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {error && <div className="alert alert-error">{error}</div>}

          <div className="form-row">
            <div className="form-group">
              <label>First Name *</label>
              <input name="firstName" className="form-input" value={form.firstName} onChange={handleChange} required placeholder="John" />
            </div>
            <div className="form-group">
              <label>Last Name *</label>
              <input name="lastName" className="form-input" value={form.lastName} onChange={handleChange} required placeholder="Doe" />
            </div>
          </div>

          <div className="form-group">
            <label>Email *</label>
            <input name="email" type="email" className="form-input" value={form.email} onChange={handleChange} required placeholder="john.doe@example.mt" />
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
              <label>Company Name</label>
              <input name="companyName" className="form-input" value={form.companyName} onChange={handleChange} placeholder="Malta Properties Ltd" />
            </div>
            <div className="form-group">
              <label>Tax ID / VAT</label>
              <input name="taxId" className="form-input" value={form.taxId} onChange={handleChange} placeholder="MT12345678" />
            </div>
          </div>

          <div className="form-group">
            <label>Notes</label>
            <textarea name="notes" className="form-input" rows={3} value={form.notes} onChange={handleChange} placeholder="Internal notes about this owner…" style={{resize:'vertical'}} />
          </div>

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
