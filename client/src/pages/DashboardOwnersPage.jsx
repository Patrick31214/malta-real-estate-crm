import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { owners } from '../services/api';

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

function DashboardOwnersPage() {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    owners.getAll({ limit: 200 }).then(res => {
      if (res?.success) {
        setData(res.data.owners || res.data.items || []);
        setTotal(res.data.pagination?.total || 0);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading…</div>;

  const withCompany = data.filter(o => o.company).length;
  const withProperties = data.filter(o => (o.propertyCount || o._count?.properties || 0) > 0).length;

  const topOwners = [...data]
    .sort((a, b) => (b.propertyCount || b._count?.properties || 0) - (a.propertyCount || a._count?.properties || 0))
    .slice(0, 10)
    .map(o => ({
      name: `${o.firstName || ''} ${o.lastName || ''}`.trim() || o.email || 'Owner',
      properties: o.propertyCount || o._count?.properties || 0,
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
          <Users size={24} /> Owners Overview
        </h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 24 }}>
        <StatBox label="Total Owners" value={total} color="#8A5A32" />
        <StatBox label="With Company" value={withCompany} color="#D4AF37" />
        <StatBox label="With Properties" value={withProperties} color="#B8864E" />
      </div>

      {topOwners.length > 0 && (
        <div style={cardStyle}>
          <h3 style={{ margin: '0 0 16px', color: 'var(--text-primary)', fontSize: 16 }}>Top Owners by Property Count</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={topOwners} margin={{ top: 4, right: 8, bottom: 40, left: -16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} angle={-30} textAnchor="end" interval={0} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="properties" name="Properties" radius={[4, 4, 0, 0]}>
                {topOwners.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div style={cardStyle}>
        <h3 style={{ margin: '0 0 16px', color: 'var(--text-primary)', fontSize: 16 }}>All Owners</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                {['Name', 'Company', 'City', 'Properties'].map(h => (
                  <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...data]
                .sort((a, b) => (b.propertyCount || b._count?.properties || 0) - (a.propertyCount || a._count?.properties || 0))
                .map(owner => (
                  <tr key={owner.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text-primary)', fontWeight: 600 }}>
                      {`${owner.firstName || ''} ${owner.lastName || ''}`.trim() || '—'}
                    </td>
                    <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>{owner.company || '—'}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>{owner.city || '—'}</td>
                    <td style={{ padding: '10px 12px', color: '#B8864E', fontWeight: 600 }}>
                      {owner.propertyCount || owner._count?.properties || 0}
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

export default DashboardOwnersPage;
