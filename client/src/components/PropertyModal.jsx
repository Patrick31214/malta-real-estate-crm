import { useState, useEffect, useRef, useCallback } from 'react';
import { properties, owners, upload } from '../services/api';
import './Modal.css';

const PROPERTY_TYPES = ['apartment', 'house', 'villa', 'townhouse', 'penthouse', 'maisonette', 'farmhouse', 'bungalow', 'warehouse', 'commercial', 'office', 'land', 'garage', 'other'];
const STATUSES = ['available', 'under_offer', 'sold', 'rented', 'withdrawn', 'draft'];
const MALTA_CITIES = [
  'Valletta', 'Sliema', 'St. Julian\'s', 'Mdina', 'Rabat', 'Mosta', 'Naxxar', 'Birkirkara',
  'Qormi', 'Marsaskala', 'Mellieha', 'Gozo', 'Marsaxlokk', 'Żabbar', 'Żejtun', 'Żurrieq',
  'Birgu', 'Bormla', 'Isla', 'Gżira', 'Msida', 'Pietà', 'Floriana', 'Hamrun', 'Marsa',
  'Tarxien', 'Luqa', 'Kirkop', 'Żebbuġ', 'Siggiewi', 'Qrendi', 'Mqabba', 'Gudja', 'Għaxaq',
  'Birzebbuga', 'Fgura', 'Paola', 'Sgħajtar', 'San Ġwann', 'Swieqi', 'Pembroke',
  'St. Paul\'s Bay', 'Bugibba', 'Qawra', 'Xemxija', 'Victoria', 'Sannat', 'Xewkija',
  'Kerċem', 'Munxar', 'Xlendi', 'Marsalforn', 'Nadur', 'Xagħra', 'Żebbuġ (Gozo)',
  'Gharb', 'San Lawrenz', 'Other',
];

const FEATURE_LIST = [
  'Sea View', 'Sea Front', 'Pool', 'Private Pool', 'Garden', 'Terrace', 'Roof Terrace', 'Balcony',
  'Elevator', 'AC', 'Central Heating', 'Fireplace', 'Solar Panels', 'Alarm', 'CCTV',
  'Built-in Wardrobes', 'Laundry Room', 'Pet Friendly', 'BBQ', 'Gym', 'Jacuzzi',
  'Near Schools', 'Near Transport', 'Near Shops', 'Gated Community',
];

const featureKey = name => name.toLowerCase().replace(/[\s/]+/g, '_').replace(/[^a-z0-9_]/g, '');
const defaultFeatures = () => Object.fromEntries(FEATURE_LIST.map(f => [featureKey(f), false]));

const defaultForm = {
  title: '', description: '', propertyType: 'apartment', listingType: 'sale',
  status: 'draft', price: '', currency: 'EUR', bedrooms: '', bathrooms: '',
  squareMeters: '', address: '', city: 'Valletta', country: 'Malta',
  ownerId: '', featured: false, rentalType: '', availableFrom: '', images: [],
  priceNegotiable: false,
  region: '', postalCode: '', floorNumber: '', totalFloors: '',
  yearBuilt: '', renovatedYear: '', energyRating: '', furnished: '',
  parkingSpaces: '', garage: false,
  videoUrl: '', virtualTourUrl: '',
  childrenFriendly: false,
  postedToWebsite: false,
  postedToFacebook: false,
  postedToInstagram: false,
  features: defaultFeatures(),
};

function SectionHeader({ title, open, onToggle }) {
  return (
    <div className="collapsible-header" onClick={onToggle}>
      <span>{title}</span>
      <span className={`chevron${open ? ' open' : ''}`}>▼</span>
    </div>
  );
}

function PropertyModal({ property, onClose, onSaved }) {
  const [form, setForm] = useState(defaultForm);
  const [ownerList, setOwnerList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [pendingFiles, setPendingFiles] = useState([]); // { file: File, previewUrl: string }
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const [sections, setSections] = useState({ location: true, specs: false, features: false, publishing: true, media: false });
  const toggleSection = name => setSections(s => ({ ...s, [name]: !s[name] }));

  useEffect(() => {
    owners.getAll({ limit: 100 }).then(res => {
      if (res.success) setOwnerList(res.data.owners);
    });

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
        featured: property.featured || false,
        rentalType: property.rentalType || '',
        availableFrom: property.availableFrom ? property.availableFrom.slice(0, 10) : '',
        images: Array.isArray(property.images) ? property.images : [],
        priceNegotiable: property.priceNegotiable || false,
        region: property.region || '',
        postalCode: property.postalCode || '',
        floorNumber: property.floorNumber ?? '',
        totalFloors: property.totalFloors ?? '',
        yearBuilt: property.yearBuilt ?? '',
        renovatedYear: property.renovatedYear ?? '',
        energyRating: property.energyRating || '',
        furnished: property.furnished || '',
        parkingSpaces: property.parkingSpaces ?? '',
        garage: property.garage || false,
        videoUrl: property.videoUrl || '',
        virtualTourUrl: property.virtualTourUrl || '',
        childrenFriendly: property.childrenFriendly || false,
        postedToWebsite: property.postedToWebsite || false,
        postedToFacebook: property.postedToFacebook || false,
        postedToInstagram: property.postedToInstagram || false,
        features: { ...defaultFeatures(), ...(property.features || {}) },
      });
    }
  }, [property]);

  // Revoke object URLs on unmount to avoid memory leaks
  useEffect(() => {
    return () => { pendingFiles.forEach(pf => URL.revokeObjectURL(pf.previewUrl)); };
  }, [pendingFiles]);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleFeatureChange = e => {
    const { name, checked } = e.target;
    setForm(f => ({ ...f, features: { ...f.features, [name]: checked } }));
  };

  const addFiles = useCallback((files) => {
    setError('');
    const arr = Array.from(files);
    const MAX_SIZE = 10 * 1024 * 1024;
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    const invalid = arr.filter(f => !allowed.includes(f.type));
    if (invalid.length > 0) { setError('Only .jpg, .jpeg, .png, .webp files are allowed.'); return; }
    const tooBig = arr.filter(f => f.size > MAX_SIZE);
    if (tooBig.length > 0) { setError(`Files must be under 10MB: ${tooBig.map(f => f.name).join(', ')}`); return; }
    setPendingFiles(pf => {
      const total = form.images.length + pf.length + arr.length;
      if (total > 20) { setError('Maximum 20 images per property.'); return pf; }
      return [...pf, ...arr.map(f => ({ file: f, previewUrl: URL.createObjectURL(f) }))];
    });
  }, [form.images.length]);

  const handleRemovePending = idx => {
    setPendingFiles(pf => {
      URL.revokeObjectURL(pf[idx].previewUrl);
      return pf.filter((_, i) => i !== idx);
    });
  };

  const handleRemoveImage = idx => {
    setForm(f => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);

    let uploadedUrls = [];
    if (pendingFiles.length > 0) {
      setUploading(true);
      try {
        const res = await upload.files(pendingFiles.map(pf => pf.file));
        if (res.success && res.data?.urls) {
          uploadedUrls = res.data.urls;
        } else {
          setError('Image upload failed.');
          setLoading(false);
          setUploading(false);
          return;
        }
      } catch {
        setError('Image upload failed.');
        setLoading(false);
        setUploading(false);
        return;
      } finally {
        setUploading(false);
      }
    }

    const payload = { ...form, images: [...form.images, ...uploadedUrls] };
    ['bedrooms', 'bathrooms', 'squareMeters', 'floorNumber', 'totalFloors', 'yearBuilt', 'renovatedYear', 'parkingSpaces'].forEach(k => {
      if (payload[k] === '') delete payload[k];
      else payload[k] = Number(payload[k]);
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
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const totalImages = form.images.length + pendingFiles.length;

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ width: '95vw', maxWidth: '1400px', height: '90vh' }}>
        <div className="modal-header">
          <h2>{property ? 'Edit Property' : 'Add New Property'}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {error && <div className="alert alert-error">{error}</div>}

          {/* ── Basic Information ── */}
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
              <label>Currency</label>
              <select name="currency" className="form-input" value={form.currency} onChange={handleChange}>
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
                <option value="GBP">GBP</option>
              </select>
            </div>
            <div className="form-group form-group-checkbox-aligned">
              <label className="form-group-inline form-group-inline-no-margin">
                <input type="checkbox" name="priceNegotiable" checked={form.priceNegotiable} onChange={handleChange} />
                &nbsp;Negotiable
              </label>
            </div>
          </div>

          <div className="form-row">
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

          {form.listingType === 'rent' && (
            <div className="form-row">
              <div className="form-group">
                <label>Rental Type</label>
                <select name="rentalType" className="form-input" value={form.rentalType} onChange={handleChange}>
                  <option value="">Select…</option>
                  <option value="short">Short Let</option>
                  <option value="long">Long Let</option>
                </select>
              </div>
              <div className="form-group">
                <label>Available From</label>
                <input name="availableFrom" type="date" className="form-input" value={form.availableFrom} onChange={handleChange} />
              </div>
            </div>
          )}

          <div className="form-group">
            <label>Description</label>
            <textarea name="description" className="form-input" rows={3} value={form.description} onChange={handleChange} placeholder="Describe the property…" style={{ resize: 'vertical' }} />
          </div>

          <div className="form-group-inline">
            <label>
              <input type="checkbox" name="featured" checked={form.featured} onChange={handleChange} />
              &nbsp;Mark as Featured
            </label>
          </div>

          {/* ── Location ── */}
          <SectionHeader title="📍 Location" open={sections.location} onToggle={() => toggleSection('location')} />
          {sections.location && (
            <div className="collapsible-section">
              <div className="form-row">
                <div className="form-group flex-2">
                  <label>Address</label>
                  <input name="address" className="form-input" value={form.address} onChange={handleChange} placeholder="123 Triq il-Kbira" />
                </div>
                <div className="form-group">
                  <label>City / Town</label>
                  <select name="city" className="form-input" value={form.city} onChange={handleChange}>
                    {MALTA_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Region</label>
                  <input name="region" className="form-input" value={form.region} onChange={handleChange} placeholder="Northern" />
                </div>
                <div className="form-group">
                  <label>Postal Code</label>
                  <input name="postalCode" className="form-input" value={form.postalCode} onChange={handleChange} placeholder="VLT 1000" />
                </div>
                <div className="form-group">
                  <label>Country</label>
                  <input name="country" className="form-input" value={form.country} onChange={handleChange} placeholder="Malta" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Floor Number</label>
                  <input name="floorNumber" type="number" min="0" className="form-input" value={form.floorNumber} onChange={handleChange} placeholder="2" />
                </div>
                <div className="form-group">
                  <label>Total Floors</label>
                  <input name="totalFloors" type="number" min="1" className="form-input" value={form.totalFloors} onChange={handleChange} placeholder="5" />
                </div>
              </div>
            </div>
          )}

          {/* ── Specifications ── */}
          <SectionHeader title="⚙️ Specifications" open={sections.specs} onToggle={() => toggleSection('specs')} />
          {sections.specs && (
            <div className="collapsible-section">
              <div className="form-row">
                <div className="form-group">
                  <label>Year Built</label>
                  <input name="yearBuilt" type="number" min="1800" max={new Date().getFullYear()} className="form-input" value={form.yearBuilt} onChange={handleChange} placeholder="2010" />
                </div>
                <div className="form-group">
                  <label>Renovated Year</label>
                  <input name="renovatedYear" type="number" min="1800" max={new Date().getFullYear()} className="form-input" value={form.renovatedYear} onChange={handleChange} placeholder="2020" />
                </div>
                <div className="form-group">
                  <label>Energy Rating</label>
                  <select name="energyRating" className="form-input" value={form.energyRating} onChange={handleChange}>
                    <option value="">Select…</option>
                    {['A', 'B', 'C', 'D', 'E', 'F', 'G'].map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Furnished</label>
                  <select name="furnished" className="form-input" value={form.furnished} onChange={handleChange}>
                    <option value="">Select…</option>
                    <option value="furnished">Furnished</option>
                    <option value="semi-furnished">Part Furnished</option>
                    <option value="unfurnished">Unfurnished</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Parking Spaces</label>
                  <input name="parkingSpaces" type="number" min="0" className="form-input" value={form.parkingSpaces} onChange={handleChange} placeholder="1" />
                </div>
                <div className="form-group form-group-checkbox-aligned">
                  <label className="form-group-inline form-group-inline-no-margin">
                    <input type="checkbox" name="garage" checked={form.garage} onChange={handleChange} />
                    &nbsp;Garage
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* ── Features & Amenities ── */}
          <SectionHeader title="✨ Features & Amenities" open={sections.features} onToggle={() => toggleSection('features')} />
          {sections.features && (
            <div className="collapsible-section">
              <div className="features-grid">
                {FEATURE_LIST.map(feat => (
                  <label key={feat} className="feature-checkbox">
                    <input
                      type="checkbox"
                      name={featureKey(feat)}
                      checked={form.features[featureKey(feat)] || false}
                      onChange={handleFeatureChange}
                    />
                    &nbsp;{feat}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* ── Publishing ── */}
          <SectionHeader title="📢 Publishing" open={sections.publishing} onToggle={() => toggleSection('publishing')} />
          {sections.publishing && (
            <div className="collapsible-section">
              <div className="features-grid">
                <label className="feature-checkbox">
                  <input type="checkbox" name="childrenFriendly" checked={form.childrenFriendly} onChange={handleChange} />
                  &nbsp;Children Friendly <em style={{fontSize:11,color:'var(--text-muted)'}}>(CRM only)</em>
                </label>
                <label className="feature-checkbox">
                  <input type="checkbox" name="postedToWebsite" checked={form.postedToWebsite} onChange={handleChange} />
                  &nbsp;Posted to Website
                </label>
                <label className="feature-checkbox">
                  <input type="checkbox" name="postedToFacebook" checked={form.postedToFacebook} onChange={handleChange} />
                  &nbsp;Posted to Facebook
                </label>
                <label className="feature-checkbox">
                  <input type="checkbox" name="postedToInstagram" checked={form.postedToInstagram} onChange={handleChange} />
                  &nbsp;Posted to Instagram
                </label>
              </div>
            </div>
          )}

          {/* ── Media ── */}
          <SectionHeader title="🎬 Media" open={sections.media} onToggle={() => toggleSection('media')} />
          {sections.media && (
            <div className="collapsible-section">
              <div className="form-row">
                <div className="form-group">
                  <label>Video URL</label>
                  <input name="videoUrl" className="form-input" value={form.videoUrl} onChange={handleChange} placeholder="https://youtube.com/…" />
                </div>
                <div className="form-group">
                  <label>Virtual Tour URL</label>
                  <input name="virtualTourUrl" className="form-input" value={form.virtualTourUrl} onChange={handleChange} placeholder="https://…" />
                </div>
              </div>

              <div className="form-group">
                <label>Images ({totalImages}/20)</label>
                <div
                  className={`upload-drop-area${dragOver ? ' drag-over' : ''}`}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={e => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
                >
                  {uploading
                    ? '⏳ Uploading images…'
                    : '📁 Drag & drop images here, or click to browse'}
                  <div style={{ fontSize: 11, marginTop: 4, color: 'var(--text-muted)' }}>
                    JPG, PNG, WEBP · Max 10 MB per image · Max 20 images
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp"
                  multiple
                  style={{ display: 'none' }}
                  onChange={e => { addFiles(e.target.files); e.target.value = ''; }}
                />
                {totalImages > 0 && (
                  <div className="image-previews">
                    {form.images.map((url, i) => (
                      <div key={`img-${i}`} className="image-preview-item">
                        <img src={url} alt={`Image ${i + 1}`} onError={e => { e.target.style.opacity = 0.3; }} />
                        <button type="button" className="remove-image-btn" onClick={() => handleRemoveImage(i)}>✕</button>
                      </div>
                    ))}
                    {pendingFiles.map((pf, i) => (
                      <div key={`pending-${i}`} className="image-preview-item pending-image">
                        <img src={pf.previewUrl} alt={`New ${i + 1}`} />
                        <button type="button" className="remove-image-btn" onClick={() => handleRemovePending(i)}>✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading || uploading}>
              {uploading ? 'Uploading…' : loading ? 'Saving…' : (property ? 'Save Changes' : 'Create Property')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PropertyModal;
