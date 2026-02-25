import { useState, useEffect } from 'react';
import { properties, owners } from '../services/api';
import './Modal.css';

const PROPERTY_TYPES = ['apartment', 'house', 'villa', 'townhouse', 'penthouse', 'maisonette', 'farmhouse', 'commercial', 'office', 'land', 'garage', 'other'];
const STATUSES = ['available', 'under_offer', 'sold', 'rented', 'withdrawn', 'draft'];
const MALTA_CITIES = ['Valletta', 'Sliema', 'St. Julian\'s', 'Mdina', 'Rabat', 'Mosta', 'Naxxar', 'Birkirkara', 'Qormi', 'Marsaskala', 'Mellieha', 'Gozo', 'Other'];

const defaultForm = {
  title: '', description: '', propertyType: 'apartment', listingType: 'sale',
  status: 'draft', price: '', currency: 'EUR', bedrooms: '', bathrooms: '',
  squareMeters: '', address: '', city: 'Valletta', country: 'Malta',
  ownerId: '', featured: false
};

function PropertyModal({ property, onClose, onSaved }) {
  const [form, setForm] = useState(defaultForm);
  const [ownerList, setOwnerList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Load owners for select
    owners.getAll({ limit: 100 }).then(res => {
      if (res.success) setOwnerList(res.data.owners);
    });

    // Pre-fill form if editing
    if (property) {
      setForm({
        title: property.title || '',
        description: property.description || '',
        propertyType: property.propertyType || 'apartment',
        listingType: property.listingType || 'sale',
        status: property.status || 'draft',
        price: property.price || '',
        currency: property.currency || 'EUR',
        bedrooms: property.bedrooms ?? '',
        bathrooms: property.bathrooms ?? '',
        squareMeters: property.squareMeters ?? '',
        address: property.address || '',
        city: property.city || 'Valletta',
        country: property.country || 'Malta',
        ownerId: property.ownerId || '',
        featured: property.featured || false
      });
    }
  }, [property]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Build payload - remove empty strings for optional numeric fields
    const payload = { ...form };
    ['bedrooms', 'bathrooms', 'squareMeters'].forEach(k => {
      if (payload[k] === '') delete payload[k];
      else if (payload[k] !== '') payload[k] = Number(payload[k]);
    });
    payload.price = Number(payload.price);

    try {
      const res = property
        ? await properties.update(property.id, payload)
        : await properties.create(payload);

      if (res.success) {
        onSaved();
      } else {
        setError(res.message || 'Failed to save property.');
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
          <h2>{property ? 'Edit Property' : 'Add New Property'}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {error && <div className="alert alert-error">{error}</div>}

          <div className="form-row">
            <div className="form-group flex-2">
              <label>Title *</label>
              <input name="title" className="form-input" value={form.title} onChange={handleChange} required placeholder="e.g. Modern 3BR Apartment in Sliema" />
            </div>
            <div className="form-group">
              <label>Owner *</label>
              <select name="ownerId" className="form-input" value={form.ownerId} onChange={handleChange} required>
                <option value="">Select owner…</option>
                {ownerList.map(o => (
                  <option key={o.id} value={o.id}>{o.firstName} {o.lastName}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Property Type *</label>
              <select name="propertyType" className="form-input" value={form.propertyType} onChange={handleChange}>
                {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Listing Type *</label>
              <select name="listingType" className="form-input" value={form.listingType} onChange={handleChange}>
                <option value="sale">For Sale</option>
                <option value="rent">For Rent</option>
                <option value="lease">Lease</option>
              </select>
            </div>
            <div className="form-group">
              <label>Status *</label>
              <select name="status" className="form-input" value={form.status} onChange={handleChange}>
                {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Price (€) *</label>
              <input name="price" type="number" min="0" className="form-input" value={form.price} onChange={handleChange} required placeholder="250000" />
            </div>
            <div className="form-group">
              <label>Bedrooms</label>
              <input name="bedrooms" type="number" min="0" className="form-input" value={form.bedrooms} onChange={handleChange} placeholder="3" />
            </div>
            <div className="form-group">
              <label>Bathrooms</label>
              <input name="bathrooms" type="number" min="0" className="form-input" value={form.bathrooms} onChange={handleChange} placeholder="2" />
            </div>
            <div className="form-group">
              <label>Size (m²)</label>
              <input name="squareMeters" type="number" min="0" className="form-input" value={form.squareMeters} onChange={handleChange} placeholder="120" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group flex-2">
              <label>Address *</label>
              <input name="address" className="form-input" value={form.address} onChange={handleChange} required placeholder="123 Triq il-Kbira" />
            </div>
            <div className="form-group">
              <label>City *</label>
              <select name="city" className="form-input" value={form.city} onChange={handleChange}>
                {MALTA_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea name="description" className="form-input" rows={3} value={form.description} onChange={handleChange} placeholder="Describe the property…" style={{resize:'vertical'}} />
          </div>

          <div className="form-group-inline">
            <label>
              <input type="checkbox" name="featured" checked={form.featured} onChange={handleChange} />
              &nbsp;Mark as Featured
            </label>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving…' : (property ? 'Save Changes' : 'Create Property')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PropertyModal;
