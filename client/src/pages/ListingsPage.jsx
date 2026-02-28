import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { listings } from '../services/api';
import './ListingsPage.css';

const PROPERTY_TYPES = [
  'apartment', 'house', 'villa', 'townhouse', 'penthouse',
  'maisonette', 'farmhouse', 'commercial', 'office', 'land', 'garage', 'other'
];

// Malta demand areas data (for the demand map info section)
const DEMAND_AREAS = [
  { area: 'Sliema', demand: 'Very High', priceRange: '€3,500 – €6,000 /m²', icon: '🔴' },
  { area: "St. Julian's", demand: 'Very High', priceRange: '€3,200 – €5,800 /m²', icon: '🔴' },
  { area: 'Valletta', demand: 'High', priceRange: '€2,800 – €5,000 /m²', icon: '🟠' },
  { area: 'Msida', demand: 'High', priceRange: '€2,200 – €3,800 /m²', icon: '🟠' },
  { area: 'Swieqi', demand: 'High', priceRange: '€2,500 – €4,200 /m²', icon: '🟠' },
  { area: 'Naxxar', demand: 'Medium', priceRange: '€1,800 – €3,200 /m²', icon: '🟡' },
  { area: 'Mosta', demand: 'Medium', priceRange: '€1,600 – €2,800 /m²', icon: '🟡' },
  { area: 'Rabat', demand: 'Medium', priceRange: '€1,500 – €2,600 /m²', icon: '🟡' },
  { area: 'Marsaskala', demand: 'Low', priceRange: '€1,200 – €2,200 /m²', icon: '🟢' },
  { area: 'Marsaxlokk', demand: 'Low', priceRange: '€1,000 – €1,900 /m²', icon: '🟢' },
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

function DemandSection() {
  const [activeFilter, setActiveFilter] = useState('All');
  const filters = ['All', 'Very High', 'High', 'Medium', 'Low'];
  const filtered = activeFilter === 'All'
    ? DEMAND_AREAS
    : DEMAND_AREAS.filter(a => a.demand === activeFilter);

  return (
    <section className="demand-section">
      <div className="demand-header">
        <h2>Malta Property Demand Map</h2>
        <p>See which areas have the highest demand and expected price ranges per m²</p>
        <div className="demand-filters">
          {filters.map(f => (
            <button
              key={f}
              className={`demand-filter-btn${activeFilter === f ? ' active' : ''}`}
              onClick={() => setActiveFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="demand-legend">
        <span>🔴 Very High Demand</span>
        <span>🟠 High Demand</span>
        <span>🟡 Medium Demand</span>
        <span>🟢 Low Demand (Best Value)</span>
      </div>

      <div className="demand-grid">
        {filtered.map(area => (
          <div key={area.area} className={`demand-card demand-${area.demand.toLowerCase().replace(' ', '-')}`}>
            <div className="demand-card-icon">{area.icon}</div>
            <div className="demand-card-info">
              <div className="demand-area-name">{area.area}</div>
              <div className="demand-level">{area.demand} Demand</div>
              <div className="demand-price">{area.priceRange}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="demand-note">
        <div className="demand-note-icon">💡</div>
        <div>
          <strong>Investment Insight:</strong> High-demand areas offer strong rental yields and capital appreciation.
          Low-demand areas provide more affordable entry points with growth potential.
        </div>
      </div>
    </section>
  );
}

function ListingsPage() {
  const [propertyList, setPropertyList] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 12, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('listings'); // 'listings' | 'demand'
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
            <span className="listings-logo-icon">🗝️</span>
            <div>
              <div className="listings-logo-title">Golden Key Realty</div>
              <div className="listings-logo-sub">Malta's Premium Property Portal</div>
            </div>
          </div>
          <Link to="/login" className="listings-login-link">Agent Login →</Link>
        </div>
      </header>

      {/* Hero */}
      <div className="listings-hero">
        <h1>Find Your Perfect Property in Malta</h1>
        <p>Browse premium properties for sale and rent across the Maltese islands</p>
        <div className="listings-search-bar">
          <input
            type="search"
            className="listings-search-input"
            placeholder="🔍  Search by title, address, city…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        {/* Tab nav */}
        <div className="listings-tabs">
          <button
            className={`listings-tab${activeTab === 'listings' ? ' active' : ''}`}
            onClick={() => setActiveTab('listings')}
          >
            🏠 Properties
          </button>
          <button
            className={`listings-tab${activeTab === 'demand' ? ' active' : ''}`}
            onClick={() => setActiveTab('demand')}
          >
            📊 Demand Map
          </button>
        </div>
      </div>

      {activeTab === 'demand' ? (
        <div className="listings-body listings-body-full">
          <DemandSection />
        </div>
      ) : (
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

            <div className="filter-cta">
              <button className="btn btn-primary w-full" onClick={() => fetchListings(1)}>
                Search Properties
              </button>
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
      )}

      <footer className="listings-footer">
        <p>© {new Date().getFullYear()} Golden Key Realty Malta · <Link to="/login">Agent Login</Link></p>
      </footer>
    </div>
  );
}

export default ListingsPage;
