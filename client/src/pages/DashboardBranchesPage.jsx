import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { GitBranch } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell,
} from 'recharts';
import { branches } from '../services/api';

const COLORS = ['#8A5A32', '#B8864E', '#D4AF37', '#c0392b', '#2980b9', '#8e44ad'];

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

function DashboardBranchesPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    branches.getAll().then(res => {
      if (res?.success) {
        const list = res.data?.branches || res.data || [];
        setData(Array.isArray(list) ? list : []);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading…</div>;

  const active = data.filter(b => b.status === 'active' || !b.status).length;

  const chartData = data.slice(0, 10).map(b => ({
    name: b.name || b.city || 'Branch',
    agents: b.agentCount || b._count?.agents || 0,
    properties: b.propertyCount || b._count?.properties || 0,
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
          <GitBranch size={24} /> Branches Overview
        </h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 24 }}>
        <StatBox label="Total Branches" value={data.length} color="#8A5A32" />
        <StatBox label="Active" value={active} color="#B8864E" />
      </div>

      {chartData.length > 0 && (
        <div style={cardStyle}>
          <h3 style={{ margin: '0 0 16px', color: 'var(--text-primary)', fontSize: 16 }}>Agents &amp; Properties per Branch</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData} margin={{ top: 4, right: 8, bottom: 40, left: -16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} angle={-30} textAnchor="end" interval={0} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="agents" name="Agents" fill="#8A5A32" radius={[4, 4, 0, 0]} stackId="a" />
              <Bar dataKey="properties" name="Properties" fill="#D4AF37" radius={[4, 4, 0, 0]} stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div style={cardStyle}>
        <h3 style={{ margin: '0 0 16px', color: 'var(--text-primary)', fontSize: 16 }}>All Branches</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                {['Name', 'City', 'Manager', 'Agents', 'Status'].map(h => (
                  <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map(branch => (
                <tr key={branch.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '10px 12px', color: 'var(--text-primary)', fontWeight: 600 }}>{branch.name || '—'}</td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>{branch.city || '—'}</td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>
                    {branch.manager
                      ? `${branch.manager.firstName || ''} ${branch.manager.lastName || ''}`.trim() || branch.manager.email || '—'
                      : '—'}
                  </td>
                  <td style={{ padding: '10px 12px', color: '#B8864E', fontWeight: 600 }}>
                    {branch.agentCount || branch._count?.agents || 0}
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{
                      padding: '2px 8px', borderRadius: 99, fontSize: 11, fontWeight: 600,
                      background: branch.status === 'inactive' ? '#88888822' : '#B8864E22',
                      color: branch.status === 'inactive' ? '#888' : '#B8864E',
                    }}>
                      {branch.status || 'active'}
                    </span>
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

export default DashboardBranchesPage;
