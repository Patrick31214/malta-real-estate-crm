import { useState, useEffect, useCallback } from 'react';
import { agents } from '../services/api';
import AgentModal from '../components/AgentModal';
import './AgentsPage.css';

function AgentsPage() {
  const [agentList, setAgentList] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editAgent, setEditAgent] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchAgents = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (search) params.search = search;
      const res = await agents.getAll(params);
      if (res.success) {
        setAgentList(res.data.agents);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(() => fetchAgents(1), 300);
    return () => clearTimeout(timer);
  }, [fetchAgents]);

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to remove this agent?')) return;
    const res = await agents.delete(id);
    if (res.success) {
      showToast('Agent removed.');
      fetchAgents(pagination.page);
    }
  };

  const handleSaved = () => {
    setModalOpen(false);
    setEditAgent(null);
    fetchAgents(1);
    showToast(editAgent ? 'Agent updated.' : 'Agent added.');
  };

  return (
    <div className="agents-page">
      {/* Toolbar */}
      <div className="page-toolbar">
        <div className="toolbar-left">
          <input
            type="search"
            className="form-input search-input"
            placeholder="🔍  Search by name, email, license…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button className="btn btn-primary" onClick={() => { setEditAgent(null); setModalOpen(true); }}>
          + Add Agent
        </button>
      </div>

      <div className="result-count">
        {pagination.total} {pagination.total === 1 ? 'agent' : 'agents'} found
      </div>

      {/* Table */}
      <div className="card table-card">
        {loading ? (
          <div className="spinner" />
        ) : agentList.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👔</div>
            <h3>No agents yet</h3>
            <p>Add your first real estate agent to assign them to properties.</p>
            <button className="btn btn-primary" onClick={() => setModalOpen(true)} style={{ marginTop: 16 }}>
              + Add Agent
            </button>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Agent</th>
                  <th>Email</th>
                  <th>Phone / Mobile</th>
                  <th>License</th>
                  <th>Specialization</th>
                  <th>Commission</th>
                  <th>Exp.</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {agentList.map(a => (
                  <tr key={a.id}>
                    <td>
                      <div className="agent-name-cell">
                        <div className="agent-avatar">
                          {(a.user?.firstName || a.user?.email || '?')[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="agent-name">
                            {a.user ? `${a.user.firstName || ''} ${a.user.lastName || ''}`.trim() || '—' : '—'}
                          </div>
                          {a.languages && a.languages.length > 0 && (
                            <div className="agent-langs">{a.languages.join(', ')}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>{a.user?.email || '—'}</td>
                    <td>
                      {a.phone && <div>{a.phone}</div>}
                      {a.mobile && <div style={{ fontSize: 12, color: 'var(--text-light)' }}>{a.mobile}</div>}
                      {!a.phone && !a.mobile && '—'}
                    </td>
                    <td>{a.licenseNumber || '—'}</td>
                    <td style={{ maxWidth: 180 }}>
                      <span className="spec-cell">{a.specialization || '—'}</span>
                    </td>
                    <td>{a.commissionRate ? `${a.commissionRate}%` : '—'}</td>
                    <td>{a.yearsExperience ? `${a.yearsExperience}y` : '—'}</td>
                    <td>
                      <div className="action-btns">
                        <button className="btn btn-outline btn-sm" onClick={() => { setEditAgent(a); setModalOpen(true); }}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(a.id)}>Del</button>
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
              onClick={() => fetchAgents(pg)}
            >
              {pg}
            </button>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <AgentModal
          agent={editAgent}
          onClose={() => { setModalOpen(false); setEditAgent(null); }}
          onSaved={handleSaved}
        />
      )}

      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
    </div>
  );
}

export default AgentsPage;
