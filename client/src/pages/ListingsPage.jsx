import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { listings } from '../services/api';
import './ListingsPage.css';

const PROPERTY_TYPES = [
  'apartment', 'house', 'villa', 'townhouse', 'penthouse',
  'maisonette', 'farmhouse', 'commercial', 'office', 'land', 'garage', 'other'
];

function ListingCard({ p }) {
  const [imgError, setImgError] = useState(false);
  const hasImage = p.images && p.images.length > 0 && !imgError;

  return (
    <div className="listing-card">
      {/* Image */}
      <div className="listing-img">
        {hasImage ? (
          <img src={p.images[0]} alt={p.title} onError={() => setImgError(true)} />
        ) : (
          <div className="listing-img-placeholder">🏠</div>
        )}
        <span className={`listing-badge listing-badge-${p.listingType}`}>
          {p.listingType === 'sale' ? 'For Sale' : p.listingType === 'rent' ? 'For Rent' : 'For Lease'}
        </span>
      </div>

      <div className="listing-body">
        <div className="listing-price">€{Number(p.price).toLocaleString()}</div>
        <h3 className="listing-title">{p.title}</h3>
        <div className="listing-location">📍 {p.city || p.address || 'Malta'}</div>

        {/* Features row */}
        <div className="listing-features">
          {p.bedrooms ? <span>🛏 {p.bedrooms} bed</span> : null}
          {p.bathrooms ? <span>🚿 {p.bathrooms} bath</span> : null}
          {p.squareMeters ? <span>📐 {p.squareMeters} m²</span> : null}
          <span style={{ textTransform: 'capitalize' }}>🏷 {p.propertyType}</span>
        </div>

        {p.description && (
          <p className="listing-desc">{p.description.slice(0, 100)}{p.description.length > 100 ? '…' : ''}</p>
        )}

        {/* Agent contact */}
        {p.agent && (
          <div className="listing-agent">
            <span className="listing-agent-name">
              👔 {p.agent.user ? `${p.agent.user.firstName || ''} ${p.agent.user.lastName || ''}`.trim() : 'Agent'}
            </span>
            {(p.agent.mobile || p.agent.phone) && (
              <a href={`tel:${p.agent.mobile || p.agent.phone}`} className="listing-agent-phone">
                📞 {p.agent.mobile || p.agent.phone}
              </a>
            )}
            {p.agent.user?.email && (
              <a href={`mailto:${p.agent.user.email}`} className="listing-agent-email">
                ✉️ {p.agent.user.email}
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ListingsPage() {
  const [propertyList, setPropertyList] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 12, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    propertyType: '',
    listingType: '',
    minPrice: '',
    maxPrice: '',
    bedrooms: ''
  });

  const fetchListings = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 12 };
      if (search) params.search = search;
      if (filters.propertyType) params.propertyType = filters.propertyType;
      if (filters.listingType) params.listingType = filters.listingType;
      if (filters.minPrice) params.minPrice = filters.minPrice;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;
      if (filters.bedrooms) params.bedrooms = filters.bedrooms;

      const res = await listings.getAll(params);
      if (res.success) {
        setPropertyList(res.data.properties);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, filters]);

  useEffect(() => {
    const timer = setTimeout(() => fetchListings(1), 300);
    return () => clearTimeout(timer);
  }, [fetchListings]);

  const handleFilterChange = (e) => {
    setFilters(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const clearFilters = () => {
    setSearch('');
    setFilters({ propertyType: '', listingType: '', minPrice: '', maxPrice: '', bedrooms: '' });
  };

  return (
    <div className="listings-page">
      {/* Header */}
      <header className="listings-header">
        <div className="listings-header-inner">
          <div className="listings-logo">
            <span className="listings-logo-icon">🏖️</span>
            <div>
              <div className="listings-logo-title">Malta Real Estate</div>
              <div className="listings-logo-sub">Property Listings</div>
            </div>
          </div>
          <Link to="/login" className="listings-login-link">Agent Login →</Link>
        </div>
      </header>

      {/* Hero */}
      <div className="listings-hero">
        <h1>Find Your Perfect Property in Malta</h1>
        <p>Browse available properties for sale and rent across the Maltese islands</p>
        <div className="listings-search-bar">
          <input
            type="search"
            className="listings-search-input"
            placeholder="🔍  Search by title, address, city…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="listings-body">
        {/* Filters sidebar */}
        <aside className="listings-filters">
          <div className="filter-header">
            <h3>Filters</h3>
            <button className="filter-clear" onClick={clearFilters}>Clear all</button>
          </div>

          <div className="filter-group">
            <label>Listing Type</label>
            <select name="listingType" className="filter-select" value={filters.listingType} onChange={handleFilterChange}>
              <option value="">All</option>
              <option value="sale">For Sale</option>
              <option value="rent">For Rent</option>
              <option value="lease">For Lease</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Property Type</label>
            <select name="propertyType" className="filter-select" value={filters.propertyType} onChange={handleFilterChange}>
              <option value="">All Types</option>
              {PROPERTY_TYPES.map(t => (
                <option key={t} value={t} style={{ textTransform: 'capitalize' }}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Min Price (€)</label>
            <input name="minPrice" type="number" className="filter-input" placeholder="e.g. 100000" value={filters.minPrice} onChange={handleFilterChange} />
          </div>

          <div className="filter-group">
            <label>Max Price (€)</label>
            <input name="maxPrice" type="number" className="filter-input" placeholder="e.g. 500000" value={filters.maxPrice} onChange={handleFilterChange} />
          </div>

          <div className="filter-group">
            <label>Bedrooms</label>
            <select name="bedrooms" className="filter-select" value={filters.bedrooms} onChange={handleFilterChange}>
              <option value="">Any</option>
              {[1, 2, 3, 4, 5].map(n => (
                <option key={n} value={n}>{n}+</option>
              ))}
            </select>
          </div>
        </aside>

        {/* Results */}
        <main className="listings-results">
          <div className="listings-results-header">
            <span className="listings-count">
              {loading ? 'Loading…' : `${pagination.total} ${pagination.total === 1 ? 'property' : 'properties'} found`}
            </span>
          </div>

          {loading ? (
            <div className="listings-spinner" />
          ) : propertyList.length === 0 ? (
            <div className="listings-empty">
              <div className="listings-empty-icon">🏠</div>
              <h3>No properties found</h3>
              <p>Try adjusting your filters or search terms.</p>
              <button className="listings-btn-outline" onClick={clearFilters}>Clear filters</button>
            </div>
          ) : (
            <div className="listings-grid">
              {propertyList.map(p => (
                <ListingCard key={p.id} p={p} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="listings-pagination">
              {pagination.page > 1 && (
                <button className="listings-page-btn" onClick={() => fetchListings(pagination.page - 1)}>← Prev</button>
              )}
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(pg => (
                <button
                  key={pg}
                  className={`listings-page-btn${pg === pagination.page ? ' active' : ''}`}
                  onClick={() => fetchListings(pg)}
                >
                  {pg}
                </button>
              ))}
              {pagination.page < pagination.totalPages && (
                <button className="listings-page-btn" onClick={() => fetchListings(pagination.page + 1)}>Next →</button>
              )}
            </div>
          )}
        </main>
      </div>

      <footer className="listings-footer">
        <p>© {new Date().getFullYear()} Malta Real Estate · <Link to="/login">Agent Login</Link></p>
      </footer>
    </div>
  );
}

export default ListingsPage;
