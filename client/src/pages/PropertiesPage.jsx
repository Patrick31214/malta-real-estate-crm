import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { properties, auth } from '../services/api';
import PropertyModal from '../components/PropertyModal';
import './PropertiesPage.css';

const PROPERTY_TYPES = ['apartment', 'house', 'villa', 'townhouse', 'penthouse', 'maisonette', 'farmhouse', 'commercial', 'office', 'land', 'garage', 'other'];
const STATUSES = ['available', 'under_offer', 'sold', 'rented', 'withdrawn', 'draft', 'off_market'];

const MALTA_CITIES = [
  'Valletta', 'Sliema', "St. Julian's", 'Mdina', 'Rabat', 'Mosta', 'Naxxar', 'Birkirkara',
  'Qormi', 'Marsaskala', 'Mellieha', 'Gozo', 'Marsaxlokk', 'Żabbar', 'Żejtun', 'Żurrieq',
  'Birgu', 'Bormla', 'Isla', 'Gżira', 'Msida', 'Pietà', 'Floriana', 'Hamrun', 'Marsa',
  'Tarxien', 'Luqa', 'Kirkop', 'Żebbuġ', 'Siggiewi', 'Qrendi', 'Mqabba', 'Gudja', 'Għaxaq',
  'Birzebbuga', 'Fgura', 'Paola', 'San Ġwann', 'Swieqi', 'Pembroke',
  "St. Paul's Bay", 'Bugibba', 'Qawra', 'Xemxija', 'Victoria', 'Sannat', 'Xewkija',
  'Kerċem', 'Munxar', 'Xlendi', 'Marsalforn', 'Nadur', 'Xagħra', 'Żebbuġ (Gozo)',
  'Gharb', 'San Lawrenz', 'Other',
];

const LISTING_TABS = [
  { label: 'All', value: '' },
  { label: 'For Sale', value: 'sale' },
  { label: 'For Rent', value: 'rent' },
  { label: 'Short Let', value: 'short_let' },
  { label: 'Long Let', value: 'long_let' },
];

const FILTER_FEATURES = [
  'Sea View', 'Pool', 'Garden', 'Terrace', 'Balcony', 'Elevator', 'AC', 'Parking',
  'Pet Friendly', 'Furnished', 'Smart Home', 'Solar Panels', 'Gym', 'BBQ',
  'Near Schools', 'Near Transport', 'Near Shops', 'Quiet Area', 'Gated Community',
  'Children Friendly',
];

const SORT_OPTIONS = [
  { label: 'Date Newest', value: 'date_desc' },
  { label: 'Date Oldest', value: 'date_asc' },
  { label: 'Price Low→High', value: 'price_asc' },
  { label: 'Price High→Low', value: 'price_desc' },
  { label: 'Bedrooms', value: 'bedrooms_desc' },
];

const STATUS_COLORS = {
  available: '#10b981',
  under_offer: '#f59e0b',
  sold: '#ef4444',
  rented: '#6366f1',
  withdrawn: '#6b7280',
  draft: '#9ca3af',
  off_market: '#374151',
};

const featureKey = name => name.toLowerCase().replace(/[\s/]+/g, '_').replace(/[^a-z0-9_]/g, '');

const listingLabel = lt => {
  if (lt === 'sale') return 'For Sale';
  if (lt === 'rent') return 'For Rent';
  if (lt === 'short_let') return 'Short Let';
  if (lt === 'long_let') return 'Long Let';
  return lt || '';
};

function PropertiesPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [propertyList, setPropertyList] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [listingType, setListingType] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [ownerId] = useState(searchParams.get('ownerId') || '');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minBedrooms, setMinBedrooms] = useState('');
  const [minBathrooms, setMinBathrooms] = useState('');
  const [city, setCity] = useState('');
  const [sortBy, setSortBy] = useState('date_desc');
  const [activeFeatures, setActiveFeatures] = useState({});
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editProperty, setEditProperty] = useState(null);
  const [toast, setToast] = useState(null);
  const [shareOpen, setShareOpen] = useState(null);

  const user = auth.getUser();
  const isAdmin = user && (user.role === 'admin' || user.role === 'manager');

  const activeFeatureKeys = Object.keys(activeFeatures).filter(k => activeFeatures[k]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchProperties = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (search) params.search = search;
      if (status) params.status = status;
      if (propertyType) params.propertyType = propertyType;
      if (listingType) params.listingType = listingType;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      if (minBedrooms) params.minBedrooms = minBedrooms;
      if (minBathrooms) params.minBathrooms = minBathrooms;
      if (city) params.city = city;
      if (ownerId) params.ownerId = ownerId;
      if (sortBy) params.sortBy = sortBy;
      const featKeys = Object.keys(activeFeatures).filter(k => activeFeatures[k]);
      if (featKeys.length > 0) params.features = featKeys.join(',');

      const res = await properties.getAll(params);
      if (res.success) {
        setPropertyList(res.data.properties);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, status, propertyType, listingType, minPrice, maxPrice, minBedrooms, minBathrooms, city, ownerId, sortBy, activeFeatures]);

  useEffect(() => {
    const timer = setTimeout(() => fetchProperties(1), 300);
    return () => clearTimeout(timer);
  }, [fetchProperties]);

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this property?')) return;
    const res = await properties.delete(id);
    if (res.success) {
      showToast('Property deleted.');
      fetchProperties(pagination.page);
    }
  };

  const handleApprove = async (id, approveStatus) => {
    const res = await properties.approve(id, approveStatus);
    if (res.success) {
      showToast(`Property ${approveStatus}.`);
      fetchProperties(pagination.page);
    } else {
      showToast(res.message || 'Failed to update.', 'error');
    }
  };

  const handleSaved = () => {
    setModalOpen(false);
    setEditProperty(null);
    fetchProperties(1);
    showToast(editProperty ? 'Property updated.' : 'Property created.');
  };

  const handleToggleWebsite = async (id, current) => {
    const res = await properties.update(id, { postedToWebsite: !current });
    if (res.success) {
      setPropertyList(list => list.map(p => p.id === id ? { ...p, postedToWebsite: !current } : p));
    } else {
      showToast('Failed to update.', 'error');
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    const res = await properties.update(id, { status: newStatus });
    if (res.success) {
      setPropertyList(list => list.map(p => p.id === id ? { ...p, status: newStatus } : p));
    } else {
      showToast('Failed to update status.', 'error');
    }
  };

  const toggleFeature = (key) => {
    setActiveFeatures(f => ({ ...f, [key]: !f[key] }));
  };

  const handleCopyLink = (id) => {
    const url = `${window.location.origin}/properties/${id}`;
    navigator.clipboard.writeText(url).then(() => showToast('Link copied!')).catch(() => showToast('Copy failed.', 'error'));
    setShareOpen(null);
  };

  const clearAllFilters = () => {
    setSearch('');
    setListingType('');
    setPropertyType('');
    setStatus('');
    setMinPrice('');
    setMaxPrice('');
    setMinBedrooms('');
    setMinBathrooms('');
    setCity('');
    setSortBy('date_desc');
    setActiveFeatures({});
  };

  const activeFilterCount = [listingType, propertyType, status, minPrice, maxPrice, minBedrooms, minBathrooms, city].filter(Boolean).length + activeFeatureKeys.length;

  const bedroomPills = ['1', '2', '3', '4', '5+'];
  const bathroomPills = ['1', '2', '3+'];

  return (
    <div className="properties-page">
      {/* Header */}
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Properties</h1>
          <p className="page-subtitle">{pagination.total} {pagination.total === 1 ? 'property' : 'properties'} found</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditProperty(null); setModalOpen(true); }}>
          + Add Property
        </button>
      </div>

      {/* Owner filter banner */}
      {ownerId && (
        <div className="alert" style={{ background: 'var(--accent-soft, #fef9e7)', border: '1px solid var(--accent, #D4AF37)', borderRadius: 8, padding: '10px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span>🏠 Showing properties for owner ID: <strong>{ownerId}</strong></span>
          <a href="/properties" className="btn btn-outline btn-sm" style={{ marginLeft: 'auto' }}>Clear filter</a>
        </div>
      )}

      {/* Search Panel */}
      <div className="search-panel">
        {/* Search bar + Sort */}
        <div className="search-bar-row">
          <div className="search-bar-wrap">
            <span className="search-icon">🔍</span>
            <input
              type="search"
              className="search-bar-input"
              placeholder="Search by title, description, location…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="sort-row">
            <label className="sort-label">Sort:</label>
            <select className="form-input sort-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        {/* Listing Type Tabs */}
        <div className="listing-tabs">
          {LISTING_TABS.map(tab => (
            <button
              key={tab.value}
              className={`listing-tab${listingType === tab.value ? ' active' : ''}`}
              onClick={() => setListingType(tab.value)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Type + Price + Location row */}
        <div className="filter-row">
          <div className="filter-group">
            <label className="filter-label">Property Type</label>
            <select className="form-input filter-input" value={propertyType} onChange={e => setPropertyType(e.target.value)}>
              <option value="">All Types</option>
              {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
            </select>
          </div>
          <div className="filter-group">
            <label className="filter-label">Min Price €</label>
            <input type="number" className="form-input filter-input" placeholder="e.g. 50,000" value={minPrice} onChange={e => setMinPrice(e.target.value)} min="0" />
          </div>
          <div className="filter-group">
            <label className="filter-label">Max Price €</label>
            <input type="number" className="form-input filter-input" placeholder="e.g. 500,000" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} min="0" />
          </div>
          <div className="filter-group filter-group-wide">
            <label className="filter-label">Location</label>
            <select className="form-input filter-input" value={city} onChange={e => setCity(e.target.value)}>
              <option value="">All Localities</option>
              {MALTA_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Bedrooms + Bathrooms + Status row */}
        <div className="pills-row">
          <div className="pill-group">
            <span className="filter-label">Bedrooms</span>
            {bedroomPills.map(n => {
              const val = n === '5+' ? '5' : n;
              return (
                <button
                  key={n}
                  className={`pill${minBedrooms === val ? ' active' : ''}`}
                  onClick={() => setMinBedrooms(prev => prev === val ? '' : val)}
                >
                  {n}
                </button>
              );
            })}
          </div>
          <div className="pill-group">
            <span className="filter-label">Bathrooms</span>
            {bathroomPills.map(n => {
              const val = n === '3+' ? '3' : n;
              return (
                <button
                  key={n}
                  className={`pill${minBathrooms === val ? ' active' : ''}`}
                  onClick={() => setMinBathrooms(prev => prev === val ? '' : val)}
                >
                  {n}
                </button>
              );
            })}
          </div>
          <div className="pill-group pill-group-status">
            <span className="filter-label">Status</span>
            <select className="form-input filter-input" value={status} onChange={e => setStatus(e.target.value)}>
              <option value="">All Statuses</option>
              {STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>)}
            </select>
          </div>
        </div>

        {/* More Filters toggle */}
        <button className="more-filters-toggle" onClick={() => setMoreFiltersOpen(o => !o)}>
          <span>
            ⚙ More Filters
            {activeFeatureKeys.length > 0 && <span className="filter-badge">{activeFeatureKeys.length}</span>}
          </span>
          <span className="toggle-chevron">{moreFiltersOpen ? '▲' : '▼'}</span>
        </button>

        {moreFiltersOpen && (
          <div className="more-filters-panel">
            <div className="features-grid">
              {FILTER_FEATURES.map(f => {
                const key = featureKey(f);
                return (
                  <label key={key} className={`feature-checkbox${activeFeatures[key] ? ' checked' : ''}`}>
                    <input
                      type="checkbox"
                      checked={!!activeFeatures[key]}
                      onChange={() => toggleFeature(key)}
                    />
                    {f}
                    {f === 'Children Friendly' && <span className="crm-only-badge">CRM</span>}
                  </label>
                );
              })}
            </div>
          </div>
        )}

        {/* Active filters summary */}
        {(activeFilterCount > 0 || search) && (
          <div className="active-filters-row">
            <span className="active-filters-label">
              {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} active
            </span>
            <button className="btn-clear-all" onClick={clearAllFilters}>✕ Clear All</button>
          </div>
        )}
      </div>

      {/* Card Grid */}
      {loading ? (
        <div className="spinner" />
      ) : propertyList.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">🏠</div>
            <h3>No properties found</h3>
            <p>Add your first property or adjust your filters.</p>
            <button className="btn btn-primary" onClick={() => setModalOpen(true)} style={{ marginTop: 16 }}>
              + Add Property
            </button>
          </div>
        </div>
      ) : (
        <div className="property-card-grid">
          {propertyList.map(p => (
            <div key={p.id} className="property-card">
              {/* Image */}
              <div className="card-image" onClick={() => navigate(`/properties/${p.id}`)}>
                {p.images && p.images[0] ? (
                  <img src={p.images[0]} alt={p.title} className="card-img" />
                ) : (
                  <div className="card-img-placeholder"><span>🏠</span></div>
                )}
                {p.listingType && (
                  <span className={`card-listing-badge card-listing-${p.listingType}`}>
                    {listingLabel(p.listingType)}
                  </span>
                )}
                {p.featured && <span className="card-featured-badge">⭐ Featured</span>}
              </div>

              {/* Body */}
              <div className="card-body">
                <div className="card-type-row">
                  <span className="card-type-badge">{p.propertyType}</span>
                  <span
                    className="card-status-badge"
                    style={{ background: STATUS_COLORS[p.status] || '#6b7280' }}
                  >
                    {(p.status || 'draft').replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="card-title" onClick={() => navigate(`/properties/${p.id}`)}>
                  {p.title}
                </div>
                <div className="card-location">📍 {[p.address, p.city].filter(Boolean).join(', ')}</div>
                <div className="card-price">€{Number(p.price || 0).toLocaleString()}</div>

                <div className="card-specs">
                  {p.bedrooms != null && <span>🛏 {p.bedrooms} bed{p.bedrooms !== 1 ? 's' : ''}</span>}
                  {p.bathrooms != null && <span>🚿 {p.bathrooms} bath{p.bathrooms !== 1 ? 's' : ''}</span>}
                  {p.squareMeters && <span>📐 {p.squareMeters}m²</span>}
                </div>

                {p.availableFrom && (
                  <div className="card-available">
                    📅 Available: {new Date(p.availableFrom).toLocaleDateString()}
                  </div>
                )}

                {/* Action buttons */}
                <div className="card-actions">
                  <button
                    className={`card-btn-website${p.postedToWebsite ? ' active' : ''}`}
                    title={p.postedToWebsite ? 'Live on website — click to unpublish' : 'Not on website — click to publish'}
                    onClick={() => handleToggleWebsite(p.id, p.postedToWebsite)}
                  >
                    🌐
                  </button>

                  <div className="share-wrap">
                    <button
                      className="card-btn card-btn-outline"
                      onClick={() => setShareOpen(shareOpen === p.id ? null : p.id)}
                    >
                      🔗 Share
                    </button>
                    {shareOpen === p.id && (
                      <div className="share-dropdown">
                        <button onClick={() => handleCopyLink(p.id)}>📋 Copy Link</button>
                      </div>
                    )}
                  </div>

                  <button
                    className="card-btn card-btn-outline"
                    onClick={() => { setEditProperty(p); setModalOpen(true); }}
                  >
                    Edit
                  </button>
                  <button
                    className="card-btn card-btn-primary"
                    onClick={() => navigate(`/properties/${p.id}`)}
                  >
                    View
                  </button>
                </div>

                {/* Status + admin actions */}
                <div className="card-admin-row">
                  <select
                    className="status-quick-select"
                    value={p.status}
                    onChange={e => handleStatusChange(p.id, e.target.value)}
                  >
                    {STATUSES.map(s => (
                      <option key={s} value={s}>{s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>
                    ))}
                  </select>
                  {isAdmin && p.approvalStatus !== 'approved' && (
                    <button className="btn btn-sm btn-accent" onClick={() => handleApprove(p.id, 'approved')}>✓</button>
                  )}
                  {isAdmin && p.approvalStatus !== 'rejected' && (
                    <button className="btn btn-sm btn-danger" onClick={() => handleApprove(p.id, 'rejected')}>✗</button>
                  )}
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id)}>Del</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="pagination">
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(pg => (
            <button
              key={pg}
              className={`page-btn${pg === pagination.page ? ' active' : ''}`}
              onClick={() => fetchProperties(pg)}
            >
              {pg}
            </button>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <PropertyModal
          property={editProperty}
          onClose={() => { setModalOpen(false); setEditProperty(null); }}
          onSaved={handleSaved}
        />
      )}

      {/* Toast */}
      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
    </div>
  );
}

export default PropertiesPage;
