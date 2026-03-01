import { useState, useEffect, useCallback } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { inquiries } from '../services/api';
import InquiryModal from '../components/InquiryModal';
import './InquiriesPage.css';

const STATUSES = ['new', 'assigned', 'in_progress', 'viewing_scheduled', 'matched', 'resolved', 'cancelled', 'on_hold'];
const PRIORITIES = ['low', 'medium', 'high', 'urgent'];
const SOURCES = ['website', 'phone', 'walk_in', 'email', 'referral', 'chatbot', 'whatsapp'];

const TYPE_TABS = [
  { key: '', label: 'All' },
  { key: 'property', label: '🏠 Property' },
  { key: 'general', label: '💬 General' },
  { key: 'affiliate', label: '🤝 Affiliate' },
  { key: 'partnership', label: '🏢 Partnership' },
];

// Map URL paths to type filter keys
const PATH_TYPE_MAP = {
  '/inquiries/property': 'property',
  '/inquiries/general': 'general',
  '/inquiries/affiliates': 'affiliate',
  '/inquiries/partnerships': 'partnership',
};

const PRIORITY_ICON = { low: '🟢', medium: '🟡', high: '🟠', urgent: '🔴' };
const STATUS_ICON = {
  new: '🆕', assigned: '🟠', in_progress: '🟡',
  viewing_scheduled: '🔵', matched: '🟢', resolved: '✅',
  cancelled: '🔒', on_hold: '⏸️', open: '📂', closed: '🔒',
};
const SOURCE_ICON = {
  website: '🌐', phone: '📞', walk_in: '🚶', email: '📧',
  referral: '🤝', chatbot: '🤖', whatsapp: '💬',
};
const SOURCE_COLOR = {
  website: '#3b82f6', phone: '#10b981', walk_in: '#f59e0b', email: '#8b5cf6',
  referral: '#ef4444', chatbot: '#06b6d4', whatsapp: '#25d366',
};

function InquiriesPage() {
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Determine type from URL path or ?type= param
  const getTypeFromUrl = () =>
    PATH_TYPE_MAP[location.pathname] || searchParams.get('type') || '';

  const [inquiryList, setInquiryList] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    status: '', priority: '', source: '',
    type: getTypeFromUrl(),
    dateFrom: '', dateTo: '',
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [editInquiry, setEditInquiry] = useState(null);
  const [toast, setToast] = useState(null);
  const [statusDropdown, setStatusDropdown] = useState(null); // inquiry id with open dropdown

  // Sync type filter when URL path or search params change (sidebar navigation)
  useEffect(() => {
    const newType = PATH_TYPE_MAP[location.pathname] || searchParams.get('type') || '';
    setFilters(f => ({ ...f, type: newType }));
  }, [location.pathname, searchParams]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchInquiries = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (search) params.search = search;
      if (filters.status) params.status = filters.status;
      if (filters.priority) params.priority = filters.priority;
      if (filters.source) params.source = filters.source;
      if (filters.type) params.type = filters.type;
      if (filters.dateFrom) params.dateFrom = filters.dateFrom;
      if (filters.dateTo) params.dateTo = filters.dateTo;

      const res = await inquiries.getAll(params);
      if (res.success) {
        setInquiryList(res.data.inquiries);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, filters]);

  useEffect(() => {
    const timer = setTimeout(() => fetchInquiries(1), 300);
    return () => clearTimeout(timer);
  }, [fetchInquiries]);

  // Close status dropdown when clicking outside
  useEffect(() => {
    if (!statusDropdown) return;
    const close = () => setStatusDropdown(null);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [statusDropdown]);

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this inquiry?')) return;
    const res = await inquiries.delete(id);
    if (res.success) {
      showToast('Inquiry deleted.');
      fetchInquiries(pagination.page);
    }
  };

  const handleSaved = () => {
    setModalOpen(false);
    setEditInquiry(null);
    fetchInquiries(1);
    showToast(editInquiry ? 'Inquiry updated.' : 'Inquiry created.');
  };

  const handleStatusChange = async (id, newStatus) => {
    setStatusDropdown(null);
    const res = await inquiries.update(id, { status: newStatus });
    if (res.success) {
      showToast('Status updated.');
      setInquiryList(list => list.map(inq => inq.id === id ? { ...inq, status: newStatus } : inq));
    } else {
      showToast('Failed to update status.', 'error');
    }
  };

  const activeType = filters.type;

  return (
    <div className="inquiries-page">
      {/* Type Tabs */}
      <div className="inq-type-tabs">
        {TYPE_TABS.map(tab => (
          <button
            key={tab.key}
            className={`inq-type-tab${activeType === tab.key ? ' active' : ''}`}
            onClick={() => setFilters(f => ({ ...f, type: tab.key }))}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filter Toolbar */}
      <div className="page-toolbar inq-toolbar-glass">
        <div className="toolbar-left toolbar-wrap">
          <input
            type="search"
            className="form-input search-input"
            placeholder="🔍  Search by name, email, phone…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select className="form-input filter-select" value={filters.status} onChange={e => setFilters(f => ({...f, status: e.target.value}))}>
            <option value="">All Statuses</option>
            {STATUSES.map(s => <option key={s} value={s}>{STATUS_ICON[s]} {s.replace(/_/g, ' ')}</option>)}
          </select>
          <select className="form-input filter-select" value={filters.priority} onChange={e => setFilters(f => ({...f, priority: e.target.value}))}>
            <option value="">All Priorities</option>
            {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <select className="form-input filter-select" value={filters.source} onChange={e => setFilters(f => ({...f, source: e.target.value}))}>
            <option value="">All Sources</option>
            {SOURCES.map(s => <option key={s} value={s}>{SOURCE_ICON[s]} {s.replace(/_/g, ' ')}</option>)}
          </select>
          <input
            type="date"
            className="form-input filter-date"
            value={filters.dateFrom}
            onChange={e => setFilters(f => ({ ...f, dateFrom: e.target.value }))}
            title="From date"
          />
          <span className="filter-date-sep">→</span>
          <input
            type="date"
            className="form-input filter-date"
            value={filters.dateTo}
            onChange={e => setFilters(f => ({ ...f, dateTo: e.target.value }))}
            title="To date"
          />
        </div>
        <button className="btn btn-primary" onClick={() => { setEditInquiry(null); setModalOpen(true); }}>
          + Add Inquiry
        </button>
      </div>

      <div className="result-count">
        {pagination.total} {pagination.total === 1 ? 'inquiry' : 'inquiries'} found
      </div>

      {/* Table */}
      <div className="card table-card">
        {loading ? (
          <div className="spinner" />
        ) : inquiryList.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>No inquiries found</h3>
            <p>Try adjusting your filters or add a new inquiry.</p>
            <button className="btn btn-primary" onClick={() => setModalOpen(true)} style={{marginTop:16}}>
              + Add Inquiry
            </button>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Message</th>
                  <th>Property</th>
                  <th>Type</th>
                  <th>Source</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Branch / Agent</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {inquiryList.map(inq => (
                  <tr key={inq.id}>
                    <td>
                      <div className="inq-client-name">{inq.clientName}</div>
                      <div className="inq-client-email">{inq.clientEmail}</div>
                      {inq.clientPhone && (
                        <a href={`tel:${inq.clientPhone}`} className="inq-client-phone">{inq.clientPhone}</a>
                      )}
                    </td>
                    <td className="inq-message-cell">
                      {inq.message ? (
                        <span className="inq-message-preview" title={inq.message}>
                          {inq.message.length > 100 ? inq.message.slice(0, 100) + '…' : inq.message}
                        </span>
                      ) : <span className="text-muted">—</span>}
                    </td>
                    <td>
                      {inq.property ? (
                        <>
                          <div className="inq-prop-title">{inq.property.title}</div>
                          <div className="inq-prop-city">📍 {inq.property.city}</div>
                        </>
                      ) : '—'}
                    </td>
                    <td style={{textTransform:'capitalize'}}>{(inq.inquiryType || '').replace(/_/g, ' ')}</td>
                    <td>
                      <span
                        className="inq-source-chip"
                        style={{
                          background: (SOURCE_COLOR[inq.source] || '#6b7280') + '22',
                          color: SOURCE_COLOR[inq.source] || '#6b7280',
                          borderColor: (SOURCE_COLOR[inq.source] || '#6b7280') + '55',
                        }}
                      >
                        {SOURCE_ICON[inq.source] || '🌐'} {(inq.source || 'website').replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge-priority-${inq.priority}`}>
                        {PRIORITY_ICON[inq.priority]} {inq.priority}
                      </span>
                    </td>
                    <td>
                      <div className="inq-status-cell" onClick={e => e.stopPropagation()}>
                        <span className={`badge badge-inq-${inq.status}`}>
                          {STATUS_ICON[inq.status] || '❓'} {(inq.status || '').replace(/_/g, ' ')}
                        </span>
                        <div className="inq-status-change">
                          <button
                            className="btn btn-xs btn-outline"
                            title="Change status"
                            onClick={() => setStatusDropdown(statusDropdown === inq.id ? null : inq.id)}
                          >
                            ▾
                          </button>
                          {statusDropdown === inq.id && (
                            <div className="inq-status-dropdown">
                              {STATUSES.map(s => (
                                <button
                                  key={s}
                                  className={`inq-status-opt${inq.status === s ? ' current' : ''}`}
                                  onClick={() => handleStatusChange(inq.id, s)}
                                >
                                  {STATUS_ICON[s]} {s.replace(/_/g, ' ')}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      {inq.branch && <div className="inq-branch">🏢 {inq.branch.name}</div>}
                      {inq.assignedAgent && (
                        <div className="inq-agent">
                          👤 {inq.assignedAgent.firstName} {inq.assignedAgent.lastName}
                        </div>
                      )}
                      {!inq.branch && !inq.assignedAgent && <span className="text-muted">—</span>}
                    </td>
                    <td className="inq-date">{new Date(inq.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="action-btns">
                        <button className="btn btn-outline btn-sm" onClick={() => { setEditInquiry(inq); setModalOpen(true); }}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(inq.id)}>Del</button>
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
              onClick={() => fetchInquiries(pg)}
            >
              {pg}
            </button>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <InquiryModal
          inquiry={editInquiry}
          onClose={() => { setModalOpen(false); setEditInquiry(null); }}
          onSaved={handleSaved}
        />
      )}

      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
    </div>
  );
}

export default InquiriesPage;
