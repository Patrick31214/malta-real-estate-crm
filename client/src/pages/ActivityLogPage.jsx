import { useState, useEffect, useCallback } from 'react';
import { activityLogs } from '../services/api';
import './ActivityLogPage.css';

const ACTION_LABELS = {
  VIEW_OWNER_LIST: '👁 Viewed Owner List',
  VIEW_OWNER_DETAILS: '👤 Viewed Owner Details',
  VIEW_PROPERTY: '🏠 Viewed Property',
  VIEW_OWNER_NAME: '🔍 Viewed Owner Name',
  VIEW_OWNER_PHONE: '📞 Viewed Owner Phone'
};

function ActivityLogPage() {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 50, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [agentFilter, setAgentFilter] = useState('');

  const fetchLogs = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 50 };
      if (agentFilter) params.agentUserId = agentFilter;
      const res = await activityLogs.getAll(params);
      if (res.success) {
        setLogs(res.data.logs);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [agentFilter]);

  useEffect(() => {
    fetchLogs(1);
  }, [fetchLogs]);

  const formatDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleString('en-MT', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="activity-page">
      <div className="activity-toolbar">
        <div className="activity-toolbar-info">
          <h2>Agent Activity Log</h2>
          <p>Every action performed by agents in the CRM is recorded here.</p>
        </div>
        <button className="btn btn-outline btn-sm" onClick={() => fetchLogs(1)}>
          🔄 Refresh
        </button>
      </div>

      <div className="card table-card">
        {loading ? (
          <div className="spinner" />
        ) : logs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h3>No activity yet</h3>
            <p>Agent actions will appear here once they start using the CRM.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Agent</th>
                  <th>Action</th>
                  <th>Resource</th>
                  <th>IP Address</th>
                  <th>Date & Time</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id}>
                    <td>
                      <div className="log-agent">
                        <div className="log-agent-avatar">
                          {(log.user?.firstName || log.user?.email || '?')[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="log-agent-name">
                            {log.user ? `${log.user.firstName || ''} ${log.user.lastName || ''}`.trim() || log.user.email : '—'}
                          </div>
                          <div className="log-agent-email">{log.user?.email || ''}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="log-action">
                        {ACTION_LABELS[log.action] || log.action}
                      </span>
                    </td>
                    <td>
                      <div className="log-resource">
                        {log.resourceLabel && <span className="log-resource-label">{log.resourceLabel}</span>}
                        {log.resourceType && <span className="log-resource-type">{log.resourceType}</span>}
                      </div>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{log.ipAddress || '—'}</td>
                    <td style={{ whiteSpace: 'nowrap', fontSize: 13 }}>{formatDate(log.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {pagination.totalPages > 1 && (
        <div className="pagination">
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(pg => (
            <button
              key={pg}
              className={`page-btn${pg === pagination.page ? ' active' : ''}`}
              onClick={() => fetchLogs(pg)}
            >
              {pg}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default ActivityLogPage;
