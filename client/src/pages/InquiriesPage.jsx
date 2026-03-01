import { useState, useEffect, useCallback } from 'react';
import { inquiries } from '../services/api';
import InquiryModal from '../components/InquiryModal';
import './InquiriesPage.css';

const STATUSES = ['new', 'assigned', 'in_progress', 'viewing_scheduled', 'matched', 'resolved', 'cancelled', 'on_hold'];
const PRIORITIES = ['low', 'medium', 'high', 'urgent'];
const SOURCES = ['website', 'phone', 'walk_in', 'email', 'referral', 'chatbot', 'whatsapp'];

const PRIORITY_ICON = { low: '🟢', medium: '🟡', high: '🟠', urgent: '🔴' };
const STATUS_ICON = {
  new: '🔴', assigned: '🟠', in_progress: '🟡',
  viewing_scheduled: '🔵', matched: '🟢', resolved: '✅',
  cancelled: '❌', on_hold: '⏸️'
};
const SOURCE_ICON = {
  website: '🌐', phone: '📞', walk_in: '🚶', email: '📧',
  referral: '🤝', chatbot: '🤖', whatsapp: '💬'
};

function InquiriesPage() {
  const [inquiryList, setInquiryList] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ status: '', priority: '', source: '' });
  const [modalOpen, setModalOpen] = useState(false);
  const [editInquiry, setEditInquiry] = useState(null);
  const [toast, setToast] = useState(null);

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

  return (
    <div className="inquiries-page">
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
          <select className="form-input filter-select" value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})}>
            <option value="">All Statuses</option>
            {STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
          </select>
          <select className="form-input filter-select" value={filters.priority} onChange={e => setFilters({...filters, priority: e.target.value})}>
            <option value="">All Priorities</option>
            {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <select className="form-input filter-select" value={filters.source} onChange={e => setFilters({...filters, source: e.target.value})}>
            <option value="">All Sources</option>
            {SOURCES.map(s => <option key={s} value={s}>{SOURCE_ICON[s]} {s.replace(/_/g, ' ')}</option>)}
          </select>
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
            <h3>No inquiries yet</h3>
            <p>Inquiries from clients will appear here.</p>
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
                  <th>Property</th>
                  <th>Type</th>
                  <th>Source</th>
                  <th>Priority</th>
                  <th>Status</th>
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
                      <span className="inq-source-chip">
                        {SOURCE_ICON[inq.source] || '🌐'} {(inq.source || 'website').replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge-priority-${inq.priority}`}>
                        {PRIORITY_ICON[inq.priority]} {inq.priority}
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge-inq-${inq.status}`}>
                        {STATUS_ICON[inq.status]} {(inq.status || '').replace(/_/g, ' ')}
                      </span>
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
