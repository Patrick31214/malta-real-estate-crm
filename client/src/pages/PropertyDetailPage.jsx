import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { properties, auth } from '../services/api';
import PropertyModal from '../components/PropertyModal';
import './PropertyDetailPage.css';

function PropertyDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lightboxImg, setLightboxImg] = useState(null);
  const [ownerVisible, setOwnerVisible] = useState(false);
  const [ownerLoading, setOwnerLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const user = auth.getUser();

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchProperty = async () => {
    setLoading(true);
    try {
      const res = await properties.getOne(id);
      if (res.success) {
        setProperty(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperty();
  }, [id]);

  const handleViewOwner = async () => {
    if (ownerVisible) return;
    setOwnerLoading(true);
    try {
      await fetch('/api/owner-contact-views', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({
          propertyId: id,
          ownerId: property.ownerId || property.owner?.id,
        }),
      });
    } catch {
      // log silently
    } finally {
      setOwnerVisible(true);
      setOwnerLoading(false);
    }
  };

  const handleSaved = () => {
    setModalOpen(false);
    fetchProperty();
    showToast('Property updated.');
  };

  const shareableLink = property
    ? `${window.location.origin}/listings?property=${property.id}${user ? '&agent=' + user.id : ''}`
    : '';

  const copyLink = () => {
    navigator.clipboard.writeText(shareableLink).then(() => showToast('Link copied!'));
  };

  if (loading) return <div className="spinner" style={{ marginTop: 80 }} />;
  if (!property) return (
    <div className="property-detail-page">
      <div className="empty-state">
        <div className="empty-icon">🏠</div>
        <h3>Property not found</h3>
        <Link to="/properties" className="btn btn-outline" style={{ marginTop: 16 }}>← Back to Properties</Link>
      </div>
    </div>
  );

  const images = Array.isArray(property.images) ? property.images : [];

  return (
    <div className="property-detail-page">
      {/* Header bar */}
      <div className="detail-header">
        <button className="btn btn-outline btn-sm" onClick={() => navigate('/properties')}>
          ← Back
        </button>
        <div className="detail-header-actions">
          <button className="btn btn-outline btn-sm" onClick={() => setModalOpen(true)}>✏️ Edit Property</button>
        </div>
      </div>

      <div className="detail-grid">
        {/* Left column */}
        <div className="detail-main">
          {/* Image gallery */}
          {images.length > 0 ? (
            <div className="card image-gallery-card">
              <div className="gallery-main" onClick={() => setLightboxImg(images[0])}>
                <img src={images[0]} alt={property.title} className="gallery-main-img" />
              </div>
              {images.length > 1 && (
                <div className="gallery-thumbs">
                  {images.map((img, i) => (
                    <div key={i} className="gallery-thumb" onClick={() => setLightboxImg(img)}>
                      <img src={img} alt={`Image ${i + 1}`} />
                    </div>
                  ))}
                </div>
              )}
              <div className="gallery-actions">
                {images.map((img, i) => (
                  <a key={i} href={img} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm" download>
                    ⬇ Photo {i + 1}
                  </a>
                ))}
              </div>
            </div>
          ) : (
            <div className="card no-image-card">
              <div className="no-image-placeholder">📷 No images uploaded</div>
            </div>
          )}

          {/* Description */}
          <div className="card" style={{ marginTop: 20 }}>
            <h3 className="detail-section-title">Description</h3>
            <p className="detail-description">{property.description || 'No description provided.'}</p>
          </div>
        </div>

        {/* Right column */}
        <div className="detail-sidebar">
          {/* Title & badges */}
          <div className="card detail-title-card">
            <h1 className="detail-property-title">{property.title}</h1>
            <div className="detail-location">📍 {property.address}, {property.city}, {property.country}</div>
            <div className="detail-badges">
              <span className={`badge badge-${property.status}`}>{(property.status || '').replace('_', ' ')}</span>
              <span className={`badge badge-${property.listingType}`}>{property.listingType}</span>
              {property.featured && <span className="badge badge-featured">⭐ Featured</span>}
              <span className={`badge badge-${property.approvalStatus || 'pending'}`}>{property.approvalStatus || 'pending'}</span>
            </div>
            <div className="detail-price">€{Number(property.price).toLocaleString()}</div>
          </div>

          {/* Property details */}
          <div className="card detail-info-card">
            <h3 className="detail-section-title">Property Details</h3>
            <div className="detail-fields">
              <DetailRow label="Type" value={property.propertyType} capitalize />
              <DetailRow label="Listing" value={property.listingType} capitalize />
              <DetailRow label="Status" value={(property.status || '').replace('_', ' ')} capitalize />
              {property.bedrooms != null && <DetailRow label="Bedrooms" value={`🛏 ${property.bedrooms}`} />}
              {property.bathrooms != null && <DetailRow label="Bathrooms" value={`🚿 ${property.bathrooms}`} />}
              {property.squareMeters != null && <DetailRow label="Size" value={`${property.squareMeters} m²`} />}
              {property.rentalType && <DetailRow label="Rental Type" value={property.rentalType} capitalize />}
              {property.availableFrom && <DetailRow label="Available From" value={new Date(property.availableFrom).toLocaleDateString()} />}
              <DetailRow label="Currency" value={property.currency || 'EUR'} />
              <DetailRow label="Reference" value={property.referenceNumber || `#${property.id}`} />
            </div>
          </div>

          {/* Shareable link */}
          <div className="card share-card">
            <h3 className="detail-section-title">🔗 Share Listing</h3>
            <div className="share-link-box">
              <input type="text" readOnly value={shareableLink} className="form-input share-link-input" />
              <button className="btn btn-outline btn-sm" onClick={copyLink}>Copy</button>
            </div>
          </div>

          {/* Owner details */}
          {property.owner && (
            <div className="card owner-card">
              <h3 className="detail-section-title">👤 Owner</h3>
              {!ownerVisible ? (
                <button
                  className="btn btn-outline btn-sm"
                  onClick={handleViewOwner}
                  disabled={ownerLoading}
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  {ownerLoading ? 'Loading…' : '🔒 View Owner Details'}
                </button>
              ) : (
                <div className="owner-details">
                  <DetailRow label="Name" value={`${property.owner.firstName || ''} ${property.owner.lastName || ''}`.trim() || '—'} />
                  {property.owner.phone && <DetailRow label="Phone" value={property.owner.phone} />}
                  {property.owner.email && <DetailRow label="Email" value={property.owner.email} />}
                  {property.owner.nationality && <DetailRow label="Nationality" value={property.owner.nationality} />}
                </div>
              )}
            </div>
          )}

          {/* Agent */}
          {property.agent && (
            <div className="card agent-card">
              <h3 className="detail-section-title">🏷️ Assigned Agent</h3>
              <div className="detail-fields">
                <DetailRow label="Name" value={`${property.agent.user?.firstName || ''} ${property.agent.user?.lastName || ''}`.trim() || '—'} />
                {property.agent.phone && <DetailRow label="Phone" value={property.agent.phone} />}
                {property.agent.licenseNumber && <DetailRow label="License" value={property.agent.licenseNumber} />}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxImg && (
        <div className="lightbox-overlay" onClick={() => setLightboxImg(null)}>
          <button className="lightbox-close" onClick={() => setLightboxImg(null)}>✕</button>
          <img src={lightboxImg} alt="Full size" className="lightbox-img" onClick={e => e.stopPropagation()} />
        </div>
      )}

      {/* Edit modal */}
      {modalOpen && (
        <PropertyModal
          property={property}
          onClose={() => setModalOpen(false)}
          onSaved={handleSaved}
        />
      )}

      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
    </div>
  );
}

function DetailRow({ label, value, capitalize }) {
  if (value == null || value === '') return null;
  return (
    <div className="detail-row">
      <span className="detail-row-label">{label}</span>
      <span className={`detail-row-value${capitalize ? ' capitalize' : ''}`}>{value}</span>
    </div>
  );
}

export default PropertyDetailPage;
