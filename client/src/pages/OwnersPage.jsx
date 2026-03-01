import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { owners } from '../services/api';
import OwnerModal from '../components/OwnerModal';
import './OwnersPage.css';

function OwnersPage() {
  const navigate = useNavigate();
  const [ownerList, setOwnerList] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editOwner, setEditOwner] = useState(null);
  const [revealedContactId, setRevealedContactId] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchOwners = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (search) params.search = search;
      const res = await owners.getAll(params);
      if (res.success) {
        setOwnerList(res.data.owners);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(() => fetchOwners(1), 300);
    return () => clearTimeout(timer);
  }, [fetchOwners]);

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to remove this owner?')) return;
    const res = await owners.delete(id);
    if (res.success) {
      showToast('Owner removed.');
      fetchOwners(pagination.page);
    }
  };

  const handleSaved = () => {
    setModalOpen(false);
    setEditOwner(null);
    fetchOwners(1);
    showToast(editOwner ? 'Owner updated.' : 'Owner added.');
  };

  return (
    <div className="owners-page">
      {/* Toolbar */}
      <div className="page-toolbar">
        <div className="toolbar-left">
          <input
            type="search"
            className="form-input search-input"
            placeholder="🔍  Search by name, email, phone…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button className="btn btn-primary" onClick={() => { setEditOwner(null); setModalOpen(true); }}>
          + Add Owner
        </button>
      </div>

      <div className="result-count">
        {pagination.total} {pagination.total === 1 ? 'owner' : 'owners'} found
      </div>

      {/* Table */}
      <div className="card table-card">
        {loading ? (
          <div className="spinner" />
        ) : ownerList.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👤</div>
            <h3>No owners yet</h3>
            <p>Add your first property owner to get started.</p>
            <button className="btn btn-primary" onClick={() => setModalOpen(true)} style={{marginTop:16}}>
              + Add Owner
            </button>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Owner</th>
                  <th>City</th>
                  <th>Company</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {ownerList.map(o => (
                  <>
                  <tr key={o.id}>
                    <td>
                      <div className="owner-name-cell">
                        <div className="owner-avatar">
                          {(o.firstName || '?')[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="owner-name">{o.firstName} {o.lastName}</div>
                          {o.propertiesCount != null && <div className="owner-note">{o.propertiesCount} {o.propertiesCount === 1 ? 'property' : 'properties'}</div>}
                        </div>
                      </div>
                    </td>
                    <td>{o.city || '—'}</td>
                    <td>{o.companyName || '—'}</td>
                    <td>
                      <div className="action-btns">
                        <button
                          className="btn btn-outline btn-sm"
                          title={revealedContactId === o.id ? 'Hide contact' : 'Show contact'}
                          onClick={() => setRevealedContactId(revealedContactId === o.id ? null : o.id)}
                        >👁</button>
                        <button className="btn btn-outline btn-sm" title="Edit" onClick={() => { setEditOwner(o); setModalOpen(true); }}>✏️</button>
                        <button className="btn btn-outline btn-sm" onClick={() => navigate(`/properties?ownerId=${o.id}`)}>🏠 Properties</button>
                        <button className="btn btn-outline btn-sm" onClick={() => setViewOwner(o)}>👁 View</button>
                        <button className="btn btn-outline btn-sm" onClick={() => { setEditOwner(o); setModalOpen(true); }}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(o.id)}>Del</button>
                      </div>
                    </td>
                  </tr>
                  {revealedContactId === o.id && (
                    <tr key={`${o.id}-contact`} className="owner-contact-row">
                      <td colSpan={4}>
                        <span style={{marginRight:16}}>📞 {o.phone || '—'}</span>
                        <span>✉️ {o.email || '—'}</span>
                      </td>
                    </tr>
                  )}
                  </>
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
              onClick={() => fetchOwners(pg)}
            >
              {pg}
            </button>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {modalOpen && (
        <OwnerModal
          owner={editOwner}
          onClose={() => { setModalOpen(false); setEditOwner(null); }}
          onSaved={handleSaved}
        />
      )}

      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
    </div>
  );
}

export default OwnersPage;
