import { useState, useEffect, useCallback } from 'react';
import { services } from '../services/api';
import ServiceModal from '../components/ServiceModal';
import './ServicesPage.css';

const CATEGORIES = ['all', 'boat_tour', 'car_rental', 'bike_rental', 'guided_tour', 'other'];

const CATEGORY_LABELS = {
  all: 'All',
  boat_tour: 'Boat Tours',
  car_rental: 'Car Rentals',
  bike_rental: 'Bike Rentals',
  guided_tour: 'Guided Tours',
  other: 'Other',
};

function ServicesPage() {
  const [serviceList, setServiceList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editService, setEditService] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (activeTab !== 'all') params.category = activeTab;
      if (search) params.search = search;
      const res = await services.getAll(params);
      if (res.success) {
        setServiceList(res.data.services || res.data || []);
      } else {
        setServiceList([]);
      }
    } catch {
      setServiceList([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab, search]);

  useEffect(() => {
    const timer = setTimeout(() => fetchServices(), 300);
    return () => clearTimeout(timer);
  }, [fetchServices]);

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this service?')) return;
    const res = await services.delete(id);
    if (res.success) {
      showToast('Service deleted.');
      fetchServices();
    } else {
      showToast(res.message || 'Failed to delete.', 'error');
    }
  };

  const handleSaved = () => {
    setModalOpen(false);
    setEditService(null);
    fetchServices();
    showToast(editService ? 'Service updated.' : 'Service created.');
  };

  return (
    <div className="services-page">
      {/* Toolbar */}
      <div className="page-toolbar">
        <div className="toolbar-left">
          <input
            type="search"
            className="form-input search-input"
            placeholder="🔍  Search services…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button className="btn btn-emerald" onClick={() => { setEditService(null); setModalOpen(true); }}>
          + Add Service
        </button>
      </div>

      {/* Category Tabs */}
      <div className="services-tabs">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            className={`tab-btn${activeTab === cat ? ' active' : ''}`}
            onClick={() => setActiveTab(cat)}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      <div className="result-count">
        {serviceList.length} {serviceList.length === 1 ? 'service' : 'services'} found
      </div>

      {/* Table */}
      <div className="card table-card">
        {loading ? (
          <div className="spinner" />
        ) : serviceList.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">⚓</div>
            <h3>No services found</h3>
            <p>Add your first service to get started.</p>
            <button className="btn btn-emerald" onClick={() => setModalOpen(true)} style={{ marginTop: 16 }}>
              + Add Service
            </button>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Duration</th>
                  <th>Location</th>
                  <th>Contact</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {serviceList.map(s => (
                  <tr key={s.id}>
                    <td>
                      <div className="service-title">{s.title}</div>
                      {s.featured && <span className="badge badge-featured">⭐ Featured</span>}
                    </td>
                    <td>
                      <span className={`badge badge-cat-${s.category}`}>
                        {(s.category || '').replace('_', ' ')}
                      </span>
                    </td>
                    <td className="service-price">
                      {s.price ? `${s.currency || 'EUR'} ${Number(s.price).toLocaleString()}` : '—'}
                    </td>
                    <td>{s.duration || '—'}</td>
                    <td>{s.location || '—'}</td>
                    <td>
                      {s.contactName && <div className="contact-name">{s.contactName}</div>}
                      {s.contactPhone && <div className="contact-detail">{s.contactPhone}</div>}
                      {s.contactEmail && <div className="contact-detail">{s.contactEmail}</div>}
                      {!s.contactName && !s.contactPhone && !s.contactEmail && '—'}
                    </td>
                    <td>
                      <span className={`badge ${s.available !== false ? 'badge-available' : 'badge-withdrawn'}`}>
                        {s.available !== false ? 'Available' : 'Unavailable'}
                      </span>
                    </td>
                    <td>
                      <div className="action-btns">
                        <button className="btn btn-outline btn-sm" onClick={() => { setEditService(s); setModalOpen(true); }}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(s.id)}>Del</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && (
        <ServiceModal
          service={editService}
          onClose={() => { setModalOpen(false); setEditService(null); }}
          onSaved={handleSaved}
        />
      )}

      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
    </div>
  );
}

export default ServicesPage;
