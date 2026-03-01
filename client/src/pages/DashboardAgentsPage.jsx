import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { UserCheck } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { agents, properties, inquiries } from '../services/api';

const COLORS = ['#8A5A32', '#B8864E', '#C4875A', '#c0392b', '#6B5040', '#7A5C3A'];

const tooltipStyle = {
  background: 'var(--bg-secondary)',
  border: '1px solid var(--glass-border)',
  borderRadius: 8,
  color: 'var(--text-primary)',
  fontSize: 12,
};

function StatBox({ label, value, color }) {
  return (
    <div style={{
      background: 'var(--glass-bg)',
      backdropFilter: 'blur(20px)',
      border: '1px solid var(--glass-border)',
      borderRadius: 'var(--radius)',
      padding: '20px 24px',
      textAlign: 'center',
      borderTop: `3px solid ${color || 'var(--emerald-primary)'}`,
    }}>
      <div style={{ fontSize: 28, fontWeight: 700, color: color || 'var(--emerald-primary)' }}>{value}</div>
      <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>{label}</div>
    </div>
  );
}

function DashboardAgentsPage() {
  const [agentList, setAgentList] = useState([]);
  const [totalProps, setTotalProps] = useState(0);
  const [totalInqs, setTotalInqs] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      agents.getAll({ limit: 100 }),
      properties.getAll({ limit: 1 }),
      inquiries.getAll({ limit: 1 }),
    ]).then(([agentsRes, propsRes, inqsRes]) => {
      if (agentsRes?.success) setAgentList(agentsRes.data.agents || agentsRes.data.items || []);
      if (propsRes?.success) setTotalProps(propsRes.data.pagination?.total || 0);
      if (inqsRes?.success) setTotalInqs(inqsRes.data.pagination?.total || 0);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading…</div>;

  const leaderboard = [...agentList]
    .sort((a, b) => (b.propertyCount || b._count?.properties || 0) - (a.propertyCount || a._count?.properties || 0))
    .slice(0, 10)
    .map(a => ({
      name: `${a.firstName || ''} ${a.lastName || ''}`.trim() || a.email || 'Agent',
      properties: a.propertyCount || a._count?.properties || 0,
      inquiries: a.inquiryCount || a._count?.inquiries || 0,
    }));

  const cardStyle = {
    background: 'var(--glass-bg)',
    backdropFilter: 'blur(20px)',
    border: '1px solid var(--glass-border)',
    borderRadius: 'var(--radius)',
    padding: 24,
    marginBottom: 24,
  };

  return (
    <div style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
        <Link to="/dashboard" style={{ color: 'var(--emerald-primary)', textDecoration: 'none', fontSize: 14 }}>
          ← Back to Dashboard
        </Link>
        <h1 style={{ margin: 0, fontSize: 24, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <UserCheck size={24} /> Agents Overview
        </h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 24 }}>
        <StatBox label="Total Agents" value={agentList.length} color="#8A5A32" />
        <StatBox label="Total Properties" value={totalProps} color="#B8864E" />
        <StatBox label="Total Inquiries" value={totalInqs} color="#C4875A" />
      </div>

      {leaderboard.length > 0 && (
        <div style={cardStyle}>
          <h3 style={{ margin: '0 0 16px', color: 'var(--text-primary)', fontSize: 16 }}>Agent Leaderboard — Properties</h3>
          <ResponsiveContainer width="100%" height={Math.max(200, leaderboard.length * 36)}>
            <BarChart data={leaderboard} layout="vertical" margin={{ top: 4, right: 16, bottom: 4, left: 80 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} allowDecimals={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} width={80} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="properties" name="Properties" radius={[0, 4, 4, 0]}>
                {leaderboard.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div style={cardStyle}>
        <h3 style={{ margin: '0 0 16px', color: 'var(--text-primary)', fontSize: 16 }}>Agents Ranked by Properties</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                {['#', 'Name', 'Email', 'Properties', 'Inquiries', 'Branch'].map(h => (
                  <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...agentList]
                .sort((a, b) => (b.propertyCount || b._count?.properties || 0) - (a.propertyCount || a._count?.properties || 0))
                .map((agent, idx) => (
                  <tr key={agent.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text-muted)', fontWeight: 700 }}>{idx + 1}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text-primary)', fontWeight: 600 }}>
                      {`${agent.firstName || ''} ${agent.lastName || ''}`.trim() || '—'}
                    </td>
                    <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>{agent.email || '—'}</td>
                    <td style={{ padding: '10px 12px', color: '#B8864E', fontWeight: 600 }}>
                      {agent.propertyCount || agent._count?.properties || 0}
                    </td>
                    <td style={{ padding: '10px 12px', color: '#C4875A', fontWeight: 600 }}>
                      {agent.inquiryCount || agent._count?.inquiries || 0}
                    </td>
                    <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>
                      {agent.branch?.name || '—'}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default DashboardAgentsPage;
