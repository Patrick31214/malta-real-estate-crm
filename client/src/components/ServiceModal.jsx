import { useState, useEffect } from 'react';
import { services } from '../services/api';
import './Modal.css';

const CATEGORIES = ['boat_tour', 'car_rental', 'bike_rental', 'guided_tour', 'other'];
const CURRENCIES = ['EUR', 'USD', 'GBP'];

const defaultForm = {
  title: '',
  description: '',
  category: 'boat_tour',
  price: '',
  currency: 'EUR',
  duration: '',
  location: '',
  contactName: '',
  contactPhone: '',
  contactEmail: '',
  available: true,
  featured: false,
};

function ServiceModal({ service, onClose, onSaved }) {
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (service) {
      setForm({
        title: service.title || '',
        description: service.description || '',
        category: service.category || 'boat_tour',
        price: service.price ?? '',
        currency: service.currency || 'EUR',
        duration: service.duration || '',
        location: service.location || '',
        contactName: service.contactName || '',
        contactPhone: service.contactPhone || '',
        contactEmail: service.contactEmail || '',
        available: service.available !== false,
        featured: service.featured || false,
      });
    }
  }, [service]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = { ...form, price: form.price !== '' ? Number(form.price) : 0 };
      const res = service
        ? await services.update(service.id, payload)
        : await services.create(payload);
      if (res.success) {
        onSaved();
      } else {
        setError(res.message || 'Failed to save service.');
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
          <h2>{service ? 'Edit Service' : 'Add New Service'}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {error && <div className="alert alert-error">{error}</div>}

          <div className="form-row">
            <div className="form-group flex-2">
              <label>Title *</label>
              <input name="title" className="form-input" value={form.title} onChange={handleChange} required placeholder="e.g. Sunset Boat Tour around Malta" />
            </div>
            <div className="form-group">
              <label>Category *</label>
              <select name="category" className="form-input" value={form.category} onChange={handleChange}>
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea name="description" className="form-input" rows={3} value={form.description} onChange={handleChange} placeholder="Describe the service…" style={{ resize: 'vertical' }} />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Price</label>
              <input name="price" type="number" min="0" step="0.01" className="form-input" value={form.price} onChange={handleChange} placeholder="75" />
            </div>
            <div className="form-group">
              <label>Currency</label>
              <select name="currency" className="form-input" value={form.currency} onChange={handleChange}>
                {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Duration</label>
              <input name="duration" className="form-input" value={form.duration} onChange={handleChange} placeholder="2 hours" />
            </div>
          </div>

          <div className="form-group">
            <label>Location</label>
            <input name="location" className="form-input" value={form.location} onChange={handleChange} placeholder="Valletta Harbour, Malta" />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Contact Name</label>
              <input name="contactName" className="form-input" value={form.contactName} onChange={handleChange} placeholder="John Borg" />
            </div>
            <div className="form-group">
              <label>Contact Phone</label>
              <input name="contactPhone" className="form-input" value={form.contactPhone} onChange={handleChange} placeholder="+356 9912 3456" />
            </div>
          </div>

          <div className="form-group">
            <label>Contact Email</label>
            <input name="contactEmail" type="email" className="form-input" value={form.contactEmail} onChange={handleChange} placeholder="info@service.mt" />
          </div>

          <div className="form-row" style={{ gap: 24 }}>
            <div className="form-group-inline">
              <label>
                <input type="checkbox" name="available" checked={form.available} onChange={handleChange} />
                &nbsp;Available
              </label>
            </div>
            <div className="form-group-inline">
              <label>
                <input type="checkbox" name="featured" checked={form.featured} onChange={handleChange} />
                &nbsp;Featured
              </label>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving…' : (service ? 'Save Changes' : 'Add Service')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ServiceModal;
