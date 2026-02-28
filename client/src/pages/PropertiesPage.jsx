import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { properties, auth } from '../services/api';
import PropertyModal from '../components/PropertyModal';
import './PropertiesPage.css';

const PROPERTY_TYPES = ['apartment', 'house', 'villa', 'townhouse', 'penthouse', 'maisonette', 'farmhouse', 'commercial', 'office', 'land', 'garage', 'other'];
const STATUSES = ['available', 'under_offer', 'sold', 'rented', 'withdrawn', 'draft', 'off_market'];

function PropertiesPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [propertyList, setPropertyList] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    status: searchParams.get('status') || '',
    propertyType: '',
    listingType: ''
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [editProperty, setEditProperty] = useState(null);
  const [toast, setToast] = useState(null);

  const user = auth.getUser();
  const isAdmin = user && (user.role === 'admin' || user.role === 'manager');

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchProperties = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (search) params.search = search;
      if (filters.status) params.status = filters.status;
      if (filters.propertyType) params.propertyType = filters.propertyType;
      if (filters.listingType) params.listingType = filters.listingType;

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
  }, [search, filters]);

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

  const handleApprove = async (id, status) => {
    const res = await properties.approve(id, status);
    if (res.success) {
      showToast(`Property ${status}.`);
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

  const handleStatusChange = async (id, newStatus) => {
    const res = await properties.update(id, { status: newStatus });
    if (res.success) {
      setPropertyList(list => list.map(p => p.id === id ? { ...p, status: newStatus } : p));
    } else {
      showToast('Failed to update status.', 'error');
    }
  };

  return (
    <div className="properties-page">
      {/* Toolbar */}
      <div className="page-toolbar">
        <div className="toolbar-left">
          <input
            type="search"
            className="form-input search-input"
            placeholder="🔍  Search by title, address, city…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select className="form-input filter-select" value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})}>
            <option value="">All Statuses</option>
            {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
          </select>
          <select className="form-input filter-select" value={filters.propertyType} onChange={e => setFilters({...filters, propertyType: e.target.value})}>
            <option value="">All Types</option>
            {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select className="form-input filter-select" value={filters.listingType} onChange={e => setFilters({...filters, listingType: e.target.value})}>
            <option value="">For Sale & Rent</option>
            <option value="sale">For Sale</option>
            <option value="rent">For Rent</option>
            <option value="lease">Lease</option>
          </select>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditProperty(null); setModalOpen(true); }}>
          + Add Property
        </button>
      </div>

      {/* Count */}
      <div className="result-count">
        {pagination.total} {pagination.total === 1 ? 'property' : 'properties'} found
      </div>

      {/* Table */}
      <div className="card table-card">
        {loading ? (
          <div className="spinner" />
        ) : propertyList.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🏠</div>
            <h3>No properties found</h3>
            <p>Add your first property to get started.</p>
            <button className="btn btn-primary" onClick={() => setModalOpen(true)} style={{marginTop:16}}>
              + Add Property
            </button>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{width:60}}></th>
                  <th>Property</th>
                  <th>Type</th>
                  <th>Listing</th>
                  <th>Price</th>
                  <th>Beds/Baths</th>
                  <th>Status</th>
                  <th>Approval</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {propertyList.map(p => (
                  <tr key={p.id}>
                    <td style={{padding:'8px 8px'}}>
                      {p.images && p.images[0] ? (
                        <img
                          src={p.images[0]}
                          alt={p.title}
                          style={{width:60,height:60,objectFit:'cover',borderRadius:8,display:'block',cursor:'pointer'}}
                          onClick={() => navigate(`/properties/${p.id}`)}
                        />
                      ) : (
                        <div style={{width:60,height:60,borderRadius:8,background:'var(--bg-tertiary)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22}}>🏠</div>
                      )}
                    </td>
                    <td>
                      <div
                        className="prop-title prop-title-link"
                        onClick={() => navigate(`/properties/${p.id}`)}
                        style={{cursor:'pointer'}}
                      >
                        {p.title}
                      </div>
                      <div className="prop-location">📍 {p.address}, {p.city}</div>
                    </td>
                    <td style={{textTransform:'capitalize'}}>{p.propertyType}</td>
                    <td><span className={`badge badge-${p.listingType}`}>{p.listingType}</span></td>
                    <td className="prop-price">€{Number(p.price).toLocaleString()}</td>
                    <td>
                      {p.bedrooms != null ? `🛏 ${p.bedrooms}` : '—'}
                      {p.bathrooms != null ? ` 🚿 ${p.bathrooms}` : ''}
                    </td>
                    <td>
                      <select
                        className="status-quick-select"
                        value={p.status}
                        onChange={e => handleStatusChange(p.id, e.target.value)}
                      >
                        {STATUSES.map(s => (
                          <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <span className={`badge badge-${p.approvalStatus || 'pending'}`}>
                        {p.approvalStatus || 'pending'}
                      </span>
                    </td>
                    <td>
                      <div className="action-btns">
                        <button className="btn btn-outline btn-sm" onClick={() => { setEditProperty(p); setModalOpen(true); }}>Edit</button>
                        {isAdmin && p.approvalStatus !== 'approved' && (
                          <button className="btn btn-sm btn-accent" onClick={() => handleApprove(p.id, 'approved')} title="Approve listing">✓ Approve</button>
                        )}
                        {isAdmin && p.approvalStatus !== 'rejected' && (
                          <button className="btn btn-sm btn-danger" style={{fontSize:'11px'}} onClick={() => handleApprove(p.id, 'rejected')} title="Reject listing">✗ Reject</button>
                        )}
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id)}>Del</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

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
