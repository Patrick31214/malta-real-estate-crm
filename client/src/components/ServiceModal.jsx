import { useState, useEffect, useCallback, useRef } from 'react';
import { services, upload, auth } from '../services/api';
import './Modal.css';

const CATEGORIES = ['boat_tour', 'car_rental', 'bike_rental', 'guided_tour', 'other'];
const CURRENCIES = ['EUR', 'USD', 'GBP'];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const PARTNERSHIP_TYPES = ['none', 'company', 'individual'];

const defaultForm = {
  title: '',
  description: '',
  category: 'boat_tour',
  subCategory: '',
  price: '',
  currency: 'EUR',
  duration: '',
  maxParticipants: '',
  location: '',
  meetingPoint: '',
  availableDays: [],
  whatsIncluded: '',
  cancellationPolicy: '',
  contactName: '',
  contactPhone: '',
  contactEmail: '',
  contactInfo: '',
  languages: '',
  available: true,
  featured: false,
  images: [],
  partnershipType: 'none',
  partnerCompanyName: '',
  partnerCompanyReg: '',
  partnerContactName: '',
  partnerContactPhone: '',
  partnerContactEmail: '',
  commissionDetails: '',
  contractFile: '',
  // Partnership fields
  partnerType: 'company',
  partnerCompanyName: '',
  partnerContactEmail: '',
  partnerContactPhone: '',
  listedBy: '',
};

// Full-screen modal dimensions
const MODAL_FULL_STYLE = { width: '95vw', maxWidth: '1200px', height: '90vh', display: 'flex', flexDirection: 'column' };

function SectionHeader({ title, open, onToggle }) {
  return (
    <div className="collapsible-header" onClick={onToggle}>
      <span>{title}</span>
      <span className="collapsible-arrow">{open ? '▲' : '▼'}</span>
    </div>
  );
}

function ServiceModal({ service, onClose, onSaved }) {
  const [form, setForm] = useState(() => {
    const currentUser = auth.getUser();
    const userName = currentUser
      ? `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || currentUser.email || ''
      : '';
    return { ...defaultForm, listedBy: userName };
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [pendingFiles, setPendingFiles] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const [sections, setSections] = useState({ basic: true, details: false, contact: false, media: false, partnership: false });
  const [sections, setSections] = useState({ basic: true, details: false, contact: false, partnership: false, media: false });
  const toggleSection = name => setSections(s => ({ ...s, [name]: !s[name] }));

  useEffect(() => {
    const currentUser = auth.getUser();
    const userName = currentUser
      ? `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || currentUser.email || ''
      : '';
    if (service) {
      setForm({
        title: service.title || '',
        description: service.description || '',
        category: service.category || 'boat_tour',
        subCategory: service.subCategory || '',
        price: service.price ?? '',
        currency: service.currency || 'EUR',
        duration: service.duration || '',
        maxParticipants: service.maxParticipants ?? '',
        location: service.location || '',
        meetingPoint: service.meetingPoint || '',
        availableDays: Array.isArray(service.availableDays) ? service.availableDays : [],
        whatsIncluded: service.whatsIncluded || '',
        cancellationPolicy: service.cancellationPolicy || '',
        contactName: service.contactName || '',
        contactPhone: service.contactPhone || '',
        contactEmail: service.contactEmail || '',
        contactInfo: service.contactInfo || '',
        languages: service.languages || '',
        available: service.available !== false,
        featured: service.featured || false,
        images: Array.isArray(service.images) ? service.images : [],
        partnershipType: service.partnershipType || 'none',
        partnerCompanyName: service.partnerCompanyName || '',
        partnerCompanyReg: service.partnerCompanyReg || '',
        partnerContactName: service.partnerContactName || '',
        partnerContactPhone: service.partnerContactPhone || '',
        partnerContactEmail: service.partnerContactEmail || '',
        commissionDetails: service.commissionDetails || '',
        contractFile: service.contractFile || '',
        partnerType: service.partnerType || 'company',
        partnerCompanyName: service.partnerCompanyName || '',
        partnerContactEmail: service.partnerContactEmail || '',
        partnerContactPhone: service.partnerContactPhone || '',
        listedBy: service.listedBy || userName,
      });
    }
  }, [service]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleDayToggle = (day) => {
    setForm(f => ({
      ...f,
      availableDays: f.availableDays.includes(day)
        ? f.availableDays.filter(d => d !== day)
        : [...f.availableDays, day],
    }));
  };

  const addFiles = useCallback((files) => {
    setError('');
    const arr = Array.from(files);
    const MAX_SIZE = 10 * 1024 * 1024;
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    const invalid = arr.filter(f => !allowed.includes(f.type));
    if (invalid.length > 0) { setError(`Only .jpg, .jpeg, .png, .webp files are allowed. Invalid files: ${invalid.map(f => f.name).join(', ')}`); return; }
    const tooBig = arr.filter(f => f.size > MAX_SIZE);
    if (tooBig.length > 0) { setError(`Files must be under 10MB: ${tooBig.map(f => f.name).join(', ')}`); return; }
    setPendingFiles(pf => {
      const total = form.images.length + pf.length + arr.length;
      if (total > 10) { setError('Maximum 10 images per service.'); return pf; }
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

  const handleSubmit = async (e) => {
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

    try {
      const payload = {
        ...form,
        price: form.price !== '' ? Number(form.price) : 0,
        maxParticipants: form.maxParticipants !== '' ? Number(form.maxParticipants) : null,
        images: [...form.images, ...uploadedUrls],
        listedBy: !service ? (auth.getUser()?.id || null) : undefined,
      };
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

  const totalImages = form.images.length + pendingFiles.length;

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={MODAL_FULL_STYLE}>
        <div className="modal-header">
          <h2>{service ? 'Edit Service' : 'Add New Service'}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form" style={{ flex: 1, overflowY: 'auto' }}>
          {error && <div className="alert alert-error">{error}</div>}

          {/* ── Basic Info ── */}
          <SectionHeader title="📋 Basic Information" open={sections.basic} onToggle={() => toggleSection('basic')} />
          {sections.basic && (
            <div className="collapsible-section">
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

              <div className="form-row">
                <div className="form-group flex-2">
                  <label>Sub-Category</label>
                  <input name="subCategory" className="form-input" value={form.subCategory} onChange={handleChange} placeholder="e.g. Snorkelling, Wine Tour…" />
                </div>
                <div className="form-row" style={{ gap: 24, margin: 0 }}>
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
                  <input name="duration" className="form-input" value={form.duration} onChange={handleChange} placeholder="3 hours" />
                </div>
                <div className="form-group">
                  <label>Max Participants</label>
                  <input name="maxParticipants" type="number" min="1" className="form-input" value={form.maxParticipants} onChange={handleChange} placeholder="12" />
                </div>
              </div>
            </div>
          )}

          {/* ── Details ── */}
          <SectionHeader title="📍 Details & Availability" open={sections.details} onToggle={() => toggleSection('details')} />
          {sections.details && (
            <div className="collapsible-section">
              <div className="form-row">
                <div className="form-group flex-2">
                  <label>Location</label>
                  <input name="location" className="form-input" value={form.location} onChange={handleChange} placeholder="Valletta Harbour, Malta" />
                </div>
                <div className="form-group flex-2">
                  <label>Meeting Point</label>
                  <input name="meetingPoint" className="form-input" value={form.meetingPoint} onChange={handleChange} placeholder="e.g. Valletta Waterfront Gate 3" />
                </div>
              </div>

              <div className="form-group">
                <label>Available Days</label>
                <div className="form-row" style={{ flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
                  {DAYS.map(day => (
                    <label key={day} style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={form.availableDays.includes(day)}
                        onChange={() => handleDayToggle(day)}
                      />
                      {day}
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Languages Available</label>
                <input name="languages" className="form-input" value={form.languages} onChange={handleChange} placeholder="English, Maltese, Italian" />
              </div>

              <div className="form-group">
                <label>What&apos;s Included</label>
                <textarea name="whatsIncluded" className="form-input" rows={3} value={form.whatsIncluded} onChange={handleChange} placeholder="• Snorkelling equipment&#10;• Light refreshments&#10;• Guide" style={{ resize: 'vertical' }} />
              </div>

              <div className="form-group">
                <label>Cancellation Policy</label>
                <textarea name="cancellationPolicy" className="form-input" rows={2} value={form.cancellationPolicy} onChange={handleChange} placeholder="Free cancellation up to 24 hours before…" style={{ resize: 'vertical' }} />
              </div>
            </div>
          )}

          {/* ── Contact ── */}
          <SectionHeader title="📞 Contact Information" open={sections.contact} onToggle={() => toggleSection('contact')} />
          {sections.contact && (
            <div className="collapsible-section">
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

              <div className="form-row">
                <div className="form-group flex-2">
                  <label>Contact Email</label>
                  <input name="contactEmail" type="email" className="form-input" value={form.contactEmail} onChange={handleChange} placeholder="info@service.mt" />
                </div>
                <div className="form-group flex-2">
                  <label>Contact Info (public)</label>
                  <input name="contactInfo" className="form-input" value={form.contactInfo} onChange={handleChange} placeholder="+356 9999 0000 / info@example.com" />
                </div>
              </div>
            </div>
          )}

          {/* ── Partnership ── */}
          <SectionHeader title="🤝 Partnership Details" open={sections.partnership} onToggle={() => toggleSection('partnership')} />
          {sections.partnership && (
            <div className="collapsible-section">
              <div className="form-group">
                <label>Partner Type</label>
                <div className="form-row" style={{ gap: 12, marginTop: 4 }}>
                  {['company', 'individual'].map(pt => (
                    <label key={pt} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', textTransform: 'capitalize' }}>
                      <input
                        type="radio"
                        name="partnerType"
                        value={pt}
                        checked={form.partnerType === pt}
                        onChange={handleChange}
                      />
                      {pt === 'company' ? '🏢 Company' : '👤 Individual'}
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group flex-2">
                  <label>Partner Company / Individual Name</label>
                  <input name="partnerCompanyName" className="form-input" value={form.partnerCompanyName} onChange={handleChange} placeholder="Company or person name" />
                </div>
                <div className="form-group flex-2">
                  <label>Listed By</label>
                  <input name="listedBy" className="form-input" value={form.listedBy} onChange={handleChange} placeholder="Agent or user who listed this" />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group flex-2">
                  <label>Partner Contact Email</label>
                  <input name="partnerContactEmail" type="email" className="form-input" value={form.partnerContactEmail} onChange={handleChange} placeholder="partner@example.com" />
                </div>
                <div className="form-group flex-2">
                  <label>Partner Contact Phone</label>
                  <input name="partnerContactPhone" className="form-input" value={form.partnerContactPhone} onChange={handleChange} placeholder="+356 9912 3456" />
                </div>
              </div>
            </div>
          )}

          {/* ── Media ── */}
          <SectionHeader title="🖼️ Images" open={sections.media} onToggle={() => toggleSection('media')} />
          {sections.media && (
            <div className="collapsible-section">
              <div className="form-group">
                <label>Images ({totalImages}/10)</label>
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
                    JPG, PNG, WEBP · Max 10 MB per image · Max 10 images
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

          <SectionHeader title="🤝 Partnership & Commission" open={sections.partnership} onToggle={() => toggleSection('partnership')} />
          {sections.partnership && (
            <div className="form-section">
              <div className="form-group">
                <label>Partnership Type</label>
                <select name="partnershipType" className="form-input" value={form.partnershipType} onChange={handleChange}>
                  {PARTNERSHIP_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                </select>
              </div>
              {form.partnershipType === 'company' && (
                <>
                  <div className="form-row">
                    <div className="form-group flex-2">
                      <label>Company Name</label>
                      <input name="partnerCompanyName" className="form-input" value={form.partnerCompanyName} onChange={handleChange} placeholder="Partner Company Ltd" />
                    </div>
                    <div className="form-group">
                      <label>Company Registration</label>
                      <input name="partnerCompanyReg" className="form-input" value={form.partnerCompanyReg} onChange={handleChange} placeholder="C12345" />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Contact Name</label>
                      <input name="partnerContactName" className="form-input" value={form.partnerContactName} onChange={handleChange} placeholder="Contact person" />
                    </div>
                    <div className="form-group">
                      <label>Contact Phone</label>
                      <input name="partnerContactPhone" className="form-input" value={form.partnerContactPhone} onChange={handleChange} placeholder="+356 9900 0000" />
                    </div>
                    <div className="form-group">
                      <label>Contact Email</label>
                      <input name="partnerContactEmail" type="email" className="form-input" value={form.partnerContactEmail} onChange={handleChange} placeholder="partner@company.mt" />
                    </div>
                  </div>
                </>
              )}
              {form.partnershipType === 'individual' && (
                <div className="form-row">
                  <div className="form-group">
                    <label>Contact Name</label>
                    <input name="partnerContactName" className="form-input" value={form.partnerContactName} onChange={handleChange} placeholder="Individual partner name" />
                  </div>
                  <div className="form-group">
                    <label>Contact Phone</label>
                    <input name="partnerContactPhone" className="form-input" value={form.partnerContactPhone} onChange={handleChange} placeholder="+356 9900 0000" />
                  </div>
                  <div className="form-group">
                    <label>Contact Email</label>
                    <input name="partnerContactEmail" type="email" className="form-input" value={form.partnerContactEmail} onChange={handleChange} placeholder="partner@email.com" />
                  </div>
                </div>
              )}
              <div className="form-group">
                <label>Commission / Revenue Share Details</label>
                <textarea name="commissionDetails" className="form-input" rows={3} value={form.commissionDetails} onChange={handleChange} placeholder="e.g. 15% commission on bookings, paid monthly…" style={{ resize: 'vertical' }} />
              </div>
              <div className="form-group">
                <label>Contract File (PDF URL or path)</label>
                <input name="contractFile" className="form-input" value={form.contractFile} onChange={handleChange} placeholder="/uploads/contracts/contract-001.pdf" />
              </div>
            </div>
          )}

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading || uploading}>
              {uploading ? 'Uploading…' : loading ? 'Saving…' : (service ? 'Save Changes' : 'Add Service')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ServiceModal;
