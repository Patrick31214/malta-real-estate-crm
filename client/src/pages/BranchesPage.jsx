import { useState, useEffect, useCallback } from 'react';
import { branches, auth } from '../services/api';
import './BranchesPage.css';

const EMPTY_FORM = { name: '', city: '', country: '', address: '', phone: '', email: '', status: 'active' };

function BranchesPage() {
  const [branchList, setBranchList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editBranch, setEditBranch] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const user = auth.getUser();
  const isAdmin = user && (user.role === 'admin' || user.role === 'manager');

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchBranches = useCallback(async () => {
    setLoading(true);
    setFetchError('');
    try {
      const res = await branches.getAll();
      if (res.success) {
        setBranchList(res.data.branches ?? res.data ?? []);
      } else {
        setFetchError(res.message || 'Failed to load branches. Please try again.');
        setBranchList([]);
      }
    } catch (err) {
      console.error(err);
      setFetchError('Unable to connect to the server. Please check your connection and try again.');
      setBranchList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  const openCreate = () => {
    setEditBranch(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (branch) => {
    setEditBranch(branch);
    setForm({
      name: branch.name || '',
      city: branch.city || '',
      country: branch.country || '',
      address: branch.address || '',
      phone: branch.phone || '',
      email: branch.email || '',
      status: branch.status || 'active',
    });
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this branch?')) return;
    const res = await branches.delete(id);
    if (res.success) {
      showToast('Branch deleted.');
      fetchBranches();
    } else {
      showToast(res.message || 'Failed to delete branch.', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = editBranch
        ? await branches.update(editBranch.id, form)
        : await branches.create(form);
      if (res.success) {
        showToast(editBranch ? 'Branch updated.' : 'Branch created.');
        setModalOpen(false);
        fetchBranches();
      } else {
        showToast(res.message || 'Failed to save branch.', 'error');
      }
    } catch (err) {
      showToast('An error occurred.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const getManagerName = (branch) => {
    if (branch.manager) {
      const { firstName, lastName, email } = branch.manager;
      return `${firstName || ''} ${lastName || ''}`.trim() || email || '—';
    }
    return '—';
  };

  return (
    <div className="branches-page">
      {/* Header */}
      <div className="page-toolbar">
        <h1 className="page-title">Branches</h1>
        {isAdmin && (
          <button className="btn btn-primary" onClick={openCreate}>
            + Add Branch
          </button>
        )}
      </div>

      {/* Cards */}
      {loading ? (
        <div className="spinner" />
      ) : fetchError ? (
        <div className="empty-state">
          <div className="empty-icon">⚠️</div>
          <h3>Could not load branches</h3>
          <p style={{ color: 'var(--danger, #e53e3e)' }}>{fetchError}</p>
          <button className="btn btn-outline" onClick={fetchBranches} style={{ marginTop: 16 }}>
            🔄 Try Again
          </button>
        </div>
      ) : branchList.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🏢</div>
          <h3>No branches yet</h3>
          <p>Add your first branch office to manage locations.</p>
          {isAdmin && (
            <button className="btn btn-primary" onClick={openCreate} style={{ marginTop: 16 }}>
              + Add Branch
            </button>
          )}
        </div>
      ) : (
        <div className="branches-grid">
          {branchList.map(branch => (
            <div className="branch-card" key={branch.id}>
              <div className="branch-card-header">
                <div className="branch-avatar">
                  {(branch.name || '?')[0].toUpperCase()}
                </div>
                <div className="branch-title-block">
                  <h3 className="branch-name">{branch.name}</h3>
                  <span className="branch-location">{[branch.city, branch.country].filter(Boolean).join(', ') || '—'}</span>
                </div>
                <span className={`badge ${branch.status === 'active' ? 'badge-available' : 'badge-withdrawn'}`}>
                  {branch.status === 'active' ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="branch-card-body">
                {branch.address && (
                  <div className="branch-detail">
                    <span className="branch-detail-label">Address</span>
                    <span className="branch-detail-value">{branch.address}</span>
                  </div>
                )}
                <div className="branch-detail">
                  <span className="branch-detail-label">Manager</span>
                  <span className="branch-detail-value">{getManagerName(branch)}</span>
                </div>
                <div className="branch-detail">
                  <span className="branch-detail-label">Agents</span>
                  <span className="branch-detail-value">{branch.agentCount ?? branch._count?.agents ?? '—'}</span>
                </div>
                {branch.phone && (
                  <div className="branch-detail">
                    <span className="branch-detail-label">Phone</span>
                    <span className="branch-detail-value">{branch.phone}</span>
                  </div>
                )}
                {branch.email && (
                  <div className="branch-detail">
                    <span className="branch-detail-label">Email</span>
                    <span className="branch-detail-value">{branch.email}</span>
                  </div>
                )}
              </div>

              {isAdmin && (
                <div className="branch-card-footer">
                  <button className="btn btn-outline btn-sm" onClick={() => openEdit(branch)}>Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(branch.id)}>Delete</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editBranch ? 'Edit Branch' : 'Add Branch'}</h2>
              <button className="modal-close" onClick={() => setModalOpen(false)}>✕</button>
            </div>
            <form className="modal-body" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Name *</label>
                  <input className="form-input" name="name" value={form.name} onChange={handleChange} required placeholder="Branch name" />
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-input" name="status" value={form.status} onChange={handleChange}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input className="form-input" name="city" value={form.city} onChange={handleChange} placeholder="City" />
                </div>
                <div className="form-group">
                  <label className="form-label">Country</label>
                  <input className="form-input" name="country" value={form.country} onChange={handleChange} placeholder="Country" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Address</label>
                <input className="form-input" name="address" value={form.address} onChange={handleChange} placeholder="Street address" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input className="form-input" name="phone" value={form.phone} onChange={handleChange} placeholder="+356 XXXX XXXX" />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input className="form-input" type="email" name="email" value={form.email} onChange={handleChange} placeholder="branch@example.com" />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving…' : editBranch ? 'Save Changes' : 'Create Branch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
    </div>
  );
}

export default BranchesPage;
