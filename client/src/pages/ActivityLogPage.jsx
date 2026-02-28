import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { agents, activityLogs } from '../services/api';
import './ActivityLogPage.css';

function ActivityLogPage() {
  const [agentList, setAgentList] = useState([]);
  const [activityCounts, setActivityCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [agentsRes, logsRes] = await Promise.all([
          agents.getAll({ limit: 100 }),
          activityLogs.getAll({ limit: 1000 })
        ]);
        if (agentsRes.success) {
          setAgentList(agentsRes.data.agents || []);
        }
        if (logsRes.success) {
          const logs = logsRes.data.logs || [];
          const counts = {};
          logs.forEach(log => {
            const uid = log.userId || log.user?.id;
            if (uid) counts[uid] = (counts[uid] || 0) + 1;
          });
          setActivityCounts(counts);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="activity-page">
      <div className="activity-toolbar">
        <div className="activity-toolbar-info">
          <h2>Agent Activity Log</h2>
          <p>Click on an agent to view their detailed activity history.</p>
        </div>
      </div>

      {loading ? (
        <div className="spinner" />
      ) : agentList.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">👤</div>
            <h3>No agents found</h3>
            <p>Agents will appear here once they are added to the CRM.</p>
          </div>
        </div>
      ) : (
        <div className="agent-cards-grid">
          {agentList.map(agent => (
            <div
              key={agent.id}
              className="agent-activity-card"
              onClick={() => navigate(`/agents/${agent.id}/activity`)}
            >
              <div className="agent-card-avatar">
                {(agent.firstName || agent.email || '?')[0].toUpperCase()}
              </div>
              <div className="agent-card-info">
                <div className="agent-card-name">
                  {`${agent.firstName || ''} ${agent.lastName || ''}`.trim() || agent.email}
                </div>
                <div className="agent-card-email">{agent.email}</div>
                <div className="agent-card-role">{agent.role || 'agent'}</div>
              </div>
              <div className="agent-card-count">
                <span className="activity-count-badge">
                  {activityCounts[agent.id] || 0}
                </span>
                <span className="activity-count-label">activities</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ActivityLogPage;
