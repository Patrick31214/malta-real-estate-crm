import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { agents, activityLogs } from '../services/api';
import './AgentActivityPage.css';

const CATEGORIES = [
  {
    key: 'ownerContacts',
    icon: '👤',
    label: 'Owner Contacts Viewed',
    actions: ['VIEW_OWNER_DETAILS', 'VIEW_OWNER_PHONE', 'VIEW_OWNER_NAME'],
  },
  {
    key: 'propertiesViewed',
    icon: '🏠',
    label: 'Properties Viewed',
    actions: ['VIEW_PROPERTY'],
  },
  {
    key: 'propertiesCreated',
    icon: '📝',
    label: 'Properties Created',
    actions: ['CREATE_PROPERTY'],
  },
  {
    key: 'propertiesEdited',
    icon: '✏️',
    label: 'Properties Edited',
    actions: ['UPDATE_PROPERTY'],
  },
  {
    key: 'inquiries',
    icon: '📋',
    label: 'Inquiries Handled',
    actions: ['VIEW_INQUIRY', 'ASSIGN_INQUIRY'],
  },
  {
    key: 'loginHistory',
    icon: '🔑',
    label: 'Login History',
    actions: ['LOGIN', 'LOGOUT'],
  },
  {
    key: 'documents',
    icon: '📄',
    label: 'Documents Accessed',
    actions: ['VIEW_DOCUMENT'],
  },
  {
    key: 'services',
    icon: '🚤',
    label: 'Services Managed',
    actions: ['CREATE_SERVICE', 'UPDATE_SERVICE'],
  },
];

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleString('en-MT', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function CollapsibleSection({ category, logs }) {
  const [open, setOpen] = useState(false);
  const sorted = [...logs].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <div className="activity-section">
      <button
        className={`activity-section-header${open ? ' open' : ''}`}
        onClick={() => setOpen(v => !v)}
      >
        <span className="section-icon">{category.icon}</span>
        <span className="section-label">{category.label}</span>
        <span className="section-count">{logs.length}</span>
        <span className="section-chevron">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="activity-section-body">
          {sorted.length === 0 ? (
            <div className="section-empty">No activity in this category</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Action</th>
                  <th>Resource</th>
                  <th>IP Address</th>
                  <th>Date & Time</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map(log => (
                  <tr key={log.id}>
                    <td>
                      <span className="log-action">{log.action}</span>
                    </td>
                    <td>
                      <div className="log-resource">
                        {log.resourceLabel && (
                          <span className="log-resource-label">{log.resourceLabel}</span>
                        )}
                        {log.resourceType && (
                          <span className="log-resource-type">{log.resourceType}</span>
                        )}
                        {!log.resourceLabel && !log.resourceType && '—'}
                      </div>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: 12 }}>
                      {log.ipAddress || '—'}
                    </td>
                    <td style={{ whiteSpace: 'nowrap', fontSize: 13 }}>
                      {formatDate(log.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

function AgentActivityPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [agent, setAgent] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = { agentUserId: id, limit: 1000 };
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;

      const [agentRes, logsRes] = await Promise.all([
        agents.getOne(id),
        activityLogs.getAll(params),
      ]);

      if (agentRes.success) {
        setAgent(agentRes.data.agent || agentRes.data);
      }
      if (logsRes.success) {
        setLogs(logsRes.data.logs || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id, dateFrom, dateTo]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const categorized = CATEGORIES.map(cat => ({
    ...cat,
    logs: logs.filter(log => cat.actions.includes(log.action)),
  }));

  const agentName = agent
    ? `${agent.firstName || ''} ${agent.lastName || ''}`.trim() || agent.email
    : '—';

  return (
    <div className="agent-activity-page">
      <div className="agent-activity-header">
        <button className="btn btn-outline btn-sm back-btn" onClick={() => navigate('/activity-log')}>
          ← Back to Activity Log
        </button>
        <div className="agent-activity-title">
          {agent && (
            <div className="agent-activity-avatar">
              {(agent.firstName || agent.email || '?')[0].toUpperCase()}
            </div>
          )}
          <div>
            <h2>{agentName}</h2>
            {agent && <p className="agent-activity-email">{agent.email}</p>}
          </div>
        </div>
      </div>

      {/* Date range filter */}
      <div className="card date-filter-card">
        <div className="date-filter-row">
          <div className="date-filter-field">
            <label>From</label>
            <input
              type="date"
              className="form-input"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
            />
          </div>
          <div className="date-filter-field">
            <label>To</label>
            <input
              type="date"
              className="form-input"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
            />
          </div>
          <button className="btn btn-outline btn-sm" onClick={() => { setDateFrom(''); setDateTo(''); }}>
            Clear
          </button>
        </div>
        <div className="total-activity-count">
          Total: <strong>{logs.length}</strong> activities
        </div>
      </div>

      {/* Activity sections */}
      {loading ? (
        <div className="spinner" />
      ) : (
        <div className="activity-sections">
          {categorized.map(cat => (
            <CollapsibleSection key={cat.key} category={cat} logs={cat.logs} />
          ))}
        </div>
      )}
    </div>
  );
}

export default AgentActivityPage;
